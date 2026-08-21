from pydantic import BaseModel, ConfigDict
from typing import Optional

class DonViBase(BaseModel):
    TenDonVi: Optional[str] = None
    ThuTu: Optional[int] = None
    # HienThi: Optional[int] = None
    # Cap: Optional[int] = None
    # ParentID: Optional[str] = None
    # LDV_ID: Optional[int] = None

class DonViResponse(DonViBase):
    MaDonVi: str

    model_config = ConfigDict(from_attributes=True)
