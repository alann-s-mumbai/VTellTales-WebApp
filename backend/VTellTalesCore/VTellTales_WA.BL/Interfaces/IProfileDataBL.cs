using System;
using VTellTales_WA.DTO;
using System.Collections.Generic;
using System.Text;

namespace VTellTales_WA.BL.Interfaces
{
    public interface IProfileDataBL    {

        int SaveProfile(ProfileDataDTO profileDataDTO);
        int UpdateProfile(ProfileDataDTO proflieDataDTO);
        string updateToken(string userid, string token);
    ProfileDataDTO? GetOtherProfile(string userID, string followingid);
    ProfileDataDTO? GetProfile(string userID);
    PushNotificationDTO? GetProfileName(string userID, string sendto);
        List<PushNotificationDTO> GetNotificationuserlist(string userID);
        int checkuser(string email);
    ProfileDataDTO? getToken(string userID);
        List<ProfileDataDTO> GetProfilelist(string userID);
        List<NotificationDTO> Getallnotifications(string userID);
        int unreadnotifications(string userID);
        int UnFollowing(ProfileFollowingDTO profileFollowerDTO);
        int SaveFollowing(ProfileFollowingDTO profileFollowingDTO);

        // User Authentication
        AuthResponseDTO LoginUser(LoginRequestDTO request);
        AuthResponseDTO RegisterUser(RegisterRequestDTO request);
        bool CheckUserExists(string email);
        ProfileDataDTO? GetUserByEmail(string email);

        //Admin
        List<ProfileDataDTO> Getallusers();
        List<ProfileADataDTO> GetallusersTest();
        AdminDashboardCard GetAdminDashboardCard();
        List<AdminAllStories> GetAdminAllStories();
        AdminLoginDTO AdminGetprofile(int adminid);
        AdminLoginDTO AdminGetlogin(AdminLoginDTO _AdminLoginDTO);
        int AdminChangePassword(AdminLoginDTO _AdminLoginDTO);
        int AddAdminUserRole(AdminLoginDTO adminLoginDTO);
        int updatestorystatusbyadmin(StoryDataDTO storyDataDTO);
        List<AdminStoryCommentDTO> GetAdminStoryComments(int storyID);
        int deletecommentbyadmin(int srno);
        int deleteuserbyadmin(ProfileDataDTO _ProfileDataDTO);
        bool VerifyAdminPassword(string admin_email, string admin_password);
        int PermanentDeleteUser(string userid, string admin_email, string admin_password);

        // Password Reset Methods
        AdminLoginDTO GetAdminByEmail(string email);
        bool SavePasswordResetToken(string email, string resetToken, DateTime tokenExpiry);
        string ValidateResetToken(string resetToken);
        bool UpdateAdminPassword(string email, string newPassword);
        bool ClearPasswordResetToken(string email);

        //Admin Gallery

        int DeleteGalleryData(int gallery_id);
        int UpdateGalleryData(AdminGalleryDTO adminGalleryDTO);
        int AddGalleryData(AdminGalleryDTO adminGalleryDTO);
        List<AdminGalleryDTO> GetallGalleryData(string imgtype);
        List<AdminGalleryDTO> GetallGalleryDatabypage(string imgtype, string Offset, string Limit);
    }
}
