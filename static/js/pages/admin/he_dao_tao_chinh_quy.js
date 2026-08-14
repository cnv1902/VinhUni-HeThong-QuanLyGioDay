// === 1. STATE & DOM ELEMENTS ===
const elements = {
  tongNhomLop: document.getElementById('dashTongNhomLop'),
  tongSinhVien: document.getElementById('dashTongSinhVien'),
  tongTinChi: document.getElementById('dashTongTinChi'),
  avgSinhVien: document.getElementById('dashAvgSinhVien'),
  avgTinChi: document.getElementById('dashAvgTinChi'),
  daXacNhanVal: document.getElementById('dashDaXacNhanVal'),
  chuaXacNhanVal: document.getElementById('dashChuaXacNhanVal'),
  daXacNhanStick: document.getElementById('dashDaXacNhanStick'),
  chuaXacNhanStick: document.getElementById('dashChuaXacNhanStick')
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
  ['tongNhomLop', 'tongSinhVien', 'tongTinChi', 'avgSinhVien', 'avgTinChi', 'daXacNhanVal', 'chuaXacNhanVal'].forEach(key => {
    if (elements[key]) elements[key].textContent = '...';
  });
  if (elements.daXacNhanStick) elements.daXacNhanStick.style.height = '0%';
  if (elements.chuaXacNhanStick) elements.chuaXacNhanStick.style.height = '0%';
}

/**
 * Hiển thị dữ liệu
 */
function renderDashboard(data) {
  const tongNhomLop = Number(data.TongNhomLop || 0);
  const tongSinhVien = Number(data.TongSinhVien || 0);
  const tongTinChi = Number(data.TongTinChi || 0);
  const daXacNhan = Number(data.DaXacNhan || 0);
  const chuaXacNhan = Number(data.ChuaXacNhan || 0);
  const avgSinhVien = Number(data.AvgSinhVien || 0);
  const avgTinChi = Number(data.AvgTinChi || 0);
  
  if (elements.tongNhomLop) elements.tongNhomLop.textContent = formatNum(tongNhomLop);
  if (elements.tongSinhVien) elements.tongSinhVien.textContent = formatNum(tongSinhVien);
  if (elements.tongTinChi) elements.tongTinChi.textContent = formatNum(tongTinChi);
  if (elements.avgSinhVien) elements.avgSinhVien.textContent = formatNum(avgSinhVien);
  if (elements.avgTinChi) elements.avgTinChi.textContent = formatNum(avgTinChi);
  
  if (elements.daXacNhanVal) elements.daXacNhanVal.textContent = formatNum(daXacNhan);
  if (elements.chuaXacNhanVal) elements.chuaXacNhanVal.textContent = formatNum(chuaXacNhan);
  
  // Calculate height for bars
  const maxVal = Math.max(daXacNhan, chuaXacNhan, 1); // Tránh chia 0
  const hDaXacNhan = (daXacNhan / maxVal) * 100;
  const hChuaXacNhan = (chuaXacNhan / maxVal) * 100;
  
  if (elements.daXacNhanStick) elements.daXacNhanStick.style.height = `${hDaXacNhan}%`;
  if (elements.chuaXacNhanStick) elements.chuaXacNhanStick.style.height = `${hChuaXacNhan}%`;
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