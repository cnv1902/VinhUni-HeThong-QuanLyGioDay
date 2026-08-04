const apiLopHocPhan = {
  // Lấy danh sách cấu hình cột từ API
  async getColumnsConfig() {
    try {
      const response = await fetch(`${window.API_PREFIX}/config/columns/CQ_NhomLopHocPhan`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình cột:', error);
      return [];
    }
  },

  // Lấy dữ liệu danh sách nhóm lớp, có thể truyền ma_hoc_ky
  async getNhomLopData(ma_hoc_ky = null) {
    try {
      let url = `${window.API_PREFIX}/cq-nhom-lop-hoc-phan/`;
      if (ma_hoc_ky !== null) {
        url += `?ma_hoc_ky=${ma_hoc_ky}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh sách:', error);
      return [];
    }
  }
};

