using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace VTellTales_WA.DTO
{
    public class AdminLoginDTO
    {
        public int admin_id;
        public string admin_email;
        public string admin_password;
        public string new_password;
        public string adminuname;
        public string admin_role;
        public int is_active;
        public DateTime cdate;
        public DateTime udate;
        public AdminLoginDTO()
        {
            admin_email = string.Empty;
            admin_password = string.Empty;
            new_password = string.Empty;
            adminuname = string.Empty;
            admin_role = string.Empty;
        }
    }
    public class AdminDashboardCard
    {
        public Int64 totalusers;
        public Int64 totalstories;
        public Int64 newusers;
        public Int64 newstories;
    }
    public class AdminAllStories
    {
        public string userid { get; set; }
        public string email { get; set; }
        public string name { get; set; }
        public int storyid { get; set; }
        public string storytitle { get; set; }
        public string storydesc { get; set; }
        public string storyimg { get; set; }
        public Int64 storylike { get; set; }
        public Int64 storyview { get; set; }
        public Int64 storycomment { get; set; }
        public int storystatus { get; set; }
        public Int64 storypages { get; set; }
        public string storytype { get; set; }
        public DateTime createdate { get; set; }
        public int reportblockc { get; set; }
        public AdminAllStories()
        {
            userid = string.Empty;
            email = string.Empty;
            name = string.Empty;
            storytitle = string.Empty;
            storydesc = string.Empty;
            storyimg = string.Empty;
            storytype = string.Empty;
        }
    }

    public class AdminStoryCommentDTO
    {
        public int srno { get; set; }
        public int storyid { get; set; }
        public string comdate { get; set; }
        public string comment { get; set; }
        public string userid { get; set; }
        public string uname { get; set; }
        public string pimg { get; set; }

        public AdminStoryCommentDTO()
        {
            comdate = string.Empty;
            comment = string.Empty;
            userid = string.Empty;
            uname = string.Empty;
            pimg = string.Empty;
        }

    }

    public class AdminNotificationAllDTO
    {
        public string nmessage { get; set; }
        public AdminNotificationAllDTO()
        {
            nmessage = string.Empty;
        }
    }

    public class AdminGalleryDTO
    {
        public int gallery_id { get; set; }
        public string filepath { get; set; }
    public IFormFile? file { get; set; }
        public string filetype { get; set; }
        public string size { get; set; }
        public string tags { get; set; }
        public DateTime cdate { get; set; }
        public DateTime udate { get; set; }
        public AdminGalleryDTO()
        {
            filepath = string.Empty;
            filetype = string.Empty;
            size = string.Empty;
            tags = string.Empty;
            file = null;
        }
    }

    // New Admin System DTOs
    public class AdminUserDTO
    {
        public int Id { get; set; }
        public string Email { get; set; } = string.Empty;
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string Role { get; set; } = "support";
        public bool IsActive { get; set; } = true;
        public DateTime? LastLogin { get; set; }
        public int? CreatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class AdminLoginRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }

    public class AdminLoginResponseDTO
    {
        public bool Success { get; set; }
        public AdminUserDTO? Admin { get; set; }
        public string? Message { get; set; }
        public bool RequiresSetup { get; set; }
    }

    public class AdminSetupDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2)]
        public string LastName { get; set; } = string.Empty;
    }

    public class CreateAdminDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        public string Role { get; set; } = "support";
    }

    public class UpdateAdminDTO
    {
        [Required]
        public int Id { get; set; }
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Role { get; set; }
        public bool? IsActive { get; set; }
    }

    public class SystemSettingDTO
    {
        public int Id { get; set; }
        public string SettingKey { get; set; } = string.Empty;
        public string? SettingValue { get; set; }
        public bool IsEncrypted { get; set; }
        public string Category { get; set; } = "general";
        public string? Description { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class SmtpSettingsDTO
    {
        [Required]
        public string Host { get; set; } = string.Empty;
        
        [Required]
        public int Port { get; set; } = 587;
        
        public string? Username { get; set; }
        public string? Password { get; set; }
        
        [Required]
        [EmailAddress]
        public string FromEmail { get; set; } = string.Empty;
        
        [Required]
        public string FromName { get; set; } = string.Empty;
        
        public bool UseSsl { get; set; } = true;
    }

    public class EmailTemplateDTO
    {
        public int Id { get; set; }
        public string TemplateKey { get; set; } = string.Empty;
        public string TemplateName { get; set; } = string.Empty;
        public string? Subject { get; set; }
        public string? BodyHtml { get; set; }
        public string? BodyText { get; set; }
        public string? Variables { get; set; }
        public bool IsActive { get; set; } = true;
        public int? UpdatedBy { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }

    public class UpdateEmailTemplateDTO
    {
        [Required]
        public int Id { get; set; }
        
        public string? TemplateName { get; set; }
        public string? Subject { get; set; }
        public string? BodyHtml { get; set; }
        public string? BodyText { get; set; }
        public bool? IsActive { get; set; }
    }

    public class AdminActivityLogDTO
    {
        public int Id { get; set; }
        public int AdminId { get; set; }
        public string AdminEmail { get; set; } = string.Empty;
        public string Action { get; set; } = string.Empty;
        public string? EntityType { get; set; }
        public string? EntityId { get; set; }
        public string? Details { get; set; }
        public string? IpAddress { get; set; }
        public DateTime CreatedDate { get; set; }
    }

    public class AdminUserListDTO
    {
        public string UserId { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string UserType { get; set; } = "regular";
        public bool IsEmailVerified { get; set; }
        public bool IsProfileComplete { get; set; }
        public bool IsBlocked { get; set; }
        public DateTime CreatedDate { get; set; }
        public DateTime? LastLogin { get; set; }
    }

    public class BlockUserDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public string? Reason { get; set; }
    }

    public class DashboardStatsDTO
    {
        public int TotalUsers { get; set; }
        public int TotalStories { get; set; }
        public int TotalEducators { get; set; }
        public int UnverifiedUsers { get; set; }
        public int BlockedUsers { get; set; }
        public int TodayRegistrations { get; set; }
        public int TodayStories { get; set; }
        public int ActiveUsers { get; set; }
    }

    public class RegistrationTrendDTO
    {
        public string Date { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
