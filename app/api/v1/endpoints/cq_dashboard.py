from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.cq_dashboard import CQDashboardStatsResponse
from app.services import cq_dashboard_service

router = APIRouter()

@router.get("/", response_model=CQDashboardStatsResponse)
async def get_dashboard_stats(
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis), 
    nam_tai_chinh: Optional[str] = None
):
    """
    Lấy số liệu thống kê tổng quan cho Dashboard Hệ Đào tạo Chính quy
    """
    stats = await cq_dashboard_service.get_dashboard_stats(db, redis_client, nam_tai_chinh)
    return stats
