from pydantic import BaseModel, ConfigDict
from typing import Optional

class ViewHeThongPhanQuyenChucNangBase(BaseModel):
    CN_Ten: Optional[str] = None
    CN_Thuoc: Optional[int] = None
    CN_ThuTu: Optional[int] = None
    CN_Cap: Optional[int] = None
    CN_HienThi: Optional[bool] = None
    CN_TrangThai: Optional[int] = None
    ThuocMoDul: Optional[str] = None
    CN_URL: Optional[str] = None

class ViewHeThongPhanQuyenChucNangResponse(ViewHeThongPhanQuyenChucNangBase):
    HS_ID: int
    CN_ID: int
    NHOM_ID: int

    model_config = ConfigDict(from_attributes=True)
