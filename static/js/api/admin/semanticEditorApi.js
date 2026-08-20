const apiSemanticEditor = {
  getHeSoLopDongDonGian: async () => {
    return await fetch(
      `${window.API_PREFIX || "/api/v1"}/he-so-lop-dong/danh-sach-don-gian`,
      { credentials: "same-origin" },
    );
  },

  getTruongHopNhomCongThuc: async (groupId) => {
    return await fetch(
      `${window.API_PREFIX || "/api/v1"}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}`,
      { credentials: "same-origin" },
    );
  },

  getHeSoLopDong: async () => {
    return await fetch(`${window.API_PREFIX || "/api/v1"}/he-so-lop-dong/`, {
      credentials: "same-origin",
    });
  },

  deleteTruongHopCongThuc: async (caseId) => {
    return await fetch(
      `${window.API_PREFIX || "/api/v1"}/truong-hop-cong-thuc/${caseId}`,
      { method: "DELETE", credentials: "same-origin" },
    );
  },

  bulkUpdateHeSoLopDong: async (payload) => {
    return await fetch(
      `${window.API_PREFIX || "/api/v1"}/he-so-lop-dong/bulk-update`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ he_so_lop_dong: payload }),
      },
    );
  },

  bulkUpdateTruongHopNhomCongThuc: async (groupId, validTruongHop) => {
    return await fetch(
      `${window.API_PREFIX || "/api/v1"}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}/bulk-update`,
      {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ truong_hop_cong_thuc: validTruongHop }),
      },
    );
  },
};
