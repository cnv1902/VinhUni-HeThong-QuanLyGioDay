import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_he_so_lop_dong
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongCreate, HeSoLopDongUpdate
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:he_thong_he_so_lop_dong:"
CACHE_TTL = 3600

from typing import Any

async def invalidate_cache(redis_client, id_nhom_ct: Any):
    if redis_client:
        try:
            await redis_client.delete(f"{CACHE_PREFIX}{id_nhom_ct}")
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Hệ số lớp đông): {e}")

async def get_danh_sach_theo_nhom(db: Session, redis_client, id_nhom_ct: int):
    cache_key = f"{CACHE_PREFIX}{id_nhom_ct}"
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Hệ số lớp đông): {e}")

    columns = crud_he_thong_he_so_lop_dong.get_danh_sach_theo_nhom(db, id_nhom_ct=id_nhom_ct)
    columns_dict = [col.__dict__ for col in columns] # Basic serialization
    for col in columns_dict:
        col.pop('_sa_instance_state', None) # Remove SQLAlchemy state
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict, default=str))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Hệ số lớp đông): {e}")
            
    return columns

async def create(db: Session, redis_client, obj_in: HeSoLopDongCreate):
    new_obj = crud_he_thong_he_so_lop_dong.create(db, obj_in=obj_in)
    await invalidate_cache(redis_client, new_obj.ID_Nhom_CT)
    return new_obj

async def update(db: Session, redis_client, id_he_so_ld: int, obj_in: HeSoLopDongUpdate):
    db_obj = crud_he_thong_he_so_lop_dong.get_by_id(db, id_he_so_ld=id_he_so_ld)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình hệ số lớp đông")
        
    if obj_in.GiaTri_Min is not None:
        setattr(db_obj, 'GiaTri_Min', obj_in.GiaTri_Min)
    if obj_in.GiaTri_Max is not None:
        setattr(db_obj, 'GiaTri_Max', obj_in.GiaTri_Max)
    if obj_in.BieuThuc_HeSoLopDong is not None:
        setattr(db_obj, 'BieuThuc_HeSoLopDong', obj_in.BieuThuc_HeSoLopDong)
        
    updated_obj = crud_he_thong_he_so_lop_dong.update(db, db_obj=db_obj)
    await invalidate_cache(redis_client, updated_obj.ID_Nhom_CT)
    return updated_obj

async def delete(db: Session, redis_client, id_he_so_ld: int):
    db_obj = crud_he_thong_he_so_lop_dong.get_by_id(db, id_he_so_ld=id_he_so_ld)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình hệ số lớp đông")
    
    id_nhom_ct = db_obj.ID_Nhom_CT
    crud_he_thong_he_so_lop_dong.delete(db, db_obj=db_obj)
    await invalidate_cache(redis_client, id_nhom_ct)
    return {"message": "Xóa hệ số lớp đông thành công"}
