from sqlalchemy.orm import Session, joinedload
from app.models.he_thong_truong_hop_cong_thuc import HeThongTruongHopCongThuc
from app.schemas.he_thong_truong_hop_cong_thuc import TruongHopCongThucCreate, TruongHopCongThucUpdate

def get_by_id(db: Session, id_truong_hop: int):
    """Lấy chi tiết 1 cấu hình trường hợp công thức"""
    return db.query(HeThongTruongHopCongThuc).filter(HeThongTruongHopCongThuc.ID_TruongHop_CT == id_truong_hop).first()

def get_danh_sach_theo_nhom(db: Session, id_nhom_ct: int):
    """Lấy danh sách trường hợp công thức thuộc về 1 nhóm công thức"""
    return db.query(HeThongTruongHopCongThuc).options(
        joinedload(HeThongTruongHopCongThuc.hinh_thuc_day)
    ).filter(HeThongTruongHopCongThuc.ID_Nhom_CT == id_nhom_ct).all()

def create(db: Session, obj_in: TruongHopCongThucCreate):
    """Thêm mới trường hợp công thức"""
    db_obj = HeThongTruongHopCongThuc(
        ID_Nhom_CT=obj_in.ID_Nhom_CT,
        MaHTDay=obj_in.MaHTDay,
        GhiChu_DieuKien=obj_in.GhiChu_DieuKien,
        BieuThuc_JSON=obj_in.BieuThuc_JSON,
        BieuThuc_Text=obj_in.BieuThuc_Text,
        TrangThai=obj_in.TrangThai
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update(db: Session, db_obj: HeThongTruongHopCongThuc):
    """Lưu thay đổi vào CSDL"""
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete(db: Session, db_obj: HeThongTruongHopCongThuc):
    """Xóa cấu hình trường hợp công thức"""
    db.delete(db_obj)
    db.commit()
    return db_obj

def execute_bulk_transaction(
    db: Session,
    id_nhom_ct: int,
    inserts: list,
    deletes: list
):
    """Thực thi thao tác DB (thêm mới, xóa) và commit trong 1 transaction duy nhất bằng Bulk Operations"""
    if inserts:
        insert_dicts = []
        for payload in inserts:
            item_dict = payload.model_dump(exclude_unset=True) if hasattr(payload, "model_dump") else dict(payload)
            item_dict["ID_Nhom_CT"] = id_nhom_ct
            insert_dicts.append(item_dict)
        db.bulk_insert_mappings(HeThongTruongHopCongThuc, insert_dicts)
        
    if deletes:
        delete_ids = [d.ID_TruongHop_CT for d in deletes]
        db.query(HeThongTruongHopCongThuc).filter(HeThongTruongHopCongThuc.ID_TruongHop_CT.in_(delete_ids)).delete(synchronize_session=False)
        
    db.commit()
