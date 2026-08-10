from sqlalchemy.orm import Session
from app.models.hoc_ky_thanh_toan import HocKyThanhToan
from app.models.hoc_ky_hoc_phan import HocKyHocPhan

def get_danh_sach_hoc_ky_thanh_toan(db: Session):
    """Lấy danh sách tất cả học kỳ thanh toán, sắp xếp theo mã học kỳ giảm dần"""
    return db.query(HocKyThanhToan).order_by(HocKyThanhToan.MaHocKy.desc()).all()

def get_danh_sach_hoc_ky_hoc_phan(db: Session):
    """Lấy danh sách tất cả học kỳ học phần, sắp xếp theo mã học kỳ giảm dần"""
    return db.query(HocKyHocPhan).order_by(HocKyHocPhan.MaHocKy.desc()).all()