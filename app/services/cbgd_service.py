import logging
import json
from sqlalchemy.orm import Session
from app.crud import crud_cbgd
from app.schemas.cbgd import CbgdResponse, CbgdDonViResponse

logger = logging.getLogger(__name__)

CACHE_PREFIX = "cache:cbgd:"
CACHE_TTL = 3600

async def get_cbgd_info_by_hs_id(db: Session, redis_client, hs_id: int) -> CbgdResponse | None:
    cache_key = f"{CACHE_PREFIX}{hs_id}"
    
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return CbgdResponse(**json.loads(cached_data))
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (CBGD): {e}")

    cbgd = crud_cbgd.get_cbgd_by_hs_id(db, hs_id)
    if not cbgd:
        return None

    response = CbgdResponse.model_validate(cbgd)

    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(response.model_dump()))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (CBGD): {e}")

    return response

def get_cbgd_by_ma_don_vi(db: Session, ma_don_vi: str) -> list[dict]:
    items = crud_cbgd.get_cbgd_by_ma_don_vi(db, ma_don_vi=ma_don_vi)
    return [CbgdDonViResponse.model_validate(item).model_dump() for item in items]