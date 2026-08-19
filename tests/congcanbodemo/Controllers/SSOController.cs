using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;

namespace CongCanBoDemo.Controllers
{
    public class SSOController : Controller
    {
        // Chìa khóa bảo mật dùng chung với Python (Tuyệt đối giữ bí mật trên Server C#)
        // Key này copy nguyên xi từ file .env của hệ thống Quản lý Giờ Dạy
        private readonly string SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7";

        [HttpGet]
        [Route("trigger-sso")]
        public IActionResult TriggerSSO()
        {
            // 1. Lấy hs_id của user hiện tại đang đăng nhập ở Cổng Cán Bộ (Trong thực tế bạn lấy từ Session/Database)
            // Ở đây tôi fix cứng hs_id = "1678" để demo
            string hsId = "1678";

            // 2. Cấu hình khóa bảo mật JWT
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(SECRET_KEY);

            // 3. Đóng gói Payload (Vé trung chuyển sống đúng 1 phút)
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    // Trường "sub" (Subject) sẽ chứa hs_id để khớp với code giải mã bên Python
                    new Claim(JwtRegisteredClaimNames.Sub, hsId) 
                }),
                // Hạn sử dụng (exp) là 1 phút kể từ thời điểm tạo
                Expires = DateTime.UtcNow.AddMinutes(1),
                
                // Thuật toán HS256
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key), 
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            // 4. Ký (Sign) và chuyển JWT thành chuỗi
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var transferToken = tokenHandler.WriteToken(token);

            // 5. Lệnh Redirect (302) bế user ném sang trang chủ Frontend của Quản Lý Giờ Dạy
            string redirectUrl = $"https://quanlygioday.covit.site/?transfer_token={transferToken}";
            return Redirect(redirectUrl);
        }
    }
}
