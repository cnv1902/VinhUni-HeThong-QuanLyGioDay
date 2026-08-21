from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.don_vi import DonViResponse
from app.services import don_vi_service

router = APIRouter()

@router.get("/", response_model=List[DonViResponse])
async def get_danh_sach_don_vi(
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    """
    Lấy danh sách các đơn vị trong trường.
    """
    return await don_vi_service.get_danh_sach(db, redis_client)
