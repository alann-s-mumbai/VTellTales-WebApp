-- Enhanced Profile Schema Migration
-- VTellTales Web App - v1.3.0
-- Date: 2025-11-14

USE VTellTales_Web_db;

-- Add new columns to usertbl table for enhanced profile
ALTER TABLE usertbl 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(100) AFTER name,
ADD COLUMN IF NOT EXISTS last_name VARCHAR(100) AFTER first_name,
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE AFTER email,
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) AFTER profileimg,
ADD COLUMN IF NOT EXISTS date_of_birth DATE AFTER avatar,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) AFTER date_of_birth,
ADD COLUMN IF NOT EXISTS facebook_account VARCHAR(200) AFTER phone_number,
ADD COLUMN IF NOT EXISTS instagram_account VARCHAR(200) AFTER facebook_account,
ADD COLUMN IF NOT EXISTS address TEXT AFTER instagram_account,
ADD COLUMN IF NOT EXISTS occupation VARCHAR(100) AFTER address,
ADD COLUMN IF NOT EXISTS user_type ENUM('regular', 'educator') DEFAULT 'regular' AFTER occupation,
ADD COLUMN IF NOT EXISTS is_email_verified TINYINT(1) DEFAULT 0 AFTER user_type,
ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255) AFTER is_email_verified,
ADD COLUMN IF NOT EXISTS email_verification_expires DATETIME AFTER email_verification_token,
ADD COLUMN IF NOT EXISTS is_profile_complete TINYINT(1) DEFAULT 0 AFTER email_verification_expires;

-- Create educator_details table for educator-specific information
CREATE TABLE IF NOT EXISTS educator_details (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
    school_name VARCHAR(200),
    school_address TEXT,
    school_phone VARCHAR(20),
    teaching_subjects TEXT,
    years_of_experience VARCHAR(20),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES usertbl(userid) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create email_verification_log table to track verification attempts
CREATE TABLE IF NOT EXISTS email_verification_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) CHARACTER SET latin1 COLLATE latin1_swedish_ci NOT NULL,
    token VARCHAR(255) NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_date DATETIME,
    ip_address VARCHAR(45),
    user_agent TEXT,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Update existing users to populate first_name and last_name from name field
UPDATE usertbl 
SET first_name = SUBSTRING_INDEX(name, ' ', 1),
    last_name = SUBSTRING_INDEX(name, ' ', -1)
WHERE name IS NOT NULL AND first_name IS NULL;

-- Set existing users as email verified (backward compatibility)
UPDATE usertbl 
SET is_email_verified = 1,
    is_profile_complete = CASE 
        WHEN name IS NOT NULL AND email IS NOT NULL THEN 1 
        ELSE 0 
    END
WHERE is_email_verified = 0;

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_username ON usertbl(username);

-- Create index on email_verification_token
CREATE INDEX IF NOT EXISTS idx_email_verification_token ON usertbl(email_verification_token);

SELECT 'Migration completed successfully!' as status;
