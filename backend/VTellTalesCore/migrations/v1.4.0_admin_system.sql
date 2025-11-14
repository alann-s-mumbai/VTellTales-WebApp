-- Admin System Migration
-- VTellTales Web App - v1.4.0
-- Date: 2025-11-14

USE VTellTales_Web_db;

-- Create admin_users table
CREATE TABLE IF NOT EXISTS admin_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role ENUM('super_admin', 'moderator', 'support') DEFAULT 'support',
    is_active TINYINT(1) DEFAULT 1,
    last_login DATETIME,
    created_by INT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (created_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create admin_sessions table
CREATE TABLE IF NOT EXISTS admin_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    session_token VARCHAR(255) NOT NULL UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create admin_activity_log table
CREATE TABLE IF NOT EXISTS admin_activity_log (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(50),
    details TEXT,
    ip_address VARCHAR(45),
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_id (admin_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_date (created_date),
    FOREIGN KEY (admin_id) REFERENCES admin_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create system_settings table (for SMTP and other configs)
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT,
    is_encrypted TINYINT(1) DEFAULT 0,
    category VARCHAR(50) DEFAULT 'general',
    description TEXT,
    updated_by INT,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_setting_key (setting_key),
    INDEX idx_category (category),
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create email_templates table
CREATE TABLE IF NOT EXISTS email_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    template_key VARCHAR(100) NOT NULL UNIQUE,
    template_name VARCHAR(200) NOT NULL,
    subject VARCHAR(500),
    body_html TEXT,
    body_text TEXT,
    variables TEXT COMMENT 'JSON array of available variables',
    is_active TINYINT(1) DEFAULT 1,
    updated_by INT,
    created_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_date DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_template_key (template_key),
    INDEX idx_is_active (is_active),
    FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert default email templates
INSERT INTO email_templates (template_key, template_name, subject, body_html, body_text, variables) VALUES
('email_verification', 'Email Verification', 'Verify Your VTellTales Account', 
 '<h2>Welcome to VTellTales!</h2><p>Hi {{firstName}},</p><p>Please verify your email address by clicking the link below:</p><p><a href="{{verificationLink}}">Verify Email Address</a></p><p>This link will expire in 24 hours.</p><p>If you did not create an account, please ignore this email.</p>',
 'Welcome to VTellTales!\n\nHi {{firstName}},\n\nPlease verify your email address by visiting:\n{{verificationLink}}\n\nThis link will expire in 24 hours.\n\nIf you did not create an account, please ignore this email.',
 '["firstName", "lastName", "email", "verificationLink"]'),

('welcome_email', 'Welcome Email', 'Welcome to VTellTales!', 
 '<h2>Welcome to VTellTales, {{firstName}}!</h2><p>Your account has been verified successfully.</p><p>You can now complete your profile and start creating amazing stories!</p><p><a href="{{profileLink}}">Complete Your Profile</a></p>',
 'Welcome to VTellTales, {{firstName}}!\n\nYour account has been verified successfully.\n\nYou can now complete your profile and start creating amazing stories!\n\nComplete your profile: {{profileLink}}',
 '["firstName", "lastName", "email", "profileLink"]'),

('password_reset', 'Password Reset', 'Reset Your VTellTales Password', 
 '<h2>Password Reset Request</h2><p>Hi {{firstName}},</p><p>We received a request to reset your password. Click the link below to create a new password:</p><p><a href="{{resetLink}}">Reset Password</a></p><p>This link will expire in 1 hour.</p><p>If you did not request this, please ignore this email.</p>',
 'Password Reset Request\n\nHi {{firstName}},\n\nWe received a request to reset your password. Visit the link below:\n{{resetLink}}\n\nThis link will expire in 1 hour.\n\nIf you did not request this, please ignore this email.',
 '["firstName", "lastName", "email", "resetLink"]');

-- Insert default SMTP settings (empty, to be configured)
INSERT INTO system_settings (setting_key, category, description, is_encrypted) VALUES
('smtp_host', 'email', 'SMTP server hostname', 0),
('smtp_port', 'email', 'SMTP server port', 0),
('smtp_username', 'email', 'SMTP authentication username', 0),
('smtp_password', 'email', 'SMTP authentication password', 1),
('smtp_from_email', 'email', 'From email address', 0),
('smtp_from_name', 'email', 'From display name', 0),
('smtp_use_ssl', 'email', 'Use SSL/TLS connection', 0),
('site_name', 'general', 'Site name', 0),
('site_url', 'general', 'Site URL', 0),
('maintenance_mode', 'general', 'Maintenance mode enabled', 0);

-- Update default values
UPDATE system_settings SET setting_value = 'VTellTales' WHERE setting_key = 'site_name';
UPDATE system_settings SET setting_value = 'https://webapp.vtelltales.com' WHERE setting_key = 'site_url';
UPDATE system_settings SET setting_value = '0' WHERE setting_key = 'maintenance_mode';

SELECT 'Admin system migration completed successfully!' as status;
