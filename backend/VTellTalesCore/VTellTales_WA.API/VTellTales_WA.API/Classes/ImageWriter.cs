using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using VTellTales_WA.API.Helper;
using VTellTales_WA.API.Interface;
using System;
using System.IO;
using System.Threading.Tasks;

namespace VTellTales_WA.API.Classes
{
    public class ImageWriter : IImageWriter
    {
        private readonly IConfiguration configuration;

        public ImageWriter(IConfiguration _configuration)
        {
            configuration = _configuration;
        }



        public async Task<string> uploadImage(IFormFile file)
        {
            if (CheckIfImageFile(file))
            {
                return await WriteFile(file);
            }

            return "Invalid image file";
        }

        /// <summary>
        /// Method to check if file is image file
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>
        private bool CheckIfImageFile(IFormFile file)
        {
            byte[] fileBytes;
            using (var ms = new MemoryStream())
            {
                file.CopyToAsync(ms);
                fileBytes = ms.ToArray();
            }


            return WriterHelper.GetImageFormat(fileBytes) != WriterHelper.ImageFormat.unknown;
        }

        /// <summary>
        /// Method to write file onto the disk
        /// </summary>
        /// <param name="file"></param>
        /// <returns></returns>        /// 

        /*  public string Index(IFormFile postedFiles)
          {
              string wwwPath = this.Environment.WebRootPath;
              string contentPath = this.Environment.ContentRootPath;
              string view="not uploaded";

              string path = Path.Combine(this.Environment.WebRootPath, "Uploads");
              if (!Directory.Exists(path))
              {
                  Directory.CreateDirectory(path);
              }

             // List<string> uploadedFiles = new List<string>();
             // foreach (IFormFile postedFile in postedFiles)
              //{
                  string fileName = Path.GetFileName(postedFiles.FileName);
                  using (FileStream stream = new FileStream(Path.Combine(path, fileName), FileMode.Create))
                  {
                      postedFile.CopyTo(stream);
                      uploadedFiles.Add(fileName);
                      view += string.Format("<b>{0}</b> uploaded.<br />", fileName);
                  }
              //}

              return view;
          }*/

        public async Task<string> WriteFile(IFormFile file)
        {
            string fileName;
            try
            {

                var extension = "." + file.FileName.Split('.')[file.FileName.Split('.').Length - 1];
                fileName = Guid.NewGuid().ToString() + extension; //Create a new Name for the file due to security reasons.
                //var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images", fileName);
                var path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\userimages", fileName);

                // filePath = "C:\\Inetpub\\vhosts\\socialindex.co.in\\httpdocs\\Userimage\\" + vr.UserId + unixTimestamp + ".jpg";
                //   filePath = "F:\\TSI\\2020\\PfxDemo.WebAPI\\PfxDemo.WebAPI\\Userimage\\" + vr.UserId + unixTimestamp + ".jpg"; ;
                // string convert = file.FileName.Replace("data:image/png;base64,", String.Empty);
                /* byte[] fileBytes;
                 using (var ms = new MemoryStream())
                 {
                     file.CopyToAsync(ms);
                     fileBytes = ms.ToArray();
                 }
                 File.WriteAllBytes(path, fileBytes);*/
                //var dpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\images");
                /*DirectoryInfo dInfo = new DirectoryInfo(Directory.GetCurrentDirectory());
                DirectorySecurity dSecurity = dInfo.GetAccessControl();
                dSecurity.AddAccessRule(new FileSystemAccessRule(new SecurityIdentifier(WellKnownSidType.WorldSid, null), FileSystemRights.FullControl, InheritanceFlags.ObjectInherit | InheritanceFlags.ContainerInherit, PropagationFlags.NoPropagateInherit, AccessControlType.Allow));
                dInfo.SetAccessControl(dSecurity);*/

                var dpath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot\\userimages");

                if (!Directory.Exists(dpath))
                {
                    Directory.CreateDirectory(dpath);
                }

                using (var bits = new FileStream(path, FileMode.Create))
                {
                    await file.CopyToAsync(bits);
                }
            }
            catch (Exception e)
            {
                return e.Message;
            }

            return fileName;
        }


    }
}


