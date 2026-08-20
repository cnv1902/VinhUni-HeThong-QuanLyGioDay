// === 1. STATE & DOM ELEMENTS ===
const DOM = {
  dynamicSidebarMenu: document.getElementById("dynamicSidebarMenu"),
};

// === 2. INITIALIZATION ===
/**
 * Khởi tạo trang: Kiểm tra SSO Token, Load Menu động và Khôi phục trạng thái UI
 */
document.addEventListener("DOMContentLoaded", async function () {
  await loadDynamicMenu();
  restoreSubmenuState();
  bindSubmenuEvents();
});

// === 3. DATA PROCESSING & API CALLS ===
/**
 * Tải dữ liệu chức năng từ API và gọi hàm render HTML
 */
async function loadDynamicMenu() {
  if (!DOM.dynamicSidebarMenu) return;

  try {
    // Gọi API Layer
    const flatData = await apiPhanQuyenChucNang.getDanhSachChucNang();

    // Data Processing
    const menuTree = buildMenuTree(flatData);

    // HTML Rendering
    DOM.dynamicSidebarMenu.innerHTML = renderMenuHTML(menuTree);
  } catch (error) {
    if (error.message === "UNAUTHORIZED") {
      window.location.href = "/login";
    } else {
      console.error("Lỗi tải menu:", error);
      DOM.dynamicSidebarMenu.innerHTML =
        '<li><a href="#">Lỗi tải hệ thống</a></li>';
    }
  }
}

/**
 * Chuyển đổi mảng chức năng phẳng (Flat Array) thành cấu trúc cây (Tree)
 * @param {Array} items - Mảng phẳng các chức năng
 * @returns {Array} Mảng cây chức năng
 */
function buildMenuTree(items) {
  const itemMap = {};
  const tree = [];

  // Tạo từ điển để tra cứu nhanh bằng ID
  items.forEach((item) => {
    itemMap[item.CN_ID] = { ...item, children: [] };
  });

  // Lắp ráp các node vào node cha
  items.forEach((item) => {
    if (!item.CN_Thuoc || item.CN_Thuoc === 0) {
      tree.push(itemMap[item.CN_ID]);
    } else {
      if (itemMap[item.CN_Thuoc]) {
        itemMap[item.CN_Thuoc].children.push(itemMap[item.CN_ID]);
      }
    }
  });

  return tree;
}

// === 4. TABLE / HTML RENDERING ===
/**
 * Dùng đệ quy để chuyển đổi cấu trúc cây thành chuỗi HTML Sidebar
 * @param {Array} menuTree - Mảng cây chức năng
 * @returns {string} Chuỗi HTML đã được render
 */
function renderMenuHTML(menuTree) {
  let html = "";
  const currentPath = window.location.pathname;

  menuTree.forEach((node) => {
    const url = node.CN_URL ? node.CN_URL.trim() : "#";

    // Chỉ gán active nếu url hợp lệ, không rỗng và thực sự match với currentPath
    let isActive = "";
    if (url !== "#" && url !== "") {
      if (currentPath === url || (url !== "/" && currentPath.includes(url))) {
        isActive = "active";
      }
    }

    const menuId = "menu_" + node.CN_ID;

    if (node.children && node.children.length > 0) {
      html += `
                <li class="has-submenu" data-menu-id="${menuId}">
                    <div class="menu-item-wrap">
                        <a href="${url}" class="${isActive}" data-spa-link>${node.CN_Ten}</a>
                        <button class="submenu-toggle">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="15 18 9 12 15 6"></polyline>
                            </svg>
                        </button>
                    </div>
                    <ul class="sidebar-submenu" style="display: none;">
                        ${renderMenuHTML(node.children)}
                    </ul>
                </li>
            `;
    } else {
      html += `<li><a href="${url}" class="${isActive}" data-spa-link>${node.CN_Ten}</a></li>`;
    }
  });

  return html;
}

// === 5. EVENT LISTENERS BINDING ===
/**
 * Gắn sự kiện click cho toàn bộ document (Event Delegation) để xử lý đóng mở submenu
 */
function bindSubmenuEvents() {
  document.addEventListener("click", function (e) {
    const toggleBtn = e.target.closest(".submenu-toggle");
    if (toggleBtn) {
      e.preventDefault();
      const parentLi = toggleBtn.closest(".has-submenu");
      if (!parentLi) return;

      const menuId = parentLi.getAttribute("data-menu-id");
      const submenu = parentLi.querySelector(".sidebar-submenu");

      if (submenu) {
        const isHidden = submenu.style.display === "none";
        submenu.style.display = isHidden ? "block" : "none";
        toggleBtn.classList.toggle("open", isHidden);

        if (menuId) {
          localStorage.setItem(
            "sidebar_submenu_" + menuId,
            isHidden ? "open" : "closed",
          );
        }
      }
    }
  });
}

// === 6. UI STATE UPDATERS ===
/**
 * Khôi phục trạng thái (đóng/mở) của các submenu dựa trên giá trị đã lưu trong localStorage
 */
function restoreSubmenuState() {
  document.querySelectorAll(".has-submenu").forEach((item) => {
    const menuId = item.getAttribute("data-menu-id");
    const submenu = item.querySelector(".sidebar-submenu");
    const toggleBtn = item.querySelector(".submenu-toggle");

    if (menuId && submenu && toggleBtn) {
      const state = localStorage.getItem("sidebar_submenu_" + menuId);
      if (state === "open") {
        submenu.style.display = "block";
        toggleBtn.classList.add("open");
      } else if (state === "closed") {
        submenu.style.display = "none";
        toggleBtn.classList.remove("open");
      }
    }
  });
}

// --- LOGIC CHO SIDEBAR CO GIÃN VÀ THU GỌN ---
(function () {
  const sidebar = document.querySelector(".sidebar");
  const resizer = document.getElementById("sidebarResizer");
  const toggleBtn = document.getElementById("btnSidebarToggle");

  if (!sidebar) return;

  // Phục hồi trạng thái chiều rộng từ localStorage
  const savedWidth = localStorage.getItem("sidebarWidth");
  const isCollapsed = localStorage.getItem("sidebarCollapsed") === "true";

  if (savedWidth) {
    sidebar.style.setProperty("--sidebar-width", savedWidth + "px");
  }

  if (isCollapsed) {
    sidebar.classList.add("collapsed");
  }

  // Logic Đóng/Mở Sidebar
  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.toggle("collapsed");
      localStorage.setItem(
        "sidebarCollapsed",
        sidebar.classList.contains("collapsed"),
      );
    });
  }

  // Logic Kéo co giãn (Resize)
  if (resizer) {
    let isResizing = false;
    let startX, startWidth;

    resizer.addEventListener("mousedown", (e) => {
      isResizing = true;
      startX = e.clientX;
      // Tắt transition khi kéo để không bị giật lag
      sidebar.classList.add("no-transition");
      resizer.classList.add("dragging");

      // Nếu chưa có setProperty inline, lấy giá trị getComputedStyle
      startWidth = parseInt(getComputedStyle(sidebar).width, 10);

      // Xóa vùng chọn text
      document.body.style.userSelect = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (!isResizing) return;
      // Ngăn chặn nếu đang bị thu gọn
      if (sidebar.classList.contains("collapsed")) return;

      const dx = e.clientX - startX;
      let newWidth = startWidth + dx;

      // Giới hạn chiều rộng
      if (newWidth < 150) newWidth = 150;
      if (newWidth > 600) newWidth = 600;

      sidebar.style.setProperty("--sidebar-width", newWidth + "px");
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        sidebar.classList.remove("no-transition");
        resizer.classList.remove("dragging");
        document.body.style.userSelect = "";

        // Lưu lại chiều rộng
        const currentWidth = parseInt(getComputedStyle(sidebar).width, 10);
        localStorage.setItem("sidebarWidth", currentWidth);
      }
    });
  }
})();

// --- LOGIC CHO SIDEBAR SCROLL RESTORATION ---
(function () {
  const sidebarContent = document.querySelector(".sidebar-content");
  if (!sidebarContent) return;

  // 1. Phục hồi vị trí cuộn ngay khi tải trang
  const savedScroll = sessionStorage.getItem("sidebarScrollTop");
  if (savedScroll) {
    // Phục hồi ngay lập tức để tránh giật hình
    sidebarContent.scrollTop = parseInt(savedScroll, 10);

    // Thử phục hồi lại sau 50ms phòng trường hợp DOM chưa kịp nạp xong menu con
    setTimeout(() => {
      sidebarContent.scrollTop = parseInt(savedScroll, 10);
    }, 50);
  }

  // 2. Lưu vị trí cuộn khi người dùng lăn chuột (Dùng timer để giảm tải sự kiện scroll)
  let scrollTimeout;
  sidebarContent.addEventListener("scroll", () => {
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      sessionStorage.setItem("sidebarScrollTop", sidebarContent.scrollTop);
    }, 100); // Lưu sau khi dừng cuộn 100ms
  });
})();
