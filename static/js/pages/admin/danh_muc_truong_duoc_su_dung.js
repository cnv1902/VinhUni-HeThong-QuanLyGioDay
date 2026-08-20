// ==========================================
// QUẢN LÝ DANH MỤC TRƯỜNG ĐƯỢC SỬ DỤNG (Page-Level JS)
// ==========================================
(function () {
  let myTable;
  let cbMaBang = null;
  let modifiedRows = {};
  let allowLeavePage = false;
  let originalRowsById = {};
  let activeMaBang = null;

  // === 1. KIỂM SOÁT LƯU THAY ĐỔI ===
  function hasUnsavedChanges() {
    return Object.keys(modifiedRows).length > 0;
  }

  function updateSaveButtonVisibility() {
    const btnSave = document.getElementById("btnSaveChanges");
    if (!btnSave) return;
    btnSave.style.display = hasUnsavedChanges() ? "inline-flex" : "none";
  }

  function valuesAreSame(a, b) {
    return String(a ?? "") === String(b ?? "");
  }

  function snapshotRows(rows) {
    originalRowsById = {};
    rows.forEach((row) => {
      originalRowsById[row.ID] = { ...row };
    });
  }

  // Cảnh báo khi rời trang
  window.addEventListener("beforeunload", function (e) {
    if (hasUnsavedChanges() && !allowLeavePage) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  // === 2. KHỞI TẠO COMBOBOX LỌC MÃ BẢNG ===
  async function initMaBangCombobox() {
    const danhSachBang = await apiDanhMucTruongDuocSuDung.getDanhSachBang();

    const options = danhSachBang.map((item) => ({
      id: item.MaBang,
      text: item.TenBang || item.MaBang,
    }));

    cbMaBang = new ComboBox("#filterMaBangContainer", {
      data: [{ id: "all", text: "Tất cả các bảng" }, ...options],
      defaultValue: "all",
      fieldName: "filterMaBang",
      placeholder: "Chọn Bảng cần cấu hình...",
    });

    // Ghi đè hàm setValue để bắt sự kiện thay đổi (Hack tương tự wireBulkCombo)
    const originalSetValue = cbMaBang.setValue.bind(cbMaBang);
    cbMaBang.setValue = async (value, triggerChange = true) => {
      originalSetValue(value);

      if (triggerChange) {
        if (hasUnsavedChanges()) {
          if (
            !confirm(
              "Bạn có thay đổi chưa lưu. Nếu chuyển đổi bảng, các thay đổi sẽ bị mất. Tiếp tục?",
            )
          ) {
            // Hoàn tác lại giá trị cũ mà không trigger change
            cbMaBang.setValue(activeMaBang, false);
            return;
          }
        }
        activeMaBang = value;
        await loadTableData(value);
      }
    };
  }

  // === 3. TẢI DỮ LIỆU & RENDER BẢNG ===
  async function loadTableData(maBang) {
    try {
      if (myTable) {
        myTable.tbody.innerHTML =
          '<tr><td colspan="100%" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';
      }

      // Backend đã hỗ trợ tham số 'all' nên chỉ cần gọi 1 API duy nhất
      const data = await apiDanhMucTruongDuocSuDung.getDanhSachCot(maBang);

      snapshotRows(data);
      modifiedRows = {};
      updateSaveButtonVisibility();
      if (myTable) {
        myTable.setData(data);
      }
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bảng:", error);
      if (typeof showToast !== "undefined")
        showToast("Không thể tải danh sách cấu hình!", true);
    }
  }

  async function initTable() {
    // Bước 1: Khởi tạo DataTable trước (không truyền columns)
    myTable = new DataTable({
      tableId: "dataTable",
      paginationId: "tablePagination",
      enablePagination: false,
      resizableColumns: true,
      rowKey: "ID",
      storageKey: "table_HETHONG_DMTruongDuocSuDung_Config",

      // customCellRender: Chỉ custom cột MaBang để truncate, còn lại để DataTable tự xử lý
      // Các cột badge (HienThi, DuocSua, GhimCot) → DataTable tự render dựa vào KieuTruong='badge'
      // Các cột text, number → DataTable tự render và mở editor khi click
      customCellRender: (row, col) => {
        if (col.MaTruong === "MaBang") {
          return `<div class="truncate" title="${row.MaBang}">${row.MaBang}</div>`;
        }
        return null;
      },

      // getCellEditorOptions: Cấp danh sách dropdown khi user click sửa ô Select
      getCellEditorOptions: async (row, col) => {
        if (col.MaTruong === "CanLe") {
          return ["left", "center", "right"];
        }
        if (col.MaTruong === "KieuTruong") {
          return [
            "text",
            "number",
            "select",
            "badge",
            "capacity",
            "action",
            "mono",
          ];
        }
        // Các cột boolean: cung cấp select True/False thay vì datalist mặc định của badge
        if (
          col.MaTruong === "HienThi" ||
          col.MaTruong === "DuocSua" ||
          col.MaTruong === "GhimCot"
        ) {
          return ["true", "false"];
        }
        return null;
      },

      // onRowDirty: DataTable gọi callback này khi user commit thay đổi 1 ô
      onRowDirty: (row, key, val) => {
        const rowId = row.ID;
        const originalRow = originalRowsById[rowId] || {};

        // Convert string 'true'/'false' → boolean thật sự cho các trường boolean
        const boolFields = ["HienThi", "DuocSua", "GhimCot"];
        // Convert string → int cho các trường number (DataTable trả về đúng int qua normalizeEditedValue
        // nhưng đề phòng trường hợp KieuTruong chưa được đặt đúng trong DB)
        const intFields = ["ThuTuHienThi", "DoRong"];
        let normalizedVal = val;

        if (boolFields.includes(key)) {
          if (val === "true" || val === true) normalizedVal = true;
          else if (val === "false" || val === false) normalizedVal = false;
          row[key] = normalizedVal;
        } else if (intFields.includes(key)) {
          normalizedVal = parseInt(val, 10);
          if (isNaN(normalizedVal)) normalizedVal = 0;
          row[key] = normalizedVal;
        }

        if (valuesAreSame(originalRow[key], normalizedVal)) {
          if (modifiedRows[rowId]) {
            delete modifiedRows[rowId][key];
            if (Object.keys(modifiedRows[rowId]).length === 0) {
              delete modifiedRows[rowId];
            }
          }
        } else {
          if (!modifiedRows[rowId]) {
            modifiedRows[rowId] = { ID: rowId, MaBang: row.MaBang };
          }
          modifiedRows[rowId][key] = normalizedVal;
        }

        row._dirty = Boolean(modifiedRows[rowId]);
        updateSaveButtonVisibility();
      },

      onRenderComplete: () => {
        // Highlight dòng bị sửa
        const trs = myTable.container.querySelectorAll("tbody tr");
        trs.forEach((tr) => {
          const rowId = parseInt(tr.getAttribute("data-id"), 10);
          const rowData = myTable.state.data.find((r) => r.ID === rowId);
          if (rowData && rowData._dirty) tr.classList.add("dirty-row");
          else tr.classList.remove("dirty-row");
        });
      },
    });

    // Bước 2: Lấy cấu hình cột từ API rồi gọi setColumns (giống quan_ly_nhom_lop_hoc_phan.js)
    const rawColsConfig = await apiDanhMucTruongDuocSuDung.getColumnsConfig();
    const colsConfig = TableConfigModal.mergeConfig(
      "table_HETHONG_DMTruongDuocSuDung_Config",
      rawColsConfig,
    );
    myTable.setColumns(colsConfig, rawColsConfig);
  }

  // === 4. XỬ LÝ LƯU HÀNG LOẠT & SỰ KIỆN TĨNH ===
  async function initSaveEvents() {
    // Sự kiện cấu hình hiển thị bảng
    const btnConfigTable = document.getElementById("btnConfigTable");
    if (btnConfigTable && typeof TableConfigModal !== "undefined") {
      btnConfigTable.addEventListener("click", () => {
        TableConfigModal.open(
          "table_HETHONG_DMTruongDuocSuDung_Config",
          myTable.state.rawColumns,
          (newCols) => {
            myTable.setColumns(newCols);
          },
        );
      });
    }

    const btnSaveChanges = document.getElementById("btnSaveChanges");

    if (btnSaveChanges) {
      btnSaveChanges.addEventListener("click", async () => {
        const payloadItems = Object.values(modifiedRows);
        if (payloadItems.length === 0) return;

        btnSaveChanges.disabled = true;
        const originalHTML = btnSaveChanges.innerHTML;
        btnSaveChanges.innerHTML =
          '<span class="spinner" style="width:16px;height:16px;border-width:2px;"></span> Đang lưu...';

        try {
          const payload = { items: payloadItems };
          const data =
            await apiDanhMucTruongDuocSuDung.bulkUpdateDanhSachCot(payload);

          if (typeof showToast !== "undefined") {
            showToast(
              `Lưu thành công ${data.updated_count || payloadItems.length} cấu hình cột!`,
            );
          }

          // Cập nhật lại snapshot và cờ
          payloadItems.forEach((item) => {
            if (originalRowsById[item.ID]) {
              Object.assign(originalRowsById[item.ID], item);
            }
          });

          modifiedRows = {};
          myTable.state.data.forEach((r) => (r._dirty = false));
          updateSaveButtonVisibility();
          myTable.renderAll();
        } catch (error) {
          if (typeof showToast !== "undefined")
            showToast(
              "Lỗi khi lưu: " + (error.message || "Không xác định"),
              true,
            );
        } finally {
          btnSaveChanges.disabled = false;
          btnSaveChanges.innerHTML = originalHTML;
        }
      });
    }

    const quickSearch = document.getElementById("quickSearch");
    if (quickSearch && myTable) {
      quickSearch.addEventListener("input", (e) => {
        myTable.setSearchTerm(e.target.value);
      });
    }
  }

  // === 5. KHỞI TẠO CHUNG ===
  async function init() {
    activeMaBang = "all"; // Default
    await initTable();
    await initMaBangCombobox();
    initSaveEvents();

    // Tải lần đầu
    await loadTableData("all");
  }

  // Chạy khởi tạo
  init();
  window.checkUnsavedChanges = hasUnsavedChanges;
})();
