USE [qlGioDay]
GO
/****** Object:  Trigger [dbo].[QuyDoiGio_Update]    Script Date: 04/08/2026 8:19:31 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER TRIGGER [dbo].[QuyDoiGio_Update]
   ON  [dbo].[tbl_CQ_NhomLopHocPhan]
   AFTER  UPDATE
AS 
BEGIN
	Declare @SoSinhVien int
	Declare @SoPhong int
	Declare @HinhThucHoc int
	Declare @HinhThucDay int
	Declare @LopChuyen bit
	Declare @KhoaCN nvarchar(100)
	Declare @KhoaHoc nvarchar(100)
	Declare @SoTietLT float
	Declare @SoTietTH float
	Declare @SoTietBT float
	Declare @SoTietDA float
	Declare @SoTietThucTap float
	Declare @SoTietDoAnKhoaLuan float
	Declare @SoTietLTQD float
	Declare @SoTietTHQD float
	Declare @SoTietBTQD float
	Declare @HeSoNhanLT float
	Declare @HeSoNhanTH float
	Declare @HeSoNhanBT float
	Declare @SoTinChi float
	Declare @GioDay1TC_GDTC float
	Declare @HS_ID bigint
	Declare @SiSoChuyenDoi int
	Declare @SiSoDKH int
	Declare @MaHocKy int
	Declare @HeSoHocPhi float
	
---- Thiết lập giá trị
	Set @SoSinhVien = (SELECT top 1 SoSinhVien FROM INSERTED)
	Set @SiSoChuyenDoi = (SELECT top 1 SiSoChuyenDoi FROM INSERTED)
	Set @SiSoDKH = (SELECT top 1 SiSoDKH FROM INSERTED)
	Set @SoPhong =(SELECT top 1 SoPhong FROM INSERTED)
	Set @HinhThucHoc =(SELECT top 1 MaHTHoc FROM INSERTED)
	Set @HinhThucDay =(SELECT  top 1  MaHTDay FROM INSERTED)
	Set @LopChuyen =(SELECT top 1  LopChuyen FROM INSERTED)
	Set @KhoaCN =(SELECT top 1  KhoaCN FROM INSERTED)
	Set @SoTietLT =(SELECT top 1  SoTietLT FROM INSERTED)
	Set @SoTietTH =(SELECT top 1  SoTietTH FROM INSERTED)
	Set @SoTietBT =(SELECT top 1  SoTietBT FROM INSERTED)
	Set @SoTietDA =(SELECT top 1  SoTietDA FROM INSERTED)
	Set @SoTietThucTap =(SELECT top 1  SoTietThucTap FROM INSERTED)
	Set @SoTietDoAnKhoaLuan =(SELECT top 1  SoTietDoAnKhoaLuan FROM INSERTED)
	Set @SoTinChi =(SELECT top 1  SoTinChi FROM INSERTED)
	Set @SoTietLTQD =(SELECT top 1  SoTietLTQD FROM INSERTED)
	Set @SoTietTHQD =(SELECT top 1  SoTietTHQD FROM INSERTED)
	Set @SoTietBTQD =(SELECT top 1  SoTietBTQD FROM INSERTED)
	Set @MaHocKy =(SELECT top 1  MaHocKy FROM INSERTED)
	Set @HeSoHocPhi =(SELECT top 1  HeSoHocDi FROM INSERTED)
	Set @KhoaHoc =(SELECT top 1  KhoaHoc FROM INSERTED)
	Set @HeSoNhanLT =1.0
	Set @HeSoNhanTH =1.0
	Set @HeSoNhanBT =1.0
	Set @GioDay1TC_GDTC =0

	if (@SiSoChuyenDoi IS NULL)
		SET @SiSoChuyenDoi =0	

	IF  EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile <=1)
		UPDATE tbl_CQ_NhomLopHocPhan SET SoSinhVien = @SiSoDKH + @SiSoChuyenDoi WHERE MaNhomLopHP = (SELECT TOP 1 INSERTED.MaNhomLopHP FROM INSERTED)

	Set @SoSinhVien = (SELECT top 1 SoSinhVien FROM INSERTED)
    If NOT(UPDATE(ID_LanTongHopFile))  --AND EXISTS(SELECT ID FROM INSERTED WHERE ID_LanTongHopFile <=1)
	    BEGIN
	
            -- Nếu học phần đã được xác nhận và thanh toán thì không thay đổi được
            IF EXISTS(SELECT MaNhomLopHP FROM tbl_CQ_KeKhai WHERE MaNhomLopHP IN (SELECT MaNhomLopHP FROM INSERTED) AND (XacNhanThanhToan=1))
                ROLLBACK;
                BEGIN
                    --THEO QUY CHẾ CHI TIÊU NỘI BỘ NĂM 2024, Từ học kỳ 2-2023-2024 trở về sau
                    -- Xác định hệ số nhân lý thuyết và tính giờ cho các hình thức học: Lý thuyết, Lý thuyết & Thảo luận, Lý thuyết & Bài tập,Lý thuyết & Thực hành
                    if (UPDATE(SoSinhVien) OR UPDATE(MaHTHoc) OR UPDATE(MaHTDay) OR UPDATE(SoTinChi) OR UPDATE(SoTietLT) OR UPDATE(SoTietTH) OR UPDATE(SoTietBT) OR UPDATE(SoTietDA) OR UPDATE(SoTietThucTap) OR UPDATE(SoTietDoAnKhoaLuan))
                        BEGIN
                            if (@HinhThucHoc=1 or @HinhThucHoc=12 or @HinhThucHoc=13 or @HinhThucHoc =26 or  @HinhThucHoc =0 or @HinhThucHoc=30 )
                                begin
                                    Set @HeSoNhanLT =0
                                    
                                    -- Dạy bằng Tiếng Anh thi bằng Tiếng Việt
                                    if (@HinhThucDay=10)
                                        begin
                                            if (@SoSinhVien>100) 	
                                                set @HeSoNhanLT= 1.5*1.5
                                            else 
                                                if (@SoSinhVien>80) 	
                                                    set @HeSoNhanLT=1.4*1.5
                                                ELSE
                                                    if (@SoSinhVien>60) 	
                                                        set @HeSoNhanLT=1.3*1.5
                                                    ELSE
                                                        if (@SoSinhVien>50) 	
                                                            SET @HeSoNhanLT=1.2*1.5	
                                                        ELSE 		
                                                            if (@SoSinhVien>40) 	
                                                                set @HeSoNhanLT=1.1*1.5
                                                            ELSE
                                                                if (@SoSinhVien>=10) 	
                                                                    SET @HeSoNhanLT= 1*1.5;		
                                                                ELSE if (@SoSinhVien>5) 							
                                                                    SET @HeSoNhanLT= 1.5*@SoSinhVien*0.1;	
                                                                ELSE 
                                                                    SET @HeSoNhanLT= 1.5*0.5;
                                        end


                                    -- Dạy bằng Tiếng Anh thi bằng Tiếng Anh
                                    if (@HinhThucDay=11)
                                        begin
                                            if (@SoSinhVien>100) 	
                                                set @HeSoNhanLT= 1.5*2
                                            else 
                                                if (@SoSinhVien>80) 	
                                                    set @HeSoNhanLT=1.4*2
                                                ELSE
                                                    if (@SoSinhVien>60) 	
                                                        set @HeSoNhanLT=1.3*2
                                                    ELSE
                                                        if (@SoSinhVien>50) 	
                                                            SET @HeSoNhanLT=1.2*2	
                                                        ELSE 		
                                                            if (@SoSinhVien>40) 	
                                                                set @HeSoNhanLT=1.1*2
                                                            ELSE
                                                                if (@SoSinhVien>=10) 	
                                                                    SET @HeSoNhanLT= 1*2;		
                                                                ELSE if (@SoSinhVien>5) 								
                                                                    SET @HeSoNhanLT= 2*@SoSinhVien*0.1;	
                                                                ELSE
                                                                    SET @HeSoNhanLT= 2*0.5;
                                        end
            
                                    -- Dạy bình thường - quy đổi lớp đông
                                    if (@HinhThucDay=1)
                                        begin
                                            if (@SoSinhVien>100) 	
                                                set @HeSoNhanLT= 1.5
                                            else 
                                                if (@SoSinhVien>80) 	
                                                    set @HeSoNhanLT=1.4
                                                ELSE
                                                    if (@SoSinhVien>60) 	
                                                        set @HeSoNhanLT=1.3
                                                    ELSE
                                                        if (@SoSinhVien>50) 	
                                                            SET @HeSoNhanLT=1.2	
                                                        ELSE 		
                                                            if (@SoSinhVien>40) 	
                                                                set @HeSoNhanLT=1.1
                                                            ELSE
                                                                if (@SoSinhVien>=10) 	
                                                                    SET @HeSoNhanLT= 1;		
                                                                ELSE if (@SoSinhVien>5) 								
                                                                    SET @HeSoNhanLT= @SoSinhVien*0.1;	
                                                                ELSE
                                                                    SET @HeSoNhanLT=0.5
                                        end

                                    -- Dạy ngành ngôn ngữ Anh
                                    if (@HinhThucDay=5)
                                        begin
                                            if (@SoSinhVien>70) 	
                                                set @HeSoNhanLT= 1.5
                                            else 
                                                if (@SoSinhVien>60) 	
                                                    set @HeSoNhanLT=1.4
                                                ELSE
                                                    if (@SoSinhVien>50) 	
                                                        set @HeSoNhanLT=1.3
                                                    ELSE
                                                            if (@SoSinhVien>40) 	
                                                                set @HeSoNhanLT=1.2
                                                            ELSE
                                                                if (@SoSinhVien>=10) 	
                                                                    SET @HeSoNhanLT= 1;		
                                                                ELSE 
                                                                    if (@SoSinhVien>5) 								
                                                                        SET @HeSoNhanLT= @SoSinhVien*0.1;
                                                                    ELSE
                                                                        SET @HeSoNhanLT=0.5

                                        end
            
                                    -- Cập nhật số tiết lý thuyết quy đổi (Lý thuyết + Thảo luận (Bài tập)
                                    if (@HinhThucHoc=12 or @HinhThucHoc=13) 
                                        set @SoTietLT = @SoTietLT + @SoTietBT
                                    if (@HinhThucHoc=30)
                                        set @SoTietLT = @SoTietLT + @SoTietDA
                                    if (@HinhThucHoc=26) -- Dạy học dự án
                                        UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(((SoTietDA+SoTietLT)/15*15)*@HeSoHocPhi*@HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);						
                                    else if (@HinhThucHoc=0) -- Dạy thực hành
                                        UPDATE tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH* 15/15* @HeSoNhanLT,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                    else
                                        Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT*@HeSoNhanLT*15/15,2), SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                end -- of if (@HinhThucHoc=1)
                            else if (@HinhThucHoc=7)
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 1*@SoSinhVien WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            -- Cập nhật tiết chuẩn thực tập nghề  có hồ sơ đi kiểm tra, đánh giá
                            else if (@HinhThucHoc=16) 
                                begin
                                    if (@SoSinhVien >=20)
                                        Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = ROUND(SoTietTH*1.5,2) WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                    else
                                        Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = SoTietTH WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                end
                            --Cập nhật hướng dẫn đồ án tốt nghiệp
                            else if (@HinhThucHoc=5 or @HinhThucHoc=15)
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 1.5 * (@SoTietDoAnKhoaLuan/15) + @SoSinhVien *0.4 *(@SoTietDoAnKhoaLuan/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            else if (@HinhThucHoc=10)	--Cập nhật hướng dẫn đồ án môn học
                                begin
                                    if ((@KhoaHoc LIKE N'%K58%') OR (@KhoaHoc LIKE N'%K59%') OR (@KhoaHoc LIKE N'%K60%') OR  (@KhoaHoc LIKE N'%KKhóa 61%'))
                                        Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*(@SoTietTH/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                    else
                                        Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*(@SoTietDA/15)  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                                end
                            else if (@HinhThucHoc=28)	--Cập nhật Kiểm tra thực tập do cán bộ người trường hướng dẫn
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*@SoTinChi/4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            else if (@HinhThucHoc=27)	--Cập nhật Kiểm tra kiến tập sư phạm
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien*@SoTinChi/4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            else if (@HinhThucHoc=29)	--Cập nhật Lý thuyết GDTC
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD= ROUND(@SoTietLT,2), SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            else if (@HinhThucHoc=23)	--Quy đổi trực tiếp
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD = SoTietLTQD, SoTietBTQD=0,SoTietTHQD= 0  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            --Cập nhật hướng dẫn đồ án tốt nghiệp khoá 61 về trước
                            else if (@HinhThucHoc=32)
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = @SoSinhVien * 1.5 *@SoTinChi + @SoSinhVien *4  WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                            else if NOT (@HinhThucHoc IN (0,1,12,13,26,7,16,5,15,10,27,28,29,23,32)) 
                                Update tbl_CQ_NhomLopHocPhan Set SoTietLTQD=0,SoTietBTQD=0, SoTietTHQD = 0 WHERE MaNhomLopHP in (SELECT INSERTED.MaNhomLopHP FROM INSERTED);
                        END
                END
        END
END