using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System;
using System.Collections.Generic;
using VTellTales_WA.DTO;

namespace VTellTales_WA.DL.Interfaces
{
    public interface IAdminDL
    {
        int GetAdminCount();
        int CreateAdmin(AdminUserDTO admin, string password);
        AdminUserDTO ValidateAdminCredentials(string email, string password);
        bool AdminEmailExists(string email);
        void UpdateLastLogin(int adminId);
        List<AdminUserDTO> GetAllAdmins();
        AdminUserDTO GetAdminById(int adminId);
        bool UpdateAdmin(UpdateAdminDTO admin);
        bool DeleteAdmin(int adminId);
        void LogActivity(int adminId, string action, string entityType, string entityId, string details, string ipAddress);
        List<AdminActivityLogDTO> GetActivityLogs(int? adminId, int limit);
    }
}
