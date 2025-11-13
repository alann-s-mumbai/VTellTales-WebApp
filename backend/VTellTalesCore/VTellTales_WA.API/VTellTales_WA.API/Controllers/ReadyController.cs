using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using MySqlConnector;
using System;
using System.IO;
using System.Threading;
using System.Threading.Tasks;

namespace MyStoryBook.API.Controllers
{
    [ApiController]
    [Route("ready")]
    public class ReadyController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public ReadyController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public async Task<IActionResult> Get(CancellationToken ct)
        {
            // Check DB connectivity
            string? connStr = _configuration["ConnectionSettings:StoryBookDB"];
            try
            {
                if (string.IsNullOrWhiteSpace(connStr))
                {
                    return StatusCode(503, new { status = "degraded", db = "missing_connection_string" });
                }
                using var con = new MySqlConnection(connStr);
                await con.OpenAsync(ct);
            }
            catch (Exception ex)
            {
                return StatusCode(503, new { status = "degraded", db = ex.GetType().Name });
            }

            // Check Firebase credentials presence on disk
            string credentialPath = Path.Combine(Directory.GetCurrentDirectory(), "vtelltalesauth.json");
            bool credsPresent = System.IO.File.Exists(credentialPath);

            return Ok(new { status = "ok", db = "ok", firebaseCreds = credsPresent ? "present" : "missing" });
        }
    }
}

