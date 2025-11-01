#!/bin/bash
# 2Sweety Production Issues Fix Script
# Generated: $(date)
# This script fixes critical issues found in your production deployment

set -e

echo "================================================"
echo "2SWEETY PRODUCTION ISSUES FIX SCRIPT"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Container info
CONTAINER_ID="lo4wc0888kowwwco8w0gsoco-220639619982"
DB_CONTAINER="z8co40wo4sc8ow4wsog4cw44"
REDIS_CONTAINER="ms4wow8gwgwwko4g0wosc8c8"

echo -e "${YELLOW}🔍 CRITICAL ISSUES FOUND:${NC}"
echo ""

# 1. Check Environment Variables
echo -e "${RED}❌ ISSUE 1: Missing/Invalid Environment Variables${NC}"
echo "The following services are using placeholder values and won't work:"
echo ""
echo "  BLOCKING ISSUES (App won't work properly):"
echo "  • Firebase Private Key: 'your_firebase_private_key' (Login/Auth broken)"
echo "  • Agora App ID: 'your_agora_app_id' (Video/Audio calls broken)"
echo "  • Agora Certificate: 'your_agora_certificate' (Video/Audio calls broken)"
echo "  • OneSignal REST Key: 'your_onesignal_rest_key' (Push notifications broken)"
echo ""
echo "  PAYMENT ISSUES (Payments won't work):"
echo "  • Razorpay Key: 'your_razorpay_key' / 'your_razorpay_secret'"
echo "  • PayPal Secret: 'your_paypal_secret'"
echo "  • Stripe Key: Not configured properly"
echo ""
echo "  MISSING SERVICES:"
echo "  • No SMTP/Email configuration found (No emails will be sent)"
echo "  • No SMS service configured (Twilio/Msg91)"
echo ""
echo -e "${GREEN}✅ FIX: Update in Coolify Environment Variables:${NC}"
echo "  1. Go to Coolify Dashboard"
echo "  2. Select your application"
echo "  3. Go to Environment Variables"
echo "  4. Update the following:"
echo ""
cat << 'EOF'
# Firebase (CRITICAL - for authentication)
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_KEY_HERE\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com

# Agora (CRITICAL - for video/audio calls)
AGORA_APP_ID=your_actual_agora_app_id_here
AGORA_APP_CERTIFICATE=your_actual_agora_certificate_here

# OneSignal (CRITICAL - for push notifications)
ONESIGNAL_REST_API_KEY=your_actual_onesignal_rest_api_key_here

# Email Service (REQUIRED - for user notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-specific-password
SMTP_FROM_EMAIL=noreply@2sweety.com
SMTP_FROM_NAME=2Sweety

# Payment Gateway (At least ONE required)
# Option 1: Razorpay (India)
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxxx

# Option 2: Stripe (International)
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Option 3: PayPal
PAYPAL_CLIENT_ID=xxxxxxxxxxxxx
PAYPAL_SECRET=xxxxxxxxxxxxx
PAYPAL_MODE=live

# SMS Service (Optional but recommended)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1234567890
EOF

echo ""
echo "================================================"
echo ""

# 2. Missing Cron Jobs
echo -e "${RED}❌ ISSUE 2: No Cron Jobs/Scheduled Tasks${NC}"
echo "Required scheduled tasks are not running:"
echo "  • User verification cleanup"
echo "  • Expired subscriptions check"
echo "  • Daily statistics calculation"
echo "  • Inactive user notifications"
echo "  • Database cleanup"
echo ""
echo -e "${GREEN}✅ FIX: Create cron container:${NC}"
echo ""
cat << 'EOF'
# Create a new file: docker-compose.cron.yml
version: '3.8'
services:
  cron:
    image: alpine:latest
    container_name: 2sweety-cron
    volumes:
      - ./cron:/etc/cron.d
      - ./scripts:/scripts
    command: crond -f -l 8
    restart: unless-stopped
    networks:
      - coolify

# Create cron/2sweety file:
# Run every hour - Clean expired verifications
0 * * * * curl -s https://api.2sweety.com/cron/clean_verifications.php
# Run daily at 2 AM - Check expired subscriptions
0 2 * * * curl -s https://api.2sweety.com/cron/check_subscriptions.php
# Run daily at 3 AM - Calculate statistics
0 3 * * * curl -s https://api.2sweety.com/cron/calculate_stats.php
# Run weekly - Clean old logs
0 0 * * 0 curl -s https://api.2sweety.com/cron/clean_logs.php
EOF

echo ""
echo "================================================"
echo ""

# 3. Missing PHP Extensions
echo -e "${RED}❌ ISSUE 3: Missing PHP Extensions${NC}"
echo "Performance and functionality limited due to missing extensions:"
echo "  • redis (No Redis caching)"
echo "  • opcache (5x slower performance)"
echo "  • apcu (No user cache)"
echo "  • imagick (Limited image processing)"
echo ""
echo -e "${GREEN}✅ FIX: Update Dockerfile:${NC}"
echo ""
cat << 'EOF'
# Add to your Dockerfile:
RUN docker-php-ext-install opcache && \
    pecl install redis && \
    docker-php-ext-enable redis && \
    pecl install apcu && \
    docker-php-ext-enable apcu && \
    apt-get update && apt-get install -y libmagickwand-dev && \
    pecl install imagick && \
    docker-php-ext-enable imagick

# Create php.ini for opcache:
RUN echo "opcache.enable=1" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.memory_consumption=256" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.max_accelerated_files=20000" >> /usr/local/etc/php/conf.d/opcache.ini && \
    echo "opcache.validate_timestamps=0" >> /usr/local/etc/php/conf.d/opcache.ini
EOF

echo ""
echo "================================================"
echo ""

# 4. No Background Workers
echo -e "${RED}❌ ISSUE 4: No Background Workers/Queues${NC}"
echo "Background tasks are not being processed:"
echo "  • Email sending"
echo "  • Push notifications"
echo "  • Image processing"
echo "  • Payment webhooks"
echo ""
echo -e "${GREEN}✅ FIX: Add Supervisor for workers:${NC}"
echo ""
cat << 'EOF'
# Install in container:
docker exec -it lo4wc0888kowwwco8w0gsoco-220639619982 bash -c "
apt-get update && apt-get install -y supervisor
"

# Create /etc/supervisor/conf.d/2sweety-workers.conf:
[program:2sweety-queue]
process_name=%(program_name)s_%(process_num)02d
command=php /var/www/html/artisan queue:work --sleep=3 --tries=3
autostart=true
autorestart=true
user=www-data
numprocs=4
redirect_stderr=true
stdout_logfile=/var/log/2sweety-queue.log

[program:2sweety-notifications]
command=php /var/www/html/workers/notification_worker.php
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/log/2sweety-notifications.log

# Start supervisor:
supervisorctl reread
supervisorctl update
supervisorctl start all
EOF

echo ""
echo "================================================"
echo ""

# 5. Database Optimization
echo -e "${YELLOW}⚠️ ISSUE 5: Database Not Optimized${NC}"
echo "Missing indexes and optimization:"
echo ""
echo -e "${GREEN}✅ FIX: Run optimization queries:${NC}"
echo ""
cat << 'EOF'
# Connect to MySQL and run:
docker exec -it z8co40wo4sc8ow4wsog4cw44 mysql -u dating_user -p dating_db

-- Add indexes for performance
ALTER TABLE tbl_user ADD INDEX idx_status (status);
ALTER TABLE tbl_user ADD INDEX idx_gender (gender);
ALTER TABLE tbl_user ADD INDEX idx_created (created_at);
ALTER TABLE tbl_user ADD INDEX idx_location (latitude, longitude);
ALTER TABLE plan_purchase_history ADD INDEX idx_user_plan (user_id, plan_id);
ALTER TABLE plan_purchase_history ADD INDEX idx_expire (expire_date);
ALTER TABLE tbl_chat ADD INDEX idx_users (sender_id, receiver_id);
ALTER TABLE tbl_chat ADD INDEX idx_timestamp (timestamp);

-- Optimize tables
OPTIMIZE TABLE tbl_user;
OPTIMIZE TABLE tbl_chat;
OPTIMIZE TABLE plan_purchase_history;
EOF

echo ""
echo "================================================"
echo ""

# 6. Security Issues
echo -e "${YELLOW}⚠️ ISSUE 6: Security Configuration${NC}"
echo "Security hardening needed:"
echo ""
echo -e "${GREEN}✅ FIX: Security checklist:${NC}"
echo ""
echo "  1. Change default admin password (currently Admin@123)"
echo "  2. Enable rate limiting in Nginx/Traefik"
echo "  3. Set up fail2ban for brute force protection"
echo "  4. Enable SSL certificate auto-renewal"
echo "  5. Implement API rate limiting"
echo "  6. Add CORS configuration"
echo "  7. Enable CSP headers"
echo ""

# 7. Monitoring
echo -e "${YELLOW}⚠️ ISSUE 7: No Monitoring/Alerting${NC}"
echo "You won't know when things break:"
echo ""
echo -e "${GREEN}✅ FIX: Set up monitoring:${NC}"
echo ""
echo "  1. Add UptimeRobot: https://api.2sweety.com/api/health.php"
echo "  2. Set up New Relic or Datadog for APM"
echo "  3. Configure alerts in Coolify"
echo "  4. Add error logging to external service (Sentry/Rollbar)"
echo ""

echo "================================================"
echo -e "${YELLOW}📋 IMMEDIATE ACTION ITEMS:${NC}"
echo "================================================"
echo ""
echo -e "${RED}CRITICAL (Do Now - App won't work properly):${NC}"
echo "  1. [ ] Fix Firebase Private Key in Coolify"
echo "  2. [ ] Configure Agora App ID & Certificate"
echo "  3. [ ] Set OneSignal REST API Key"
echo "  4. [ ] Configure SMTP for emails"
echo ""
echo -e "${YELLOW}HIGH (Do Today - Major features broken):${NC}"
echo "  5. [ ] Configure at least one payment gateway"
echo "  6. [ ] Set up cron jobs container"
echo "  7. [ ] Install PHP extensions (rebuild container)"
echo "  8. [ ] Set up background workers"
echo ""
echo -e "${GREEN}MEDIUM (Do This Week - Performance/Reliability):${NC}"
echo "  9. [ ] Optimize database with indexes"
echo "  10. [ ] Configure Redis caching"
echo "  11. [ ] Set up monitoring (UptimeRobot)"
echo "  12. [ ] Enable OpCache"
echo ""
echo -e "LOW (Do This Month - Best Practices):"
echo "  13. [ ] Security hardening"
echo "  14. [ ] Set up automated backups"
echo "  15. [ ] Configure log rotation"
echo "  16. [ ] Document deployment process"
echo ""

echo "================================================"
echo -e "${GREEN}✅ VERIFICATION COMMANDS:${NC}"
echo "================================================"
echo ""
echo "# Check if services are working:"
echo "curl -s https://api.2sweety.com/api/health.php | jq ."
echo ""
echo "# Test Firebase (after fixing):"
echo "docker exec $CONTAINER_ID php -r \"
\\\$key = getenv('FIREBASE_PRIVATE_KEY');
echo 'Firebase Key: ' . ((\\\$key != 'your_firebase_private_key') ? 'Configured' : 'NOT CONFIGURED') . PHP_EOL;
\""
echo ""
echo "# Test email (after fixing):"
echo "docker exec $CONTAINER_ID php -r \"
\\\$host = getenv('SMTP_HOST');
echo 'SMTP: ' . (\\\$host ? 'Configured' : 'NOT CONFIGURED') . PHP_EOL;
\""
echo ""
echo "# Check Redis connection:"
echo "docker exec $CONTAINER_ID php -r \"
\\\$redis = new Redis();
\\\$redis->connect('$REDIS_CONTAINER', 6379);
echo 'Redis: ' . (\\\$redis->ping() ? 'Connected' : 'Failed') . PHP_EOL;
\""
echo ""

echo "================================================"
echo "Script generated: $(date)"
echo "================================================"