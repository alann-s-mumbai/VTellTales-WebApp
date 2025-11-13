using Microsoft.AspNetCore.Http;
using System;

namespace VTellTales_WA.DTO
{
    public class StoryDataDTO
    {
        public string userid { get; set; }
        public int storyid { get; set; }
        public string storytitle { get; set; }
        public string? storydesc { get; set; }
        public int spages { get; set; }
        public int storylike { get; set; }
        public int storyview { get; set; }
        public int storycomment { get; set; }
        public string? storyimg { get; set; }
        public IFormFile? file { get; set; }
        public int storystatus { get; set; }
        public int storypages { get; set; }
        public string? storytype { get; set; }
        public int storytypeid { get; set; }
        public DateTime createdate { get; set; }

        public string followerid { get; set; }

        public string followername { get; set; }

        public string? followingid { get; set; }
        public string? followingname { get; set; }
        public bool islike { get; set; }

        public StoryDataDTO()
        {
            userid = string.Empty;
            storytitle = string.Empty;
            followerid = string.Empty;
            followername = string.Empty;
            followingid = followingid ?? null;
            followingname = followingname ?? null;
        }

    }

    public class StoryLikeDataDTO
    {
        public string storyid { get; set; }
        public string likebyid { get; set; }       
        public StoryLikeDataDTO()
        {
            storyid = string.Empty;
            likebyid = string.Empty;
        }
    }

    public class StoryReportBlockDataDTO
    {
        public string userid { get; set; }
        public string reportblockstoryid { get; set; }
        public string reportblockCflag { get; set; }
        public StoryReportBlockDataDTO()
        {
            userid = string.Empty;
            reportblockstoryid = string.Empty;
            reportblockCflag = string.Empty;
        }
    }

    public class UserReportBlockDataDTO
    {
        public string userid { get; set; }
        public string reportblockUser { get; set; }
        public string reportblockflag { get; set; }
        public UserReportBlockDataDTO()
        {
            userid = string.Empty;
            reportblockUser = string.Empty;
            reportblockflag = string.Empty;
        }
    }

    public class StoryViewDataDTO
    {
        public string storyid { get; set; }
        public string storyviewbyid { get; set; }      

        public StoryViewDataDTO()
        {
            storyid = string.Empty;
            storyviewbyid = string.Empty;
        }

    }
    public class StoryTypeDataDTO
    {
        public int stid { get; set; }
        public string sttype { get; set; }      

        public StoryTypeDataDTO()
        {
            sttype = string.Empty;
        }

    }

    public class StoryCommentDTO
    {
        public string storyid { get; set; }
        public string userid { get; set; }
        public string uname { get; set; }
        public string comdate { get; set; }
        public string pimg { get; set; }
        public string storycomment { get; set; }

        public StoryCommentDTO()
        {
            storyid = string.Empty;
            userid = string.Empty;
            uname = string.Empty;
            comdate = string.Empty;
            pimg = string.Empty;
            storycomment = string.Empty;
        }

    }
}
