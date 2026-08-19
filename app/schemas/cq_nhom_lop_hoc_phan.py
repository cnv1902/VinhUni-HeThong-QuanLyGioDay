from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from app.schemas.base_schema import RoundedFloatBaseModel

class CQNhomLopBase(RoundedFloatBaseModel):
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
    SoTiet_QD: Optional[float] = None
    SoTiet_TT: Optional[float] = None
    KhoaCN: Optional[str] = None
    ID_LanTongHopFile: Optional[int] = None
    HeSoHocDi: Optional[float] = None
    XacNhan: Optional[bool] = None
    NamTaiChinh: Optional[int] = None
    HeSo_LopDong: Optional[float] = None
    Cong_Thuc: Optional[str] = None
    TrangThaiThanhToan: Optional[bool] = False

class CQNhomLopResponse(CQNhomLopBase):
    ID: int

    model_config = ConfigDict(from_attributes=True)

class CQNhomLopUpdateItem(BaseModel):
    MaNhomLopHP: str
    updates: Dict[str, Any]

class CQNhomLopBulkUpdate(BaseModel):
    MaBang: str
    items: List[CQNhomLopUpdateItem]

class CQNhomLopBulkUpdateResponse(RoundedFloatBaseModel):
    message: str
    updated_rows: List[Dict[str, Any]]

class CQNhomLopBulkConfirmRequest(BaseModel):
    ma_nhom_lop_hp_list: List[str]
