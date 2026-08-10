from sqlalchemy import Column, Integer, String, NVARCHAR, Boolean, ForeignKey
from app.models.he_thong_truong_hop_cong_thuc import HeThongTruongHopCongThuc
from app.models.he_thong_he_so_lop_dong import HeThongHeSoLopDong
from sqlalchemy.orm import relationship
from app.models.base import Base

class HeThongNhomCongThuc(Base):
    __tablename__ = "tbl_HETHONG_NhomCongThuc"

    ID_Nhom_CT = Column(Integer, primary_key=True, autoincrement=True, index=True)
    ID_He = Column(Integer, ForeignKey("tbl_HeThong_DMHeDaoTao.ID_He"), nullable=False)
    TenNhomCongThuc = Column(NVARCHAR(200), nullable=False)
    DsMaHTHoc = Column(String(100), nullable=False)
    TuMaHocKy = Column(Integer, ForeignKey("tbl_HocKyHocPhan.MaHocKy"), nullable=False) 
    DenMaHocKy = Column(Integer, ForeignKey("tbl_HocKyHocPhan.MaHocKy"), nullable=True) 
    GhiChu_DieuKien = Column(NVARCHAR(255), nullable=True)
    TrangThai = Column(Boolean, default=True, nullable=True)

    # Relationships
    he_dao_tao = relationship("HeThongDMHeDaoTao", back_populates="nhom_cong_thuc")
    truong_hop_cong_thuc = relationship("HeThongTruongHopCongThuc", back_populates="nhom_cong_thuc", cascade="all, delete")
    he_so_lop_dong = relationship("HeThongHeSoLopDong", back_populates="nhom_cong_thuc", cascade="all, delete")
    tu_hoc_ky = relationship("HocKyHocPhan", foreign_keys=[TuMaHocKy])
    den_hoc_ky = relationship("HocKyHocPhan", foreign_keys=[DenMaHocKy])
