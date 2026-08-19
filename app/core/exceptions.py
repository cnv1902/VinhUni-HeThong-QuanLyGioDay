from fastapi import HTTPException, status

class NotFoundException(HTTPException):
    def __init__(self, detail: str = "Tài nguyên không tồn tại"):
        super().__init__(status_code=status.HTTP_404_NOT_FOUND, detail=detail)

class BadRequestException(HTTPException):
    def __init__(self, detail: str = "Yêu cầu không hợp lệ"):
        super().__init__(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)

class ConflictException(HTTPException):
    def __init__(self, detail: str = "Yêu cầu xung đột với trạng thái dữ liệu hiện tại"):
        super().__init__(status_code=status.HTTP_409_CONFLICT, detail=detail)

class CredentialsException(HTTPException):
    def __init__(self, detail: str = "Token không hợp lệ hoặc đã hết hạn"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=detail,
            headers={"WWW-Authenticate": "Bearer"},
        )

class PermissionDeniedException(HTTPException):
    def __init__(self, detail: str = "Bạn không có quyền thực hiện hành động này"):
        super().__init__(status_code=status.HTTP_403_FORBIDDEN, detail=detail)
