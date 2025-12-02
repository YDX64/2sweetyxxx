-- =====================================================
-- Migration: Add Social Login Support (MySQL 8 Compatible)
-- =====================================================

-- Add social authentication columns to tbl_user
-- Using ALTER TABLE with individual statements

-- Check and add auth_type
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'auth_type';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN auth_type VARCHAR(20) DEFAULT ''email'' COMMENT ''Authentication type: email, google, facebook, apple'' AFTER password',
    'SELECT ''Column auth_type already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add google_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'google_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN google_id VARCHAR(255) NULL COMMENT ''Google OAuth user ID'' AFTER auth_type',
    'SELECT ''Column google_id already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add facebook_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'facebook_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN facebook_id VARCHAR(255) NULL COMMENT ''Facebook OAuth user ID'' AFTER google_id',
    'SELECT ''Column facebook_id already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add apple_id
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'apple_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN apple_id VARCHAR(255) NULL COMMENT ''Apple Sign In user ID'' AFTER facebook_id',
    'SELECT ''Column apple_id already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add social_profile_pic
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'social_profile_pic';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN social_profile_pic TEXT NULL COMMENT ''Profile picture URL from social login'' AFTER apple_id',
    'SELECT ''Column social_profile_pic already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add email_verified
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user' AND COLUMN_NAME = 'email_verified';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_user ADD COLUMN email_verified TINYINT(1) DEFAULT 0 COMMENT ''Email verification status'' AFTER email',
    'SELECT ''Column email_verified already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add indexes (ignore errors if already exist)
CREATE INDEX idx_auth_type ON tbl_user(auth_type);
CREATE INDEX idx_google_id ON tbl_user(google_id);
CREATE INDEX idx_facebook_id ON tbl_user(facebook_id);
CREATE INDEX idx_apple_id ON tbl_user(apple_id);

-- Add unique constraints (ignore errors if already exist)
ALTER TABLE tbl_user ADD CONSTRAINT unique_google_id UNIQUE (google_id);
ALTER TABLE tbl_user ADD CONSTRAINT unique_facebook_id UNIQUE (facebook_id);
ALTER TABLE tbl_user ADD CONSTRAINT unique_apple_id UNIQUE (apple_id);

-- Update existing users to have 'email' as auth_type
UPDATE tbl_user SET auth_type = 'email' WHERE auth_type IS NULL OR auth_type = '';

-- Add social login settings to tbl_setting
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_setting' AND COLUMN_NAME = 'google_client_id';

SET @sql = IF(@col_exists = 0,
    'ALTER TABLE tbl_setting ADD COLUMN google_client_id TEXT NULL COMMENT ''Google OAuth Client ID''',
    'SELECT ''Column google_client_id already exists'' as message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verify migration
SELECT 'Migration completed successfully!' as status;
SELECT COUNT(*) as social_login_columns_added FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = 'dating_db' AND TABLE_NAME = 'tbl_user'
AND COLUMN_NAME IN ('auth_type', 'google_id', 'facebook_id', 'apple_id', 'social_profile_pic', 'email_verified');
