from sqlalchemy import Column, Integer, String, NVARCHAR, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class HeThongHeSoLopDong(Base):
    __tablename__ = "tbl_HETHONG_HeSoLopDong"

    ID_HeSo_LD = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ID_Nhom_CT = Column(Integer, ForeignKey("tbl_HETHONG_NhomCongThuc.ID_Nhom_CT", ondelete="CASCADE"), nullable=False)
    GiaTri_Min = Column(Integer, nullable=False)
    GiaTri_Max = Column(Integer, nullable=False)
    BieuThuc_HeSoLopDong = Column(NVARCHAR, nullable=False)

    # Relationships
    nhom_cong_thuc = relationship("HeThongNhomCongThuc", back_populates="he_so_lop_dong")
