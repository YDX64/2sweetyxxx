# 2Sweety Dating App - Troubleshooting Guide

## Common Issues and Immediate Fixes

### Issue 1: Users Can't Login / "Firebase Error"

**Symptoms:**
- Login button doesn't work
- "Firebase initialization error" in browser console
- "Network error" on mobile app

**Diagnosis:**
```bash
# Check Firebase config in container
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep FIREBASE

# Check browser console for errors
# Should NOT see: "Firebase: Error (auth/invalid-api-key)"
```

**Fix:**
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project (or create new one)
3. Go to Project Settings > General
4. Copy the config values
5. In Coolify, update environment variables:
   ```
   FIREBASE_API_KEY=AIzaSy... (real key starting with AIza)
   FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   FIREBASE_MESSAGING_SENDER_ID=1234567890
   FIREBASE_APP_ID=1:1234567890:web:abc123def456
   ```
6. Restart container: `docker restart lo4wc0888kowwwco8w0gsoco-220639619982`

---

### Issue 2: Push Notifications Not Working

**Symptoms:**
- Users not receiving match notifications
- No chat message alerts
- Silent app

**Diagnosis:**
```bash
# Check OneSignal config
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep ONESIGNAL

# Test OneSignal API
curl --location --request POST 'https://onesignal.com/api/v1/notifications' \
  --header 'Authorization: Basic YOUR_REST_API_KEY' \
  --header 'Content-Type: application/json' \
  --data-raw '{
    "app_id": "YOUR_APP_ID",
    "contents": {"en": "Test notification"},
    "included_segments": ["All"]
  }'
```

**Fix:**
1. Go to OneSignal: https://onesignal.com
2. Get your App ID and REST API Key
3. Update in Coolify:
   ```
   ONESIGNAL_APP_ID=your-app-id-here
   ONESIGNAL_REST_API_KEY=your-rest-api-key
   ```
4. Check queue workers are running (notifications sent via queue):
   ```bash
   docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ps aux | grep queue:work
   ```
5. If no workers, you MUST setup Supervisor (see main audit doc)

---

### Issue 3: Video/Audio Calls Failing

**Symptoms:**
- "Call failed" error
- Black screen during video call
- No audio/video connection

**Diagnosis:**
```bash
# Check Agora credentials
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep AGORA

# Test token generation endpoint
curl -X POST https://api.2sweety.com/api/agora/token \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{"channelName":"test","uid":1}'
```

**Fix:**
1. Go to Agora Console: https://console.agora.io
2. Create project or use existing
3. Get App ID and App Certificate
4. Update in Coolify:
   ```
   AGORA_APP_ID=your-32-character-app-id
   AGORA_APP_CERTIFICATE=your-32-character-certificate
   ```
5. Ensure token generation endpoint works
6. Check firewall allows UDP ports 1080-10000 (Agora RTC)

---

### Issue 4: Payment Processing Fails

**Symptoms:**
- "Payment failed" error
- Premium subscription not activating
- Coin purchase not working

**Diagnosis:**
```bash
# Check which gateways are configured
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep -E "(RAZORPAY|STRIPE|PAYPAL)"

# Check payment webhook logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f storage/logs/laravel.log | grep payment
```

**Fix for Razorpay:**
1. Get credentials from: https://dashboard.razorpay.com
2. Update in Coolify:
   ```
   RAZORPAY_KEY_ID=rzp_test_XXXX or rzp_live_XXXX
   RAZORPAY_KEY_SECRET=your-secret-key
   ```
3. Configure webhook: https://api.2sweety.com/api/razorpay/webhook
4. Set webhook secret in Razorpay dashboard
5. Test with small payment

**Fix for Stripe:**
1. Get from: https://dashboard.stripe.com
2. Update:
   ```
   STRIPE_PUBLISHABLE_KEY=pk_test_XXXX or pk_live_XXXX
   STRIPE_SECRET_KEY=sk_test_XXXX or sk_live_XXXX
   ```
3. Configure webhook: https://api.2sweety.com/api/stripe/webhook
4. Events to listen: payment_intent.succeeded, payment_intent.failed

**Fix for PayPal:**
1. Get from: https://developer.paypal.com
2. Update:
   ```
   PAYPAL_CLIENT_ID=your-client-id
   PAYPAL_SECRET=your-secret
   PAYPAL_MODE=sandbox or live
   ```
3. Configure IPN: https://api.2sweety.com/api/paypal/ipn

---

### Issue 5: Chat Messages Not Sending/Receiving

**Symptoms:**
- Messages don't appear
- "Message failed to send"
- Real-time updates not working

**Diagnosis:**
```bash
# Check if Firebase Firestore is accessible
curl -X GET "https://firestore.googleapis.com/v1/projects/YOUR_PROJECT_ID/databases/(default)/documents/chats" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Check web console for Firebase errors
# Look for: "Firebase: Error (firestore/permission-denied)"
```

**Fix:**
1. Check Firebase Firestore Rules
2. Go to Firebase Console > Firestore > Rules
3. Update rules (ONLY for authenticated users):
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /chats/{chatId} {
         allow read, write: if request.auth != null
           && (request.auth.uid == resource.data.user1Id
               || request.auth.uid == resource.data.user2Id);
       }
       match /messages/{messageId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
4. Publish rules
5. Restart app container

---

### Issue 6: Images Not Uploading

**Symptoms:**
- Profile picture upload fails
- "File too large" error
- Uploaded images don't display

**Diagnosis:**
```bash
# Check upload directory permissions
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ls -la /var/www/html/storage/app/public/

# Check PHP upload limits
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep upload_max_filesize
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep post_max_size
```

**Fix:**
```bash
# Increase upload limits (create PHP config)
cat > /tmp/uploads.ini << 'EOF'
upload_max_filesize = 20M
post_max_size = 25M
max_execution_time = 300
memory_limit = 256M
EOF

# Copy to container
docker cp /tmp/uploads.ini lo4wc0888kowwwco8w0gsoco-220639619982:/usr/local/etc/php/conf.d/

# Fix permissions
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 bash -c '
chown -R www-data:www-data /var/www/html/storage
chmod -R 755 /var/www/html/storage/app/public
'

# Restart container
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# Create symbolic link (if missing)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan storage:link
```

---

### Issue 7: Database Connection Errors

**Symptoms:**
- "SQLSTATE[HY000] [2002] Connection refused"
- "Too many connections"
- App shows 500 error

**Diagnosis:**
```bash
# Check if database container is running
docker ps | grep z8co40wo4sc8ow4wsog4cw44

# Check database from app container
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan tinker
# In tinker: DB::connection()->getPdo();

# Check connection count
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW STATUS WHERE Variable_name = 'Threads_connected';"
```

**Fix for Connection Refused:**
```bash
# Restart database
docker restart z8co40wo4sc8ow4wsog4cw44

# Wait 30 seconds
sleep 30

# Restart app
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# Verify DB_HOST in environment
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep DB_HOST
# Should be: DB_HOST=z8co40wo4sc8ow4wsog4cw44
```

**Fix for Too Many Connections:**
```bash
# Increase max_connections in MySQL
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SET GLOBAL max_connections = 500;"

# Make permanent (add to MySQL config)
cat > /tmp/mysql-connections.cnf << 'EOF'
[mysqld]
max_connections = 500
max_connect_errors = 1000000
EOF

docker cp /tmp/mysql-connections.cnf z8co40wo4sc8ow4wsog4cw44:/etc/mysql/conf.d/
docker restart z8co40wo4sc8ow4wsog4cw44
```

---

### Issue 8: Site Shows 502/503 Bad Gateway

**Symptoms:**
- Nginx 502 error
- "Bad Gateway"
- Site completely down

**Diagnosis:**
```bash
# Check if app container is running
docker ps | grep lo4wc0888kowwwco8w0gsoco-220639619982

# Check container logs
docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 50

# Check if PHP-FPM is running
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ps aux | grep php-fpm
```

**Fix:**
```bash
# Restart app container
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# If still failing, check logs for errors
docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 100

# Common causes:
# 1. Out of memory - check: docker stats lo4wc0888kowwwco8w0gsoco-220639619982
# 2. PHP fatal error - check: docker exec lo4wc0888kowwwco8w0gsoco-220639619982 cat storage/logs/laravel.log
# 3. Incorrect permissions - fix: docker exec lo4wc0888kowwwco8w0gsoco-220639619982 chown -R www-data:www-data /var/www/html

# Check Traefik logs (Coolify's reverse proxy)
docker logs traefik --tail 50
```

---

### Issue 9: Slow Performance / Timeouts

**Symptoms:**
- Pages load slowly (>5 seconds)
- Random timeouts
- High CPU usage

**Diagnosis:**
```bash
# Check resource usage
docker stats lo4wc0888kowwwco8w0gsoco-220639619982

# Check slow queries
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;
"

# Wait a few minutes, then check slow query log
docker exec z8co40wo4sc8ow4wsog4cw44 cat /var/log/mysql/slow.log

# Check if OpCache is enabled
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep opcache.enable
```

**Fix:**
```bash
# 1. Enable OpCache (CRITICAL)
cat > /tmp/opcache.ini << 'EOF'
opcache.enable=1
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=10000
opcache.validate_timestamps=0
opcache.revalidate_freq=2
opcache.fast_shutdown=1
EOF

docker cp /tmp/opcache.ini lo4wc0888kowwwco8w0gsoco-220639619982:/usr/local/etc/php/conf.d/
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# 2. Deploy Redis for caching
docker run -d \
  --name redis-2sweety \
  --network coolify \
  -v redis-data:/data \
  --restart unless-stopped \
  redis:7-alpine

# 3. Update app to use Redis (in Coolify env vars)
CACHE_DRIVER=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
REDIS_HOST=redis-2sweety

# 4. Optimize database queries (add indexes)
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
USE gomeet;
ALTER TABLE users ADD INDEX idx_email (email);
ALTER TABLE users ADD INDEX idx_status (status);
ALTER TABLE likes ADD INDEX idx_user_target (user_id, target_user_id);
ALTER TABLE messages ADD INDEX idx_conversation (sender_id, receiver_id, created_at);
"

# 5. Clear and rebuild cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan route:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan view:cache
```

---

### Issue 10: Email Not Sending (Password Resets, etc.)

**Symptoms:**
- Password reset emails not received
- Verification emails missing
- No notification emails

**Diagnosis:**
```bash
# Check SMTP configuration
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 env | grep MAIL

# Check Laravel mail queue
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:failed

# Check logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f storage/logs/laravel.log | grep mail
```

**Fix:**
```bash
# Configure SMTP (use Gmail, SendGrid, Mailgun, etc.)
# For Gmail:
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@2sweety.com
MAIL_FROM_NAME="2Sweety Dating"

# For SendGrid (recommended):
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=your-sendgrid-api-key
MAIL_ENCRYPTION=tls

# Test email sending
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan tinker
# In tinker:
# Mail::raw('Test email', function($msg) { $msg->to('test@example.com')->subject('Test'); });

# Retry failed jobs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:retry all
```

---

### Issue 11: Disk Space Full

**Symptoms:**
- "No space left on device"
- Container crashes
- Can't upload images

**Diagnosis:**
```bash
# Check disk usage
df -h

# Check Docker disk usage
docker system df

# Find large directories
du -h --max-depth=1 /var/lib/docker | sort -rh | head -10
```

**Fix:**
```bash
# Clean Docker system
docker system prune -a -f
docker volume prune -f

# Clean old images
docker image prune -a --filter "until=720h" -f

# Clean app logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /var/www/html/storage/logs -name "*.log" -mtime +30 -delete

# Clean database backups (keep last 30 days)
find /root/db-backups -name "*.sql.gz" -mtime +30 -delete

# If still full, check for specific large files
find /var/lib/docker -type f -size +100M -exec ls -lh {} \;

# Consider moving Docker to larger disk or using volume cleanup
```

---

### Issue 12: SSL Certificate Expired/Invalid

**Symptoms:**
- "Your connection is not private"
- SSL_ERROR_EXPIRED
- Browser shows "Not Secure"

**Diagnosis:**
```bash
# Check certificate expiration
echo | openssl s_client -servername api.2sweety.com -connect api.2sweety.com:443 2>/dev/null | openssl x509 -noout -dates

# Check Traefik logs
docker logs traefik --tail 50 | grep -i certificate
```

**Fix:**
```bash
# Manual certificate renewal (if auto-renewal failed)
docker exec traefik traefik certificates

# Or use Coolify UI:
# 1. Go to application settings
# 2. Toggle "Automatic HTTPS" off and back on
# 3. Wait 2-3 minutes for certificate regeneration

# Force Let's Encrypt renewal (if needed)
certbot renew --force-renewal

# Restart Traefik
docker restart traefik
```

---

## Emergency Recovery Procedures

### Complete System Down - Recovery Steps

```bash
# 1. Check all containers
docker ps -a

# 2. Start database first
docker start z8co40wo4sc8ow4wsog4cw44
sleep 30

# 3. Start application
docker start lo4wc0888kowwwco8w0gsoco-220639619982
sleep 20

# 4. Check logs for errors
docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 100
docker logs z8co40wo4sc8ow4wsog4cw44 --tail 100

# 5. If database corrupted, repair
docker exec z8co40wo4sc8ow4wsog4cw44 mysqlcheck -u root -p --auto-repair --all-databases

# 6. If app won't start, clear cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:clear
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# 7. Verify site is accessible
curl -I https://api.2sweety.com
```

### Database Restoration from Backup

```bash
# List available backups
ls -lh /root/db-backups/

# Stop application (to prevent writes)
docker stop lo4wc0888kowwwco8w0gsoco-220639619982

# Restore from specific backup
BACKUP_FILE="/root/db-backups/gomeet_20251030_020000.sql.gz"
gunzip < $BACKUP_FILE | docker exec -i z8co40wo4sc8ow4wsog4cw44 mysql -u root -p gomeet

# Restart application
docker start lo4wc0888kowwwco8w0gsoco-220639619982

# Clear application cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear
```

---

## Monitoring and Prevention

### Set Up Alerts (Recommended)

1. **UptimeRobot** (Free): https://uptimerobot.com
   - Monitor: https://api.2sweety.com/api/health
   - Alert if down for 1 minute

2. **Disk Space Monitoring**:
   ```bash
   # Already set up in QUICK_DEPLOY_FIXES.sh
   # Checks every 6 hours
   ```

3. **Database Monitoring**:
   ```bash
   # Set up alerts for connection count
   docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
   SHOW STATUS WHERE Variable_name IN ('Threads_connected', 'Aborted_connects', 'Slow_queries');
   "
   ```

4. **Container Health**:
   ```bash
   # Health check runs every 5 minutes (from cron)
   /root/health-check.sh
   ```

---

## Getting Help

If issues persist after trying these fixes:

1. **Check Logs First**:
   ```bash
   docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 200
   docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -200 storage/logs/laravel.log
   ```

2. **Collect System Info**:
   ```bash
   docker info
   docker stats --no-stream
   df -h
   free -h
   ```

3. **Review Full Audit**:
   - See: PRODUCTION_AUDIT_CHECKLIST.md

4. **Contact Support**:
   - Include logs from step 1
   - Include system info from step 2
   - Describe exact error messages and when they occur

---

**Last Updated**: 2025-10-30
