from sqlalchemy import Column, Integer, String, NVARCHAR, Boolean, SmallInteger
from app.models.base import Base

class TuDienBienSo(Base):
    __tablename__ = "tbl_HETHONG_TuDienBienSo"

    ID = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    NhomBien = Column(SmallInteger, nullable=False)
    TenHienThi = Column(NVARCHAR(100), nullable=False)
    MaBienSo = Column(String(100), nullable=False)
    ThuTuHienThi = Column(Integer, nullable=False, default=0)
    GhiChu = Column(NVARCHAR(255), nullable=True)
    TrangThai = Column(Boolean, nullable=False, default=True)
