from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.don_vi import DonVi

def get_danh_sach(db: Session) -> List[DonVi]:
    """
    Lấy danh sách đơn vị từ CSDL.
    """
    return db.query(DonVi).filter(DonVi.Cap == 1, DonVi.HienThi == 1, DonVi.LDV_ID != 70).order_by(DonVi.TenDonVi.asc()).all()
