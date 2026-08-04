from sqlalchemy import Column, String, Integer
from app.models.base import Base

class HinhThucHoc(Base):
    __tablename__ = "tbl_HinhThucHoc"

    MaHTHoc = Column(Integer, primary_key=True, nullable=False)
    TenHTHoc = Column(String(50), nullable=True)
    
    