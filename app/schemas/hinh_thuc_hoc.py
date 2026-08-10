from pydantic import BaseModel, ConfigDict
from typing import Optional

class HinhThucHocBase(BaseModel):
    TenHTHoc: Optional[str] = None

class HinhThucHocResponse(HinhThucHocBase):
    MaHTHoc: int

    model_config = ConfigDict(from_attributes=True)
