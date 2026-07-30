from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_users():
    return [{"id": 1, "username": "admin", "email": "admin@example.com"}]
