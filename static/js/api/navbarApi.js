const apiNavbar = {
  /**
   * Lấy danh sách học kỳ năm học từ máy chủ
   * @returns {Promise<Array>} Mảng dữ liệu học kỳ
   */
  async getHocKyList() {
    try {
      const response = await fetch('/api/v1/hoc-ky/');
      if (!response.ok) throw new Error('Không thể lấy danh sách học kỳ');
      return await response.json();
    } catch (error) {
      console.error('Lỗi API getHocKyList:', error);
      return [];
    }
  }
};
