from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.exceptions import CredentialsException, NotFoundException
from app.db.session import SessionLocal
from app.schemas.token import TokenPayload

# Báo cho Swagger UI biết đường dẫn API dùng để đăng nhập lấy Token
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_token_from_request(request: Request) -> str:
    # 1. Thử đọc từ Cookie (dùng cho truy cập UI / Website)
    token = request.cookies.get("access_token")
    if token:
        return token
        
    # 2. Nếu không có ở Cookie, thử đọc từ Header Authorization (dùng cho API fetch / Postman)
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        return auth_header.split("Bearer ")[1]
        
    raise CredentialsException()

def get_current_hs_id(
    db: Session = Depends(get_db), token: str = Depends(get_token_from_request)
):
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        token_data = TokenPayload(**payload)
    except (JWTError, ValidationError):
        raise CredentialsException()
    
    # TODO: Khi có DB Model User thật, bạn lấy user từ DB ở đây:
    # user = crud_user.get(db, id=token_data.sub)
    # if not user: 
    #     raise NotFoundException(detail="Không tìm thấy User")
    # return user
    
    if token_data.sub is None:
        raise CredentialsException()
    
    # Trả về hs_id (chuyển sang kiểu int)
    return int(token_data.sub)
