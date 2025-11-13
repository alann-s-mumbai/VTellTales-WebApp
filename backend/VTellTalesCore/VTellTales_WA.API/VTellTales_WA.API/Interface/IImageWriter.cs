using Microsoft.AspNetCore.Http;
using System.Threading.Tasks;

namespace VTellTales_WA.API.Interface
{

    public interface IImageWriter
    {
        Task<string> uploadImage(IFormFile file);
    }
}
