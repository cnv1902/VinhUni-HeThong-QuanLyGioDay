from pydantic import BaseModel, ConfigDict, computed_field
from typing import Optional

class CbgdBase(BaseModel):
    HS_ID: Optional[int] = None
    HS_Ho: Optional[str] = None
    HS_Ten: Optional[str] = None
    DV_ID_GiangDay: Optional[str] = None
    DV_ID_BienChe: Optional[str] = None
    DV_Ten: Optional[str] = None
    Email_VinhUni: Optional[str] = None

class CbgdResponse(CbgdBase):
    model_config = ConfigDict(from_attributes=True)

    @computed_field
    @property
    def ho_ten(self) -> str:
        return f"{self.HS_Ho or ''} {self.HS_Ten or ''}".strip()
class CbgdDonViResponse(CbgdResponse):
    pass
