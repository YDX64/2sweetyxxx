#!/bin/bash
# =====================================================
# 2Sweety Database Setup Script
# =====================================================
# This script sets up the MySQL database for production
# Usage: ./database-setup.sh
# =====================================================

set -e  # Exit on any error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =====================================================
# Database Configuration
# =====================================================

# Read environment variables or use defaults
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-dating_db}"
DB_USER="${DB_USER:-dating_user}"
DB_PASSWORD="${DB_PASSWORD:-}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:-}"

# SQL file location
SQL_FILE="/path/to/Gomeet.sql"  # Update this path in Coolify

# =====================================================
# Validation
# =====================================================

print_info "Starting 2Sweety Database Setup..."
echo ""

# Check if running as root or with mysql access
if [ -z "$DB_ROOT_PASSWORD" ]; then
    print_error "DB_ROOT_PASSWORD is required for initial setup"
    print_info "Please set environment variable: DB_ROOT_PASSWORD"
    exit 1
fi

if [ -z "$DB_PASSWORD" ]; then
    print_error "DB_PASSWORD is required for application user"
    print_info "Please set environment variable: DB_PASSWORD"
    exit 1
fi

if [ ! -f "$SQL_FILE" ]; then
    print_warning "SQL file not found at: $SQL_FILE"
    print_info "Checking alternative locations..."

    # Try to find SQL file
    POSSIBLE_PATHS=(
        "../mobile-app/Gommet Database 1.5/Gomeet.sql"
        "./Gomeet.sql"
        "/app/Gomeet.sql"
    )

    for path in "${POSSIBLE_PATHS[@]}"; do
        if [ -f "$path" ]; then
            SQL_FILE="$path"
            print_success "Found SQL file at: $SQL_FILE"
            break
        fi
    done

    if [ ! -f "$SQL_FILE" ]; then
        print_error "Could not find SQL file. Please check the path."
        exit 1
    fi
fi

# =====================================================
# MySQL Connection Test
# =====================================================

print_info "Testing MySQL connection..."

if ! mysql -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$DB_ROOT_PASSWORD" -e "SELECT 1;" > /dev/null 2>&1; then
    print_error "Cannot connect to MySQL server"
    print_info "Host: $DB_HOST:$DB_PORT"
    print_info "Please check your MySQL server and credentials"
    exit 1
fi

print_success "MySQL connection successful"
echo ""

# =====================================================
# Database Creation
# =====================================================

print_info "Creating database: $DB_NAME"

mysql -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$DB_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS \`$DB_NAME\`
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
EOF

print_success "Database created: $DB_NAME"
echo ""

# =====================================================
# User Creation
# =====================================================

print_info "Creating database user: $DB_USER"

mysql -h"$DB_HOST" -P"$DB_PORT" -uroot -p"$DB_ROOT_PASSWORD" <<EOF
-- Create user if not exists
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';

-- Grant privileges
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'%';

-- Also create user for localhost
CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON \`$DB_NAME\`.* TO '$DB_USER'@'localhost';

-- Flush privileges
FLUSH PRIVILEGES;
EOF

print_success "User created with full privileges: $DB_USER"
echo ""

# =====================================================
# Import SQL File
# =====================================================

print_info "Importing database schema from: $SQL_FILE"
print_warning "This may take a few minutes for large databases..."

# Import SQL file
if mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < "$SQL_FILE"; then
    print_success "Database schema imported successfully"
else
    print_error "Failed to import database schema"
    exit 1
fi

echo ""

# =====================================================
# Verify Import
# =====================================================

print_info "Verifying database tables..."

TABLE_COUNT=$(mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='$DB_NAME';")

print_success "Found $TABLE_COUNT tables in database"

# List main tables
print_info "Main tables:"
mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" -e "SHOW TABLES;" | grep -v "Tables_in_" | head -10

if [ "$TABLE_COUNT" -gt 20 ]; then
    print_info "... and $(($TABLE_COUNT - 10)) more tables"
fi

echo ""

# =====================================================
# Update Admin Password (Optional)
# =====================================================

if [ ! -z "$ADMIN_PASSWORD" ]; then
    print_info "Updating admin password..."

    # Hash password (MD5 - you should upgrade to bcrypt in production)
    HASHED_PASSWORD=$(echo -n "$ADMIN_PASSWORD" | md5sum | cut -d' ' -f1)

    mysql -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" <<EOF
UPDATE admin SET password = '$HASHED_PASSWORD' WHERE id = 1;
EOF

    print_success "Admin password updated"
fi

echo ""

# =====================================================
# Database Configuration Summary
# =====================================================

print_success "==================================================="
print_success "Database Setup Complete!"
print_success "==================================================="
echo ""
print_info "Database Details:"
echo "  Host:     $DB_HOST:$DB_PORT"
echo "  Database: $DB_NAME"
echo "  User:     $DB_USER"
echo "  Tables:   $TABLE_COUNT"
echo ""
print_info "Connection String for PHP:"
echo "  mysqli_connect('$DB_HOST', '$DB_USER', '***', '$DB_NAME', $DB_PORT);"
echo ""

# =====================================================
# Environment Variables for Backend
# =====================================================

print_info "Add these to your Coolify environment variables:"
echo ""
echo "DB_HOST=$DB_HOST"
echo "DB_PORT=$DB_PORT"
echo "DB_NAME=$DB_NAME"
echo "DB_USER=$DB_USER"
echo "DB_PASSWORD=***hidden***"
echo ""

print_warning "IMPORTANT: Update inc/Connection.php with these credentials!"
echo ""

# =====================================================
# Security Recommendations
# =====================================================

print_warning "Security Recommendations:"
echo "1. Change default admin password (admin@123)"
echo "2. Use strong passwords for database users"
echo "3. Enable SSL/TLS for MySQL connections in production"
echo "4. Restrict database user to specific IP if possible"
echo "5. Regularly backup your database"
echo ""

print_success "Setup script completed successfully!"
