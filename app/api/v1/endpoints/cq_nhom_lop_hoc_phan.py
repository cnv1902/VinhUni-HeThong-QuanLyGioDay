from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.cq_nhom_lop_hoc_phan import CQNhomLopResponse
from app.services import cq_nhom_lop_hoc_phan_service as services_cq_nhom_lop

router = APIRouter()

@router.get("/", response_model=List[CQNhomLopResponse])
async def get_danh_sach(db: Session = Depends(get_db), redis_client = Depends(get_redis), ma_hoc_ky: Optional[int] = None):
    """
    Lấy danh sách các nhóm lớp học phần hệ chính quy
    """
    items = await services_cq_nhom_lop.get_danh_sach(db, redis_client, ma_hoc_ky=ma_hoc_ky)
    return items
