from simpleeval import simple_eval

def tinh_toan_cong_thuc_dong(chuoi_cong_thuc: str, thong_tin_lop_hoc_phan: dict) -> float:
    """
    chuoi_cong_thuc: Ví dụ "round(SiSoDKH * (SoTietTH / 15/1.5), 3)"
    thong_tin_lop_hoc_phan: Dictionary chứa dữ liệu thực tế của lớp từ Database lên
    """
    if not chuoi_cong_thuc or chuoi_cong_thuc.strip() == "":
        return 0.0 # Nếu không có công thức thì trả về 0

    try:
        # 1. Khai báo các hàm toán học hỗ trợ sẵn nếu công thức có dùng (như round, min, max)
        allowed_functions = {
            "round": round,
            "min": min,
            "max": max
        }

        # 2. Xây dựng Ngữ cảnh (Context): 
        # Đưa trực tiếp dictionary dữ liệu lớp vào làm môi trường biến số.
        # Lúc này, khi chuỗi string gặp chữ "SiSoDKH", bộ phân tích sẽ tự tra trong dictionary này và lấy đúng giá trị số.
        context = thong_tin_lop_hoc_phan.copy()

        # 3. Tiến hành đánh giá biểu thức string
        ket_qua = simple_eval(chuoi_cong_thuc, names=context, functions=allowed_functions)
        
        return float(ket_qua)

    except Exception as e:
        # Bắt lỗi nếu giáo vụ gõ sai cú pháp công thức (Ví dụ thiếu dấu ngoặc: "SiSoDKH * (SoTietTH")
        raise ValueError(f"Lỗi cú pháp công thức '{chuoi_cong_thuc}': {str(e)}")

if __name__ == "__main__":
    # Dữ liệu mẫu của 1 Lớp học phần (Giả sử được lấy từ Database ra)
    data_lop = {
        "SiSoDKH": 80,         # Sĩ số đăng ký học phần (Số sinh viên chính thức)
        "SiSoMoLop": 75,         # Sĩ số mở lớp thực tế
        "SoTietTH": 30,          # Số tiết Thực hành
        "KhoiLuongLT": 2,        # Số tín chỉ Lý thuyết
        "KhoiLuongTH": 1,        # Số tín chỉ Thực hành
        "SoTietLT": 45           # Số tiết Lý thuyết
    }

    # Công thức mà Giáo vụ đã cài đặt trong DB
    cong_thuc = "round(SiSoDKH * (SoTietTH / 15/1.5), 3)"

    # Gọi hàm tính
    try:
        ket_qua = tinh_toan_cong_thuc_dong(cong_thuc, data_lop)
        print(f"Cong thuc: {cong_thuc}")
        print(f"Ket qua tinh duoc: {ket_qua}")
    except Exception as e:
        print(e)