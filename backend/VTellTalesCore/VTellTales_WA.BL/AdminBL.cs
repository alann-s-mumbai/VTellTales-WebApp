using Microsoft.Extensions.Configuration;
using VTellTales_WA.DL;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;

namespace VTellTales_WA.BL
{
    public class AdminBL
    {
        private readonly IConfiguration configuration;

        public AdminBL(IConfiguration _configuration)
        {
            configuration = _configuration;
        }

        // Check if setup is required (no admins exist)
        public bool RequiresSetup()
        {
            IAdminDL adminDL = new AdminDL(configuration);
            return adminDL.GetAdminCount() == 0;
        }

        // Setup first super admin
        public AdminLoginResponseDTO SetupSuperAdmin(AdminSetupDTO setupData)
        {
            try
            {
                IAdminDL adminDL = new AdminDL(configuration);

                // Verify no admins exist
                if (adminDL.GetAdminCount() > 0)
                {
                    return new AdminLoginResponseDTO
                    {
                        Success = false,
                        Message = "Setup has already been completed."
                    };
                }

                var admin = new AdminUserDTO
                {
                    Email = setupData.Email,
                    FirstName = setupData.FirstName,
                    LastName = setupData.LastName,
                    Role = "super_admin",
                    IsActive = true,
                    CreatedDate = DateTime.UtcNow
                };

                var adminId = adminDL.CreateAdmin(admin, setupData.Password);

                if (adminId > 0)
                {
                    admin.Id = adminId;
                    return new AdminLoginResponseDTO
                    {
                        Success = true,
                        Admin = admin,
                        Message = "Super admin created successfully!"
                    };
                }

                return new AdminLoginResponseDTO
                {
                    Success = false,
                    Message = "Failed to create admin account."
                };
            }
            catch (Exception ex)
            {
                return new AdminLoginResponseDTO
                {
                    Success = false,
                    Message = $"Error during setup: {ex.Message}"
                };
            }
        }

        // Admin login
        public AdminLoginResponseDTO LoginAdmin(AdminLoginRequestDTO request, string ipAddress = null)
        {
            try
            {
                // Check if setup is required
                if (RequiresSetup())
                {
                    return new AdminLoginResponseDTO
                    {
                        Success = false,
                        RequiresSetup = true,
                        Message = "Admin setup required."
                    };
                }

                IAdminDL adminDL = new AdminDL(configuration);
                var admin = adminDL.ValidateAdminCredentials(request.Email, request.Password);

                if (admin == null)
                {
                    // Log failed attempt
                    LogActivity(0, "login_failed", "admin", request.Email, $"Failed login attempt from {ipAddress}", ipAddress);
                    
                    return new AdminLoginResponseDTO
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                if (!admin.IsActive)
                {
                    return new AdminLoginResponseDTO
                    {
                        Success = false,
                        Message = "Your account has been deactivated."
                    };
                }

                // Update last login
                adminDL.UpdateLastLogin(admin.Id);

                // Log successful login
                LogActivity(admin.Id, "login", "admin", admin.Email, "Admin logged in", ipAddress);

                return new AdminLoginResponseDTO
                {
                    Success = true,
                    Admin = admin,
                    Message = "Login successful."
                };
            }
            catch (Exception ex)
            {
                return new AdminLoginResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during login."
                };
            }
        }

        // Create new admin (by existing super admin)
        public bool CreateAdmin(CreateAdminDTO request, int createdBy)
        {
            try
            {
                IAdminDL adminDL = new AdminDL(configuration);

                // Check if email already exists
                if (adminDL.AdminEmailExists(request.Email))
                {
                    return false;
                }

                var admin = new AdminUserDTO
                {
                    Email = request.Email,
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Role = request.Role,
                    IsActive = true,
                    CreatedBy = createdBy,
                    CreatedDate = DateTime.UtcNow
                };

                var adminId = adminDL.CreateAdmin(admin, request.Password);

                if (adminId > 0)
                {
                    LogActivity(createdBy, "create_admin", "admin", adminId.ToString(), $"Created admin: {request.Email}");
                    return true;
                }

                return false;
            }
            catch
            {
                return false;
            }
        }

        // Get all admins
        public List<AdminUserDTO> GetAllAdmins()
        {
            IAdminDL adminDL = new AdminDL(configuration);
            return adminDL.GetAllAdmins();
        }

        // Update admin
        public bool UpdateAdmin(UpdateAdminDTO request, int updatedBy)
        {
            try
            {
                IAdminDL adminDL = new AdminDL(configuration);
                var result = adminDL.UpdateAdmin(request);

                if (result)
                {
                    LogActivity(updatedBy, "update_admin", "admin", request.Id.ToString(), "Updated admin details");
                }

                return result;
            }
            catch
            {
                return false;
            }
        }

        // Delete admin
        public bool DeleteAdmin(int adminId, int deletedBy)
        {
            try
            {
                // Prevent deleting yourself
                if (adminId == deletedBy)
                {
                    return false;
                }

                IAdminDL adminDL = new AdminDL(configuration);
                var result = adminDL.DeleteAdmin(adminId);

                if (result)
                {
                    LogActivity(deletedBy, "delete_admin", "admin", adminId.ToString(), "Deleted admin");
                }

                return result;
            }
            catch
            {
                return false;
            }
        }

        // Activity logging
        public void LogActivity(int adminId, string action, string entityType = null, string entityId = null, string details = null, string ipAddress = null)
        {
            try
            {
                IAdminDL adminDL = new AdminDL(configuration);
                adminDL.LogActivity(adminId, action, entityType, entityId, details, ipAddress);
            }
            catch
            {
                // Silent fail on logging
            }
        }

        // Get activity logs
        public List<AdminActivityLogDTO> GetActivityLogs(int? adminId = null, int limit = 100)
        {
            IAdminDL adminDL = new AdminDL(configuration);
            return adminDL.GetActivityLogs(adminId, limit);
        }
    }
}
