// ==========================================
// QUẢN LÝ CÔNG THỨC QUY ĐỔI (Page-Level JS)
// ==========================================
(function () {
  let myTable;
  let formModal = null;
  let tagHinhThucHoc = null;
  let cbHeDaoTao = null;
  let editingId = null; // null = Thêm mới, có giá trị = Sửa

  // Biến cho Drawer Cấu hình
  let semanticEditor = null;

  /**
   * Khởi tạo dữ liệu cốt lõi (Cấu hình cột) 1 lần duy nhất khi mở trang.
   * Không tải data bảng ngay lúc này, mà chờ Navbar báo cáo "ContextReady".
   */
  async function init() {
    try {
      renderFooterUI();

      const rawColsConfig = await apiCongThuc.getColumnsConfig();
      const colsConfig = TableConfigModal.mergeConfig(
        "table_HETHONG_CongThucQuyDoi_Config",
        rawColsConfig,
      );

      // Khởi tạo DataTable Component
      myTable = new DataTable({
        tableId: "dataTable",
        paginationId: "tablePagination",
        pageSize: 100,
        resizableColumns: true,
        storageKey: "table_HETHONG_CongThucQuyDoi_Config",
        isRowSelectable: () => true,
        isRowEditable: () => false, // Tạm thời chưa code sửa
        onSelectionChange: (selectedSet) => {
          updateFooter(myTable.getRows(), selectedSet);
        },
        onRenderComplete: (allRows, selectedSet) => {
          updateFooter(allRows, selectedSet);
        },
        customCellRender: (row, col) => {
          if (col.MaTruong === "TrangThai") {
            const val = row[col.MaTruong];
            if (val === true || String(val).toLowerCase() === "true") {
              return `<span class="badge badge-true">Đang áp dụng</span>`;
            } else if (val === false || String(val).toLowerCase() === "false") {
              return `<span class="badge badge-false">Ngừng áp dụng</span>`;
            }
          }

          if (col.MaTruong === "DenNam") {
            const val = row[col.MaTruong];
            if (val === null || String(val).toLowerCase() === "null") {
              return `<span class="num-text"></span>`;
            }
          }
          return null; // Trả về null để datatable dùng render mặc định cho các cột khác
        },
      });

      myTable.setColumns(colsConfig, rawColsConfig);

      bindStaticEvents();

      // Khởi tạo Drawer Component
      if (typeof SemanticEditorDrawer !== "undefined") {
        semanticEditor = new SemanticEditorDrawer("configDrawer");
      }

      // Khởi tạo Modal Tạo Nhóm
      await initFormModal();

      // Tải dữ liệu sau khi Dropdown Hệ đào tạo đã có data
      await loadTableData();
    } catch (error) {
      console.error("Lỗi khi tải cấu hình cột:", error);
      if (typeof showToast !== "undefined")
        showToast("Không thể tải cấu hình bảng từ máy chủ!");
    }
  }

  /**
   * Khởi tạo Modal Tạo nhóm
   */
  /**
   * Khởi tạo Modal Tạo nhóm
   */
  async function initFormModal() {
    if (typeof BaseModal !== "undefined") {
      formModal = new BaseModal("modalNhomCongThuc");
      // Tải danh sách Hệ đào tạo
      const listHe = await apiCongThuc.getHeDaoTao();
      const heData = listHe.map((he) => ({ id: he.ID_He, text: he.Ten_He }));

      // Đổ dữ liệu vào ô lọc ngoài Grid
      const filterHeDaoTaoEl = document.getElementById("filterHeDaoTao");
      if (filterHeDaoTaoEl) {
        listHe.forEach((he) => {
          const option = document.createElement("option");
          option.value = he.ID_He;
          option.textContent = he.Ten_He;
          if (he.ID_He === 1) option.selected = true; // Mặc định ID = 1
          filterHeDaoTaoEl.appendChild(option);
        });

        // Bắt sự kiện lọc thay đổi
        filterHeDaoTaoEl.addEventListener("change", () => {
          loadTableData();
        });
      }

      const filterTrangThaiEl = document.getElementById("filterTrangThai");
      if (filterTrangThaiEl) {
        filterTrangThaiEl.addEventListener("change", () => {
          loadTableData();
        });
      }

      if (typeof ComboBox !== "undefined") {
        cbHeDaoTao = new ComboBox("#heDaoTaoContainer", {
          data: heData,
          fieldName: "ID_He",
          placeholder: "Chọn Hệ đào tạo...",
        });
      }

      // Tải danh sách Hình thức học & Khởi tạo TagInput
      const listHinhThuc = await apiCongThuc.getHinhThucHoc();
      const tagData = listHinhThuc.map((h) => ({
        id: h.MaHTHoc,
        text: h.TenHTHoc,
      }));

      if (typeof TagInput !== "undefined") {
        tagHinhThucHoc = new TagInput("#dsHinhThucHocContainer", {
          data: tagData,
          fieldName: "DsMaHTHoc",
          placeholder: "Gõ để tìm Hình thức học...",
        });

        const formEl = document.getElementById("formNhomCongThuc");
        formEl.addEventListener("submit", async (e) => {
          e.preventDefault();

          // Validation form
          const tuNamInput = formEl.querySelector('[name="TuNam"]');
          const tuNamVal = tuNamInput ? tuNamInput.value : "";
          if (
            !cbHeDaoTao.getValue() ||
            tagHinhThucHoc.getValues().length === 0 ||
            !tuNamVal
          ) {
            if (typeof showToast !== "undefined")
              showToast(
                "Vui lòng nhập đầy đủ các trường bắt buộc (*)",
                "error",
              );
            return;
          }

          const formData = new FormData(formEl);
          const data = Object.fromEntries(formData.entries());

          // Chuẩn hóa data
          data.ID_He = parseInt(data.ID_He) || 0;
          data.TuNam = parseInt(data.TuNam) || 0;
          data.DenNam = data.DenNam ? parseInt(data.DenNam) : null;
          data.TrangThai = data.TrangThai === "true";

          try {
            const btnSubmit = formEl.querySelector('button[type="submit"]');
            if (btnSubmit) {
              btnSubmit.disabled = true;
              btnSubmit.textContent = "Đang lưu...";
            }

            // Gọi API
            if (editingId) {
              await apiCongThuc.updateNhomCongThuc(editingId, data);
              if (typeof showToast !== "undefined")
                showToast("Cập nhật nhóm công thức thành công!", "success");
            } else {
              await apiCongThuc.createNhomCongThuc(data);
              if (typeof showToast !== "undefined")
                showToast("Thêm mới nhóm công thức thành công!", "success");
            }

            formModal.close();
            formEl.reset();
            editingId = null;

            // Tải lại bảng (chỉ lọc theo hệ đào tạo và trạng thái)
            loadTableData();
          } catch (error) {
            if (typeof showToast !== "undefined")
              showToast(error.message || "Có lỗi xảy ra khi lưu!", "error");
          } finally {
            const btnSubmit = formEl.querySelector('button[type="submit"]');
            if (btnSubmit) {
              btnSubmit.disabled = false;
              btnSubmit.textContent = "Lưu thay đổi";
            }
          }
        });
      }
    }
  }

  /**
   * Hàm tải dữ liệu bảng lưới (chỉ lọc theo hệ và trạng thái)
   */
  async function loadTableData() {
    try {
      if (myTable) {
        myTable.tbody.innerHTML =
          '<tr><td colspan="100%" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';
      }

      const filterHeDaoTao = document.getElementById("filterHeDaoTao");
      const filterTrangThai = document.getElementById("filterTrangThai");

      const id_he = filterHeDaoTao ? filterHeDaoTao.value : null;
      const trang_thai = filterTrangThai ? filterTrangThai.value : null;

      const data = await apiCongThuc.getCongThucData(id_he, trang_thai);
      if (myTable) {
        myTable.setData(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bảng:", error);
      if (typeof showToast !== "undefined")
        showToast("Không thể tải dữ liệu Công thức quy đổi!");
      if (myTable) {
        myTable.tbody.innerHTML =
          '<tr><td colspan="100%" style="text-align:center; padding: 20px; color: var(--red-600);">Lỗi tải dữ liệu</td></tr>';
      }
    }
  }

  // (Đã gỡ bỏ ContextReady và ContextChanged vì trang này không phụ thuộc vào Học kỳ của Navbar)

  /**
   * Hàm phụ trợ cập nhật các con số Thống kê ở Footer
   */
  function updateFooter(rows, selectedSet = null) {
    const selectedSize = selectedSet
      ? selectedSet.size
      : myTable
        ? myTable.state.selected.size
        : 0;

    const totalRowsEl = document.getElementById("statTotal");
    if (totalRowsEl)
      totalRowsEl.textContent = myTable ? myTable.state.data.length : 0;

    const filteredEl = document.getElementById("statFiltered");
    if (filteredEl) filteredEl.textContent = rows.length;

    const selectedEl = document.getElementById("statSelected");
    if (selectedEl) selectedEl.textContent = selectedSize;
  }

  /**
   * Render cấu trúc Footer (chỉ chạy 1 lần lúc init)
   */
  function renderFooterUI() {
    const f = document.querySelector(".app-footer");
    if (!f) return;
    f.innerHTML = `
    <div class="footer-left">
      <div class="stat-badge">Tổng: <strong id="statTotal">0</strong></div>
      <div class="stat-badge">Hiển thị: <strong id="statFiltered">0</strong></div>
      <div class="stat-badge">Đã chọn: <strong id="statSelected" style="color:var(--brand-800)">0</strong></div>
    </div>
    <div class="footer-right">
      <span style="color:var(--text-muted)">Hệ thống Quản lý Giờ dạy - Đại học Vinh</span>
    </div>
  `;
  }

  /**
   * Gán các sự kiện tĩnh (chỉ gán 1 lần)
   */
  function bindStaticEvents() {
    // 1. Nút Cấu hình hiển thị
    const btnConfig = document.getElementById("btnConfigTable");
    if (btnConfig) {
      btnConfig.addEventListener("click", () => {
        TableConfigModal.open(
          "table_HETHONG_CongThucQuyDoi_Config",
          myTable.state.rawColumns,
          (newCols) => {
            myTable.setColumns(newCols);
          },
        );
      });
    }

    // 2. Ô tìm kiếm nhanh
    const qs = document.getElementById("quickSearch");
    if (qs) {
      qs.addEventListener("input", (e) => {
        myTable.setSearch(e.target.value);
      });
    }

    // 3. Nút Thêm mới
    const btnNew = document.getElementById("btnNewGrounp");
    if (btnNew) {
      btnNew.addEventListener("click", () => {
        if (formModal) {
          editingId = null; // Reset trạng thái về Thêm mới
          document
            .getElementById("modalNhomCongThuc")
            .querySelector(".modal-title").textContent = "Thêm Nhóm Công Thức";

          // Xóa form cũ nếu cần
          document.getElementById("formNhomCongThuc").reset();
          if (tagHinhThucHoc) tagHinhThucHoc.clear();
          if (cbHeDaoTao) cbHeDaoTao.clear();

          // Mặc định ô Từ năm là năm hiện tại
          const inputTuNam = document.getElementById("TuNam");
          if (inputTuNam) inputTuNam.value = new Date().getFullYear();

          formModal.open();
        }
      });
    }

    // 4. Bắt sự kiện Click trên Bảng (Event Delegation cho các nút Hành động)
    if (myTable && myTable.tbody) {
      myTable.tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("[data-action]");
        if (!btn) return;

        const action = btn.dataset.action;
        const id = parseInt(btn.dataset.id);
        if (!id || isNaN(id)) return;

        const rowData = myTable.state.data.find((r) => r.ID_Nhom_CT === id);
        if (!rowData) return;

        if (action === "edit") {
          editingId = id;
          document
            .getElementById("modalNhomCongThuc")
            .querySelector(".modal-title").textContent = "Sửa Nhóm Công Thức";

          const formEl = document.getElementById("formNhomCongThuc");
          formEl.reset();

          // Đổ dữ liệu vào các ô input cơ bản

          const inputGhiChu = formEl.querySelector('[name="GhiChu_DieuKien"]');
          if (inputGhiChu) inputGhiChu.value = rowData.GhiChu_DieuKien || "";

          const inputTrangThai = formEl.querySelector('[name="TrangThai"]');
          if (inputTrangThai) inputTrangThai.checked = !!rowData.TrangThai;

          // Đổ dữ liệu vào các component phức tạp
          if (cbHeDaoTao) cbHeDaoTao.setValue(rowData.ID_He);

          const inputTuNam = formEl.querySelector('[name="TuNam"]');
          if (inputTuNam) inputTuNam.value = rowData.TuNam || "";

          const inputDenNam = formEl.querySelector('[name="DenNam"]');
          if (inputDenNam) inputDenNam.value = rowData.DenNam || "";

          if (tagHinhThucHoc) {
            tagHinhThucHoc.clear();
            const dsIds = (rowData.DsMaHTHoc || "").split(",").filter((x) => x);
            const dsNames = (rowData.Ds_TenHTHoc || "")
              .split(",")
              .map((x) => x.trim());
            dsIds.forEach((hId, index) => {
              if (hId) tagHinhThucHoc.addTag(hId, dsNames[index] || hId);
            });
          }

          formModal.open();
        } else if (action === "delete") {
          if (typeof confirmModal !== "undefined") {
            const isOk = await confirmModal.show(
              `Bạn có chắc chắn muốn xóa Nhóm công thức này không? Hành động này không thể hoàn tác!`,
              "Xác nhận Xóa",
              "Xóa Nhóm",
              "var(--red-600)",
            );

            if (isOk) {
              try {
                await apiCongThuc.deleteNhomCongThuc(id);
                if (typeof showToast !== "undefined")
                  showToast("Đã xóa nhóm công thức thành công!", "success");
                // Reload table
                const currentCtx = sessionStorage.getItem("CTX_HOC_KY_NAM_HOC");
                if (currentCtx) loadTableData(currentCtx);
              } catch (err) {
                if (typeof showToast !== "undefined")
                  showToast(
                    err.message || "Lỗi khi xóa nhóm công thức",
                    "error",
                  );
              }
            }
          }
        } else if (action === "config") {
          if (semanticEditor) {
            semanticEditor.open(id, "Nhóm công thức");
          } else {
            if (typeof showToast !== "undefined")
              showToast("Component Cấu hình chưa được tải!", "error");
          }
        }
      });
    }
  }

  // Khởi động
  init();
})();
