using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Text;

namespace VTellTales_WA.DTO
{
    public class StoryPagesDTO
    {
        public string userid { get; set; }
        public int storyid { get; set; }
        public int pageno { get; set; }
        public int storypagetype { get; set; }
    public IFormFile? file { get; set; }
        public string pagestory { get; set; }
        public string storyformat { get; set; }
        public StoryPagesDTO()
        {
            userid = string.Empty;
            pagestory = string.Empty;
            storyformat = string.Empty;
            file = null;
        }
    }
}
