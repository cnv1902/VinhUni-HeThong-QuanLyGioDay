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

  // Lấy dữ liệu danh sách công thức (chỉ lọc theo hệ đào tạo và trạng thái)
  async getCongThucData(id_he = null, trang_thai = null) {
    try {
      let url = `${window.API_PREFIX}/nhom-cong-thuc/`;
      const params = new URLSearchParams();
      
      let hasFilter = false;
      if (id_he !== null && id_he !== '') { params.append('id_he', id_he); hasFilter = true; }
      if (trang_thai !== null && trang_thai !== '') { params.append('trang_thai', trang_thai); hasFilter = true; }
      
      if (hasFilter) {
        url = `${window.API_PREFIX}/nhom-cong-thuc/?${params.toString()}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu danh sách:', error);
      return [];
    }
  },

  // Lấy danh sách hình thức dạy
  async getHinhThucDay() {
    try {
      const response = await fetch(`${window.API_PREFIX}/hinh-thuc-day/`);
      if (!response.ok) {
        throw new Error('Lỗi khi lấy danh sách hình thức dạy');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi khi lấy hình thức dạy:', error);
      return [];
    }
  },

  // Tạo mới một nhóm công thức
  async createNhomCongThuc(payload) {
    try {
      const response = await fetch(`${window.API_PREFIX}/nhom-cong-thuc/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Lỗi khi tạo nhóm công thức');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi API createNhomCongThuc:', error);
      throw error;
    }
  },

  // Cập nhật nhóm công thức
  async updateNhomCongThuc(id, payload) {
    try {
      const response = await fetch(`${window.API_PREFIX}/nhom-cong-thuc/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Lỗi khi cập nhật nhóm công thức');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi API updateNhomCongThuc:', error);
      throw error;
    }
  },

  // Xóa nhóm công thức
  async deleteNhomCongThuc(id) {
    try {
      const response = await fetch(`${window.API_PREFIX}/nhom-cong-thuc/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Lỗi khi xóa nhóm công thức');
      }
      return await response.json();
    } catch (error) {
      console.error('Lỗi API deleteNhomCongThuc:', error);
      throw error;
    }
  },

  // Lấy danh sách biến số (từ điển) cho FormulaBuilder
  async getTuDienBienSo() {
    try {
      // Tạm gọi endpoint theo yêu cầu, nếu chưa có thật thì có thể fallback mock data
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/tu-dien-bien-so`);
      if (!response.ok) throw new Error('Network response was not ok');
      return await response.json();
    } catch (error) {
      console.error('Không thể lấy từ điển biến số:', error);
      return [];
    }
  },

  async getHocKy() {
    try {
      const response = await fetch('/api/v1/hoc-ky/');
      if (!response.ok) throw new Error('Lỗi lấy học kỳ');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getHeDaoTao() {
    try {
      const response = await fetch('/api/v1/he-dao-tao/');
      if (!response.ok) throw new Error('Lỗi lấy hệ đào tạo');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getHinhThucHoc() {
    try {
      const response = await fetch('/api/v1/hinh-thuc-hoc/');
      if (!response.ok) throw new Error('Lỗi lấy hình thức học');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  },

  async getTuDienBienSo(id_he = 1, trang_thai = 1) {
    try {
      const params = new URLSearchParams();
      if (id_he !== null && id_he !== '') params.append('id_he', id_he);
      if (trang_thai !== null && trang_thai !== '') params.append('trang_thai', trang_thai);
      
      const response = await fetch(`${window.API_PREFIX}/cau-hinh-chung/tu-dien-bien-so?${params.toString()}`);
      if (!response.ok) throw new Error('Lỗi lấy từ điển biến số');
      return await response.json();
    } catch (error) {
      console.error(error);
      return [];
    }
  }
};
