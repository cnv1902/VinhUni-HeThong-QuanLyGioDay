import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_he_so_lop_dong
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongBulkUpdate, HeSoLopDongResponse, HeSoLopDongSimple
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:he_thong_he_so_lop_dong:all"
CACHE_TTL = 3600

async def invalidate_cache(redis_client):
    if redis_client:
        try:
            await redis_client.delete(CACHE_PREFIX)
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Hệ số lớp đông): {e}")

async def get_all(db: Session, redis_client):
    """Lấy danh sách tất cả hệ số lớp đông"""
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Hệ số lớp đông): {e}")

    columns = crud_he_thong_he_so_lop_dong.get_all(db)
    
    # Serialize using Pydantic Schema
    columns_dict = [HeSoLopDongResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict, default=str))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Hệ số lớp đông): {e}")
            
    return columns_dict

async def get_danh_sach_don_gian(db: Session, redis_client):
    """Lấy danh sách cấu hình rút gọn cho dropdown"""
    full_list = await get_all(db, redis_client)
    
    # Filter only ID and Name using Pydantic validation
    simple_list = [HeSoLopDongSimple.model_validate(item).model_dump() for item in full_list]
    return simple_list

async def bulk_update(db: Session, redis_client, payload: HeSoLopDongBulkUpdate):
    """Cập nhật hàng loạt (Smart Diff) Hệ số lớp đông (Global)"""
    db_items = crud_he_thong_he_so_lop_dong.get_all(db)
    db_map = {item.ID_HeSo_LD: item for item in db_items}

    inserts = []
    deletes = []
    incoming_ids = set()

    for item in payload.he_so_lop_dong:
        if item.ID_HeSo_LD is not None:
            incoming_ids.add(item.ID_HeSo_LD)
            if item.ID_HeSo_LD in db_map:
                db_item = db_map[item.ID_HeSo_LD]
                if item.Ten_HeSo_LD is not None:
                    setattr(db_item, 'Ten_HeSo_LD', item.Ten_HeSo_LD)
                if item.CauHinh_Json is not None:
                    setattr(db_item, 'CauHinh_Json', item.CauHinh_Json)
                if item.TrangThai is not None:
                    setattr(db_item, 'TrangThai', item.TrangThai)
        else:
            inserts.append(item)

    for db_id, db_item in db_map.items():
        if db_id not in incoming_ids:
            deletes.append(db_item)

    # 4. Ủy quyền cho CRUD thực hiện Transaction
    crud_he_thong_he_so_lop_dong.execute_bulk_transaction(
        db, inserts, deletes
    )
    
    # Xóa cache
    await invalidate_cache(redis_client)
    
    return {"message": "Cập nhật danh sách hệ số lớp đông thành công"}
