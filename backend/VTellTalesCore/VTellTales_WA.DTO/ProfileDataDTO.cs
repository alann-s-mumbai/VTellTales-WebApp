using Microsoft.AspNetCore.Http;
using System;

namespace VTellTales_WA.DTO
{

    public class ProfileADataDTO
    {
        public string userid { get; set; }
        public string email { get; set; }
        public ProfileADataDTO()
        {
            userid = string.Empty;
            email = string.Empty;
        }
    }

    public class ProfileDataDTO
    {
        public string userid { get; set; }
        public string email { get; set; }
        public string password { get; set; }
        public string? name { get; set; }
        public string? profileimg { get; set; }
        public IFormFile? file { get; set; }
        public string? age { get; set; }
        public string? interest { get; set; }
        public string? location { get; set; }
        public DateTime cdate { get; set; }
        public DateTime udate { get; set; }
        public long follower { get; set; }
        public long following { get; set; }
        public string? tokan { get; set; }
        public long stories { get; set; }
        public int fanflag { get; set; }
        public int blockbyadmin { get; set; }
        public ProfileDataDTO()
        {
            userid = string.Empty;
            email = string.Empty;
            password = string.Empty;
            name = name ?? string.Empty;
            profileimg = profileimg ?? null;
            tokan = tokan ?? null;
        }
    }

    public class ProfileFollowerDTO
    {
        public string userid { get; set; }
        public string followerid { get; set; }

        public ProfileFollowerDTO()
        {
            userid = string.Empty;
            followerid = string.Empty;
        }

    }

    public class ProfileFollowingDTO
    {
        public string userid { get; set; }
        public string followingid { get; set; }

        public ProfileFollowingDTO()
        {
            userid = string.Empty;
            followingid = string.Empty;
        }

    }

    public class NotificationDTO
    {
        public string userid { get; set; }
        public string notificationto { get; set; }
        public int storyid { get; set; }
        public string? notification { get; set; }
        public string? notificationdate { get; set; }
        public string? toname { get; set; }
        public string? storytitle { get; set; }

        public NotificationDTO()
        {
            userid = string.Empty;
            notificationto = string.Empty;
            notification = notification ?? null;
            notificationdate = notificationdate ?? null;
            toname = toname ?? null;
            storytitle = storytitle ?? null;
        }

    }

    public class PushNotificationDTO
    {
        public string userid { get; set; }
        public string? username { get; set; }
        public string? sendtoid { get; set; }
        public string? sendtoname { get; set; }

        public PushNotificationDTO()
        {
            userid = string.Empty;
            username = username ?? null;
            sendtoid = sendtoid ?? null;
            sendtoname = sendtoname ?? null;
        }

    }
}
