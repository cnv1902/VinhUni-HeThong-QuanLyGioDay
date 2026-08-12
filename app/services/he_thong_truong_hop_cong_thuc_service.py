import json
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_truong_hop_cong_thuc
from app.schemas.he_thong_truong_hop_cong_thuc import TruongHopCongThucCreate, TruongHopCongThucUpdate, TruongHopCongThucResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:he_thong_truong_hop_cong_thuc:"
CACHE_TTL = 3600

from typing import Any

async def invalidate_cache(redis_client, id_nhom_ct: Any):
    if redis_client:
        try:
            await redis_client.delete(f"{CACHE_PREFIX}{id_nhom_ct}")
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Trường hợp công thức): {e}")

async def get_danh_sach_theo_nhom(db: Session, redis_client, id_nhom_ct: int):
    cache_key = f"{CACHE_PREFIX}{id_nhom_ct}"
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Trường hợp công thức): {e}")

    columns = crud_he_thong_truong_hop_cong_thuc.get_danh_sach_theo_nhom(db, id_nhom_ct=id_nhom_ct)
    
    # Dùng Pydantic để lấy cả các computed property như TenHTDay
    columns_dict = [TruongHopCongThucResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict, default=str))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Trường hợp công thức): {e}")
            
    return columns_dict

async def create(db: Session, redis_client, obj_in: TruongHopCongThucCreate):
    new_obj = crud_he_thong_truong_hop_cong_thuc.create(db, obj_in=obj_in)
    await invalidate_cache(redis_client, new_obj.ID_Nhom_CT)
    return new_obj

async def update(db: Session, redis_client, id_truong_hop: int, obj_in: TruongHopCongThucUpdate):
    db_obj = crud_he_thong_truong_hop_cong_thuc.get_by_id(db, id_truong_hop=id_truong_hop)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình trường hợp công thức")
        
    if obj_in.MaHTDay is not None:
        setattr(db_obj, 'MaHTDay', obj_in.MaHTDay)
    if obj_in.GhiChu_DieuKien is not None:
        setattr(db_obj, 'GhiChu_DieuKien', obj_in.GhiChu_DieuKien)
    if obj_in.BieuThuc_JSON is not None:
        setattr(db_obj, 'BieuThuc_JSON', obj_in.BieuThuc_JSON)
    if obj_in.BieuThuc_Text is not None:
        setattr(db_obj, 'BieuThuc_Text', obj_in.BieuThuc_Text)
        
    if obj_in.TrangThai is not None:
        setattr(db_obj, 'TrangThai', obj_in.TrangThai)
        
    updated_obj = crud_he_thong_truong_hop_cong_thuc.update(db, db_obj=db_obj)
    await invalidate_cache(redis_client, updated_obj.ID_Nhom_CT)
    return updated_obj

async def delete(db: Session, redis_client, id_truong_hop: int):
    db_obj = crud_he_thong_truong_hop_cong_thuc.get_by_id(db, id_truong_hop=id_truong_hop)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy cấu hình trường hợp công thức")
    
    id_nhom_ct = db_obj.ID_Nhom_CT
    crud_he_thong_truong_hop_cong_thuc.delete(db, db_obj=db_obj)
    await invalidate_cache(redis_client, id_nhom_ct)
    return {"message": "Xóa trường hợp công thức thành công"}
