from sqlalchemy import Column, Integer, NVARCHAR, Boolean
from sqlalchemy.orm import relationship
from app.models.base import Base

class HeThongHeSoLopDong(Base):
    __tablename__ = "tbl_HETHONG_HeSoLopDong"

    ID_HeSo_LD = Column(Integer, primary_key=True, autoincrement=True, index=True)
    Ten_HeSo_LD = Column(NVARCHAR(250), nullable=True)
    CauHinh_Json = Column(NVARCHAR, nullable=False)
    TrangThai = Column(Boolean, default=True, nullable=True)
    Is_Delete = Column(Boolean, default=False, nullable=True)

    # Relationships
    truong_hop_cong_thuc = relationship("HeThongTruongHopCongThuc", back_populates="he_so_lop_dong")
