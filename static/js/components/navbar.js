// ==========================================
// 1. STATE & DOM ELEMENTS
// ==========================================
const navbarState = {
  namTaiChinhList: [],
  selectedNamTaiChinh: null,
};

const selNamTaiChinh = document.getElementById("ctxNamTaiChinh");
const elAvatar = document.querySelector(".who .avatar");
const elUserName = document.querySelector(".who .user-name");

// ==========================================
// 2. DATA PROCESSING & HTML RENDERING
// ==========================================
/**
 * Trích xuất danh sách Năm tài chính duy nhất (giữ nguyên chính xác, không cắt ngắn)
 */
function renderNamTaiChinhOptions(data) {
  if (!selNamTaiChinh) return;

  // Giữ nguyên giá trị NamTaiChinh chính xác và loại bỏ trùng lặp
  const years = [
    ...new Set(
      data.map((item) => {
        if (!item.NamTaiChinh) return null;
        return String(item.NamTaiChinh).trim();
      }),
    ),
  ].filter(Boolean);

  // Sắp xếp năm giảm dần (mới nhất lên trên)
  years.sort((a, b) => b.localeCompare(a));

  navbarState.namTaiChinhList = years;

  selNamTaiChinh.innerHTML = years
    .map((y) => `<option value="${y}">${y}</option>`)
    .join("");

  if (navbarState.selectedNamTaiChinh) {
    selNamTaiChinh.value = navbarState.selectedNamTaiChinh;
  }
}

function handleContextChange() {
  const namTaiChinh = selNamTaiChinh.value;
  if (namTaiChinh) {
    navbarState.selectedNamTaiChinh = namTaiChinh;
    sessionStorage.setItem("CTX_NAM_TAI_CHINH", namTaiChinh);
    window.dispatchEvent(
      new CustomEvent("ContextChanged", { detail: namTaiChinh }),
    );
  }
}

// ==========================================
// 3. EVENT LISTENERS BINDING
// ==========================================
function bindNavbarEvents() {
  if (selNamTaiChinh) {
    selNamTaiChinh.addEventListener("change", handleContextChange);
  }

  // --- Dropdown User Menu ---
  const btnUserMenu = document.getElementById("btnUserMenu");
  const userDropdownMenu = document.getElementById("userDropdownMenu");
  const btnLogout = document.getElementById("btnLogout");

  if (btnUserMenu && userDropdownMenu) {
    btnUserMenu.addEventListener("click", (e) => {
      e.stopPropagation();
      userDropdownMenu.classList.toggle("show");
    });

    // Bấm ra ngoài để đóng menu
    document.addEventListener("click", (e) => {
      if (
        !btnUserMenu.contains(e.target) &&
        !userDropdownMenu.contains(e.target)
      ) {
        userDropdownMenu.classList.remove("show");
      }
    });
  }
}

// ==========================================
// 4. INITIALIZATION (API CALL)
// ==========================================
async function initNavbar() {
  try {
    // 1. Tải thông tin Cán bộ
    apiNavbar.getCurrentUserCbgd().then((userInfo) => {
      if (userInfo) {
        const fullName =
          userInfo.ho_ten ||
          `${userInfo.HS_Ho || ""} ${userInfo.HS_Ten || ""}`.trim();
        const ten = (userInfo.HS_Ten || "").trim();

        if (elUserName && fullName) elUserName.textContent = fullName;
        if (elAvatar && ten) elAvatar.textContent = ten.charAt(0).toUpperCase();
      }
    });

    // 2. Tải danh sách Năm tài chính
    const data = await apiNavbar.getNamTaiChinhList();
    if (!data || data.length === 0) return;

    renderNamTaiChinhOptions(data);

    // 1. Cố gắng lấy từ sessionStorage trước
    const savedYear = sessionStorage.getItem("CTX_NAM_TAI_CHINH");
    if (savedYear && navbarState.namTaiChinhList.includes(savedYear)) {
      navbarState.selectedNamTaiChinh = savedYear;
      if (selNamTaiChinh) selNamTaiChinh.value = savedYear;
    } else if (navbarState.namTaiChinhList.length > 0) {
      // 2. Mặc định chọn năm đầu tiên (mới nhất)
      navbarState.selectedNamTaiChinh = navbarState.namTaiChinhList[0];
      if (selNamTaiChinh)
        selNamTaiChinh.value = navbarState.selectedNamTaiChinh;
    }

    bindNavbarEvents();

    // Phát sóng sự kiện LẦN ĐẦU TIÊN để các trang con biết Context đã sẵn sàng
    if (navbarState.selectedNamTaiChinh) {
      window.dispatchEvent(
        new CustomEvent("ContextReady", {
          detail: navbarState.selectedNamTaiChinh,
        }),
      );
    }
  } catch (error) {
    console.error("Lỗi khi tải dữ liệu Navbar:", error);
  }
}

// Khởi chạy khi DOM đã sẵn sàng
document.addEventListener("DOMContentLoaded", initNavbar);
