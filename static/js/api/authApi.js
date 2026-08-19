/**
 * Giao tiếp với Backend API xác thực
 */
const apiAuth = {
    /**
     * Đổi Transfer Token lấy Access Token dài hạn
     * @param {string} transferToken - Token trung chuyển 1 phút
     * @returns {Promise<Object>} Object chứa access_token
     */
    async exchangeToken(transferToken) {
        const response = await fetch('/api/v1/auth/exchange', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transfer_token: transferToken })
        });
        
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || 'Transfer Token hết hạn hoặc không hợp lệ');
        }
        
        return await response.json();
    }
};
