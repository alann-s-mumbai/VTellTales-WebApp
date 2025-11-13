using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.Text;

namespace VTellTales_WA.DL.Interfaces
{
    public interface IAdminWeb
    {
        List<ProfileDataDTO> Getallusers();
        List<ProfileADataDTO> GetallusersTest();
        AdminDashboardCard GetAdminDashboardCard();
        List<AdminAllStories> GetAdminAllStories();
        AdminLoginDTO AdminGetprofile(int adminid);
        AdminLoginDTO AdminGetlogin(AdminLoginDTO _AdminLoginDTO);
        int AdminChangePassword(AdminLoginDTO _AdminLoginDTO);
        int AddAdminUserRole(AdminLoginDTO _AdminLoginDTO);
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
