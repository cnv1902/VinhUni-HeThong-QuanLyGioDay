import json
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_dm_truong_duoc_su_dung
from app.schemas.he_thong_dm_truong_duoc_su_dung import TruongDuocSuDungResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:config:columns:"
CACHE_TTL = 3600 * 24

async def invalidate_columns_cache(redis_client, MaBang: str):
    """
    Xóa cache cột cấu hình
    """
    if redis_client:
        try:
            await redis_client.delete(f"{CACHE_PREFIX}{MaBang}")
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Cột cấu hình {MaBang}): {e}")

async def get_danh_sach_cot_theo_bang(db: Session, redis_client, MaBang: str):
    """
    Lấy danh sách cấu hình cột (Ưu tiên đọc từ Redis Cache)
    """
    cache_key = f"{CACHE_PREFIX}{MaBang}"
    
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Cột cấu hình {MaBang}): {e}")

    columns = crud_he_thong_dm_truong_duoc_su_dung.get_danh_sach_cot_theo_bang(db, MaBang)
    columns_dict = [TruongDuocSuDungResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Cột cấu hình {MaBang}): {e}")
            
    return columns

async def get_all_config_columns(db: Session, MaBang: str):
    """
    Lấy danh sách tất cả cột (Bao gồm cả cột ẩn) phục vụ cho trang quản trị.
    Không cache hàm này vì nó dành cho Admin.
    """
    columns = crud_he_thong_dm_truong_duoc_su_dung.get_all_config_columns(db, MaBang)
    return [TruongDuocSuDungResponse.model_validate(col) for col in columns]

async def get_danh_sach_bang(db: Session):
    """
    Lấy danh sách các bảng đang cấu hình
    """
    return crud_he_thong_dm_truong_duoc_su_dung.get_danh_sach_bang(db)

async def bulk_update_columns(db: Session, redis_client, payload):
    """
    Cập nhật hàng loạt cột và clear cache các bảng bị ảnh hưởng
    """
    updates = [item.model_dump() for item in payload.items]
    updated_records, affected_tables = crud_he_thong_dm_truong_duoc_su_dung.bulk_update(db, updates)
    
    # Clear cache cho các bảng bị ảnh hưởng
    for ma_bang in affected_tables:
        await invalidate_columns_cache(redis_client, ma_bang)
        
    return updated_records, affected_tables
