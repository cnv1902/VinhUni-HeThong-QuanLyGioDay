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