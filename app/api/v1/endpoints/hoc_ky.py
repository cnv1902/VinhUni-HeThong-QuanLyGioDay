from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.schemas.hoc_ky import HocKyHocPhanResponse
from app.services import hoc_ky_service
from app.api.dependencies import get_db
from app.core.redis import get_redis

router = APIRouter()

@router.get("/", response_model = List[HocKyHocPhanResponse])
async def get_danh_sach_hoc_ky(db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách tất cả các học kỳ học phần (cho Navbar).
    """
    columns = await hoc_ky_service.get_all_hoc_ky_hoc_phan(db, redis_client)
    return columns