from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, BigInteger
from app.models.base import Base

class HinhThucDay(Base):
    __tablename__ = "tbl_HinhThucDay"

    MaHTDay = Column(Integer, primary_key=True, nullable=False)
    TenHTDay = Column(String(50), nullable=True)
    TrangThai = Column(Boolean, nullable=True)
    
    