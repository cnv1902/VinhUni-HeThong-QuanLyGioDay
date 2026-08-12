import json
from sqlalchemy.orm import Session
from app.crud import curd_cq_nhom_lop_hoc_phan
from typing import Optional
from app.core.exceptions import BadRequestException
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse
from app.core.logger import app_logger as logger
from app.services import hoc_ky_service
import time

CACHE_PREFIX = "cache:cq_nhom_lop_hoc_phan:"
CACHE_TTL = 3600

async def invalidate_cq_nhom_lop_hoc_phan_cache(redis_client, hoc_ky: Optional[str] = None):
    """
    Xóa cache nhóm lớp học phần (Gọi hàm này sau khi thêm/sửa/xóa nhóm lớp học phần)
    """
    if redis_client:
        try:
            if hoc_ky:
                await redis_client.delete(f"{CACHE_PREFIX}{hoc_ky}")
            else:
                # TODO: Xóa nhiều key nếu cần khi không có hoc_ky
                pass
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Nhóm lớp): {e}")

async def get_danh_sach_nhom_lop_hoc_phan_theo_hoc_ky(db: Session, redis_client, hoc_ky: Optional[str] = None):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy.
    """
    if hoc_ky is None:
        raise BadRequestException(detail="Yêu cầu không hợp lệ: Thiếu học kỳ.")

    cache_key = f"{CACHE_PREFIX}{hoc_ky}"

    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Nhóm lớp {hoc_ky}): {e}")

    columns = curd_cq_nhom_lop_hoc_phan.get_danh_sach_theo_hoc_ky(db, hoc_ky)
    columns_dict = [CQNhomLopResponse.model_validate(item).model_dump() for item in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Nhóm lớp {hoc_ky}): {e}")
        
    return columns_dict