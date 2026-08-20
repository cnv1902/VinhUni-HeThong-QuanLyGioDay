const apiNavbar = {
  /**
   * Lấy danh sách học kỳ năm học từ máy chủ
   * @returns {Promise<Array>} Mảng dữ liệu học kỳ
   */
  async getNamTaiChinhList() {
    try {
      const response = await fetch(`${window.API_PREFIX}/nam-tai-chinh/`, {
        credentials: "same-origin",
      });
      if (!response.ok)
        throw new Error("Không thể lấy danh sách năm tài chính");
      return await response.json();
    } catch (error) {
      console.error("Lỗi API getNamTaiChinhList:", error);
      return [];
    }
  },

  /**
   * Lấy thông tin cán bộ giảng dạy hiện tại (theo token)
   */
  async getCurrentUserCbgd() {
    try {
      const response = await fetch(
        `${window.API_PREFIX}/can-bo-giang-day/full-name`,
        { credentials: "same-origin" },
      );
      if (!response.ok) throw new Error("Không thể lấy thông tin cán bộ");
      return await response.json();
    } catch (error) {
      console.error("Lỗi API getCurrentUserCbgd:", error);
      return null;
    }
  },
};
