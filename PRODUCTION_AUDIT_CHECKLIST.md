# GoMeet Dating App Production Audit & Fix Guide
**Server**: api.2sweety.com
**Platform**: Docker/Coolify
**App Container**: lo4wc0888kowwwco8w0gsoco-220639619982
**DB Container**: z8co40wo4sc8ow4wsog4cw44
**Date**: 2025-10-30

---

## CRITICAL SECURITY AUDIT

### 1. Container Security Check

```bash
# SSH to production server first
ssh root@api.2sweety.com

# Check if containers are running
docker ps --filter "name=lo4wc0888kowwwco8w0gsoco-220639619982"
docker ps --filter "name=z8co40wo4sc8ow4wsog4cw44"

# Check container security settings
docker inspect lo4wc0888kowwwco8w0gsoco-220639619982 | grep -A 20 "SecurityOpt"
docker inspect lo4wc0888kowwwco8w0gsoco-220639619982 | grep -A 10 "CapAdd\|CapDrop"

# CRITICAL: Ensure containers are NOT running as root
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 whoami
# Should NOT return "root" - if it does, need to fix

# Check for privileged mode (should be false)
docker inspect lo4wc0888kowwwco8w0gsoco-220639619982 | grep Privileged
```

**FIXES if running as root:**
```bash
# Add to Dockerfile:
USER www-data
# or create non-root user:
RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /var/www/html
USER appuser
```

---

### 2. Environment Variables Security Audit

```bash
# Check current environment variables (CRITICAL: Check for placeholders)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 printenv | grep -i "key\|secret\|password\|token"

# CRITICAL CHECKS:
# Look for these PLACEHOLDER values that MUST be replaced:
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep -E "(FIREBASE_|ONESIGNAL_|RAZORPAY_|STRIPE_|PAYPAL_|AGORA_)"

# Check if any contain "YOUR_", "PLACEHOLDER", "TEST", "EXAMPLE"
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep -iE "your_|placeholder|test_key|example"
```

**REQUIRED Environment Variables (currently showing placeholder values):**

```bash
# Firebase (CRITICAL - app won't work without real values)
FIREBASE_API_KEY=
FIREBASE_AUTH_DOMAIN=
FIREBASE_PROJECT_ID=
FIREBASE_STORAGE_BUCKET=
FIREBASE_MESSAGING_SENDER_ID=
FIREBASE_APP_ID=
FIREBASE_MEASUREMENT_ID=

# OneSignal Push Notifications (CRITICAL)
ONESIGNAL_APP_ID=
ONESIGNAL_API_KEY=

# Agora Video/Audio Calls (CRITICAL)
AGORA_APP_ID=
AGORA_APP_CERTIFICATE=

# Payment Gateways (at least ONE must be configured)
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
PAYPAL_CLIENT_ID=
PAYPAL_SECRET=
PAYSTACK_PUBLIC_KEY=
PAYSTACK_SECRET_KEY=
FLUTTERWAVE_PUBLIC_KEY=
FLUTTERWAVE_SECRET_KEY=
MERCADO_PAGO_ACCESS_TOKEN=

# Database (should be set by Coolify)
DB_HOST=z8co40wo4sc8ow4wsog4cw44
DB_PORT=3306
DB_DATABASE=gomeet
DB_USERNAME=
DB_PASSWORD=

# Application Security
APP_KEY=  # Laravel/PHP app key - must be 32 char random string
JWT_SECRET=  # For API authentication
SESSION_SECRET=

# Email (for password resets, notifications)
MAIL_MAILER=smtp
MAIL_HOST=
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@2sweety.com
MAIL_FROM_NAME="2Sweety"
```

**How to set in Coolify:**
```bash
# Via Coolify UI:
# Go to Application > Environment Variables
# Add each variable with real values

# Or via CLI:
coolify env:set APP_NAME lo4wc0888kowwwco8w0gsoco-220639619982 FIREBASE_API_KEY "your-real-firebase-key"
```

---

### 3. SSL/HTTPS Certificate Check

```bash
# Check if SSL certificate exists and is valid
curl -I https://api.2sweety.com
# Should return "200 OK" and show certificate info

# Check SSL certificate expiration
echo | openssl s_client -servername api.2sweety.com -connect api.2sweety.com:443 2>/dev/null | openssl x509 -noout -dates

# Check SSL configuration score (run from local machine)
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=api.2sweety.com
# Should get A+ rating

# If SSL issues, check Coolify's Let's Encrypt integration
docker logs traefik | tail -100  # Coolify uses Traefik for SSL
```

**FIXES for SSL issues:**
```bash
# In Coolify UI:
# 1. Go to Application Settings
# 2. Enable "Automatic HTTPS"
# 3. Ensure domain is correctly configured: api.2sweety.com
# 4. Force HTTPS redirect

# Manual certificate renewal (if auto-renewal fails):
docker exec traefik traefik certificates
```

---

### 4. Database Security & Backup

```bash
# Check database is accessible only internally
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SELECT User, Host FROM mysql.user;"
# Should NOT show any users with Host='%' except application user

# Check database size and tables
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'gomeet'
GROUP BY table_schema;"

# Check for proper indexes on critical tables
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
SHOW INDEX FROM gomeet.users;
SHOW INDEX FROM gomeet.messages;
SHOW INDEX FROM gomeet.matches;
SHOW INDEX FROM gomeet.likes;"

# CRITICAL: Check if backups are running
ls -lah /var/lib/docker/volumes/ | grep backup
```

**Database Backup Strategy (CRITICAL - MUST IMPLEMENT):**

```bash
# Create backup script
cat > /root/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/root/db-backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="z8co40wo4sc8ow4wsog4cw44"
DB_NAME="gomeet"
RETENTION_DAYS=30

mkdir -p $BACKUP_DIR

# Create backup
docker exec $CONTAINER mysqldump -u root -p${MYSQL_ROOT_PASSWORD} \
  --single-transaction \
  --quick \
  --lock-tables=false \
  $DB_NAME | gzip > $BACKUP_DIR/gomeet_${DATE}.sql.gz

# Delete backups older than retention period
find $BACKUP_DIR -name "gomeet_*.sql.gz" -mtime +$RETENTION_DAYS -delete

# Upload to S3/R2 (HIGHLY RECOMMENDED)
# aws s3 cp $BACKUP_DIR/gomeet_${DATE}.sql.gz s3://your-backup-bucket/

echo "Backup completed: gomeet_${DATE}.sql.gz"
EOF

chmod +x /root/backup-database.sh

# Test backup
/root/backup-database.sh

# Add to crontab (runs daily at 2 AM)
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-database.sh >> /var/log/db-backup.log 2>&1") | crontab -

# Verify cron job
crontab -l
```

**Database Performance Tuning:**

```bash
# Check current MySQL configuration
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW VARIABLES LIKE '%buffer%';"

# Recommended settings for dating app (add to MySQL container config):
cat > /root/mysql-performance.cnf << 'EOF'
[mysqld]
# InnoDB Buffer Pool (set to 70% of available RAM)
innodb_buffer_pool_size = 2G
innodb_buffer_pool_instances = 2

# Connection Settings
max_connections = 500
max_connect_errors = 1000000
wait_timeout = 600
interactive_timeout = 600

# Query Cache (for read-heavy workload)
query_cache_type = 1
query_cache_size = 128M
query_cache_limit = 2M

# Logging
slow_query_log = 1
slow_query_log_file = /var/log/mysql/slow.log
long_query_time = 2

# Binary Logging (for point-in-time recovery)
log_bin = /var/log/mysql/mysql-bin.log
expire_logs_days = 7
max_binlog_size = 100M
EOF

# Apply configuration (restart required)
docker cp /root/mysql-performance.cnf z8co40wo4sc8ow4wsog4cw44:/etc/mysql/conf.d/
docker restart z8co40wo4sc8ow4wsog4cw44
```

---

## REQUIRED CRON JOBS

### 1. Dating App Specific Cron Jobs

```bash
# Create cron jobs script
cat > /root/dating-app-cron.sh << 'EOF'
#!/bin/bash
CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"

# Function to run PHP artisan commands
run_artisan() {
    docker exec $CONTAINER php artisan "$@"
}

# Clean up expired sessions (every hour)
run_artisan session:gc

# Clean up old notifications (daily at 3 AM)
run_artisan notifications:cleanup

# Update match suggestions (every 6 hours)
run_artisan matches:update

# Clean up expired temporary files (daily at 4 AM)
run_artisan files:cleanup

# Process pending payments (every 15 minutes)
run_artisan payments:process

# Send scheduled push notifications (every 5 minutes)
run_artisan notifications:send

# Update user activity status (every minute)
run_artisan users:update-status

# Clean up old chat messages (daily at 5 AM - if configured)
run_artisan chat:cleanup

# Generate daily reports (daily at 6 AM)
run_artisan reports:generate

# Cleanup expired verification codes (hourly)
run_artisan auth:cleanup-codes
EOF

chmod +x /root/dating-app-cron.sh

# Add to crontab
cat > /tmp/dating-cron << 'EOF'
# Dating App Maintenance
*/1 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan users:update-status >> /var/log/cron-users.log 2>&1
*/5 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan notifications:send >> /var/log/cron-notifications.log 2>&1
*/15 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan payments:process >> /var/log/cron-payments.log 2>&1
0 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan session:gc >> /var/log/cron-session.log 2>&1
0 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan auth:cleanup-codes >> /var/log/cron-auth.log 2>&1
0 */6 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan matches:update >> /var/log/cron-matches.log 2>&1
0 3 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan notifications:cleanup >> /var/log/cron-cleanup.log 2>&1
0 4 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan files:cleanup >> /var/log/cron-files.log 2>&1
0 5 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan chat:cleanup >> /var/log/cron-chat.log 2>&1
0 6 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan reports:generate >> /var/log/cron-reports.log 2>&1

# Database Backup (daily at 2 AM)
0 2 * * * /root/backup-database.sh >> /var/log/db-backup.log 2>&1

# Log Rotation (weekly on Sunday at 1 AM)
0 1 * * 0 /root/rotate-logs.sh >> /var/log/log-rotation.log 2>&1

# SSL Certificate Check (daily at midnight)
0 0 * * * certbot renew --quiet >> /var/log/certbot-renew.log 2>&1

# Disk Space Alert (every 6 hours)
0 */6 * * * /root/check-disk-space.sh >> /var/log/disk-check.log 2>&1

# Container Health Check (every 5 minutes)
*/5 * * * * /root/health-check.sh >> /var/log/health-check.log 2>&1
EOF

crontab /tmp/dating-cron
crontab -l  # Verify
```

---

## BACKGROUND WORKERS & QUEUES

### 1. Laravel Queue Workers (CRITICAL)

```bash
# Check if queue workers are running
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ps aux | grep "queue:work"

# If NOT running, this is CRITICAL - queues handle:
# - Email sending
# - Push notifications
# - Image processing
# - Payment processing
# - Match calculations

# Start queue workers using Supervisor
cat > /tmp/supervisord.conf << 'EOF'
[supervisord]
nodaemon=true
user=root

[program:laravel-worker]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work --sleep=3 --tries=3 --max-time=3600
autostart=true
autorestart=true
stopasflongstop=3600
stopwaitsecs=3600
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/worker.log
stopwaitsecs=3600

[program:notification-worker]
command=php /var/www/html/artisan queue:work --queue=notifications --sleep=1 --tries=3
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/notification-worker.log

[program:payment-worker]
command=php /var/www/html/artisan queue:work --queue=payments --sleep=2 --tries=5
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/payment-worker.log

[program:image-processor]
command=php /var/www/html/artisan queue:work --queue=images --sleep=1 --tries=2
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/html/storage/logs/image-worker.log
EOF

# Copy to container
docker cp /tmp/supervisord.conf lo4wc0888kowwwco8w0gsoco-220639619982:/etc/supervisor/conf.d/

# Restart supervisor
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl reread
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl update
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl start all

# Check status
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl status
```

### 2. Redis for Queue/Cache (HIGHLY RECOMMENDED)

```bash
# Check if Redis container exists
docker ps | grep redis

# If NOT, deploy Redis container
docker run -d \
  --name redis-2sweety \
  --network coolify \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:7-alpine redis-server --appendonly yes

# Update app container to use Redis
# In Coolify UI, add environment variables:
REDIS_HOST=redis-2sweety
REDIS_PASSWORD=
REDIS_PORT=6379
REDIS_DB=0
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

---

## SECURITY VULNERABILITIES TO FIX

### 1. Application Security Hardening

```bash
# Check PHP security settings
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep -E "expose_php|display_errors|disable_functions"

# CRITICAL: Create security hardening script
cat > /tmp/security-hardening.sh << 'EOF'
#!/bin/bash

# Disable PHP version exposure
echo "expose_php = Off" >> /usr/local/etc/php/conf.d/security.ini

# Disable dangerous functions
echo "disable_functions = exec,passthru,shell_exec,system,proc_open,popen,curl_exec,curl_multi_exec,parse_ini_file,show_source" >> /usr/local/etc/php/conf.d/security.ini

# Set secure session settings
echo "session.cookie_httponly = 1" >> /usr/local/etc/php/conf.d/security.ini
echo "session.cookie_secure = 1" >> /usr/local/etc/php/conf.d/security.ini
echo "session.cookie_samesite = Strict" >> /usr/local/etc/php/conf.d/security.ini

# Production error handling
echo "display_errors = Off" >> /usr/local/etc/php/conf.d/security.ini
echo "log_errors = On" >> /usr/local/etc/php/conf.d/security.ini
echo "error_log = /var/www/html/storage/logs/php-errors.log" >> /usr/local/etc/php/conf.d/security.ini
EOF

docker cp /tmp/security-hardening.sh lo4wc0888kowwwco8w0gsoco-220639619982:/tmp/
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 bash /tmp/security-hardening.sh
docker restart lo4wc0888kowwwco8w0gsoco-220639619982
```

### 2. File Upload Security

```bash
# Check file upload directory permissions
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ls -la /var/www/html/storage/app/public/

# CRITICAL: Secure file uploads
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 bash -c '
# No execute permissions on upload directories
find /var/www/html/storage/app/public -type d -exec chmod 755 {} \;
find /var/www/html/storage/app/public -type f -exec chmod 644 {} \;

# Add .htaccess to prevent PHP execution in uploads
echo "php_flag engine off" > /var/www/html/storage/app/public/.htaccess

# Ensure proper ownership
chown -R www-data:www-data /var/www/html/storage
'
```

### 3. Rate Limiting & DDoS Protection

```bash
# Check if rate limiting is configured
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 cat /var/www/html/app/Http/Kernel.php | grep throttle

# Add to .env if missing:
RATE_LIMIT_PER_MINUTE=60
API_RATE_LIMIT=100

# Install Cloudflare or similar DDoS protection
# Recommended: Put Cloudflare in front of api.2sweety.com
```

### 4. SQL Injection Prevention Check

```bash
# Check if using parameterized queries (Eloquent ORM should handle this)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 grep -r "DB::raw" /var/www/html/app/ | wc -l
# Should be minimal - raw queries are dangerous

# Check for direct SQL concatenation (CRITICAL VULNERABILITY)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 grep -r '\$_GET\|\$_POST' /var/www/html/app/ | grep -v "Request::" | wc -l
# Should be 0 - should use Request facade
```

---

## PERFORMANCE OPTIMIZATION

### 1. OpCache Configuration (CRITICAL for PHP performance)

```bash
# Check if OpCache is enabled
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep opcache

# Configure OpCache for production
cat > /tmp/opcache.ini << 'EOF'
[opcache]
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.enable_cli=1
opcache.validate_timestamps=0
EOF

docker cp /tmp/opcache.ini lo4wc0888kowwwco8w0gsoco-220639619982:/usr/local/etc/php/conf.d/
docker restart lo4wc0888kowwwco8w0gsoco-220639619982
```

### 2. Image Optimization Pipeline

```bash
# Install image optimization tools in container
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 bash -c '
apt-get update
apt-get install -y jpegoptim optipng pngquant gifsicle webp
'

# Create image optimization cron job
cat >> /tmp/dating-cron << 'EOF'
# Optimize uploaded images (runs every hour)
0 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /var/www/html/storage/app/public -name "*.jpg" -mtime -1 -exec jpegoptim --max=85 {} \; >> /var/log/image-optimization.log 2>&1
0 * * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /var/www/html/storage/app/public -name "*.png" -mtime -1 -exec optipng -o2 {} \; >> /var/log/image-optimization.log 2>&1
EOF
```

### 3. CDN Configuration

```bash
# RECOMMENDED: Use Cloudflare or AWS CloudFront for:
# - User profile images
# - Chat media
# - Static assets

# Update .env:
CDN_URL=https://cdn.2sweety.com
# Or use Cloudflare R2/AWS S3:
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=2sweety-media
AWS_USE_PATH_STYLE_ENDPOINT=false
```

### 4. Database Query Optimization

```bash
# Enable slow query log analysis
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
SET GLOBAL log_queries_not_using_indexes = 'ON';
"

# Create index optimization script
cat > /root/optimize-indexes.sql << 'EOF'
-- Users table
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_phone (phone);
ALTER TABLE users ADD INDEX idx_status (status);
ALTER TABLE users ADD INDEX idx_active (active, last_seen);
ALTER TABLE users ADD INDEX idx_location (latitude, longitude);
ALTER TABLE users ADD INDEX idx_premium (premium_until);

-- Matches/Likes table
ALTER TABLE likes ADD INDEX idx_user_target (user_id, target_user_id);
ALTER TABLE likes ADD INDEX idx_created (created_at);
ALTER TABLE likes ADD INDEX idx_mutual (user_id, target_user_id, is_match);

-- Messages table
ALTER TABLE messages ADD INDEX idx_conversation (sender_id, receiver_id, created_at);
ALTER TABLE messages ADD INDEX idx_unread (receiver_id, read_at);

-- Payments table
ALTER TABLE payments ADD INDEX idx_user_status (user_id, status);
ALTER TABLE payments ADD INDEX idx_created (created_at);

-- Sessions
ALTER TABLE sessions ADD INDEX idx_user (user_id);
ALTER TABLE sessions ADD INDEX idx_last_activity (last_activity);
EOF

# Apply optimizations
docker exec -i z8co40wo4sc8ow4wsog4cw44 mysql -u root -p gomeet < /root/optimize-indexes.sql
```

### 5. Application Cache Strategy

```bash
# Check current cache configuration
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan route:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan view:cache

# Add cache warming to deployment script
cat > /root/warm-cache.sh << 'EOF'
#!/bin/bash
CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"

docker exec $CONTAINER php artisan config:cache
docker exec $CONTAINER php artisan route:cache
docker exec $CONTAINER php artisan view:cache

# Warm up common queries
docker exec $CONTAINER php artisan cache:warm
EOF

chmod +x /root/warm-cache.sh
```

---

## LOG ROTATION & MANAGEMENT

### 1. Application Logs Rotation

```bash
# Create log rotation script
cat > /root/rotate-logs.sh << 'EOF'
#!/bin/bash
CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"
LOG_DIR="/var/www/html/storage/logs"
RETENTION_DAYS=30

# Rotate Laravel logs
docker exec $CONTAINER bash -c "
cd $LOG_DIR
for log in *.log; do
    if [ -f \"\$log\" ]; then
        mv \"\$log\" \"\${log%.log}-\$(date +%Y%m%d).log\"
        gzip \"\${log%.log}-\$(date +%Y%m%d).log\"
        touch \"\$log\"
        chown www-data:www-data \"\$log\"
    fi
done

# Delete logs older than retention period
find $LOG_DIR -name '*.log.gz' -mtime +$RETENTION_DAYS -delete
"

# Rotate system logs
find /var/log -name "cron-*.log" -size +100M -exec sh -c 'mv "$1" "$1.old" && gzip "$1.old"' _ {} \;
find /var/log -name "*.log.gz" -mtime +$RETENTION_DAYS -delete

echo "Log rotation completed at $(date)"
EOF

chmod +x /root/rotate-logs.sh

# Add to weekly cron (already in cron section above)
```

### 2. Docker Container Logs

```bash
# Configure Docker log rotation (add to /etc/docker/daemon.json)
cat > /etc/docker/daemon.json << 'EOF'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "50m",
    "max-file": "10",
    "compress": "true"
  }
}
EOF

systemctl restart docker
```

### 3. Centralized Logging (RECOMMENDED)

```bash
# Deploy Loki for log aggregation (optional but recommended)
docker run -d \
  --name=loki \
  --network=coolify \
  -v loki-data:/loki \
  -p 3100:3100 \
  --restart unless-stopped \
  grafana/loki:latest

# Deploy Promtail to ship logs
docker run -d \
  --name=promtail \
  --network=coolify \
  -v /var/log:/var/log \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  --restart unless-stopped \
  grafana/promtail:latest
```

---

## MONITORING & HEALTH CHECKS

### 1. Application Health Check Endpoint

```bash
# Check if health endpoint exists
curl https://api.2sweety.com/api/health
# Should return {"status": "ok", "timestamp": "..."}

# If missing, create one in routes/api.php:
# Route::get('/health', function() {
#     return response()->json(['status' => 'ok', 'timestamp' => now()]);
# });
```

### 2. Container Health Monitoring Script

```bash
cat > /root/health-check.sh << 'EOF'
#!/bin/bash
APP_CONTAINER="lo4wc0888kowwwco8w0gsoco-220639619982"
DB_CONTAINER="z8co40wo4sc8ow4wsog4cw44"
ALERT_EMAIL="admin@2sweety.com"

# Check if containers are running
if ! docker ps | grep -q $APP_CONTAINER; then
    echo "CRITICAL: App container is down!" | mail -s "2Sweety App Down" $ALERT_EMAIL
    docker start $APP_CONTAINER
fi

if ! docker ps | grep -q $DB_CONTAINER; then
    echo "CRITICAL: Database container is down!" | mail -s "2Sweety DB Down" $ALERT_EMAIL
    docker start $DB_CONTAINER
fi

# Check disk space
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "WARNING: Disk usage is at ${DISK_USAGE}%" | mail -s "2Sweety Disk Space Alert" $ALERT_EMAIL
fi

# Check database connections
DB_CONNECTIONS=$(docker exec $DB_CONTAINER mysql -u root -p${MYSQL_ROOT_PASSWORD} -e "SHOW STATUS WHERE Variable_name = 'Threads_connected';" | awk 'NR==2 {print $2}')
if [ $DB_CONNECTIONS -gt 450 ]; then
    echo "WARNING: Database has $DB_CONNECTIONS connections (max 500)" | mail -s "2Sweety DB Connection Alert" $ALERT_EMAIL
fi

# Check app response time
RESPONSE_TIME=$(curl -o /dev/null -s -w '%{time_total}' https://api.2sweety.com/api/health)
if (( $(echo "$RESPONSE_TIME > 2" | bc -l) )); then
    echo "WARNING: App response time is ${RESPONSE_TIME}s" | mail -s "2Sweety Slow Response" $ALERT_EMAIL
fi

# Check SSL certificate expiration
CERT_EXPIRY=$(echo | openssl s_client -servername api.2sweety.com -connect api.2sweety.com:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)
CERT_EXPIRY_EPOCH=$(date -d "$CERT_EXPIRY" +%s)
CURRENT_EPOCH=$(date +%s)
DAYS_UNTIL_EXPIRY=$(( ($CERT_EXPIRY_EPOCH - $CURRENT_EPOCH) / 86400 ))

if [ $DAYS_UNTIL_EXPIRY -lt 30 ]; then
    echo "WARNING: SSL certificate expires in $DAYS_UNTIL_EXPIRY days" | mail -s "2Sweety SSL Expiring" $ALERT_EMAIL
fi
EOF

chmod +x /root/health-check.sh
```

### 3. Uptime Monitoring

```bash
# RECOMMENDED: Use external monitoring services:
# - UptimeRobot (free): https://uptimerobot.com
# - Pingdom
# - Better Uptime
# - StatusCake

# Monitor these URLs:
# - https://api.2sweety.com/api/health
# - https://api.2sweety.com (admin panel)

# Set alert thresholds:
# - Response time > 2s
# - Downtime > 1 minute
# - SSL certificate expires in < 30 days
```

---

## FIREBASE INTEGRATION CHECK

### 1. Verify Firebase Configuration

```bash
# Check Firebase config in web app
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 cat /var/www/html/public/js/firebase-config.js

# CRITICAL: Ensure these are NOT placeholder values:
# apiKey: "AIza..."  (should start with AIza)
# authDomain: "your-project.firebaseapp.com"
# projectId: "your-project-id"
# messagingSenderId: "123456789"
# appId: "1:123456789:web:abc123"

# Test Firebase connection
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_FIREBASE_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test-token",
    "notification": {
      "title": "Test",
      "body": "Testing Firebase connection"
    }
  }'
```

### 2. Firebase Cloud Messaging for Push Notifications

```bash
# Check if service worker exists
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 cat /var/www/html/public/firebase-messaging-sw.js

# Verify FCM token generation works
# Test in browser console: firebase.messaging().getToken()
```

---

## AGORA VIDEO/AUDIO INTEGRATION

### 1. Verify Agora Configuration

```bash
# Check Agora credentials
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep AGORA

# CRITICAL: These must be real values from Agora Console
# AGORA_APP_ID should be a 32-character hex string
# AGORA_APP_CERTIFICATE should be a 32-character hex string

# Test Agora token generation endpoint
curl -X POST https://api.2sweety.com/api/agora/token \
  -H "Content-Type: application/json" \
  -d '{"channelName":"test-channel","uid":1}'
# Should return: {"token": "006...", "appId": "..."}
```

---

## PAYMENT GATEWAY VERIFICATION

### 1. Test Payment Endpoints

```bash
# Check which payment gateways are configured
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep -E "(RAZORPAY|STRIPE|PAYPAL)"

# Test Razorpay (if configured)
curl -X POST https://api.2sweety.com/api/razorpay/create-order \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "currency": "INR"}'

# Test Stripe (if configured)
curl -X POST https://api.2sweety.com/api/stripe/create-payment-intent \
  -H "Authorization: Bearer YOUR_TEST_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "usd"}'

# CRITICAL: Ensure webhook endpoints are configured:
# Razorpay webhook: https://api.2sweety.com/api/razorpay/webhook
# Stripe webhook: https://api.2sweety.com/api/stripe/webhook
# PayPal webhook: https://api.2sweety.com/api/paypal/webhook
```

---

## DISK SPACE MANAGEMENT

### 1. Disk Space Monitoring

```bash
cat > /root/check-disk-space.sh << 'EOF'
#!/bin/bash
THRESHOLD=80
ALERT_EMAIL="admin@2sweety.com"

# Check main disk
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt $THRESHOLD ]; then
    echo "WARNING: Disk usage at ${DISK_USAGE}%" | mail -s "Disk Space Alert" $ALERT_EMAIL

    # Show top 10 largest directories
    du -ah / | sort -rh | head -n 10
fi

# Check Docker volumes
docker system df -v

# Clean up old Docker images (careful!)
# docker image prune -a --filter "until=720h" -f
EOF

chmod +x /root/check-disk-space.sh
```

### 2. Automated Cleanup Tasks

```bash
# Add to crontab:
# Clean Docker system weekly
0 3 * * 0 docker system prune -f >> /var/log/docker-cleanup.log 2>&1

# Clean old uploaded files (older than 90 days, for deleted users)
0 4 * * 0 find /var/lib/docker/volumes -name "deleted-users" -type d -mtime +90 -exec rm -rf {} \; 2>/dev/null

# Clean temporary files
0 5 * * * docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /tmp -type f -mtime +7 -delete
```

---

## FINAL DEPLOYMENT CHECKLIST

### Pre-Launch Critical Items

- [ ] **Environment Variables**: All placeholder values replaced with real credentials
- [ ] **SSL Certificate**: Valid and auto-renewing via Let's Encrypt
- [ ] **Database Backups**: Automated daily backups configured and tested
- [ ] **Cron Jobs**: All 10+ cron jobs running (check with `crontab -l`)
- [ ] **Queue Workers**: Supervisor running 4+ queue worker processes
- [ ] **Redis**: Running for cache/sessions/queues
- [ ] **Firebase**: Real credentials configured, push notifications working
- [ ] **Agora**: Real App ID and Certificate, video calls functional
- [ ] **Payment Gateways**: At least one gateway fully configured and tested
- [ ] **Email**: SMTP configured for password resets and notifications
- [ ] **Monitoring**: Health checks running every 5 minutes
- [ ] **Rate Limiting**: Configured to prevent abuse
- [ ] **OpCache**: Enabled and configured for PHP performance
- [ ] **Database Indexes**: Optimized for dating app queries
- [ ] **File Permissions**: Secure (no execute on uploads)
- [ ] **Error Logging**: Enabled, but not displaying errors to users
- [ ] **Session Security**: Secure cookies, HTTPOnly, SameSite
- [ ] **CDN**: Configured for static assets (optional but recommended)
- [ ] **Log Rotation**: Weekly rotation configured
- [ ] **Disk Space Alerts**: Monitoring configured
- [ ] **Uptime Monitoring**: External service monitoring API

### Performance Benchmarks to Achieve

- API response time < 200ms for 95th percentile
- Database query time < 50ms average
- Page load time < 2s
- Match calculation < 500ms
- Push notification delivery < 3s
- Payment processing < 5s

### Security Audit Commands

```bash
# Run these after setup:
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan security:check
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 composer audit
nmap -sV api.2sweety.com
curl -I https://api.2sweety.com | grep -i security
```

---

## EMERGENCY PROCEDURES

### Database Recovery

```bash
# If database corrupted:
docker stop lo4wc0888kowwwco8w0gsoco-220639619982
docker exec z8co40wo4sc8ow4wsog4cw44 mysqlcheck -u root -p --auto-repair --all-databases
docker start lo4wc0888kowwwco8w0gsoco-220639619982

# Restore from backup:
gunzip < /root/db-backups/gomeet_YYYYMMDD_HHMMSS.sql.gz | \
  docker exec -i z8co40wo4sc8ow4wsog4cw44 mysql -u root -p gomeet
```

### Application Container Issues

```bash
# If app container won't start:
docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 100

# Clear cache and restart:
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:clear
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# If still failing, rebuild:
docker-compose down
docker-compose up -d --build
```

### High Load Incident

```bash
# Identify resource hog:
docker stats lo4wc0888kowwwco8w0gsoco-220639619982
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 top -bn1 | head -20

# Check database:
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW PROCESSLIST;"

# Enable maintenance mode (stops new requests):
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan down --message="Under maintenance" --retry=60

# After fixing:
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan up
```

---

## SUPPORT CONTACTS

- **Coolify Support**: https://coolify.io/docs
- **Docker Issues**: https://docs.docker.com
- **MySQL**: https://dev.mysql.com/doc/
- **PHP**: https://www.php.net/docs.php
- **Firebase**: https://firebase.google.com/support
- **Agora**: https://docs.agora.io

---

**Last Updated**: 2025-10-30
**Next Review**: 2025-11-30
**Maintained By**: DevOps Team
