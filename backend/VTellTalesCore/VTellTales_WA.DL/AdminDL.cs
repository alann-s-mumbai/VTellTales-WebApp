using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System;
using System.Collections.Generic;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;

namespace VTellTales_WA.DL
{
    public class AdminDL : IAdminDL
    {
        private readonly IConfiguration configuration;
        readonly string connString;

        public AdminDL(IConfiguration _configuration)
        {
            configuration = _configuration;
            connString = configuration["ConnectionSettings:StoryBookDB"] ?? throw new InvalidOperationException("ConnectionSettings:StoryBookDB is not configured");
        }

        public int GetAdminCount()
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = "SELECT COUNT(*) FROM admin_users";
                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        public int CreateAdmin(AdminUserDTO admin, string password)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"INSERT INTO admin_users 
                    (email, password, first_name, last_name, role, is_active, created_by, created_date)
                    VALUES (@email, @password, @firstName, @lastName, @role, @isActive, @createdBy, @createdDate);
                    SELECT LAST_INSERT_ID();";

                cmd.Parameters.AddWithValue("@email", admin.Email);
                cmd.Parameters.AddWithValue("@password", password); // Should be hashed
                cmd.Parameters.AddWithValue("@firstName", admin.FirstName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@lastName", admin.LastName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@role", admin.Role);
                cmd.Parameters.AddWithValue("@isActive", admin.IsActive);
                cmd.Parameters.AddWithValue("@createdBy", admin.CreatedBy ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@createdDate", admin.CreatedDate);

                return Convert.ToInt32(cmd.ExecuteScalar());
            }
        }

        public AdminUserDTO ValidateAdminCredentials(string email, string password)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT id, email, first_name, last_name, role, is_active, last_login, created_by, created_date, updated_date
                    FROM admin_users 
                    WHERE email = @email AND password = @password";

                cmd.Parameters.AddWithValue("@email", email);
                cmd.Parameters.AddWithValue("@password", password); // Should compare hashed

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new AdminUserDTO
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            FirstName = reader.IsDBNull(2) ? null : reader.GetString(2),
                            LastName = reader.IsDBNull(3) ? null : reader.GetString(3),
                            Role = reader.GetString(4),
                            IsActive = reader.GetBoolean(5),
                            LastLogin = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
                            CreatedBy = reader.IsDBNull(7) ? null : reader.GetInt32(7),
                            CreatedDate = reader.GetDateTime(8),
                            UpdatedDate = reader.IsDBNull(9) ? null : reader.GetDateTime(9)
                        };
                    }
                }
            }
            return null;
        }

        public bool AdminEmailExists(string email)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = "SELECT COUNT(*) FROM admin_users WHERE email = @email";
                cmd.Parameters.AddWithValue("@email", email);
                
                return Convert.ToInt32(cmd.ExecuteScalar()) > 0;
            }
        }

        public void UpdateLastLogin(int adminId)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = "UPDATE admin_users SET last_login = @now WHERE id = @id";
                cmd.Parameters.AddWithValue("@now", DateTime.UtcNow);
                cmd.Parameters.AddWithValue("@id", adminId);
                cmd.ExecuteNonQuery();
            }
        }

        public List<AdminUserDTO> GetAllAdmins()
        {
            var admins = new List<AdminUserDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT id, email, first_name, last_name, role, is_active, last_login, created_by, created_date, updated_date
                    FROM admin_users 
                    ORDER BY created_date DESC";

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        admins.Add(new AdminUserDTO
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            FirstName = reader.IsDBNull(2) ? null : reader.GetString(2),
                            LastName = reader.IsDBNull(3) ? null : reader.GetString(3),
                            Role = reader.GetString(4),
                            IsActive = reader.GetBoolean(5),
                            LastLogin = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
                            CreatedBy = reader.IsDBNull(7) ? null : reader.GetInt32(7),
                            CreatedDate = reader.GetDateTime(8),
                            UpdatedDate = reader.IsDBNull(9) ? null : reader.GetDateTime(9)
                        });
                    }
                }
            }

            return admins;
        }

        public AdminUserDTO GetAdminById(int adminId)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"SELECT id, email, first_name, last_name, role, is_active, last_login, created_by, created_date, updated_date
                    FROM admin_users 
                    WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", adminId);

                using (var reader = cmd.ExecuteReader())
                {
                    if (reader.Read())
                    {
                        return new AdminUserDTO
                        {
                            Id = reader.GetInt32(0),
                            Email = reader.GetString(1),
                            FirstName = reader.IsDBNull(2) ? null : reader.GetString(2),
                            LastName = reader.IsDBNull(3) ? null : reader.GetString(3),
                            Role = reader.GetString(4),
                            IsActive = reader.GetBoolean(5),
                            LastLogin = reader.IsDBNull(6) ? null : reader.GetDateTime(6),
                            CreatedBy = reader.IsDBNull(7) ? null : reader.GetInt32(7),
                            CreatedDate = reader.GetDateTime(8),
                            UpdatedDate = reader.IsDBNull(9) ? null : reader.GetDateTime(9)
                        };
                    }
                }
            }
            return null;
        }

        public bool UpdateAdmin(UpdateAdminDTO admin)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"UPDATE admin_users 
                    SET first_name = COALESCE(@firstName, first_name),
                        last_name = COALESCE(@lastName, last_name),
                        role = COALESCE(@role, role),
                        is_active = COALESCE(@isActive, is_active)
                    WHERE id = @id";

                cmd.Parameters.AddWithValue("@id", admin.Id);
                cmd.Parameters.AddWithValue("@firstName", admin.FirstName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@lastName", admin.LastName ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@role", admin.Role ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@isActive", admin.IsActive ?? (object)DBNull.Value);

                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public bool DeleteAdmin(int adminId)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = "DELETE FROM admin_users WHERE id = @id";
                cmd.Parameters.AddWithValue("@id", adminId);
                
                return cmd.ExecuteNonQuery() > 0;
            }
        }

        public void LogActivity(int adminId, string action, string entityType, string entityId, string details, string ipAddress)
        {
            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                cmd.CommandText = @"INSERT INTO admin_activity_log 
                    (admin_id, action, entity_type, entity_id, details, ip_address)
                    VALUES (@adminId, @action, @entityType, @entityId, @details, @ipAddress)";

                cmd.Parameters.AddWithValue("@adminId", adminId);
                cmd.Parameters.AddWithValue("@action", action);
                cmd.Parameters.AddWithValue("@entityType", entityType ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@entityId", entityId ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@details", details ?? (object)DBNull.Value);
                cmd.Parameters.AddWithValue("@ipAddress", ipAddress ?? (object)DBNull.Value);

                cmd.ExecuteNonQuery();
            }
        }

        public List<AdminActivityLogDTO> GetActivityLogs(int? adminId, int limit)
        {
            var logs = new List<AdminActivityLogDTO>();

            using (MySqlDatabase db = new MySqlDatabase(connString))
            {
                var cmd = db.Connection.CreateCommand() as MySqlCommand;
                
                if (adminId.HasValue)
                {
                    cmd.CommandText = @"SELECT l.id, l.admin_id, a.email, l.action, l.entity_type, l.entity_id, l.details, l.ip_address, l.created_date
                        FROM admin_activity_log l
                        JOIN admin_users a ON l.admin_id = a.id
                        WHERE l.admin_id = @adminId
                        ORDER BY l.created_date DESC
                        LIMIT @limit";
                    cmd.Parameters.AddWithValue("@adminId", adminId.Value);
                }
                else
                {
                    cmd.CommandText = @"SELECT l.id, l.admin_id, a.email, l.action, l.entity_type, l.entity_id, l.details, l.ip_address, l.created_date
                        FROM admin_activity_log l
                        JOIN admin_users a ON l.admin_id = a.id
                        ORDER BY l.created_date DESC
                        LIMIT @limit";
                }
                
                cmd.Parameters.AddWithValue("@limit", limit);

                using (var reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        logs.Add(new AdminActivityLogDTO
                        {
                            Id = reader.GetInt32(0),
                            AdminId = reader.GetInt32(1),
                            AdminEmail = reader.GetString(2),
                            Action = reader.GetString(3),
                            EntityType = reader.IsDBNull(4) ? null : reader.GetString(4),
                            EntityId = reader.IsDBNull(5) ? null : reader.GetString(5),
                            Details = reader.IsDBNull(6) ? null : reader.GetString(6),
                            IpAddress = reader.IsDBNull(7) ? null : reader.GetString(7),
                            CreatedDate = reader.GetDateTime(8)
                        });
                    }
                }
            }

            return logs;
        }
    }
}
