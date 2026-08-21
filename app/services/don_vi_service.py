import json
from typing import List, Optional
from sqlalchemy.orm import Session
from app.crud import crud_don_vi
from app.schemas.don_vi import DonViResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:don_vi:"
CACHE_TTL = 3600

async def get_danh_sach(db: Session, redis_client) -> List[dict]:
    """
    Lấy danh sách đơn vị (có Redis Caching).
    """
    cache_key = f"{CACHE_PREFIX}all"

    # 1. GET từ Redis
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                # 2. Cache Hit -> Trả về ngay lập tức
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Đơn vị): {e}")

    # 3. Cache Miss -> Gọi CRUD xuống DB
    items = crud_don_vi.get_danh_sach(db)
    # 4. Serialize bằng Pydantic Schema
    items_dict = [DonViResponse.model_validate(item).model_dump() for item in items]

    # 5. Lưu vào Redis
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(items_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Đơn vị): {e}")

    return items_dict


