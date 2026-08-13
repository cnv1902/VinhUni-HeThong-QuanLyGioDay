def check_id_in_string_list(id_to_check: str, comma_separated_string: str) -> bool:
    """
    Kiểm tra xem một ID có nằm trong một chuỗi phân cách bởi dấu phẩy hay không.
    Ví dụ: id_to_check = '1', comma_separated_string = ',1,2,3,' -> True
    """
    if not comma_separated_string:
        return False
    
    # Loại bỏ khoảng trắng và tách mảng bằng dấu phẩy
    parts = [p.strip() for p in comma_separated_string.split(',') if p.strip()]
    return id_to_check.strip() in parts
