/**
 * API Layer — Phân Quyền Xác Nhận Khối Lượng Giảng Dạy
 * Đường dẫn: static/js/api/admin/phanQuyenXacNhanApi.js
 *
 * Tất cả lời gọi fetch() của trang này được tập trung tại đây.
 * UI Layer (phan_quyen_xac_nhan.js) CHỈ được gọi các hàm trong object này,
 * tuyệt đối không nhúng fetch() trực tiếp vào file UI.
 */
const phanQuyenXacNhanApi = {
  /**
   * Lấy cấu hình cột cho bảng Danh sách Phân Quyền Hiện Tại.
   * TODO: Thay tên bảng 'HETHONG_PhanQuyenXacNhan' bằng tên view/table thực tế.
   * @returns {Promise<Array>} Mảng object cấu hình cột.
   */
  async getColumnsConfig() {
    try {
      const res = await fetch(
        `${window.API_PREFIX}/cau-hinh-chung/danh-sach-cot/HETHONG_PhanQuyenXacNhan`,
        { credentials: "same-origin" },
      );
      if (!res.ok) throw new Error("Lỗi lấy cấu hình cột");
      return await res.json();
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] getColumnsConfig:", err);
      return [];
    }
  },

  /**
   * Lấy danh sách phân quyền hiện tại (dữ liệu cho DataTable chính).
   * @param {Object} filters - Tham số lọc tuỳ chọn: { id_he, id_don_vi, trang_thai }
   * @returns {Promise<Array>} Mảng dữ liệu phân quyền.
   */
  async getDanhSachPhanQuyen(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.id_he) params.append("id_he", filters.id_he);
      if (filters.id_don_vi) params.append("id_don_vi", filters.id_don_vi);
      if (filters.trang_thai) params.append("trang_thai", filters.trang_thai);

      // TODO: Bỏ comment dưới đây khi API backend đã sẵn sàng
      // const res = await fetch(`${window.API_PREFIX}/phan-quyen-xac-nhan/?${params}`, { credentials: 'same-origin' });
      // if (!res.ok) throw new Error('Lỗi lấy danh sách phân quyền');
      // return await res.json();

      return []; // Placeholder — trả về rỗng cho đến khi có API thật
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] getDanhSachPhanQuyen:", err);
      return [];
    }
  },

  /**
   * Lấy danh sách Đơn vị để nạp vào ComboBox "Đơn vị".
   * @returns {Promise<Array>} Mảng { id, text } các đơn vị.
   */
  async getDanhSachDonVi() {
    try {
      const res = await fetch("/api/v1/don-vi/", { credentials: "same-origin" });
      if (!res.ok) throw new Error("Lỗi lấy danh sách đơn vị");
      const data = await res.json();
      return data.map((d) => ({ id: d.MaDonVi, text: d.TenDonVi || d.MaDonVi }));
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] getDanhSachDonVi:", err);
      return [];
    }
  },

  /**
   * Lấy danh sách Hệ đào tạo (Load động từ DB)
   * @returns {Promise<Array>} Mảng các Hệ đào tạo
   */
  async getHeDaoTao() {
    try {
      const response = await fetch("/api/v1/he-dao-tao/", {
        credentials: "same-origin",
      });
      if (!response.ok) throw new Error("Lỗi lấy hệ đào tạo");
      return await response.json();
    } catch (error) {
      console.error("[phanQuyenXacNhanApi] getHeDaoTao:", error);
      return [];
    }
  },

  /**
   * Lấy danh sách Cán bộ theo đơn vị để nạp vào ComboBox "Cán bộ được phân quyền".
   * @param {number|string} idDonVi - ID của đơn vị đang chọn.
   * @returns {Promise<Array>} Mảng { id, text } các cán bộ thuộc đơn vị.
   */
  async getDanhSachCanBo(idDonVi) {
    try {
      if (!idDonVi) return [];
      const res = await fetch(
        `/api/v1/can-bo-giang-day/danh-sach-can-bo-theo-don-vi?ma_don_vi=${encodeURIComponent(idDonVi)}`,
        { credentials: "same-origin" },
      );
      if (!res.ok) throw new Error("Lỗi lấy danh sách cán bộ");
      const data = await res.json();
      return data.map((cb) => ({
        id: cb.HS_ID,
        text: cb.ho_ten || `${cb.HS_Ho || ""} ${cb.HS_Ten || ""}`.trim(),
        don_vi: cb.DV_Ten || "",
      }));
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] getDanhSachCanBo:", err);
      return [];
    }
  },

  /**
   * Lấy danh sách người cập nhật lớp học phần để hiển thị bảng chọn phạm vi.
   * @returns {Promise<Array>} Mảng { id, ho_ten, don_vi } người cập nhật lớp.
   */
  async getDanhSachNguoiCapNhat() {
    try {
      // TODO: Bỏ comment dưới đây khi API backend đã sẵn sàng
      // const res = await fetch(`${window.API_PREFIX}/phan-quyen-xac-nhan/nguoi-cap-nhat`, { credentials: 'same-origin' });
      // if (!res.ok) throw new Error('Lỗi lấy danh sách người cập nhật lớp');
      // return await res.json();

      return []; // Placeholder
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] getDanhSachNguoiCapNhat:", err);
      return [];
    }
  },

  /**
   * Lưu cấu hình phân quyền mới.
   * @param {Object} payload - Dữ liệu phân quyền cần lưu.
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async luuPhanQuyen(payload) {
    try {
      // TODO: Bỏ comment dưới đây khi API backend đã sẵn sàng
      // const res = await fetch(`${window.API_PREFIX}/phan-quyen-xac-nhan/`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   credentials: 'same-origin',
      //   body: JSON.stringify(payload)
      // });
      // if (!res.ok) throw new Error('Lỗi khi lưu phân quyền');
      // return await res.json();

      console.log("[phanQuyenXacNhanApi] luuPhanQuyen payload:", payload);
      return { ok: true, message: "Placeholder — API chưa được kết nối." };
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] luuPhanQuyen:", err);
      return { ok: false, message: err.message };
    }
  },

  /**
   * Thu hồi một cấu hình phân quyền theo ID.
   * @param {number|string} id - ID của bản ghi phân quyền cần thu hồi.
   * @returns {Promise<{ok: boolean, message: string}>}
   */
  async thuHoiPhanQuyen(id) {
    try {
      // TODO: Bỏ comment dưới đây khi API backend đã sẵn sàng
      // const res = await fetch(`${window.API_PREFIX}/phan-quyen-xac-nhan/${id}`, {
      //   method: 'DELETE',
      //   credentials: 'same-origin'
      // });
      // if (!res.ok) throw new Error('Lỗi khi thu hồi phân quyền');
      // return { ok: true };

      console.log("[phanQuyenXacNhanApi] thuHoiPhanQuyen id:", id);
      return { ok: true, message: "Placeholder — API chưa được kết nối." };
    } catch (err) {
      console.error("[phanQuyenXacNhanApi] thuHoiPhanQuyen:", err);
      return { ok: false, message: err.message };
    }
  },
};
