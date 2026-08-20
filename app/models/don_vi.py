from sqlalchemy import Column, String, Integer, SmallInteger
from app.models.base import Base

class DonVi(Base):
    __tablename__ = "tbl_DonVi"

    MaDonVi = Column(String(20), primary_key=True, index=True)
    TenDonVi = Column(String(121), nullable=True)
    ThuTu = Column(Integer, nullable=True)
    HienThi = Column(Integer, nullable=True)
    Cap = Column(SmallInteger, nullable=True)
    ParentID = Column(String(20), nullable=True)
    LDV_ID = Column(Integer, nullable=True)