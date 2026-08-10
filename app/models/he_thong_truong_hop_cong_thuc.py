from sqlalchemy import Column, Integer, String, NVARCHAR, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base

class HeThongTruongHopCongThuc(Base):
    __tablename__ = "tbl_HETHONG_TruongHopCongThuc"

    ID_TruongHop_CT = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ID_Nhom_CT = Column(Integer, ForeignKey("tbl_HETHONG_NhomCongThuc.ID_Nhom_CT", ondelete="CASCADE"), nullable=False)
    TenTruongHop = Column(NVARCHAR(200), nullable=False)
    MaHTDay = Column(Integer, ForeignKey("tbl_HinhThucDay.MaHTDay"), nullable=True)
    GhiChu_DieuKien = Column(NVARCHAR(255), nullable=True)
    
    # KHỐI CÔNG THỨC JSON
    BieuThuc_HeSoNhan_JSON = Column(NVARCHAR, nullable=True)
    BieuThuc_DieuChinhDauVao_JSON = Column(NVARCHAR, nullable=True)
    BieuThuc_QuyDoi_JSON = Column(NVARCHAR, nullable=True)
    
    TrangThai = Column(Boolean, default=True, nullable=True)

    # Relationships
    nhom_cong_thuc = relationship("HeThongNhomCongThuc", back_populates="truong_hop_cong_thuc")
