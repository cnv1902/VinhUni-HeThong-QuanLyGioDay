from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.hoc_ky import HocKyResponse
from app.crud import curd_hoc_ky
from app.api.dependencies import get_db

router = APIRouter()

@router.get("/", response_model = List[HocKyResponse])
def get_danh_sach_hoc_ky(db: Session = Depends(get_db)):
    """
    Lấy danh sách tất cả các học kỳ.
    """
    items = curd_hoc_ky.get_danh_sach(db)
    return items