const apiLopHocPhanChinhQuy = {
  // Lấy danh sách cấu hình cột từ API
  async getColumnsConfig() {
    try {
      const response = await fetch(
        `${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/CQ_NhomLopHocPhan`,
        { credentials: "same-origin" },
      );
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy cấu hình cột:", error);
      return [];
    }
  },

  async getNhomLopData(namTaiChinh = null, trang_thai_loc = null) {
    try {
      let url = `${window.API_PREFIX}/cq-nhom-lop-hoc-phan/`;
      const params = new URLSearchParams();
      if (namTaiChinh !== null) params.append("nam_tai_chinh", namTaiChinh);
      if (trang_thai_loc !== null)
        params.append("trang_thai_loc", trang_thai_loc);

      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }

      const response = await fetch(url, { credentials: "same-origin" });
      if (!response.ok) throw new Error("Network response was not ok");
      return await response.json();
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu danh sách:", error);
      return [];
    }
  },

  async getHinhThucHoc() {
    const response = await fetch(`${window.API_PREFIX}/hinh-thuc-hoc/`, {
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Không thể lấy danh sách hình thức học");
    return await response.json();
  },

  async getHinhThucDay() {
    const response = await fetch(`${window.API_PREFIX}/hinh-thuc-day/`, {
      credentials: "same-origin",
    });
    if (!response.ok) throw new Error("Không thể lấy danh sách hình thức dạy");
    return await response.json();
  },

  async bulkUpdateNhomLop(payload) {
    const response = await fetch(
      `${window.API_PREFIX}/cq-nhom-lop-hoc-phan/bulk-update`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Lỗi khi lưu thay đổi");
    }
    return await response.json();
  },

  async confirmNhomLopHocPhan(listMa, namTaiChinh) {
    const response = await fetch(
      `${window.API_PREFIX}/cq-nhom-lop-hoc-phan/xac-nhan-hang-loat?nam_tai_chinh=${encodeURIComponent(namTaiChinh)}`,
      {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ma_nhom_lop_hp_list: listMa }),
      },
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || "Lỗi khi xác nhận hàng loạt");
    }
    return await response.json();
  },
};
