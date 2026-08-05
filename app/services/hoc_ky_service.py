import json
from sqlalchemy.orm import Session
from app.crud import curd_hoc_ky
from app.schemas.hoc_ky import HocKyResponse

CACHE_PREFIX = "cache:hoc_ky:all"
CACHE_TTL = 3600

async def invalidate_hoc_ky_cache(redis_client):
    """
    Xóa cache học kỳ (Gọi hàm này sau khi thêm/sửa/xóa học kỳ)
    """
    if redis_client:
        try:
            await redis_client.delete(CACHE_PREFIX)
        except Exception as e:
            print(f"Lỗi xóa Cache Redis: {e}")

async def get_all_hoc_ky(db: Session, redis_client):
    """
    Lấy danh sách học kỳ (Ưu tiên đọc từ Redis Cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Lỗi lấy Cache Redis: {e}")

    items = curd_hoc_ky.get_danh_sach(db)
    items_dict = [HocKyResponse.model_validate(item).model_dump() for item in items]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(items_dict))
        except Exception as e:
            print(f"Lỗi lưu Cache Redis: {e}")
        
    return items
