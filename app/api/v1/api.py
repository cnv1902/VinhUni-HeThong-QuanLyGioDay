from fastapi import APIRouter
from app.api.v1.endpoints import users, config, cq_nhom_lop_hoc_phan, hoc_ky, hinh_thuc_day, hinh_thuc_hoc, he_thong_dm_he_dao_tao, he_thong_nhom_cong_thuc, he_thong_he_so_lop_dong, he_thong_truong_hop_cong_thuc

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Người dùng"])
api_router.include_router(config.router, prefix="/cau-hinh-chung", tags=["Cấu hình chung"])
api_router.include_router(hoc_ky.router, prefix="/hoc-ky", tags=["Học kỳ"])
api_router.include_router(cq_nhom_lop_hoc_phan.router, prefix="/cq-nhom-lop-hoc-phan", tags=["Nhóm lớp học phần"])
api_router.include_router(hinh_thuc_day.router, prefix="/hinh-thuc-day", tags=["Hình thức dạy"])
api_router.include_router(hinh_thuc_hoc.router, prefix="/hinh-thuc-hoc", tags=["Hình thức học"])
api_router.include_router(he_thong_dm_he_dao_tao.router, prefix="/he-dao-tao", tags=["Hệ đào tạo"])
api_router.include_router(he_thong_nhom_cong_thuc.router, prefix="/nhom-cong-thuc", tags=["Nhóm công thức"])
api_router.include_router(he_thong_he_so_lop_dong.router, prefix="/he-so-lop-dong", tags=["Hệ số lớp đông"])
api_router.include_router(he_thong_truong_hop_cong_thuc.router, prefix="/truong-hop-cong-thuc", tags=["Trường hợp công thức"])