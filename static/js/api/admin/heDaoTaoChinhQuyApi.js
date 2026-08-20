const apiHeDaoTaoChinhQuy = {
  async getDashboardStats(namTaiChinh) {
    const response = await fetch(
      `${window.API_PREFIX}/cq-dashboard?nam_tai_chinh=${encodeURIComponent(namTaiChinh)}`,
      { credentials: "same-origin" },
    );
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  },
};
