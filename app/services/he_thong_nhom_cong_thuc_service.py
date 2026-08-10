import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_nhom_cong_thuc
from app.schemas.he_thong_nhom_cong_thuc import NhomCongThucResponse, NhomCongThucCreate, NhomCongThucUpdate
from app.services.hoc_ky_service import resolve_ma_hoc_ky
from app.services.hinh_thuc_hoc_service import get_danh_sach as get_hinh_thuc_hoc
from app.core.logger import app_logger as logger
import re

CACHE_PREFIX = "cache:he_thong_nhom_cong_thuc:all"
CACHE_TTL = 3600

async def invalidate_cache(redis_client):
    if redis_client:
        try:
            await redis_client.delete(CACHE_PREFIX)
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Nhóm công thức): {e}")

async def _map_danh_sach_hinh_thuc_hoc(ds_ma_hinh_thuc: str, hth_list: list) -> str:
    """Tách chuỗi ',1,12,' thành 'Lý thuyết, Bài tập' an toàn"""
    if not ds_ma_hinh_thuc:
        return ""
    
    # Tạo dict ánh xạ id -> tên để tra cứu O(1)
    # Cache trả về dict có dạng {'MaHTHoc': 1, 'TenHTHoc': 'Lý thuyết'}
    hth_map = {item.get('MaHTHoc'): item.get('TenHTHoc') for item in hth_list}
    
    # Tách chuỗi và loại bỏ phần tử rỗng an toàn
    list_ids = [int(x) for x in ds_ma_hinh_thuc.split(',') if x.strip()]
    
    # Map ID ra tên
    list_names = [hth_map.get(id, str(id)) for id in list_ids]
    return ", ".join(list_names)

def _format_ten_hoc_ky(raw_ten: str) -> str:
    if not raw_ten:
        return raw_ten
    match = re.match(r"^(\w+)_(\d{4}-\d{4})$", raw_ten.strip())
    if match:
        return f"Kỳ {match.group(1)} ({match.group(2)})"
    return raw_ten

def _build_response(col) -> dict:
    """Chuyển đổi ORM Model thành Dict với các trường ánh xạ Tên"""
    data = NhomCongThucResponse.model_validate(col).model_dump()
    
    # Ánh xạ tên hệ đào tạo
    if col.he_dao_tao:
        data['Ten_HeDaoTao'] = col.he_dao_tao.Ten_He
        
    # Ánh xạ tên học kỳ qua relationship
    if getattr(col, 'tu_hoc_ky', None):
        data['TuHocKy_Ten'] = _format_ten_hoc_ky(col.tu_hoc_ky.TenHocKy.strip()) if col.tu_hoc_ky.TenHocKy else None
    if getattr(col, 'den_hoc_ky', None):
        data['DenHocKy_Ten'] = _format_ten_hoc_ky(col.den_hoc_ky.TenHocKy.strip()) if col.den_hoc_ky.TenHocKy else None
        
    # Ánh xạ danh sách hình thức học (xử lý bất đồng bộ ở hàm gọi)
    return data

async def get_danh_sach(db: Session, redis_client):
    """Lấy danh sách tất cả nhóm công thức (có cache)"""
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Nhóm công thức): {e}")

    columns = crud_he_thong_nhom_cong_thuc.get_danh_sach(db)
    hth_list = await get_hinh_thuc_hoc(db, redis_client)
    
    columns_dict = []
    for col in columns:
        data = _build_response(col)
        data['Ds_TenHTHoc'] = await _map_danh_sach_hinh_thuc_hoc(str(col.DsMaHTHoc), hth_list)
        columns_dict.append(data)
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Nhóm công thức): {e}")
            
    return columns_dict

async def get_danh_sach_theo_hoc_ky(db: Session, redis_client, hocky_namhoc: str):
    """Lọc danh sách nhóm công thức theo ID của chuỗi Học Kỳ"""
    # 1. Giải mã chuỗi hocky_namhoc -> ID (MaHocKy)
    ma_hoc_ky = await resolve_ma_hoc_ky(db, redis_client, hocky_namhoc, "HocPhan")
    if not ma_hoc_ky:
        return []

    # 2. Truy vấn DB
    columns = crud_he_thong_nhom_cong_thuc.get_danh_sach_theo_hoc_ky(db, ma_hoc_ky)
    hth_list = await get_hinh_thuc_hoc(db, redis_client)
    
    columns_dict = []
    for col in columns:
        data = _build_response(col)
        data['Ds_TenHTHoc'] = await _map_danh_sach_hinh_thuc_hoc(str(col.DsMaHTHoc), hth_list)
        columns_dict.append(data)
        
    return columns_dict

async def create_nhom_cong_thuc(db: Session, redis_client, obj_in: NhomCongThucCreate):
    """Tạo mới nhóm công thức"""
    new_obj = crud_he_thong_nhom_cong_thuc.create_nhom_cong_thuc(db, obj_in)
    await invalidate_cache(redis_client)
    
    # Map tên cho response trả về ngay lập tức
    hth_list = await get_hinh_thuc_hoc(db, redis_client)
    data = _build_response(new_obj)
    data['Ds_TenHTHoc'] = await _map_danh_sach_hinh_thuc_hoc(str(new_obj.DsMaHTHoc), hth_list)
    return data

async def update_nhom_cong_thuc(db: Session, redis_client, id_nhom_ct: int, obj_in: NhomCongThucUpdate):
    """Cập nhật Nhóm công thức"""
    db_obj = crud_he_thong_nhom_cong_thuc.get_by_id(db, id_nhom_ct)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm công thức quy đổi")
    
    updated_obj = crud_he_thong_nhom_cong_thuc.update_nhom_cong_thuc(db, db_obj, obj_in)
    
    # Xóa cache
    await invalidate_cache(redis_client)
    
    # Build response format
    hth_list = await get_hinh_thuc_hoc(db, redis_client)
    data = _build_response(updated_obj)
    data['Ds_TenHTHoc'] = await _map_danh_sach_hinh_thuc_hoc(str(updated_obj.DsMaHTHoc), hth_list)
    return data

async def delete_nhom_cong_thuc(db: Session, redis_client, id_nhom_ct: int):
    """Xóa Nhóm công thức"""
    db_obj = crud_he_thong_nhom_cong_thuc.get_by_id(db, id_nhom_ct)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy nhóm công thức quy đổi")
    
    crud_he_thong_nhom_cong_thuc.delete_nhom_cong_thuc(db, id_nhom_ct)
    
    # Xóa cache
    await invalidate_cache(redis_client)
    return {"message": "Xóa nhóm công thức thành công"}
