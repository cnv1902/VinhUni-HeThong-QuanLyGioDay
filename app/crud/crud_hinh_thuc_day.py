from sqlalchemy.orm import Session
from app.models.hinh_thuc_day import HinhThucDay

def get_danh_sach(db: Session):
    """Lấy danh sách tất cả hình thức dạy"""
    return db.query(HinhThucDay).all()
