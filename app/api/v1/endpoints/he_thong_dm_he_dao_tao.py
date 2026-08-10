from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.he_thong_dm_he_dao_tao import HeThongDMHeDaoTaoResponse
from app.services import he_thong_dm_he_dao_tao_service

router = APIRouter()

@router.get("/", response_model=List[HeThongDMHeDaoTaoResponse])
async def get_danh_sach_he_dao_tao(db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách hệ đào tạo
    """
    return await he_thong_dm_he_dao_tao_service.get_danh_sach(db, redis_client)
