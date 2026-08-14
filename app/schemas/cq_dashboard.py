from app.schemas.base_schema import RoundedFloatBaseModel
from typing import Optional

class CQDashboardStatsResponse(RoundedFloatBaseModel):
    TongNhomLop: Optional[int] = 0
    TongSinhVien: Optional[int] = 0
    TongTinChi: Optional[float] = 0.0
    DaXacNhan: Optional[int] = 0
    ChuaXacNhan: Optional[int] = 0
    AvgSinhVien: Optional[float] = 0.0
    AvgTinChi: Optional[float] = 0.0
