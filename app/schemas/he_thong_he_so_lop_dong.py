from typing import Optional, List
from pydantic import BaseModel, ConfigDict

class HeSoLopDongBase(BaseModel):
    Ten_HeSo_LD: Optional[str] = None
    CauHinh_Json: str
    TrangThai: Optional[bool] = True

class HeSoLopDongCreate(HeSoLopDongBase):
    pass

class HeSoLopDongUpdate(BaseModel):
    ID_HeSo_LD: Optional[int] = None
    Ten_HeSo_LD: Optional[str] = None
    CauHinh_Json: Optional[str] = None
    TrangThai: Optional[bool] = None

class HeSoLopDongResponse(HeSoLopDongBase):
    ID_HeSo_LD: int
    model_config = ConfigDict(from_attributes=True)

class HeSoLopDongSimple(BaseModel):
    ID_HeSo_LD: int
    Ten_HeSo_LD: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class HeSoLopDongBulkUpdate(BaseModel):
    he_so_lop_dong: List[HeSoLopDongUpdate]
