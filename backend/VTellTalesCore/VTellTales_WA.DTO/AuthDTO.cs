using System.ComponentModel.DataAnnotations;

namespace VTellTales_WA.DTO
{
    public class LoginRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
    }
    
    public class RegisterRequestDTO
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2)]
        public string Name { get; set; } = string.Empty;
    }
    
    public class AuthResponseDTO
    {
        public bool Success { get; set; }
        public UserDTO? User { get; set; }
        public string? Token { get; set; }
        public string? Message { get; set; }
    }
    
    public class UserDTO
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? ProfileImg { get; set; }
    }
    
    public class CheckUserExistsDTO
    {
        public bool Exists { get; set; }
    }
}