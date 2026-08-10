from sqlalchemy import Column, String, Integer, Boolean, NVARCHAR
from app.models.base import Base

class HocKyHocPhan(Base):
    __tablename__ = "tbl_HocKyHocPhan"

    MaHocKy = Column(Integer, primary_key=True, nullable=False)
    TenHocKy = Column(NVARCHAR(50), nullable=True)