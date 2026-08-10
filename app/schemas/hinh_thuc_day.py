from pydantic import BaseModel, ConfigDict
from typing import Optional

class HinhThucDayBase(BaseModel):
    TenHTDay: Optional[str] = None
    TrangThai: Optional[bool] = None

class HinhThucDayResponse(HinhThucDayBase):
    MaHTDay: int

    model_config = ConfigDict(from_attributes=True)
