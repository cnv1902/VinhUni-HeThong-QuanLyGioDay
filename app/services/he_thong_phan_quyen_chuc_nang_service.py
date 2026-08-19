import json
import logging
from sqlalchemy.orm import Session
from app.crud import crud_he_thong_phan_quyen_chuc_nang
from app.schemas.he_thong_phan_quyen_chuc_nang import ViewHeThongPhanQuyenChucNangResponse

logger = logging.getLogger(__name__)

CACHE_PREFIX = "cache:phanquyen_chucnang:hs_id:"
CACHE_TTL = 86400  # 1 day

async def get_danh_sach_chuc_nang_theo_hs_id(db: Session, redis_client, hs_id: int):
    cache_key = f"{CACHE_PREFIX}{hs_id}"
    
    # Thử lấy từ cache
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Phân quyền chức năng HS_ID {hs_id}): {e}")

    # Lấy từ DB nếu không có trong cache
    records = crud_he_thong_phan_quyen_chuc_nang.get_danh_sach_theo_hs_id(db, hs_id)
    
    # Chuyển đổi sang dict để serialize vào Redis
    result = [ViewHeThongPhanQuyenChucNangResponse.model_validate(item).model_dump() for item in records]

    # Lưu vào cache
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(result))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Phân quyền chức năng HS_ID {hs_id}): {e}")

    return result
