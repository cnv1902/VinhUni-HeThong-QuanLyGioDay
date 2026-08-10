from pydantic import BaseModel, ConfigDict
from typing import Optional

class TruongDuocSuDungBase(BaseModel):
    TenBang: str
    MaTruong: str
    TenTruong: str
    DoRong: Optional[int] = 100
    CanLe: Optional[str] = "left"
    KieuTruong: Optional[str] = "text"
    ThuTuHienThi: Optional[int] = 0
    HienThi: Optional[bool] = True
    DuocSua: Optional[bool] = False
    GhimCot: Optional[bool] = False

class TruongDuocSuDungResponse(TruongDuocSuDungBase):
    ID: int

    model_config = ConfigDict(from_attributes=True)
