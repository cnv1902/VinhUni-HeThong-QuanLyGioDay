// ==========================================
// SPA ROUTER: Điều hướng không reload trang
// ==========================================

const SpaRouter = {
  /** Tập hợp path các script đã được nạp (không bao gồm query version) */
  _loadedScripts: new Set(),

  init() {
    // Bắt sự kiện click trên các link SPA
    document.addEventListener("click", this.handleLinkClick.bind(this));

    // Bắt sự kiện nút Back/Forward của trình duyệt
    window.addEventListener("popstate", async (e) => {
      const oldUrl = sessionStorage.getItem("spa_current_url") || window.location.href;
      const targetUrl = window.location.pathname + window.location.search;

      // Nếu có thay đổi chưa lưu, trình duyệt ĐÃ lùi trang.
      // Cần pushState lại URL cũ ngay lập tức để chờ xác nhận.
      if (typeof window.checkUnsavedChanges === "function" && window.checkUnsavedChanges()) {
        window.history.pushState(null, "", oldUrl);
        const confirmed = await confirmModal.show(
          "Có bản ghi chỉnh sửa chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?",
          "Chưa lưu thay đổi",
          "Rời khỏi",
          "var(--red-600)"
        );
        if (!confirmed) {
          return; // Hủy chuyển trang
        } else {
          // Người dùng đồng ý rời đi, cập nhật URL đích và điều hướng
          window.history.replaceState(null, "", targetUrl);
          this.navigate(targetUrl, false);
          return;
        }
      }

      this.navigate(targetUrl, false);
    });

    // Seed _loadedScripts từ các script đã được server render sẵn trên trang đầu tiên.
    // Vì trang đầu không đi qua executeScripts(), Set sẽ rỗng và router sẽ inject lại
    // gây lỗi "already declared" khi chuyển tab lần đầu. Scan và đánh dấu trước.
    const initialPageScripts = document.getElementById("page-scripts");
    if (initialPageScripts) {
      initialPageScripts.querySelectorAll("script[src]").forEach((script) => {
        const rawSrc = script.getAttribute("src");
        if (!rawSrc) return;
        const normalizedPath = new URL(rawSrc, window.location.origin).pathname;
        const isPageScript = normalizedPath.includes("/js/pages/");
        if (!isPageScript) {
          this._loadedScripts.add(normalizedPath);
        }
      });
    }

    // Lưu URL ban đầu
    sessionStorage.setItem("spa_current_url", window.location.href);
  },

  async handleLinkClick(e) {
    const link = e.target.closest("a[data-spa-link]");
    if (!link) return;

    const url = link.getAttribute("href");
    if (!url || url === "#" || url.startsWith("javascript:")) return;

    e.preventDefault();

    if (typeof window.checkUnsavedChanges === "function" && window.checkUnsavedChanges()) {
      const confirmed = await confirmModal.show(
        "Có bản ghi chỉnh sửa chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang này không?",
        "Chưa lưu thay đổi",
        "Rời khỏi",
        "var(--red-600)"
      );
      if (!confirmed) return;
    }

    // Bỏ qua nếu click vào trang hiện tại
    if (url === window.location.pathname + window.location.search) return;

    await this.navigate(url, true);
  },

  async navigate(url, pushHistory = true) {
    try {
      const mainContent = document.getElementById("main-content");

      const response = await fetch(url, {
        headers: {
          "X-SPA-Request": "true",
        },
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          window.location.href = "/login";
          return;
        }
        if (typeof showToast === "function") {
          showToast(`Trang không tồn tại (${response.status}).`);
        }
        return;
      }

      const html = await response.text();

      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const newMainContent = doc.getElementById("main-content");
      if (!newMainContent) {
        if (typeof showToast === "function") {
          showToast("Không thể tải nội dung trang.");
        }
        return;
      }

      // --- Dọn dẹp trước khi chuyển ---
      window.checkUnsavedChanges = null;
      if (typeof window.pageCleanup === "function") {
        window.pageCleanup();
        window.pageCleanup = null;
      }

      // Cập nhật title
      document.title = doc.title;

      // 1. Load CSS TRƯỚC — chờ tất cả link mới tải xong
      const oldStylesToRemove = await this.updatePageStyles(doc);

      // 2. SAU KHI CSS mới sẵn sàng → swap HTML (tránh FOUC)
      mainContent.innerHTML = newMainContent.innerHTML;

      // 2.5. Xoá CSS cũ sau khi đã swap HTML
      if (oldStylesToRemove) {
        oldStylesToRemove.forEach((link) => link.remove());
      }

      // 3. Cập nhật URL trước khi nạp script (để trang con đọc đúng window.location.search)
      if (pushHistory) {
        window.history.pushState(null, "", url);
      }
      sessionStorage.setItem("spa_current_url", window.location.href);

      // Cập nhật trạng thái active trên Sidebar
      this.updateSidebarActiveState(url);

      // 4. Nạp scripts tuần tự
      const oldScriptsContainer = document.getElementById("page-scripts");
      const newScriptsContainer = doc.getElementById("page-scripts");

      if (oldScriptsContainer && newScriptsContainer) {
        oldScriptsContainer.innerHTML = newScriptsContainer.innerHTML;
        await this.executeScripts(oldScriptsContainer);
      }
    } catch (error) {
      console.warn("[SPA] Không thể điều hướng đến:", url, error.message);
      if (typeof showToast === "function") {
        showToast("Không thể kết nối đến trang này.");
      }
    }
  },

  /**
   * Cập nhật CSS đặc thù của trang mới (nội dung trong #page-styles).
   * So sánh href các link tag để tránh nạp lại CSS đã có.
   * Trả về Promise — chờ tất cả CSS mới tải xong trước khi resolve.
   * @param {Document} doc - Document đã parse từ trang mới
   */
  async updatePageStyles(doc) {
    const oldContainer = document.getElementById("page-styles");
    const newContainer = doc.getElementById("page-styles");
    if (!oldContainer || !newContainer) return;

    // Lấy danh sách href CSS hiện tại
    const currentHrefs = new Set(
      Array.from(oldContainer.querySelectorAll("link[rel='stylesheet']")).map(
        (l) => l.href,
      ),
    );

    // Lấy danh sách href CSS mới
    const newLinks = Array.from(
      newContainer.querySelectorAll("link[rel='stylesheet']"),
    );
    const newHrefs = new Set(newLinks.map((l) => l.href));

    // Thu thập CSS cũ không còn dùng (nhưng CHƯA XOÁ NGAY)
    const linksToRemove = [];
    oldContainer.querySelectorAll("link[rel='stylesheet']").forEach((link) => {
      if (!newHrefs.has(link.href)) linksToRemove.push(link);
    });

    // Thêm CSS mới chưa có — và chờ tải xong
    const loadPromises = [];
    newLinks.forEach((link) => {
      if (!currentHrefs.has(link.href)) {
        const newLink = link.cloneNode(true);
        const p = new Promise((resolve) => {
          newLink.onload = resolve;
          newLink.onerror = resolve;
        });
        oldContainer.appendChild(newLink);
        loadPromises.push(p);
      }
    });

    // Chờ tất cả CSS mới load xong trước khi tiếp tục
    if (loadPromises.length > 0) {
      await Promise.all(loadPromises);
    }

    // Trả về danh sách CSS cũ để xoá SAU KHI swap HTML
    return linksToRemove;
  },

  /**
   * Nạp script tuần tự (sequential) — đảm bảo script sau chỉ chạy
   * sau khi script trước đã tải xong. Tránh lỗi dependency chưa ready.
   * Script component/API chỉ nạp một lần (bỏ qua nếu đã load).
   * Page script luôn chạy lại mỗi lần chuyển trang.
   * @param {HTMLElement} container - Container chứa các thẻ script
   */
  async executeScripts(container) {
    const scripts = Array.from(container.querySelectorAll("script"));
    for (const oldScript of scripts) {
      const rawSrc = oldScript.getAttribute("src");

      if (rawSrc) {
        // Chuẩn hóa path: bỏ query string (?v=...) để so sánh
        const normalizedPath = new URL(rawSrc, window.location.origin).pathname;
        // Page scripts luôn chạy lại (là IIFE, không gây re-declare)
        const isPageScript = normalizedPath.includes("/js/pages/");

        if (!isPageScript && this._loadedScripts.has(normalizedPath)) {
          // Đã load rồi, bỏ qua để tránh lỗi re-declare
          oldScript.remove();
          continue;
        }

        await new Promise((resolve) => {
          const newScript = document.createElement("script");
          Array.from(oldScript.attributes).forEach((attr) => {
            newScript.setAttribute(attr.name, attr.value);
          });
          newScript.onload = resolve;
          newScript.onerror = resolve; // Không chặn nếu 1 script lỗi
          oldScript.replaceWith(newScript);

          // Đánh dấu đã load (chỉ với script không phải page script)
          if (!isPageScript) {
            this._loadedScripts.add(normalizedPath);
          }
        });
      } else {
        // Script inline: thực thi đồng bộ
        const newScript = document.createElement("script");
        if (oldScript.textContent) {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.replaceWith(newScript);
      }
    }
  },

  updateSidebarActiveState(url) {
    const path = new URL(url, window.location.origin).pathname;

    // Xóa class active cũ
    document
      .querySelectorAll(".sidebar-menu a.active")
      .forEach((a) => a.classList.remove("active"));

    // Tìm và thêm class active mới
    document.querySelectorAll(".sidebar-menu a[data-spa-link]").forEach((a) => {
      const href = a.getAttribute("href");
      if (!href || href === "#" || href.startsWith("javascript:")) return;

      const linkPath = new URL(href, window.location.origin).pathname;

      // Trùng khớp chính xác path hoặc nằm trong path con (trừ trang chủ /)
      if (linkPath === path || (linkPath !== "/" && path.startsWith(linkPath))) {
        a.classList.add("active");

        // Mở tự động submenu cha nếu có
        const parentLi = a.closest(".has-submenu");
        if (parentLi) {
          const submenu = parentLi.querySelector(".sidebar-submenu");
          const toggleBtn = parentLi.querySelector(".submenu-toggle");
          if (submenu) submenu.style.display = "block";
          if (toggleBtn) toggleBtn.classList.add("open");
        }
      }
    });
  },
};

document.addEventListener("DOMContentLoaded", () => {
  SpaRouter.init();
});
