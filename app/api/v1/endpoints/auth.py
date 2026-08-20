from fastapi import APIRouter, Depends, Response
from fastapi.responses import RedirectResponse
from app.schemas.auth import TokenExchangeRequest, TokenResponse
from app.services import auth_service
from app.api.dependencies import get_current_hs_id

router = APIRouter()

@router.post("/exchange", response_model=TokenResponse)
async def exchange_token(request: TokenExchangeRequest):
    """
    Nhận transfer_token (vé chuyển hướng từ Cổng Cán Bộ), xác thực và trả về access_token dài hạn
    """
    return auth_service.exchange_transfer_token(request.transfer_token)

@router.get("/sso-callback")
async def sso_callback(transfer_token: str):
    """
    API dùng làm Callback cho Cổng Cán Bộ.
    Nhận transfer_token, sinh access_token và nhét vào Cookie, sau đó Redirect về giao diện Web.
    """
    # 1. Đổi transfer_token lấy access_token
    token_response = auth_service.exchange_transfer_token(transfer_token)
    
    # 2. Khởi tạo RedirectResponse về trang chủ (hoặc trang được chỉ định)
    response = RedirectResponse(url="/quan_ly_nhom_lop_hoc_phan.html", status_code=302)
    
    # 3. Gắn token vào Cookie
    response.set_cookie(
        key="access_token",
        value=token_response.access_token,
        httponly=True,
        secure=True,     # Yêu cầu HTTPS trong thực tế
        samesite="lax",  # Chống CSRF
        max_age=8 * 60 * 60 # 8 tiếng
    )
    return response

@router.post("/logout")
async def logout(response: Response, hs_id: int = Depends(get_current_hs_id)):
    """
    Đăng xuất bằng cách xóa Cookie.
    """
    response.delete_cookie(
        key="access_token",
        httponly=True,
        secure=True,
        samesite="lax"
    )
    return {"message": "Đăng xuất thành công"}
