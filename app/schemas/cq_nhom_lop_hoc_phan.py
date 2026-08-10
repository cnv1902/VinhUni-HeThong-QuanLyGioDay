from pydantic import BaseModel, ConfigDict
from typing import Optional

class CQNhomLopBase(BaseModel):
    MaNhomLopHP: str
    TenNhomLopHP: Optional[str] = None
    SoSinhVien: Optional[int] = None
    SiSoDangKyHienTai: Optional[int] = None
    SiSoChuyenDoi: Optional[int] = None
    SiSoDKH: Optional[int] = None
    HocKy: Optional[str] = None
    TenHTHoc: Optional[str] = None
    TenHTDay: Optional[str] = None
    LopChuyen: Optional[bool] = None
    SoTinChi: Optional[float] = None
    SoTietLT: Optional[float] = None
    SotietTH: Optional[float] = None
    SoTietBT: Optional[float] = None
    SotietDA: Optional[float] = None
    SotietThucTap: Optional[float] = None
    SotietDoAnKhoaLuan: Optional[float] = None
    SoTietLTQD: Optional[float] = None
    SoTietTHQD: Optional[float] = None
    SoTietBTQD: Optional[float] = None
    KhoaCN: Optional[str] = None
    ID_LanTongHopFile: Optional[int] = None
    HeSoHocDi: Optional[float] = None
    XacNhan: Optional[bool] = None

class CQNhomLopResponse(CQNhomLopBase):
    ID: int

    model_config = ConfigDict(from_attributes=True)
