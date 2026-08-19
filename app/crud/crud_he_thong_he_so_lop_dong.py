from sqlalchemy.orm import Session
from app.models.he_thong_he_so_lop_dong import HeThongHeSoLopDong
from app.schemas.he_thong_he_so_lop_dong import HeSoLopDongCreate

def get_by_id(db: Session, id_he_so_ld: int):
    """Lấy chi tiết 1 cấu hình hệ số lớp đông"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.ID_HeSo_LD == id_he_so_ld).first()

def get_all(db: Session):
    """Lấy danh sách tất cả hệ số lớp đông (không bị xóa)"""
    return db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.Is_Delete == False).all()

def create(db: Session, obj_in: HeSoLopDongCreate):
    """Thêm mới mốc hệ số lớp đông"""
    db_obj = HeThongHeSoLopDong(
        Ten_HeSo_LD=obj_in.Ten_HeSo_LD,
        CauHinh_Json=obj_in.CauHinh_Json,
        TrangThai=obj_in.TrangThai,
        Is_Delete=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: HeThongHeSoLopDong):
    """Lưu thay đổi vào CSDL"""
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, db_obj: HeThongHeSoLopDong):
    """Xóa hệ số lớp đông (Soft Delete)"""
    db_obj.Is_Delete = True # type: ignore
    db.commit()
    return db_obj

def execute_bulk_transaction(
    db: Session, 
    inserts: list,
    deletes: list
):
    """Thực thi thao tác DB (thêm mới, sửa) trong 1 transaction duy nhất bằng Bulk Operations"""
    if inserts:
        insert_dicts = []
        for payload in inserts:
            # Lấy dict từ Pydantic schema hoặc dict thuần
            item_dict = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else dict(payload)
            item_dict["Is_Delete"] = False
            insert_dicts.append(item_dict)
        db.bulk_insert_mappings(HeThongHeSoLopDong, insert_dicts)
        
    if deletes:
        delete_ids = [d.ID_HeSo_LD for d in deletes]
        db.query(HeThongHeSoLopDong).filter(HeThongHeSoLopDong.ID_HeSo_LD.in_(delete_ids)).update(
            {HeThongHeSoLopDong.Is_Delete: True}, synchronize_session=False
        )
        
    db.commit()
