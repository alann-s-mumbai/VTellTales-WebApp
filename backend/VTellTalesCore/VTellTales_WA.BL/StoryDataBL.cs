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
    public class StoryDataBL : IStoryDataBL
    {
        private readonly IConfiguration configuration;

        public StoryDataBL(IConfiguration configuration)
        {
            this.configuration = configuration;
        }
        public int deletemystory(int storyid, string userid)
        {
            if (storyid <= 0)
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.deletemystory(storyid, userid);
        }

        public StoryDataDTO? GetStory(string userID, int storyID)
        {
            if (userID == null || storyID <= 0)
                return null;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.GetStory(userID, storyID);
        }

        public ProfileDataDTO? GetStoryUser(int storyID)
        {
            ProfileDataDTO? profileDataDTO = null;
            bool isSuccess = true;
            // storyID is a value type - just validate its range
            if (storyID <= 0)
            {
                isSuccess = false;
            }
            if (isSuccess)
            {
                IStoryDataDL storyDataDL = new StoryDataDL(configuration);
                profileDataDTO = storyDataDL.GetStoryUser(storyID);
            }
            return profileDataDTO;
        }


        public List<StoryDataDTO> GetAllStories(string userId)
        {
            // Always return a non-null list (empty if nothing found or invalid input)
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.GetAllStories(userId);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }

        public List<StoryDataDTO> GetAllStoriesbypage(string UserId, string PageNo, string Limit)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (UserId == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.GetAllStoriesbypage(UserId, PageNo, Limit);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }
        public List<StoryDataDTO> Otherallstory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.Otherallstory(userID);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }
        public List<StoryDataDTO> GetMyStory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.GetMyStory(userID);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }
        public List<StoryDataDTO> GetMyStorybypage(string userID, string PageNo, string Limit)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.GetMyStorybypage(userID, PageNo, Limit);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }
        public List<StoryDataDTO> GetTopStory(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.GetTopStory(userID);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }

        public List<StoryDataDTO> Storyfan(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.Storyfan(userID);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }

        public List<StoryDataDTO> Storybecomefan(string userID)
        {
            List<StoryDataDTO> storyDataDTO = new List<StoryDataDTO>();
            if (userID == null)
                return storyDataDTO;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var results = storyDataDL.Storybecomefan(userID);
            if (results != null)
                storyDataDTO = results;

            return storyDataDTO;
        }

        public string SaveStory(StoryDataDTO storyDataDTO)
        {
            if (storyDataDTO == null)
                return string.Empty;
            if (storyDataDTO.userid == null)
                return string.Empty;
            if (string.IsNullOrEmpty(storyDataDTO.storytitle))
                return string.Empty;

            if (!string.IsNullOrEmpty(storyDataDTO.storyimg))
            {
                    /* int uid = storyDataDTO.userid;
                     //string root = @"D:\Samples\MyStoryBookCore\";
                     string subdir = @"D:\Samples\MyStoryBookCore\" + "imgvideo\\" + uid;
                     // If directory does not exist, create it. 
                     if (!Directory.Exists(subdir))
                     {
                         Directory.CreateDirectory(subdir);
                     }*/

                    /*string strDestopPath = System.Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                    strDestopPath += "\\" + "imgvideo\\" + uid;                                       
                    if (!System.IO.Directory.Exists(strDestopPath))
                    {
                        DirectoryInfo di = System.IO.Directory.CreateDirectory(strDestopPath);                       
                    }*/
                    
                }
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.SaveStory(storyDataDTO);
        }
        public string UpdateStory(StoryDataDTO storyDataDTO)
        {
            if (storyDataDTO == null)
                return string.Empty;
            if (storyDataDTO.userid == null)
                return string.Empty;
            if (string.IsNullOrEmpty(storyDataDTO.storytitle))
                return string.Empty;

            if (!string.IsNullOrEmpty(storyDataDTO.storyimg))
            {
                    /* int uid = storyDataDTO.userid;
                     //string root = @"D:\Samples\MyStoryBookCore\";
                     string subdir = @"D:\Samples\MyStoryBookCore\" + "imgvideo\\" + uid;
                     // If directory does not exist, create it. 
                     if (!Directory.Exists(subdir))
                     {
                         Directory.CreateDirectory(subdir);
                     }*/

                    /*string strDestopPath = System.Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
                    strDestopPath += "\\" + "imgvideo\\" + uid;                                       
                    if (!System.IO.Directory.Exists(strDestopPath))
                    {
                        DirectoryInfo di = System.IO.Directory.CreateDirectory(strDestopPath);                       
                    }*/
                    
                }
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.UpdateStory(storyDataDTO);
        }

        public List<StoryTypeDataDTO> Getallstorytype()
        {
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var storyTypeDataDTO = storyDataDL.Getallstorytype();
            return storyTypeDataDTO ?? new List<StoryTypeDataDTO>();
        }
        public int Addstorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            if (_StoryTypeDataDTO.sttype == null)
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.Addstorytype(_StoryTypeDataDTO);
        }

        public int Updatestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            if (_StoryTypeDataDTO.stid == 0 || _StoryTypeDataDTO.sttype == null)
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.Updatestorytype(_StoryTypeDataDTO);
        }

        public int Deletestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            if (_StoryTypeDataDTO.stid == 0)
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.Deletestorytype(_StoryTypeDataDTO);
        }

        public int AddStoryLike(StoryLikeDataDTO storyLikeDataDTO)
        {
            if (storyLikeDataDTO == null || string.IsNullOrEmpty(storyLikeDataDTO.likebyid))
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddStoryLike(storyLikeDataDTO);
        }

        public int AddStoryComment(StoryCommentDTO storyCommentDTO)
        {
            if (storyCommentDTO == null || string.IsNullOrEmpty(storyCommentDTO.storyid) || string.IsNullOrEmpty(storyCommentDTO.storycomment))
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddStoryComment(storyCommentDTO);
        }

        public List<StoryCommentDTO> GetStoryComments(int storyID)
        {
            if (storyID <= 0)
                return new List<StoryCommentDTO>();

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var storyCommentDTO = storyDataDL.GetStoryComments(storyID);
            return storyCommentDTO ?? new List<StoryCommentDTO>();
        }

        public List<StoryCommentDTO> Getfanof(string userID)
        {
            if (string.IsNullOrEmpty(userID))
                return new List<StoryCommentDTO>();

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var storyCommentDTO = storyDataDL.Getfanof(userID);
            return storyCommentDTO ?? new List<StoryCommentDTO>();
        }

        public List<StoryCommentDTO> Getfanclub(string userID)
        {
            if (string.IsNullOrEmpty(userID))
                return new List<StoryCommentDTO>();

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            var storyCommentDTO = storyDataDL.Getfanclub(userID);
            return storyCommentDTO ?? new List<StoryCommentDTO>();
        }

        public int AddStoryView(StoryViewDataDTO storyViewDataDTO)
        {
            if (storyViewDataDTO == null || string.IsNullOrEmpty(storyViewDataDTO.storyviewbyid))
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddStoryView(storyViewDataDTO);
        }

        public int AddStoryReportBlock(StoryReportBlockDataDTO storyReportBlockDataDTO)
        {
            if (storyReportBlockDataDTO == null || string.IsNullOrEmpty(storyReportBlockDataDTO.reportblockstoryid))
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddStoryReportBlock(storyReportBlockDataDTO);
        }

        // Collaborations
        public System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> GetCollaborators(int storyId)
        {
            var list = new System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO>();
            if (storyId <= 0) return list;
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            try
            {
                list = storyDataDL.GetCollaborators(storyId);
            }
            catch
            {
                // bubble up - caller will surface
                throw;
            }
            return list;
        }

        public System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> AddCollaborator(VTellTales_WA.DTO.CollaboratorDTO collaborator)
        {
            if (collaborator == null) return new System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO>();
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddCollaborator(collaborator);
        }

        public System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> UpdateCollaborator(int storyId, string collaboratorId, VTellTales_WA.DTO.CollaboratorDTO collaborator)
        {
            if (storyId <= 0 || string.IsNullOrEmpty(collaboratorId) || collaborator == null) return new System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO>();
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.UpdateCollaborator(storyId, collaboratorId, collaborator);
        }

        public System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO> DeleteCollaborator(int storyId, string collaboratorId)
        {
            if (storyId <= 0 || string.IsNullOrEmpty(collaboratorId)) return new System.Collections.Generic.List<VTellTales_WA.DTO.CollaboratorDTO>();
            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.DeleteCollaborator(storyId, collaboratorId);
        }
        public int AddserReportBlock(UserReportBlockDataDTO userReportBlockDataDTO)
        {
            if (userReportBlockDataDTO == null || string.IsNullOrEmpty(userReportBlockDataDTO.reportblockUser))
                return 0;

            IStoryDataDL storyDataDL = new StoryDataDL(configuration);
            return storyDataDL.AddserReportBlock(userReportBlockDataDTO);
        }

    }
}
