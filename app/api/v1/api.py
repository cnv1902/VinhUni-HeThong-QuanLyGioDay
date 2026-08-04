from fastapi import APIRouter
from app.api.v1.endpoints import users, config, cq_nhom_lop_hoc_phan, hoc_ky

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["Người dùng"])
api_router.include_router(config.router, prefix="/config", tags=["Cấu hình hệ thống"])
api_router.include_router(cq_nhom_lop_hoc_phan.router, prefix="/cq-nhom-lop-hoc-phan", tags=["Nhóm lớp học phần"])
api_router.include_router(hoc_ky.router, prefix="/hoc-ky", tags=["Học kỳ"])