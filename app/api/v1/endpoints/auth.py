from fastapi import APIRouter
from app.schemas.auth import TokenExchangeRequest, TokenResponse
from app.services import auth_service

router = APIRouter()

@router.post("/exchange", response_model=TokenResponse)
async def exchange_token(request: TokenExchangeRequest):
    """
    Nhận transfer_token (vé chuyển hướng từ Cổng Cán Bộ), xác thực và trả về access_token dài hạn
    """
    return auth_service.exchange_transfer_token(request.transfer_token)
