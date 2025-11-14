using System;
using System.ComponentModel.DataAnnotations;

namespace VTellTales_WA.DTO
{
    public class ProfileDTO
    {
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [MinLength(2)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [MinLength(3)]
        public string Username { get; set; } = string.Empty;
        
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FacebookAccount { get; set; }
        public string? InstagramAccount { get; set; }
        public string? Address { get; set; }
        public string? Occupation { get; set; }
        
        // User type: "regular" or "educator"
        public string UserType { get; set; } = "regular";
        
        // Educator-specific fields
        public string? SchoolName { get; set; }
        public string? SchoolAddress { get; set; }
        public string? SchoolPhone { get; set; }
        public string? TeachingSubjects { get; set; }
        public string? YearsOfExperience { get; set; }
        
        // Account status
        public bool IsEmailVerified { get; set; } = false;
        public bool IsProfileComplete { get; set; } = false;
        public DateTime CreatedDate { get; set; }
        public DateTime? UpdatedDate { get; set; }
    }
    
    public class UpdateProfileDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Username { get; set; }
        public string? Avatar { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? PhoneNumber { get; set; }
        public string? FacebookAccount { get; set; }
        public string? InstagramAccount { get; set; }
        public string? Address { get; set; }
        public string? Occupation { get; set; }
        public string? UserType { get; set; }
        
        // Educator fields (embedded)
        public string? SchoolName { get; set; }
        public string? SchoolAddress { get; set; }
        public string? SchoolPhone { get; set; }
        public string? TeachingSubjects { get; set; }
        public string? YearsOfExperience { get; set; }
    }

    // Separate DTO for educator details table
    public class EducatorDetailsDTO
    {
        public string? SchoolName { get; set; }
        public string? SchoolAddress { get; set; }
        public string? SchoolPhone { get; set; }
        public string? TeachingSubjects { get; set; }
        public string? YearsOfExperience { get; set; }
    }
    
    public class EmailVerificationDTO
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        public string? Email { get; set; }
    }
    
    public class ChangePasswordDTO
    {
        [Required]
        public string UserId { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string CurrentPassword { get; set; } = string.Empty;
        
        [Required]
        [MinLength(6)]
        public string NewPassword { get; set; } = string.Empty;
    }
    
    public class CheckUsernameDTO
    {
        [Required]
        public string Username { get; set; } = string.Empty;
    }
}

