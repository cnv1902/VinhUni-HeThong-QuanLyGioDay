import json
from sqlalchemy.orm import Session
from typing import Optional
from app.crud import curd_hoc_ky
from app.schemas.hoc_ky import HocKyResponse
from app.core.logger import app_logger as logger

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
            logger.error(f"Lỗi xóa Cache Redis (Học kỳ): {e}")

async def get_all_hoc_ky(db: Session, redis_client):
    """
    Lấy danh sách học kỳ thanh toán (Ưu tiên đọc từ Redis Cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis Năm tài chính): {e}")

    columns = curd_hoc_ky.get_danh_sach_hoc_ky(db)
    columns_dict = []
    for col in columns:
        data = HocKyResponse.model_validate(col).model_dump()

        if data.get("NamTaiChinh") is not None:
            data["NamTaiChinh"] = str(data["NamTaiChinh"])[-4:]

        columns_dict.append(data)
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Học kỳ): {e}")
            
    return columns_dict