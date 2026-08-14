from app.schemas.base_schema import RoundedFloatBaseModel
from typing import Optional

class CQDashboardStatsResponse(RoundedFloatBaseModel):
    TongNhomLop: int = 0
    DaXacNhan: int = 0
    DaKy: int = 0
    ChuaKy: int = 0
    DaThanhToan: int = 0
    ChuaThanhToan: int = 0
    ChuaXacNhan: int = 0
