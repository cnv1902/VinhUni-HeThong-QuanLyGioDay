from pydantic import BaseModel, ConfigDict
from typing import Optional

class HocKyResponse(BaseModel):
    MaHocKy: int
    TenHocKy: Optional[str] = None
    NamHoc: Optional[str] = None
    HocKy: Optional[int] = None
    HocKy_CMC: Optional[str] = None
    HienTai: Optional[bool] = False
    TrangThaiHeThong: Optional[int] = 0
    TrangThai_MacDinh: Optional[bool] = False
    TrangThai_CQ: Optional[int] = 0
    TrangThai_VLVH: Optional[int] = 0
    TrangThai_SDH: Optional[int] = 0
    TrangThai_NCKH: Optional[int] = 0
    TrangThai_HDCM: Optional[int] = 0
    TrangThai_DAKL: Optional[int] = 0
    TrangThai_DTTX: Optional[int] = 0
    TrangThai_Chuyen: Optional[int] = 0
    ThoiHan_HDCM: Optional[int] = 0
    TrangThai_THCS: Optional[int] = 0
    TrangThai_Khac: Optional[int] = 0
    DuocChuyenVeHocKy_Ma: Optional[int] = None
    DuocChuyenVeHocKy_Ten: Optional[str] = None
    NamTaiChinh: Optional[str] = None
    TrangThai_DKDM: Optional[int] = 0
    HienThi_TKB: Optional[int] = 0
    ThayDoiHinhThucThanhToan_CQ: Optional[int] = 0
    ThayDoiHinhThucThanhToan_VLVH: Optional[int] = 0
    ThayDoiHinhThucThanhToan_SDH: Optional[int] = 0
    ThayDoiHinhThucThanhToan_DTTX: Optional[int] = 0
    ThayDoiHinhThucThanhToan_Chuyen: Optional[int] = 0
    ThayDoiHinhThucThanhToan_THCS: Optional[int] = 0
    ThayDoiHinhThucThanhToan_Khac: Optional[int] = 0

    model_config = ConfigDict(from_attributes=True)