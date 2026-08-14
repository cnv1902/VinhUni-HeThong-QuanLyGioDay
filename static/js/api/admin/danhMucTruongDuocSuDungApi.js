const apiDanhMucTruongDuocSuDung = {

  async getColumnsConfig() {
    try {
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/HETHONG_DMTruongDuocSuDung`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy cấu hình cột:', error);
      return [];
    }
  },

  // Lấy danh sách các bảng (MaBang)
  async getDanhSachBang() {
    try {
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-bang`);
      if (!response.ok) throw new Error('Không thể lấy danh sách bảng');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách bảng:', error);
      throw error; // Quăng lỗi để bên UI bắt được
    }
  },

  // Lấy danh sách cột theo bảng (hoặc lấy tất cả nếu MaBang = 'all')
  // Dùng API admin để lấy cả các cột đang bị ẩn
  async getDanhSachCot(maBang) {
    try {
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot-admin/${maBang}`);
      if (!response.ok) throw new Error(`Không thể lấy danh sách cột cho bảng ${maBang}`);
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy danh sách cột:', error);
      return [];
    }
  },

  // Bulk update (Global API, nhận mảng payload)
  async bulkUpdateDanhSachCot(payload) {
    const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/bulk-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Lỗi khi lưu thay đổi cấu hình');
    }
    return await response.json();
  }
};
