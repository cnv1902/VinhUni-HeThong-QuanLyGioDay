from sqlalchemy.orm import Session
from app.models.hoc_ky import HocKy

def get_danh_sach_hoc_ky(db: Session):
    """Lấy danh sách tất cả năm tài chính, sắp xếp theo năm tài chính giảm dần"""
    rows = (
        db.query(HocKy.NamTaiChinh)
        .filter(HocKy.NamTaiChinh.isnot(None))
        .distinct()
        .order_by(HocKy.NamTaiChinh.desc())
        .all()
    )
    return [row[0] for row in rows]
