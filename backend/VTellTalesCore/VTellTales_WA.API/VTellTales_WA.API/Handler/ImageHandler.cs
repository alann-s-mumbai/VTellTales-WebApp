using Microsoft.AspNetCore.Http;
using System;
using System.Threading.Tasks;
using VTellTales_WA.API.Interface;

namespace VTellTales_WA.API.Handler
{
    public interface IImagehandler
    {
        Task<IAsyncResult> uploadImage(IFormFile file);
    }
    public class ImageHandler : IImagehandler
    {
        private readonly IImageWriter _imageWriter;

        public ImageHandler(IImageWriter imageWriter)
        {
            _imageWriter = imageWriter;
        }

        public Task<IAsyncResult> uploadImage(IFormFile file)
        {
            throw new NotImplementedException();
        }
    }
}
