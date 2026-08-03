// static/js/components/datatable.js

// Các biểu tượng dùng chung cho Data Table
function iconLock() { 
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="11" width="14" height="9" rx="1.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>'; 
}

function iconRefresh() { 
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4v5h5"/><path d="M20 20v-5h-5"/><path d="M5 9a8 8 0 0 1 14-2M19 15a8 8 0 0 1-14 2"/></svg>'; 
}

function sortIconHtml(key) {
  return `<button class="sort-btn" data-key="${key}" title="Sắp xếp" aria-label="Sắp xếp theo cột">
    <svg width="10" height="12" viewBox="0 0 10 12"><polygon class="arrow-up" points="5,0 10,5 0,5"/><polygon class="arrow-down" points="5,12 10,7 0,7"/></svg>
  </button>`;
}

function filterIconHtml(key) {
  return `<button class="filter-btn" data-key="${key}" title="Lọc" aria-label="Lọc theo cột">
    <svg width="12" height="12" viewBox="0 0 16 16"><path d="M1 2h14l-5.5 6.5V13l-3 1.5V8.5z"/></svg>
  </button>`;
}

function badgeHtml(v) {
  if (v === 'Đã thanh toán') return `<span class="badge badge-blue">${iconLock()}${esc(v)}</span>`;
  if (v === 'Đã xác nhận') return `<span class="badge badge-green">${esc(v)}</span>`;
  return `<span class="badge badge-gray">${esc(v)}</span>`;
}

// Helpers tính toán cột ghim (sticky)
function getStickyStyle(col, offsets) {
  return col.sticky ? `left:${offsets[col.key]}px;` : '';
}
