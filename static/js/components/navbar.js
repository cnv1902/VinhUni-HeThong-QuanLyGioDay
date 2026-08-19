// ==========================================
// 1. STATE & DOM ELEMENTS
// ==========================================
const navbarState = {
  namTaiChinhList: [],
  selectedNamTaiChinh: null
};

const selNamTaiChinh = document.getElementById('ctxNamTaiChinh');

// ==========================================
// 2. DATA PROCESSING & HTML RENDERING
// ==========================================
/**
 * Trích xuất danh sách Năm tài chính duy nhất (lấy 4 số cuối)
 */
function renderNamTaiChinhOptions(data) {
  if (!selNamTaiChinh) return;

  // Trích xuất 4 ký tự cuối của NamTaiChinh và loại bỏ trùng lặp
  const years = [...new Set(data.map(item => {
    if (!item.NamTaiChinh) return null;
    const ntc = String(item.NamTaiChinh).trim();
    return ntc.length >= 4 ? ntc.slice(-4) : ntc;
  }))].filter(Boolean);

  // Sắp xếp năm giảm dần (mới nhất lên trên)
  years.sort((a, b) => b.localeCompare(a));

  navbarState.namTaiChinhList = years;

  selNamTaiChinh.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');

  if (navbarState.selectedNamTaiChinh) {
    selNamTaiChinh.value = navbarState.selectedNamTaiChinh;
  }
}

function handleContextChange() {
  const namTaiChinh = selNamTaiChinh.value;
  if (namTaiChinh) {
    navbarState.selectedNamTaiChinh = namTaiChinh;
    sessionStorage.setItem('CTX_NAM_TAI_CHINH', namTaiChinh);
    window.dispatchEvent(new CustomEvent('ContextChanged', { detail: namTaiChinh }));
  }
}

// ==========================================
// 3. EVENT LISTENERS BINDING
// ==========================================
function bindNavbarEvents() {
  if (selNamTaiChinh) {
    selNamTaiChinh.addEventListener('change', handleContextChange);
  }
}

// ==========================================
// 4. INITIALIZATION (API CALL)
// ==========================================
async function initNavbar() {
  try {
    const data = await apiNavbar.getNamTaiChinhList();
    if (!data || data.length === 0) return;

    renderNamTaiChinhOptions(data);

    // 1. Cố gắng lấy từ sessionStorage trước
    const savedYear = sessionStorage.getItem('CTX_NAM_TAI_CHINH');
    if (savedYear && navbarState.namTaiChinhList.includes(savedYear)) {
      navbarState.selectedNamTaiChinh = savedYear;
      if (selNamTaiChinh) selNamTaiChinh.value = savedYear;
    } else if (navbarState.namTaiChinhList.length > 0) {
      // 2. Mặc định chọn năm đầu tiên (mới nhất)
      navbarState.selectedNamTaiChinh = navbarState.namTaiChinhList[0];
      if (selNamTaiChinh) selNamTaiChinh.value = navbarState.selectedNamTaiChinh;
    }

    bindNavbarEvents();

    // Phát sóng sự kiện LẦN ĐẦU TIÊN để các trang con biết Context đã sẵn sàng
    if (navbarState.selectedNamTaiChinh) {
      window.dispatchEvent(new CustomEvent('ContextReady', { detail: navbarState.selectedNamTaiChinh }));
    }

  } catch (error) {
    console.error('Lỗi khi tải dữ liệu Navbar:', error);
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initNavbar);
