from fastapi import HTTPException, status
from jose import JWTError
from app.core import security
from app.schemas.auth import TokenResponse

def exchange_transfer_token(transfer_token: str) -> TokenResponse:
    """
    Xác thực transfer_token và trả về access_token dài hạn
    """
    try:
        hs_id = security.verify_transfer_token(transfer_token)
    except JWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token không hợp lệ hoặc đã hết hạn: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = security.create_access_token(subject=hs_id)
    return TokenResponse(access_token=access_token, token_type="bearer")
