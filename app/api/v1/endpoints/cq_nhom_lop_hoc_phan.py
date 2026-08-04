from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse
from app.crud import cq_nhom_lop_hoc_phan as crud_cq_nhom_lop

router = APIRouter()

@router.get("/", response_model=List[CQNhomLopResponse])
def get_danh_sach_nhom_lop(ma_hoc_ky: Optional[int] = None, db: Session = Depends(get_db)):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy.
    Có thể lọc theo ma_hoc_ky (Ví dụ: ?ma_hoc_ky=20231)
    """
    items = crud_cq_nhom_lop.get_danh_sach(db, ma_hoc_ky=ma_hoc_ky)
    return items
