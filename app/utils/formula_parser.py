import json
import re
from typing import Dict, Any
from app.core.logger import app_logger as logger

try:
    from simpleeval import simple_eval, DEFAULT_FUNCTIONS
except ImportError:
    # Fallback to safe subset if simpleeval is not installed yet
    simple_eval = None
    DEFAULT_FUNCTIONS = {}

def parse_he_so_lop_dong(so_sinh_vien: int, cau_hinh_json: str) -> float:
    """
    Tìm công thức hệ số lớp đông từ CauHinh_Json dựa vào SoSinhVien và trả về giá trị Hệ số (float).
    """
    if not cau_hinh_json:
        return 0.0
        
    try:
        configs = json.loads(cau_hinh_json)
        
        for config in configs:
            min_val = config.get("min")
            max_val = config.get("max")
            formula = config.get("formula")
            
            if min_val is None or formula is None:
                continue
                
            # Kiểm tra min <= so_sinh_vien <= max (hoặc max = null)
            if so_sinh_vien >= min_val:
                if max_val is None or so_sinh_vien <= max_val:
                    # Lấy được công thức. Ví dụ: "[SoSinhVien]*0.1" hoặc "1.5"
                    formula_str = str(formula).replace("[SoSinhVien]", str(so_sinh_vien))
                    formula_str = formula_str.replace("[Số SV]", str(so_sinh_vien))
                    
                    if simple_eval:
                        return float(simple_eval(formula_str))
                    else:
                        # Fallback nguy hiểm, chỉ dùng tạm thời
                        return float(eval(formula_str, {"__builtins__": None}))
                        
        return 0.0
    except Exception as e:
        logger.error(f"Lỗi parse_he_so_lop_dong: {e}")
        return 0.0

def evaluate_formula_json(bieu_thuc_json: str, context_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Nhận mảng JSON các công thức, tính toán và trả về Dictionary chứa các giá trị mới.
    """
    if not bieu_thuc_json:
        return {}
        
    results = {}
    try:
        formulas = json.loads(bieu_thuc_json)
        
        # Cấu hình hàm mở rộng cho simpleeval
        my_functions: Dict[str, Any] = DEFAULT_FUNCTIONS.copy() if simple_eval else {}
        my_functions["ROUND"] = round
        my_functions["IF"] = lambda cond, t, f: t if cond else f
        my_functions["IIF"] = lambda cond, t, f: t if cond else f
        
        for item in formulas:
            raw_formula = item.get("raw_formula")
            if not raw_formula or "=" not in raw_formula:
                continue
                
            # Phân tách: [SoTietLTQD] = ROUND([SoTietLT] * [HeSo_LopDong], 2)
            parts = raw_formula.split("=", 1)
            target_col = parts[0].strip().strip("[]")
            expression = parts[1].strip()
            
            # Thay thế tất cả các biến có dạng [TenBien] thành giá trị tương ứng trong context_data
            def replace_var(match):
                var_name = match.group(1)
                val = context_data.get(var_name, 0)
                if val is None:
                    val = 0
                return str(val)
                
            expression_clean = re.sub(r'\[([^\]]+)\]', replace_var, expression)
            
            # Tính toán
            if simple_eval:
                val = simple_eval(expression_clean, functions=my_functions)
            else:
                # Fallback, có rủi ro nếu có hàm IF, ROUND không tự ánh xạ trong Python eval (phải thêm namespace)
                # DO NOT run eval with dangerous expressions
                val = eval(expression_clean, {"__builtins__": None}, {"ROUND": round, "IF": lambda cond, t, f: t if cond else f})
                
            results[target_col] = val
            # Update lại context_data ngay lập tức để các công thức bên dưới có thể dùng biến vừa tính
            context_data[target_col] = val
            
    except Exception as e:
        logger.error(f"Lỗi evaluate_formula_json: {e}")
        
    return results
