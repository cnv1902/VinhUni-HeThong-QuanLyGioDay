from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.view_can_bo_ho_so import ViewCanBoHoSo


def get_cbgd_by_hs_id(db: Session, hs_id: int):
    return db.query(ViewCanBoHoSo).filter(ViewCanBoHoSo.HS_ID == hs_id).first()


def get_cbgd_by_ma_don_vi(db: Session, ma_don_vi: str):
    """
    Lấy danh sách cán bộ theo mã đơn vị:
    WHERE LEFT([DV_ID_BienChe], 4) + '00' = ma_don_vi
    ORDER BY [HS_Ten], [HS_Ho]
    """
    return (
        db.query(ViewCanBoHoSo)
        .filter((func.left(ViewCanBoHoSo.DV_ID_BienChe, 4) + "00") == ma_don_vi)
        .order_by(ViewCanBoHoSo.HS_Ten.asc(), ViewCanBoHoSo.HS_Ho.asc())
        .all()
    )