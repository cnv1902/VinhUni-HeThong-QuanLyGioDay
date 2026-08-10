import json
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_dm_he_dao_tao
from app.schemas.he_thong_dm_he_dao_tao import HeThongDMHeDaoTaoResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX = "cache:he_thong_dm_he_dao_tao:all"
CACHE_TTL = 3600

async def get_danh_sach(db: Session, redis_client):
    """
    Lấy danh sách hệ đào tạo (có cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Hệ đào tạo): {e}")

    columns = crud_he_thong_dm_he_dao_tao.get_danh_sach(db)
    columns_dict = [HeThongDMHeDaoTaoResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Hệ đào tạo): {e}")
            
    return columns_dict
