// ============================================================
// phan_quyen_xac_nhan.js — UI Layer
// Trang: Phân Quyền Xác Nhận Khối Lượng Giảng Dạy
// ============================================================

(function () {
  const state = {
    selectedHeId: null, // For filter outside table
    currentDonViOfficers: [], // Danh sách cán bộ của đơn vị đang chọn
    selectedScopeOfficers: [], // Danh sách cán bộ được thêm vào bảng phạm vi
  };

  const dom = {
    btnTaoMoi: () => document.getElementById("btn-tao-moi"),
    filterHeDaoTao: () => document.getElementById("filterHeDaoTao"),
    selectHeDaoTaoModal: () => document.getElementById("selectHeDaoTaoModal"),

    rightCards: () => document.querySelectorAll(".pq-right-card"),
    radioAll: () => document.getElementById("pq-scope-all"),
    radioPeople: () => document.getElementById("pq-scope-people"),
    scopePeopleArea: () => document.getElementById("pq-scope-people-area"),
    scopeSearchInput: () => document.getElementById("pq-scope-search-input"),
    scopeSuggestions: () => document.getElementById("pq-scope-suggestions"),
    scopeTbody: () => document.getElementById("pq-scope-tbody"),
    scopeCount: () => document.getElementById("pq-scope-count"),

    btnHuy: () => document.getElementById("btn-pq-huy"),
    btnLuu: () => document.getElementById("modalPhanQuyen_btnSave"),

    modalPhanQuyen: () => document.getElementById("modalPhanQuyen"),
    formPhanQuyen: () => document.getElementById("formPhanQuyen"),

    pqTable: () => document.getElementById("pq-main-table"),
    pqPagination: () => document.getElementById("tablePagination"),
  };

  let modalPhanQuyen = null;
  let comboFilterHeDaoTao = null;
  let comboHeDaoTaoModal = null;
  let comboDonVi = null;
  let comboCanBo = null;
  let pqDataTable = null;

  async function loadHeDaoTaoOptions() {
    const data = await phanQuyenXacNhanApi.getHeDaoTao();
    const heData = data.map((he) => ({ id: he.ID_He, text: he.Ten_He }));

    // 1. Dropdown lọc ngoài bảng
    comboFilterHeDaoTao = new ComboBox("#filterHeDaoTaoContainer", {
      data: [{ id: "", text: "Tất cả hệ đào tạo" }, ...heData],
      defaultValue: "",
      fieldName: "filterHeDaoTao",
      placeholder: "Tất cả hệ đào tạo...",
    });
    const origSetFilterHe =
      comboFilterHeDaoTao.setValue.bind(comboFilterHeDaoTao);
    comboFilterHeDaoTao.setValue = (val) => {
      origSetFilterHe(val);
      state.selectedHeId = val || null;
      loadDanhSachPhanQuyen();
    };

    // 2. Dropdown chọn hệ trong Modal
    comboHeDaoTaoModal = new ComboBox("#pq-combo-he-dao-tao", {
      data: heData,
      fieldName: "id_he",
      placeholder: "Chọn hệ đào tạo...",
    });
  }

  let isDonViLoaded = false;
  async function loadDanhSachDonViModal() {
    if (!isDonViLoaded) {
      const dataDonVi = await phanQuyenXacNhanApi.getDanhSachDonVi();
      if (comboDonVi) comboDonVi.data = dataDonVi;
      isDonViLoaded = true;
    }
  }

  function initComboBoxes() {
    comboDonVi = new ComboBox("#pq-combo-don-vi", {
      data: [],
      fieldName: "id_don_vi",
      placeholder: "Chọn đơn vị...",
    });

    comboCanBo = new ComboBox("#pq-combo-can-bo", {
      data: [],
      fieldName: "id_can_bo",
      placeholder: "Chọn cán bộ...",
    });

    const origSetDonVi = comboDonVi.setValue.bind(comboDonVi);
    comboDonVi.setValue = async (idDonVi) => {
      origSetDonVi(idDonVi);
      comboCanBo?.clear();
      if (idDonVi) {
        const listCanBo = await phanQuyenXacNhanApi.getDanhSachCanBo(idDonVi);
        state.currentDonViOfficers = listCanBo;
        if (comboCanBo) comboCanBo.data = listCanBo;
      } else {
        state.currentDonViOfficers = [];
        if (comboCanBo) comboCanBo.data = [];
      }
    };
  }

  function syncRightCard(checkbox) {
    const card = checkbox.closest(".pq-right-card");
    if (!card) return;
    card.classList.toggle("checked", checkbox.checked);
  }

  function getCheckedRights() {
    const rights = [];
    document
      .querySelectorAll('.pq-right-card input[type="checkbox"]:checked')
      .forEach((cb) => rights.push(cb.value));
    return rights;
  }

  function onScopeChange() {
    const isPeople = dom.radioPeople()?.checked;
    const area = dom.scopePeopleArea();
    if (area) area.hidden = !isPeople;
  }

  function handleScopeSearchInput(e) {
    const query = e.target.value.trim().toLowerCase();
    const dropdown = dom.scopeSuggestions();
    if (!dropdown) return;

    if (!comboDonVi?.getValue()) {
      dropdown.innerHTML = `<div style="padding: 8px 12px; font-size: 13px; color: var(--text-muted);">Vui lòng chọn đơn vị ở trên trước</div>`;
      dropdown.style.display = "block";
      return;
    }

    if (!query) {
      dropdown.style.display = "none";
      return;
    }

    const available = state.currentDonViOfficers || [];
    const matches = available.filter((cb) => {
      const text = (cb.text || "").toLowerCase();
      const id = String(cb.id || "").toLowerCase();
      return text.includes(query) || id.includes(query);
    });

    if (matches.length === 0) {
      dropdown.innerHTML = `<div style="padding: 8px 12px; font-size: 13px; color: var(--text-muted);">Không tìm thấy cán bộ nào</div>`;
      dropdown.style.display = "block";
      return;
    }

    dropdown.innerHTML = matches
      .map(
        (cb) => `
      <div class="pq-scope-item" data-id="${cb.id}">
        <span>${cb.text}</span>
        <span style="font-size: 12px; color: var(--text-muted);">${cb.id}</span>
      </div>
    `,
      )
      .join("");
    dropdown.style.display = "block";

    dropdown.querySelectorAll(".pq-scope-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        const officer = available.find((o) => o.id == id);
        if (officer) addScopeOfficer(officer);
      });
    });
  }

  function addScopeOfficer(officer) {
    const exists = state.selectedScopeOfficers.some((o) => o.id == officer.id);
    if (exists) {
      if (typeof showToast !== "undefined") {
        showToast("Cán bộ này đã có trong danh sách", "warning");
      }
      return;
    }

    state.selectedScopeOfficers.push(officer);
    renderScopeTable();

    // Reset input
    const input = dom.scopeSearchInput();
    if (input) input.value = "";
    const dropdown = dom.scopeSuggestions();
    if (dropdown) dropdown.style.display = "none";
  }

  function removeScopeOfficer(id) {
    state.selectedScopeOfficers = state.selectedScopeOfficers.filter(
      (o) => o.id != id,
    );
    renderScopeTable();
  }

  function renderScopeTable() {
    const tbody = dom.scopeTbody();
    if (!tbody) return;

    if (state.selectedScopeOfficers.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="4" class="pq-scope-empty">
            Chưa có người cập nhật nào được chọn. Hãy tìm kiếm ở trên để thêm.
          </td>
        </tr>`;
      updateScopeCount();
      return;
    }

    tbody.innerHTML = state.selectedScopeOfficers
      .map((p, idx) => {
        return `
        <tr>
          <td style="text-align: center;">${idx + 1}</td>
          <td><b>${p.text || p.ho_ten || ""}</b></td>
          <td>${p.don_vi || p.id || ""}</td>
          <td style="text-align: center;">
            <button type="button" class="btn-remove-scope" data-id="${p.id}" title="Xóa">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"></path>
                <path d="M10 11v6"></path><path d="M14 11v6"></path>
              </svg>
            </button>
          </td>
        </tr>`;
      })
      .join("");

    tbody.querySelectorAll(".btn-remove-scope").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        removeScopeOfficer(btn.dataset.id);
      });
    });

    updateScopeCount();
  }

  function updateScopeCount() {
    const el = dom.scopeCount();
    if (!el) return;
    const total = state.selectedScopeOfficers.length;
    el.innerHTML = `Đã chọn <b style="color: red">${total}</b> người cập nhật lớp`;
  }

  async function initDataTable() {
    pqDataTable = new DataTable({
      tableId: "pq-main-table",
      paginationId: "tablePagination",
      pageSize: 20,
      rowKey: "id",
      customCellRender: renderCustomCell,
      onRenderComplete: () => {},
    });
  }

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

  function renderCustomCell(row, colId, value) {
    if (
      ["quyen_cap_nhat", "quyen_xac_nhan", "quyen_lap_ds", "quyen_ky"].includes(
        colId,
      )
    ) {
      return value
        ? `<span class="pq-yes">✓</span>`
        : `<span class="pq-no">✗</span>`;
    }

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

    return null;
  }

  function buildPayload() {
    const idHe = comboHeDaoTaoModal?.getValue() ?? null;
    const idDonVi = comboDonVi?.getValue() ?? null;
    const idCanBo = comboCanBo?.getValue() ?? null;
    const rights = getCheckedRights();
    const scope = dom.radioPeople()?.checked ? "people" : "all";
    const nguoiCapNhat =
      scope === "people" ? state.selectedScopeOfficers.map((o) => o.id) : [];

    return {
      id_he: idHe,
      id_don_vi: idDonVi,
      id_can_bo: idCanBo,
      quyen: rights,
      pham_vi: scope,
      nguoi_cap_nhat: nguoiCapNhat,
    };
  }

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
      if (modalPhanQuyen) modalPhanQuyen.close();
      loadDanhSachPhanQuyen();
    } else {
      showToast(`Lưu thất bại: ${result.message}`);
    }
  }

  function onHuyForm() {
    comboHeDaoTaoModal?.clear();
    comboDonVi?.clear();
    comboCanBo?.clear();
    state.currentDonViOfficers = [];
    state.selectedScopeOfficers = [];

    document
      .querySelectorAll('.pq-right-card input[type="checkbox"]')
      .forEach((cb) => {
        cb.checked = true;
        syncRightCard(cb);
      });
    dom.radioAll()?.click();
    renderScopeTable();

    const dropdown = dom.scopeSuggestions();
    if (dropdown) dropdown.style.display = "none";

    if (modalPhanQuyen) modalPhanQuyen.close();
  }

  async function onThuHoiPhanQuyen(id) {
    const confirmed = await confirmModal.open(
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

  // Handle Event cleanup for SPA
  const eventListeners = [];
  function addEvent(element, event, handler) {
    if (!element) return;
    element.addEventListener(event, handler);
    eventListeners.push({ element, event, handler });
  }

  function bindStaticEvents() {
    const btnTaoMoi = dom.btnTaoMoi();
    if (btnTaoMoi) {
      addEvent(btnTaoMoi, "click", async () => {
        onHuyForm(); // Reset form first

        // Tự động chọn hệ đào tạo theo bộ lọc hiện tại nếu có
        const currentFilterHe =
          comboFilterHeDaoTao?.getValue() || state.selectedHeId;
        if (currentFilterHe) {
          comboHeDaoTaoModal?.setValue(currentFilterHe);
        }

        // Tải danh sách đơn vị khi mở modal
        await loadDanhSachDonViModal();

        if (modalPhanQuyen) {
          modalPhanQuyen.open();
        } else {
          const m = dom.modalPhanQuyen();
          if (m) m.style.display = "flex";
        }
      });
    }

    document.querySelectorAll(".pq-right-card").forEach((card) => {
      const cb = card.querySelector('input[type="checkbox"]');
      if (cb) {
        addEvent(cb, "change", function () {
          syncRightCard(this);
        });
      }
    });

    addEvent(dom.radioAll(), "change", onScopeChange);
    addEvent(dom.radioPeople(), "change", onScopeChange);

    const inputSearch = dom.scopeSearchInput();
    if (inputSearch) {
      addEvent(inputSearch, "input", handleScopeSearchInput);
      addEvent(inputSearch, "keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          const dropdown = dom.scopeSuggestions();
          const firstItem = dropdown?.querySelector(".pq-scope-item");
          if (firstItem && dropdown.style.display !== "none") {
            firstItem.click();
          }
        } else if (e.key === "Escape") {
          const dropdown = dom.scopeSuggestions();
          if (dropdown) dropdown.style.display = "none";
        }
      });
    }

    // Click ngoài đóng dropdown gợi ý
    document.addEventListener("click", (e) => {
      const dropdown = dom.scopeSuggestions();
      const searchWrap = e.target.closest(".pq-scope-search");
      if (!searchWrap && dropdown) {
        dropdown.style.display = "none";
      }
    });

    const formEl = document.getElementById("formPhanQuyen");
    if (formEl) {
      addEvent(formEl, "submit", (e) => {
        e.preventDefault();
        onLuuPhanQuyen();
      });
    }

    const mainTable = document.getElementById("pq-main-table");
    if (mainTable) {
      addEvent(mainTable, "click", (e) => {
        const btnEdit = e.target.closest(".btn-action-edit");
        const btnDelete = e.target.closest(".btn-action-danger");
        if (btnEdit)
          showToast(
            `Chỉnh sửa bản ghi ID=${btnEdit.dataset.id} — sẽ triển khai sau.`,
          );
        if (btnDelete) onThuHoiPhanQuyen(btnDelete.dataset.id);
      });
    }
  }

  // SPA Rule 17: Cleanup
  window.pageCleanup = () => {
    eventListeners.forEach(({ element, event, handler }) => {
      if (element) element.removeEventListener(event, handler);
    });
    eventListeners.length = 0;
    if (pqDataTable) pqDataTable.destroy?.();
    if (comboFilterHeDaoTao) comboFilterHeDaoTao.destroy?.();
    if (comboHeDaoTaoModal) comboHeDaoTaoModal.destroy?.();
    if (comboDonVi) comboDonVi.destroy?.();
    if (comboCanBo) comboCanBo.destroy?.();
  };

  async function init() {
    try {
      if (typeof BaseModal !== "undefined") {
        modalPhanQuyen = new BaseModal("modalPhanQuyen");
      }

      bindStaticEvents();

      await loadHeDaoTaoOptions();
      await Promise.all([initComboBoxes(), initDataTable()]);

      renderScopeTable();

      await loadDanhSachPhanQuyen();
      onScopeChange();
    } catch (err) {
      console.error("[phan_quyen_xac_nhan.js] Init error:", err);
    }
  }

  // Khởi chạy khi DOM sẵn sàng
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
