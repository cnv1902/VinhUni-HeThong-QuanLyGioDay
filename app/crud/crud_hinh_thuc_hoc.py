from sqlalchemy.orm import Session
from app.models.hinh_thuc_hoc import HinhThucHoc

def get_danh_sach(db: Session):
    """Lấy danh sách tất cả hình thức học"""
    return db.query(HinhThucHoc).all()
