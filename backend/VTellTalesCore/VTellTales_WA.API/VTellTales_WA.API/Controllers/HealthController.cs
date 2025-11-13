using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using VTellTales_WA.DL;
using System;

namespace VTellTales_WA.API.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public HealthController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpGet]
        public IActionResult Get()
        {
            // Basic service health
            var response = new
            {
                status = "ok",
                database = new { status = "unknown" }
            };

            var connString = _configuration["ConnectionSettings:StoryBookDB"];
            if (string.IsNullOrWhiteSpace(connString))
            {
                // No connection string configured — treat as degraded
                return StatusCode(503, new { status = "degraded", reason = "missing_connection_string" });
            }

            try
            {
                // MySqlDatabase opens the connection in its constructor.
                using (var db = new MySqlDatabase(connString))
                {
                    using (var cmd = db.Connection.CreateCommand())
                    {
                        cmd.CommandText = "SELECT 1";
                        var val = cmd.ExecuteScalar();
                    }
                }

                return Ok(new { status = "ok", database = new { status = "ok" } });
            }
            catch (Exception ex)
            {
                // Return service degraded if DB cannot be reached
                return StatusCode(503, new { status = "degraded", database = new { status = "unreachable", error = ex.Message } });
            }
        }
    }
}

