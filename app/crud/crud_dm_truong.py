from sqlalchemy.orm import Session
from app.models.he_thong_dm_truong_duoc_su_dung import DMTruongSuDung

def get_columns_by_table(db: Session, table_name: str):
    return db.query(DMTruongSuDung).filter(
        DMTruongSuDung.TenBang == table_name,
        DMTruongSuDung.HienThi == True
    ).order_by(DMTruongSuDung.ThuTuHienThi).all()
