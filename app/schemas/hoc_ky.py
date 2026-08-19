from pydantic import BaseModel, ConfigDict
from typing import Optional

class HocKyBase(BaseModel):
    NamTaiChinh: Optional[str] = None

class HocKyResponse(HocKyBase):
    MaHocKy: int

    model_config = ConfigDict(from_attributes=True)