from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.hinh_thuc_day import HinhThucDayResponse
from app.services import hinh_thuc_day_service

router = APIRouter()

@router.get("/", response_model=List[HinhThucDayResponse])
async def get_danh_sach_hinh_thuc_day(db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách hình thức dạy
    """
    return await hinh_thuc_day_service.get_danh_sach(db, redis_client)
