using VTellTales_WA.DTO;
using System.Collections.Generic;

namespace VTellTales_WA.DL.Interfaces
{
    public interface IStoryDataDL
    {
        string SaveStory(StoryDataDTO storyDataDTO);
        string UpdateStory(StoryDataDTO storyDataDTO);
    StoryDataDTO? GetStory(string userID, int storyID);
        List<StoryDataDTO> GetMyStory(string userID);
        List<StoryDataDTO> Otherallstory(string userID);
        List<StoryDataDTO> GetAllStoriesbypage(string userID, string PageNo, string Limit);
        List<StoryTypeDataDTO> Getallstorytype();
        int Addstorytype(StoryTypeDataDTO _StoryTypeDataDTO);
        int Updatestorytype(StoryTypeDataDTO _StoryTypeDataDTO);
        int Deletestorytype(StoryTypeDataDTO _StoryTypeDataDTO);
        List<StoryDataDTO> GetAllStories(string userId);
        List<StoryDataDTO> GetMyStorybypage(string userID, string PageNo, string Limit);
        List<StoryDataDTO> Storyfan(string userID);
        List<StoryDataDTO> Storybecomefan(string userID);
        List<StoryDataDTO> GetTopStory(string userID);
        int AddStoryLike(StoryLikeDataDTO storyLikeDataDTO);
        int AddStoryReportBlock(StoryReportBlockDataDTO storyReportBlockDataDTO);
        int AddserReportBlock(UserReportBlockDataDTO userReportBlockDataDTO);
        int AddStoryView(StoryViewDataDTO storyViewDataDTO);
        int AddStoryComment(StoryCommentDTO storyCommentDTO);
        List<StoryCommentDTO> GetStoryComments(int storyID);
        List<StoryCommentDTO> Getfanof(string userID);
        List<StoryCommentDTO> Getfanclub(string userID);
    ProfileDataDTO? GetStoryUser(int storyid);
        int deletemystory(int storyid, string userid);
        // Collaboration management
        System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> GetCollaborators(int storyId);
        System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> AddCollaborator(VTellTales_WA.DTO.CollaboratorDTO collaborator);
        System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> UpdateCollaborator(int storyId, string collaboratorId, VTellTales_WA.DTO.CollaboratorDTO collaborator);
        System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> DeleteCollaborator(int storyId, string collaboratorId);
    }
}
