using VTellTales_WA.DTO;
using System.Collections.Generic;

namespace VTellTales_WA.DL.Interfaces
{
    public interface IProfileDataDL
    {
        int SaveProfile(ProfileDataDTO profileDataDTO);
        int UpdateProfile(ProfileDataDTO proflieDataDTO);
        string updateToken(string userid, string token);
    ProfileDataDTO? GetProfile(string userID);
        int checkuser(string email);
    ProfileDataDTO? GetOtherProfile(string userID,string followingid);
    PushNotificationDTO? GetProfileName(string userID, string sendto);
    PushNotificationDTO? GetSingleProfileName(string userID);
    ProfileDataDTO? getTokan(string userID);
        List<ProfileDataDTO> GetProfilelist(string userID);
        List<NotificationDTO> Getallnotifications(string userID);
        List<PushNotificationDTO> GetNotificationuserlist(string userID);
        int unreadnotifications(string userID);
        int UnFollowing(ProfileFollowingDTO profileFollowerDTO);
        int SaveFollowing(ProfileFollowingDTO profileFollowingDTO);
        int GetFollower(string userID);
        int GetFollowing(string userID);

        // Authentication
        bool CheckUserExists(string email);
        ProfileDataDTO? GetUserByEmail(string email);

        //Admin
       

    }
}
