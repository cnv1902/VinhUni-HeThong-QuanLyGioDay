// ============================================================
// phan_quyen_xac_nhan.js — UI Layer
// Trang: Phân Quyền Xác Nhận Khối Lượng Giảng Dạy
// Phụ thuộc (load trước):
//   - phanQuyenXacNhanApi.js (API layer)
//   - combo_box.js (ComboBox component)
//   - datatable.js (DataTable component)
//   - toast.js (showToast)
//   - confirm_modal.js (confirmModal)
// ============================================================

// ============================================================
// 1. STATE & DOM ELEMENTS
// ============================================================
(function () {
  /** Trạng thái hiện tại của form cấu hình phân quyền */
  const state = {
    /** ID hệ đào tạo đang được chọn (tab trái) */
    selectedHeId: null,
    /** Dữ liệu người cập nhật lớp đã tải về */
    danhSachNguoiCapNhat: [],
    /** Set các ID người cập nhật lớp đang được chọn */
    pickedNguoiCapNhat: new Set(),
    /** Từ khoá tìm kiếm trong bảng người cập nhật */
    scopeSearch: "",
  };

  const dom = {
    // Hệ đào tạo
    systemBtns: () => document.querySelectorAll(".pq-system-btn"),
    // Các checkbox quyền (4 card)
    rightCards: () => document.querySelectorAll(".pq-right-card"),
    // Phạm vi
    radioAll: () => document.getElementById("pq-scope-all"),
    radioPeople: () => document.getElementById("pq-scope-people"),
    scopePeopleArea: () => document.getElementById("pq-scope-people-area"),
    scopeSearchInput: () => document.getElementById("pq-scope-search-input"),
    scopeTbody: () => document.getElementById("pq-scope-tbody"),
    scopeCount: () => document.getElementById("pq-scope-count"),
    scopeCheckAll: () => document.getElementById("pq-scope-check-all"),
    // Actions
    btnHuy: () => document.getElementById("btn-pq-huy"),
    btnXemTruoc: () => document.getElementById("btn-pq-xem-truoc"),
    btnLuu: () => document.getElementById("btn-pq-luu"),
    // Bảng phân quyền hiện tại
    pqTable: () => document.getElementById("pq-main-table"),
    pqPagination: () => document.getElementById("pq-pagination"),
  };

  // Instances component
  let comboDonVi = null;
  let comboCanBo = null;
  let comboTrangThai = null;
  let pqDataTable = null;

  // ============================================================
  // 2. COMBOBOX INITIALIZATION
  // ============================================================

  /**
   * Khởi tạo tất cả ComboBox trong form cấu hình phân quyền.
   * Dữ liệu được nạp từ API layer.
   */
  async function initComboBoxes() {
    // ComboBox Đơn vị
    const dataDonVi = await phanQuyenXacNhanApi.getDanhSachDonVi();
    comboDonVi = new ComboBox("#pq-combo-don-vi", {
      data: dataDonVi,
      fieldName: "id_don_vi",
      placeholder: "Chọn đơn vị...",
    });

    // ComboBox Cán bộ (load lại khi đơn vị thay đổi)
    comboCanBo = new ComboBox("#pq-combo-can-bo", {
      data: [],
      fieldName: "id_can_bo",
      placeholder: "Chọn cán bộ...",
    });

    // ComboBox Trạng thái
    comboTrangThai = new ComboBox("#pq-combo-trang-thai", {
      data: [
        { id: "dang_hieu_luc", text: "Đang hiệu lực" },
        { id: "tam_ngung", text: "Tạm ngừng" },
      ],
      fieldName: "trang_thai",
      placeholder: "Chọn trạng thái...",
      defaultValue: "dang_hieu_luc",
    });
  }

  // ============================================================
  // 3. HỆ ĐÀO TẠO TAB SELECTION
  // ============================================================

  /**
   * Xử lý khi bấm chọn tab hệ đào tạo bên cột trái.
   * Cập nhật trạng thái, đổi active button, nạp lại dữ liệu bảng.
   * @param {Element} btn - Nút tab vừa được bấm
   */
  function selectSystem(btn) {
    document
      .querySelectorAll(".pq-system-btn")
      .forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.selectedHeId = btn.dataset.heId;
    loadDanhSachPhanQuyen();
  }

  // ============================================================
  // 4. QUYỀN THAO TÁC — Checkbox Card Logic
  // ============================================================

  /**
   * Đồng bộ trạng thái visual của card quyền khi checkbox thay đổi.
   * @param {HTMLInputElement} checkbox - Checkbox vừa thay đổi
   */
  function syncRightCard(checkbox) {
    const card = checkbox.closest(".pq-right-card");
    if (!card) return;
    card.classList.toggle("checked", checkbox.checked);
  }

  /**
   * Lấy danh sách ID quyền đang được tick.
   * @returns {string[]} Mảng key quyền (vd: ['cap_nhat_lop', 'xac_nhan'])
   */
  function getCheckedRights() {
    const rights = [];
    document
      .querySelectorAll('.pq-right-card input[type="checkbox"]:checked')
      .forEach((cb) => {
        rights.push(cb.value);
      });
    return rights;
  }

  // ============================================================
  // 5. PHẠM VI LỚP HỌC PHẦN — Scope Radio & Table Logic
  // ============================================================

  /**
   * Hiển thị hoặc ẩn khu vực chọn người cập nhật lớp theo radio scope.
   */
  function onScopeChange() {
    const isPeople = dom.radioPeople()?.checked;
    const area = dom.scopePeopleArea();
    if (area) area.hidden = !isPeople;
  }

  /**
   * Render bảng người cập nhật lớp dựa trên từ khoá tìm kiếm hiện tại.
   * Lấy dữ liệu từ state.danhSachNguoiCapNhat.
   */
  function renderScopeTable() {
    const tbody = dom.scopeTbody();
    if (!tbody) return;

    const keyword = state.scopeSearch.toLowerCase();
    const filtered = state.danhSachNguoiCapNhat.filter((p) =>
      (p.ho_ten + " " + p.don_vi).toLowerCase().includes(keyword),
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="3" class="pq-scope-empty">Không có dữ liệu</td></tr>`;
      updateScopeCount();
      return;
    }

    tbody.innerHTML = filtered
      .map((p) => {
        const checked = state.pickedNguoiCapNhat.has(p.id) ? "checked" : "";
        return `
      <tr>
        <td><input type="checkbox" data-id="${p.id}" ${checked} aria-label="Chọn ${p.ho_ten}"/></td>
        <td>${p.ho_ten}</td>
        <td>${p.don_vi}</td>
      </tr>`;
      })
      .join("");

    updateScopeCount();
    syncCheckAllState();
  }

  /**
   * Cập nhật nhãn số "Đã chọn X/Y người cập nhật lớp".
   */
  function updateScopeCount() {
    const el = dom.scopeCount();
    if (!el) return;
    const total = state.danhSachNguoiCapNhat.length;
    const picked = state.pickedNguoiCapNhat.size;
    el.textContent = `Đã chọn ${picked}/${total} người cập nhật lớp`;
  }

  /**
   * Đồng bộ trạng thái checkbox "Chọn tất cả" ở header bảng.
   */
  function syncCheckAllState() {
    const checkAll = dom.scopeCheckAll();
    if (!checkAll) return;
    const total = state.danhSachNguoiCapNhat.length;
    checkAll.checked = total > 0 && state.pickedNguoiCapNhat.size === total;
    checkAll.indeterminate =
      state.pickedNguoiCapNhat.size > 0 &&
      state.pickedNguoiCapNhat.size < total;
  }

  // ============================================================
  // 6. BẢNG DANH SÁCH PHÂN QUYỀN (DataTable)
  // ============================================================

  /**
   * Khởi tạo component DataTable cho bảng danh sách phân quyền hiện tại.
   * Cấu hình cột lấy từ API (getColumnsConfig), dữ liệu lấy từ getDanhSachPhanQuyen.
   */
  async function initDataTable() {
    pqDataTable = new DataTable({
      tableId: "pq-main-table",
      paginationId: "pq-pagination",
      pageSize: 20,
      rowKey: "id",
      // TODO: Cấu hình thêm khi cần inline-edit hoặc selection
      // isRowEditable: () => false,
      customCellRender: renderCustomCell,
      onRenderComplete: () => {},
    });
  }

  /**
   * Nạp dữ liệu và cấu hình cột vào DataTable.
   * Gọi lại khi đổi tab hệ đào tạo hoặc cần refresh.
   */
  async function loadDanhSachPhanQuyen() {
    const [cols, data] = await Promise.all([
      phanQuyenXacNhanApi.getColumnsConfig(),
      phanQuyenXacNhanApi.getDanhSachPhanQuyen({ id_he: state.selectedHeId }),
    ]);

    if (pqDataTable) {
      pqDataTable.setColumns(cols);
      pqDataTable.setData(data);
    }
  }

  /**
   * Hàm render tuỳ biến ô bảng — xử lý badge trạng thái và cột quyền Yes/No.
   * @param {Object} row - Dữ liệu dòng
   * @param {string} colId - Tên cột
   * @param {*} value - Giá trị ô
   * @returns {string|null} HTML string hoặc null (để DataTable tự render)
   */
  function renderCustomCell(row, colId, value) {
    if (colId === "trang_thai") {
      const map = {
        dang_hieu_luc: ["badge-pq badge-pq-active", "Đang hiệu lực"],
        het_hieu_luc: ["badge-pq badge-pq-expired", "Hết hiệu lực"],
        tam_ngung: ["badge-pq badge-pq-paused", "Tạm ngừng"],
      };
      const [cls, label] = map[value] || ["badge-pq badge-pq-expired", value];
      return `<span class="${cls}">${label}</span>`;
    }

    // Cột quyền boolean (true/false hoặc 1/0)
    if (
      ["quyen_cap_nhat", "quyen_xac_nhan", "quyen_lap_ds", "quyen_ky"].includes(
        colId,
      )
    ) {
      return value
        ? `<span class="pq-yes">✓</span>`
        : `<span class="pq-no">–</span>`;
    }

    // Cột thao tác: nút Chỉnh sửa + Thu hồi
    if (colId === "__actions") {
      return `
      <div style="display:flex;gap:6px;justify-content:center">
        <button class="btn btn-action-edit" data-id="${row.id}" title="Chỉnh sửa phân quyền">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
        </button>
        <button class="btn btn-action-danger" data-id="${row.id}" title="Thu hồi phân quyền">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
          </svg>
        </button>
      </div>`;
    }

    return null; // DataTable tự render mặc định
  }

  // ============================================================
  // 7. FORM ACTIONS — Lưu / Hủy / Xem trước
  // ============================================================

  /**
   * Thu thập toàn bộ dữ liệu từ form cấu hình thành payload để gửi lên API.
   * @returns {Object} Payload phân quyền
   */
  function buildPayload() {
    const activeSystemBtn = document.querySelector(".pq-system-btn.active");
    const idDonVi = comboDonVi?.getValue() ?? null;
    const idCanBo = comboCanBo?.getValue() ?? null;
    const trangThai = comboTrangThai?.getValue() ?? null;
    const hieulucTu = document.getElementById("pq-hieuluc-tu")?.value ?? null;
    const hieulucDen = document.getElementById("pq-hieuluc-den")?.value ?? null;
    const rights = getCheckedRights();
    const scope = dom.radioPeople()?.checked ? "people" : "all";
    const nguoiCapNhat =
      scope === "people" ? Array.from(state.pickedNguoiCapNhat) : [];

    return {
      id_he: activeSystemBtn?.dataset.heId ?? null,
      id_don_vi: idDonVi,
      id_can_bo: idCanBo,
      hieu_luc_tu: hieulucTu,
      hieu_luc_den: hieulucDen,
      trang_thai: trangThai,
      quyen: rights,
      pham_vi: scope,
      nguoi_cap_nhat: nguoiCapNhat,
    };
  }

  /**
   * Xử lý sự kiện bấm nút "Lưu phân quyền".
   * Validate cơ bản → gọi API → toast kết quả → reload bảng.
   */
  async function onLuuPhanQuyen() {
    const payload = buildPayload();

    if (!payload.id_he) {
      showToast("Vui lòng chọn hệ đào tạo.");
      return;
    }
    if (!payload.id_don_vi) {
      showToast("Vui lòng chọn đơn vị.");
      return;
    }
    if (!payload.id_can_bo) {
      showToast("Vui lòng chọn cán bộ được phân quyền.");
      return;
    }
    if (payload.quyen.length === 0) {
      showToast("Vui lòng tích chọn ít nhất một quyền thao tác.");
      return;
    }

    dom.btnLuu()?.setAttribute("disabled", "");
    const result = await phanQuyenXacNhanApi.luuPhanQuyen(payload);
    dom.btnLuu()?.removeAttribute("disabled");

    if (result.ok) {
      showToast("Đã lưu cấu hình phân quyền thành công.");
      loadDanhSachPhanQuyen();
    } else {
      showToast(`Lưu thất bại: ${result.message}`);
    }
  }

  /**
   * Đặt lại form về trạng thái rỗng ban đầu.
   */
  function onHuyForm() {
    comboDonVi?.clear();
    comboCanBo?.clear();
    comboTrangThai?.setValue("dang_hieu_luc");
    document.getElementById("pq-hieuluc-tu").value = "";
    document.getElementById("pq-hieuluc-den").value = "";
    document
      .querySelectorAll('.pq-right-card input[type="checkbox"]')
      .forEach((cb) => {
        cb.checked = true;
        syncRightCard(cb);
      });
    dom.radioAll()?.click();
    state.pickedNguoiCapNhat.clear();
    renderScopeTable();
    showToast("Đã đặt lại form cấu hình.");
  }

  // ============================================================
  // 8. THU HỒI PHÂN QUYỀN (từ bảng danh sách)
  // ============================================================

  /**
   * Xử lý khi bấm nút Thu hồi trong bảng danh sách phân quyền.
   * Hiển thị confirmModal, nếu xác nhận thì gọi API thu hồi.
   * @param {string|number} id - ID bản ghi phân quyền cần thu hồi
   */
  async function onThuHoiPhanQuyen(id) {
    const confirmed = await confirmModal.show(
      "Bạn có chắc chắn muốn <b>thu hồi</b> phân quyền này? Hành động này sẽ có hiệu lực ngay lập tức.",
      "Xác nhận thu hồi",
      "Thu hồi ngay",
      "var(--red-600)",
    );
    if (!confirmed) return;

    const result = await phanQuyenXacNhanApi.thuHoiPhanQuyen(id);
    if (result.ok) {
      showToast("Đã thu hồi phân quyền thành công.");
      loadDanhSachPhanQuyen();
    } else {
      showToast(`Thu hồi thất bại: ${result.message}`);
    }
  }

  // ============================================================
  // 9. EVENT LISTENERS BINDING
  // ============================================================

  /** Gắn sự kiện cho tất cả thành phần tĩnh. */
  function bindStaticEvents() {
    // Tab hệ đào tạo
    dom.systemBtns().forEach((btn) => {
      btn.addEventListener("click", () => selectSystem(btn));
    });

    // Card quyền: label tự động toggle checkbox (trình duyệt xử lý)
    // Chỉ cần lắng nghe sự kiện change trên checkbox để cập nhật UI
    document.querySelectorAll(".pq-right-card").forEach((card) => {
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb) {
        cb.addEventListener("change", function () {
          syncRightCard(this);
        });
      }
    });

    // Radio phạm vi
    dom.radioAll()?.addEventListener("change", onScopeChange);
    dom.radioPeople()?.addEventListener("change", onScopeChange);

    // Tìm kiếm trong bảng người cập nhật
    dom.scopeSearchInput()?.addEventListener("input", function () {
      state.scopeSearch = this.value;
      renderScopeTable();
    });

    // Checkbox "Chọn tất cả" bảng scope (Event Delegation lên thead)
    dom.scopeCheckAll()?.addEventListener("change", function () {
      if (this.checked) {
        state.danhSachNguoiCapNhat.forEach((p) =>
          state.pickedNguoiCapNhat.add(p.id),
        );
      } else {
        state.pickedNguoiCapNhat.clear();
      }
      renderScopeTable();
    });

    // Event Delegation cho tbody bảng scope
    dom.scopeTbody()?.addEventListener("change", (e) => {
      const cb = e.target.closest('input[type="checkbox"]');
      if (!cb) return;
      const id = cb.dataset.id;
      if (!id) return;
      if (cb.checked) {
        state.pickedNguoiCapNhat.add(id);
      } else {
        state.pickedNguoiCapNhat.delete(id);
      }
      updateScopeCount();
      syncCheckAllState();
    });

    // Nút form
    dom.btnHuy()?.addEventListener("click", onHuyForm);
    dom.btnLuu()?.addEventListener("click", onLuuPhanQuyen);
    dom.btnXemTruoc()?.addEventListener("click", () => {
      showToast("Chức năng xem trước phạm vi sẽ được triển khai sau.");
    });

    // Event Delegation cho cột Thao tác trong DataTable chính
    document.getElementById("pq-main-table")?.addEventListener("click", (e) => {
      const btnEdit = e.target.closest(".btn-action-edit");
      const btnDelete = e.target.closest(".btn-action-danger");
      if (btnEdit)
        showToast(
          `Chỉnh sửa bản ghi ID=${btnEdit.dataset.id} — sẽ triển khai sau.`,
        );
      if (btnDelete) onThuHoiPhanQuyen(btnDelete.dataset.id);
    });
  }

  // ============================================================
  // 10. INITIALIZATION
  // ============================================================

  /**
   * Hàm khởi động trang. Gọi sau khi DOM sẵn sàng.
   * Thứ tự: Khởi tạo ComboBox → DataTable → Tải dữ liệu → Bind events.
   */
  async function init() {
    // Chọn tab mặc định (hệ đào tạo đầu tiên)
    const firstBtn = document.querySelector(".pq-system-btn");
    if (firstBtn) {
      firstBtn.classList.add("active");
      state.selectedHeId = firstBtn.dataset.heId;
    }

    // Khởi tạo song song các ComboBox và DataTable
    await Promise.all([initComboBoxes(), initDataTable()]);

    // Tải dữ liệu người cập nhật lớp cho bảng scope
    state.danhSachNguoiCapNhat =
      await phanQuyenXacNhanApi.getDanhSachNguoiCapNhat();
    renderScopeTable();

    // Tải bảng phân quyền hiện tại
    await loadDanhSachPhanQuyen();

    // Trạng thái scope mặc định
    onScopeChange();

    // Bind toàn bộ events
    bindStaticEvents();
  }

  init();
})();
