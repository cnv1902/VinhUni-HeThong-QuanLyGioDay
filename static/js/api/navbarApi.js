const apiNavbar = {
  /**
   * Lấy danh sách học kỳ năm học từ máy chủ
   * @returns {Promise<Array>} Mảng dữ liệu học kỳ
   */
  async getNamTaiChinhList() {
    try {
      const response = await fetch(`${window.API_PREFIX}/nam-tai-chinh/`);
      if (!response.ok) throw new Error('Không thể lấy danh sách năm tài chính');
      return await response.json();
    } catch (error) {
      console.error('Lỗi API getNamTaiChinhList:', error);
      return [];
    }
  }
};
