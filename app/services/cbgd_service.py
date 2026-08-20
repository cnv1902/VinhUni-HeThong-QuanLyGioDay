import logging
import json
from sqlalchemy.orm import Session
from app.crud import cbgd as crud_cbgd
from app.schemas.cbgd import CbgdResponse

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
    
    ho_cb = str(cbgd.HoCB) if cbgd.HoCB else ""
    ten_cb = str(cbgd.TenCB) if cbgd.TenCB else ""
    ho_ten = f"{ho_cb} {ten_cb}".strip()
    
    response = CbgdResponse(
        HoCB=str(cbgd.HoCB) if cbgd.HoCB else None,
        TenCB=str(cbgd.TenCB) if cbgd.TenCB else None,
        ho_ten=ho_ten
    )
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(response.model_dump()))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (CBGD): {e}")
            
    return response
