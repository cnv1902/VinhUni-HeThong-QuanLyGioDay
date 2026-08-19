from pydantic import BaseModel, ConfigDict
from typing import Optional

# --- Base Schemas ---
class TokenExchangeBase(BaseModel):
    transfer_token: str

class TokenBase(BaseModel):
    access_token: str
    token_type: str = "bearer"

# --- Request/Response Schemas ---
class TokenExchangeRequest(TokenExchangeBase):
    pass

class TokenResponse(TokenBase):
    pass

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None
