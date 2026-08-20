/**
 * Giao tiếp với Backend API Phân quyền chức năng
 */
const apiPhanQuyenChucNang = {
  /**
   * Lấy danh sách chức năng (phân quyền) theo user đang đăng nhập.
   * Token được đọc tự động từ HttpOnly Cookie, không cần truyền tay.
   * @returns {Promise<Array>} Mảng dữ liệu chức năng phẳng
   */
  async getDanhSachChucNang() {
    const response = await fetch("/api/v1/phan-quyen-chuc-nang/", {
      method: "GET",
      credentials: "same-origin",
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      throw new Error("Lỗi khi tải danh sách chức năng");
    }

    return await response.json();
  },
};
