# 2Sweety Dating App - Daily Operations Quick Reference

## Daily Health Check (5 minutes)
Run this every morning:

```bash
ssh root@api.2sweety.com

# Quick health check
/root/health-check.sh

# Check container status
docker ps | grep -E "lo4wc0888|z8co40wo4sc8"

# Check disk space
df -h / | grep -v tmpfs

# Check database connections
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p$(docker exec z8co40wo4sc8ow4wsog4cw44 printenv MYSQL_ROOT_PASSWORD) -e "SHOW STATUS WHERE Variable_name = 'Threads_connected';" 2>/dev/null | tail -1

# Check app response time
time curl -s https://api.2sweety.com/api/health

# View recent errors
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -20 storage/logs/laravel.log | grep ERROR
```

**Expected Results:**
- ✅ Both containers running
- ✅ Disk usage < 80%
- ✅ DB connections < 400 (out of 500 max)
- ✅ API responds in < 1 second
- ✅ No critical errors in logs

---

## Weekly Maintenance (15 minutes)
Run this every Sunday:

```bash
ssh root@api.2sweety.com

# Review backup status
ls -lh /root/db-backups/ | tail -10
# Should see 7 recent backups

# Check backup integrity (test restore)
LATEST_BACKUP=$(ls -t /root/db-backups/*.sql.gz | head -1)
echo "Testing backup: $LATEST_BACKUP"
gunzip -t $LATEST_BACKUP && echo "✅ Backup file is valid" || echo "❌ Backup corrupted!"

# Review cron job execution
grep "backup-database" /var/log/db-backup.log | tail -5
grep "docker-cleanup" /var/log/docker-cleanup.log | tail -5

# Check SSL certificate validity
echo | openssl s_client -servername api.2sweety.com -connect api.2sweety.com:443 2>/dev/null | openssl x509 -noout -dates

# Review queue workers
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl status

# Check for failed jobs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:failed

# Review database size growth
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p$(docker exec z8co40wo4sc8ow4wsog4cw44 printenv MYSQL_ROOT_PASSWORD) -e "
SELECT
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'gomeet'
ORDER BY (data_length + index_length) DESC
LIMIT 10;" 2>/dev/null

# Clean up old logs
find /var/log -name "cron-*.log" -size +100M -exec sh -c 'mv "$1" "$1.old" && gzip "$1.old"' _ {} \;

# Update system packages (if needed)
apt update && apt list --upgradable
# Review list, update if critical security patches
```

---

## Monthly Deep Dive (30 minutes)
Run this on 1st of every month:

```bash
ssh root@api.2sweety.com

# 1. Database optimization
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p$(docker exec z8co40wo4sc8ow4wsog4cw44 printenv MYSQL_ROOT_PASSWORD) -e "
USE gomeet;
OPTIMIZE TABLE users;
OPTIMIZE TABLE messages;
OPTIMIZE TABLE matches;
OPTIMIZE TABLE likes;
OPTIMIZE TABLE payments;
" 2>/dev/null

# 2. Analyze slow queries
docker exec z8co40wo4sc8ow4wsog4cw44 cat /var/log/mysql/slow.log | tail -100

# 3. Review most active users (potential abuse)
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p$(docker exec z8co40wo4sc8ow4wsog4cw44 printenv MYSQL_ROOT_PASSWORD) -e "
SELECT user_id, COUNT(*) as message_count
FROM gomeet.messages
WHERE created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY user_id
ORDER BY message_count DESC
LIMIT 20;" 2>/dev/null

# 4. Check for suspicious payment patterns
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p$(docker exec z8co40wo4sc8ow4wsog4cw44 printenv MYSQL_ROOT_PASSWORD) -e "
SELECT user_id, COUNT(*) as failed_payments
FROM gomeet.payments
WHERE status = 'failed' AND created_at > DATE_SUB(NOW(), INTERVAL 1 MONTH)
GROUP BY user_id
HAVING failed_payments > 5
ORDER BY failed_payments DESC;" 2>/dev/null

# 5. Review application performance metrics
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan insights:performance
# (If Laravel Telescope or similar installed)

# 6. Security audit
# Check for outdated packages
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 composer outdated --direct

# 7. Backup verification
# Download a backup and test restore on local machine
scp root@api.2sweety.com:/root/db-backups/latest.sql.gz ~/Downloads/

# 8. Review storage usage by feature
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 du -sh /var/www/html/storage/app/public/*

# 9. Clean up deleted user data (if soft-deletes used)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan users:cleanup-deleted
```

---

## Common Commands Quick Reference

### Container Management
```bash
# View running containers
docker ps

# View all containers (including stopped)
docker ps -a

# Start container
docker start lo4wc0888kowwwco8w0gsoco-220639619982

# Stop container (graceful)
docker stop lo4wc0888kowwwco8w0gsoco-220639619982

# Restart container
docker restart lo4wc0888kowwwco8w0gsoco-220639619982

# View container logs (live)
docker logs -f lo4wc0888kowwwco8w0gsoco-220639619982

# View last 100 log lines
docker logs --tail 100 lo4wc0888kowwwco8w0gsoco-220639619982

# Execute command in container
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 COMMAND

# Open shell in container
docker exec -it lo4wc0888kowwwco8w0gsoco-220639619982 bash

# Check container resource usage
docker stats lo4wc0888kowwwco8w0gsoco-220639619982
```

### Laravel Artisan Commands
```bash
# Run any artisan command
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan COMMAND

# Clear cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear

# Clear config cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:clear

# Rebuild config cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:cache

# Clear route cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan route:clear

# Rebuild route cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan route:cache

# Run migrations
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan migrate

# Rollback last migration
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan migrate:rollback

# View failed queue jobs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:failed

# Retry failed jobs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:retry all

# Enter tinker (interactive shell)
docker exec -it lo4wc0888kowwwco8w0gsoco-220639619982 php artisan tinker

# Create storage symbolic link
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan storage:link
```

### Database Operations
```bash
# Connect to MySQL
docker exec -it z8co40wo4sc8ow4wsog4cw44 mysql -u root -p

# Run SQL query
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -pPASSWORD -e "YOUR SQL;"

# Create backup
docker exec z8co40wo4sc8ow4wsog4cw44 mysqldump -u root -pPASSWORD gomeet | gzip > backup.sql.gz

# Restore backup
gunzip < backup.sql.gz | docker exec -i z8co40wo4sc8ow4wsog4cw44 mysql -u root -pPASSWORD gomeet

# Show database size
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -pPASSWORD -e "
SELECT
    table_schema AS 'Database',
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'gomeet';"

# Show active connections
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -pPASSWORD -e "SHOW PROCESSLIST;"

# Kill slow query (get ID from SHOW PROCESSLIST)
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -pPASSWORD -e "KILL QUERY 123;"
```

### File Operations
```bash
# Copy file to container
docker cp local-file.txt lo4wc0888kowwwco8w0gsoco-220639619982:/var/www/html/

# Copy file from container
docker cp lo4wc0888kowwwco8w0gsoco-220639619982:/var/www/html/file.txt ./

# View file in container
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 cat /path/to/file

# Edit file in container
docker exec -it lo4wc0888kowwwco8w0gsoco-220639619982 nano /path/to/file

# Fix permissions
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 chown -R www-data:www-data /var/www/html/storage
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 chmod -R 755 /var/www/html/storage
```

### Monitoring
```bash
# Check disk space
df -h

# Check Docker disk usage
docker system df

# Check memory usage
free -h

# Check CPU and process list
top

# View system load
uptime

# Check network connections
netstat -tuln | grep LISTEN

# Check if port 443 is accessible
curl -I https://api.2sweety.com

# Test API health endpoint
curl https://api.2sweety.com/api/health

# Check DNS resolution
nslookup api.2sweety.com

# Test database connection from app
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan tinker
# Then run: DB::connection()->getPdo();
```

### Maintenance Mode
```bash
# Enable maintenance mode (users see "Under Maintenance" page)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan down --message="We're upgrading! Back in 15 minutes." --retry=60

# Disable maintenance mode
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan up

# Allow specific IPs during maintenance
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan down --allow=123.456.789.0
```

### Emergency Procedures
```bash
# CRITICAL: Site completely down
docker restart lo4wc0888kowwwco8w0gsoco-220639619982
docker restart z8co40wo4sc8ow4wsog4cw44

# CRITICAL: Database locked/corrupted
docker exec z8co40wo4sc8ow4wsog4cw44 mysqlcheck -u root -p --auto-repair --all-databases

# CRITICAL: Out of disk space
docker system prune -a -f
docker volume prune -f
find /var/log -name "*.log" -size +100M -delete

# CRITICAL: Too many database connections
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW PROCESSLIST;"
# Kill oldest connections if needed

# CRITICAL: High CPU usage
docker stats --no-stream
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 top -bn1

# CRITICAL: Memory leak
docker restart lo4wc0888kowwwco8w0gsoco-220639619982
```

---

## Performance Monitoring Benchmarks

### API Response Times (Target)
- Health endpoint: < 100ms
- User profile: < 200ms
- Match suggestions: < 500ms
- Chat history: < 300ms
- Image upload: < 2s

**Check with:**
```bash
# Health endpoint
time curl -s https://api.2sweety.com/api/health

# With detailed timing
curl -w "\nTime_namelookup: %{time_namelookup}s\nTime_connect: %{time_connect}s\nTime_starttransfer: %{time_starttransfer}s\nTime_total: %{time_total}s\n" -o /dev/null -s https://api.2sweety.com/api/health
```

### Database Performance (Target)
- Average query time: < 50ms
- Slow queries per hour: < 10
- Connection pool usage: < 80% (< 400 out of 500)

**Check with:**
```bash
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW STATUS WHERE Variable_name LIKE 'Slow_queries';"
```

### System Resources (Target)
- CPU usage: < 70% average
- Memory usage: < 80%
- Disk usage: < 80%
- Disk I/O wait: < 10%

**Check with:**
```bash
docker stats --no-stream lo4wc0888kowwwco8w0gsoco-220639619982
df -h / | grep -v tmpfs
```

---

## Alert Thresholds

Set up monitoring (UptimeRobot, etc.) with these thresholds:

| Metric | Warning | Critical | Action |
|--------|---------|----------|--------|
| Site downtime | 1 minute | 5 minutes | Restart container |
| Response time | > 2s | > 5s | Check database queries |
| Disk space | > 80% | > 90% | Clean up logs/docker |
| DB connections | > 400 | > 480 | Restart app |
| Memory usage | > 80% | > 90% | Restart container |
| Failed jobs | > 10 | > 50 | Check logs, fix errors |
| SSL expiration | < 30 days | < 7 days | Renew certificate |

---

## Useful Log Locations

```bash
# Application logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f /var/www/html/storage/logs/laravel.log

# Web server access logs (if Nginx in container)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f /var/log/nginx/access.log

# Web server error logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f /var/log/nginx/error.log

# PHP-FPM logs
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -f /var/log/php-fpm.log

# MySQL error log
docker exec z8co40wo4sc8ow4wsog4cw44 tail -f /var/log/mysql/error.log

# MySQL slow query log
docker exec z8co40wo4sc8ow4wsog4cw44 tail -f /var/log/mysql/slow.log

# Cron job logs (on host)
tail -f /var/log/cron-*.log

# Container logs
docker logs -f lo4wc0888kowwwco8w0gsoco-220639619982
docker logs -f z8co40wo4sc8ow4wsog4cw44

# Coolify/Traefik logs
docker logs -f traefik
```

---

## Scheduled Tasks Verification

Ensure these cron jobs are running:

```bash
# View installed cron jobs
crontab -l

# Check last execution times
ls -lt /var/log/cron-*.log

# Verify backup ran (daily at 2 AM)
tail /var/log/db-backup.log

# Check if queue workers are processing
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan queue:failed
# Should show no failed jobs (or minimal)
```

**Expected Cron Jobs:**
- ✅ Database backup (daily 2 AM)
- ✅ Laravel scheduler (every minute)
- ✅ Worker health check (every 5 min)
- ✅ Disk space check (every 6 hours)
- ✅ Temp file cleanup (daily 3 AM)
- ✅ Docker cleanup (weekly Sunday 1 AM)

---

## Security Checklist (Monthly)

```bash
# Check for security updates
apt update && apt list --upgradable | grep -i security

# Check for suspicious login attempts (if using Fail2Ban)
fail2ban-client status sshd

# Review recent SSH logins
last -20

# Check for suspicious database activity
docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "
SELECT user, host, command, time, state
FROM information_schema.processlist
WHERE command != 'Sleep'
ORDER BY time DESC
LIMIT 20;"

# Check for failed payment fraud patterns
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan payments:check-fraud

# Review file permissions
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 find /var/www/html -type f -perm 777
# Should return nothing

# Check for hardcoded secrets (if you have access to source)
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 grep -r "password\|secret\|key" /var/www/html/.env
```

---

## Deployment Checklist (When Updating App)

Before deployment:
```bash
# Enable maintenance mode
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan down

# Create backup
/root/backup-database.sh

# Pull latest changes (in Coolify or manually)

# Run migrations
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan migrate --force

# Clear and rebuild cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan cache:clear
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan config:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan route:cache
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan view:cache

# Restart queue workers
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 supervisorctl restart all

# Disable maintenance mode
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php artisan up

# Verify deployment
curl -I https://api.2sweety.com
curl https://api.2sweety.com/api/health
```

---

## Contact Information

**Emergency Contacts:**
- Server Admin: [Your contact]
- Database Admin: [Your contact]
- On-call DevOps: [Your contact]

**Service Providers:**
- Hosting: Coolify on [Provider]
- DNS: [Provider]
- Email: [Provider]
- Backup Storage: [Provider]
- Monitoring: [Provider]

**Important URLs:**
- Production: https://api.2sweety.com
- Admin Panel: https://api.2sweety.com/admin
- Health Check: https://api.2sweety.com/api/health
- Coolify Dashboard: [URL]
- Monitoring Dashboard: [URL]

---

**Last Updated**: 2025-10-30
**Next Review**: Monthly (1st of each month)
