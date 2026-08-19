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

function isTrueLike(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  return normalized === 'true' || normalized === '1';
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

  const data = await apiLopHocPhanChinhQuy.getHinhThucHoc();
  hinhThucHocOptions = data.map(item => ({
    id: item.MaHTHoc,
    text: item.TenHTHoc
  }));

  return hinhThucHocOptions;
}

async function ensureHinhThucDayOptions() {
  if (hinhThucDayOptions) return hinhThucDayOptions;

  const data = await apiLopHocPhanChinhQuy.getHinhThucDay();
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

    const rawColsConfig = await apiLopHocPhanChinhQuy.getColumnsConfig();
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
      rowKey: 'MaNhomLopHP',
      isRowSelectable: (row) => !(isTrueLike(row.XacNhan) || Number(row.ID_LanTongHopFile || 0) > 0 || isTrueLike(row.TrangThaiThanhToan)),
      isRowEditable: (row) => !(isTrueLike(row.XacNhan) || Number(row.ID_LanTongHopFile || 0) > 0 || isTrueLike(row.TrangThaiThanhToan)),
      isRowLocked: (row) => isTrueLike(row.XacNhan) || Number(row.ID_LanTongHopFile || 0) > 0 || isTrueLike(row.TrangThaiThanhToan),
      getRowClass: (row) => {
        const classes = [];
        if (isTrueLike(row.XacNhan) || Number(row.ID_LanTongHopFile || 0) > 0 || isTrueLike(row.TrangThaiThanhToan)) classes.push('row-confirmed');
        if (Number(row.ID_LanTongHopFile || 0) > 0) classes.push('row-signed');
        if (isTrueLike(row.ThanhToanThinhGiang) || isTrueLike(row.TrangThaiThanhToan) || row.TrangThai === 'Đã thanh toán') classes.push('row-paid');
        return classes.join(' ');
      },
      customCellRender: (row, col) => {
        // Chỉ custom cột có type là badge và không phải trạng thái cố định
        if (col.MaTruong === 'LopChuyen') {
          const val = row[col.MaTruong];
          if (isTrueLike(val)) {
            return `<span class="badge badge-true">✓</span>`;
          } else if (String(val).trim().toLowerCase() === 'false' || val === 0 || val === '0') {
            return `<span class="badge badge-false">✗</span>`;
          }
        }
        if (col.MaTruong === 'XacNhan') {
          if (isTrueLike(row['TrangThaiThanhToan'])) {
            return `<span class="badge">Đã thanh toán</span>`;
          } else if (Number(row.ID_LanTongHopFile || 0) > 0) {
            return `<span class="badge">Chưa thanh toán</span>`;
          } else if (isTrueLike(row['XacNhan'])) {
            return `<span class="badge">Chưa ký</span>`;
          } else {
            return `<span class="badge">Chưa xác nhận</span>`;
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

    const nhomLopData = await apiLopHocPhanChinhQuy.getNhomLopData(hoc_ky, filterParam);
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

  // Ẩn/hiện nút cập nhật hàng loạt theo số lượng dòng được chọn
  const btnToggleBulkUpdate = document.getElementById('btnToggleBulkUpdate');
  if (btnToggleBulkUpdate) {
    btnToggleBulkUpdate.style.display = selectedSize > 0 ? 'inline-flex' : 'none';

    // Nếu bảng không còn dòng nào được chọn nhưng panel vẫn đang mở -> tự động đóng lại
    if (selectedSize === 0 && typeof isBulkPanelOpen !== 'undefined' && isBulkPanelOpen) {
      btnToggleBulkUpdate.click();
    }
  }


  // Tính tổng theo các trạng thái ưu tiên
  let sumPaid = 0;
  let sumUnpaid = 0;
  let sumUnsigned = 0;
  let sumUnconfirmed = 0;

  rows.forEach(r => {
    if (isTrueLike(r['TrangThaiThanhToan'])) {
      sumPaid++;
    } else if (Number(r.ID_LanTongHopFile || 0) > 0) {
      sumUnpaid++;
    } else if (isTrueLike(r['XacNhan'])) {
      sumUnsigned++;
    } else {
      sumUnconfirmed++;
    }
  });

  const statPaidEl = document.getElementById('statPaid');
  if (statPaidEl) statPaidEl.textContent = formatNum(sumPaid);

  const statUnpaidEl = document.getElementById('statUnpaid');
  if (statUnpaidEl) statUnpaidEl.textContent = formatNum(sumUnpaid);

  const statUnsignedEl = document.getElementById('statUnsigned');
  if (statUnsignedEl) statUnsignedEl.textContent = formatNum(sumUnsigned);

  const statUnconfirmedEl = document.getElementById('statUnconfirmed');
  if (statUnconfirmedEl) statUnconfirmedEl.textContent = formatNum(sumUnconfirmed);
}

function renderFooterUI() {
  const footer = document.getElementById('pageFooter');
  if (footer) {
    footer.innerHTML = `
            <span>Tổng số: <b id="statTotal">0</b></span>
            <span>Đã thanh toán: <b id="statPaid" style="color: #D97706">0</b></span>
            <span>Chưa thanh toán (Đã ký): <b id="statUnpaid" style="color: #0284C7">0</b></span>
            <span>Chưa ký (Đã xác nhận): <b id="statUnsigned" style="color: #16A34A">0</b></span>
            <span>Chưa xác nhận: <b id="statUnconfirmed" style="color: var(--text-muted)">0</b></span>
            <span style="margin-left: auto;">Đã chọn: <b id="statSelected" style="color: #ef0202ff">0</b></span>
            <span class="hint" style="margin-left: 14px;">Nháy đúp vào ô để chỉnh sửa</span>
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

  const btnSave = document.getElementById('btnSave');
  if (btnSave) {
    btnSave.addEventListener('click', async () => {
      const selectedIds = Array.from(myTable.state.selected);
      if (selectedIds.length === 0) {
        if (typeof showToast !== 'undefined') showToast("Vui lòng chọn ít nhất một lớp học phần để xác nhận", true);
        return;
      }

      let isOk = true;
      if (typeof confirmModal !== 'undefined') {
        isOk = await confirmModal.show(
          `Bạn có chắc chắn muốn xác nhận ${selectedIds.length} lớp học phần đã chọn?`,
          'Xác nhận hàng loạt',
          'Xác nhận'
        );
      } else {
        isOk = confirm(`Bạn có chắc chắn muốn xác nhận ${selectedIds.length} lớp học phần đã chọn?`);
      }

      if (!isOk) return;

      try {
        btnSave.disabled = true;
        btnSave.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="spin"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg> Đang xử lý...`;

        const namTaiChinh = (typeof navbarState !== 'undefined')
          ? navbarState.selectedNamTaiChinh
          : null;

        const res = await apiLopHocPhanChinhQuy.confirmNhomLopHocPhan(selectedIds, namTaiChinh);
        if (typeof showToast !== 'undefined') {
          showToast(`Đã xác nhận thành công ${res.updated_count} lớp học phần.`);
        }

        // Cập nhật giao diện cục bộ (Inline update) thay vì tải lại toàn bộ dữ liệu
        const updated_rows = selectedIds.map(id => {
          const existingRow = myTable.state.data.find(r => String(r.MaNhomLopHP) === String(id));
          return {
            ...existingRow,
            XacNhan: 1,
            // (Tuỳ chọn) Nếu cột UI cần hiện thời gian xác nhận, có thể tự mock ở đây
          };
        });

        myTable.updateRowsData(updated_rows);

        // Bỏ chọn và render lại UI
        myTable.state.selected.clear();
        snapshotRows(myTable.state.data);
        updateSaveButtonVisibility();
        myTable.renderAll();

      } catch (error) {
        console.error(error);
        if (typeof showToast !== 'undefined') {
          showToast(error.message || 'Lỗi khi xác nhận.', true);
        }
      } finally {
        btnSave.disabled = false;
        btnSave.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7" /></svg> Xác nhận`;
      }
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

      const selectedSet = myTable.state.selected || new Set();
      const targetRows = myTable.getRows().filter(row => !isTrueLike(row.XacNhan) && selectedSet.has(String(row.MaNhomLopHP)));
      const affectedCount = hasBulkChange ? targetRows.length : editedCount;

      if (hasBulkChange && affectedCount === 0) {
        if (typeof showToast !== 'undefined') showToast('Vui lòng chọn (tích vào ô vuông) ít nhất một bản ghi.', true);
        return;
      }

      const message = hasBulkChange
        ? `Bạn có chắc chắn muốn lưu thay đổi cho ${affectedCount} bản ghi đã chọn?`
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
    const selectedSet = myTable.state.selected || new Set();
    const sourceRows = hasBulkChange
      ? myTable.getRows().filter(row => !isTrueLike(row.XacNhan) && selectedSet.has(String(row.MaNhomLopHP)))
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
      MaBang: "CQ_NhomLopHocPhan",
      items
    };

    try {
      const data = await apiLopHocPhanChinhQuy.bulkUpdateNhomLop(payload);
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

    } catch (error) {
      if (typeof showToast !== 'undefined') showToast("Lỗi khi lưu: " + (error.message || "Không xác định"), true);
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
