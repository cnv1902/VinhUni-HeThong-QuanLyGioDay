import re
from simpleeval import simple_eval

def tinh_toan_chuoi_cong_thuc_dong(danh_sach_cong_thuc: list, thong_tin_lop_hoc_phan: dict):
    """
    Hàm xử lý một mảng các phép tính theo thứ tự từ trên xuống dưới.
    - Hỗ trợ phép gán (Ví dụ: [A] = [B] + [C])
    - Hỗ trợ kế thừa biến trung gian qua từng dòng.
    - Hỗ trợ các hàm tiếng Việt từ UI (LÀM_TRÒN, NẾU).
    """
    if not danh_sach_cong_thuc or len(danh_sach_cong_thuc) == 0:
        return 0.0, thong_tin_lop_hoc_phan

    # 1. Khởi tạo Context (Bảng không gian tên)
    # Context này sẽ đóng vai trò như bộ nhớ RAM, lưu trữ kết quả của dòng trên để dòng dưới dùng
    context = thong_tin_lop_hoc_phan.copy()

    # 2. Định nghĩa các hàm tùy chỉnh (Map từ UI sang Python)
    def ham_neu(condition, true_val, false_val):
        return true_val if condition else false_val

    allowed_functions = {
        "round": round,
        "min": min,
        "max": max,
        "LÀM_TRÒN": round,   # Hỗ trợ hàm từ giao diện
        "NẾU": ham_neu       # Hỗ trợ hàm logic từ giao diện
    }

    ket_qua_cuoi_cung = 0.0

    # 3. Vòng lặp duyệt qua từng dòng công thức theo thứ tự
    for step in danh_sach_cong_thuc:
        raw_formula = step.get("raw_formula", "").strip()
        if not raw_formula:
            continue

        # BƯỚC 3.1: Tiền xử lý (Làm sạch chuỗi)
        # Loại bỏ ngoặc vuông [...] sinh ra từ giao diện
        # Ví dụ: "[SoSinhVien] = [SiSoDangKyHienTai] + [SiSoChuyenDoi]" -> "SoSinhVien = SiSoDangKyHienTai + SiSoChuyenDoi"
        cleaned_formula = re.sub(r'\[|\]', '', raw_formula)

        try:
            # BƯỚC 3.2: Phân tách phép gán (Assignment)
            # Dùng Regex để tìm các chuỗi có dạng "Biến = Biểu thức"
            # (?!=) giúp đảm bảo không bị nhầm lẫn với toán tử so sánh "=="
            match = re.match(r'^([a-zA-Z0-9_]+)\s*=(?!=)\s*(.*)$', cleaned_formula)
            
            if match:
                # Nếu đây là một phép gán
                var_name = match.group(1).strip()
                expression = match.group(2).strip()
                
                # Đánh giá biểu thức bên phải dấu =
                step_result = simple_eval(expression, names=context, functions=allowed_functions)
                
                # CẬP NHẬT CONTEXT: Lưu biến mới vào từ điển để các dòng sau có thể lấy ra dùng
                context[var_name] = step_result
                ket_qua_cuoi_cung = step_result
                
            else:
                # Nếu không có phép gán (Ví dụ dòng cuối cùng chốt kết quả: "SoSinhVien * HeSoLopDong")
                step_result = simple_eval(cleaned_formula, names=context, functions=allowed_functions)
                ket_qua_cuoi_cung = step_result

        except Exception as e:
            raise ValueError(f"Lỗi cú pháp tại dòng '{raw_formula}': {str(e)}")

    # Trả về kết quả cuối cùng và toàn bộ Context để dễ dàng Debug
    return float(ket_qua_cuoi_cung), context


if __name__ == "__main__":
    # Dữ liệu thực tế truyền vào từ Database
    data_lop = {
        "SiSoDangKyHienTai": 80,
        "SiSoChuyenDoi": 5,
        "SoTietTH": 30,
        "HeSoLopDong": 1.2
    }

    # Kịch bản Test 1: Chuỗi công thức nhiều dòng, có sinh biến trung gian
    cong_thuc_json = [
        {
            "id":"expr_1786446010846",
            "raw_formula":"[SoSinhVien]=[SiSoDangKyHienTai] - [SiSoChuyenDoi]",
            "semantic_formula":"[Số SV]=[Sĩ số ĐK] - [Sĩ số CĐ]"
        }
    ]

    print("--- TEST CHẠY CÔNG THỨC TUẦN TỰ ---")
    try:
        kq, final_context = tinh_toan_chuoi_cong_thuc_dong(cong_thuc_json, data_lop)
        print(f"Kết quả tiền lương quy đổi: {kq}")
        
        print("\n--- BỘ NHỚ TRẠNG THÁI (CONTEXT) SAU KHI CHẠY ---")
        for key, value in final_context.items():
            print(f"Biến {key}: {value}")
            
    except Exception as e:
        print(f"Xảy ra lỗi: {e}")