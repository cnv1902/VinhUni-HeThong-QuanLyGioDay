from sqlalchemy.orm import Session
from app.services import cq_nhom_lop_hoc_phan_service
from typing import Optional
from app.core.logger import app_logger as logger
from app.schemas.cq_dashboard import CQDashboardStatsResponse

CACHE_PREFIX = "cache:cq_dashboard:"

async def get_dashboard_stats(db: Session, redis_client, hoc_ky: Optional[str] = None) -> CQDashboardStatsResponse:
    """
    Lấy dữ liệu tổng hợp cho Dashboard Chính quy.
    Tận dụng dữ liệu đã được cache từ service cq_nhom_lop_hoc_phan_service để tối ưu hiệu năng.
    """
    try:
        nhom_lop_data = await cq_nhom_lop_hoc_phan_service.get_danh_sach_nhom_lop_hoc_phan_theo_hoc_ky(
            db, redis_client, hoc_ky
        )
    except Exception as e:
        logger.error(f"Lỗi khi lấy dữ liệu nhóm lớp học phần cho dashboard (Học kỳ {hoc_ky}): {e}")
        nhom_lop_data = []

    tong_nhom_lop = len(nhom_lop_data)
    da_xac_nhan = 0
    chua_xac_nhan = 0
    da_ky = 0

    for item in nhom_lop_data:
        if item.get("XacNhan") is True:
            da_xac_nhan += 1
            if (item.get("ID_LanTongHopFile") or 0) >= 1:
                da_ky += 1
        else:
            chua_xac_nhan += 1

    chua_ky = da_xac_nhan - da_ky

    return CQDashboardStatsResponse(
        TongNhomLop=tong_nhom_lop,
        DaXacNhan=da_xac_nhan,
        DaKy=da_ky,
        ChuaKy=chua_ky,
        DaThanhToan=0,
        ChuaThanhToan=0,
        ChuaXacNhan=chua_xac_nhan
    )
