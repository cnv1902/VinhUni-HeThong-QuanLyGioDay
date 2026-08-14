from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List, Optional

from app.api.dependencies import get_db
from app.core.redis import get_redis
from app.schemas.he_thong_dm_truong_duoc_su_dung import TruongDuocSuDungResponse, TruongDuocSuDungBulkUpdateRequest
from app.schemas.he_thong_tu_dien_bien_so import TuDienBienSoResponse
from app.services import he_thong_dm_truong_duoc_su_dung_service, he_thong_tu_dien_bien_so_service

router = APIRouter()

@router.get("/danh-sach-cot/{MaBang}", response_model=List[TruongDuocSuDungResponse])
async def get_danh_sach_cot_theo_bang(MaBang: str, db: Session = Depends(get_db), redis_client = Depends(get_redis)):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể (Chỉ lấy cột có HienThi=True).
    """
    columns = await he_thong_dm_truong_duoc_su_dung_service.get_danh_sach_cot_theo_bang(db, redis_client, MaBang)
    return columns

@router.get("/danh-sach-cot-admin/{MaBang}", response_model=List[TruongDuocSuDungResponse])
async def get_danh_sach_cot_admin(MaBang: str, db: Session = Depends(get_db)):
    """
    Lấy toàn bộ cấu hình cột (cả cột ẩn) phục vụ giao diện Admin.
    Nếu MaBang = 'all', trả về tất cả.
    """
    return await he_thong_dm_truong_duoc_su_dung_service.get_all_config_columns(db, MaBang)

@router.get("/danh-sach-bang", response_model=List[dict])
async def get_danh_sach_bang(db: Session = Depends(get_db)):
    """
    Lấy danh sách các bảng (MaBang) đang được cấu hình trong hệ thống.
    """
    return await he_thong_dm_truong_duoc_su_dung_service.get_danh_sach_bang(db)

@router.put("/danh-sach-cot/bulk-update")
async def bulk_update_config_columns(
    payload: TruongDuocSuDungBulkUpdateRequest, 
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """
    Cập nhật hàng loạt cấu hình cột và tự động xóa cache cho các bảng bị ảnh hưởng.
    """
    updated_records, affected_tables = await he_thong_dm_truong_duoc_su_dung_service.bulk_update_columns(db, redis_client, payload)
    return {"message": "Thành công", "updated_count": len(updated_records), "affected_tables": affected_tables}

@router.get("/tu-dien-bien-so", response_model=List[TuDienBienSoResponse])
async def get_danh_sach_tu_dien_bien_so(
    id_he: Optional[int] = None,
    trang_thai: Optional[int] = None,
    db: Session = Depends(get_db), 
    redis_client = Depends(get_redis)
):
    """
    Lấy danh sách từ điển biến số.
    """
    columns = await he_thong_tu_dien_bien_so_service.get_danh_sach_tu_dien_bien_so(db, redis_client, id_he, trang_thai)
    return columns

