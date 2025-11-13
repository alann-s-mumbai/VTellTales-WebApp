using VTellTales_WA.DTO;
using System.Collections.Generic;
using System.Text;

namespace VTellTales_WA.BL.Interfaces
{
    public interface IStoryPagesBL
    {
        int SaveStorypage(StoryPagesDTO storyPagesDTO);
        int UpdateStoryPage(StoryPagesDTO storyPagesDTO);
    StoryPagesDTO? GetStoryPage(int storyID);
        List<StoryPagesDTO> GetStoryPages(int storyID);
        List<StoryPagesDTO> GetAllStoryPages();
        int DeletemystoryPage(StoryPagesDTO storyPagesDTO);
        int DeletemystoryPagefromadmin(StoryPagesDTO storyPagesDTO);
        string deletestorypagefile(string storypagefile,string userid);
    }
}
