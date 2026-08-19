from fastapi import Depends
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

def get_current_hs_id(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
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
