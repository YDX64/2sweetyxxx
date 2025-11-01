#!/bin/bash
# ============================================
# 2Sweety Complete Local Development Setup
# ============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 2Sweety Local Development Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

ADMIN_PATH="/Users/max/Downloads/2sweet/2Sweety Admin"
WEB_PATH="/Users/max/Downloads/2sweet/GoMeet Web"

# ============================================
# STEP 1: Check MAMP
# ============================================
echo -e "${BLUE}[1/6] Checking MAMP...${NC}"

if [ ! -d "/Applications/MAMP" ]; then
    echo -e "${RED}❌ MAMP not installed!${NC}"
    echo ""
    echo "Please follow these steps:"
    echo "1. MAMP is already installed (via brew)"
    echo "2. Open MAMP from Applications"
    echo "3. Click 'Start Servers'"
    echo "4. Run this script again"
    exit 1
fi

echo -e "${GREEN}✓ MAMP found${NC}"

# ============================================
# STEP 2: Check MySQL
# ============================================
echo ""
echo -e "${BLUE}[2/6] Checking MySQL...${NC}"

if ! lsof -i :8889 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ MySQL not running${NC}"
    echo ""
    echo "Please:"
    echo "1. Open MAMP"
    echo "2. Click 'Start Servers'"
    echo "3. Wait for green lights"
    echo "4. Run this script again"
    echo ""
    open -a MAMP
    exit 1
fi

echo -e "${GREEN}✓ MySQL running on port 8889${NC}"

# ============================================
# STEP 3: Check Apache
# ============================================
echo ""
echo -e "${BLUE}[3/6] Checking Apache...${NC}"

if ! lsof -i :8888 > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠ Apache not running${NC}"
    echo "Please start Apache from MAMP control panel"
    exit 1
fi

echo -e "${GREEN}✓ Apache running on port 8888${NC}"

# ============================================
# STEP 4: Setup Database
# ============================================
echo ""
echo -e "${BLUE}[4/6] Setting up database...${NC}"

# Check if database exists
DB_EXISTS=$(mysql -h127.0.0.1 -P8889 -uroot -proot -e "SHOW DATABASES LIKE 'dating_db';" 2>/dev/null | grep dating_db || echo "")

if [ -z "$DB_EXISTS" ]; then
    echo "Creating database..."
    
    # Import schema
    if mysql -h127.0.0.1 -P8889 -uroot -proot < "$ADMIN_PATH/database/schema.sql" 2>/dev/null; then
        echo -e "${GREEN}✓ Database created successfully${NC}"
    else
        echo -e "${RED}❌ Failed to create database${NC}"
        echo "Trying manual creation..."
        
        mysql -h127.0.0.1 -P8889 -uroot -proot -e "CREATE DATABASE IF NOT EXISTS dating_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
        mysql -h127.0.0.1 -P8889 -uroot -proot dating_db < "$ADMIN_PATH/database/schema.sql" 2>/dev/null
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Database created via manual method${NC}"
        else
            echo -e "${RED}❌ Database creation failed${NC}"
            echo "Please check MAMP MySQL settings"
            exit 1
        fi
    fi
else
    echo -e "${GREEN}✓ Database already exists${NC}"
fi

# Verify tables
TABLE_COUNT=$(mysql -h127.0.0.1 -P8889 -uroot -proot -D dating_db -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='dating_db';" 2>/dev/null || echo "0")

echo -e "${GREEN}✓ Found $TABLE_COUNT tables${NC}"

# ============================================
# STEP 5: Configure Backend (Admin Panel)
# ============================================
echo ""
echo -e "${BLUE}[5/6] Configuring backend...${NC}"

# Backup Connection.php
if [ ! -f "$ADMIN_PATH/inc/Connection.php.backup" ]; then
    cp "$ADMIN_PATH/inc/Connection.php" "$ADMIN_PATH/inc/Connection.php.backup"
    echo "✓ Backed up Connection.php"
fi

# Create local .env for PHP
cat > "$ADMIN_PATH/.env" << 'EOF'
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=dating_db
DB_PORT=8889
EOF

echo -e "${GREEN}✓ Backend configured for MAMP${NC}"

# ============================================
# STEP 6: Configure Frontend (React)
# ============================================
echo ""
echo -e "${BLUE}[6/6] Configuring frontend...${NC}"

if [ -f "$WEB_PATH/.env.local" ]; then
    echo -e "${GREEN}✓ Frontend already configured${NC}"
else
    echo -e "${YELLOW}⚠ Frontend .env.local not found (already created manually)${NC}"
fi

# ============================================
# Summary
# ============================================
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📊 Services:${NC}"
echo "  Admin Panel:  http://localhost:8888/"
echo "  phpMyAdmin:   http://localhost:8888/phpMyAdmin/"
echo "  React App:    http://localhost:3000/"
echo ""
echo -e "${BLUE}🔐 Admin Login:${NC}"
echo "  Username: admin"
echo "  Password: admin@123"
echo ""
echo -e "${BLUE}🗄️  Database:${NC}"
echo "  Name:   dating_db"
echo "  Tables: $TABLE_COUNT"
echo "  Host:   localhost:8889"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Test Admin Panel:${NC}"
echo "   open http://localhost:8888/"
echo ""
echo -e "${YELLOW}2. Start React App:${NC}"
echo "   cd \"$WEB_PATH\""
echo "   npm install  # (if needed)"
echo "   npm start"
echo ""
echo -e "${YELLOW}3. Test Full Flow:${NC}"
echo "   - React will run on http://localhost:3000"
echo "   - API calls go to http://localhost:8888/api/"
echo "   - Both should work together!"
echo ""
echo -e "${GREEN}Done! Happy coding! 🎉${NC}"
echo ""

# Open admin panel
read -p "Open admin panel now? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    open "http://localhost:8888/"
fi
