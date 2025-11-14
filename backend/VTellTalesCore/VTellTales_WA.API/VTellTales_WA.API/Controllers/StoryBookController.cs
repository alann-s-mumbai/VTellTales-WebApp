using FirebaseAdmin.Auth;
using FirebaseAdmin.Messaging;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using VTellTales_WA.BL;
using VTellTales_WA.BL.Interfaces;
using VTellTales_WA.DTO;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using static VTellTales_WA.API.Controllers.FirebaseController;

// Legacy controller — cleaning up warnings incrementally.
// Null-forgiving operator (!) is used below where Directory.GetCurrentDirectory() or other APIs are known
// to return non-null values at runtime. Where async methods lacked awaits, calls are now awaited.

namespace VTellTales_WA.API.Controllers
{
    [ApiController]
    [Route("storyapi/[controller]")]
    public class StoryBookController : Controller
    {
        private readonly IConfiguration configuration;
        private readonly ILogger<StoryBookController> _logger;
        private string assetRoot;
        private string assetCdn;
        private string ipath;
        private string dbpath;
        private string ispath;
        private string dbspath;
        private string storypath;
        private string storydbpath;
        private string gallerypath;
        private string gallerydbpath;
        private string subdomain;
        private string domain;

        // private string ipath = Path.Combine("D:\\");
        //private string dbpath = Path.Combine("https://vtelltales.com/userimages/");
        // private string dirpath = Path.Combine(Directory.GetCurrentDirectory(), "userimages\\");


        public StoryBookController(IConfiguration _configuration, ILogger<StoryBookController> logger)
        {
            configuration = _configuration;
            _logger = logger;

            assetRoot = (Environment.GetEnvironmentVariable("ASSET_ROOT")
                         ?? configuration["AssetStorage:Root"]
                         ?? Path.Combine(Directory.GetCurrentDirectory()!, "data"))
                        .TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);

            assetCdn = (Environment.GetEnvironmentVariable("ASSET_CDN")
                        ?? configuration["AssetStorage:Cdn"]
                        ?? "https://webapp.vtelltales.com/data").TrimEnd('/');

            ipath = Path.Combine(assetRoot, "userimages") + Path.DirectorySeparatorChar;
            dbpath = assetCdn + "/userimages/";

            ispath = Path.Combine(assetRoot, "storydata") + Path.DirectorySeparatorChar;
            dbspath = assetCdn + "/storydata/";

            storypath = ispath;
            storydbpath = dbspath;

            gallerypath = Path.Combine(assetRoot, "gallerydata") + Path.DirectorySeparatorChar;
            gallerydbpath = assetCdn + "/gallerydata/";

            subdomain = "webapp.vtelltales.com";
            domain = new UriBuilder(assetCdn).Uri.Host;
        }

        // Helper to log an ignored exception consistently.
        private void LogAndIgnore(Exception ex, string? context = null)
        {
            try
            {
                _logger?.LogWarning(ex, context ?? "Ignored exception in StoryBookController");
            }
            catch
            {
                // Ensure logging failures don't bubble up.
            }
        }
        public string Get()
        {
            return "value";
        }

        [HttpGet("GetAllStoriesbypage/{UserId}/{PageNo}/{Limit}")]
        //[Route("api/GetAllStoriesbypage/{UserId}/{PageNo}/{Limit}")]
        public JsonResult GetAllStoriesbypage(string UserId, string PageNo, string Limit)
        {
            try
            {
                IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
                List<StoryDataDTO> storyDataDTO = iStoryDataBL.GetAllStoriesbypage(UserId,PageNo,Limit);
                return Json(storyDataDTO);
            }
            catch (Exception e)
            {
                return Json("exception:"+ e.Message.ToString());
            }
        }

        [HttpGet("story/{userId}/{StoryId}")]
        public JsonResult Story(string userId, int storyId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            StoryDataDTO? storyDataDTO = iStoryDataBL.GetStory(userId, storyId);
            return Json(storyDataDTO);
        }

        [HttpGet("allstories/{userId}")]
        public JsonResult AllStories(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.GetAllStories(userId);
            return Json(storyDataDTO);
        }
        [HttpGet("getallstorytype")]
        public JsonResult Getallstorytype()
        {
            List<StoryTypeDataDTO> _StoryTypeDataDTO = new List<StoryTypeDataDTO>();
            StoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            _StoryTypeDataDTO = iStoryDataBL.Getallstorytype();
            return Json(_StoryTypeDataDTO);
        }

        [HttpPost("Addstorytype")]
        public JsonResult Addstorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            result = iStoryDataBL.Addstorytype(_StoryTypeDataDTO);
            return Json(result);
        }

        [HttpPost("Updatestorytype")]
        public JsonResult Updatestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            result = iStoryDataBL.Updatestorytype(_StoryTypeDataDTO);
            return Json(result);
        }

        [HttpPost("Deletestorytype")]
        public JsonResult Deletestorytype(StoryTypeDataDTO _StoryTypeDataDTO)
        {
            int result = 0;
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            result = iStoryDataBL.Deletestorytype(_StoryTypeDataDTO);
            return Json(result);
        }

      [HttpGet("GetTopStory/{userId}")]
        public JsonResult GetTopStory(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.GetTopStory(userId);
            return Json(storyDataDTO);
        }

        [HttpGet("GetCollaborators/{storyId}")]
        public IActionResult GetCollaborators(int storyId)
        {
            try
            {
                IStoryDataBL bl = new StoryDataBL(configuration);
                var collab = bl.GetCollaborators(storyId);
                return Ok(collab);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error getting collaborators");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPost("InviteCollaborator")]
        public IActionResult InviteCollaborator([FromBody] VTellTales_WA.DTO.CollaboratorDTO collaborator)
        {
            try
            {
                if (collaborator == null) return BadRequest(new { error = "Invalid payload" });
                IStoryDataBL bl = new StoryDataBL(configuration);
                var list = bl.AddCollaborator(collaborator);
                return Ok(list);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error inviting collaborator");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpPut("Collaborators/{storyId}/{collaboratorId}")]
        public IActionResult UpdateCollaborator(int storyId, string collaboratorId, [FromBody] VTellTales_WA.DTO.CollaboratorDTO collaborator)
        {
            try
            {
                if (collaborator == null) return BadRequest(new { error = "Invalid payload" });
                IStoryDataBL bl = new StoryDataBL(configuration);
                var list = bl.UpdateCollaborator(storyId, collaboratorId, collaborator);
                return Ok(list);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error updating collaborator");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpDelete("Collaborators/{storyId}/{collaboratorId}")]
        public IActionResult DeleteCollaborator(int storyId, string collaboratorId)
        {
            try
            {
                IStoryDataBL bl = new StoryDataBL(configuration);
                var list = bl.DeleteCollaborator(storyId, collaboratorId);
                return Ok(list);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error deleting collaborator");
                return StatusCode(500, new { error = "Internal server error" });
            }
        }

        [HttpGet("Storyfan/{userId}")]
        public JsonResult Storyfan(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.Storyfan(userId);
            return Json(storyDataDTO);
        }

        [HttpGet("Storybecomefan/{userId}")]
        public JsonResult Storybecomefan(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.Storybecomefan(userId);
            return Json(storyDataDTO);
        }

        [HttpGet("allstory/{userId}")]
        public JsonResult AllStory(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.GetMyStory(userId);
            return Json(storyDataDTO);
        }

        [HttpGet("Otherallstory/{userId}")]
        public JsonResult Otherallstory(string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryDataDTO> storyDataDTO = iStoryDataBL.Otherallstory(userId);
            return Json(storyDataDTO);
        }

        [HttpGet("GetMyStorybypage/{UserId}/{PageNo}/{Limit}")]
        //[Route("api/GetAllStoriesbypage/{UserId}/{PageNo}/{Limit}")]
        public JsonResult GetMyStorybypage(string UserId, string PageNo, string Limit)
        {
            try
            {
                IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
                List<StoryDataDTO> storyDataDTO = iStoryDataBL.GetMyStorybypage(UserId, PageNo, Limit);
                return Json(storyDataDTO);
            }
            catch (Exception e)
            {
                return Json("exception:" + e.Message.ToString());
            }
        }


        [HttpPost("SaveStory")]
        public async Task<JsonResult> PostStory([FromForm] StoryDataDTO storyDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            var file = storyDataDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (storyDataDTO.file != null)
            {
                try
                {

                    var extension = "." + file!.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + storyDataDTO.userid, fileName);
                    spath = Path.Combine(dbpath + storyDataDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ipath + storyDataDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + storyDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyDataDTO.storyimg = spath;
                }
                catch (Exception e)
                {
                    return Json(new { e.Message });
                }
            }
            else if (storyDataDTO.storyimg != null && storyDataDTO.storyimg.StartsWith(gallerydbpath))
            {
                try
                {

                    var extension = "." + storyDataDTO.storyimg.Split('.')[storyDataDTO.storyimg.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + storyDataDTO.userid, fileName);
                    spath = Path.Combine(dbpath + storyDataDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ipath + storyDataDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + storyDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }

                    String filePath = storyDataDTO.storyimg;
                    filePath = filePath.Replace(gallerydbpath, gallerypath);
                    filePath = filePath.Replace(subdomain, domain);

                    var fileName1 = filePath;
                    using var fs = new FileStream(fileName1, FileMode.Open);

                    var fileName2 = path;
                    using var fs2 = new FileStream(fileName2, FileMode.CreateNew);


                    if (fs.Length > 0)
                    {
                        fs.CopyTo(fs2);
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyDataDTO.storyimg = spath;
                }
                catch (Exception e)
                {
                    return Json(new { e.Message });
                }
            }



            string result = iStoryDataBL.SaveStory(storyDataDTO);
            try
            {
                if (result != null)
                {
                    //IProfileDataBL iProfileDataBL1 = new IProfileDataBL(configuration);
                    IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                    List<PushNotificationDTO> PushNotificationDTO = iProfileDataBL.GetNotificationuserlist(storyDataDTO.userid);
                    foreach (PushNotificationDTO storyDataDTO2 in PushNotificationDTO)
                    {
                        await SendUserNotification(storyDataDTO2.userid, storyDataDTO2.sendtoid ?? "",  " created new story.");
                    }
                }

            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "PostStory: notification dispatch");
            }

            return Json(new { result });
        }


        [HttpPost("UpdateStory")]
        public async Task<JsonResult> UpdateStory([FromForm] StoryDataDTO storyDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            var file = storyDataDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (storyDataDTO.file != null)
            {
                try
                {

                    var extension = "." + file!.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + storyDataDTO.userid, fileName);
                    spath = Path.Combine(dbpath + storyDataDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ipath + storyDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyDataDTO.storyimg = spath;
                }
                catch (Exception e)
                {
                    return Json(new { e.Message });
                }
            }
            else if (storyDataDTO.storyimg != null && storyDataDTO.storyimg.StartsWith(gallerydbpath))
            {
                try
                {

                    var extension = "." + storyDataDTO.storyimg.Split('.')[storyDataDTO.storyimg.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + storyDataDTO.userid, fileName);
                    spath = Path.Combine(dbpath + storyDataDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ipath + storyDataDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + storyDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }

                    String filePath = storyDataDTO.storyimg;
                    filePath = filePath.Replace(gallerydbpath, gallerypath);
                    filePath = filePath.Replace(subdomain, domain);

                    var fileName1 = filePath;
                    using var fs = new FileStream(fileName1, FileMode.Open);

                    var fileName2 = path;
                    using var fs2 = new FileStream(fileName2, FileMode.CreateNew);                                 


                    if (fs.Length > 0)
                    {
                        fs.CopyTo(fs2);
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyDataDTO.storyimg = spath;
                }
                catch (Exception e)
                {
                    return Json(new { e.Message });
                }
            }

            string result = iStoryDataBL.UpdateStory(storyDataDTO);
            try
            {
                if (result != null)
                {
                    IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                    List<PushNotificationDTO> PushNotificationDTO = iProfileDataBL.GetNotificationuserlist(storyDataDTO.userid);
                    foreach (PushNotificationDTO storyDataDTO2 in PushNotificationDTO)
                    {
                        await SendUserNotification(storyDataDTO2.userid, storyDataDTO2.sendtoid ?? "", " updated story.");
                    }
                }

            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "UpdateStory: notification dispatch");
            }

            //return fileName;
            //return Json(new { result = result1 });
            // return result.ToString();// + storyDataDTO.storyimg.ToString();
            // int result = iStoryDataBL.SaveStory(storyDataDTO);
            return Json(new { result });
        }

        [HttpGet("viewprofile/{userId}")]
        public JsonResult GetProfile(string userId)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            ProfileDataDTO? profileDataDTO = iProfileDataBL.GetProfile(userId);
            return Json(profileDataDTO);
        }

        [HttpGet("checkuser/{email}")]
        public JsonResult checkuser(string email)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.checkuser(email);
            return Json(result);
        }

        [HttpGet("getOtherProfile/{userId}/{followingid}")]
        public JsonResult GetOtherProfile(string userId, string followingid)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            ProfileDataDTO? profileDataDTO = iProfileDataBL.GetOtherProfile(userId, followingid);
            return Json(profileDataDTO);
        }

        [HttpGet("getToken/{userId}")]
        public String getToken(string userId)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            ProfileDataDTO? profileDataDTO = iProfileDataBL.getToken(userId);
            return profileDataDTO?.tokan ?? string.Empty;
        }

        [HttpGet("getallnotifications/{userId}")]
        public JsonResult Getallnotifications(string userId)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            List<NotificationDTO> notificationDTO = iProfileDataBL.Getallnotifications(userId);
            return Json(notificationDTO);
        }

        [HttpGet("unreadnotifications/{userId}")]
        public JsonResult unreadnotifications(string userId)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.unreadnotifications(userId);
            return Json(result);
        }
        /*[HttpPost("AddProfile")]
        public JsonResult SaveProfile(ProfileDataDTO profileDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.SaveProfile(profileDataDTO);
            return Json(new { result = result });
        }*/

        [HttpPost("AddProfile")]
        public async Task<JsonResult> SaveProfile([FromForm] ProfileDataDTO profileDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);

            //ImageWriter imagewriter = new ImageWriter(configuration);
            //string result = imagewriter.uploadImage(profileDataDTO.file).Result;

            var file = profileDataDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (profileDataDTO.file != null)
            {
                try
                {

                    var extension = "." + file!.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + profileDataDTO.userid, fileName);
                    spath = Path.Combine(dbpath + profileDataDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);
                    //path = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\userimages\\" , profileDataDTO.userid , fileName);
                    //   filePath = "F:\\TSI\\2020\\PfxDemo.WebAPI\\PfxDemo.WebAPI\\Userimage\\" + vr.UserId + unixTimestamp + ".jpg"; ;
                    // string convert = file.FileName.Replace("data:image/png;base64,", String.Empty);
                    //var dpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images");
                    /*DirectoryInfo dInfo = new DirectoryInfo(Directory.GetCurrentDirectory());
                    DirectorySecurity dSecurity = dInfo.GetAccessControl();
                    dSecurity.AddAccessRule(new FileSystemAccessRule(new SecurityIdentifier(WellKnownSidType.WorldSid, null), FileSystemRights.FullControl, InheritanceFlags.ObjectInherit | InheritanceFlags.ContainerInherit, PropagationFlags.NoPropagateInherit, AccessControlType.Allow));
                    dInfo.SetAccessControl(dSecurity);*/

                    var dpath = Path.Combine(ipath + profileDataDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + profileDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    /*if (image.Length > 0)
                    {
                        using (var fileStream = new FileStream(image.FileName, FileMode.Create))
                        {
                            image.CopyTo(fileStream);
                        }
                    }*/
                    if (spath != null)
                        profileDataDTO.profileimg = spath;

                }
                catch (Exception e)
                {
                    return Json(new { result = e.Message });
                }
            }
            int result = iProfileDataBL.SaveProfile(profileDataDTO);
            return Json(new { result = result });

        }


        [HttpPost("AddImageProfile")]
        public async Task<IActionResult> upuImage([FromForm] ProfileDataDTO profileDataDTO)
        {
            if (profileDataDTO == null)
            {
                return BadRequest(new { success = false, message = "Profile payload is missing." });
            }

            var userId = profileDataDTO.userid?.Trim();
            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest(new { success = false, message = "userid is required." });
            }

            var file = profileDataDTO.file;
            string? profileImageUrl = profileDataDTO.profileimg;

            try
            {
                if (file != null && file.Length > 0)
                {
                    var extension = Path.GetExtension(file.FileName);
                    if (string.IsNullOrWhiteSpace(extension))
                    {
                        extension = ".png";
                    }

                    var userDirectory = Path.Combine(assetRoot, "userimages", userId);
                    Directory.CreateDirectory(userDirectory);

                    var fileName = $"{Guid.NewGuid()}{extension}";
                    var physicalPath = Path.Combine(userDirectory, fileName);
                    await using (var stream = new FileStream(physicalPath, FileMode.Create, FileAccess.Write, FileShare.None))
                    {
                        await file.CopyToAsync(stream).ConfigureAwait(false);
                    }

                    profileImageUrl = $"{assetCdn.TrimEnd('/')}/userimages/{userId}/{fileName}";
                }

                profileDataDTO.profileimg = profileImageUrl;
                var profileDataBl = new ProfileDataBL(configuration);
                var result = profileDataBl.UpdateProfile(profileDataDTO);

                if (result <= 0)
                {
                    return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Profile update failed." });
                }

                return Ok(new
                {
                    success = true,
                    result,
                    userid = profileDataDTO.userid,
                    name = profileDataDTO.name ?? string.Empty,
                    age = profileDataDTO.age ?? string.Empty,
                    location = profileDataDTO.location ?? string.Empty,
                    interest = profileDataDTO.interest ?? string.Empty,
                    profileimg = profileDataDTO.profileimg ?? string.Empty
                });
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "Failed to upload profile image");
                return StatusCode(StatusCodes.Status500InternalServerError, new { success = false, message = "Unexpected error while updating profile.", error = ex.Message });
            }
        }

        [HttpPost("AddImage")]
        public async Task<string> AddImage(IFormFile file)
        {

            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (file != null)
            {
                try
                {

                    var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(Directory.GetCurrentDirectory(), "userimages\\", fileName);
                    spath = $"https://webapp.vtelltales.com/data/userimages/{fileName}";
                    path = path.Replace(subdomain, domain);
                    //path = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\userimages\\" , profileDataDTO.userid , fileName);
                    //   filePath = "F:\\TSI\\2020\\PfxDemo.WebAPI\\PfxDemo.WebAPI\\Userimage\\" + vr.UserId + unixTimestamp + ".jpg"; ;
                    // string convert = file.FileName.Replace("data:image/png;base64,", String.Empty);
                    //var dpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images");
                    /*DirectoryInfo dInfo = new DirectoryInfo(Directory.GetCurrentDirectory());
                    DirectorySecurity dSecurity = dInfo.GetAccessControl();
                    dSecurity.AddAccessRule(new FileSystemAccessRule(new SecurityIdentifier(WellKnownSidType.WorldSid, null), FileSystemRights.FullControl, InheritanceFlags.ObjectInherit | InheritanceFlags.ContainerInherit, PropagationFlags.NoPropagateInherit, AccessControlType.Allow));
                    dInfo.SetAccessControl(dSecurity);*/

                    var dpath = Path.Combine(Directory.GetCurrentDirectory(), "userimages\\");
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + profileDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    /*if (image.Length > 0)
                    {
                        using (var fileStream = new FileStream(image.FileName, FileMode.Create))
                        {
                            image.CopyTo(fileStream);
                        }
                    }*/
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            return "Successful";
        }

        [HttpPost("AddVideo")]
        public async Task<string> AddVideo([FromForm] StoryPagesDTO storyPagesDTO)
        {
            //IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);

            var file = storyPagesDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (file != null)
            {
                try
                {


                    var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(Directory.GetCurrentDirectory(), "storydata\\" + storyPagesDTO.userid, fileName);
                    spath = $"https://webapp.vtelltales.com/data/storydata/{storyPagesDTO.userid}/{fileName}";
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(Directory.GetCurrentDirectory(), "storydata\\ " + storyPagesDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + profileDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    /*if (image.Length > 0)
                    {
                        using (var fileStream = new FileStream(image.FileName, FileMode.Create))
                        {
                            image.CopyTo(fileStream);
                        }
                    }*/
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            return "Successful";
        }

        [HttpPost("SaveStorypage")]
        public async Task<string> SaveStorypage([FromForm] StoryPagesDTO storyPagesDTO)
        {
            IStoryPagesBL iStoryPagesBL = new StoryPagesBL(configuration);
            var file = storyPagesDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (file != null)
            {
                try
                {
                    var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension;
                    path = Path.Combine(ispath + storyPagesDTO.userid, fileName);
                    dbspath = dbspath + storyPagesDTO.userid + "/";
                    spath = Path.Combine(dbspath, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ispath + storyPagesDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyPagesDTO.pagestory = spath;
                    /*if (image.Length > 0)
                    {
                        using (var fileStream = new FileStream(image.FileName, FileMode.Create))
                        {
                            image.CopyTo(fileStream);
                        }
                    }*/
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            else if (storyPagesDTO.pagestory != null && storyPagesDTO.pagestory.StartsWith(gallerydbpath))
            {
                try
                {

                    var extension = "." + storyPagesDTO.pagestory.Split('.')[storyPagesDTO.pagestory.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(ipath + storyPagesDTO.userid, fileName);
                    spath = Path.Combine(dbpath + storyPagesDTO.userid, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ipath + storyPagesDTO.userid);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + storyDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }

                    String filePath = storyPagesDTO.pagestory;
                    filePath = filePath.Replace(gallerydbpath, gallerypath);
                    filePath = filePath.Replace(subdomain, domain);

                    var fileName1 = filePath;
                    using var fs = new FileStream(fileName1, FileMode.Open);

                    var fileName2 = path;
                    using var fs2 = new FileStream(fileName2, FileMode.CreateNew);


                    if (fs.Length > 0)
                    {
                        fs.CopyTo(fs2);
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyPagesDTO.pagestory = spath;
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }


            int result = iStoryPagesBL.SaveStorypage(storyPagesDTO);
            return result.ToString();
        }

        [HttpPost("UpdateStoryPage")]
        public async Task<string> UpdateStoryPage([FromForm] StoryPagesDTO storyPagesDTO)
        {
            IStoryPagesBL iStoryPagesBL = new StoryPagesBL(configuration);
            var file = storyPagesDTO.file;
            string? path = null;
            string? spath = null;

            string? fileName = null;
            if (file != null)
            {
                try
                {
                    var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension;
                    path = Path.Combine(ispath + storyPagesDTO.userid, fileName);
                    dbspath = dbspath + storyPagesDTO.userid + "/";
                    spath = Path.Combine(dbspath, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ispath + storyPagesDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyPagesDTO.pagestory = spath;
                    /*if (image.Length > 0)
                    {
                        using (var fileStream = new FileStream(image.FileName, FileMode.Create))
                        {
                            image.CopyTo(fileStream);
                        }
                    }*/
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }
            else if (storyPagesDTO.pagestory != null && storyPagesDTO.pagestory.StartsWith(gallerydbpath))
            {
                try
                {

                    var extension = "." + storyPagesDTO.pagestory.Split('.')[storyPagesDTO.pagestory.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension;
                    path = Path.Combine(ispath + storyPagesDTO.userid, fileName);
                    dbspath = dbspath + storyPagesDTO.userid + "/";
                    spath = Path.Combine(dbspath, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(ispath + storyPagesDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }

                    String filePath = storyPagesDTO.pagestory;
                    filePath = filePath.Replace(gallerydbpath, gallerypath);
                    filePath = filePath.Replace(subdomain, domain);

                    var fileName1 = filePath;
                    using var fs = new FileStream(fileName1, FileMode.Open);

                    var fileName2 = path;
                    using var fs2 = new FileStream(fileName2, FileMode.CreateNew);


                    if (fs.Length > 0)
                    {
                        fs.CopyTo(fs2);
                    }
                    else
                    {
                        spath = null;
                    }
                    if (spath != null)
                        storyPagesDTO.pagestory = spath;
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }



            int result = iStoryPagesBL.UpdateStoryPage(storyPagesDTO);
            return result.ToString();
        }


        [HttpPost("GetStoryPages/{storyid}")]
        [HttpGet("GetStoryPages/{storyid}")]
        public JsonResult GetStoryPages(int storyid)
        {
            IStoryPagesBL iStoryPagesBL = new StoryPagesBL(configuration);
            List<StoryPagesDTO> storyPagesDTO = iStoryPagesBL.GetStoryPages(storyid);
            return Json(storyPagesDTO);
        }

        [HttpPost("deletestorypagefile")]
        public JsonResult deletestorypagefile([FromForm] StoryPagesDTO storyPagesDTO)
        {
            IStoryPagesBL iStoryPagesBL = new StoryPagesBL(configuration);
            string result = iStoryPagesBL.deletestorypagefile(storyPagesDTO.pagestory, storyPagesDTO.userid);
            return Json(result);
        }

        [HttpPost("DeletemystoryPage")]
        public JsonResult DeletemystoryPage([FromForm] StoryPagesDTO storyPagesDTO)
        {
            IStoryPagesBL iStoryDataBL = new StoryPagesBL(configuration);
            int result = iStoryDataBL.DeletemystoryPage(storyPagesDTO);
            return Json(result);
        }

        [HttpPost("DeletemystoryPagefromadmin")]
        public JsonResult DeletemystoryPagefromadmin(StoryPagesDTO storyPagesDTO)
        {
            IStoryPagesBL iStoryDataBL = new StoryPagesBL(configuration);
            int result = iStoryDataBL.DeletemystoryPagefromadmin(storyPagesDTO);
            return Json(result);
        }

        [HttpPost("deletemystory/{storyid}/{userId}")]
        [HttpGet("deletemystory/{storyid}/{userId}")]
        public JsonResult deletemystory(int storyid, string userId)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.deletemystory(storyid,userId);
            return Json(result);
        }

        [HttpPost("GetStoryUser/{storyid}")]
        public JsonResult GetStoryUser(int storyid)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            ProfileDataDTO? profileDataDTO = iStoryDataBL.GetStoryUser(storyid);
            return Json(profileDataDTO);
        }

        [HttpPost("updateProfile")]
        public JsonResult UpdateProfile(ProfileDataDTO profileDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.UpdateProfile(profileDataDTO);
            return Json(new { result = result });
        }

        [HttpPost("updateToken")]
        public JsonResult updateToken(ProfileDataDTO profileDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            string result = iProfileDataBL.updateToken(profileDataDTO.userid, profileDataDTO.tokan ?? "");
            //result = result + "  input : " + profileDataDTO.userid + profileDataDTO.tokan;
            return Json(new { result = result });
        }

        [HttpPost("UnFollowing")]
        public JsonResult UnFollowing(ProfileFollowingDTO profileUnFollowerDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.UnFollowing(profileUnFollowerDTO);
            try
            {
                if (result != 0)
                {

                    _ = SendUserNotification(profileUnFollowerDTO.userid, profileUnFollowerDTO.followingid, " is not your fan now.");
                }
            }
            catch (Exception) { }

            return Json(new { result = result });
        }

        [HttpPost("AddFollowing")]
        public JsonResult SaveFollowing(ProfileFollowingDTO profileFollowingDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.SaveFollowing(profileFollowingDTO);
            try
            {
                if (result != 0)
                {
                    var a = SendUserNotification(profileFollowingDTO.userid, profileFollowingDTO.followingid, " is become your fan.");
                }
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "SaveFollowing: notification");
            }


            return Json(new { result = 0 });
        }

        [HttpPost("AddStoryLike")]
        public int AddStoryLike([FromForm] StoryLikeDataDTO storyLikeDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.AddStoryLike(storyLikeDataDTO);
            try
            {
                if (result != 0)
                {
                    ProfileDataDTO? profileDataDTO = iStoryDataBL.GetStoryUser(int.Parse(storyLikeDataDTO.storyid));
                    if (profileDataDTO != null)
                    {
                        _ = SendUserNotification(storyLikeDataDTO.likebyid, profileDataDTO.userid, " liked your story.");
                    }
                }
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "AddStoryLike: notification");
            }

            return result;
        }

        [HttpPost("AddStoryComment")]
        public int AddStoryComment([FromForm] StoryCommentDTO storyCommentDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.AddStoryComment(storyCommentDTO);
            try
            {
                if (result != 0)
                {
                    ProfileDataDTO? profileDataDTO = iStoryDataBL.GetStoryUser(int.Parse(storyCommentDTO.storyid));
                    if (profileDataDTO != null)
                    {
                        _ = SendUserNotification(storyCommentDTO.userid, profileDataDTO.userid, " added comment to story.");
                    }
                }
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "AddStoryComment: notification");
            }

            return result;
        }

        [HttpGet("GetStoryComments/{storyid}")]
        public JsonResult GetStoryComments(int storyid)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryCommentDTO> storyCommentDTO = iStoryDataBL.GetStoryComments(storyid);
            return Json(storyCommentDTO);
        }



        [HttpGet("Getfanof/{userid}")]
        public JsonResult Getfanof(string userid)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryCommentDTO> storyfanofDTO = iStoryDataBL.Getfanof(userid);
            return Json(storyfanofDTO);
        }

        [HttpGet("Getfanclub/{userid}")]
        public JsonResult Getfanclub(string userid)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            List<StoryCommentDTO> storyfanclubDTO = iStoryDataBL.Getfanclub(userid);
            return Json(storyfanclubDTO);
        }

        [HttpPost("ValidateFirebaseToken")]
        public async Task<JsonResult> ValidateFirebaseToken([FromBody] FirebaseTokenDTO tokenDto)
        {
            if (tokenDto == null || string.IsNullOrWhiteSpace(tokenDto.idToken))
            {
                return Json(new { success = false, message = "Missing idToken" });
            }

            try
            {
                var decoded = await FirebaseAuth.DefaultInstance.VerifyIdTokenAsync(tokenDto.idToken);
                decoded.Claims.TryGetValue("email", out object? emailClaim);
                decoded.Claims.TryGetValue("name", out object? nameClaim);
                return Json(new
                {
                    success = true,
                    uid = decoded.Uid,
                    email = emailClaim?.ToString(),
                    name = nameClaim?.ToString()
                });
            }
            catch (FirebaseAuthException ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
            catch (System.Exception ex)
            {
                return Json(new { success = false, message = ex.Message });
            }
        }


        [HttpPost("AddStoryView")]
        public int AddStoryView([FromForm] StoryViewDataDTO storyViewDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.AddStoryView(storyViewDataDTO);
            return result;
        }

        [HttpPost("SendSingleUserNotification")]
        public virtual Task<string> SendSingleUserNotification(string sendto, string msg)
        {
            string rr = "";
            try
            {
                FireBaseService uc = new FireBaseService(configuration);
                ProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                PushNotificationDTO? profileDataDTO = iProfileDataBL.GetSingleProfileName(sendto);
                if (profileDataDTO != null)
                {
                    string utoken = getToken(sendto);
                    msg = profileDataDTO.sendtoname + " " + msg;
                    var a = uc.SendNotificationSingle(profileDataDTO.username ?? "", msg, utoken);
                }
                rr = "Successful";
            }
            catch (Exception e)
            {
                rr = e.Message.ToString();
            }
            return Task.FromResult(rr);
        }


        [HttpPost("SendUserNewNotification")]
        public virtual Task<string> SendUserNewNotification(string sendto, string sendfrom, string msg)
        {
            string rr = "";
            try
            {
                FireBaseService uc = new FireBaseService(configuration);
                IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                PushNotificationDTO? profileDataDTO = iProfileDataBL.GetProfileName(sendto, sendfrom);
                if (profileDataDTO != null)
                {
                    string utoken = getToken(sendto);
                    msg = profileDataDTO.sendtoname + " " + msg;
                    var a = uc.SendNotificationSingle(profileDataDTO.username ?? "", msg, utoken);
                }
                rr = "Successful";
            }
            catch (Exception e)
            {
                rr = e.Message.ToString();
            }
            return Task.FromResult(rr);
        }

        [HttpPost("SendUserNotification")]
        public virtual Task<string> SendUserNotification(string sendto, string sendfrom, string msg)
        {
            string rr = "";
            try
            {
                FireBaseService uc = new FireBaseService(configuration);
                IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                PushNotificationDTO? profileDataDTO = iProfileDataBL.GetProfileName(sendto,sendfrom);
                if (profileDataDTO != null)
                {
                    string utoken = getToken(sendfrom);
                    msg = profileDataDTO.sendtoname + " " + msg;
                    var a = uc.SendNotificationSingle(profileDataDTO.username ?? "", msg, utoken);
                }
                rr = "Successful";
            }
            catch (Exception e)
            {
                rr = e.Message.ToString();
            }
            return Task.FromResult(rr);
        }

        [HttpPost("SendNotification")]
        public virtual async Task<string> SendNotification()
        {

            var message = new Message()
            {
                Data = new Dictionary<string, string>()
                {
                    ["FirstName"] = "V-tell",
                    ["LastName"] = "Tales"
                },
                Notification = new Notification
                {
                    Title = "Message Title from.net",
                    Body = "Message Body from vtell tales"
                },
                // Token = "cxzUxLjBQtOWkacgfsSOpW:APA91bE8xykX2UfmkNBxEeNtqu-8ACLXVm2dY77YZKFHx0h5u2wcNH19ErTHZ0PKgnrNr8UHxuWXJ3IhJvFgmadJAkKEQmOWiQHIPuwHsGaN0aRJ79haapfjCRZ-0mt1uX7MKHFu-yBT"
                //Token = "czwJccI5QHeTlY-ZkvoNoM:APA91bE3sGhnVkG63k7jmnVxWWoCEuTsIJcQNNkwvUsVNs4_Z_nt8k95w14OeCrsWoZ3WXmxXmMekB9Ngctavel6ORNjuQVUqgomD3IpOv_3v-dTt-qfn7LicjUtDRLVCRmuNxYyrx27",
                Topic = "all",
            };
            var messaging = FirebaseMessaging.DefaultInstance;
            var result = await messaging.SendAsync(message);
            Console.WriteLine(result);
            // Response is a message ID string.
            return "Successfully sent message: " + result;
        }




        //Admin Panel 

        [HttpGet("Getallusers")]
        public JsonResult Getallusers()
        {
            List<ProfileDataDTO> profileDataDTO = new List<ProfileDataDTO>();
            ProfileDataBL ikBL = new ProfileDataBL(configuration);

            //ProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            profileDataDTO = ikBL.Getallusers();
            return Json(profileDataDTO);
        }

        [HttpGet("GetallusersTest")]
        public JsonResult GetallusersTest()
        {
            List<ProfileADataDTO> profileDataDTO = new List<ProfileADataDTO>();
            ProfileDataBL ikBL = new ProfileDataBL(configuration);

            profileDataDTO = ikBL.GetallusersTest();
            return Json(profileDataDTO);

        }

        [HttpGet("GetAdminDashboardCard")]
        public JsonResult GetAdminDashboardCard()
        {
            AdminDashboardCard profileDataDTO = new AdminDashboardCard();
            ProfileDataBL ikBL = new ProfileDataBL(configuration);

            profileDataDTO = ikBL.GetAdminDashboardCard();
            return Json(profileDataDTO);

        }

        [HttpGet("GetAdminAllStories")]
        public JsonResult GetAdminAllStories()
        {
            List<AdminAllStories> adminAllStories = new List<AdminAllStories>();
            IProfileDataBL ikBL = new ProfileDataBL(configuration);

            adminAllStories = ikBL.GetAdminAllStories();
            return Json(adminAllStories);

        }

        [HttpGet("AdminGetprofile/{admin_id}")]
        public JsonResult AdminGetprofile(int admin_id)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            AdminLoginDTO loginDTO = iProfileDataBL.AdminGetprofile(admin_id);
            return Json(loginDTO);
        }

        [HttpPost("AdminGetlogin")]
        public JsonResult AdminGetlogin(AdminLoginDTO _AdminLoginDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            AdminLoginDTO result = iProfileDataBL.AdminGetlogin(_AdminLoginDTO);
            return Json(result);
        }

        [HttpPost("AdminChangePassword")]
        public JsonResult AdminChangePassword(AdminLoginDTO _AdminLoginDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.AdminChangePassword(_AdminLoginDTO);
            return Json(result);
        }

        [HttpPost("AddAdminUserRole")]
        public JsonResult AddAdminUserRole(AdminLoginDTO _AdminLoginDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.AddAdminUserRole(_AdminLoginDTO);
            return Json(result);
        }

        [HttpPost("updatestorystatusbyadmin")]
        public int updatestorystatusbyadmin(StoryDataDTO storyDataDTO)
        {
            IProfileDataBL iProfileDatabBL = new ProfileDataBL(configuration);
            int result = iProfileDatabBL.updatestorystatusbyadmin(storyDataDTO);
            try
            {
                if (result != 0)
                {
                    // Notify the story owner about admin action. Assume storystatus==1 means approved.
                    string msg = (storyDataDTO.storystatus == 1)
                        ? "Your Story Approved by admin."
                        : "Your Story Rejected by admin.";
                    _ = SendSingleUserNotification(storyDataDTO.userid, msg);
                }
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "updatestorystatusbyadmin: notification");
            }

            return result;
        }

       
        [HttpGet("GetAdminStoryComments/{storyid}")]
        public JsonResult GetAdminStoryComments(int storyid)
        {
            IProfileDataBL iStoryDataBL = new ProfileDataBL(configuration);
            List<AdminStoryCommentDTO> storyCommentDTO = iStoryDataBL.GetAdminStoryComments(storyid);
            return Json(storyCommentDTO);
        }

        [HttpGet("deletecommentbyadmin/{srno}")]
        public JsonResult deletecommentbyadmin(int srno)
        {
            IProfileDataBL iStoryDataBL = new ProfileDataBL(configuration);
            int result = iStoryDataBL.deletecommentbyadmin(srno);
            return Json(result);
        }

        [HttpPost("deleteuserbyadmin")]
        public JsonResult deleteuserbyadmin(ProfileDataDTO profileDataDTO)
        {
            IProfileDataBL iStoryDataBL = new ProfileDataBL(configuration);
            int result = iStoryDataBL.deleteuserbyadmin(profileDataDTO);
            try
            {
                if (result == 1)
                {
                    string msg = "";
                    if(profileDataDTO.blockbyadmin == 1)
                    {
                        msg = "Your account blocked by admin.";
                    }
                    else
                        msg = "Your account unblocked by admin.";

                    var a = SendSingleUserNotification(profileDataDTO.userid, msg);

                    }

                }
                catch (Exception ex)
                {
                    LogAndIgnore(ex, "deleteuserbyadmin: notification");
                }
            return Json(result);
        }

        [HttpPost("PermanentDeleteUser")]
        public JsonResult PermanentDeleteUser([FromBody] dynamic requestData)
        {
            try
            {
                string userid = requestData.userid;
                string admin_email = requestData.admin_email;
                string admin_password = requestData.admin_password;

                IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                int result = iProfileDataBL.PermanentDeleteUser(userid, admin_email, admin_password);
                
                if (result == -1)
                {
                    return Json(new { success = false, message = "Invalid admin credentials" });
                }
                else if (result == 1)
                {
                    return Json(new { success = true, message = "User permanently deleted" });
                }
                else
                {
                    return Json(new { success = false, message = "Failed to delete user" });
                }
            }
            catch (Exception ex)
            {
                LogAndIgnore(ex, "PermanentDeleteUser");
                return Json(new { success = false, message = "Error: " + ex.Message });
            }
        }

        [HttpGet("SendNotificationfromAdmin/{msg}")]
        public virtual Task<string> SendNotificationfromAdmin(string msg)
        {
            string rr = "";
            try
            {
                List<ProfileDataDTO> profileDataDTO = new List<ProfileDataDTO>();
                ProfileDataBL ikBL = new ProfileDataBL(configuration);
                profileDataDTO = ikBL.Getallusers();
                foreach (ProfileDataDTO pDataDTO in profileDataDTO)
                {
                   // if(pDataDTO.userid.Equals("1FosPZd1mWg3Ym107SeW4pV5dR13")) {
                        FireBaseService uc = new FireBaseService(configuration);
                        ProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                        PushNotificationDTO? profileDataDTO1 = iProfileDataBL.GetSingleProfileName(pDataDTO.userid);
                        string utoken = getToken(pDataDTO.userid);
                        if (profileDataDTO1 != null) {
                            msg = profileDataDTO1.sendtoname + " " + msg.ToString();
                            var a = uc.SendNotificationSingle(profileDataDTO1.username ?? "", msg, utoken);
                        }
                        rr = "Successful";
                   // }
                    /*FireBaseService uc = new FireBaseService(configuration);
                    ProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
                    PushNotificationDTO profileDataDTO1 = iProfileDataBL.GetSingleProfileName(pDataDTO.userid);
                    string utoken = getToken(pDataDTO.userid);
                    msg = profileDataDTO1.sendtoname + " " + msg;
                    var a = uc.SendNotificationSingle(profileDataDTO1.username, msg, utoken);
                    rr = "Successful";*/
                }
              
            }
            catch (Exception e)
            {
                rr = e.Message.ToString();
            }
            return Task.FromResult(rr);
        }

        [HttpPost("AddGalleryData")]
        public async Task<string> AddGalleryData([FromForm] AdminGalleryDTO galleryDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);

            var file = galleryDataDTO.file;
            string? path = null;
            string? spath = null;
           
            string? fileName = null;
            if (galleryDataDTO.file != null)
            {
                try
                {
                    galleryDataDTO.filetype = galleryDataDTO.file.ContentType;

                    var extension = "." + file!.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(gallerypath, fileName);
                    spath = Path.Combine(gallerydbpath, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(gallerypath);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + profileDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }

            if (spath != null)
                galleryDataDTO.filepath = spath;
            int result = iProfileDataBL.AddGalleryData(galleryDataDTO);
            //return fileName;
            //return Json(new { result = result1 });
            return result.ToString();
        }

        [HttpPost("UpdateGalleryData")]
        public async Task<string> UpdateGalleryData([FromForm] AdminGalleryDTO galleryDataDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);

            var file = galleryDataDTO.file;
            string? path = null;
            string? spath = null;
           
            string? fileName = null;
            if (galleryDataDTO.file != null)
            {
                try
                {
                    galleryDataDTO.filetype = galleryDataDTO.file.ContentType;

                    var extension = "." + file!.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                    fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                                                                      //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                    path = Path.Combine(gallerypath, fileName);
                    spath = Path.Combine(gallerydbpath, fileName);
                    path = path.Replace(subdomain, domain);

                    var dpath = Path.Combine(gallerypath);
                    // var dpath = Path.Combine("C:\\Inetpub\\vhosts\\bdvcard.com\\httpdocs\\", "userimages\\" + profileDataDTO.userid);
                    dpath = dpath.Replace(subdomain, domain);

                    if (!Directory.Exists(dpath))
                    {
                        Directory.CreateDirectory(dpath);
                    }
                    if (file.Length > 0)
                    {
                        using (var bits = new FileStream(path, FileMode.Create))
                        {
                            await file.CopyToAsync(bits);
                        }
                    }
                    else
                    {
                        spath = null;
                    }
                }
                catch (Exception e)
                {
                    return e.Message;
                }
            }

            if (spath != null)
                galleryDataDTO.filepath = spath;

            int result = iProfileDataBL.UpdateGalleryData(galleryDataDTO);
            return result.ToString();
        }

        [HttpPost("DeleteGalleryData")]
        public JsonResult DeleteGalleryData(AdminGalleryDTO adminGalleryDTO)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            int result = iProfileDataBL.DeleteGalleryData(adminGalleryDTO.gallery_id);
            return Json(result);
        }

        [HttpGet("GetallGalleryData/{imgtype}")]
        public JsonResult GetallGalleryData(string imgtype)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            List<AdminGalleryDTO> galleryDataDTO = iProfileDataBL.GetallGalleryData(imgtype);
            return Json(galleryDataDTO);
        }

       [HttpGet("GetallGalleryDatabypage/{imgtype}/{Offset}/{Limit}")]
        public JsonResult GetallGalleryDatabypage(string imgtype, string Offset, string Limit)
        {
            IProfileDataBL iProfileDataBL = new ProfileDataBL(configuration);
            List<AdminGalleryDTO> galleryDataDTO = iProfileDataBL.GetallGalleryDatabypage(imgtype, Offset, Limit);
            return Json(galleryDataDTO);
        }

        [HttpPost("AddserReportBlock")]
        public int AddserReportBlock([FromForm] UserReportBlockDataDTO userReportBlockDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.AddserReportBlock(userReportBlockDataDTO);
            return result;
        }

        [HttpPost("AddStoryReportBlock")]
        public int AddStoryReportBlock([FromForm] StoryReportBlockDataDTO storyReportBlockDataDTO)
        {
            IStoryDataBL iStoryDataBL = new StoryDataBL(configuration);
            int result = iStoryDataBL.AddStoryReportBlock(storyReportBlockDataDTO);
            return result;
        }

        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.admin_email))
                {
                    return BadRequest(new { success = false, message = "Email is required" });
                }

                IProfileDataBL profileBL = new ProfileDataBL(configuration);
                
                // Check if admin exists
                var admin = profileBL.GetAdminByEmail(request.admin_email);
                if (admin == null)
                {
                    // Don't reveal if email exists or not for security
                    return Ok(new { success = true, message = "If the email exists, a password reset link has been sent." });
                }

                // Generate reset token
                var resetToken = Guid.NewGuid().ToString("N") + DateTime.UtcNow.Ticks.ToString("x");
                var tokenExpiry = DateTime.UtcNow.AddHours(24);

                // Save token to database
                bool tokenSaved = profileBL.SavePasswordResetToken(request.admin_email, resetToken, tokenExpiry);
                if (!tokenSaved)
                {
                    return StatusCode(500, new { success = false, message = "Failed to generate reset token" });
                }

                // Send email
                var emailService = HttpContext.RequestServices.GetService(typeof(VTellTales_WA.API.Services.IEmailService)) 
                    as VTellTales_WA.API.Services.IEmailService;
                
                if (emailService != null)
                {
                    bool emailSent = await emailService.SendPasswordResetEmailAsync(request.admin_email, resetToken);
                    if (!emailSent)
                    {
                        _logger.LogWarning($"Failed to send password reset email to {request.admin_email}");
                    }
                }

                return Ok(new { 
                    success = true, 
                    message = "If the email exists, a password reset link has been sent. Please check your inbox." 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ForgotPassword");
                return StatusCode(500, new { success = false, message = "An error occurred processing your request" });
            }
        }

        [HttpPost("ResetPassword")]
        public IActionResult ResetPassword([FromBody] ResetPasswordRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.reset_token) || string.IsNullOrEmpty(request.new_password))
                {
                    return BadRequest(new { success = false, message = "Token and new password are required" });
                }

                if (request.new_password.Length < 6)
                {
                    return BadRequest(new { success = false, message = "Password must be at least 6 characters" });
                }

                IProfileDataBL profileBL = new ProfileDataBL(configuration);
                
                // Validate token and get admin email
                var adminEmail = profileBL.ValidateResetToken(request.reset_token);
                if (string.IsNullOrEmpty(adminEmail))
                {
                    return BadRequest(new { success = false, message = "Invalid or expired reset token" });
                }

                // Update password
                bool passwordUpdated = profileBL.UpdateAdminPassword(adminEmail, request.new_password);
                if (!passwordUpdated)
                {
                    return StatusCode(500, new { success = false, message = "Failed to update password" });
                }

                // Clear reset token
                profileBL.ClearPasswordResetToken(adminEmail);

                return Ok(new { 
                    success = true, 
                    message = "Password has been reset successfully. You can now login with your new password." 
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ResetPassword");
                return StatusCode(500, new { success = false, message = "An error occurred processing your request" });
            }
        }

        // User Authentication Endpoints
        [HttpPost("LoginUser")]
        public JsonResult LoginUser([FromBody] LoginRequestDTO loginRequest)
        {
            try
            {
                IProfileDataBL profileDataBL = new ProfileDataBL(configuration);
                var result = profileDataBL.LoginUser(loginRequest);
                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in LoginUser");
                return Json(new AuthResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during login."
                });
            }
        }

        [HttpPost("RegisterUser")]
        public JsonResult RegisterUser([FromBody] RegisterRequestDTO registerRequest)
        {
            try
            {
                IProfileDataBL profileDataBL = new ProfileDataBL(configuration);
                var result = profileDataBL.RegisterUser(registerRequest);
                return Json(result);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in RegisterUser");
                return Json(new AuthResponseDTO
                {
                    Success = false,
                    Message = "An error occurred during registration."
                });
            }
        }

        [HttpGet("CheckUserExists/{email}")]
        public JsonResult CheckUserExists(string email)
        {
            try
            {
                IProfileDataBL profileDataBL = new ProfileDataBL(configuration);
                bool exists = profileDataBL.CheckUserExists(email);
                return Json(new CheckUserExistsDTO { Exists = exists });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in CheckUserExists");
                return Json(new CheckUserExistsDTO { Exists = false });
            }
        }
    }

    // Request DTOs for password reset
    public class ForgotPasswordRequest
    {
        public string admin_email { get; set; } = "";
    }

    public class ResetPasswordRequest
    {
        public string reset_token { get; set; } = "";
        public string new_password { get; set; } = "";
    }
}
