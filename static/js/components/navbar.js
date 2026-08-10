// ==========================================
// 1. STATE & DOM ELEMENTS
// ==========================================
const navbarState = {
  hocKyList: [],
  selectedMaHocKy: null,
  selectedNamHoc: null,
  selectedHocKy: null
};

const selHocKy = document.getElementById('ctxHocKy');
const selNamHoc = document.getElementById('ctxNamHoc');

// ==========================================
// 2. DATA PROCESSING & HTML RENDERING
// ==========================================
/**
 * Tìm và gán context (Học kỳ, Năm học) dựa trên chuỗi TenHocKy hiện tại
 */
function applyContextFromTenHocKy(tenHocKy) {
  const hk = navbarState.hocKyList.find(x => x.TenHocKy == tenHocKy);
  if (hk) {
    navbarState.selectedMaHocKy = hk.MaHocKy;
    const parts = hk.TenHocKy.split('_');
    if (parts.length === 2) {
      navbarState.selectedHocKy = parseInt(parts[0]);
      navbarState.selectedNamHoc = parts[1];
    }
    sessionStorage.setItem('CTX_HOC_KY_NAM_HOC', hk.TenHocKy);
  }
}

/**
 * Trích xuất danh sách Năm học duy nhất và Đổ dữ liệu vào ô Chọn Năm học.
 */
function renderNamHocOptions() {
  if (!selNamHoc) return;
  const namHocs = [...new Set(navbarState.hocKyList.map(item => {
    const parts = item.TenHocKy ? item.TenHocKy.split('_') : [];
    return parts.length === 2 ? parts[1] : null;
  }))].filter(Boolean);
  // Sắp xếp năm học giảm dần (mới nhất lên trên)
  namHocs.sort((a, b) => b.localeCompare(a));
  
  selNamHoc.innerHTML = namHocs.map(nh => `<option value="${nh}">${nh}</option>`).join('');
  if (navbarState.selectedNamHoc) {
    selNamHoc.value = navbarState.selectedNamHoc;
  }
}

/**
 * Trích xuất danh sách Học kỳ duy nhất (thường là 1, 2, 3) và Đổ vào ô Chọn Học kỳ.
 */
function renderHocKyOptions() {
  if (!selHocKy) return;
  const hocKys = [...new Set(navbarState.hocKyList.map(item => {
    const parts = item.TenHocKy ? item.TenHocKy.split('_') : [];
    return parts.length === 2 ? parseInt(parts[0]) : null;
  }))].filter(Boolean);
  hocKys.sort((a, b) => a - b);
  
  selHocKy.innerHTML = hocKys.map(hk => `<option value="${hk}">${hk}</option>`).join('');
  if (navbarState.selectedHocKy) {
    selHocKy.value = navbarState.selectedHocKy;
  }
}

/**
 * Xử lý khi người dùng đổi combo box
 */
function handleContextChange() {
  const namHoc = selNamHoc.value;
  const hocKy = parseInt(selHocKy.value);
  
  const tenHocKyStr = `${hocKy}_${namHoc}`;
  
  // Tìm TenHocKy tương ứng với cặp (Năm học, Học kỳ) vừa chọn
  const match = navbarState.hocKyList.find(x => x.TenHocKy === tenHocKyStr);
  
  if (match) {
    applyContextFromTenHocKy(match.TenHocKy);
    // Phát sóng sự kiện để các trang con tải lại dữ liệu (Truyền chuỗi)
    window.dispatchEvent(new CustomEvent('ContextChanged', { detail: match.TenHocKy }));
  } else {
    // Nếu cặp Năm học + Học kỳ này không tồn tại trong DB, tự động fall back về học kỳ hợp lệ đầu tiên của Năm học đó
    const fallback = navbarState.hocKyList.find(x => x.TenHocKy && x.TenHocKy.endsWith(`_${namHoc}`));
    if (fallback) {
      applyContextFromTenHocKy(fallback.TenHocKy);
      renderHocKyOptions(); // Update lại UI combobox
      window.dispatchEvent(new CustomEvent('ContextChanged', { detail: fallback.TenHocKy }));
    }
  }
}

// ==========================================
// 3. EVENT LISTENERS BINDING
// ==========================================
function bindNavbarEvents() {
  if (selHocKy) {
    selHocKy.addEventListener('change', handleContextChange);
  }
  if (selNamHoc) {
    selNamHoc.addEventListener('change', handleContextChange);
  }
}

// ==========================================
// 4. INITIALIZATION (API CALL)
// ==========================================
/**
 * Tải danh sách cấu hình học kỳ từ máy chủ.
 */
async function initNavbar() {
  try {
    const data = await apiNavbar.getHocKyList();
    if (!data || data.length === 0) return;
    
    navbarState.hocKyList = data;
    
    // 1. Cố gắng lấy từ sessionStorage trước
    const savedTenHocKy = sessionStorage.getItem('CTX_HOC_KY_NAM_HOC');
    
    if (savedTenHocKy && data.some(x => x.TenHocKy == savedTenHocKy)) {
      applyContextFromTenHocKy(savedTenHocKy);
    } else {
      // 2. Mặc định tự động lấy bản ghi đầu tiên
      applyContextFromTenHocKy(data[0].TenHocKy);
    }
    
    renderNamHocOptions();
    renderHocKyOptions();
    bindNavbarEvents();
    
    // Phát sóng sự kiện LẦN ĐẦU TIÊN để các trang con biết Context đã sẵn sàng
    const currentStr = `${navbarState.selectedHocKy}_${navbarState.selectedNamHoc}`;
    window.dispatchEvent(new CustomEvent('ContextReady', { detail: currentStr }));
    
  } catch (error) {
    console.error('Lỗi khi tải dữ liệu Navbar:', error);
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener('DOMContentLoaded', initNavbar);
