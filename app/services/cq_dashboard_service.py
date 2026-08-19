from sqlalchemy.orm import Session
from app.services import cq_nhom_lop_hoc_phan_service
from typing import Optional
from app.core.logger import app_logger as logger
from app.schemas.cq_dashboard import CQDashboardStatsResponse

CACHE_PREFIX = "cache:cq_dashboard:"

async def get_dashboard_stats(db: Session, redis_client, nam_tai_chinh: Optional[int] = None) -> CQDashboardStatsResponse:
    """
    Lấy dữ liệu tổng hợp cho Dashboard Chính quy.
    Tận dụng dữ liệu đã được cache từ service cq_nhom_lop_hoc_phan_service để tối ưu hiệu năng.
    """
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

    return CQDashboardStatsResponse(
        TongNhomLop=tong_nhom_lop,
        DaXacNhan=da_xac_nhan,
        DaKy=da_ky,
        ChuaKy=chua_ky,
        DaThanhToan=da_thanh_toan,
        ChuaThanhToan=chua_thanh_toan,
        ChuaXacNhan=chua_xac_nhan
    )
