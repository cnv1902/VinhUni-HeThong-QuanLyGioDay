from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.api.dependencies import get_db
from app.schemas.danh_muc_truong_duoc_su_dung import TruongDuocSuDungResponse
from app.crud import crud_dm_truong

router = APIRouter()

@router.get("/columns/{table_name}", response_model=List[TruongDuocSuDungResponse])
def get_table_columns(table_name: str, db: Session = Depends(get_db)):
    """
    Lấy danh sách cấu hình hiển thị cột cho một bảng cụ thể.
    """
    columns = crud_dm_truong.get_columns_by_table(db, table_name)
    return columns
