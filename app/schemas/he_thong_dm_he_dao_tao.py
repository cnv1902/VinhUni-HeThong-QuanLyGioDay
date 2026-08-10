from pydantic import BaseModel, ConfigDict
from typing import Optional

class HeThongDMHeDaoTaoBase(BaseModel):
    Ten_He: Optional[str] = None
    Hieu_Luc: Optional[int] = None
    Loai: Optional[str] = None

class HeThongDMHeDaoTaoResponse(HeThongDMHeDaoTaoBase):
    ID_He: int

    model_config = ConfigDict(from_attributes=True)
