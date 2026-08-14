// === 1. STATE & DOM ELEMENTS ===
const elements = {
  tongNhomLop: document.getElementById('dashTongNhomLop'),
  daXacNhan: document.getElementById('dashDaXacNhan'),
  daKy: document.getElementById('dashDaKy'),
  chuaKy: document.getElementById('dashChuaKy'),
  daThanhToan: document.getElementById('dashDaThanhToan'),
  chuaThanhToan: document.getElementById('dashChuaThanhToan'),
  chuaXacNhan: document.getElementById('dashChuaXacNhan')
};

/**
 * Định dạng số
 */
function formatNum(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Trạng thái Loading
 */
function setLoadingState() {
  Object.keys(elements).forEach(key => {
    if (elements[key]) elements[key].textContent = '...';
  });
}

/**
 * Hiển thị dữ liệu
 */
function renderDashboard(data) {
  if (elements.tongNhomLop) elements.tongNhomLop.textContent = formatNum(data.TongNhomLop);
  if (elements.daXacNhan) elements.daXacNhan.textContent = formatNum(data.DaXacNhan);
  if (elements.daKy) elements.daKy.textContent = formatNum(data.DaKy);
  if (elements.chuaKy) elements.chuaKy.textContent = formatNum(data.ChuaKy);
  if (elements.daThanhToan) elements.daThanhToan.textContent = formatNum(data.DaThanhToan);
  if (elements.chuaThanhToan) elements.chuaThanhToan.textContent = formatNum(data.ChuaThanhToan);
  if (elements.chuaXacNhan) elements.chuaXacNhan.textContent = formatNum(data.ChuaXacNhan);
}

/**
 * Fetch API
 */
async function loadDashboardStats(hocKy) {
  if (!hocKy) return;
  
  setLoadingState();
  try {
    const response = await fetch(`/api/v1/cq-dashboard?hoc_ky=${encodeURIComponent(hocKy)}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    renderDashboard(data);
  } catch (error) {
    console.error('Lỗi khi nạp dữ liệu dashboard:', error);
    renderDashboard({});
  }
}

/**
 * Lắng nghe Navbar
 */
function bindContextEvents() {
  window.addEventListener('ContextReady', e => {
    loadDashboardStats(e.detail);
  });
  window.addEventListener('ContextChanged', e => {
    loadDashboardStats(e.detail);
  });
}

bindContextEvents();