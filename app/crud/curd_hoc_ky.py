from sqlalchemy.orm import Session
from app.models.hoc_ky import HocKy

def get_danh_sach(db:Session):
    """Lấy danh sách tất cả học kỳ, sắp xếp theo mã học kỳ giảm dần"""
    return db.query(HocKy).order_by(HocKy.MaHocKy.desc()).all()