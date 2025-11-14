# Enhanced Profile System Implementation Guide

## Overview
This document outlines the implementation of the enhanced profile system with email verification and educator support.

## Database Migration

Run the SQL migration script:
```bash
mysql -u root -p VTellTales_Web_db < backend/VTellTalesCore/migrations/v1.3.0_enhanced_profiles.sql
```

## Backend Changes Required

### 1. Update ProfileDataBL.cs

Add methods for:
- `CheckUsernameAvailability(string username)` - Check if username is available
- `CompleteProfile(UpdateProfileDTO profileData)` - Complete user profile
- `GenerateEmailVerificationToken(string userId)` - Generate verification token
- `VerifyEmail(string token)` - Verify email with token
- `ResendVerificationEmail(string email)` - Resend verification email

### 2. Update ProfileDataDL.cs

Add database methods for:
- Username uniqueness check
- Profile update with all new fields
- Educator details insert/update
- Email verification token generation and validation
- Email verification log tracking

### 3. Update StoryBookController.cs

Add endpoints:
```csharp
[HttpGet("CheckUsername/{username}")]
[HttpPost("CompleteProfile")]
[HttpPost("VerifyEmail")]
[HttpPost("ResendVerificationEmail")]
[HttpPost("ChangePassword")]
```

### 4. Update Email Service

Add email templates for:
- Email verification
- Welcome email after verification
- Password change confirmation

## Frontend Changes Required

### 1. Update Registration Flow

**RegisterPage.tsx** changes:
- Collect firstName and lastName separately (not combined name)
- Add user type selection (regular/educator)
- Show "Check your email" message after registration
- Redirect to /verify-email instead of /complete-profile

### 2. New Pages Added

- **VerifyEmailPage.tsx** ✓ (Created)
- **CompleteProfilePageV2.tsx** ✓ (Created)

### 3. Update App.tsx Routes

```tsx
<Route path="/verify-email" element={<VerifyEmailPage />} />
<Route path="/complete-profile" element={<CompleteProfilePageV2 />} />
```

### 4. Update ProtectedRoute.tsx

Add check for email verification:
```tsx
if (!user.IsEmailVerified) {
  return <Navigate to="/verify-email" />
}

if (!user.IsProfileComplete) {
  return <Navigate to="/complete-profile" />
}
```

### 5. Update API Service

Add functions:
```tsx
checkUsernameAvailability(username: string)
completeProfile(profileData: CompleteProfileFormData)
verifyEmail(token: string)
resendVerificationEmail(email: string)
changePassword(userId: string, currentPassword: string, newPassword: string)
```

## Workflow

1. **User Registration**
   - User fills firstName, lastName, email, password, userType
   - Backend creates user with `is_email_verified = 0`, `is_profile_complete = 0`
   - Backend generates verification token and sends email
   - User redirected to /verify-email

2. **Email Verification**
   - User clicks link in email with token parameter
   - Frontend sends token to /api/storyapi/StoryBook/VerifyEmail
   - Backend validates token and sets `is_email_verified = 1`
   - User redirected to /complete-profile

3. **Profile Completion**
   - User fills comprehensive profile form
   - If educator: additional school details required
   - Username availability checked in real-time
   - Backend saves profile and sets `is_profile_complete = 1`
   - User redirected to /dashboard

4. **Access Control**
   - Unverified emails → forced to /verify-email
   - Verified but incomplete profiles → forced to /complete-profile
   - Complete profiles → access to full application

## Testing Checklist

- [ ] Registration creates user with unverified status
- [ ] Verification email sent with valid token
- [ ] Email verification link works
- [ ] Token expiration handled (24 hours)
- [ ] Profile completion form validates all required fields
- [ ] Username uniqueness enforced
- [ ] Educator fields shown only for educators
- [ ] Session persists through workflow
- [ ] Password change works
- [ ] Social media links validated
- [ ] Date of birth accepts valid dates only

## Deployment Steps

1. Run database migration
2. Update backend code (BL, DL, Controller)
3. Update email service
4. Build and deploy backend
5. Update frontend pages
6. Build and deploy frontend
7. Test complete workflow
8. Update user documentation

## Future Enhancements

- Avatar upload support
- Email template customization
- SMS verification option
- Two-factor authentication
- Social login integration
- Bulk educator onboarding
