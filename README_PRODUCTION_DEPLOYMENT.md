# 2Sweety Dating App - Production Deployment Guide

## 📋 Quick Start

You have **4 comprehensive guides** to get your production system running perfectly:

### 1. **QUICK_DEPLOY_FIXES.sh** - START HERE (5-10 minutes)
**Run this first on your production server!**

```bash
# SSH to your server
ssh root@api.2sweety.com

# Download and run the quick fix script
bash QUICK_DEPLOY_FIXES.sh
```

**This script will:**
- ✅ Check container health
- ✅ Verify critical environment variables
- ✅ Set up automated database backups
- ✅ Install 6 critical cron jobs
- ✅ Check SSL certificates
- ✅ Verify queue workers
- ✅ Check Redis status
- ✅ Analyze database performance
- ✅ Verify PHP OpCache
- ✅ Monitor disk space
- ✅ Create health check script

**Expected time:** 5-10 minutes
**Impact:** Immediate improvements to reliability and monitoring

---

### 2. **PRODUCTION_AUDIT_CHECKLIST.md** - Complete Audit (2-4 hours)
**Comprehensive production hardening guide**

**What's inside:**
- 🔒 **Security Audit** (12 sections)
  - Container security
  - Environment variables security
  - SSL/HTTPS configuration
  - Database security & backups
  - File upload security
  - Rate limiting & DDoS protection

- ⚙️ **Required Cron Jobs** (10+ automated tasks)
  - User activity updates
  - Queue worker monitoring
  - Database backups
  - Log rotation
  - Disk space alerts

- 🔄 **Background Workers & Queues**
  - Laravel queue workers (CRITICAL)
  - Redis deployment
  - Supervisor configuration
  - Queue types: notifications, payments, images

- 🚀 **Performance Optimization**
  - OpCache configuration (5x speed improvement)
  - Database indexing
  - Image optimization
  - CDN setup
  - Caching strategies

- 📊 **Monitoring & Health Checks**
  - Application health endpoints
  - Container health monitoring
  - Uptime monitoring setup
  - Alert thresholds

- 🔧 **Service Integration**
  - Firebase configuration
  - Agora video/audio setup
  - Payment gateway verification
  - OneSignal push notifications

**Expected time:** 2-4 hours for full implementation
**Impact:** Production-grade deployment with enterprise reliability

---

### 3. **TROUBLESHOOTING_GUIDE.md** - Emergency Fixes (Quick Reference)
**12 common issues with immediate solutions**

**Issues covered:**
1. ❌ **Users Can't Login** → Firebase configuration
2. ❌ **Push Notifications Not Working** → OneSignal setup
3. ❌ **Video/Audio Calls Failing** → Agora integration
4. ❌ **Payment Processing Fails** → Gateway configuration
5. ❌ **Chat Messages Not Sending** → Firebase Firestore
6. ❌ **Images Not Uploading** → PHP limits & permissions
7. ❌ **Database Connection Errors** → MySQL troubleshooting
8. ❌ **Site Shows 502/503** → Container recovery
9. ❌ **Slow Performance** → OpCache & Redis
10. ❌ **Email Not Sending** → SMTP configuration
11. ❌ **Disk Space Full** → Cleanup procedures
12. ❌ **SSL Certificate Issues** → Let's Encrypt renewal

**Plus:**
- Emergency recovery procedures
- Database restoration steps
- Complete system down recovery
- Monitoring and prevention tips

**Expected time:** 5-30 minutes per issue
**Impact:** Rapid problem resolution, minimized downtime

---

### 4. **DAILY_OPERATIONS_CHECKLIST.md** - Day-to-Day Management
**Daily, weekly, and monthly operational procedures**

**Includes:**
- 📅 **Daily Health Check** (5 minutes)
  - Container status
  - Disk space
  - Database connections
  - API response time
  - Error log review

- 📅 **Weekly Maintenance** (15 minutes)
  - Backup verification
  - SSL certificate check
  - Queue worker status
  - Failed jobs review
  - Database size analysis

- 📅 **Monthly Deep Dive** (30 minutes)
  - Database optimization
  - Slow query analysis
  - User activity patterns
  - Security audit
  - Package updates

- 📖 **Command Reference**
  - 50+ common commands
  - Container management
  - Laravel Artisan
  - Database operations
  - File operations
  - Monitoring commands

- 🚨 **Alert Thresholds**
  - Performance benchmarks
  - Resource limits
  - When to take action

**Expected time:** 5 min/day, 15 min/week, 30 min/month
**Impact:** Proactive monitoring, prevent issues before they occur

---

## 🎯 Recommended Implementation Order

### Phase 1: Immediate (Today - 30 minutes)
1. ✅ Run **QUICK_DEPLOY_FIXES.sh**
2. ✅ Verify all cron jobs are running: `crontab -l`
3. ✅ Test database backup: `ls -lh /root/db-backups/`
4. ✅ Check health endpoint: `curl https://api.2sweety.com/api/health`

### Phase 2: Critical (This Week - 2 hours)
From **PRODUCTION_AUDIT_CHECKLIST.md**:

1. ✅ **Configure Environment Variables** (30 min)
   - Firebase credentials
   - OneSignal API keys
   - Agora App ID and Certificate
   - At least ONE payment gateway
   - Email SMTP settings

2. ✅ **Setup Queue Workers** (45 min)
   - Install Supervisor in container
   - Configure 4+ worker processes
   - Verify notifications and emails work

3. ✅ **Deploy Redis** (15 min)
   ```bash
   docker run -d --name redis-2sweety --network coolify \
     -v redis-data:/data --restart unless-stopped redis:7-alpine
   ```
   - Update app to use Redis for cache/sessions/queues

4. ✅ **Enable OpCache** (15 min)
   - Configure PHP OpCache
   - Restart container
   - Verify 5x performance improvement

### Phase 3: Important (This Month - 2 hours)
1. ✅ Database optimization (30 min)
   - Add indexes to critical tables
   - Configure MySQL performance settings
   - Enable slow query logging

2. ✅ Security hardening (45 min)
   - Secure file uploads
   - Configure rate limiting
   - Review and fix security vulnerabilities
   - Set up SSL monitoring

3. ✅ Monitoring setup (30 min)
   - Sign up for UptimeRobot (free)
   - Configure alerts
   - Set up health check monitoring

4. ✅ Documentation (15 min)
   - Record all credentials securely
   - Document custom configurations
   - Create runbook for team

### Phase 4: Nice to Have (Next 3 Months)
1. ✅ CDN setup (Cloudflare R2 or AWS S3)
2. ✅ Centralized logging (Loki/Grafana)
3. ✅ Advanced monitoring (Prometheus/Grafana)
4. ✅ Auto-scaling configuration
5. ✅ Disaster recovery testing
6. ✅ Load testing and optimization

---

## 🚨 CRITICAL Issues to Fix IMMEDIATELY

Based on the audit, these are **blocking issues** that prevent the app from working:

### 1. Environment Variables (BLOCKING - 30 minutes)
**Status:** ❌ Using placeholder values
**Impact:** App features don't work (login, push notifications, video calls, payments)
**Fix:** See PRODUCTION_AUDIT_CHECKLIST.md section 2

**Required variables:**
```bash
FIREBASE_API_KEY=AIza...  # Real Firebase key
ONESIGNAL_APP_ID=...      # Real OneSignal ID
AGORA_APP_ID=...          # Real Agora App ID
RAZORPAY_KEY_ID=...       # Or another payment gateway
MAIL_HOST=smtp.sendgrid.net  # Email SMTP
```

### 2. Queue Workers (BLOCKING - 45 minutes)
**Status:** ❌ Not running (emails, push notifications, payments won't work)
**Impact:** Background tasks don't process
**Fix:** See PRODUCTION_AUDIT_CHECKLIST.md section "Background Workers & Queues"

**Verify with:**
```bash
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 ps aux | grep queue:work
# Should show 4+ processes
```

### 3. Database Backups (CRITICAL - 5 minutes)
**Status:** ✅ Fixed by QUICK_DEPLOY_FIXES.sh
**Impact:** Data loss risk
**Verify:** `ls -lh /root/db-backups/`

### 4. OpCache (CRITICAL - 15 minutes)
**Status:** ❌ Likely disabled (poor performance)
**Impact:** 5x slower response times
**Fix:** See PRODUCTION_AUDIT_CHECKLIST.md section "OpCache Configuration"

**Verify with:**
```bash
docker exec lo4wc0888kowwwco8w0gsoco-220639619982 php -i | grep opcache.enable
# Should show: opcache.enable => On => On
```

### 5. Redis (HIGH PRIORITY - 15 minutes)
**Status:** ❌ Likely not deployed
**Impact:** Slower sessions, caching, queues
**Fix:** See Phase 2 above

**Verify with:**
```bash
docker ps | grep redis
# Should show running Redis container
```

---

## 📊 Success Metrics

After implementing all fixes, you should achieve:

### Performance
- ✅ API response time: < 200ms (95th percentile)
- ✅ Database queries: < 50ms average
- ✅ Page load time: < 2 seconds
- ✅ Zero downtime deployments

### Reliability
- ✅ Uptime: > 99.9%
- ✅ Failed jobs: < 1% of total
- ✅ Database backup success: 100%
- ✅ SSL certificate auto-renewal: Working

### Security
- ✅ SSL grade: A+ (check on ssllabs.com)
- ✅ Container security: Non-root user
- ✅ File uploads: Secured (no execute permissions)
- ✅ Rate limiting: Configured
- ✅ All secrets: Properly configured

---

## 📖 Document Map

| Document | Purpose | When to Use | Time Required |
|----------|---------|-------------|---------------|
| **QUICK_DEPLOY_FIXES.sh** | Initial setup & automated fixes | First run | 5-10 min |
| **PRODUCTION_AUDIT_CHECKLIST.md** | Complete production hardening | Full implementation | 2-4 hours |
| **TROUBLESHOOTING_GUIDE.md** | Problem solving | When issues occur | 5-30 min/issue |
| **DAILY_OPERATIONS_CHECKLIST.md** | Ongoing maintenance | Daily/weekly/monthly | 5-30 min |
| **README_PRODUCTION_DEPLOYMENT.md** | Overview & roadmap | Planning & reference | 10 min read |

---

## 🔍 How to Use These Guides

### For First-Time Setup:
1. Read this README (10 minutes)
2. Run QUICK_DEPLOY_FIXES.sh (10 minutes)
3. Follow Phase 1 and Phase 2 from implementation order above (2-3 hours)
4. Verify all critical issues are resolved
5. Set up daily operations routine

### For Ongoing Operations:
1. Use DAILY_OPERATIONS_CHECKLIST.md for routine checks
2. Refer to TROUBLESHOOTING_GUIDE.md when issues occur
3. Review PRODUCTION_AUDIT_CHECKLIST.md monthly for missed items

### For Emergencies:
1. Go straight to TROUBLESHOOTING_GUIDE.md
2. Find your issue in the 12 common problems
3. Follow the immediate fix steps
4. If not listed, check emergency recovery procedures

---

## 📞 Getting Help

If you encounter issues not covered in these guides:

1. **Check Logs First:**
   ```bash
   docker logs lo4wc0888kowwwco8w0gsoco-220639619982 --tail 200
   docker exec lo4wc0888kowwwco8w0gsoco-220639619982 tail -200 storage/logs/laravel.log
   ```

2. **Gather System Info:**
   ```bash
   docker stats --no-stream
   df -h
   docker exec z8co40wo4sc8ow4wsog4cw44 mysql -u root -p -e "SHOW PROCESSLIST;"
   ```

3. **Review Relevant Guide:**
   - Configuration issue? → PRODUCTION_AUDIT_CHECKLIST.md
   - Error message? → TROUBLESHOOTING_GUIDE.md
   - Performance problem? → DAILY_OPERATIONS_CHECKLIST.md

4. **Check Official Documentation:**
   - Laravel: https://laravel.com/docs
   - Docker: https://docs.docker.com
   - Coolify: https://coolify.io/docs
   - Firebase: https://firebase.google.com/docs
   - Agora: https://docs.agora.io

---

## 🎉 Expected Outcomes

After completing all phases, your production environment will have:

### ✅ Reliability
- Automated daily database backups
- Container health monitoring every 5 minutes
- Automatic restart on failure
- Zero-downtime deployments
- 99.9%+ uptime

### ✅ Performance
- 5x faster with OpCache
- Redis caching for sessions/cache/queues
- Optimized database queries with proper indexes
- CDN for static assets (optional)
- < 200ms API response times

### ✅ Security
- All secrets properly configured (no placeholders)
- SSL certificate auto-renewal
- Non-root container user
- Secured file uploads
- Rate limiting enabled
- Regular security audits

### ✅ Monitoring
- External uptime monitoring (UptimeRobot)
- Automated health checks
- Disk space alerts
- Database connection monitoring
- Performance benchmarking
- Centralized logging (optional)

### ✅ Operations
- Documented procedures for common tasks
- Troubleshooting guide for 12 common issues
- Daily/weekly/monthly maintenance routines
- Emergency recovery procedures
- Complete command reference
- Clear alert thresholds

---

## 🚀 Next Steps

1. **Right Now** (5 minutes):
   - SSH to your server: `ssh root@api.2sweety.com`
   - Run: `bash QUICK_DEPLOY_FIXES.sh`

2. **Today** (2 hours):
   - Fix critical blocking issues (environment variables, queue workers)
   - Verify app features work (login, chat, calls, payments)

3. **This Week** (2 hours):
   - Complete Phase 2 implementation
   - Set up monitoring
   - Test backup restoration

4. **This Month** (2 hours):
   - Complete Phase 3 (security hardening, optimization)
   - Establish operational routines
   - Document any custom configurations

5. **Ongoing** (5-30 min/day):
   - Daily health checks
   - Weekly maintenance
   - Monthly deep dive
   - Continuous improvement

---

## 📝 Version History

- **v1.0** (2025-10-30): Initial production audit and deployment guides
- Comprehensive audit of dating app deployment
- 4 complete operational guides
- 12 common issue troubleshooting
- Daily/weekly/monthly maintenance procedures

---

## 📄 Files in This Package

```
/Users/max/Downloads/2sweet/
├── README_PRODUCTION_DEPLOYMENT.md (this file)
├── QUICK_DEPLOY_FIXES.sh (run first!)
├── PRODUCTION_AUDIT_CHECKLIST.md (complete audit)
├── TROUBLESHOOTING_GUIDE.md (issue fixes)
└── DAILY_OPERATIONS_CHECKLIST.md (ongoing operations)
```

---

**Remember:** Production deployment is an iterative process. Start with the critical fixes, then progressively improve your infrastructure. These guides give you a complete roadmap from "barely working" to "enterprise-grade production system."

**Good luck! 🚀**
