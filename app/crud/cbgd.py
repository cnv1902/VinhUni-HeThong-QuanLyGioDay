from sqlalchemy.orm import Session
from app.models.cbgd_all import CbgdAll

def get_cbgd_by_hs_id(db: Session, hs_id: int):
    return db.query(CbgdAll).filter(CbgdAll.HS_ID == hs_id).first()
