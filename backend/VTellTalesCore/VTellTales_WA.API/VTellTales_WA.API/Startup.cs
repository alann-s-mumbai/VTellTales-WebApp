using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using MySqlConnector;
using Newtonsoft.Json.Serialization;
using System.Data.Common;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace VTellTales_WA.API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            DbProviderFactories.RegisterFactory("MySqlConnector", MySqlConnectorFactory.Instance);

            var dataProtectionPath = Configuration["DataProtection:KeysDirectory"]
                                     ?? Environment.GetEnvironmentVariable("DATA_PROTECTION_KEYS_PATH")
                                     ?? "/var/www/vtelltales/shared/keys";

            try
            {
                if (!string.IsNullOrWhiteSpace(dataProtectionPath))
                {
                    Directory.CreateDirectory(dataProtectionPath);
                    services
                        .AddDataProtection()
                        .PersistKeysToFileSystem(new DirectoryInfo(dataProtectionPath))
                        .SetApplicationName("VTellTales");
                }
            }
            catch (Exception ex)
            {
                // swallow to avoid startup failure but capture log later via hosted service logger
                Console.WriteLine($"Warning: unable to initialize data protection keys at '{dataProtectionPath}': {ex.Message}");
            }

            // CORS configuration from appsettings
            var allowedOrigins = Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();
            var isDev = string.Equals(Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT"), "Development", StringComparison.OrdinalIgnoreCase);
            services.AddCors(options =>
            {
                options.AddPolicy("Default", builder =>
                {
                    if (isDev)
                    {
                        builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                    }
                    else if (allowedOrigins.Length > 0)
                    {
                        builder.WithOrigins(allowedOrigins)
                               .AllowAnyHeader()
                               .AllowCredentials()
                               .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH");
                    }
                    else
                    {
                        builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
                    }
                });
            });

            // JSON serializer
            services.AddControllersWithViews()
                .AddNewtonsoftJson(options =>
                    options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore)
                .AddNewtonsoftJson(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver());

            services.AddControllers();

            // Add session support
            services.AddDistributedMemoryCache();
            services.AddSession(options =>
            {
                options.IdleTimeout = TimeSpan.FromDays(7); // Session timeout
                options.Cookie.HttpOnly = true;
                options.Cookie.IsEssential = true;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.Name = ".VTellTales.Session";
            });

            // Register Email Service
            services.AddScoped<VTellTales_WA.API.Services.IEmailService, VTellTales_WA.API.Services.EmailService>();

            // Initialize Firebase on background startup
            services.AddHostedService<FirebaseInitializer>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // Forwarded headers (for reverse proxy)
            app.UseForwardedHeaders(new ForwardedHeadersOptions
            {
                ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
            });

            // Optional base path
            var basePath = Configuration["Api:BasePath"];
            if (!string.IsNullOrWhiteSpace(basePath))
            {
                app.UsePathBase(new PathString(basePath));
            }

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("Default");

            app.UseSession();

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }


    }

    // Hosted service to initialize Firebase Admin SDK
    public class FirebaseInitializer : IHostedService
    {
        private readonly IWebHostEnvironment _env;

        public FirebaseInitializer(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task StartAsync(System.Threading.CancellationToken cancellationToken)
        {
            try
            {
                string credentialPath = Path.Combine(System.IO.Directory.GetCurrentDirectory(), "vtelltalesauth.json");
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialPath);
                var credential = await GoogleCredential.GetApplicationDefaultAsync(cancellationToken);
                FirebaseApp.Create(new AppOptions()
                {
                    Credential = credential,
                });
            }
            catch
            {
                // Swallow exceptions on startup to avoid crashing the host if credentials are missing
            }
        }

        public Task StopAsync(System.Threading.CancellationToken cancellationToken) => Task.CompletedTask;
    }
}
