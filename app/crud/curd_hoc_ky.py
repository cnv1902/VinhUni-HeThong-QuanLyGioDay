from sqlalchemy.orm import Session
from app.models.hoc_ky import HocKy

def get_danh_sach_hoc_ky(db: Session):
    """Lấy danh sách tất cả năm tài chính, sắp xếp theo năm tài chính giảm dần"""
    return db.query(HocKy).order_by(HocKy.NamTaiChinh.desc()).all()
