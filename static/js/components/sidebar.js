// Khôi phục trạng thái từ localStorage
document.querySelectorAll('.has-submenu').forEach(item => {
    const menuId = item.getAttribute('data-menu-id');
    const submenu = item.querySelector('.sidebar-submenu');
    const toggleBtn = item.querySelector('.submenu-toggle');

    if (menuId && submenu && toggleBtn) {
        const state = localStorage.getItem('sidebar_submenu_' + menuId);
        if (state === 'open') {
            submenu.style.display = 'block';
            toggleBtn.classList.add('open');
        } else if (state === 'closed') {
            submenu.style.display = 'none';
            toggleBtn.classList.remove('open');
        }
    }
});

// Gắn sự kiện click
document.querySelectorAll('.submenu-toggle').forEach(btn => {
    btn.addEventListener('click', function (e) {
        e.preventDefault();
        const parentLi = this.closest('.has-submenu');
        const menuId = parentLi.getAttribute('data-menu-id');
        const submenu = parentLi.querySelector('.sidebar-submenu');

        if (submenu) {
            const isHidden = submenu.style.display === 'none';
            submenu.style.display = isHidden ? 'block' : 'none';
            this.classList.toggle('open', isHidden);

            if (menuId) {
                localStorage.setItem('sidebar_submenu_' + menuId, isHidden ? 'open' : 'closed');
            }
        }
    });
});

// --- LOGIC CHO SIDEBAR CO GIÃN VÀ THU GỌN ---
(function() {
    const sidebar = document.querySelector('.sidebar');
    const resizer = document.getElementById('sidebarResizer');
    const toggleBtn = document.getElementById('btnSidebarToggle');
    
    if (!sidebar) return;

    // Phục hồi trạng thái chiều rộng từ localStorage
    const savedWidth = localStorage.getItem('sidebarWidth');
    const isCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    if (savedWidth) {
        sidebar.style.setProperty('--sidebar-width', savedWidth + 'px');
    }
    
    if (isCollapsed) {
        sidebar.classList.add('collapsed');
    }

    // Logic Đóng/Mở Sidebar
    if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            sidebar.classList.toggle('collapsed');
            localStorage.setItem('sidebarCollapsed', sidebar.classList.contains('collapsed'));
        });
    }

    // Logic Kéo co giãn (Resize)
    if (resizer) {
        let isResizing = false;
        let startX, startWidth;

        resizer.addEventListener('mousedown', (e) => {
            isResizing = true;
            startX = e.clientX;
            // Tắt transition khi kéo để không bị giật lag
            sidebar.classList.add('no-transition');
            resizer.classList.add('dragging');
            
            // Nếu chưa có setProperty inline, lấy giá trị getComputedStyle
            startWidth = parseInt(getComputedStyle(sidebar).width, 10);
            
            // Xóa vùng chọn text
            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', (e) => {
            if (!isResizing) return;
            // Ngăn chặn nếu đang bị thu gọn
            if (sidebar.classList.contains('collapsed')) return;

            const dx = e.clientX - startX;
            let newWidth = startWidth + dx;
            
            // Giới hạn chiều rộng
            if (newWidth < 150) newWidth = 150;
            if (newWidth > 600) newWidth = 600;

            sidebar.style.setProperty('--sidebar-width', newWidth + 'px');
        });

        document.addEventListener('mouseup', () => {
            if (isResizing) {
                isResizing = false;
                sidebar.classList.remove('no-transition');
                resizer.classList.remove('dragging');
                document.body.style.userSelect = '';
                
                // Lưu lại chiều rộng
                const currentWidth = parseInt(getComputedStyle(sidebar).width, 10);
                localStorage.setItem('sidebarWidth', currentWidth);
            }
        });
    }
})();

// --- LOGIC CHO SIDEBAR SCROLL RESTORATION ---
(function() {
    const sidebarContent = document.querySelector('.sidebar-content');
    if (!sidebarContent) return;

    // 1. Phục hồi vị trí cuộn ngay khi tải trang
    const savedScroll = sessionStorage.getItem('sidebarScrollTop');
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
    sidebarContent.addEventListener('scroll', () => {
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            sessionStorage.setItem('sidebarScrollTop', sidebarContent.scrollTop);
        }, 100); // Lưu sau khi dừng cuộn 100ms
    });
})();