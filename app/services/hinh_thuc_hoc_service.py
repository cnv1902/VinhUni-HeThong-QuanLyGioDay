import json
from sqlalchemy.orm import Session
from app.crud import crud_hinh_thuc_hoc
from app.schemas.hinh_thuc_hoc import HinhThucHocResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:hinh_thuc_hoc:all"
CACHE_TTL = 3600

async def get_danh_sach(db: Session, redis_client):
    """
    Lấy danh sách hình thức học (có cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Hình thức học): {e}")

    columns = crud_hinh_thuc_hoc.get_danh_sach(db)
    columns_dict = [HinhThucHocResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Hình thức học): {e}")
            
    return columns_dict
