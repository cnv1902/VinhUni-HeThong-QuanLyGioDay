const apiCongThuc = {
  // Lấy danh sách cấu hình cột từ API
  async getColumnsConfig() {
    try {
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/HETHONG_NhomCongThuc`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình cột:', error);
      return [];
    }
  },

  // Lấy dữ liệu danh sách công thức, truyền chuỗi hocky_namhoc
  async getCongThucData(hocky_namhoc = null) {
    try {
      let url = `${window.API_PREFIX}/nhom-cong-thuc/`;
      if (hocky_namhoc !== null) {
        url += `?hocky_namhoc=${hocky_namhoc}`;
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
