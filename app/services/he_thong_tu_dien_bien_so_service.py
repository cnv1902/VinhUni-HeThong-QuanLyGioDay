import json
from sqlalchemy.orm import Session
from app.crud import curd_he_thong_tu_dien_bien_so
from app.schemas.he_thong_tu_dien_bien_so import TuDienBienSoResponse
from app.core.logger import app_logger as logger
from typing import Optional

CACHE_PREFIX = "cache:tu_dien_bien_so:"
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

async def get_danh_sach_tu_dien_bien_so(db: Session, redis_client, id_he: Optional[int] = None, trang_thai: Optional[int] = None):
    """
    Lấy danh sách từ điển biến số (Ưu tiên đọc từ Redis Cache)
    """
    dynamic_key = f"{CACHE_PREFIX}{id_he}_{trang_thai}"
    if redis_client:
        try:
            cached_data = await redis_client.get(dynamic_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Từ điển biến số): {e}")

    # Fallback xuống DB nếu Cache rỗng hoặc Redis lỗi
    items = curd_he_thong_tu_dien_bien_so.get_danh_sach_theo_he_dao_tao_va_trang_thai(db, id_he, trang_thai)
    
    result = []
    for item in items:
        # Validate từng item qua Schema để loại bỏ các trường thừa nếu có
        validated_item = TuDienBienSoResponse.model_validate(item)
        result.append(validated_item.model_dump())

    if redis_client:
        try:
            await redis_client.setex(dynamic_key, CACHE_TTL, json.dumps(result))
        except Exception as e:
            logger.error(f"Lỗi set Cache Redis (Từ điển biến số): {e}")

    return result
