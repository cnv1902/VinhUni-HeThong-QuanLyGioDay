import json
from sqlalchemy.orm import Session
from app.crud import curd_cq_nhom_lop_hoc_phan
from typing import Optional
from app.core.exceptions import BadRequestException
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse
import time

CACHE_PREFIX = "cache:cq_nhom_lop_hoc_phan:"
CACHE_TTL = 3600

async def invalidate_cq_nhom_lop_hoc_phan_cache(redis_client, ma_hoc_ky: Optional[int] = None):
    """
    Xóa cache nhóm lớp học phần (Gọi hàm này sau khi thêm/sửa/xóa nhóm lớp học phần)
    """
    if redis_client:
        try:
            if ma_hoc_ky:
                await redis_client.delete(f"{CACHE_PREFIX}{ma_hoc_ky}")
            else:
                # TODO: Xóa nhiều key nếu cần khi không có ma_hoc_ky
                pass
        except Exception as e:
            print(f"Lỗi xóa Cache Redis: {e}")

async def get_danh_sach(db: Session, redis_client, ma_hoc_ky: Optional[int] = None):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy.
    Bắt buộc phải truyền tham số ma_hoc_ky (Ví dụ: ?ma_hoc_ky=20231)
    """
    if ma_hoc_ky is None:
        raise BadRequestException(detail="Yêu cầu không hợp lệ: Thiếu mã học kỳ.")

    cache_key = f"{CACHE_PREFIX}{ma_hoc_ky}"

    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            print(f"Lỗi lấy Cache Redis: {e}")

    columns = curd_cq_nhom_lop_hoc_phan.get_danh_sach_theo_hoc_ky(db, ma_hoc_ky)
    columns_dict = [CQNhomLopResponse.model_validate(item).model_dump() for item in columns]
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            print(f"Lỗi lưu Cache Redis: {e}")  
    return columns_dict