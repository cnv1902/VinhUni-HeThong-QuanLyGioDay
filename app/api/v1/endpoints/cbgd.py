from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db, get_current_hs_id
from app.core.redis import get_redis
from app.services import cbgd_service
from app.schemas.cbgd import CbgdResponse, CbgdDonViResponse

router = APIRouter()

@router.get("/full-name", response_model=CbgdResponse)
async def get_cbgd_by_hs_id(
    hs_id: int = Depends(get_current_hs_id),
    db: Session = Depends(get_db),
    redis_client = Depends(get_redis)
):
    result = await cbgd_service.get_cbgd_info_by_hs_id(db, redis_client, hs_id)
    if not result:
        raise HTTPException(status_code=404, detail="Không tìm thấy cán bộ")
    return result

@router.get("/danh-sach-can-bo-theo-don-vi", response_model=List[CbgdDonViResponse])
async def get_cbgd_by_ma_don_vi(
    ma_don_vi: str = Query(..., description="Mã đơn vị"),
    db: Session = Depends(get_db)
):
    result = cbgd_service.get_cbgd_by_ma_don_vi(db, ma_don_vi)
    return result
