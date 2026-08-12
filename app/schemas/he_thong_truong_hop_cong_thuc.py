from typing import Optional
from pydantic import BaseModel, ConfigDict

class TruongHopCongThucBase(BaseModel):
    ID_Nhom_CT: int
    MaHTDay: Optional[int] = None
    GhiChu_DieuKien: Optional[str] = None
    BieuThuc_JSON: Optional[str] = None
    BieuThuc_Text: Optional[str] = None

    TrangThai: Optional[bool] = True

class TruongHopCongThucCreate(TruongHopCongThucBase):
    pass

class TruongHopCongThucUpdate(BaseModel):
    MaHTDay: Optional[int] = None
    GhiChu_DieuKien: Optional[str] = None
    BieuThuc_JSON: Optional[str] = None
    BieuThuc_Text: Optional[str] = None
    TrangThai: Optional[bool] = None

class TruongHopCongThucResponse(TruongHopCongThucBase):
    ID_TruongHop_CT: int
    TenHTDay: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)
