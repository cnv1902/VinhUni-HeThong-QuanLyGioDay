from sqlalchemy.orm import Session
from app.models.he_thong_tu_dien_bien_so import TuDienBienSo

def get_danh_sach(db: Session):
    """Lấy danh sách tất cả các từ điển biến số quy đổi"""
    return db.query(TuDienBienSo).all()