/**
 * Giao tiếp với Backend API Phân quyền chức năng
 */
const apiPhanQuyenChucNang = {
    /**
     * Lấy danh sách chức năng (phân quyền) theo user đang đăng nhập
     * @param {string} token - Access token dài hạn
     * @returns {Promise<Array>} Mảng dữ liệu chức năng phẳng
     */
    async getDanhSachChucNang(token) {
        const response = await fetch('/api/v1/phan-quyen-chuc-nang/', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('UNAUTHORIZED');
            }
            throw new Error('Lỗi khi tải danh sách chức năng');
        }
        
        return await response.json();
    }
};
