// static/js/components/datatable.js
// ==========================================
// 1. UTILITIES & ICONS
// ==========================================

/**
 * Trả về chuỗi SVG cho icon ổ khóa (Đã khóa/Thanh toán)
 * @returns {string} Chuỗi HTML của icon
 */
function iconLock() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';
}

/**
 * Trả về chuỗi SVG cho icon làm mới (Tính lại)
 * @returns {string} Chuỗi HTML của icon
 */
function iconRefresh() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M5 9a8 8 0 0 1 14-2M19 15a8 8 0 0 1-14 2"/></svg>';
}

/**
 * Trả về chuỗi SVG cho icon bánh răng cấu hình.
 * @returns {string} Chuỗi HTML của icon
 */
function iconGear() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1A2 2 0 1 1 4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.3 7A2 2 0 1 1 7.1 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1A2 2 0 1 1 19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.1a2 2 0 1 1 0 4H21a1.7 1.7 0 0 0-1.6 1z"/></svg>';
}

/**
 * Trả về chuỗi SVG cho icon bút chì chỉnh sửa.
 * @returns {string} Chuỗi HTML của icon
 */
function iconPencil() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>';
}

/**
 * Trả về chuỗi SVG cho icon thùng rác xóa.
 * @returns {string} Chuỗi HTML của icon
 */
function iconTrash() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
}

/**
 * Tạo cụm nút thao tác cho dòng cấu hình công thức.
 * @param {Object} row - Dòng dữ liệu hiện tại
 * @returns {string} Chuỗi HTML của cụm nút thao tác
 */
function actionButtonsHtml(row) {
  const id = esc(row.ID_Nhom_CT ?? row.id ?? '');
  return `
    <button class="mini-btn mini-btn-action mini-btn-config" data-action="config" data-id="${id}" title="Cấu hình" aria-label="Cấu hình">${iconGear()}</button>
    <button class="mini-btn mini-btn-action mini-btn-edit" data-action="edit" data-id="${id}" title="Sửa" aria-label="Sửa">${iconPencil()}</button>
    <button class="mini-btn mini-btn-action mini-btn-delete" data-action="delete" data-id="${id}" title="Xóa" aria-label="Xóa">${iconTrash()}</button>
  `;
}

/**
 * Tạo huy hiệu (badge) hiển thị trạng thái với màu sắc tương ứng
 * @param {string} v - Giá trị trạng thái (VD: 'Đã thanh toán', 'Đã xác nhận')
 * @returns {string} Chuỗi HTML của badge
 */
function badgeHtml(v) {
  if (v === true || String(v).toLowerCase() === 'true') return `<span class="badge badge-true">True</span>`;
  if (v === false || String(v).toLowerCase() === 'false') return `<span class="badge badge-false">False</span>`;
  if (v === 'Đã thanh toán') return `<span class="badge badge-blue">${iconLock()}${esc(v)}</span>`;
  if (v === 'Đã xác nhận') return `<span class="badge badge-green">${esc(v)}</span>`;
  return `<span class="badge badge-gray">${esc(v)}</span>`;
}


// ==========================================
// 2. DATATABLE COMPONENT
// ==========================================

/**
 * Lớp quản lý bảng dữ liệu động, bao gồm logic Lọc, Sắp xếp, Chỉnh sửa, và Phân trang.
 */
class DataTable {

  // --- A. INITIALIZATION ---

  /**
   * Khởi tạo bảng dữ liệu mới
   * @param {Object} config - Cấu hình bảng
   * @param {string} config.tableId - ID của thẻ chứa bảng (Container)
   * @param {string} config.paginationId - ID của thẻ chứa phân trang
   * @param {number} [config.pageSize=100] - Số dòng trên mỗi trang
   * @param {Function} [config.onRowDirty] - Callback khi một ô bị chỉnh sửa
   * @param {Function} [config.onSelectionChange] - Callback khi chọn/bỏ chọn checkbox dòng
   * @param {Function} [config.onRenderComplete] - Callback khi bảng vẽ xong (dùng để update footer)
   * @param {Function} [config.customCellRender] - Callback tùy chỉnh hiển thị ô
   * @param {Function} [config.getCellEditorOptions] - Callback tải danh sách gợi ý khi sửa ô
   */
  constructor(config) {
    this.container = document.getElementById(config.tableId);
    this.tbody = this.container.querySelector('tbody');
    this.thead = this.container.querySelector('thead');
    this.paginationEl = document.getElementById(config.paginationId);
    this.getCellEditorOptions = config.getCellEditorOptions || null;
    this.state = {
      data: [], columns: [], sortKey: null, sortDir: 1, filters: {}, search: '',
      selected: new Set(), currentPage: 1, pageSize: config.pageSize || 100,
      rawColumns: []
    };

    this.stickyOffsets = {};
    this.filterDropdownEl = null;
    this.openFilterKey = null;
    this.onRowDirty = config.onRowDirty || function () { };
    this.onSelectionChange = config.onSelectionChange || function () { };
    this.onRenderComplete = config.onRenderComplete || function () { };
    this.pageSizeEl = document.getElementById(config.pageSizeId) || null;
    this.enablePagination = config.enablePagination !== false;
    this.customCellRender = config.customCellRender || null;
    this.isRowSelectable = config.isRowSelectable || (() => true);
    this.isRowEditable = config.isRowEditable || (() => true);

    this.outsideClickHandler = this.outsideClickHandler.bind(this);

    this.bindEvents();
  }

  // --- B. DATA & STATE MANAGEMENT ---

  /**
   * Cập nhật cấu hình cột cho bảng
   * @param {Array} colsConfig - Mảng cấu hình cột đã được hợp nhất
   * @param {Array|null} rawColumns - Mảng cấu hình cột nguyên gốc từ server
   */
  setColumns(colsConfig, rawColumns = null) {
    this.state.columns = colsConfig.filter(c => c.HienThi).sort((a, b) => a.ThuTuHienThi - b.ThuTuHienThi);
    if (rawColumns) this.state.rawColumns = rawColumns;
    this.calculateSticky();
    this.thead.innerHTML = `<tr>${this.buildHeaderHTML()}</tr>`;
    this.renderAll();
  }

  /**
   * Nạp mảng dữ liệu mới vào bảng
   * @param {Array} data - Mảng dữ liệu chứa các Object (các dòng)
   */
  setData(data) {
    this.state.data = data;
    this.state.currentPage = 1;
    this.state.filters = {};
    this.state.selected.clear();
    this.renderAll();
  }

  /**
   * Cập nhật dữ liệu cho các dòng (Inline update) mà không cần nạp lại toàn bộ bảng
   * @param {Array} updatedRows - Mảng các object chứa dữ liệu mới của các dòng
   * @param {string} primaryKey - Tên trường định danh (mặc định: MaNhomLopHP)
   */
  updateRowsData(updatedRows, primaryKey = 'MaNhomLopHP') {
    if (!updatedRows || updatedRows.length === 0) return;

    // Tạo lookup table cho nhanh
    const updateMap = {};
    updatedRows.forEach(row => {
      if (row[primaryKey] !== undefined) {
        updateMap[row[primaryKey]] = row;
      }
    });

    // Cập nhật vào data gốc
    this.state.data.forEach(row => {
      const rowId = row[primaryKey];
      if (updateMap[rowId]) {
        // Ghi đè các trường mới vào dòng cũ
        Object.assign(row, updateMap[rowId]);
      }
    });

    // Render lại giao diện
    this.renderAll();
  }

  /**
   * Đặt từ khóa tìm kiếm nhanh và vẽ lại bảng
   * @param {string} keyword - Từ khóa tìm kiếm
   */
  setSearch(keyword) {
    this.state.search = keyword;
    this.state.currentPage = 1;
    this.renderAll();
    this.updateFilterCountBadge();
  }

  /**
   * Trả về danh sách các dòng dữ liệu sau khi đã Áp dụng bộ Lọc và Sắp xếp
   * @returns {Array} Mảng các dòng dữ liệu hợp lệ để hiển thị
   */
  getRows() {
    let rows = this.state.data.filter(r => {
      if (this.state.search) {
        const s = this.state.search.toLowerCase();
        // Nối tất cả các giá trị của các cột đang cấu hình thành một chuỗi để tìm kiếm chung
        const hay = this.state.columns.map(c => r[c.MaTruong] || '').join(' ').toLowerCase();
        if (!hay.includes(s)) return false;
      }
      for (const key in this.state.filters) {
        const allowed = this.state.filters[key];
        const valStr = String(r[key]);
        const valNum = parseFloat(valStr) || 0;

        if (allowed && typeof allowed === 'object' && allowed.type === 'mixed') {
          if (allowed.min !== null && valNum < allowed.min) return false;
          if (allowed.max !== null && valNum > allowed.max) return false;
          if (!allowed.values.has(valStr)) return false;
        } else if (allowed && typeof allowed === 'object' && allowed.type === 'range') {
          if (allowed.min !== null && valNum < allowed.min) return false;
          if (allowed.max !== null && valNum > allowed.max) return false;
        } else if (allowed instanceof Set) {
          if (!allowed.has(valStr)) return false;
        }
      }
      return true;
    });



    if (this.state.sortKey) {
      const key = this.state.sortKey, dir = this.state.sortDir;
      const col = this.state.columns.find(c => c.MaTruong === key);
      const isNum = col && (col.KieuTruong === 'number' || col.KieuTruong === 'capacity');

      rows = rows.slice().sort((a, b) => {
        let av = a[key], bv = b[key];
        if (isNum) {
          let nA = parseFloat(av) || 0;
          let nB = parseFloat(bv) || 0;
          return (nA - nB) * dir;
        }
        av = String(av ?? '').toLowerCase();
        bv = String(bv ?? '').toLowerCase();
        return av.localeCompare(bv, 'vi', { numeric: true }) * dir;
      });
    }
    return rows;
  }

  /**
   * Thay đổi trạng thái sắp xếp của một cột
   * @param {string} key - Mã trường (MaTruong) của cột cần sắp xếp
   */
  toggleSort(key) {
    if (this.state.sortKey === key) {
      if (this.state.sortDir === 1) { this.state.sortDir = -1; }
      else { this.state.sortKey = null; this.state.sortDir = 1; }
    } else { this.state.sortKey = key; this.state.sortDir = 1; }
    this.state.currentPage = 1;
    this.renderAll();
  }

  /**
   * Tính toán khoảng cách `left` cho các cột được ghim (sticky)
   */
  calculateSticky() {
    let cum = 40; // 40px cho cột checkbox đầu tiên
    this.state.columns.forEach(c => {
      if (c.GhimCot || c.ThuTuHienThi <= 2) {
        this.stickyOffsets[c.MaTruong] = cum;
        cum += c.DoRong;
        c.sticky = true;
      } else {
        c.sticky = false;
      }
    });
  }

  // --- C. RENDERING & HTML BUILDERS ---

  /**
   * Định dạng số hiển thị cho gọn gàng (VD: 1 chữ số thập phân)
   * @param {number|string} v - Giá trị cần định dạng
   * @param {string} key - Mã trường để xác định logic định dạng
   * @returns {string} Chuỗi hiển thị
   */
  formatNum(v, key) {
    if (key === 'HeSoHocDi' || key === 'HeSoHP') return Number(v || 0).toFixed(1);
    return String(v || 0);
  }

  /**
   * Trả về HTML cho từng ô (cell) cụ thể
   * @param {Object} row - Dòng dữ liệu
   * @param {Object} col - Cấu hình cột
   * @returns {string} Chuỗi HTML nội dung ô
   */
  cellDisplay(row, col) {
    if (this.customCellRender) {
      const customHtml = this.customCellRender(row, col);
      if (customHtml !== null) return customHtml;
    }
    const v = row[col.MaTruong];
    switch (col.KieuTruong) {
      case 'badge': return badgeHtml(v);
      case 'badge_list': return this.badgeListHtml(v, col);
      case 'capacity': return this.capacityHtml(row);
      case 'action': return actionButtonsHtml(row);
      case 'mono': return `<span class="mono-text">${esc(v)}</span>`;
      case 'number': return `<span class="num-text">${this.formatNum(v, col.MaTruong)}</span>`;
      case 'formula': return this.formatFormulaHtml(v);
      default: return `<span>${esc(v)}</span>`;
    }
  }

  /**
   * Trả về HTML hiển thị danh sách các badge từ một chuỗi phân cách bởi dấu phẩy
   * @param {string} v - Chuỗi các giá trị (VD: "Lý thuyết, Bài tập")
   * @param {Object} col - Object chứa thông tin cấu hình cột
   * @returns {string} Chuỗi HTML chứa các badge
   */
  badgeListHtml(v, col) {
    if (!v) return '<span class="text-muted">Chưa cấu hình</span>';

    // Tách chuỗi theo dấu phẩy, loại bỏ khoảng trắng và các phần tử rỗng
    const items = String(v).split(',').map(s => s.trim()).filter(s => s);

    if (items.length === 0) return '<span class="text-muted">Chưa cấu hình</span>';

    // Xác định lề
    let justify = 'flex-start';
    if (col && col.CanLe === 'center') justify = 'center';
    else if (col && col.CanLe === 'right') justify = 'flex-end';

    // Gộp các badge lại thành chuỗi HTML
    const badges = items.map(item => `<span class="badge badge-gray">${esc(item)}</span>`);
    return `<div class="badge-list-container" style="display:flex; flex-wrap:wrap; gap:4px; justify-content: ${justify};">${badges.join('')}</div>`;
  }

  /**
   * Định dạng chuỗi công thức: [VAR:Tên Biến] * max([VAR:Tên Biến], 10)
   */
  formatFormulaHtml(v) {
    if (!v) return '<span class="text-muted">Chưa cấu hình</span>';

    // 1. Format biến số [VAR:Tên Biến]
    let html = String(v).replace(/\[VAR:([^\]]+)\]/g, '<span class="fm-var">$1</span>');

    // 2. Format hàm (max, min, round)
    html = html.replace(/\b(max|min|round)\b/gi, '<span class="fm-func">$1</span>');

    // 3. Format hằng số
    html = html.replace(/(?<!\[VAR:.*?)\b(\d+(\.\d+)?)\b/g, '<span class="fm-num">$1</span>');

    // 4. Format phép toán
    html = html.replace(/([+\-*/])/g, '<span class="fm-op">$1</span>');
    html = html.replace(/([(),])/g, '<span class="fm-paren">$1</span>');

    return `<div style="white-space:normal; line-height:1.6; word-wrap:break-word;">${html}</div>`;
  }

  /**
   * Render HTML cho cột biểu đồ dung lượng (sĩ số / sức chứa)
   * @param {Object} row - Dòng dữ liệu chứa thông tin sĩ số
   * @returns {string} HTML bar chart hiển thị sức chứa
   */
  capacityHtml(row) {
    const soSV = row.SoSinhVien || 0;
    const siSoDKH = row.SiSoDKH || 0;
    const ratio = soSV > 0 ? siSoDKH / soSV : 0;
    const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
    let color = 'var(--teal-600)';
    if (ratio > 1) color = 'var(--red-600)'; else if (ratio >= 0.95) color = 'var(--amber-600)';
    return `<div class="cap-cell"><span class="cap-num">${siSoDKH}</span><div class="cap-bar"><div class="cap-fill" style="width:${pct}%;background:${color};"></div></div></div>`;
  }

  /**
   * Xây dựng mã HTML cho toàn bộ thanh Tiêu đề (Thead)
   * @returns {string} Chuỗi HTML bao gồm thẻ <tr> và các thẻ <th>
   */
  buildHeaderHTML() {
    const selectableRows = this.getRows().filter(r => this.isRowSelectable(r));
    const allSelected = selectableRows.length > 0 && selectableRows.every(r => this.state.selected.has(String(r.MaNhomLopHP)));
    const checkboxTh = `<th class="select-th" style="width:40px;min-width:40px;max-width:40px;"><input type="checkbox" id="selectAll" ${allSelected ? 'checked' : ''}></th>`;
    const ths = this.state.columns.map(col => {
      const stickyStyle = col.sticky ? `left:${this.stickyOffsets[col.MaTruong]}px;` : '';
      return `<th data-col="${col.MaTruong}" class="${col.sticky ? 'sticky-th' : ''}" style="width:${col.DoRong}px;min-width:${col.DoRong}px;max-width:${col.DoRong}px;${stickyStyle}; text-align:center;">
        <div class="th-inner">
          <span class="th-label" title="${esc(col.TenTruong)}">${esc(col.TenTruong)}</span>
          <span class="th-actions">${this.sortIconHtml(col.MaTruong)}${this.filterIconHtml(col.MaTruong)}</span>
        </div>
      </th>`;
    }).join('');
    return checkboxTh + ths;
  }

  /**
   * Tạo HTML cho nút sắp xếp của cột chỉ định
   * @param {string} key - Mã cột
   * @returns {string} Nút sắp xếp bằng HTML
   */
  sortIconHtml(key) {
    const isOn = this.state.sortKey === key;
    const upOn = isOn && this.state.sortDir === 1;
    const dnOn = isOn && this.state.sortDir === -1;
    return `<button class="sort-btn" data-key="${key}" title="Sắp xếp" aria-label="Sắp xếp theo cột">
      <svg width="10" height="12" viewBox="0 0 10 12"><polygon class="arrow-up ${upOn ? 'on' : ''}" points="5,0 10,5 0,5"/><polygon class="arrow-down ${dnOn ? 'on' : ''}" points="5,12 10,7 0,7"/></svg>
    </button>`;
  }

  /**
   * Tạo HTML cho nút phễu lọc của cột chỉ định
   * @param {string} key - Mã cột
   * @returns {string} Nút lọc bằng HTML
   */
  filterIconHtml(key) {
    const active = this.state.filters[key] ? 'active' : '';
    return `<button class="filter-btn ${active}" data-key="${key}" title="Lọc" aria-label="Lọc theo cột">
      <svg width="12" height="12" viewBox="0 0 16 16"><path d="M1 2h14l-5.5 6.5V13l-3 1.5V8.5z"/></svg>
    </button>`;
  }

  /**
   * Trả về HTML cho 1 dòng (row) cụ thể
   * @param {Object} row - Dòng dữ liệu
   * @returns {string} Thẻ <tr> chứa các <td>
   */
  renderRowHTML(row) {
    const selectable = this.isRowSelectable(row);
    const checkboxCell = `<td class="select-cell sticky-cell" style="left:0;width:40px;min-width:40px;max-width:40px;"><input type="checkbox" class="row-check" ${this.state.selected.has(String(row.MaNhomLopHP)) ? 'checked' : ''} ${!selectable ? 'disabled' : ''}></td>`;

    const editable = this.isRowEditable(row);
    const cells = this.state.columns.map(col => {
      const stickyStyle = col.sticky ? `left:${this.stickyOffsets[col.MaTruong]}px;` : '';
      const canEditCell = editable && col.DuocSua;
      return `<td data-col="${col.MaTruong}" data-editable="${canEditCell ? '1' : '0'}" class="${col.sticky ? 'sticky-cell' : ''}" style="width:${col.DoRong}px;min-width:${col.DoRong}px;max-width:${col.DoRong}px;${stickyStyle}; text-align:${col.CanLe || 'left'}">${this.cellDisplay(row, col)}</td>`;
    }).join('');
    const rowId = row.MaNhomLopHP;
    const rowClass = [row._dirty ? 'row-dirty' : '', row.TrangThai === 'Đã thanh toán' ? 'row-locked' : ''].filter(Boolean).join(' ');
    return `<tr data-id="${rowId}" class="${rowClass}">${checkboxCell}${cells}</tr>`;
  }

  /**
   * Dựng lại toàn bộ DOM của bảng lưới và phân trang
   */
  renderAll() {
    const allRows = this.getRows();
    const totalRows = allRows.length;

    let startIdx = 0;
    let endIdx = totalRows;
    let pageRows = allRows;
    let totalPages = 1;

    if (this.enablePagination) {
      totalPages = Math.ceil(totalRows / this.state.pageSize) || 1;
      if (this.state.currentPage > totalPages) this.state.currentPage = totalPages;

      startIdx = (this.state.currentPage - 1) * this.state.pageSize;
      endIdx = Math.min(startIdx + this.state.pageSize, totalRows);
      pageRows = allRows.slice(startIdx, endIdx);
    }

    if (totalRows === 0) {
      this.tbody.innerHTML = `<tr><td colspan="${this.state.columns.length + 1}" style="text-align:center;padding:32px;color:var(--text-muted);">Không tìm thấy dữ liệu phù hợp</td></tr>`;
    } else {
      this.tbody.innerHTML = pageRows.map(r => this.renderRowHTML(r)).join('');
    }

    this.thead.innerHTML = `<tr>${this.buildHeaderHTML()}</tr>`;
    if (this.enablePagination) {
      this.renderPagination(totalRows, startIdx, endIdx, totalPages);
    } else if (this.paginationEl) {
      this.paginationEl.innerHTML = '';
    }

    if (this.onRenderComplete) this.onRenderComplete(allRows, this.state.selected);
  }

  /**
   * Xây dựng HTML thanh điều hướng phân trang (Pagination)
   * @param {number} totalRows - Tổng số dòng
   * @param {number} startIdx - Index dòng bắt đầu
   * @param {number} endIdx - Index dòng kết thúc
   * @param {number} totalPages - Tổng số trang
   */
  renderPagination(totalRows, startIdx, endIdx, totalPages) {
    if (!this.paginationEl) return;
    let html = `
      <div class="pagination-left">
        <span>Đang xem ${totalRows > 0 ? startIdx + 1 : 0} - ${endIdx} / ${totalRows} dòng</span>
        <select id="pageSizeSelect">
          <option value="50" ${this.state.pageSize === 50 ? 'selected' : ''}>50 dòng/trang</option>
          <option value="100" ${this.state.pageSize === 100 ? 'selected' : ''}>100 dòng/trang</option>
          <option value="200" ${this.state.pageSize === 200 ? 'selected' : ''}>200 dòng/trang</option>
        </select>
      </div>
      <div class="pagination-right">
        <button class="page-btn" data-page="${this.state.currentPage - 1}" ${this.state.currentPage === 1 ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
    `;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= this.state.currentPage - 1 && i <= this.state.currentPage + 1)) {
        html += `<button class="page-btn ${i === this.state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
      } else if (i === this.state.currentPage - 2 || i === this.state.currentPage + 2) {
        html += `<span style="padding: 0 4px">...</span>`;
      }
    }

    html += `
        <button class="page-btn" data-page="${this.state.currentPage + 1}" ${this.state.currentPage === totalPages ? 'disabled' : ''}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
        </button>
      </div>
    `;

    this.paginationEl.innerHTML = html;

    this.paginationEl.querySelector('#pageSizeSelect').addEventListener('change', e => {
      this.state.pageSize = parseInt(e.target.value);
      this.state.currentPage = 1;
      this.renderAll();
    });

    this.paginationEl.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = parseInt(btn.dataset.page);
        if (!isNaN(p) && p !== this.state.currentPage) {
          this.state.currentPage = p;
          this.renderAll();
        }
      });
    });
  }

  // --- D. FEATURES (EDIT, FILTER) ---

  /**
   * Kích hoạt chế độ chỉnh sửa (Inline Edit) tại một ô cụ thể
   * @param {HTMLElement} td - Thẻ td chứa ô cần sửa
   * @param {string} rowId - Khóa chính của dòng
   * @param {string} colId - Khóa chính của cột
   */
  async startEdit(td, rowId, colId) {
    const row = this.state.data.find(r => String(r.MaNhomLopHP) === String(rowId));
    const col = this.state.columns.find(c => c.MaTruong === colId);
    if (!row || !col) return;
    const originalValue = row[col.MaTruong];

    if (row.TrangThai === 'Đã thanh toán') {
      if (typeof showToast !== 'undefined') showToast('Không thể sửa: nhóm lớp này đã thanh toán');
      return;
    }

    const normalizeEditedValue = (value) => {
      if (col.KieuTruong === 'number' || col.KieuTruong === 'capacity') {
        if (value === null || value === undefined || String(value).trim() === '') return '';
        return col.MaTruong === 'HeSoHocDi' ? (parseFloat(value) || 0) : (parseInt(value) || 0);
      }
      return String(value ?? '');
    };

    td.classList.add('editing');
    let externalOptions = null;
    if (this.getCellEditorOptions) {
      try {
        externalOptions = await this.getCellEditorOptions(row, col);
      } catch (error) {
        console.error('Không thể tải danh sách lựa chọn cho ô:', error);
        if (typeof showToast !== 'undefined') showToast('Không thể tải danh sách lựa chọn.', true);
      }
    }

    let inputHtml;
    if (Array.isArray(externalOptions)) {
      const currentValue = String(row[col.MaTruong] ?? '');
      const options = externalOptions.includes(currentValue)
        ? externalOptions
        : [currentValue, ...externalOptions].filter(Boolean);
      inputHtml = `<select class="cell-editor">` +
        `${options.map(o => `<option value="${esc(o)}" ${String(o) === currentValue ? 'selected' : ''}>${esc(o)}</option>`).join('')}` +
        `</select>`;
    } else if (col.KieuTruong === 'select' || col.KieuTruong === 'badge') {
      const listId = 'dl_' + col.MaTruong;
      const allOptions = Array.from(new Set(this.state.data.map(r => String(r[col.MaTruong] || '')))).filter(Boolean);
      inputHtml = `<input type="text" class="cell-editor" list="${listId}" value="${esc(row[col.MaTruong])}">` +
        `<datalist id="${listId}">${allOptions.map(o => `<option value="${esc(o)}">`).join('')}</datalist>`;
    } else if (col.KieuTruong === 'number' || col.KieuTruong === 'capacity') {
      const step = col.MaTruong === 'HeSoHocDi' ? '0.1' : '1';
      inputHtml = `<input type="number" step="${step}" class="cell-editor" value="${row[col.MaTruong]}">`;
    } else {
      inputHtml = `<input type="text" class="cell-editor" value="${esc(row[col.MaTruong])}">`;
    }

    td.innerHTML = inputHtml;
    const input = td.querySelector('.cell-editor');
    input.focus();
    if (input.select) input.select();

    const commit = () => {
      const rawInputValue = input.value;
      const oldComparable = normalizeEditedValue(originalValue);
      const newComparable = normalizeEditedValue(rawInputValue);

      if (oldComparable === newComparable) {
        cancel();
        return;
      }

      let val = newComparable;
      if ((col.KieuTruong === 'number' || col.KieuTruong === 'capacity') && val === '') {
        val = 0;
      }

      row[col.MaTruong] = val;
      row._dirty = true;
      this.onRowDirty(row, col.MaTruong, val);
      this.renderAll();
    };

    const cancel = () => {
      td.classList.remove('editing');
      td.innerHTML = this.cellDisplay(row, col);
    };

    input.addEventListener('blur', commit, { once: true });
    input.addEventListener('keydown', ev => {
      if (ev.key === 'Enter') { input.blur(); }
      else if (ev.key === 'Escape') { input.removeEventListener('blur', commit); cancel(); }
    });
    if (Array.isArray(externalOptions) || col.KieuTruong === 'select' || col.KieuTruong === 'badge') {
      input.addEventListener('change', () => input.blur());
    }
  }

  /**
   * Hiển thị bảng Dropdown tùy chọn Lọc Excel-like
   * @param {string} key - Mã trường cần lọc
   * @param {HTMLElement} btn - Nút (Icon phễu) vừa được nhấp
   */
  openFilterDropdown(key, btn) {
    this.closeFilterDropdown();
    const col = this.state.columns.find(c => c.MaTruong === key);
    if (!col) return;

    const isNum = (col.KieuTruong === 'number' || col.KieuTruong === 'capacity');
    const currentAllowed = this.state.filters[key];
    const rect = btn.getBoundingClientRect();
    const div = document.createElement('div');
    div.className = 'filter-dropdown';
    div.style.top = (rect.bottom + 6) + 'px';
    div.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 256)) + 'px';

    // Checkbox list setup
    const allValues = Array.from(new Set(this.state.data.map(r => String(r[key])))).sort((a, b) => a.localeCompare(b));
    let checkedSet = null;
    if (currentAllowed instanceof Set) checkedSet = currentAllowed;
    else if (currentAllowed && currentAllowed.values) checkedSet = currentAllowed.values;

    const getFilterLabel = (valStr) => {
      if (!valStr) return '(trống)';
      const fakeRow = {};
      // Khôi phục kiểu boolean cơ bản để hàm render nhận diện chính xác
      if (valStr.toLowerCase() === 'true') fakeRow[key] = true;
      else if (valStr.toLowerCase() === 'false') fakeRow[key] = false;
      else fakeRow[key] = valStr;

      try {
        const cellHtml = this.cellDisplay(fakeRow, col);
        if (cellHtml) return cellHtml;
      } catch(e) {}
      return esc(valStr);
    };

    const mapItems = allValues.map(v => `<label class="fd-item" style="display:flex; align-items:center; gap:8px;"><input type="checkbox" class="fd-cb" value="${esc(v)}" ${(!checkedSet || checkedSet.has(v)) ? 'checked' : ''}>${getFilterLabel(v)}</label>`).join('');

    let html = `
      <input type="text" class="fd-search" placeholder="Tìm giá trị...">
      <label class="fd-all"><input type="checkbox" class="fd-selectall" ${(!checkedSet || checkedSet.size === allValues.length) ? 'checked' : ''}> Chọn tất cả</label>
      <div class="fd-list">${mapItems}</div>
    `;

    if (isNum) {
      const step = (col.MaTruong === 'HeSoHocDi') ? '0.1' : '1';
      let defaultMin = (currentAllowed && currentAllowed.min !== undefined && currentAllowed.min !== null) ? currentAllowed.min : '';
      let defaultMax = (currentAllowed && currentAllowed.max !== undefined && currentAllowed.max !== null) ? currentAllowed.max : '';

      html += `
        <div style="padding: 12px 12px 4px 12px; border-top: 1px solid var(--border); margin-top: 4px;">
          <div style="font-size: 12px; font-weight: 600; color: var(--text-primary); margin-bottom: 8px;">Lọc bổ sung theo khoảng:</div>
          <div style="display: flex; gap: 8px;">
            <input type="number" id="fd_min" class="text-input" style="width:50%" step="${step}" placeholder="Từ" value="${defaultMin}">
            <input type="number" id="fd_max" class="text-input" style="width:50%" step="${step}" placeholder="Đến" value="${defaultMax}">
          </div>
        </div>
      `;
    }

    html += `<div class="fd-actions"><button class="fd-clear">Xoá lọc</button><button class="fd-apply">Áp dụng</button></div>`;
    div.innerHTML = html;

    document.body.appendChild(div);
    this.filterDropdownEl = div;
    this.openFilterKey = key;

    div.querySelector('.fd-search').addEventListener('input', e => {
      const q = e.target.value.toLowerCase();
      div.querySelectorAll('.fd-item').forEach(lbl => { lbl.style.display = lbl.textContent.toLowerCase().includes(q) ? 'flex' : 'none'; });
    });

    div.querySelector('.fd-selectall').addEventListener('change', e => {
      div.querySelectorAll('.fd-cb').forEach(cb => cb.checked = e.target.checked);
    });

    div.querySelector('.fd-clear').addEventListener('click', () => {
      delete this.state.filters[key];
      this.closeFilterDropdown();
      this.state.currentPage = 1;
      this.renderAll();
      this.updateFilterCountBadge();
    });

    div.querySelector('.fd-apply').addEventListener('click', () => {
      const checked = Array.from(div.querySelectorAll('.fd-cb:checked')).map(cb => cb.value);
      let minVal = null, maxVal = null;
      if (isNum) {
        const minStr = div.querySelector('#fd_min').value;
        const maxStr = div.querySelector('#fd_max').value;
        minVal = minStr === '' ? null : parseFloat(minStr);
        maxVal = maxStr === '' ? null : parseFloat(maxStr);
      }

      if (checked.length === allValues.length && minVal === null && maxVal === null) {
        delete this.state.filters[key];
      } else {
        this.state.filters[key] = { type: 'mixed', values: new Set(checked), min: minVal, max: maxVal };
      }

      this.closeFilterDropdown();
      this.state.currentPage = 1;
      this.renderAll();
      this.updateFilterCountBadge();
    });

    setTimeout(() => document.addEventListener('click', this.outsideClickHandler), 0);
  }


  /**
   * Ẩn bảng Dropdown lọc hiện tại
   */
  closeFilterDropdown() {
    if (this.filterDropdownEl) {
      this.filterDropdownEl.remove();
      this.filterDropdownEl = null;
      this.openFilterKey = null;
      document.removeEventListener('click', this.outsideClickHandler);
    }
  }

  /**
   * Cập nhật số lượng huy hiệu (badge đếm) bên cạnh nút Lọc
   */
  updateFilterCountBadge() {
    const n = Object.keys(this.state.filters).length + (this.state.search ? 1 : 0);
    const badge = document.getElementById('filterCount');
    if (badge) {
      if (n > 0) { badge.style.display = 'inline-block'; badge.textContent = n; }
      else { badge.style.display = 'none'; }
    }
  }

  // --- E. EVENT BINDING ---

  /**
   * Xử lý đóng Dropdown khi click ra ngoài vùng Dropdown
   * @param {Event} e - Đối tượng event
   */
  outsideClickHandler(e) {
    if (this.filterDropdownEl && !this.filterDropdownEl.contains(e.target) && !e.target.closest('.filter-btn')) {
      this.closeFilterDropdown();
    }
  }

  /**
   * Gắn toàn bộ sự kiện cần thiết cho Bảng (Áp dụng Event Delegation)
   */
  bindEvents() {
    this.tbody.addEventListener('dblclick', e => {
      const td = e.target.closest('td[data-editable="1"]');
      if (!td || td.classList.contains('editing')) return;
      const tr = td.closest('tr');
      if (tr) this.startEdit(td, tr.dataset.id, td.dataset.col);
    });

    this.tbody.addEventListener('change', e => {
      const cb = e.target.closest('input.row-check');
      if (!cb) return;
      const tr = cb.closest('tr');
      const rowId = tr.dataset.id;
      if (cb.checked) this.state.selected.add(String(rowId)); else this.state.selected.delete(String(rowId));
      this.onSelectionChange(this.state.selected);
      const allRows = this.getRows();
      const selectAllCb = this.thead.querySelector('#selectAll');
      if (selectAllCb) {
        const selectableRows = allRows.filter(r => this.isRowSelectable(r));
        selectAllCb.checked = selectableRows.length > 0 && selectableRows.every(r => this.state.selected.has(String(r.MaNhomLopHP)));
      }
    });

    this.thead.addEventListener('click', e => {
      const sortBtn = e.target.closest('.sort-btn');
      if (sortBtn) { this.toggleSort(sortBtn.dataset.key); return; }
      const filterBtn = e.target.closest('.filter-btn');
      if (filterBtn) { this.openFilterDropdown(filterBtn.dataset.key, filterBtn); return; }
    });

    this.thead.addEventListener('change', e => {
      if (e.target.id === 'selectAll') {
        const checked = e.target.checked;
        const rows = this.getRows();
        rows.forEach(r => {
          if (this.isRowSelectable(r)) {
            if (checked) this.state.selected.add(String(r.MaNhomLopHP));
            else this.state.selected.delete(String(r.MaNhomLopHP));
          }
        });
        this.onSelectionChange(this.state.selected);
        this.renderAll();
      }
    });
  }
}
