from sqlalchemy.orm import Session
from app.services import cq_nhom_lop_hoc_phan_service
from typing import Optional
import json
from app.core.logger import app_logger as logger
from app.schemas.cq_dashboard import CQDashboardStatsResponse

CACHE_PREFIX = "cache:cq_dashboard:"
CACHE_TTL = 3600

async def get_dashboard_stats(db: Session, redis_client, nam_tai_chinh: Optional[int] = None) -> CQDashboardStatsResponse:
    """
    Lấy dữ liệu tổng hợp cho Dashboard Chính quy.
    """
    cache_key = f"{CACHE_PREFIX}{nam_tai_chinh or 'all'}"
    if redis_client:
        try:
            cached_data = await redis_client.get(cache_key)
            if cached_data:
                return CQDashboardStatsResponse(**json.loads(cached_data))
        except Exception as e:
            logger.error(f"Lỗi lấy Cache Redis (Dashboard Chính Quy): {e}")

    try:
        nhom_lop_data = await cq_nhom_lop_hoc_phan_service.get_danh_sach_nhom_lop_hoc_phan_theo_nam_tai_chinh(
            db, redis_client, nam_tai_chinh
        )
    except Exception as e:
        logger.error(f"Lỗi khi lấy dữ liệu nhóm lớp học phần cho dashboard (Học kỳ {nam_tai_chinh}): {e}")
        nhom_lop_data = []

    tong_nhom_lop = len(nhom_lop_data)
    chua_xac_nhan = 0
    chua_ky = 0
    da_ky = 0
    da_thanh_toan = 0
    chua_thanh_toan = 0

    for item in nhom_lop_data:
        xac_nhan = item.get("XacNhan")
        id_lan_tong_hop = item.get("ID_LanTongHopFile") or 0
        trang_thai_thanh_toan = item.get("TrangThaiThanhToan")

        if not xac_nhan:
            chua_xac_nhan += 1
        else:
            if id_lan_tong_hop == 0:
                chua_ky += 1
            else:
                da_ky += 1
                if trang_thai_thanh_toan:
                    da_thanh_toan += 1
                else:
                    chua_thanh_toan += 1

    da_xac_nhan = tong_nhom_lop - chua_xac_nhan

    response = CQDashboardStatsResponse(
        TongNhomLop=tong_nhom_lop,
        DaXacNhan=da_xac_nhan,
        DaKy=da_ky,
        ChuaKy=chua_ky,
        DaThanhToan=da_thanh_toan,
        ChuaThanhToan=chua_thanh_toan,
        ChuaXacNhan=chua_xac_nhan
    )
    
    if redis_client:
        try:
            await redis_client.setex(cache_key, CACHE_TTL, json.dumps(response.model_dump()))
        except Exception as e:
            logger.error(f"Lỗi lưu Cache Redis (Dashboard Chính Quy): {e}")
            
    return response
