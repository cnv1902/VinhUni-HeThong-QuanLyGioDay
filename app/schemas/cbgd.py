from pydantic import BaseModel, ConfigDict
from typing import Optional

class CbgdBase(BaseModel):
    HoCB: Optional[str] = None
    TenCB: Optional[str] = None
    ho_ten: Optional[str] = None

class CbgdResponse(CbgdBase):
    model_config = ConfigDict(from_attributes=True)
