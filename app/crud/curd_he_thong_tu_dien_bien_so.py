from sqlalchemy.orm import Session
from typing import Optional
from app.models.he_thong_tu_dien_bien_so import TuDienBienSo

def get_danh_sach(db: Session):
    """Lấy danh sách tất cả các từ điển biến số quy đổi"""
    return db.query(TuDienBienSo).all()

def get_danh_sach_theo_he_dao_tao_va_trang_thai(db: Session, id_he: Optional[int] = 1, trang_thai: Optional[int] = 1):
    """Lọc từ điển biến số theo hệ đào tạo và trạng thái"""
    query = db.query(TuDienBienSo)
    
    if id_he is None and trang_thai is None:
        return query.all()
        
    if id_he is not None:
        query = query.filter(TuDienBienSo.ID_He == id_he)
        
    if trang_thai is not None:
        query = query.filter(TuDienBienSo.TrangThai == bool(trang_thai))
        
    return query.all()