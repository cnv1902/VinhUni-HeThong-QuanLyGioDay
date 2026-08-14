from pydantic import BaseModel, ConfigDict
from typing import Optional

class TruongDuocSuDungBase(BaseModel):
    MaBang: str
    TenBang: Optional[str] = None
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

class TruongDuocSuDungUpdateRequest(BaseModel):
    ID: int
    MaBang: str         # Cần thiết để API biết xóa cache đúng bảng
    TenTruong: Optional[str] = None
    DoRong: Optional[int] = None
    CanLe: Optional[str] = None
    KieuTruong: Optional[str] = None
    ThuTuHienThi: Optional[int] = None
    HienThi: Optional[bool] = None
    DuocSua: Optional[bool] = None
    GhimCot: Optional[bool] = None

class TruongDuocSuDungBulkUpdateRequest(BaseModel):
    items: list[TruongDuocSuDungUpdateRequest]
