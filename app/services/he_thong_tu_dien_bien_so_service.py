import json
from sqlalchemy.orm import Session
from app.crud import curd_he_thong_tu_dien_bien_so
from app.schemas.he_thong_tu_dien_bien_so import TuDienBienSoResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:tu_dien_bien_so:all"
CACHE_TTL = 3600

async def invalidate_tu_dien_bien_so_cache(redis_client):
    """
    Xóa cache từ điển biến số (Gọi hàm này sau khi thêm/sửa/xóa từ điển biến số)
    """
    if redis_client:
        try:
            await redis_client.delete(CACHE_PREFIX)
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Từ điển biến số): {e}")

async def get_danh_sach_tu_dien_bien_so(db: Session, redis_client):
    """
    Lấy danh sách từ điển biến số (Ưu tiên đọc từ Redis Cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Từ điển biến số): {e}")

    columns = curd_he_thong_tu_dien_bien_so.get_danh_sach(db)
    columns_dict = [TuDienBienSoResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Từ điển biến số): {e}")
            
    return columns
