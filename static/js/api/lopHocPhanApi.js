const apiLopHocPhan = {
  // Lấy danh sách cấu hình cột từ API
  async getColumnsConfig() {
    try {
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/CQ_NhomLopHocPhan`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình cột:', error);
      return [];
    }
  },

  // Lấy dữ liệu danh sách nhóm lớp, truyền hoc_ky
  async getNhomLopData(hoc_ky = null) {
    try {
      let url = `${window.API_PREFIX}/cq-nhom-lop-hoc-phan/`;
      if (hoc_ky !== null) {
        url += `?hoc_ky=${hoc_ky}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh sách:', error);
      return [];
    }
  },

  async getHinhThucHoc() {
    const response = await fetch(`${window.API_PREFIX}/hinh-thuc-hoc/`);
    if (!response.ok) throw new Error('Không thể lấy danh sách hình thức học');
    return await response.json();
  },

  async getHinhThucDay() {
    const response = await fetch(`${window.API_PREFIX}/hinh-thuc-day/`);
    if (!response.ok) throw new Error('Không thể lấy danh sách hình thức dạy');
    return await response.json();
  }
};

