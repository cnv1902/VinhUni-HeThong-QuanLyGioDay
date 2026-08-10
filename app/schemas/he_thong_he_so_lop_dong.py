from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class HeSoLopDongBase(BaseModel):
    ID_Nhom_CT: int
    GiaTri_Min: int
    GiaTri_Max: int
    BieuThuc_HeSoLopDong: str

class HeSoLopDongCreate(HeSoLopDongBase):
    pass

class HeSoLopDongUpdate(BaseModel):
    GiaTri_Min: Optional[int] = None
    GiaTri_Max: Optional[int] = None
    BieuThuc_HeSoLopDong: Optional[str] = None

class HeSoLopDongResponse(HeSoLopDongBase):
    ID_HeSo_LD: int
    model_config = ConfigDict(from_attributes=True)

