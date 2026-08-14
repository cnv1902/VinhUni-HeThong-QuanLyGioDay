const apiHeDaoTaoChinhQuy = {
    async getDashboardStats(hocKy) {
        const response = await fetch(`${window.API_PREFIX}/cq-dashboard?hoc_ky=${encodeURIComponent(hocKy)}`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    }
}