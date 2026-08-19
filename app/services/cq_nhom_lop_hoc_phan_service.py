import json
from sqlalchemy.orm import Session
from app.crud import curd_cq_nhom_lop_hoc_phan
from typing import Optional, Dict, Any
from app.core.exceptions import BadRequestException, ConflictException
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse
from app.core.logger import app_logger as logger
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopBulkUpdate, CQNhomLopBulkConfirmRequest
from app.services import hoc_ky_service
from app.services import he_thong_nhom_cong_thuc_service
from app.services import he_thong_truong_hop_cong_thuc_service
from app.services import he_thong_he_so_lop_dong_service
from app.crud import crud_he_thong_dm_truong_duoc_su_dung
from app.utils.string_utils import check_id_in_string_list
from app.utils.formula_parser import parse_he_so_lop_dong, evaluate_formula_json
import time
import asyncio
from app.services import hinh_thuc_hoc_service
from app.services import hinh_thuc_day_service

CACHE_PREFIX = "cache:cq_nhom_lop_hoc_phan:"
CACHE_TTL = 3600

def is_true_like(value) -> bool:
    return str(value or "").strip().lower() in {"true", "1"}

async def invalidate_cq_nhom_lop_hoc_phan_cache(redis_client, nam_tai_chinh: Optional[int] = None):
    """
    Xóa cache nhóm lớp học phần (Gọi hàm này sau khi thêm/sửa/xóa nhóm lớp học phần)
    """
    if redis_client:
        try:
            if nam_tai_chinh:
                await redis_client.delete(f"{CACHE_PREFIX}{nam_tai_chinh}")
            else:
                keys = await redis_client.keys(f"{CACHE_PREFIX}*")
                if keys:
                    await redis_client.delete(*keys)
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Nhóm lớp): {e}")

async def get_danh_sach_nhom_lop_hoc_phan_theo_nam_tai_chinh(db: Session, redis_client, nam_tai_chinh: Optional[int] = None, trang_thai_loc: Optional[str] = None):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy.
    """
    if nam_tai_chinh is None:
        raise BadRequestException(detail="Yêu cầu không hợp lệ: Thiếu năm tài chính.")

    def filter_data(data, filter_type):
        if not filter_type:
            return data
        if filter_type == "da_xac_nhan":
            return [x for x in data if x.get("XacNhan") is True]
        if filter_type == "chua_xac_nhan":
            return [x for x in data if not x.get("XacNhan")]
        if filter_type == "da_ky":
            return [x for x in data if x.get("XacNhan") is True and (x.get("ID_LanTongHopFile") or 0) >= 1]
        if filter_type == "chua_ky":
            return [x for x in data if x.get("XacNhan") is True and (x.get("ID_LanTongHopFile") or 0) == 0]
        if filter_type == "da_thanh_toan":
            return [x for x in data if x.get("XacNhan") is True and (x.get("ID_LanTongHopFile") or 0) >= 1 and x.get("TrangThaiThanhToan")]
        if filter_type == "chua_thanh_toan":
            return [x for x in data if x.get("XacNhan") is True and (x.get("ID_LanTongHopFile") or 0) >= 1 and not x.get("TrangThaiThanhToan")]
        return data

    cache_key = f"{CACHE_PREFIX}{nam_tai_chinh}"

    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                parsed_data = json.loads(cached_data)
                return filter_data(parsed_data, trang_thai_loc)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Nhóm lớp {nam_tai_chinh}): {e}")

    columns = curd_cq_nhom_lop_hoc_phan.get_danh_sach_theo_nam_tai_chinh(db, nam_tai_chinh)
    columns_dict = [CQNhomLopResponse.model_validate(item).model_dump() for item in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Nhóm lớp {nam_tai_chinh}): {e}")
        
    return filter_data(columns_dict, trang_thai_loc)


async def bulk_update(db: Session, redis_client, payload: CQNhomLopBulkUpdate):
    """
    Cập nhật hàng loạt (Smart Diff & Dynamic Fields)
    - Xử lý toàn bộ logic tính toán (If/Else, Sĩ số, Hệ số, Công thức).
    - Chuẩn bị dữ liệu List[dict] rồi đẩy xuống CRUD.
    """
    allowed_fields = crud_he_thong_dm_truong_duoc_su_dung.get_editable_fields(db, payload.MaBang)

    logger.error(f"[DEBUG_BULK_HTHOC] allowed_fields={allowed_fields}")
    logger.error(f"[DEBUG_BULK_HTHOC] payload_items={[{'MaNhomLopHP': item.MaNhomLopHP, 'updates': item.updates} for item in payload.items]}")

    if not allowed_fields:
        raise BadRequestException(detail=f"Bảng {payload.MaBang} không có cấu hình cột nào được phép sửa.")

    final_updates = []
    ten_ht_hoc_map = None
    ten_ht_day_map = None
    # Cache bộ nhớ (RAM) tạm thời để tránh hit DB nhiều lần trong vòng lặp
    try:
        nhom_cong_thuc_list = await he_thong_nhom_cong_thuc_service.get_danh_sach(db, redis_client)
    except Exception as e:
        logger.error(f"Lỗi load Nhóm Công Thức Cache: {e}")
        nhom_cong_thuc_list = []
        
    # Preload tất cả Hệ số lớp đông
    local_he_so_ld_cache = {}
    try:
        he_so_ld_list = await he_thong_he_so_lop_dong_service.get_all(db, redis_client)
        if he_so_ld_list:
            local_he_so_ld_cache = {item['ID_HeSo_LD']: item for item in he_so_ld_list}
    except Exception as e:
        logger.error(f"Lỗi load Hệ số Lớp đông Cache: {e}")

    # Lấy toàn bộ dữ liệu gốc lên RAM bằng 1 câu truy vấn (Fix N+1 Query)
    list_ma_nhom_lop = [item.MaNhomLopHP for item in payload.items]
    db_items_list = curd_cq_nhom_lop_hoc_phan.get_by_list_ma_nhom_lop(db, list_ma_nhom_lop)
    db_items_map = {getattr(db_item, "MaNhomLopHP"): db_item for db_item in db_items_list}
    skipped_locked_count = 0
    skipped_not_found_count = 0
    invalid_update_fields = set()
    
    # Chuẩn bị danh sách ID Nhóm công thức cần lấy Trường Hợp (Loại bỏ await trong vòng lặp)
    unique_nhom_ct_ids = set()
    for item in payload.items:
        db_item = db_items_map.get(item.MaNhomLopHP)
        if not db_item:
            continue
        if is_true_like(getattr(db_item, "XacNhan", None)):
            continue
        hinh_thuc_hoc = (
            item.updates.get("MaHTHoc")
            if "MaHTHoc" in allowed_fields and "MaHTHoc" in item.updates
            else getattr(db_item, "MaHTHoc")
        )

        hinh_thuc_day = (
            item.updates.get("MaHTDay")
            if "MaHTDay" in allowed_fields and "MaHTDay" in item.updates
            else getattr(db_item, "MaHTDay")
        )
        nam_tai_chinh = int(getattr(db_item, "NamTaiChinh") or 0)
        if hinh_thuc_hoc is not None:

            for nhom_ct in nhom_cong_thuc_list:
                ds_ma = nhom_ct.get("DsMaHTHoc", "")
                tu_nam = nhom_ct.get("TuNam") or 0
                den_nam = nhom_ct.get("DenNam") or 9999
                
                if check_id_in_string_list(str(hinh_thuc_hoc), str(ds_ma)):
                    if tu_nam <= nam_tai_chinh <= den_nam:
                        unique_nhom_ct_ids.add(int(nhom_ct.get("ID_Nhom_CT")))
                        break
                    
    # Lấy đồng thời (Concurrent) tất cả Trường Hợp Công Thức cần thiết
    async def fetch_truong_hop(id_ct):
        th_list = await he_thong_truong_hop_cong_thuc_service.get_danh_sach_theo_nhom(db, redis_client, id_ct)
        return id_ct, th_list
        
    tasks = [fetch_truong_hop(id_ct) for id_ct in unique_nhom_ct_ids]
    truong_hop_results = await asyncio.gather(*tasks) if tasks else []
    local_truong_hop_cache = {res[0]: res[1] for res in truong_hop_results}

    for item in payload.items:
        # 1. Lấy dữ liệu gốc từ RAM (Map O(1))
        db_item = db_items_map.get(item.MaNhomLopHP)
        if not db_item:
            skipped_not_found_count += 1
            continue

        if is_true_like(getattr(db_item, "XacNhan", None)):
            skipped_locked_count += 1
            continue
            
        update_data: Dict[str, Any] = {"MaNhomLopHP": item.MaNhomLopHP}
        cong_thuc_used = []
        is_siso_changed = False

        logger.error(
            f"[DEBUG_BULK_HTHOC] START item={item.MaNhomLopHP}, "
            f"raw_updates={item.updates}, db_MaHTHoc={getattr(db_item, 'MaHTHoc', None)}, "
            f"db_MaHTDay={getattr(db_item, 'MaHTDay', None)}"
        )
        
        # 2. Lọc các field được phép update
        for key, value in item.updates.items():
            if key in allowed_fields and hasattr(db_item, key):
                # Kiểm tra xem giá trị có thực sự thay đổi không (So sánh string an toàn)
                original_val = getattr(db_item, key)
                is_changed = str(original_val) != str(value)
                # Xử lý trường hợp None/Null
                if (original_val is None and value is not None) or (original_val is not None and value is None):
                    is_changed = True
                    
                if is_changed:
                    update_data[key] = value
                    if key in ["SiSoChuyenDoi", "SiSoDKH"]:
                        is_siso_changed = True
            else:
                invalid_update_fields.add(key)
                logger.error(
                    f"[DEBUG_BULK_HTHOC] SKIP_FIELD item={item.MaNhomLopHP}, "
                    f"key={key}, value={value}, in_allowed={key in allowed_fields}, "
                    f"has_attr={hasattr(db_item, key)}"
                )

        logger.error(
            f"[DEBUG_BULK_HTHOC] AFTER_FILTER item={item.MaNhomLopHP}, "
            f"update_data={update_data}, has_MaHTHoc={'MaHTHoc' in update_data}"
        )
        
        # 3. Tính toán Sĩ số nếu có thay đổi
        if is_siso_changed:
            siso_cd = int(update_data.get("SiSoChuyenDoi", getattr(db_item, "SiSoChuyenDoi")) or 0)
            siso_dkh = int(update_data.get("SiSoDKH", getattr(db_item, "SiSoDKH")) or 0)
            so_sinh_vien = siso_cd + siso_dkh
            update_data["SoSinhVien"] = so_sinh_vien
        else:
            so_sinh_vien = int(getattr(db_item, "SoSinhVien") or 0)
            
        # 4. Tính toán công thức động (Formula Engine)
        hinh_thuc_hoc = update_data.get("MaHTHoc", getattr(db_item, "MaHTHoc"))
        hinh_thuc_day = update_data.get("MaHTDay", getattr(db_item, "MaHTDay"))
        if hinh_thuc_hoc is not None:
            hinh_thuc_hoc = int(hinh_thuc_hoc)

        if hinh_thuc_day is not None:
            hinh_thuc_day = int(hinh_thuc_day)

        if "MaHTHoc" in update_data and hinh_thuc_hoc is not None:
            if ten_ht_hoc_map is None:
                try:
                    hinh_thuc_hoc_list = await hinh_thuc_hoc_service.get_danh_sach(db, redis_client)
                    ten_ht_hoc_map = {
                        int(item["MaHTHoc"]): item.get("TenHTHoc")
                        for item in hinh_thuc_hoc_list
                        if item.get("MaHTHoc") is not None
                    }
                except Exception as e:
                    logger.error(f"Lỗi load Hình thức học Cache: {e}")
                    ten_ht_hoc_map = {}

            update_data["TenHTHoc"] = ten_ht_hoc_map.get(hinh_thuc_hoc)

        if "MaHTDay" in update_data and hinh_thuc_day is not None:
            if ten_ht_day_map is None:
                try:
                    hinh_thuc_day_list = await hinh_thuc_day_service.get_danh_sach(db, redis_client)
                    ten_ht_day_map = {
                        int(item["MaHTDay"]): item.get("TenHTDay")
                        for item in hinh_thuc_day_list
                        if item.get("MaHTDay") is not None
                    }
                except Exception as e:
                    logger.error(f"Lỗi load Hình thức dạy Cache: {e}")
                    ten_ht_day_map = {}

            update_data["TenHTDay"] = ten_ht_day_map.get(hinh_thuc_day)

        nam_tai_chinh = int(getattr(db_item, "NamTaiChinh") or 0)
        id_he_dao_tao = getattr(db_item, "HeSo_HeDaoTao")
        if id_he_dao_tao is not None:
            id_he_dao_tao = int(id_he_dao_tao)
        
        if hinh_thuc_hoc is not None and hinh_thuc_day is not None:
            # 4.1. Tìm Nhóm Công Thức (Duyệt trên RAM - Dict)
            id_nhom_ct = None
            for nhom_ct in nhom_cong_thuc_list:
                ds_ma = nhom_ct.get("DsMaHTHoc", "")
                tu_nam = nhom_ct.get("TuNam") or 0
                den_nam = nhom_ct.get("DenNam") or 9999
                nhom_id_he = nhom_ct.get("ID_He")
                
                # Lọc theo ID_He (ánh xạ với HeSo_HeDaoTao của lớp)
                if id_he_dao_tao is not None and nhom_id_he is not None:
                    if id_he_dao_tao != int(nhom_id_he):
                        continue
                
                if check_id_in_string_list(str(hinh_thuc_hoc), str(ds_ma)):
                    if tu_nam <= nam_tai_chinh <= den_nam:
                        id_nhom_ct = int(nhom_ct.get("ID_Nhom_CT"))
                        cong_thuc_used.append(
                            f"Nhóm CT: {nhom_ct.get('TenNhom') or nhom_ct.get('TenNhom_CT') or id_nhom_ct}"
                        )
                        break
                    
            if id_nhom_ct:
                # 4.2. Tìm Trường Hợp Công Thức (Dùng Cache RAM - Không còn await)
                th_list = local_truong_hop_cache.get(id_nhom_ct, [])
                truong_hop_ct = next((th for th in th_list if int(th.get("MaHTDay") or 0) == hinh_thuc_day), None)
                
                if truong_hop_ct:
                    # 4.3. Tính Hệ số lớp đông
                    he_so_lop_dong_val = None
                    id_hs_ld = truong_hop_ct.get("ID_HeSo_LD")
                    if id_hs_ld:
                        id_hs = int(id_hs_ld)
                        he_so_ld_config = local_he_so_ld_cache.get(id_hs)
                        if he_so_ld_config:
                            cau_hinh_json = he_so_ld_config.get("CauHinh_Json", "")
                            if cau_hinh_json:
                                cong_thuc_used.append(f"Hệ số lớp đông: {cau_hinh_json}")
                            he_so_lop_dong_val = parse_he_so_lop_dong(so_sinh_vien, str(cau_hinh_json))
                            update_data["HeSo_LopDong"] = he_so_lop_dong_val
                            
                    if he_so_lop_dong_val is None:
                        he_so_lop_dong_val = getattr(db_item, "HeSo_LopDong") or 0.0
                                                
                    # 4.4 Phân giải và Tính toán Biểu thức JSON
                    bieu_thuc_json = truong_hop_ct.get("BieuThuc_JSON")

                    if bieu_thuc_json:
                        # Tạo context_data trộn dữ liệu mới và cũ
                        context_data = {c.name: getattr(db_item, c.name) for c in db_item.__table__.columns}
                        context_data.update(update_data)
                        context_data["HeSo_LopDong"] = he_so_lop_dong_val
                        cong_thuc_used.append(f"Biểu thức quy đổi: {bieu_thuc_json}")
                        # Tính toán
                        calculated_fields = evaluate_formula_json(str(bieu_thuc_json), context_data)
                        
                        # Chỉ giữ lại các kết quả thay đổi (có cập nhật)
                        for k, v in calculated_fields.items():
                            if hasattr(db_item, k):
                                update_data[k] = v
        if cong_thuc_used:
            update_data["Cong_Thuc"] = "\n".join(str(x) for x in cong_thuc_used if x)
        logger.error(
            f"[DEBUG_BULK_HTHOC] BEFORE_APPEND item={item.MaNhomLopHP}, "
            f"len_update_data={len(update_data)}, update_data={update_data}"
        )
        if len(update_data) > 1:
            final_updates.append(update_data)
        else:
            logger.error(f"[DEBUG_BULK_HTHOC] NOT_APPENDED item={item.MaNhomLopHP}, update_data={update_data}")

    logger.error(f"[DEBUG_BULK_HTHOC] FINAL_UPDATES={final_updates}")
    
    if not final_updates:
        msg = "Không có bản ghi nào được cập nhật thực sự."
        details = []
        # if skipped_locked_count > 0:
        #     details.append(f"Đã bỏ qua {skipped_locked_count} dòng đã xác nhận.")
        if skipped_not_found_count > 0:
            details.append(f"Không tìm thấy {skipped_not_found_count} dòng.")
        if invalid_update_fields:
            details.append(f"Các trường không hợp lệ: {', '.join(invalid_update_fields)}")
            
        if details:
            msg += f" Chi tiết: {' '.join(details)}"
            
        raise ConflictException(detail=msg)

    # 5. Đẩy xuống CRUD chỉ thực hiện DB Update
    curd_cq_nhom_lop_hoc_phan.update_danh_sach(db, final_updates)
    
    await invalidate_cq_nhom_lop_hoc_phan_cache(redis_client)
            
    return {
        "message": "Cập nhật thành công.",
        "updated_rows": final_updates
    }

async def bulk_confirm_nhom_lop_hoc_phan_service(db: Session, redis_client, payload: CQNhomLopBulkConfirmRequest, nam_tai_chinh: Optional[int]):
    """
    Xác nhận hàng loạt nhóm lớp học phần.
    """
    if not payload.ma_nhom_lop_hp_list:
        raise BadRequestException(detail="Danh sách mã nhóm lớp học phần không được để trống.")
        
    try:
        updated_count = curd_cq_nhom_lop_hoc_phan.bulk_confirm_nhom_lop_hoc_phan(db, payload.ma_nhom_lop_hp_list)
    except Exception as e:
        logger.error(f"Lỗi khi xác nhận hàng loạt: {str(e)}")
        raise ConflictException(detail="Có lỗi xảy ra khi cập nhật dữ liệu vào cơ sở dữ liệu.")
        
    # Xoá cache
    await invalidate_cq_nhom_lop_hoc_phan_cache(redis_client, nam_tai_chinh)
    
    return {
        "message": "Xác nhận thành công",
        "updated_count": updated_count
    }
