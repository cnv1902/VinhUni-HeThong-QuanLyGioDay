from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.hinh_thuc_hoc import HinhThucHocResponse
from app.services import hinh_thuc_hoc_service

router = APIRouter()

@router.get("/", response_model=List[HinhThucHocResponse])
async def get_danh_sach_hinh_thuc_hoc(db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách hình thức học
    """
    return await hinh_thuc_hoc_service.get_danh_sach(db, redis_client)
