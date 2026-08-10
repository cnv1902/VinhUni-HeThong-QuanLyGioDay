from sqlalchemy import Column, Integer, NVARCHAR
from sqlalchemy.orm import relationship
from app.models.base import Base

class HeThongDMHeDaoTao(Base):
    __tablename__ = "tbl_HeThong_DMHeDaoTao"

    ID_He = Column(Integer, primary_key=True, index=True, nullable=False)
    Ten_He = Column(NVARCHAR(50), nullable=True)
    Hieu_Luc = Column(Integer, nullable=True)
    Loai = Column(NVARCHAR(50), nullable=True)

    # Relationships
    nhom_cong_thuc = relationship("HeThongNhomCongThuc", back_populates="he_dao_tao")
