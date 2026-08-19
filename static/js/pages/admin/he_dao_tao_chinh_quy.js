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

// Các phần tử phụ trợ cho phễu tiến độ (tỉ lệ % + thanh progress theo từng giai đoạn)
const funnelElements = {
  rateXacNhan: document.getElementById('dashRateXacNhan'),
  rateKy: document.getElementById('dashRateKy'),
  rateThanhToan: document.getElementById('dashRateThanhToan'),
  barXacNhan: document.getElementById('dashBarXacNhan'),
  barKy: document.getElementById('dashBarKy'),
  barThanhToan: document.getElementById('dashBarThanhToan'),
  chartCenterValue: document.getElementById('chartCenterValue')
};

/**
 * Định dạng số
 */
function formatNum(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('vi-VN').format(num);
}

/**
 * Định dạng phần trăm (1 chữ số thập phân, kiểu Việt Nam)
 */
function formatPercent(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, minimumFractionDigits: 1 }).format(num) + '%';
}

/**
 * Tính tỉ lệ an toàn (tránh chia cho 0)
 */
function safeRate(part, base) {
  const p = Number(part || 0);
  const b = Number(base || 0);
  if (b <= 0) return 0;
  return Math.min(100, Math.max(0, (p / b) * 100));
}

/**
 * Trạng thái Loading
 */
function setLoadingState() {
  Object.keys(elements).forEach(key => {
    if (elements[key]) elements[key].textContent = '...';
  });
  [funnelElements.rateXacNhan, funnelElements.rateKy, funnelElements.rateThanhToan].forEach(el => {
    if (el) el.textContent = '--%';
  });
  [funnelElements.barXacNhan, funnelElements.barKy, funnelElements.barThanhToan].forEach(el => {
    if (el) el.style.width = '0%';
  });
  if (funnelElements.chartCenterValue) funnelElements.chartCenterValue.textContent = '--%';
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

  renderFunnelRates(data);
  renderChart(data);
}

/**
 * Tính và hiển thị tỉ lệ % + thanh progress cho từng giai đoạn của phễu:
 * Xác nhận tính trên Tổng học phần, Ký tính trên Đã xác nhận, Thanh toán tính trên Đã ký.
 */
function renderFunnelRates(data) {
  const rateXacNhan = safeRate(data.DaXacNhan, data.TongNhomLop);
  const rateKy = safeRate(data.DaKy, data.DaXacNhan);
  const rateThanhToan = safeRate(data.DaThanhToan, data.DaKy);

  if (funnelElements.rateXacNhan) funnelElements.rateXacNhan.textContent = formatPercent(rateXacNhan);
  if (funnelElements.rateKy) funnelElements.rateKy.textContent = formatPercent(rateKy);
  if (funnelElements.rateThanhToan) funnelElements.rateThanhToan.textContent = formatPercent(rateThanhToan);

  if (funnelElements.barXacNhan) funnelElements.barXacNhan.style.width = rateXacNhan + '%';
  if (funnelElements.barKy) funnelElements.barKy.style.width = rateKy + '%';
  if (funnelElements.barThanhToan) funnelElements.barThanhToan.style.width = rateThanhToan + '%';
}

let ratioChartInstance = null;

function renderChart(data) {
  const ctx = document.getElementById('ratioChart');
  if (!ctx || typeof Chart === 'undefined') return;

  if (ratioChartInstance) {
    ratioChartInstance.destroy();
  }

  const unconfirmed = data.ChuaXacNhan || 0;
  const unsigned = data.ChuaKy || 0;
  const unpaid = data.ChuaThanhToan || 0;
  const paid = data.DaThanhToan || 0;
  const total = data.TongNhomLop || 1;

  const chartData = [unconfirmed, unsigned, unpaid, paid];
  const labels = ['Chưa xác nhận', 'Chưa ký', 'Chưa thanh toán', 'Đã thanh toán'];

  // Bảng màu đồng bộ với các trạng thái trong phễu tiến độ và khối "Cần xử lý"
  const solidColors = [
    '#DC2626', // Đỏ - chưa xác nhận
    '#B45309', // Cam - chưa ký
    '#94A3B8', // Xám - chưa thanh toán
    '#16A34A'  // Xanh lá - đã thanh toán
  ];

  ratioChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: chartData,
        backgroundColor: solidColors,
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '78%',
      plugins: {
        legend: {
          display: false // Dùng legend HTML tự dựng bên dưới biểu đồ
        },
        tooltip: {
          padding: 12,
          titleFont: { size: 14 },
          bodyFont: { size: 14 },
          callbacks: {
            label: function (context) {
              const val = context.raw;
              const percentage = ((val / total) * 100).toFixed(1) + '%';
              return ` ${context.label}: ${formatNum(val)} (${percentage})`;
            }
          }
        }
      }
    }
  });

  if (funnelElements.chartCenterValue) {
    const paidRate = total > 0 ? (paid / total) * 100 : 0;
    funnelElements.chartCenterValue.textContent = formatPercent(paidRate);
  }

  renderCustomLegend(labels, solidColors, chartData, total);
}

function renderCustomLegend(labels, colors, data, total) {
  const legendContainer = document.getElementById('chartLegend');
  if (!legendContainer) return;

  let html = '';
  labels.forEach((label, index) => {
    const val = data[index];
    const percentage = total > 0 ? ((val / total) * 100).toFixed(1) : '0.0';
    html += `
            <li class="legend-row">
                <span class="legend-dot" style="background-color: ${colors[index]}"></span>
                <span class="legend-label">${label}</span>
                <span class="legend-value">${formatNum(val)}</span>
                <span class="legend-percent">${percentage}%</span>
            </li>
        `;
  });
  legendContainer.innerHTML = html;
}

/**
 * Fetch API
 */
async function loadDashboardStats(namTaiChinh) {
  if (!namTaiChinh) return;

  setLoadingState();
  try {
    const data = await apiHeDaoTaoChinhQuy.getDashboardStats(namTaiChinh);
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