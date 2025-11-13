using Microsoft.Extensions.Configuration;
using VTellTales_WA.BL.Interfaces;
using VTellTales_WA.DL;
using VTellTales_WA.DL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Web;

namespace VTellTales_WA.BL
{
    public class StoryPagesBL : IStoryPagesBL
    {
        private readonly IConfiguration configuration;

        public StoryPagesBL(IConfiguration _configuration)
        {
            configuration = _configuration;
        }

        public List<StoryPagesDTO> GetAllStoryPages()
        {
            // always return a non-null list
            List<StoryPagesDTO> storyPagesDTO = new List<StoryPagesDTO>();

            IStoryPagesDL storyDataDL = new StoryPagesDL(configuration);
            var results = storyDataDL.GetAllStoryPages();
            if (results != null)
                storyPagesDTO = results;

            return storyPagesDTO;
        }

        public StoryPagesDTO? GetStoryPage(int storyID)
        {
            if (storyID <= 0)
                return null;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.GetStoryPage(storyID);
        }

        public List<StoryPagesDTO> GetStoryPages(int storyID)
        {
            List<StoryPagesDTO> storyPagesDTO = new List<StoryPagesDTO>();
            if (storyID <= 0)
                return storyPagesDTO;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            var results = storyPagesDL.GetStoryPages(storyID);
            if (results != null)
                storyPagesDTO = results;

            return storyPagesDTO;
        }
       

        public int SaveStorypage(StoryPagesDTO storyPagesDTO)
        {
            if (storyPagesDTO == null)
                return 0;
            if (string.IsNullOrEmpty(storyPagesDTO.userid))
                return 0;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.SaveStorypage(storyPagesDTO);
        }
        public  int UpdateStoryPage(StoryPagesDTO storyPagesDTO)
        {
            if (storyPagesDTO == null)
                return 0;
            if (string.IsNullOrEmpty(storyPagesDTO.userid))
                return 0;
            if (storyPagesDTO.storyid < 0)
                return 0;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.UpdateStoryPage(storyPagesDTO);
        }

        public int DeletemystoryPage(StoryPagesDTO storyPagesDTO)
        {
            if (storyPagesDTO == null)
                return 0;
            if (storyPagesDTO.pageno < 0)
                return 0;
            if (storyPagesDTO.storyid < 0)
                return 0;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.DeletemystoryPage(storyPagesDTO);
        }

        public int DeletemystoryPagefromadmin(StoryPagesDTO storyPagesDTO)
        {
            if (storyPagesDTO == null)
                return 0;
            if (storyPagesDTO.pageno < 0)
                return 0;
            if (storyPagesDTO.storyid < 0)
                return 0;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.DeletemystoryPagefromadmin(storyPagesDTO);
        }
        public string deletestorypagefile(string storypagefile, string userid)
        {
            if (string.IsNullOrEmpty(storypagefile))
                return string.Empty;

            IStoryPagesDL storyPagesDL = new StoryPagesDL(configuration);
            return storyPagesDL.deletestorypagefile(storypagefile, userid);
        }
    }
}
