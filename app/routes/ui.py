from fastapi import APIRouter, Request
from fastapi.templating import Jinja2Templates
from app.core.config import settings
import time

router = APIRouter()
templates = Jinja2Templates(directory="app/templates")

# Lưu lại thời điểm server khởi động để làm version
# Giúp trình duyệt cache file tĩnh trọn đời, chỉ tải lại khi server restart (có bản cập nhật mới)
STARTUP_TIME = str(int(time.time()))
templates.env.globals["API_PREFIX"] = settings.API_V1_STR  # type: ignore
templates.env.globals["CACHE_BUSTER"] = lambda: STARTUP_TIME  # type: ignore

@router.get("/", include_in_schema=False)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/index.html"
    )

@router.get("/he_dao_tao_chinh_quy.html", include_in_schema=False)
async def he_dao_tao_chinh_quy(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/he_dao_tao_chinh_quy.html"
    )

@router.get("/quan_ly_nhom_lop_hoc_phan.html", include_in_schema=False)
async def quan_ly_nhom_lop(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/quan_ly_nhom_lop_hoc_phan.html"
    )

@router.get("/danh_muc_truong_duoc_su_dung.html", include_in_schema=False)
async def danh_muc_truong_duoc_su_dung(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/danh_muc_truong_duoc_su_dung.html"
    )

@router.get("/login", include_in_schema=False)
async def login_page(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/login.html"
    )

@router.get("/nhom_cong_thuc_quy_doi.html", include_in_schema=False)
async def cong_thuc_quy_doi(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/admin/nhom_cong_thuc_quy_doi.html"
    )

@router.get("/ca-nhan.html", include_in_schema=False)
async def ca_nhan(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan.html"
    )

@router.get("/ca-nhan.html", include_in_schema=False)
async def ca_nhan(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan.html"
    )

@router.get("/ca-nhan-1.html", include_in_schema=False)
async def ca_nhan_1(request: Request):
    """Route trả về toàn bộ trang HTML ban đầu"""
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_1.html"
    )

@router.post("/ca_nhan_1_fragment", include_in_schema=False)
async def ca_nhan_1_fragment(request: Request):
    data = await request.json()
    hsid = data.get("hsid")
    he = data.get("he")
    
    # Dữ liệu mẫu (test data) phòng trường hợp dưới database chưa có hoặc trả về rỗng
    du_lieu_test = [
    {
        "ten_nhom_lop": "Lập trình Web nâng cao - Nhóm 01",
        "si_so": 45, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "Giảng dạy chính quy", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Cơ sở dữ liệu phân tán - Nhóm 02",
        "si_so": 40, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 6 - 20",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Lập trình Python - Nhóm 03",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "Thực hành phòng máy", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Cấu trúc dữ liệu và giải thuật - Nhóm 01",
        "si_so": 60, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Hệ điều hành - Nhóm 02",
        "si_so": 45, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 5 - 18",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Mạng máy tính - Nhóm 01",
        "si_so": 55, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 14",
        "ghi_chu": "Lớp chất lượng cao", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Kỹ thuật phần mềm - Nhóm 04",
        "si_so": 40, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "An toàn thông tin - Nhóm 01",
        "si_so": 35, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 6 - 19",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Trí tuệ nhân tạo - Nhóm 02",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 4 - 16",
        "ghi_chu": "Chuyên ngành CNTT", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Lập trình di động - Nhóm 01",
        "si_so": 45, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 12",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Phân tích thiết kế hệ thống - Nhóm 03",
        "si_so": 42, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Kiểm thử phần mềm - Nhóm 01",
        "si_so": 38, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 17",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Điện toán đám mây - Nhóm 02",
        "si_so": 46, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 16",
        "ghi_chu": "Học phần tự chọn", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Big Data cơ bản - Nhóm 01",
        "si_so": 35, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 5 - 18",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Thương mại điện tử - Nhóm 02",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Bảo mật ứng dụng Web - Nhóm 01",
        "si_so": 40, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 4 - 17",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Giao diện người dùng UX/UI - Nhóm 01",
        "si_so": 45, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 20, "tiet_thkk": 25, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "Thực hành thiết kế", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Lập trình hướng đối tượng - Nhóm 05",
        "si_so": 55, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Toán rời rạc - Nhóm 02",
        "si_so": 65, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "Lý thuyết thuần túy", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Kiến trúc máy tính - Nhóm 01",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 16",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Đồ họa máy tính - Nhóm 01",
        "si_so": 40, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 25, "tiet_thkk": 20, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 14",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Hệ thống nhúng - Nhóm 02",
        "si_so": 35, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 25, "tiet_thkk": 20, "tiet_btkk": 0, "thoi_gian": "Tuần 5 - 19",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Blockchain cơ bản - Nhóm 01",
        "si_so": 30, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 12",
        "ghi_chu": "Môn học mới", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Xử lý ảnh số - Nhóm 01",
        "si_so": 42, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Thực tập tốt nghiệp - Nhóm 01",
        "si_so": 25, "so_tin_chi": 4, "so_tiet_ct": 60, "hoc_ky": "3",
        "tiet_ltkk": 0, "tiet_thkk": 60, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "Thực tế doanh nghiệp", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Khóa luận tốt nghiệp - Nhóm 02",
        "si_so": 10, "so_tin_chi": 10, "so_tiet_ct": 150, "hoc_ky": "3",
        "tiet_ltkk": 0, "tiet_thkk": 150, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "Hướng dẫn đồ án", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Tiếng Anh chuyên ngành CNTT - Nhóm 01",
        "si_so": 45, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Pháp luật đại cương - Nhóm 08",
        "si_so": 80, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 12",
        "ghi_chu": "Lớp đông sinh viên", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Triết học Mác - Lênin - Nhóm 04",
        "si_so": 75, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Kinh tế chính trị Mác - Lênin - Nhóm 02",
        "si_so": 70, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Chủ nghĩa xã hội khoa học - Nhóm 01",
        "si_so": 60, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 4 - 14",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Lịch sử Đảng Cộng sản Việt Nam - Nhóm 03",
        "si_so": 65, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 13",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Tư tưởng Hồ Chí Minh - Nhóm 02",
        "si_so": 70, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Kỹ năng mềm - Nhóm 05",
        "si_so": 50, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 15, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 6 - 15",
        "ghi_chu": "Hoạt động ngoại khóa", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Phương pháp nghiên cứu khoa học - Nhóm 01",
        "si_so": 45, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Cơ sở dữ liệu nâng cao - Nhóm 01",
        "si_so": 42, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Lập trình Web căn bản - Nhóm 03",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 25, "tiet_thkk": 20, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 14",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Nhập môn Công nghệ thông tin - Nhóm 02",
        "si_so": 60, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 20, "tiet_thkk": 10, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 10",
        "ghi_chu": "Sinh viên năm nhất", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Tin học đại cương - Nhóm 10",
        "si_so": 70, "so_tin_chi": 2, "so_tiet_ct": 30, "hoc_ky": "1",
        "tiet_ltkk": 15, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 15",
        "ghi_chu": "Dành cho khối không chuyên", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Đại số tuyến tính - Nhóm 03",
        "si_so": 65, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Giải tích toán học - Nhóm 04",
        "si_so": 60, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "1",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Vật lý đại cương - Nhóm 02",
        "si_so": 55, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 35, "tiet_thkk": 10, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Xác suất thống kê - Nhóm 01",
        "si_so": 50, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Lý thuyết thông tin - Nhóm 01",
        "si_so": 40, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 45, "tiet_thkk": 0, "tiet_btkk": 0, "thoi_gian": "Tuần 4 - 18",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Mô hình hóa toán học - Nhóm 01",
        "si_so": 35, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 16",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Hệ thống thông tin quản lý - Nhóm 02",
        "si_so": 45, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 15",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Thương mại di động - Nhóm 01",
        "si_so": 38, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 2 - 14",
        "ghi_chu": "", "trang_thai": "Hoàn thành", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Xử lý ngôn ngữ tự nhiên - Nhóm 01",
        "si_so": 30, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 1 - 12",
        "ghi_chu": "Chuyên sâu AI", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thừa", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    },
    {
        "ten_nhom_lop": "Thị giác máy tính - Nhóm 01",
        "si_so": 32, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 3 - 15",
        "ghi_chu": "Chuyên sâu AI", "trang_thai": "Hoàn thành", "tinh_trang": "MienGiam", "hinh_thuc_thanh_toan": "Đã thanh toán"
    },
    {
        "ten_nhom_lop": "Hệ thống phân tán nâng cao - Nhóm 01",
        "si_so": 28, "so_tin_chi": 3, "so_tiet_ct": 45, "hoc_ky": "2",
        "tiet_ltkk": 30, "tiet_thkk": 15, "tiet_btkk": 0, "thoi_gian": "Tuần 5 - 19",
        "ghi_chu": "", "trang_thai": "Đang thực hiện", "tinh_trang": "Kê thiếu", "hinh_thuc_thanh_toan": "Chờ thanh toán"
    }
]
   
    danh_sach_hoc_phan = du_lieu_test 

    return templates.TemplateResponse(
        request=request,
        name="pages/user/ChiTietBacHoc.html",
        context={
            "hsid": hsid, 
            "he": he, 
            "danh_sach": danh_sach_hoc_phan
        }
    )
@router.get("/ca-nhan-2.html", include_in_schema=False)
async def ca_nhan_2(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_2.html"
    )

@router.get("/ca-nhan-3.html", include_in_schema=False)
async def ca_nhan_3(request: Request):
    return templates.TemplateResponse(
        request=request, 
        name="pages/user/ca_nhan_3.html"
    )
