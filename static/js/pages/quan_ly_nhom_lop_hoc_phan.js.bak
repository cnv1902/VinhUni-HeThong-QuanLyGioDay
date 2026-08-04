const state = {
  data: [], columns: [], sortKey: null, sortDir: 1, filters: {}, search: '',
  selected: new Set(),
  currentPage: 1,
  pageSize: 100
};


function capacityHtml(row) {
  const soSV = row.SoSinhVien || 0;
  const siSoDKH = row.SiSoDKH || 0;
  const ratio = soSV > 0 ? siSoDKH / soSV : 0;
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  let color = 'var(--teal-600)';
  if (ratio > 1) color = 'var(--red-600)'; else if (ratio >= 0.95) color = 'var(--amber-600)';
  return `<div class="cap-cell"><span class="cap-num">${siSoDKH}</span><div class="cap-bar"><div class="cap-fill" style="width:${pct}%;background:${color};"></div></div></div>`;
}
function formatNum(v, key) {
  if (key === 'HeSoHocDi' || key === 'HeSoHP') return Number(v || 0).toFixed(1);
  return String(v || 0);
}
function cellDisplay(row, col) {
  const v = row[col.MaTruong];
  switch (col.KieuTruong) {
    case 'badge': return badgeHtml(v);
    case 'capacity': return capacityHtml(row);
    case 'action': return `<button class="mini-btn" data-action="tonghop" title="Tính lại số liệu">${iconRefresh()}<span>Tính lại</span></button>`;
    case 'mono': return `<span class="mono-text">${esc(v)}</span>`;
    case 'number': return `<span class="num-text">${formatNum(v, col.MaTruong)}</span>`;
    default: return `<span>${esc(v)}</span>`;
  }
}


const stickyOffsets = {};
function calculateSticky() {
  let cum = 40;
  state.columns.forEach(c => {
    if (c.GhimCot || c.ThuTuHienThi <= 2) {
      stickyOffsets[c.MaTruong] = cum;
      cum += c.DoRong;
      c.sticky = true;
    } else {
      c.sticky = false;
    }
  });
}

function buildHeaderHTML() {
  const checkboxTh = `<th class="select-th" style="width:40px;min-width:40px;"><input type="checkbox" id="selectAll"></th>`;
  const ths = state.columns.map(col => {
    const stickyStyle = col.sticky ? `left:${stickyOffsets[col.MaTruong]}px;` : '';
    return `<th data-col="${col.MaTruong}" class="${col.sticky ? 'sticky-th' : ''}" style="width:${col.DoRong}px;min-width:${col.DoRong}px;${stickyStyle}; text-align:${col.CanLe || 'left'}">
      <div class="th-inner">
        <span class="th-label" title="${esc(col.TenTruong)}">${esc(col.TenTruong)}</span>
        <span class="th-actions">${sortIconHtml(col.MaTruong)}${filterIconHtml(col.MaTruong)}</span>
      </div>
    </th>`;
  }).join('');
  return checkboxTh + ths;
}

function renderRowHTML(row) {
  const checkboxCell = `<td class="select-cell sticky-cell" style="left:0;width:40px;min-width:40px;"><input type="checkbox" class="row-check" ${state.selected.has(row.MaNhomLopHP) ? 'checked' : ''}></td>`;
  const cells = state.columns.map(col => {
    const stickyStyle = col.sticky ? `left:${stickyOffsets[col.MaTruong]}px;` : '';
    return `<td data-col="${col.MaTruong}" data-editable="${col.DuocSua ? '1' : '0'}" class="${col.sticky ? 'sticky-cell' : ''}" style="width:${col.DoRong}px;min-width:${col.DoRong}px;${stickyStyle}; text-align:${col.CanLe || 'left'}">${cellDisplay(row, col)}</td>`;
  }).join('');
  const rowId = row.MaNhomLopHP;
  const rowClass = [row._dirty ? 'row-dirty' : '', row.TrangThai === 'Đã thanh toán' ? 'row-locked' : ''].filter(Boolean).join(' ');
  return `<tr data-id="${rowId}" class="${rowClass}">${checkboxCell}${cells}</tr>`;
}

function getRows() {
  let rows = state.data.filter(r => {
    if (state.search) {
      const s = state.search.toLowerCase();
      const hay = (r.TenNhomLopHP + ' ' + (r.ID_LanTongHopFile || '') + ' ' + (r.MaNhomLopHP || '')).toLowerCase();
      if (!hay.includes(s)) return false;
    }
    for (const key in state.filters) {
      const allowed = state.filters[key];
      if (allowed && !allowed.has(String(r[key]))) return false;
    }
    return true;
  });
  if (state.sortKey) {
    const key = state.sortKey, dir = state.sortDir;
    rows = rows.slice().sort((a, b) => {
      let av = a[key], bv = b[key];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      av = String(av).toLowerCase(); bv = String(bv).toLowerCase();
      return av.localeCompare(bv) * dir;
    });
  }
  return rows;
}

const tbody = document.getElementById('tbody');
const thead = document.getElementById('theadRow');
const paginationEl = document.getElementById('tablePagination');

function renderAll() {
  const allRows = getRows();
  const totalRows = allRows.length;
  const totalPages = Math.ceil(totalRows / state.pageSize) || 1;

  if (state.currentPage > totalPages) {
    state.currentPage = totalPages;
  }

  const startIdx = (state.currentPage - 1) * state.pageSize;
  const endIdx = startIdx + state.pageSize;
  const pageRows = allRows.slice(startIdx, endIdx);

  tbody.innerHTML = pageRows.map(renderRowHTML).join('');
  updateHeaderIndicators();
  updateFooter(allRows);
  updateSelectAllState(pageRows);
  renderPagination(totalRows, startIdx, Math.min(endIdx, totalRows));
}

function renderPagination(totalRows, startIdx, endIdx) {
  if (!paginationEl) return;
  const totalPages = Math.ceil(totalRows / state.pageSize) || 1;

  let html = `
    <div class="pagination-left">
      <span>Đang xem ${totalRows > 0 ? startIdx + 1 : 0} - ${endIdx} / ${totalRows} dòng</span>
      <select id="pageSizeSelect">
        <option value="50" ${state.pageSize === 50 ? 'selected' : ''}>50 dòng/trang</option>
        <option value="100" ${state.pageSize === 100 ? 'selected' : ''}>100 dòng/trang</option>
        <option value="200" ${state.pageSize === 200 ? 'selected' : ''}>200 dòng/trang</option>
      </select>
    </div>
    <div class="pagination-right">
      <button class="page-btn" data-page="${state.currentPage - 1}" ${state.currentPage === 1 ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    // Rút gọn hiển thị trang nếu quá nhiều trang
    if (i === 1 || i === totalPages || (i >= state.currentPage - 1 && i <= state.currentPage + 1)) {
      html += `<button class="page-btn ${i === state.currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    } else if (i === state.currentPage - 2 || i === state.currentPage + 2) {
      html += `<span style="padding: 0 4px">...</span>`;
    }
  }

  html += `
      <button class="page-btn" data-page="${state.currentPage + 1}" ${state.currentPage === totalPages ? 'disabled' : ''}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </div>
  `;

  paginationEl.innerHTML = html;

  paginationEl.querySelector('#pageSizeSelect').addEventListener('change', e => {
    state.pageSize = parseInt(e.target.value);
    state.currentPage = 1;
    renderAll();
  });

  paginationEl.querySelectorAll('.page-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.page);
      if (!isNaN(p) && p !== state.currentPage) {
        state.currentPage = p;
        renderAll();
      }
    });
  });
}

function updateHeaderIndicators() {
  document.querySelectorAll('.sort-btn').forEach(btn => {
    const key = btn.dataset.key;
    const up = btn.querySelector('.arrow-up'), down = btn.querySelector('.arrow-down');
    up.classList.toggle('on', state.sortKey === key && state.sortDir === 1);
    down.classList.toggle('on', state.sortKey === key && state.sortDir === -1);
  });
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', !!state.filters[btn.dataset.key]);
  });
}
function updateFooter(rows) {
  const totalSV = rows.reduce((s, r) => s + Number(r.SoSinhVien || 0), 0);
  const totalTC = rows.reduce((s, r) => s + Number(r.SoTinChi || 0), 0);
  document.getElementById('statTotal').textContent = state.data.length;
  document.getElementById('statFiltered').textContent = rows.length;
  document.getElementById('statSelected').textContent = state.selected.size;
  document.getElementById('statSV').textContent = totalSV.toLocaleString('vi-VN');
  document.getElementById('statTC').textContent = totalTC.toLocaleString('vi-VN');
}
function updateSelectAllState(rows) {
  const cb = document.getElementById('selectAll');
  if (!cb) return;
  const selCount = rows.filter(r => state.selected.has(r.id)).length;
  cb.checked = rows.length > 0 && selCount === rows.length;
  cb.indeterminate = selCount > 0 && selCount < rows.length;
}
function updateFilterCountBadge() {
  const n = Object.keys(state.filters).length + (state.search ? 1 : 0);
  const badge = document.getElementById('filterCount');
  if (n > 0) { badge.style.display = 'inline-block'; badge.textContent = n; } else { badge.style.display = 'none'; }
}

function toggleSort(key) {
  if (state.sortKey === key) {
    if (state.sortDir === 1) { state.sortDir = -1; }
    else { state.sortKey = null; state.sortDir = 1; }
  } else { state.sortKey = key; state.sortDir = 1; }
  state.currentPage = 1; // Quay về trang 1 khi sort
  renderAll();
}

let filterDropdownEl = null, openFilterKey = null;
function closeFilterDropdown() {
  if (filterDropdownEl) { filterDropdownEl.remove(); filterDropdownEl = null; openFilterKey = null; document.removeEventListener('click', outsideClickHandler); }
}
function outsideClickHandler(e) {
  if (filterDropdownEl && !filterDropdownEl.contains(e.target) && !e.target.closest('.filter-btn')) closeFilterDropdown();
}
function openFilterDropdown(key, btn) {
  closeFilterDropdown();
  const allValues = Array.from(new Set(state.data.map(r => String(r[key])))).sort((a, b) => a.localeCompare(b));
  const currentAllowed = state.filters[key];
  const rect = btn.getBoundingClientRect();
  const div = document.createElement('div');
  div.className = 'filter-dropdown';
  div.style.top = (rect.bottom + 6) + 'px';
  div.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - 256)) + 'px';
  div.innerHTML = `
    <input type="text" class="fd-search" placeholder="Tìm giá trị...">
    <label class="fd-all"><input type="checkbox" class="fd-selectall" ${(!currentAllowed || currentAllowed.size === allValues.length) ? 'checked' : ''}> Chọn tất cả</label>
    <div class="fd-list">${allValues.map(v => `<label class="fd-item"><input type="checkbox" class="fd-cb" value="${esc(v)}" ${(!currentAllowed || currentAllowed.has(v)) ? 'checked' : ''}>${esc(v) || '(trống)'}</label>`).join('')}</div>
    <div class="fd-actions"><button class="fd-clear">Xoá lọc</button><button class="fd-apply">Áp dụng</button></div>
  `;
  document.body.appendChild(div);
  filterDropdownEl = div; openFilterKey = key;
  div.querySelector('.fd-search').addEventListener('input', e => {
    const q = e.target.value.toLowerCase();
    div.querySelectorAll('.fd-item').forEach(lbl => { lbl.style.display = lbl.textContent.toLowerCase().includes(q) ? 'flex' : 'none'; });
  });
  div.querySelector('.fd-selectall').addEventListener('change', e => {
    div.querySelectorAll('.fd-cb').forEach(cb => cb.checked = e.target.checked);
  });
  div.querySelector('.fd-clear').addEventListener('click', () => {
    delete state.filters[key]; closeFilterDropdown(); state.currentPage = 1; renderAll(); updateFilterCountBadge();
  });
  div.querySelector('.fd-apply').addEventListener('click', () => {
    const checked = Array.from(div.querySelectorAll('.fd-cb:checked')).map(cb => cb.value);
    if (checked.length === allValues.length) { delete state.filters[key]; } else { state.filters[key] = new Set(checked); }
    closeFilterDropdown(); state.currentPage = 1; renderAll(); updateFilterCountBadge();
  });
  setTimeout(() => document.addEventListener('click', outsideClickHandler), 0);
}

function startEdit(td, row, col) {
  td.classList.add('editing');
  let inputHtml;
  if (col.KieuTruong === 'select' || col.KieuTruong === 'badge') {
    const listId = 'dl_' + col.MaTruong;
    const allOptions = Array.from(new Set(state.data.map(r => String(r[col.MaTruong] || '')))).filter(Boolean);
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
  function commit() {
    let val = input.value;
    if (col.KieuTruong === 'number' || col.KieuTruong === 'capacity') {
      val = col.MaTruong === 'HeSoHocDi' ? (parseFloat(val) || 0) : (parseInt(val) || 0);
    }
    row[col.MaTruong] = val;
    row._dirty = true;
    renderAll();
  }
  function cancel() {
    td.classList.remove('editing');
    td.innerHTML = cellDisplay(row, col);
  }
  input.addEventListener('blur', commit, { once: true });
  input.addEventListener('keydown', ev => {
    if (ev.key === 'Enter') { input.blur(); }
    else if (ev.key === 'Escape') { input.removeEventListener('blur', commit); cancel(); }
  });
  if (col.KieuTruong === 'select' || col.KieuTruong === 'badge') {
    input.addEventListener('change', () => input.blur());
  }
}

tbody.addEventListener('click', e => {
  const td = e.target.closest('td[data-editable="1"]');
  if (!td) return;
  const tr = td.closest('tr');
  const rowId = tr.dataset.id;
  const row = state.data.find(r => String(r.MaNhomLopHP) === String(rowId));
  if (!row) return;
  if (row.TrangThai === 'Đã thanh toán') { showToast('Không thể sửa: nhóm lớp này đã thanh toán'); return; }
  const col = state.columns.find(c => c.MaTruong === td.dataset.col);
  startEdit(td, row, col);
});
tbody.addEventListener('change', e => {
  const cb = e.target.closest('input.row-check');
  if (!cb) return;
  const tr = cb.closest('tr');
  const rowId = tr.dataset.id;
  if (cb.checked) state.selected.add(rowId); else state.selected.delete(rowId);
  updateFooter(getRows()); updateSelectAllState(getRows());
});
thead.addEventListener('click', e => {
  const sortBtn = e.target.closest('.sort-btn');
  if (sortBtn) { toggleSort(sortBtn.dataset.key); return; }
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) { openFilterDropdown(filterBtn.dataset.key, filterBtn); return; }
});

function bindStaticEvents() {
  document.getElementById('quickSearch').addEventListener('input', e => {
    state.search = e.target.value;
    state.currentPage = 1;
    renderAll(); updateFilterCountBadge();
  });
  document.getElementById('btnToggleFilter').addEventListener('click', function () {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('closed');
    this.classList.toggle('closed', panel.classList.contains('closed'));
  });
}

async function init() {
  try {
    // Tải cấu hình cột và dữ liệu song song (Promise.all)
    const [colsConfig, nhomLopData] = await Promise.all([
      apiLopHocPhan.getColumnsConfig(),
      apiLopHocPhan.getNhomLopData(3) // Khởi chạy với ma_hoc_ky = 3
    ]);

    state.columns = colsConfig.filter(c => c.HienThi).sort((a, b) => a.ThuTuHienThi - b.ThuTuHienThi);
    state.data = nhomLopData;

    calculateSticky();

    thead.innerHTML = `<tr>${buildHeaderHTML()}</tr>`;
    document.getElementById('selectAll').addEventListener('change', e => {
      const checked = e.target.checked;
      const rows = getRows();
      rows.forEach(r => { if (checked) state.selected.add(r.MaNhomLopHP); else state.selected.delete(r.MaNhomLopHP); });
      renderAll();
    });

    bindStaticEvents();
    renderAll();
  } catch (error) {
    console.error("Lỗi khi khởi tạo ứng dụng:", error);
    showToast("Không thể tải dữ liệu từ máy chủ!");
  }
}
init();
