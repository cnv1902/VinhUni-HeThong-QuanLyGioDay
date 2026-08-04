from fastapi import APIRouter
from app.api.v1.endpoints import users, config, cq_nhom_lop_hoc_phan

api_router = APIRouter()
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(config.router, prefix="/config", tags=["config"])
api_router.include_router(cq_nhom_lop_hoc_phan.router, prefix="/cq-nhom-lop-hoc-phan", tags=["nhom_lop_hoc_phan"])
