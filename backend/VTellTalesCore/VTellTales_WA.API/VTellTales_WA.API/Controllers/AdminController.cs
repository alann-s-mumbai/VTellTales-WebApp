using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VTellTales_WA.BL;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;

namespace VTellTales_WA.API.Controllers
{
    [ApiController]
    [Route("api/admin")]
    public class AdminController : ControllerBase
    {
        private readonly IConfiguration configuration;
        private readonly ILogger<AdminController> _logger;

        public AdminController(IConfiguration _configuration, ILogger<AdminController> logger)
        {
            configuration = _configuration;
            _logger = logger;
        }

        // Check if admin setup is required
        [HttpGet("requires-setup")]
        public JsonResult RequiresSetup()
        {
            try
            {
                var adminBL = new AdminBL(configuration);
                var requiresSetup = adminBL.RequiresSetup();
                
                return new JsonResult(new { RequiresSetup = requiresSetup });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking setup status");
                return new JsonResult(new { RequiresSetup = false, Error = "An error occurred" });
            }
        }

        // Setup first super admin
        [HttpPost("setup")]
        public JsonResult Setup([FromBody] AdminSetupDTO setupData)
        {
            try
            {
                var adminBL = new AdminBL(configuration);
                var result = adminBL.SetupSuperAdmin(setupData);

                if (result.Success && result.Admin != null)
                {
                    // Store admin session
                    HttpContext.Session.SetInt32("AdminId", result.Admin.Id);
                    HttpContext.Session.SetString("AdminEmail", result.Admin.Email);
                    HttpContext.Session.SetString("AdminRole", result.Admin.Role);
                }

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during admin setup");
                return new JsonResult(new AdminLoginResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during setup."
                });
            }
        }

        // Admin login
        [HttpPost("login")]
        public JsonResult Login([FromBody] AdminLoginRequestDTO loginData)
        {
            try
            {
                var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
                var adminBL = new AdminBL(configuration);
                var result = adminBL.LoginAdmin(loginData, ipAddress);

                if (result.Success && result.Admin != null)
                {
                    // Store admin session
                    HttpContext.Session.SetInt32("AdminId", result.Admin.Id);
                    HttpContext.Session.SetString("AdminEmail", result.Admin.Email);
                    HttpContext.Session.SetString("AdminRole", result.Admin.Role);
                }

                return new JsonResult(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during admin login");
                return new JsonResult(new AdminLoginResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during login."
                });
            }
        }

        // Admin logout
        [HttpPost("logout")]
        public JsonResult Logout()
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                if (adminId.HasValue)
                {
                    var adminBL = new AdminBL(configuration);
                    adminBL.LogActivity(adminId.Value, "logout", "admin", adminId.Value.ToString(), "Admin logged out");
                }

                HttpContext.Session.Clear();
                return new JsonResult(new { Success = true, Message = "Logged out successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during admin logout");
                return new JsonResult(new { Success = false, Message = "An error occurred during logout." });
            }
        }

        // Get current admin session
        [HttpGet("current")]
        public JsonResult GetCurrentAdmin()
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                if (!adminId.HasValue)
                {
                    return new JsonResult(new { Success = false, Message = "Not authenticated" });
                }

                var adminBL = new AdminBL(configuration);
                var admins = adminBL.GetAllAdmins();
                var currentAdmin = admins.Find(a => a.Id == adminId.Value);

                if (currentAdmin == null)
                {
                    HttpContext.Session.Clear();
                    return new JsonResult(new { Success = false, Message = "Admin not found" });
                }

                return new JsonResult(new AdminLoginResponseDTO
                {
                    Success = true,
                    Admin = currentAdmin
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting current admin");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }

        // Create new admin (Super Admin only)
        [HttpPost("create")]
        public JsonResult CreateAdmin([FromBody] CreateAdminDTO createData)
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                var adminRole = HttpContext.Session.GetString("AdminRole");

                if (!adminId.HasValue || adminRole != "super_admin")
                {
                    return new JsonResult(new { Success = false, Message = "Unauthorized. Super Admin access required." });
                }

                var adminBL = new AdminBL(configuration);
                var result = adminBL.CreateAdmin(createData, adminId.Value);

                return new JsonResult(new { Success = result, Message = result ? "Admin created successfully" : "Failed to create admin" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating admin");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }

        // Get all admins
        [HttpGet("list")]
        public JsonResult GetAllAdmins()
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                if (!adminId.HasValue)
                {
                    return new JsonResult(new { Success = false, Message = "Not authenticated" });
                }

                var adminBL = new AdminBL(configuration);
                var admins = adminBL.GetAllAdmins();

                return new JsonResult(new { Success = true, Admins = admins });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting admins");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }

        // Update admin
        [HttpPut("update")]
        public JsonResult UpdateAdmin([FromBody] UpdateAdminDTO updateData)
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                var adminRole = HttpContext.Session.GetString("AdminRole");

                if (!adminId.HasValue || adminRole != "super_admin")
                {
                    return new JsonResult(new { Success = false, Message = "Unauthorized. Super Admin access required." });
                }

                var adminBL = new AdminBL(configuration);
                var result = adminBL.UpdateAdmin(updateData, adminId.Value);

                return new JsonResult(new { Success = result, Message = result ? "Admin updated successfully" : "Failed to update admin" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating admin");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }

        // Delete admin
        [HttpDelete("delete/{id}")]
        public JsonResult DeleteAdmin(int id)
        {
            try
            {
                var adminId = HttpContext.Session.GetInt32("AdminId");
                var adminRole = HttpContext.Session.GetString("AdminRole");

                if (!adminId.HasValue || adminRole != "super_admin")
                {
                    return new JsonResult(new { Success = false, Message = "Unauthorized. Super Admin access required." });
                }

                var adminBL = new AdminBL(configuration);
                var result = adminBL.DeleteAdmin(id, adminId.Value);

                return new JsonResult(new { Success = result, Message = result ? "Admin deleted successfully" : "Failed to delete admin" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting admin");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }

        // Get activity logs
        [HttpGet("activity-logs")]
        public JsonResult GetActivityLogs([FromQuery] int? adminId = null, [FromQuery] int limit = 100)
        {
            try
            {
                var currentAdminId = HttpContext.Session.GetInt32("AdminId");
                if (!currentAdminId.HasValue)
                {
                    return new JsonResult(new { Success = false, Message = "Not authenticated" });
                }

                var adminBL = new AdminBL(configuration);
                var logs = adminBL.GetActivityLogs(adminId, limit);

                return new JsonResult(new { Success = true, Logs = logs });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting activity logs");
                return new JsonResult(new { Success = false, Message = "An error occurred" });
            }
        }
    }
}
