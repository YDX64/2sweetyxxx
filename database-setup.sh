#!/bin/bash

# =====================================================
# 2Sweety Database Setup Script
# Automated database import and configuration
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
MYSQL_CONTAINER="2sweety-mysql"
DB_NAME="gommet"
DB_USER="gomeet_user"
SQL_FILE="mobile-app/Gommet Database 1.5/Gomeet.sql"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   2Sweety Database Setup Script       ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo ""

# Function to print status messages
print_status() {
    echo -e "${BLUE}[*]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running from correct directory
if [ ! -f "$SQL_FILE" ]; then
    print_error "SQL file not found: $SQL_FILE"
    print_warning "Please run this script from the 2sweet directory:"
    echo "  cd /Users/max/Downloads/2sweet"
    echo "  ./database-setup.sh"
    exit 1
fi

# Get database credentials
echo ""
print_status "Database Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

read -p "MySQL Root Password: " -s MYSQL_ROOT_PASSWORD
echo ""
read -p "Database User Password (gomeet_user): " -s DB_PASSWORD
echo ""
echo ""

# Verify MySQL container is running
print_status "Checking MySQL container status..."
if ! docker ps | grep -q "$MYSQL_CONTAINER"; then
    print_error "MySQL container '$MYSQL_CONTAINER' is not running!"
    print_warning "Please start the MySQL container in Coolify first."
    exit 1
fi
print_success "MySQL container is running"

# Copy SQL file to container
print_status "Copying SQL file to container..."
docker cp "$SQL_FILE" "$MYSQL_CONTAINER:/tmp/gomeet.sql"
if [ $? -eq 0 ]; then
    print_success "SQL file copied successfully"
else
    print_error "Failed to copy SQL file"
    exit 1
fi

# Create database if not exists
print_status "Creating database..."
docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE DATABASE IF NOT EXISTS $DB_NAME CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EOF
if [ $? -eq 0 ]; then
    print_success "Database created: $DB_NAME"
else
    print_error "Failed to create database"
    exit 1
fi

# Create database user
print_status "Creating database user..."
docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$MYSQL_ROOT_PASSWORD" <<EOF
CREATE USER IF NOT EXISTS '$DB_USER'@'%' IDENTIFIED BY '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'%';
FLUSH PRIVILEGES;
EOF
if [ $? -eq 0 ]; then
    print_success "Database user created: $DB_USER"
else
    print_error "Failed to create database user"
    exit 1
fi

# Import SQL file
print_status "Importing database schema and data..."
echo "This may take a few minutes..."
docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME" < <(docker exec -i "$MYSQL_CONTAINER" cat /tmp/gomeet.sql)
if [ $? -eq 0 ]; then
    print_success "Database import completed successfully"
else
    print_error "Failed to import database"
    exit 1
fi

# Verify import
print_status "Verifying database import..."
TABLE_COUNT=$(docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D "$DB_NAME" -e "SHOW TABLES;" | wc -l)
TABLE_COUNT=$((TABLE_COUNT - 1))  # Subtract header row

if [ $TABLE_COUNT -ge 24 ]; then
    print_success "Verification passed: $TABLE_COUNT tables found"
else
    print_warning "Verification warning: Expected 24 tables, found $TABLE_COUNT"
fi

# Update admin password
print_status "Updating admin password..."
echo ""
read -p "Enter new admin panel password: " -s NEW_ADMIN_PASSWORD
echo ""

docker exec -i "$MYSQL_CONTAINER" mysql -u root -p"$MYSQL_ROOT_PASSWORD" -D "$DB_NAME" <<EOF
UPDATE admin SET password = '$NEW_ADMIN_PASSWORD' WHERE username = 'admin';
EOF

if [ $? -eq 0 ]; then
    print_success "Admin password updated"
else
    print_warning "Failed to update admin password (you can do this manually later)"
fi

# Clean up
print_status "Cleaning up temporary files..."
docker exec -i "$MYSQL_CONTAINER" rm /tmp/gomeet.sql
print_success "Cleanup completed"

# Display connection info
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║            Database Setup Completed Successfully!          ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Database Credentials:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  Host:     ${GREEN}$MYSQL_CONTAINER${NC} (internal Docker network)"
echo -e "  Database: ${GREEN}$DB_NAME${NC}"
echo -e "  User:     ${GREEN}$DB_USER${NC}"
echo -e "  Password: ${GREEN}[stored in your password manager]${NC}"
echo ""
echo -e "${BLUE}Admin Panel Credentials:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  URL:      ${GREEN}https://api.2sweety.com/${NC}"
echo -e "  Username: ${GREEN}admin${NC}"
echo -e "  Password: ${GREEN}[the password you just set]${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo "  1. Save these credentials in a password manager"
echo "  2. Update backend environment variables in Coolify:"
echo "     DB_HOST=$MYSQL_CONTAINER"
echo "     DB_NAME=$DB_NAME"
echo "     DB_USER=$DB_USER"
echo "     DB_PASSWORD=[your-password]"
echo "  3. Restart backend service after updating variables"
echo "  4. Test connection: curl https://api.2sweety.com/api/health.php"
echo ""
echo -e "${GREEN}Next Steps:${NC}"
echo "  → Deploy backend PHP application"
echo "  → Configure API keys in admin panel"
echo "  → Deploy React frontend"
echo ""
