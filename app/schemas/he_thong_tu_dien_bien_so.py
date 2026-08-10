from pydantic import BaseModel, ConfigDict
from typing import Optional

class TuDienBienSoBase(BaseModel):
    NhomBien: int
    TenHienThi: str
    MaBienSo: str
    ThuTuHienThi: int = 0
    GhiChu: Optional[str] = None
    TrangThai: bool = True

class TuDienBienSoResponse(TuDienBienSoBase):
    ID: int

    model_config = ConfigDict(from_attributes=True)
