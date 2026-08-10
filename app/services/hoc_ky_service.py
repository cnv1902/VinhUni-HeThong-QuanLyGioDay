import json
from sqlalchemy.orm import Session
from typing import Optional
from app.crud import curd_hoc_ky
from app.schemas.hoc_ky import HocKyThanhToanResponse, HocKyHocPhanResponse
from app.core.logger import app_logger as logger

CACHE_PREFIX_THANH_TOAN = "cache:hoc_ky_thanh_toan:all"
CACHE_PREFIX_HOC_PHAN = "cache:hoc_ky_hoc_phan:all"
CACHE_TTL = 3600

async def invalidate_hoc_ky_cache(redis_client):
    """
    Xóa cache học kỳ (Gọi hàm này sau khi thêm/sửa/xóa học kỳ)
    """
    if redis_client:
        try:
            await redis_client.delete(CACHE_PREFIX_THANH_TOAN)
            await redis_client.delete(CACHE_PREFIX_HOC_PHAN)
        except Exception as e:
            logger.error(f"Lỗi xóa Cache Redis (Học kỳ): {e}")

async def get_all_hoc_ky_thanh_toan(db: Session, redis_client):
    """
    Lấy danh sách học kỳ thanh toán (Ưu tiên đọc từ Redis Cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX_THANH_TOAN)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Học kỳ thanh toán): {e}")

    columns = curd_hoc_ky.get_danh_sach_hoc_ky_thanh_toan(db)
    columns_dict = [HocKyThanhToanResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX_THANH_TOAN, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Học kỳ thanh toán): {e}")
            
    return columns_dict

async def get_all_hoc_ky_hoc_phan(db: Session, redis_client):
    """
    Lấy danh sách học kỳ học phần (Ưu tiên đọc từ Redis Cache)
    """
    if redis_client:
        try:
            cached_data = await redis_client.get(CACHE_PREFIX_HOC_PHAN)
            if cached_data:
                return json.loads(cached_data)
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Học kỳ học phần): {e}")

    columns = curd_hoc_ky.get_danh_sach_hoc_ky_hoc_phan(db)
    columns_dict = [HocKyHocPhanResponse.model_validate(col).model_dump() for col in columns]
    
    if redis_client:
        try:
            await redis_client.setex(CACHE_PREFIX_HOC_PHAN, CACHE_TTL, json.dumps(columns_dict))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Học kỳ học phần): {e}")
            
    return columns_dict

async def resolve_ma_hoc_ky(db: Session, redis_client, ten_hoc_ky_str: str, loai: str = "HocPhan") -> Optional[int]:
    """
    Giải mã chuỗi '1_2023-2024' thành MaHocKy (ID)
    """
    if not ten_hoc_ky_str:
        return None

    if loai == "HocPhan":
        danh_sach = await get_all_hoc_ky_hoc_phan(db, redis_client)
    else:
        danh_sach = await get_all_hoc_ky_thanh_toan(db, redis_client)
    for hk in danh_sach:
        hk_name = hk.get("TenHocKy")
        if hk_name and hk_name.strip().upper() == ten_hoc_ky_str.strip().upper():
            return hk.get("MaHocKy")
    return None
