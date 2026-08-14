// ==========================================
// QUẢN LÝ NHÓM LỚP HỌC PHẦN (Page-Level JS)
// ==========================================
let cbBulkHinhThucHoc = null;
let cbBulkHinhThucDay = null;
let isBulkPanelOpen = false;
let isBulkComboboxLoaded = false;
let hinhThucHocOptions = null;
let hinhThucDayOptions = null;
let bulkMaHTHoc = null;
let bulkMaHTDay = null;
let myTable;
let modifiedRows = {};
let allowLeavePage = false;
let originalRowsById = {};

function hasUnsavedChanges() {
  return Object.keys(modifiedRows).length > 0 || bulkMaHTHoc !== null || bulkMaHTDay !== null;
}

function updateSaveButtonVisibility() {
  const btnSave = document.getElementById('btnSaveChanges');
  if (!btnSave) return;
  btnSave.style.display = hasUnsavedChanges() ? 'inline-flex' : 'none';
}

function valuesAreSame(a, b) {
  return String(a ?? '') === String(b ?? '');
}

function snapshotRows(rows) {
  originalRowsById = {};
  rows.forEach(row => {
    originalRowsById[row.MaNhomLopHP] = { ...row };
  });
}

async function initBulkComboboxes() {
  const [hinhThucHocData, hinhThucDayData] = await Promise.all([
    ensureHinhThucHocOptions(),
    ensureHinhThucDayOptions()
  ]);

  cbBulkHinhThucHoc = new ComboBox('#bulkHinhThucHocContainer', {
    data: [
      { id: '__NO_CHANGE__', text: 'Không thay đổi' },
      ...hinhThucHocData
    ],
    defaultValue: '__NO_CHANGE__',
    fieldName: 'bulkMaHTHoc',
    placeholder: 'Không thay đổi'
  });

  cbBulkHinhThucDay = new ComboBox('#bulkHinhThucDayContainer', {
    data: [
      { id: '__NO_CHANGE__', text: 'Không thay đổi' },
      ...hinhThucDayData
    ],
    defaultValue: '__NO_CHANGE__',
    fieldName: 'bulkMaHTDay',
    placeholder: 'Không thay đổi'
  });

  wireBulkCombo(cbBulkHinhThucHoc, value => {
    bulkMaHTHoc = value;
  });

  wireBulkCombo(cbBulkHinhThucDay, value => {
    bulkMaHTDay = value;
  });
}

async function ensureHinhThucHocOptions() {
  if (hinhThucHocOptions) return hinhThucHocOptions;

  const data = await apiLopHocPhan.getHinhThucHoc();
  hinhThucHocOptions = data.map(item => ({
    id: item.MaHTHoc,
    text: item.TenHTHoc
  }));

  return hinhThucHocOptions;
}

async function ensureHinhThucDayOptions() {
  if (hinhThucDayOptions) return hinhThucDayOptions;

  const data = await apiLopHocPhan.getHinhThucDay();
  hinhThucDayOptions = data.map(item => ({
    id: item.MaHTDay,
    text: item.TenHTDay
  }));

  return hinhThucDayOptions;
}

async function ensureBulkComboboxesLoaded() {
  if (isBulkComboboxLoaded) return;

  await initBulkComboboxes();
  isBulkComboboxLoaded = true;
}

function wireBulkCombo(combo, setter) {
  if (!combo) return;

  const originalSetValue = combo.setValue.bind(combo);

  combo.setValue = (id) => {
    originalSetValue(id);
    const selectedValue = combo.getValue();
    setter(selectedValue === '__NO_CHANGE__' ? null : selectedValue);
    updateSaveButtonVisibility();
  };

  combo.inputField.addEventListener('input', () => {
    if (combo.inputField.value.trim() === '') {
      combo.setValue('__NO_CHANGE__');
      updateSaveButtonVisibility();
    }
  });
}

/**
 * Khởi tạo dữ liệu cốt lõi (Cấu hình cột) 1 lần duy nhất khi mở trang.
 * Không tải data bảng ngay lúc này, mà chờ Navbar báo cáo "ContextReady".
 */
async function init() {
  try {
    renderFooterUI();

    const rawColsConfig = await apiLopHocPhan.getColumnsConfig();
    const colsConfig = TableConfigModal.mergeConfig('table_CQ_NhomLopHocPhan_Config', rawColsConfig);

    // Khởi tạo DataTable Component
    myTable = new DataTable({
      tableId: 'dataTable',
      paginationId: 'tablePagination',
      enablePagination: false,
      incrementalRender: true,
      incrementalBatchSize: 100,
      resizableColumns: true,
      storageKey: 'table_CQ_NhomLopHocPhan_Config',
      isRowSelectable: (row) => row.XacNhan !== true, // Không cho chọn nếu đã xác nhận
      isRowEditable: (row) => row.XacNhan !== true,   // Không cho sửa nếu đã xác nhận
      customCellRender: (row, col) => {
        // Chỉ custom cột có type là badge và không phải trạng thái cố định
        if (col.MaTruong === 'LopChuyen') {
          const val = row[col.MaTruong];
          if (val === true || String(val).toLowerCase() === 'true') {
            return `<span class="badge badge-true">✓</span>`;
          } else if (val === false || String(val).toLowerCase() === 'false') {
            return `<span class="badge badge-false">✗</span>`;
          }
        }
        if (col.MaTruong === 'XacNhan') {
          const val = row[col.MaTruong];
          if (val === true || String(val).toLowerCase() === 'true') {
            return `<span class="badge badge-true">Đã xác nhận</span>`;
          } else if (val === false || String(val).toLowerCase() === 'false') {
            return `<span class="badge badge-false">Chưa xác nhận</span>`;
          }
        }
        return null; // Trả về null để datatable dùng cách hiển thị mặc định
      },
      getCellEditorOptions: async (row, col) => {
        if (col.MaTruong === 'TenHTHoc') {
          const options = await ensureHinhThucHocOptions();
          return options.map(item => item.text);
        }

        if (col.MaTruong === 'TenHTDay') {
          const options = await ensureHinhThucDayOptions();
          return options.map(item => item.text);
        }

        return null;
      },
      onRowDirty: (row, key, val) => {
        const rowId = row.MaNhomLopHP;
        const originalRow = originalRowsById[rowId] || {};

        if (key === 'TenHTHoc') {
          const matched = hinhThucHocOptions?.find(item => item.text === val);
          if (!matched) {
            row.TenHTHoc = originalRow.TenHTHoc;
            row._dirty = Boolean(modifiedRows[rowId]);
            if (typeof showToast !== 'undefined') showToast('Vui lòng chọn hình thức học trong danh sách.', true);
            updateSaveButtonVisibility();
            return;
          }

          row.TenHTHoc = matched.text;
          row.MaHTHoc = matched.id;
          key = 'MaHTHoc';
          val = matched.id;
        }

        if (key === 'TenHTDay') {
          const matched = hinhThucDayOptions?.find(item => item.text === val);
          if (!matched) {
            row.TenHTDay = originalRow.TenHTDay;
            row._dirty = Boolean(modifiedRows[rowId]);
            if (typeof showToast !== 'undefined') showToast('Vui lòng chọn hình thức dạy trong danh sách.', true);
            updateSaveButtonVisibility();
            return;
          }

          row.TenHTDay = matched.text;
          row.MaHTDay = matched.id;
          key = 'MaHTDay';
          val = matched.id;
        }

        if (valuesAreSame(originalRow[key], val)) {
          if (modifiedRows[rowId]) {
            delete modifiedRows[rowId][key];
            if (Object.keys(modifiedRows[rowId]).length === 0) {
              delete modifiedRows[rowId];
            }
          }
        } else {
          if (!modifiedRows[rowId]) {
            modifiedRows[rowId] = {};
          }
          modifiedRows[rowId][key] = val;
        }

        if (key === 'SiSoChuyenDoi' || key === 'SiSoDKH') {
          const sisoCD = parseFloat(row.SiSoChuyenDoi) || 0;
          const sisoDKH = parseFloat(row.SiSoDKH) || 0;
          row.SoSinhVien = sisoCD + sisoDKH;
        }

        row._dirty = Boolean(modifiedRows[rowId]);
        updateSaveButtonVisibility();
      },
      onSelectionChange: (selectedSet) => {
        updateFooter(myTable.getRows(), selectedSet);
      },
      onRenderComplete: (allRows, selectedSet) => {
        updateFooter(allRows, selectedSet);

        // Thêm class css row-locked cho các dòng đã xác nhận
        const trs = document.querySelectorAll('#dataTable tbody tr');
        trs.forEach(tr => {
          const rowId = tr.getAttribute('data-id');
          const rowData = allRows.find(r => String(r.MaNhomLopHP) === String(rowId));
          if (rowData && rowData.XacNhan === true) {
            tr.classList.add('row-locked');
          }
        });
      }
    });

    myTable.setColumns(colsConfig, rawColsConfig);
    bindStaticEvents();
  } catch (error) {
    console.error("Lỗi khi tải cấu hình cột:", error);
    if (typeof showToast !== 'undefined') showToast("Không thể tải cấu hình bảng từ máy chủ!");
  }
}

/**
 * Hàm tải dữ liệu bảng lưới dựa trên hoc_ky
 */
async function loadTableData(hoc_ky) {
  try {
    if (myTable) {
      myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px;">Đang tải dữ liệu...</td></tr>';
    }

    const urlParams = new URLSearchParams(window.location.search);
    const filterParam = urlParams.get('filter');

    const nhomLopData = await apiLopHocPhan.getNhomLopData(hoc_ky, filterParam);
    snapshotRows(nhomLopData);
    modifiedRows = {};
    updateSaveButtonVisibility();
    if (myTable) {
      myTable.setData(nhomLopData);
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu bảng:", error);
    if (typeof showToast !== 'undefined') showToast("Không thể tải dữ liệu Lớp học phần!");
    if (myTable) {
      myTable.tbody.innerHTML = '<tr><td colspan="100%" style="text-align:center; padding: 20px; color: var(--red-600);">Lỗi tải dữ liệu</td></tr>';
    }
  }
}

// Bắt sự kiện khi Navbar đã nạp xong Context (Lần đầu mở trang)
window.addEventListener('ContextReady', (e) => {
  const hoc_ky = e.detail;
  loadTableData(hoc_ky);
});

// Bắt sự kiện khi người dùng đổi Năm học/Học kỳ trên Navbar
window.addEventListener('ContextChanged', (e) => {
  const hoc_ky = e.detail;
  if (hasUnsavedChanges()) {
    if (typeof confirmModal !== 'undefined') {
      confirmModal.show("Có dữ liệu chưa lưu. Việc đổi học kỳ sẽ làm mất thay đổi. Tiếp tục?", "Cảnh báo", "Tiếp tục").then(isOk => {
        if (isOk) {
          modifiedRows = {};
          updateSaveButtonVisibility();
          loadTableData(hoc_ky);
        }
      });
      return;
    }
  }
  loadTableData(hoc_ky);
});

/**
 * Hàm phụ trợ cập nhật các con số Thống kê ở Footer
 * @param {Array} rows - Các dòng dữ liệu đang được hiển thị
 * @param {Set} selectedSet - Tập hợp ID các dòng đang được chọn
 */
function updateFooter(rows, selectedSet = null) {
  const selectedSize = selectedSet ? selectedSet.size : (myTable ? myTable.state.selected.size : 0);

  const totalRowsEl = document.getElementById('statTotal');
  if (totalRowsEl) totalRowsEl.textContent = myTable ? myTable.state.data.length : 0;

  const filteredEl = document.getElementById('statFiltered');
  if (filteredEl) filteredEl.textContent = rows.length;

  const selSpan = document.getElementById('statSelected');
  if (selSpan) {
    selSpan.textContent = selectedSize;
  }

  // Tính tổng sinh viên, tổng tín chỉ, số đã xác nhận, chưa xác nhận
  let sumSv = 0;
  let sumTc = 0;
  let sumConfirmed = 0;
  let sumUnconfirmed = 0;

  rows.forEach(r => {
    sumSv += (r.SoSinhVien || 0);
    sumTc += (r.SoTinChi || 0);
    if (r.XacNhan === true) {
      sumConfirmed++;
    } else {
      sumUnconfirmed++;
    }
  });

  const sumSvEl = document.getElementById('statSV');
  if (sumSvEl) sumSvEl.textContent = formatNum(sumSv);

  const sumTcEl = document.getElementById('statTC');
  if (sumTcEl) sumTcEl.textContent = formatNum(sumTc);

  const statConfirmedEl = document.getElementById('statConfirmed');
  if (statConfirmedEl) statConfirmedEl.textContent = formatNum(sumConfirmed);

  const statUnconfirmedEl = document.getElementById('statUnconfirmed');
  if (statUnconfirmedEl) statUnconfirmedEl.textContent = formatNum(sumUnconfirmed);
}

function renderFooterUI() {
  const footer = document.getElementById('pageFooter');
  if (footer) {
    footer.innerHTML = `
            <span>Tổng số: <b id="statTotal">0</b> nhóm lớp</span>
            <span>Đang hiển thị: <b id="statFiltered">0</b></span>
            <span>Đã chọn: <b id="statSelected">0</b></span>
            <span>Tổng SV: <b id="statSV">0</b></span>
            <span>Tổng số TC: <b id="statTC">0</b></span>
            <span>Đã xác nhận: <b id="statConfirmed">0</b></span>
            <span>Chưa xác nhận: <b id="statUnconfirmed">0</b></span>
            <span class="hint">Nháy đúp vào ô để chỉnh sửa · Lớp đã xác nhận không thể chỉnh sửa</span>
        `;
  }
}

function formatNum(num) {
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Trạm điều hướng các sự kiện tĩnh, được gắn vào các Control riêng biệt nằm BÊN NGOÀI bảng
 */
function bindStaticEvents() {
  // Tìm kiếm nhanh
  const quickSearch = document.getElementById('quickSearch');
  if (quickSearch) {
    quickSearch.addEventListener('input', e => {
      myTable.setSearch(e.target.value);
    });
  }

  const btnToggleBulkUpdate = document.getElementById('btnToggleBulkUpdate');
  const bulkUpdatePanel = document.getElementById('bulkUpdatePanel');
  if (btnToggleBulkUpdate && bulkUpdatePanel) {
    btnToggleBulkUpdate.addEventListener('click', async () => {
      isBulkPanelOpen = !isBulkPanelOpen;

      bulkUpdatePanel.hidden = !isBulkPanelOpen;
      btnToggleBulkUpdate.setAttribute('aria-expanded', String(isBulkPanelOpen));
      btnToggleBulkUpdate.textContent = isBulkPanelOpen ? 'Đóng cập nhật hàng loạt' : 'Cập nhật hàng loạt';
      btnToggleBulkUpdate.classList.toggle('btn-primary', !isBulkPanelOpen);
      btnToggleBulkUpdate.classList.toggle('btn-danger', isBulkPanelOpen);

      if (isBulkPanelOpen) {
        await ensureBulkComboboxesLoaded();
      } else {
        bulkMaHTHoc = null;
        bulkMaHTDay = null;

        if (cbBulkHinhThucHoc) cbBulkHinhThucHoc.setValue('__NO_CHANGE__');
        if (cbBulkHinhThucDay) cbBulkHinhThucDay.setValue('__NO_CHANGE__');

        updateSaveButtonVisibility();
      }
    });
  }

  window.addEventListener('beforeunload', (event) => {
    if (allowLeavePage) return;
    if (!hasUnsavedChanges()) return;

    event.preventDefault();
    event.returnValue = '';
  });

  document.addEventListener('click', async (event) => {
    const link = event.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

    if (!hasUnsavedChanges()) return;

    event.preventDefault();

    let isOk = false;
    if (typeof confirmModal !== 'undefined') {
      isOk = await confirmModal.show(
        'Có bản ghi chỉnh sửa chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?',
        'Rời khỏi trang',
        'Rời khỏi'
      );
    }

    if (isOk) {
      allowLeavePage = true;
      modifiedRows = {};
      window.location.href = href;
    }
  }, true);

  // Sự kiện cấu hình hiển thị bảng
  const btnConfigTable = document.getElementById('btnConfigTable');
  if (btnConfigTable && typeof TableConfigModal !== 'undefined') {
    btnConfigTable.addEventListener('click', () => {
      TableConfigModal.open('table_CQ_NhomLopHocPhan_Config', myTable.state.rawColumns, (newCols) => {
        myTable.setColumns(newCols);
      });
    });
  }

  // Sự kiện Lưu thay đổi
  const btnSaveChanges = document.getElementById('btnSaveChanges');
    if (btnSaveChanges) {
      btnSaveChanges.addEventListener('click', async () => {
      const editedCount = Object.keys(modifiedRows).length;
      const hasBulkChange = bulkMaHTHoc !== null || bulkMaHTDay !== null;

      if (editedCount === 0 && !hasBulkChange) return;

      const visibleRows = myTable.getRows().filter(row => row.XacNhan !== true);
      const affectedCount = hasBulkChange ? visibleRows.length : editedCount;

      if (hasBulkChange && affectedCount === 0) {
        if (typeof showToast !== 'undefined') showToast('Không có bản ghi đang hiển thị có thể cập nhật.', true);
        return;
      }

      const message = hasBulkChange
        ? `Bạn có chắc chắn muốn lưu thay đổi cho ${affectedCount} bản ghi đang hiển thị?`
        : `Bạn có chắc chắn muốn lưu ${editedCount} thay đổi?`;

      if (typeof confirmModal !== 'undefined') {
        confirmModal.show(message, "Xác nhận Lưu").then(async isOk => {
          if (isOk) {
            await submitSaveChanges();
          }
        });
      }
    });
  }

  history.pushState({ guardUnsaved: true }, '', window.location.href);

  window.addEventListener('popstate', async () => {
    if (!hasUnsavedChanges()) {
      history.back();
      return;
    }

    history.pushState({ guardUnsaved: true }, '', window.location.href);

    let isOk = false;
    if (typeof confirmModal !== 'undefined') {
      isOk = await confirmModal.show(
        'Có bản ghi chỉnh sửa chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?',
        'Rời khỏi trang',
        'Rời khỏi'
      );
    }

    if (isOk) {
      allowLeavePage = true;
      modifiedRows = {};
      history.back();
    }
  });
}

async function submitSaveChanges() {
  const btnSaveChanges = document.getElementById('btnSaveChanges');
  btnSaveChanges.disabled = true;
  const originalHTML = btnSaveChanges.innerHTML;
  btnSaveChanges.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Đang lưu...';

  try {
    const hasBulkChange = bulkMaHTHoc !== null || bulkMaHTDay !== null;
    const sourceRows = hasBulkChange
      ? myTable.getRows().filter(row => row.XacNhan !== true)
      : Object.keys(modifiedRows).map(id => ({ MaNhomLopHP: id }));

    const items = sourceRows.map(row => {
      const rowId = String(row.MaNhomLopHP);
      const updates = { ...(modifiedRows[rowId] || {}) };

      if (bulkMaHTHoc !== null) {
        updates.MaHTHoc = bulkMaHTHoc;
      }

      if (bulkMaHTDay !== null) {
        updates.MaHTDay = bulkMaHTDay;
      }

      return {
        MaNhomLopHP: rowId,
        updates
      };
    }).filter(item => Object.keys(item.updates).length > 0);

    if (items.length === 0) {
      btnSaveChanges.disabled = false;
      btnSaveChanges.innerHTML = originalHTML;
      updateSaveButtonVisibility();
      return;
    }

    const payload = {
      TenBang: "CQ_NhomLopHocPhan",
      items
    };

    const res = await fetch('/api/v1/cq-nhom-lop-hoc-phan/bulk-update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      if (typeof showToast !== 'undefined') showToast("Đã lưu thay đổi thành công!");
      modifiedRows = {};
      bulkMaHTHoc = null;
      bulkMaHTDay = null;
      if (cbBulkHinhThucHoc) cbBulkHinhThucHoc.setValue('__NO_CHANGE__');
      if (cbBulkHinhThucDay) cbBulkHinhThucDay.setValue('__NO_CHANGE__');
      btnSaveChanges.disabled = false;
      btnSaveChanges.innerHTML = originalHTML;

      // Cập nhật dữ liệu động từng dòng (Inline update)
      if (data && data.updated_rows) {
        myTable.updateRowsData(data.updated_rows);
      }
      
      // Xóa cờ dirty của toàn bộ dòng (phòng trường hợp updateRowsData chưa xử lý hết)
      myTable.state.data.forEach(r => r._dirty = false);
      snapshotRows(myTable.state.data);
      updateSaveButtonVisibility();
      myTable.renderAll();
    } else {
      const err = await res.json();
      if (typeof showToast !== 'undefined') showToast("Lỗi khi lưu: " + (err.detail || "Không xác định"), true);
      btnSaveChanges.disabled = false;
      btnSaveChanges.innerHTML = originalHTML;
    }
  } catch (error) {
    if (typeof showToast !== 'undefined') showToast("Lỗi kết nối máy chủ", true);
    btnSaveChanges.disabled = false;
    btnSaveChanges.innerHTML = originalHTML;
  }
}

// Chạy hàm khởi tạo trang
init();
