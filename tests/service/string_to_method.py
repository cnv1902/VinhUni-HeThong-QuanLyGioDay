import re
from simpleeval import simple_eval

# ==========================================
# 1. TẦNG MODEL (ĐẠI DIỆN CHO DATABASE)
# ==========================================
class LopHocPhan:
    """
    Class đại diện cho 1 Lớp học phần thực tế trong Database.
    Trong FastAPI/SQLAlchemy, đây sẽ là class kế thừa từ Base.
    """
    def __init__(self, id_lop: str, si_so_dk: int, si_so_cd: int, so_tiet_th: float, he_so_ld: float):
        self.id_lop = id_lop
        
        # --- Các trường dữ liệu đầu vào ---
        self.SiSoDangKyHienTai = si_so_dk
        self.SiSoChuyenDoi = si_so_cd
        self.SoTietTH = so_tiet_th
        self.HeSoLopDong = he_so_ld
        
        # --- Các trường kết quả (Chờ update sau khi tính toán) ---
        self.KhoiLuongQuyDoi = 0.0  # Kết quả cuối cùng
        self.ChiTietTinhToan = {}   # Lưu lại vết (Log) các biến trung gian để đối soát

    def to_calculation_context(self) -> dict:
        """Trích xuất các thuộc tính cần thiết thành Dictionary để ném vào Engine tính toán"""
        return {
            "SiSoDangKyHienTai": self.SiSoDangKyHienTai,
            "SiSoChuyenDoi": self.SiSoChuyenDoi,
            "SoTietTH": self.SoTietTH,
            "HeSoLopDong": self.HeSoLopDong
        }

# ==========================================
# 2. TẦNG ENGINE (LÕI TÍNH TOÁN CÔNG THỨC)
# ==========================================
class CongThucEngine:
    """Class tiện ích chuyên xử lý logic chuỗi công thức động"""
    
    @staticmethod
    def tinh_toan(danh_sach_cong_thuc: list, context_data: dict):
        if not danh_sach_cong_thuc or len(danh_sach_cong_thuc) == 0:
            return 0.0, context_data

        context = context_data.copy()

        def ham_neu(condition, true_val, false_val):
            return true_val if condition else false_val

        allowed_functions = {
            "round": round, "min": min, "max": max,
            "LÀM_TRÒN": round, "NẾU": ham_neu
        }

        ket_qua_cuoi_cung = 0.0

        for step in danh_sach_cong_thuc:
            raw_formula = step.get("raw_formula", "").strip()
            if not raw_formula:
                continue

            # Làm sạch chuỗi
            cleaned_formula = re.sub(r'\[|\]', '', raw_formula)

            try:
                # Phân tách phép gán
                match = re.match(r'^([a-zA-Z0-9_]+)\s*=(?!=)\s*(.*)$', cleaned_formula)
                
                if match:
                    var_name = match.group(1).strip()
                    expression = match.group(2).strip()
                    
                    step_result = simple_eval(expression, names=context, functions=allowed_functions)
                    context[var_name] = step_result
                    ket_qua_cuoi_cung = step_result
                else:
                    step_result = simple_eval(cleaned_formula, names=context, functions=allowed_functions)
                    ket_qua_cuoi_cung = step_result

            except Exception as e:
                raise ValueError(f"Lỗi cú pháp tại dòng '{raw_formula}': {str(e)}")

        return float(ket_qua_cuoi_cung), context

# ==========================================
# 3. TẦNG SERVICE & MÔ PHỎNG DATABASE
# ==========================================
class MockDatabaseSession:
    """Giả lập session của Database (như db.commit() của SQLAlchemy)"""
    def commit(self):
        print(">> [DATABASE] Đã COMMIT thành công lưu thay đổi vào cơ sở dữ liệu!\n")

class ThanhToanGioDayService:
    def __init__(self, db_session):
        self.db = db_session

    def xu_ly_tinh_toan_lop_hoc_phan(self, lop_obj: LopHocPhan, cong_thuc_json: list):
        print(f"--- Đang xử lý tính toán cho lớp: {lop_obj.id_lop} ---")
        
        # 1. Trích xuất Context từ Đối tượng
        context_data = lop_obj.to_calculation_context()
        
        # 2. Gọi Engine xử lý
        try:
            kq_cuoi, final_context = CongThucEngine.tinh_toan(cong_thuc_json, context_data)
            
            # 3. Cập nhật lại thuộc tính của Đối tượng (Update Object)
            lop_obj.KhoiLuongQuyDoi = kq_cuoi
            lop_obj.ChiTietTinhToan = final_context # Lưu vết để sau này hiển thị lên Web cho Giảng viên xem
            
            print(f"-> Đã cập nhật thuộc tính KhoiLuongQuyDoi = {lop_obj.KhoiLuongQuyDoi}")
            
            # 4. Lưu thay đổi vào DB
            self.db.commit()
            
        except Exception as e:
            print(f"[LỖI] Không thể xử lý lớp {lop_obj.id_lop}: {e}")

# ==========================================
# 4. CHẠY THỬ NGHIỆM (MAIN PROCESS)
# ==========================================
if __name__ == "__main__":
    # 1. Khởi tạo Database Session giả lập
    db = MockDatabaseSession()
    service = ThanhToanGioDayService(db)

    # 2. Lấy danh sách các lớp học phần từ Database (Khởi tạo Object)
    lop_cntt_k61 = LopHocPhan(id_lop="CNTT_K61_01", si_so_dk=80, si_so_cd=5, so_tiet_th=30, he_so_ld=1.2)
    lop_cntt_k62 = LopHocPhan(id_lop="CNTT_K62_02", si_so_dk=35, si_so_cd=0, so_tiet_th=30, he_so_ld=1.0)

    # 3. Kịch bản công thức động (Lấy từ bảng Cấu hình công thức)
    kieu_cong_thuc = [
        {
            "id": "expr_1",
            "raw_formula": "[SoSinhVien] = [SiSoDangKyHienTai] - [SiSoChuyenDoi]",
            "semantic_formula": "[Số SV] = [Sĩ số ĐK] - [Sĩ số CĐ]"
        },
        {
            "id": "expr_2",
            "raw_formula": "[HeSoThucTe] = NẾU([SoSinhVien] > 40, [HeSoLopDong], 1.0)",
            "semantic_formula": "[Hệ số Thực tế] = NẾU([Số SV] > 40, [Hệ số Lớp đông], 1.0)"
        },
        {
            "id": "expr_3",
            "raw_formula": "[SoTietTH] * [HeSoThucTe]",
            "semantic_formula": "[Số tiết TH] * [Hệ số Thực tế]"
        }
    ]

    # 4. Thực thi Service để cập nhật từng lớp
    service.xu_ly_tinh_toan_lop_hoc_phan(lop_cntt_k61, kieu_cong_thuc)
    service.xu_ly_tinh_toan_lop_hoc_phan(lop_cntt_k62, kieu_cong_thuc)

    # 5. Kiểm tra trạng thái Object sau khi chạy
    print("--- KIỂM TRA TRẠNG THÁI OBJECT SAU KHI UPDATE ---")
    print(f"Lớp {lop_cntt_k61.id_lop}: Khối lượng quy đổi = {lop_cntt_k61.KhoiLuongQuyDoi}")
    print(f"Chi tiết biến trung gian sinh ra: {lop_cntt_k61.ChiTietTinhToan.get('SoSinhVien')} SV, Hệ số {lop_cntt_k61.ChiTietTinhToan.get('HeSoThucTe')}\n")
    
    print(f"Lớp {lop_cntt_k62.id_lop}: Khối lượng quy đổi = {lop_cntt_k62.KhoiLuongQuyDoi}")
    print(f"Chi tiết biến trung gian sinh ra: {lop_cntt_k62.ChiTietTinhToan.get('SoSinhVien')} SV, Hệ số {lop_cntt_k62.ChiTietTinhToan.get('HeSoThucTe')}")