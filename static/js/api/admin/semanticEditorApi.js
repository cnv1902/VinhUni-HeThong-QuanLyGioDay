const apiSemanticEditor = {
  getHeSoLopDongDonGian: async () => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/he-so-lop-dong/danh-sach-don-gian`);
  },
  
  getTruongHopNhomCongThuc: async (groupId) => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}`);
  },
  
  getHeSoLopDong: async () => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/he-so-lop-dong/`);
  },
  
  deleteTruongHopCongThuc: async (caseId) => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/truong-hop-cong-thuc/${caseId}`, { method: 'DELETE' });
  },
  
  bulkUpdateHeSoLopDong: async (payload) => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/he-so-lop-dong/bulk-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ he_so_lop_dong: payload })
    });
  },
  
  bulkUpdateTruongHopNhomCongThuc: async (groupId, validTruongHop) => {
    return await fetch(`${window.API_PREFIX || '/api/v1'}/truong-hop-cong-thuc/nhom-cong-thuc/${groupId}/bulk-update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ truong_hop_cong_thuc: validTruongHop })
    });
  }
};
