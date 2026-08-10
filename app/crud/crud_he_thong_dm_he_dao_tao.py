from sqlalchemy.orm import Session
from app.models.he_thong_dm_he_dao_tao import HeThongDMHeDaoTao

def get_danh_sach(db: Session):
    """Lấy danh sách tất cả hệ đào tạo"""
    return db.query(HeThongDMHeDaoTao).all()
