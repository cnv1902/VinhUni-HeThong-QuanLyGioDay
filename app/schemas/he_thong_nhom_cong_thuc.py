from pydantic import BaseModel, ConfigDict
from typing import Optional, List

class NhomCongThucBase(BaseModel):
    ID_He: int
    TuNam: int
    DenNam: Optional[int] = None
    GhiChu_DieuKien: Optional[str] = None
    TrangThai: Optional[bool] = True

class NhomCongThucCreate(NhomCongThucBase):
    DsMaHTHoc: str # Chuỗi danh sách hình thức học từ giao diện (VD: ",1,12,")

class NhomCongThucUpdate(BaseModel):
    ID_He: Optional[int] = None
    TuNam: Optional[int] = None
    DenNam: Optional[int] = None
    GhiChu_DieuKien: Optional[str] = None
    TrangThai: Optional[bool] = None
    DsMaHTHoc: Optional[str] = None

class NhomCongThucResponse(NhomCongThucBase):
    ID_Nhom_CT: int
    DsMaHTHoc: str
    
    # Các trường mở rộng để hiển thị tên thay vì ID
    Ten_HeDaoTao: Optional[str] = None
    Ds_TenHTHoc: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TruongHopCongThucItem(BaseModel):
    ID_TruongHop_CT: Optional[int] = None
    ID_HeSo_LD: Optional[int] = None
    MaHTDay: Optional[int] = None
    BieuThuc_JSON: Optional[str] = None
    BieuThuc_Text: Optional[str] = None
    TrangThai: Optional[bool] = True

class NhomCongThucBulkUpdate(BaseModel):
    truong_hop_cong_thuc: List[TruongHopCongThucItem]
