using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
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
}
