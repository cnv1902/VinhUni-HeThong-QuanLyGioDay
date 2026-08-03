const state = {
  data: [], sortKey: null, sortDir: 1, filters: {}, search: '',
  numFilters: { soSV: [-Infinity, Infinity], soTC: [-Infinity, Infinity] },
  selected: new Set()
};


function capacityHtml(row) {
  const ratio = row.soSV > 0 ? row.siSoDKH / row.soSV : 0;
  const pct = Math.max(0, Math.min(100, Math.round(ratio * 100)));
  let color = 'var(--teal-600)';
  if (ratio > 1) color = 'var(--red-600)'; else if (ratio >= 0.95) color = 'var(--amber-600)';
  return `<div class="cap-cell"><span class="cap-num">${row.siSoDKH}</span><div class="cap-bar"><div class="cap-fill" style="width:${pct}%;background:${color};"></div></div></div>`;
}
function formatNum(v, key) {
  if (key === 'heSoHP') return Number(v).toFixed(1);
  return String(v);
}
function cellDisplay(row, col) {
  const v = row[col.key];
  switch (col.type) {
    case 'badge': return badgeHtml(v);
    case 'capacity': return capacityHtml(row);
    case 'action': return `<button class="mini-btn" data-action="tonghop" title="Tính lại số liệu">${iconRefresh()}<span>Tính lại</span></button>`;
    case 'mono': return `<span class="mono-text">${esc(v)}</span>`;
    case 'number': return `<span class="num-text">${formatNum(v, col.key)}</span>`;
    default: return `<span>${esc(v)}</span>`;
  }
}


function buildHeaderHTML() {
  const checkboxTh = `<th class="select-th" style="width:40px;min-width:40px;"><input type="checkbox" id="selectAll"></th>`;
  const ths = COLUMNS.map(col => {
    const stickyStyle = col.sticky ? `left:${stickyOffsets[col.key]}px;` : '';
    return `<th data-col="${col.key}" class="${col.sticky ? 'sticky-th' : ''}" style="width:${col.width}px;min-width:${col.width}px;${stickyStyle}">
      <div class="th-inner">
        <span class="th-label" title="${esc(col.label)}">${esc(col.label)}</span>
        <span class="th-actions">${col.sortable ? sortIconHtml(col.key) : ''}${col.filterable ? filterIconHtml(col.key) : ''}</span>
      </div>
    </th>`;
  }).join('');
  return checkboxTh + ths;
}

function renderRowHTML(row) {
  const checkboxCell = `<td class="select-cell sticky-cell" style="left:0;width:40px;min-width:40px;"><input type="checkbox" class="row-check" ${state.selected.has(row.id) ? 'checked' : ''}></td>`;
  const cells = COLUMNS.map(col => {
    const stickyStyle = col.sticky ? `left:${stickyOffsets[col.key]}px;` : '';
    return `<td data-col="${col.key}" data-editable="${col.editable ? '1' : '0'}" class="${col.sticky ? 'sticky-cell' : ''}" style="width:${col.width}px;min-width:${col.width}px;${stickyStyle}">${cellDisplay(row, col)}</td>`;
  }).join('');
  const rowClass = [row._dirty ? 'row-dirty' : '', row.trangThai === 'Đã thanh toán' ? 'row-locked' : ''].filter(Boolean).join(' ');
  return `<tr data-id="${row.id}" class="${rowClass}">${checkboxCell}${cells}</tr>`;
}

function getRows() {
  let rows = state.data.filter(r => {
    if (state.search) {
      const s = state.search.toLowerCase();
      const hay = (r.tenNhom + ' ' + r.fileId + ' ' + r.chuyen + ' ' + r.soPhong).toLowerCase();
      if (!hay.includes(s)) return false;
    }
    for (const key in state.filters) {
      const allowed = state.filters[key];
      if (allowed && !allowed.has(String(r[key]))) return false;
    }
    const [svMin, svMax] = state.numFilters.soSV;
    if (r.soSV < svMin || r.soSV > svMax) return false;
    const [tcMin, tcMax] = state.numFilters.soTC;
    if (r.soTC < tcMin || r.soTC > tcMax) return false;
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

function renderAll() {
  const rows = getRows();
  tbody.innerHTML = rows.map(renderRowHTML).join('');
  updateHeaderIndicators();
  updateFooter(rows);
  updateSelectAllState(rows);
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
  const totalSV = rows.reduce((s, r) => s + Number(r.soSV || 0), 0);
  const totalTC = rows.reduce((s, r) => s + Number(r.soTC || 0), 0);
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
  const n = Object.keys(state.filters).length
    + (state.numFilters.soSV[0] !== -Infinity || state.numFilters.soSV[1] !== Infinity ? 1 : 0)
    + (state.numFilters.soTC[0] !== -Infinity || state.numFilters.soTC[1] !== Infinity ? 1 : 0)
    + (state.search ? 1 : 0);
  const badge = document.getElementById('filterCount');
  if (n > 0) { badge.style.display = 'inline-block'; badge.textContent = n; } else { badge.style.display = 'none'; }
}

function toggleSort(key) {
  if (state.sortKey === key) {
    if (state.sortDir === 1) { state.sortDir = -1; }
    else { state.sortKey = null; state.sortDir = 1; }
  } else { state.sortKey = key; state.sortDir = 1; }
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
    delete state.filters[key]; closeFilterDropdown(); renderAll(); updateFilterCountBadge();
  });
  div.querySelector('.fd-apply').addEventListener('click', () => {
    const checked = Array.from(div.querySelectorAll('.fd-cb:checked')).map(cb => cb.value);
    if (checked.length === allValues.length) { delete state.filters[key]; } else { state.filters[key] = new Set(checked); }
    closeFilterDropdown(); renderAll(); updateFilterCountBadge();
  });
  setTimeout(() => document.addEventListener('click', outsideClickHandler), 0);
}

function flashRow(id) {
  const tr = tbody.querySelector(`tr[data-id="${id}"]`);
  if (!tr) return;
  tr.classList.add('flash');
  setTimeout(() => tr.classList.remove('flash'), 900);
}

function startEdit(td, row, col) {
  td.classList.add('editing');
  let inputHtml;
  if (col.type === 'select' || col.type === 'badge') {
    const listId = 'dl_' + col.key;
    inputHtml = `<input type="text" class="cell-editor" list="${listId}" value="${esc(row[col.key])}">` +
      `<datalist id="${listId}">${col.options.map(o => `<option value="${esc(o)}">`).join('')}</datalist>`;
  } else if (col.type === 'number' || col.type === 'capacity') {
    const step = col.key === 'heSoHP' ? '0.1' : '1';
    inputHtml = `<input type="number" step="${step}" class="cell-editor" value="${row[col.key]}">`;
  } else {
    inputHtml = `<input type="text" class="cell-editor" value="${esc(row[col.key])}">`;
  }
  td.innerHTML = inputHtml;
  const input = td.querySelector('.cell-editor');
  input.focus();
  if (input.select) input.select();
  function commit() {
    let val = input.value;
    if (col.type === 'number' || col.type === 'capacity') {
      val = col.key === 'heSoHP' ? (parseFloat(val) || 0) : (parseInt(val) || 0);
    }
    row[col.key] = val;
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
  if (col.type === 'select' || col.type === 'badge') {
    input.addEventListener('change', () => input.blur());
  }
}

tbody.addEventListener('click', e => {
  const td = e.target.closest('td[data-editable="1"]');
  if (!td) return;
  const tr = td.closest('tr');
  const row = state.data.find(r => r.id === tr.dataset.id);
  if (!row) return;
  if (row.trangThai === 'Đã thanh toán') { showToast('Không thể sửa: nhóm lớp này đã thanh toán'); return; }
  const col = COLUMNS.find(c => c.key === td.dataset.col);
  startEdit(td, row, col);
});
tbody.addEventListener('click', e => {
  const btn = e.target.closest('button[data-action="tonghop"]');
  if (!btn) return;
  const tr = btn.closest('tr');
  const row = state.data.find(r => r.id === tr.dataset.id);
  if (!row) return;
  row.soTC = Math.round((row.lt / 15 + row.th / 30 + row.tl / 15 + row.da / 30) * 10) / 10 || row.soTC;
  row.qdlt = Math.round(row.lt * 1.2);
  row.qdth = Math.round(row.th * 0.9);
  row._dirty = true;
  renderAll();
  flashRow(row.id);
  showToast('Đã tổng hợp lại số liệu — nhóm ' + row.tenNhom);
});
tbody.addEventListener('change', e => {
  const cb = e.target.closest('input.row-check');
  if (!cb) return;
  const id = cb.closest('tr').dataset.id;
  if (cb.checked) state.selected.add(id); else state.selected.delete(id);
  updateFooter(getRows()); updateSelectAllState(getRows());
});
thead.addEventListener('click', e => {
  const sortBtn = e.target.closest('.sort-btn');
  if (sortBtn) { toggleSort(sortBtn.dataset.key); return; }
  const filterBtn = e.target.closest('.filter-btn');
  if (filterBtn) { openFilterDropdown(filterBtn.dataset.key, filterBtn); return; }
});

function fillSelectOptions(el, values) {
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v; opt.textContent = v;
    el.appendChild(opt);
  });
}

function bindStaticEvents() {
  document.getElementById('quickSearch').addEventListener('input', e => {
    state.search = e.target.value;
    document.getElementById('advName').value = e.target.value;
    renderAll(); updateFilterCountBadge();
  });
  document.getElementById('btnToggleFilter').addEventListener('click', function () {
    const panel = document.getElementById('filterPanel');
    panel.classList.toggle('closed');
    this.classList.toggle('open', !panel.classList.contains('closed'));
  });
  document.getElementById('btnApplyFilter').addEventListener('click', () => {
    const map = [['advKhoa', 'khoa'], ['advKhoaCN', 'khoaCN'], ['advHT', 'hinhThucHoc'], ['advCachTC', 'cachTCLop'], ['advTrangThai', 'trangThai']];
    map.forEach(([id, key]) => {
      const v = document.getElementById(id).value;
      if (v) { state.filters[key] = new Set([v]); } else { delete state.filters[key]; }
    });
    state.numFilters.soSV = [parseNum(document.getElementById('advSVMin').value, -Infinity), parseNum(document.getElementById('advSVMax').value, Infinity)];
    state.numFilters.soTC = [parseNum(document.getElementById('advTCMin').value, -Infinity), parseNum(document.getElementById('advTCMax').value, Infinity)];
    state.search = document.getElementById('advName').value;
    document.getElementById('quickSearch').value = state.search;
    renderAll(); updateFilterCountBadge();
  });
  document.getElementById('btnClearFilter').addEventListener('click', () => {
    document.querySelectorAll('.adv-field input, .adv-field select').forEach(el => el.value = '');
    state.filters = {}; state.search = '';
    state.numFilters = { soSV: [-Infinity, Infinity], soTC: [-Infinity, Infinity] };
    document.getElementById('quickSearch').value = '';
    renderAll(); updateFilterCountBadge();
  });
  document.getElementById('btnSave').addEventListener('click', () => {
    const n = state.data.filter(r => r._dirty).length;
    state.data.forEach(r => r._dirty = false);
    renderAll();
    showToast(n > 0 ? `Đã lưu xác nhận ${n} thay đổi` : 'Không có thay đổi nào cần lưu');
  });
  document.getElementById('btnTransfer').addEventListener('click', () => {
    if (state.selected.size === 0) { showToast('Chọn ít nhất 1 nhóm lớp để chuyển học kỳ thanh toán'); return; }
    showToast(`Đã chuyển ${state.selected.size} nhóm lớp sang học kỳ thanh toán`);
  });
  document.getElementById('btnExport').addEventListener('click', () => {
    showToast(`Đã xuất ${getRows().length} dòng ra file Excel`);
  });
}

function init() {
  state.data = generateData();
  thead.innerHTML = `<tr>${buildHeaderHTML()}</tr>`;
  document.getElementById('selectAll').addEventListener('change', e => {
    const checked = e.target.checked;
    const rows = getRows();
    rows.forEach(r => { if (checked) state.selected.add(r.id); else state.selected.delete(r.id); });
    renderAll();
  });
  fillSelectOptions(document.getElementById('advKhoa'), KHOA_LIST);
  fillSelectOptions(document.getElementById('advKhoaCN'), KHOA_CN_LIST);
  fillSelectOptions(document.getElementById('advHT'), HT_HOC_LIST);
  fillSelectOptions(document.getElementById('advCachTC'), TC_LOP_LIST);
  fillSelectOptions(document.getElementById('advTrangThai'), TT_LIST);
  bindStaticEvents();
  renderAll();
}
init();
