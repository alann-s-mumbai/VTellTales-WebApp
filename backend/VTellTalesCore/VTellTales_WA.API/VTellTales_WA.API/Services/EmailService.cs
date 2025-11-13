using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace VTellTales_WA.API.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailService> _logger;
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly bool _enableSsl;

        public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
        {
            _configuration = configuration;
            _logger = logger;

            // Read SMTP settings from appsettings.json or environment variables
            _smtpHost = Environment.GetEnvironmentVariable("SMTP_HOST") 
                ?? _configuration["EmailSettings:SmtpHost"] 
                ?? "smtppro.zoho.in";
            
            _smtpPort = int.TryParse(
                Environment.GetEnvironmentVariable("SMTP_PORT") 
                ?? _configuration["EmailSettings:SmtpPort"], 
                out int port) ? port : 587;
            
            _smtpUsername = Environment.GetEnvironmentVariable("SMTP_USERNAME") 
                ?? _configuration["EmailSettings:SmtpUsername"] 
                ?? "";
            
            _smtpPassword = Environment.GetEnvironmentVariable("SMTP_PASSWORD") 
                ?? _configuration["EmailSettings:SmtpPassword"] 
                ?? "";
            
            _fromEmail = Environment.GetEnvironmentVariable("FROM_EMAIL") 
                ?? _configuration["EmailSettings:FromEmail"] 
                ?? _smtpUsername;
            
            _fromName = Environment.GetEnvironmentVariable("FROM_NAME") 
                ?? _configuration["EmailSettings:FromName"] 
                ?? "VTellTales";
            
            _enableSsl = bool.TryParse(
                Environment.GetEnvironmentVariable("SMTP_ENABLE_SSL") 
                ?? _configuration["EmailSettings:EnableSsl"], 
                out bool ssl) ? ssl : true;
        }

        public async Task<bool> SendPasswordResetEmailAsync(string toEmail, string resetToken)
        {
            try
            {
                // Construct reset URL - will work for both admin panel and web app
                var resetUrl = $"https://admin.vtelltales.com/reset-password?token={resetToken}";
                
                var subject = "Reset Your VTellTales Password";
                var htmlBody = $@"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }}
        .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }}
        .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }}
        .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
        .warning {{ background: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }}
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>🔒 Password Reset Request</h1>
        </div>
        <div class='content'>
            <p>Hello,</p>
            <p>We received a request to reset your VTellTales admin password. Click the button below to create a new password:</p>
            
            <center>
                <a href='{resetUrl}' class='button'>Reset Password</a>
            </center>
            
            <p>Or copy and paste this link into your browser:</p>
            <p style='word-break: break-all; background: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 5px;'>{resetUrl}</p>
            
            <div class='warning'>
                <strong>⚠️ Security Notice:</strong>
                <ul>
                    <li>This link will expire in <strong>24 hours</strong></li>
                    <li>If you didn't request this reset, please ignore this email</li>
                    <li>Never share this link with anyone</li>
                </ul>
            </div>
            
            <p>If you have any questions or concerns, please contact our support team.</p>
            
            <p>Best regards,<br>The VTellTales Team</p>
        </div>
        <div class='footer'>
            <p>© {DateTime.Now.Year} VTellTales. All rights reserved.</p>
            <p>This is an automated message, please do not reply.</p>
        </div>
    </div>
</body>
</html>";

                return await SendEmailAsync(toEmail, subject, htmlBody);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending password reset email to {toEmail}");
                return false;
            }
        }

        public async Task<bool> SendEmailAsync(string toEmail, string subject, string htmlBody)
        {
            try
            {
                if (string.IsNullOrEmpty(_smtpUsername) || string.IsNullOrEmpty(_smtpPassword))
                {
                    _logger.LogError("SMTP credentials not configured. Please set SMTP_USERNAME and SMTP_PASSWORD.");
                    return false;
                }

                using (var client = new SmtpClient(_smtpHost, _smtpPort))
                {
                    client.EnableSsl = _enableSsl;
                    client.UseDefaultCredentials = false;
                    client.Credentials = new NetworkCredential(_smtpUsername, _smtpPassword);
                    client.Timeout = 30000; // 30 seconds

                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress(_fromEmail, _fromName),
                        Subject = subject,
                        Body = htmlBody,
                        IsBodyHtml = true
                    };

                    mailMessage.To.Add(toEmail);

                    await client.SendMailAsync(mailMessage);
                    _logger.LogInformation($"Email sent successfully to {toEmail}");
                    return true;
                }
            }
            catch (SmtpException smtpEx)
            {
                _logger.LogError(smtpEx, $"SMTP error sending email to {toEmail}: {smtpEx.Message}");
                return false;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error sending email to {toEmail}: {ex.Message}");
                return false;
            }
        }
    }
}
