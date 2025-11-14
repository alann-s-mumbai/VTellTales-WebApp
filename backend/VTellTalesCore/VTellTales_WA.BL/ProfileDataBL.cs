using Microsoft.Extensions.Configuration;
using VTellTales_WA.BL.Interfaces;
using VTellTales_WA.DL;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web;
using System.Security.Cryptography;
using System.Text;

namespace VTellTales_WA.BL
{
    public class ProfileDataBL : IProfileDataBL
    {
        private readonly IConfiguration configuration;

        public ProfileDataBL(IConfiguration _configuration)
        {
            configuration = _configuration;
        }

        // Enhanced Profile Methods
        public bool CheckUsernameAvailability(string username)
        {
            if (string.IsNullOrWhiteSpace(username))
                return false;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.IsUsernameAvailable(username);
        }

        public bool CompleteProfile(UpdateProfileDTO profileData)
        {
            if (profileData == null || string.IsNullOrWhiteSpace(profileData.UserId))
                return false;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            
            // Update main profile
            var result = profileDataDL.UpdateProfile(profileData);
            
            // If educator, save educator details from embedded fields
            if (result && profileData.UserType == "educator")
            {
                var educatorDetails = new EducatorDetailsDTO
                {
                    SchoolName = profileData.SchoolName,
                    SchoolAddress = profileData.SchoolAddress,
                    SchoolPhone = profileData.SchoolPhone,
                    TeachingSubjects = profileData.TeachingSubjects,
                    YearsOfExperience = profileData.YearsOfExperience
                };
                profileDataDL.SaveEducatorDetails(profileData.UserId, educatorDetails);
            }

            return result;
        }

        public string GenerateEmailVerificationToken(string userId)
        {
            if (string.IsNullOrWhiteSpace(userId))
                return null;

            // Generate secure random token
            var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-")
                .Replace("/", "_")
                .Replace("=", "");

            var expiresAt = DateTime.UtcNow.AddHours(24);

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            var saved = profileDataDL.SaveEmailVerificationToken(userId, token, expiresAt);

            return saved ? token : null;
        }

        public bool VerifyEmail(string token, string ipAddress = null, string userAgent = null)
        {
            if (string.IsNullOrWhiteSpace(token))
                return false;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            
            // Validate token and get user
            var userId = profileDataDL.GetUserIdByVerificationToken(token);
            if (string.IsNullOrWhiteSpace(userId))
                return false;

            // Mark email as verified
            var verified = profileDataDL.MarkEmailAsVerified(userId);
            
            // Log verification
            if (verified)
            {
                profileDataDL.LogEmailVerification(userId, token, ipAddress, userAgent);
            }

            return verified;
        }

        public bool ResendVerificationEmail(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
                return false;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            
            // Get user by email
            var userId = profileDataDL.GetUserIdByEmail(email);
            if (string.IsNullOrWhiteSpace(userId))
                return false;

            // Generate new token
            var token = GenerateEmailVerificationToken(userId);
            if (string.IsNullOrWhiteSpace(token))
                return false;

            // TODO: Send email via EmailService
            // EmailService.SendVerificationEmail(email, token);

            return true;
        }

        public bool ChangePassword(string userId, string currentPassword, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(userId) || 
                string.IsNullOrWhiteSpace(currentPassword) || 
                string.IsNullOrWhiteSpace(newPassword))
                return false;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            
            // Verify current password
            var isValid = profileDataDL.ValidatePassword(userId, currentPassword);
            if (!isValid)
                return false;

            // Update to new password
            return profileDataDL.UpdatePassword(userId, newPassword);
        }

        // Existing methods...
        public ProfileDataDTO? getToken(string userID)
        {
            if (userID == null)
                return null;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.getTokan(userID);
        }
        public ProfileDataDTO? GetOtherProfile(string userID, string followingid)
        {
            if (userID == null)
                return null;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetOtherProfile(userID, followingid);
        }
        public ProfileDataDTO? GetProfile(string userID)
        {
            if (userID == null)
                return null;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetProfile(userID);
        }

        public PushNotificationDTO? GetSingleProfileName(string userID)
        {
            if (userID == null)
                return null;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetSingleProfileName(userID);
        }
        public PushNotificationDTO? GetProfileName(string sendto, string userID)
        {
            if (userID == null)
                return null;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetProfileName(sendto, userID);
        }

        public List<PushNotificationDTO> GetNotificationuserlist(string userID)
        {
            if (userID == null)
                return new List<PushNotificationDTO>();

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetNotificationuserlist(userID);
        }

        public int checkuser(string email)
        {
            if (email == null)
                return 0;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.checkuser(email);
        }
        public List<ProfileDataDTO> GetProfilelist(string userID)
        {
            if (userID == null)
                return new List<ProfileDataDTO>();

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.GetProfilelist(userID);
        }

        public int SaveProfile(ProfileDataDTO profileDataDTO)
        {
            if (profileDataDTO == null)
                return 0;
            if (string.IsNullOrEmpty(profileDataDTO.userid))
                return 0;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.SaveProfile(profileDataDTO);
        }

        public int UpdateProfile(ProfileDataDTO profileDataDTO)
        {
            if (profileDataDTO == null)
                return 0;
            if (profileDataDTO.userid == null)
                return 0;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.UpdateProfile(profileDataDTO);
        }

        public string updateToken(string userid, string token)
        {
            if (userid == null || token == null)
                return string.Empty;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.updateToken(userid, token);
        }

        public int UnFollowing(ProfileFollowingDTO profileUnFollowerDTO)
        {
            if (profileUnFollowerDTO == null)
                return 0;
            if (string.IsNullOrEmpty(profileUnFollowerDTO.userid))
                return 0;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.UnFollowing(profileUnFollowerDTO);
        }

        public int SaveFollowing(ProfileFollowingDTO profileFollowingDTO)
        {
            if (profileFollowingDTO == null)
                return 0;
            if (string.IsNullOrEmpty(profileFollowingDTO.userid))
                return 0;

            IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
            return profileDataDL.SaveFollowing(profileFollowingDTO);
        }

        public List<NotificationDTO> Getallnotifications(string userid)
        {
            if (userid == null)
                return new List<NotificationDTO>();

            IProfileDataDL profiledataDL = new ProfileDataDL(configuration);
            return profiledataDL.Getallnotifications(userid);
        }

        public int unreadnotifications(string userid)
        {
            if (userid == null)
                return 0;

            IProfileDataDL profiledataDL = new ProfileDataDL(configuration);
            return profiledataDL.unreadnotifications(userid);
        }

        //Admin Panel
        public List<ProfileDataDTO> Getallusers()
        {
            IAdminWeb profileDataDL = new AdminWeb(configuration);
            var profileDataDTO = profileDataDL.Getallusers();
            return profileDataDTO ?? new List<ProfileDataDTO>();
        }

        public List<ProfileADataDTO> GetallusersTest()
        {
            IAdminWeb profileDataDL = new AdminWeb(configuration);
            var profileDataDTO = profileDataDL.GetallusersTest();
            return profileDataDTO ?? new List<ProfileADataDTO>();
        }
        public AdminDashboardCard GetAdminDashboardCard()
        {
            AdminDashboardCard adminDashboardCard = new AdminDashboardCard();
            IAdminWeb profileDataDL = new AdminWeb(configuration);
            adminDashboardCard = profileDataDL.GetAdminDashboardCard();
            return adminDashboardCard;
        }
        public List<AdminAllStories> GetAdminAllStories()
        {
            List<AdminAllStories> adminAllStories = new List<AdminAllStories>();
            IAdminWeb profileDataDL = new AdminWeb(configuration);
            adminAllStories = profileDataDL.GetAdminAllStories();
            return adminAllStories;
        }

        public AdminLoginDTO AdminGetprofile(int adminid)
        {
            if (adminid == 0)
                return new AdminLoginDTO();

            IAdminWeb profileDataDL = new AdminWeb(configuration);
            return profileDataDL.AdminGetprofile(adminid);
        }
        public AdminLoginDTO AdminGetlogin(AdminLoginDTO _AdminLoginDTO)
        {
            if (_AdminLoginDTO.admin_email == null || _AdminLoginDTO.admin_password == null)
                return new AdminLoginDTO();

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.AdminGetlogin(_AdminLoginDTO);

        }

        public int AdminChangePassword(AdminLoginDTO _AdminLoginDTO)
        {
            if (_AdminLoginDTO.admin_id == 0 || _AdminLoginDTO.new_password == null)
                return 0;

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.AdminChangePassword(_AdminLoginDTO);
        }
        public int AddAdminUserRole(AdminLoginDTO _AdminLoginDTO)
        {
            if (_AdminLoginDTO.admin_email == null || _AdminLoginDTO.admin_password == null)
                return 0;

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.AddAdminUserRole(_AdminLoginDTO);
        }

        public int updatestorystatusbyadmin(StoryDataDTO storyDataDTO)
        {
            if (storyDataDTO.storyid <= 0 || storyDataDTO.storystatus <= 0)
                return 0;

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.updatestorystatusbyadmin(storyDataDTO);
        }

        public List<AdminStoryCommentDTO> GetAdminStoryComments(int storyid)
        {
            if (storyid <= 0)
                return new List<AdminStoryCommentDTO>();

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.GetAdminStoryComments(storyid);
        }

        public int deletecommentbyadmin(int srno)
        {
            if (srno <= 0)
                return 0;

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.deletecommentbyadmin(srno);
        }
       public int deleteuserbyadmin(ProfileDataDTO _ProfileDataDTO)
        {
            if (_ProfileDataDTO.userid == null)
                return 0;

            IAdminWeb profiledataDL = new AdminWeb(configuration);
            return profiledataDL.deleteuserbyadmin(_ProfileDataDTO);
        }

        public bool VerifyAdminPassword(string admin_email, string admin_password)
        {
            if (string.IsNullOrEmpty(admin_email) || string.IsNullOrEmpty(admin_password))
                return false;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.VerifyAdminPassword(admin_email, admin_password);
        }

        public int PermanentDeleteUser(string userid, string admin_email, string admin_password)
        {
            if (string.IsNullOrEmpty(userid) || string.IsNullOrEmpty(admin_email) || string.IsNullOrEmpty(admin_password))
                return 0;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.PermanentDeleteUser(userid, admin_email, admin_password);
        }

        //Admin Gallery

        public int DeleteGalleryData(int gallery_id)
        {
            if (gallery_id <= 0)
                return 0;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.DeleteGalleryData(gallery_id);
        }
        public int UpdateGalleryData(AdminGalleryDTO adminGalleryDTO)
        {
            if (adminGalleryDTO == null)
                return 0;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.UpdateGalleryData(adminGalleryDTO);
        }
        public int AddGalleryData(AdminGalleryDTO adminGalleryDTO)
        {
            if (adminGalleryDTO == null)
                return 0;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.AddGalleryData(adminGalleryDTO);
        }
        public List<AdminGalleryDTO> GetallGalleryData(String imgtype)
        {
            List<AdminGalleryDTO> adminGalleryDTO = new List<AdminGalleryDTO>();

            IAdminWeb adminWeb = new AdminWeb(configuration);
            adminGalleryDTO = adminWeb.GetallGalleryData(imgtype);

            return adminGalleryDTO;
        }

        public List<AdminGalleryDTO> GetallGalleryDatabypage(string imgtype, string Offset, string Limit)
        {
            List<AdminGalleryDTO> adminGalleryDTO = new List<AdminGalleryDTO>();

            IAdminWeb adminWeb = new AdminWeb(configuration);
            adminGalleryDTO = adminWeb.GetallGalleryDatabypage(imgtype, Offset, Limit);

            return adminGalleryDTO;
        }

        // Password Reset Methods
        public AdminLoginDTO GetAdminByEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return null!;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.GetAdminByEmail(email);
        }

        public bool SavePasswordResetToken(string email, string resetToken, DateTime tokenExpiry)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(resetToken))
                return false;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.SavePasswordResetToken(email, resetToken, tokenExpiry);
        }

        public string ValidateResetToken(string resetToken)
        {
            if (string.IsNullOrEmpty(resetToken))
                return "";

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.ValidateResetToken(resetToken);
        }

        public bool UpdateAdminPassword(string email, string newPassword)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(newPassword))
                return false;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.UpdateAdminPassword(email, newPassword);
        }

        public bool ClearPasswordResetToken(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            IAdminWeb adminWeb = new AdminWeb(configuration);
            return adminWeb.ClearPasswordResetToken(email);
        }

        // User Authentication Implementation
        public AuthResponseDTO LoginUser(LoginRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password))
            {
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "Email and password are required."
                };
            }

            try
            {
                IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
                var user = profileDataDL.GetUserByEmail(request.Email);
                
                if (user == null)
                {
                    return new AuthResponseDTO
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                // Verify password (you should hash passwords in production)
                if (user.password != request.Password)
                {
                    return new AuthResponseDTO
                    {
                        Success = false,
                        Message = "Invalid email or password."
                    };
                }

                return new AuthResponseDTO
                {
                    Success = true,
                    User = new UserDTO
                    {
                        Id = user.userid,
                        Email = user.email,
                        Name = user.name,
                        ProfileImg = user.profileimg
                    },
                    Message = "Login successful."
                };
            }
            catch (Exception ex)
            {
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during login."
                };
            }
        }

        public AuthResponseDTO RegisterUser(RegisterRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Email) || string.IsNullOrEmpty(request.Password) || 
                string.IsNullOrEmpty(request.FirstName) || string.IsNullOrEmpty(request.LastName))
            {
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "Email, password, first name, and last name are required."
                };
            }

            try
            {
                IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
                
                // Check if user already exists
                if (profileDataDL.CheckUserExists(request.Email))
                {
                    return new AuthResponseDTO
                    {
                        Success = false,
                        Message = "An account with this email already exists."
                    };
                }

                var fullName = $"{request.FirstName} {request.LastName}";
                var newUser = new ProfileDataDTO
                {
                    userid = Guid.NewGuid().ToString(),
                    email = request.Email,
                    password = request.Password, // Hash this in production
                    name = fullName,
                    cdate = DateTime.Now,
                    udate = DateTime.Now
                };

                int result = profileDataDL.SaveProfile(newUser);
                
                if (result > 0)
                {
                    return new AuthResponseDTO
                    {
                        Success = true,
                        User = new UserDTO
                        {
                            Id = newUser.userid,
                            Email = newUser.email,
                            Name = fullName,
                            FirstName = request.FirstName,
                            LastName = request.LastName,
                            UserType = request.UserType,
                            IsEmailVerified = false,
                            IsProfileComplete = false
                        },
                        Message = "Registration successful."
                    };
                }
                else
                {
                    return new AuthResponseDTO
                    {
                        Success = false,
                        Message = "Registration failed. Please try again."
                    };
                }
            }
            catch (Exception ex)
            {
                return new AuthResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during registration."
                };
            }
        }

        public bool CheckUserExists(string email)
        {
            if (string.IsNullOrEmpty(email))
                return false;

            try
            {
                IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
                return profileDataDL.CheckUserExists(email);
            }
            catch
            {
                return false;
            }
        }

        public ProfileDataDTO? GetUserByEmail(string email)
        {
            if (string.IsNullOrEmpty(email))
                return null;

            try
            {
                IProfileDataDL profileDataDL = new ProfileDataDL(configuration);
                return profileDataDL.GetUserByEmail(email);
            }
            catch
            {
                return null;
            }
        }
    }
}
