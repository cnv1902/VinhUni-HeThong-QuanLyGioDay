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
    tong_sinh_vien = 0
    tong_tin_chi = 0.0
    da_xac_nhan = 0
    chua_xac_nhan = 0

    for item in nhom_lop_data:
        tong_sinh_vien += (item.get("SoSinhVien") or 0)
        tong_tin_chi += (item.get("SoTinChi") or 0.0)
        if item.get("XacNhan") is True:
            da_xac_nhan += 1
        else:
            chua_xac_nhan += 1

    avg_sinh_vien = tong_sinh_vien / tong_nhom_lop if tong_nhom_lop > 0 else 0.0
    avg_tin_chi = tong_tin_chi / tong_nhom_lop if tong_nhom_lop > 0 else 0.0

    return CQDashboardStatsResponse(
        TongNhomLop=tong_nhom_lop,
        TongSinhVien=tong_sinh_vien,
        TongTinChi=tong_tin_chi,
        DaXacNhan=da_xac_nhan,
        ChuaXacNhan=chua_xac_nhan,
        AvgSinhVien=avg_sinh_vien,
        AvgTinChi=avg_tin_chi
    )
