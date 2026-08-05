import json
from sqlalchemy.orm import Session
from app.crud import crud_dm_truong
from app.schemas.danh_muc_truong_duoc_su_dung import TruongDuocSuDungResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:config:columns:"
CACHE_TTL = 3600 * 24

async def invalidate_columns_cache(redis_client, table_name: str):
    """
    Xóa cache cột cấu hình
    """
    if redis_client:
        try:
            await redis_client.delete(f"{CACHE_PREFIX}{table_name}")
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Cột cấu hình {table_name}): {e}")

async def get_columns_by_table(db: Session, redis_client, table_name: str):
    """
    Lấy danh sách cấu hình cột (Ưu tiên đọc từ Redis Cache)
    """
    cache_key = f"{CACHE_PREFIX}{table_name}"
    
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Cột cấu hình {table_name}): {e}")

    columns = crud_dm_truong.get_columns_by_table(db, table_name)
    columns_dict = [TruongDuocSuDungResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Cột cấu hình {table_name}): {e}")
            
    return columns
