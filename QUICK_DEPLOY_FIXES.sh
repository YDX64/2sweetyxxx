#!/bin/bash
# Quick Deployment Fix Script for 2Sweety Dating App
# Run this on your production server: ssh root@api.2sweety.com
# Then: bash QUICK_DEPLOY_FIXES.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

APP_CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"
DB_CONTAINER="z8co40wo4sc8ow4wsog4cw44"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}2Sweety Dating App - Quick Fix Script${NC}"
echo -e "${GREEN}========================================${NC}\n"

# Function to print status
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    print_error "Please run as root (use sudo)"
    exit 1
fi

# 1. CHECK CONTAINER STATUS
echo -e "\n${YELLOW}Step 1: Checking Container Status${NC}"
if docker ps | grep -q $APP_CONTAINER; then
    print_status "App container is running"
else
    print_error "App container is NOT running!"
    echo "Starting container..."
    docker start $APP_CONTAINER
fi

if docker ps | grep -q $DB_CONTAINER; then
    print_status "Database container is running"
else
    print_error "Database container is NOT running!"
    echo "Starting container..."
    docker start $DB_CONTAINER
fi

# 2. CHECK CRITICAL ENVIRONMENT VARIABLES
echo -e "\n${YELLOW}Step 2: Checking Environment Variables${NC}"
echo "Checking for placeholder values..."

FIREBASE_KEY=$(docker exec $APP_CONTAINER printenv FIREBASE_API_KEY 2>/dev/null || echo "NOT_SET")
ONESIGNAL_ID=$(docker exec $APP_CONTAINER printenv ONESIGNAL_APP_ID 2>/dev/null || echo "NOT_SET")
AGORA_ID=$(docker exec $APP_CONTAINER printenv AGORA_APP_ID 2>/dev/null || echo "NOT_SET")

if [[ "$FIREBASE_KEY" == "NOT_SET" ]] || [[ "$FIREBASE_KEY" == *"YOUR"* ]] || [[ "$FIREBASE_KEY" == *"PLACEHOLDER"* ]]; then
    print_error "Firebase credentials NOT configured properly"
    echo "  You MUST configure Firebase in Coolify Environment Variables"
else
    print_status "Firebase appears configured"
fi

if [[ "$ONESIGNAL_ID" == "NOT_SET" ]] || [[ "$ONESIGNAL_ID" == *"YOUR"* ]]; then
    print_error "OneSignal NOT configured - push notifications won't work"
else
    print_status "OneSignal appears configured"
fi

if [[ "$AGORA_ID" == "NOT_SET" ]] || [[ "$AGORA_ID" == *"YOUR"* ]]; then
    print_error "Agora NOT configured - video/audio calls won't work"
else
    print_status "Agora appears configured"
fi

# 3. SETUP DATABASE BACKUPS
echo -e "\n${YELLOW}Step 3: Setting Up Database Backups${NC}"
mkdir -p /root/db-backups

cat > /root/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/db-backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="z8co40wo4sc8ow4wsog4cw44"
DB_NAME="gomeet"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Get MySQL root password from container
MYSQL_ROOT_PASSWORD=$(docker exec $CONTAINER printenv MYSQL_ROOT_PASSWORD)

# Create backup
docker exec $CONTAINER mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  --single-transaction \
  --quick \
  --lock-tables=false \
  $DB_NAME 2>/dev/null | gzip > $BACKUP_DIR/gomeet_${DATE}.sql.gz

# Delete old backups
find $BACKUP_DIR -name "gomeet_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: gomeet_${DATE}.sql.gz"
EOF

chmod +x /root/backup-database.sh
print_status "Database backup script created at /root/backup-database.sh"

# Test backup
echo "Testing backup..."
/root/backup-database.sh
if [ $? -eq 0 ]; then
    print_status "Backup test successful"
else
    print_error "Backup test failed - check MySQL credentials"
fi

# 4. SETUP CRITICAL CRON JOBS
echo -e "\n${YELLOW}Step 4: Setting Up Cron Jobs${NC}"

# Create temp file for cron jobs
cat > /tmp/2sweety-cron << 'EOF'
# Database Backup (daily at 2 AM)
0 2 * * * /root/backup-database.sh >> /var/log/db-backup.log 2>&1

# User Activity Status Update (every minute)
*/1 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan schedule:run >> /var/log/cron-schedule.log 2>&1

# Queue Worker Health Check (every 5 minutes)
*/5 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl status | grep -q "RUNNING" || docker restart lo4wc0888kowwwco8w0gsoco-220639619982 >> /var/log/worker-check.log 2>&1

# Disk Space Check (every 6 hours)
0 */6 * * * df -h | grep -E '^/dev/' | awk '{if ($5+0 > 80) print "WARNING: Disk usage at "$5" on "$1}' >> /var/log/disk-check.log 2>&1

# Clean temporary files (daily at 3 AM)
0 3 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /tmp -type f -mtime +7 -delete 2>/dev/null

# Docker cleanup (weekly on Sunday at 1 AM)
0 1 * * 0 docker system prune -f >> /var/log/docker-cleanup.log 2>&1
EOF

# Install cron jobs (preserve existing)
crontab -l 2>/dev/null > /tmp/existing-cron || true
cat /tmp/2sweety-cron >> /tmp/existing-cron
crontab /tmp/existing-cron

print_status "Cron jobs installed"
echo "Current cron jobs:"
crontab -l | grep -v "^#" | grep -v "^$"

# 5. CHECK SSL CERTIFICATE
echo -e "\n${YELLOW}Step 5: Checking SSL Certificate${NC}"
if command -v openssl &> /dev/null; then
    CERT_INFO=$(echo | openssl s_client -servername api.2sweety.com -connect api.2sweety.com:443 2>/dev/null | openssl x509 -noout -dates 2>/dev/null)
    if [ $? -eq 0 ]; then
        print_status "SSL certificate is valid"
        echo "$CERT_INFO" | grep "notAfter"
    else
        print_error "SSL certificate check failed - may not be configured"
    fi
else
    print_warning "OpenSSL not available - skipping SSL check"
fi

# 6. CHECK QUEUE WORKERS
echo -e "\n${YELLOW}Step 6: Checking Queue Workers${NC}"
QUEUE_WORKERS=$(docker exec $APP_CONTAINER ps aux 2>/dev/null | grep "queue:work" | grep -v grep | wc -l)
if [ $QUEUE_WORKERS -gt 0 ]; then
    print_status "Queue workers running: $QUEUE_WORKERS processes"
else
    print_error "NO queue workers running!"
    echo "  Queue workers are CRITICAL for:"
    echo "  - Email sending"
    echo "  - Push notifications"
    echo "  - Image processing"
    echo "  - Payment processing"
    echo ""
    echo "  You MUST configure Supervisor in your container!"
    echo "  See PRODUCTION_AUDIT_CHECKLIST.md section 'Background Workers & Queues'"
fi

# 7. CHECK REDIS
echo -e "\n${YELLOW}Step 7: Checking Redis${NC}"
if docker ps | grep -q redis; then
    print_status "Redis container is running"
    # Test connection
    if docker exec $(docker ps | grep redis | awk '{print $1}') redis-cli ping 2>/dev/null | grep -q PONG; then
        print_status "Redis responding to ping"
    fi
else
    print_warning "Redis container NOT found"
    echo "  Redis is HIGHLY RECOMMENDED for:"
    echo "  - Session storage"
    echo "  - Cache"
    echo "  - Queue backend"
    echo ""
    echo "  To deploy Redis:"
    echo "  docker run -d --name redis-2sweety --network coolify -v redis-data:/data --restart unless-stopped redis:7-alpine"
fi

# 8. CHECK DATABASE INDEXES
echo -e "\n${YELLOW}Step 8: Checking Database Performance${NC}"
DB_SIZE=$(docker exec $DB_CONTAINER mysql -u root -p$(docker exec $DB_CONTAINER printenv MYSQL_ROOT_PASSWORD) -e "SELECT ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' FROM information_schema.tables WHERE table_schema = 'gomeet';" 2>/dev/null | tail -1)
print_status "Database size: ${DB_SIZE} MB"

# Check if users table has indexes
USER_INDEXES=$(docker exec $DB_CONTAINER mysql -u root -p$(docker exec $DB_CONTAINER printenv MYSQL_ROOT_PASSWORD) -e "SHOW INDEX FROM gomeet.users;" 2>/dev/null | wc -l)
if [ $USER_INDEXES -lt 5 ]; then
    print_warning "Users table may need index optimization"
    echo "  See PRODUCTION_AUDIT_CHECKLIST.md section 'Database Query Optimization'"
else
    print_status "Users table has $USER_INDEXES indexes"
fi

# 9. CHECK PHP OPCACHE
echo -e "\n${YELLOW}Step 9: Checking PHP OpCache${NC}"
OPCACHE_ENABLED=$(docker exec $APP_CONTAINER php -i 2>/dev/null | grep "opcache.enable " | grep "On" | wc -l)
if [ $OPCACHE_ENABLED -gt 0 ]; then
    print_status "OpCache is enabled"
else
    print_error "OpCache is NOT enabled - PHP performance will be poor!"
    echo "  See PRODUCTION_AUDIT_CHECKLIST.md section 'OpCache Configuration'"
fi

# 10. CHECK DISK SPACE
echo -e "\n${YELLOW}Step 10: Checking Disk Space${NC}"
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -lt 70 ]; then
    print_status "Disk usage: ${DISK_USAGE}%"
elif [ $DISK_USAGE -lt 85 ]; then
    print_warning "Disk usage: ${DISK_USAGE}% - monitor closely"
else
    print_error "Disk usage: ${DISK_USAGE}% - CRITICAL! Clean up immediately"
    echo "Top 10 largest directories:"
    du -h --max-depth=1 /var/lib/docker 2>/dev/null | sort -rh | head -10
fi

# 11. CREATE HEALTH CHECK SCRIPT
echo -e "\n${YELLOW}Step 11: Creating Health Check Script${NC}"
cat > /root/health-check.sh << 'EOF'
#!/bin/bash
APP_CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"
DB_CONTAINER="z8co40wo4sc8ow4wsog4cw44"

# Check if containers are running
if ! docker ps | grep -q $APP_CONTAINER; then
    echo "CRITICAL: App container is down! Attempting restart..."
    docker start $APP_CONTAINER
fi

if ! docker ps | grep -q $DB_CONTAINER; then
    echo "CRITICAL: Database container is down! Attempting restart..."
    docker start $DB_CONTAINER
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is at ${DISK_USAGE}%"
fi

# Check app response
RESPONSE_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://api.2sweety.com/api/health 2>/dev/null || echo "000")
if [ "$RESPONSE_CODE" != "200" ]; then
    echo "WARNING: App not responding with 200 OK (got $RESPONSE_CODE)"
fi
EOF

chmod +x /root/health-check.sh
print_status "Health check script created at /root/health-check.sh"

# Test health check
echo "Testing health check..."
/root/health-check.sh

# 12. SUMMARY AND NEXT STEPS
echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}DEPLOYMENT FIX SUMMARY${NC}"
echo -e "${GREEN}========================================${NC}\n"

print_status "Database backups configured (daily at 2 AM)"
print_status "Cron jobs installed (6 automated tasks)"
print_status "Health monitoring script created"

echo -e "\n${YELLOW}CRITICAL NEXT STEPS:${NC}\n"

echo "1. Configure Environment Variables in Coolify:"
echo "   - Firebase credentials (FIREBASE_*)"
echo "   - OneSignal (ONESIGNAL_APP_ID, ONESIGNAL_API_KEY)"
echo "   - Agora (AGORA_APP_ID, AGORA_APP_CERTIFICATE)"
echo "   - At least ONE payment gateway"
echo "   - Email SMTP settings"
echo ""

echo "2. Setup Queue Workers:"
echo "   - Install Supervisor in your container"
echo "   - Configure at least 4 queue worker processes"
echo "   - See: PRODUCTION_AUDIT_CHECKLIST.md"
echo ""

echo "3. Deploy Redis (HIGHLY RECOMMENDED):"
echo "   docker run -d --name redis-2sweety --network coolify \\"
echo "     -v redis-data:/data --restart unless-stopped redis:7-alpine"
echo ""

echo "4. Enable OpCache:"
echo "   - See PRODUCTION_AUDIT_CHECKLIST.md section 'OpCache Configuration'"
echo ""

echo "5. Optimize Database:"
echo "   - Add indexes to critical tables"
echo "   - See: PRODUCTION_AUDIT_CHECKLIST.md section 'Database Query Optimization'"
echo ""

echo "6. Setup External Monitoring:"
echo "   - UptimeRobot: https://uptimerobot.com"
echo "   - Monitor: https://api.2sweety.com/api/health"
echo ""

echo "7. Review Full Audit:"
echo "   - Read: PRODUCTION_AUDIT_CHECKLIST.md"
echo "   - Complete all 10 audit sections"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Script completed!${NC}"
echo -e "${GREEN}========================================${NC}\n"

echo "For detailed instructions, see:"
echo "  /root/PRODUCTION_AUDIT_CHECKLIST.md"
echo ""
echo "Logs will be created in:"
echo "  /var/log/db-backup.log"
echo "  /var/log/cron-*.log"
echo "  /var/log/disk-check.log"
echo ""
