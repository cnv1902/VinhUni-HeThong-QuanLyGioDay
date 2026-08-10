SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

CREATE TABLE [dbo].[tbl_CauHinhCongThucQuyDoi] (
    [ID] INT IDENTITY(1,1) NOT NULL,
    
    -- =================================================================
    -- PHẦN 1: CÁC CỘT ĐIỀU KIỆN LỌC (FILTER CONDITIONS)
    -- =================================================================
    [TuHocKy] INT NOT NULL,                          -- Kỳ học bắt đầu áp dụng quy chế (Ví dụ: 1, 26)
    [DenHocKy] INT NULL,                             -- Kỳ học kết thúc (NULL = áp dụng vô thời hạn)
    [MaHTHoc_List] VARCHAR(200) NULL,                -- Chứa chuỗi ID Hình thức học (VD: '1,12,13,14,18'). NULL = Bỏ qua (Áp dụng tất cả)
    [MaHTDay_List] VARCHAR(200) NULL,                -- Chứa chuỗi ID Hình thức dạy (VD: '2,10,11'). NULL = Bỏ qua (Áp dụng tất cả)
    [LopChuyen_Rule] TINYINT NOT NULL DEFAULT -1,    -- Trạng thái: -1 (Không quan tâm/Bỏ qua), 0 (Chỉ áp dụng Lớp Không chuyên), 1 (Chỉ áp dụng Lớp Chuyên)
    [KhoaHoc_Match] NVARCHAR(200) NULL,              -- Lọc ngoại lệ khóa học (VD: N'K58,K59,KKhóa 61'). NULL = Bỏ qua
    [SoSV_Min] INT NULL,                             -- Cận dưới sĩ số lớp (VD: 50, 100)
    [SoSV_Max] INT NULL,                             -- Cận trên sĩ số lớp (VD: 99, 9999)
    
    [DoUuTien] INT NOT NULL DEFAULT 999,             -- Ưu tiên quét: Số càng nhỏ càng ưu tiên (Dùng để bắt bẫy các quy tắc ngoại lệ trước quy tắc chung)
    [GhiChu] NVARCHAR(500) NULL,                     -- Giải thích nghiệp vụ (VD: N'Quy chế dạy Online từ kỳ 26, lớp siêu đông')

    -- =================================================================
    -- PHẦN 2: BIẾN ĐỔI BIẾN SỐ GỐC (PHASE 1 - Tính lại số tiết đầu vào)
    -- =================================================================
    -- Số tiết Lý thuyết
    [HienThi_CongThuc_SoTietLT] NVARCHAR(500) NULL,  -- Chuỗi hiển thị UI (VD: "Tiết LT + Tiết BT")
    [CongThuc_SoTietLT] NVARCHAR(500) NULL,          -- Công thức Backend thực thi (VD: "SoTietLT + SoTietBT")

    -- Số tiết Thực hành
    [HienThi_CongThuc_SoTietTH] NVARCHAR(500) NULL,
    [CongThuc_SoTietTH] NVARCHAR(500) NULL,

    -- Số tiết Bài tập
    [HienThi_CongThuc_SoTietBT] NVARCHAR(500) NULL,
    [CongThuc_SoTietBT] NVARCHAR(500) NULL,

    -- Số tiết Đồ án
    [HienThi_CongThuc_SoTietDA] NVARCHAR(500) NULL,
    [CongThuc_SoTietDA] NVARCHAR(500) NULL,

    -- Số tiết Thực tập
    [HienThi_CongThuc_SoTietThucTap] NVARCHAR(500) NULL,
    [CongThuc_SoTietThucTap] NVARCHAR(500) NULL,

    -- Số tiết Đồ án Khóa luận
    [HienThi_CongThuc_SoTietDoAnKhoaLuan] NVARCHAR(500) NULL,
    [CongThuc_SoTietDoAnKhoaLuan] NVARCHAR(500) NULL,

    -- =================================================================
    -- PHẦN 3: TÍNH HỆ SỐ NHÂN (PHASE 2 - Dùng cho các môn cần quy đổi)
    -- =================================================================
    -- Hệ số Lý thuyết
    [HienThi_CongThuc_HeSoNhanLT] NVARCHAR(500) NULL,
    [CongThuc_HeSoNhanLT] NVARCHAR(500) NULL,

    -- Hệ số Thực hành
    [HienThi_CongThuc_HeSoNhanTH] NVARCHAR(500) NULL,
    [CongThuc_HeSoNhanTH] NVARCHAR(500) NULL,

    -- Hệ số Bài tập
    [HienThi_CongThuc_HeSoNhanBT] NVARCHAR(500) NULL,
    [CongThuc_HeSoNhanBT] NVARCHAR(500) NULL,

    -- =================================================================
    -- PHẦN 4: TÍNH SỐ TIẾT QUY ĐỔI ĐẦU RA (PHASE 3 - Kết quả cuối cùng)
    -- =================================================================
    -- Số tiết Lý thuyết Quy định / Quy đổi
    [HienThi_CongThuc_SoTietLTQD] NVARCHAR(500) NULL,
    [CongThuc_SoTietLTQD] NVARCHAR(500) NULL,

    -- Số tiết Thực hành Quy định / Quy đổi
    [HienThi_CongThuc_SoTietTHQD] NVARCHAR(500) NULL,
    [CongThuc_SoTietTHQD] NVARCHAR(500) NULL,

    -- Số tiết Bài tập Quy định / Quy đổi
    [HienThi_CongThuc_SoTietBTQD] NVARCHAR(500) NULL,
    [CongThuc_SoTietBTQD] NVARCHAR(500) NULL,

	-- Giờ dạy 1 Tín chỉ (Biến trung gian dành riêng cho GDTC)
    [HienThi_CongThuc_GioDay1TC_GDTC] NVARCHAR(500) NULL,
    [CongThuc_GioDay1TC_GDTC] NVARCHAR(500) NULL,

    -- =================================================================
    -- PHẦN 5: QUẢN TRỊ HỆ THỐNG
    -- =================================================================
    [TrangThai] BIT NOT NULL DEFAULT 1,              -- 1: Đang sử dụng, 0: Tạm khóa
    [NguoiCapNhat] NVARCHAR(50) NULL,
    [NgayCapNhat] DATETIME NOT NULL DEFAULT GETDATE(),

    CONSTRAINT [PK_tbl_CauHinhCongThucQuyDoi] PRIMARY KEY CLUSTERED ([ID] ASC),
	
	-- Khóa ngoại trỏ đến bảng Học Kỳ
	CONSTRAINT [FK_CauHinhQuyDoi_TuHocKy] FOREIGN KEY ([TuHocKy]) 
        REFERENCES [dbo].[tbl_HocKy]([MaHocKy]),
        
    CONSTRAINT [FK_CauHinhQuyDoi_DenHocKy] FOREIGN KEY ([DenHocKy]) 
        REFERENCES [dbo].[tbl_HocKy]([MaHocKy])
) ON [PRIMARY]
GO