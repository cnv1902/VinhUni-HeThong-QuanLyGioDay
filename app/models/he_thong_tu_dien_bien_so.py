from sqlalchemy import Column, Integer, String, NVARCHAR, Boolean, SmallInteger, ForeignKey
from app.models.base import Base

class TuDienBienSo(Base):
    __tablename__ = "tbl_HETHONG_TuDienBienSo"

    ID = Column(Integer, primary_key=True, autoincrement=True, nullable=False)
    ID_He = Column(Integer, ForeignKey("tbl_HeThong_DMHeDaoTao.ID_He"), nullable=False, default=1)
    NhomBien = Column(NVARCHAR(250), nullable=False)
    TenHienThi = Column(NVARCHAR(100), nullable=False)
    MaBienSo = Column(String(100), nullable=False)
    ThuTuHienThi = Column(Integer, nullable=False, default=0)
    GhiChu = Column(NVARCHAR(255), nullable=True)
    TrangThai = Column(Boolean, nullable=False, default=True)
