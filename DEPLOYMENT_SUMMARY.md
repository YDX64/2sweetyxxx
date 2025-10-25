# 🎯 2Sweety Quick Deployment Summary

## 📌 Quick Reference

### Domain Structure
- **Frontend:** https://2sweety.com (or https://app.2sweety.com)
- **Backend API:** https://api.2sweety.com
- **Admin Panel:** https://api.2sweety.com/ (login page)

### Service Overview
```
┌─────────────────┬──────────────────┬─────────────┬──────────────┐
│ Service         │ Type             │ Port        │ SSL          │
├─────────────────┼──────────────────┼─────────────┼──────────────┤
│ MySQL Database  │ Database         │ 3306 (int)  │ N/A          │
│ PHP Backend     │ Application      │ 80          │ Let's Encrypt│
│ React Frontend  │ Static Site      │ 8080        │ Let's Encrypt│
└─────────────────┴──────────────────┴─────────────┴──────────────┘
```

---

## ⚡ 5-Minute Deployment Steps

### Step 1: Deploy Database (2 minutes)
```bash
Coolify → New Resource → Database → MySQL 8.0
Name: 2sweety-mysql
Database: gommet
User: gomeet_user
Password: [generate-strong-password]
→ Deploy
```

### Step 2: Import Database Schema (1 minute)
```bash
# Upload Gomeet.sql via phpMyAdmin or CLI
docker cp Gomeet.sql 2sweety-mysql:/tmp/
docker exec -i 2sweety-mysql mysql -u root -p gommet < /tmp/Gomeet.sql
```

### Step 3: Deploy Backend (5 minutes)
```bash
Coolify → New Resource → Application → Dockerfile
Name: 2sweety-backend-api
Domain: api.2sweety.com
Build: Use provided Dockerfile

Environment Variables:
  DB_HOST=2sweety-mysql
  DB_NAME=gommet
  DB_USER=gomeet_user
  DB_PASSWORD=[your-password]

→ Deploy → Enable SSL
```

### Step 4: Deploy Frontend (10 minutes)
```bash
Coolify → New Resource → Application → Dockerfile
Name: 2sweety-frontend
Domain: 2sweety.com

Build Arguments (IMPORTANT - these are build-time variables!):
  REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
  REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
  REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
  REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
  REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
  REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
  REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
  REACT_APP_AGORA_APP_ID=[get-from-agora.io]
  REACT_APP_ONESIGNAL_APP_ID=[get-from-onesignal.com]
  REACT_APP_GOOGLE_MAPS_API_KEY=[get-from-google-cloud]

→ Deploy → Enable SSL
```

### Step 5: Configure Backend Settings (2 minutes)
```sql
-- Access MySQL and update settings
USE gommet;

UPDATE tbl_setting SET
  weburl = 'https://2sweety.com',
  apiurl = 'https://api.2sweety.com',
  map_key = 'your-google-maps-api-key',
  agora_app_id = 'your-agora-app-id',
  onesignal_app_id = 'your-onesignal-app-id';

-- Change admin password
UPDATE admin SET password = 'new-secure-password' WHERE username = 'admin';
```

### Step 6: Test Everything (5 minutes)
```bash
# Test frontend
curl https://2sweety.com/health

# Test backend API
curl https://api.2sweety.com/api/languagelist.php

# Test admin panel
https://api.2sweety.com/ (login: admin / your-new-password)

# Test user flow
1. Open https://2sweety.com
2. Register new account
3. Upload profile image
4. Test chat (requires 2 users)
```

**Total Time: ~25 minutes** (excluding API key acquisition)

---

## 🔑 API Keys Required

### Essential (App Won't Work Without These):
1. **Firebase** - Free (already configured)
   - Get from: https://console.firebase.google.com/
   - Already have: sweet-a6718 project
   - ✅ Config provided in deployment guide

2. **Agora** - Free tier available
   - Get from: https://console.agora.io/
   - Sign up → Create project → Copy App ID
   - Free: 10,000 minutes/month

3. **Google Maps** - Free tier: $200/month credit
   - Get from: https://console.cloud.google.com/
   - Enable APIs: Maps JavaScript, Geocoding, Places
   - Create API Key → Restrict by domain

### Important (Core Features):
4. **OneSignal** - Free (push notifications)
   - Get from: https://app.onesignal.com/
   - Create app → Get App ID

5. **Payment Gateways** - Test mode free
   - Razorpay: https://dashboard.razorpay.com/
   - Stripe: https://dashboard.stripe.com/
   - PayPal: https://developer.paypal.com/
   - Use TEST keys first, LIVE keys after testing

### Optional (Social Login):
6. **Google OAuth** - Free
   - Get from: https://console.cloud.google.com/
   - Create OAuth 2.0 Client ID

7. **Facebook App** - Free
   - Get from: https://developers.facebook.com/
   - Create app → Add Facebook Login

---

## 📝 Environment Variables Cheat Sheet

### Backend (Runtime Environment Variables)
```bash
DB_HOST=2sweety-mysql
DB_NAME=gommet
DB_USER=gomeet_user
DB_PASSWORD=[secure-password]
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.2sweety.com
```

### Frontend (Build Arguments - Set Before Build!)
```bash
# API Endpoints
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/

# Firebase (already configured - use these values)
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

# External Services (GET THESE)
REACT_APP_AGORA_APP_ID=your-agora-app-id-here
REACT_APP_ONESIGNAL_APP_ID=your-onesignal-app-id-here
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# Payment Gateways (PUBLIC keys only)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxx
REACT_APP_PAYPAL_CLIENT_ID=your-paypal-client-id
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx

# Build Configuration
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
```

**⚠️ CRITICAL:** React variables must be set as BUILD ARGUMENTS in Coolify, not runtime environment variables! They are embedded into the JavaScript bundle at build time.

---

## 🔒 Security Checklist (First 24 Hours)

- [ ] Change admin password from default (admin@123)
- [ ] Enable HTTPS on all domains (Let's Encrypt via Coolify)
- [ ] Configure CORS headers in backend .htaccess
- [ ] Restrict API keys by domain in provider dashboards
- [ ] Set database user password (not root password)
- [ ] Remove phpMyAdmin after database import
- [ ] Verify file upload permissions (777 on /images/)
- [ ] Enable database backups (automated)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Configure error tracking (Sentry)
- [ ] Test payment gateways in SANDBOX mode first
- [ ] Add authorized domains in Firebase Console
- [ ] Review Nginx security headers
- [ ] Verify no .env files committed to Git
- [ ] Enable firewall (ports 22, 80, 443 only)

---

## 🚨 Common Pitfalls & Solutions

### Pitfall 1: React env vars not working
**Problem:** API calls fail with "undefined" URL

**Why:** React embeds env vars at BUILD time, not runtime

**Solution:** Add env vars as BUILD ARGUMENTS in Coolify, then rebuild app

### Pitfall 2: CORS errors in browser
**Problem:** "Access-Control-Allow-Origin" error

**Why:** Backend not allowing frontend domain

**Solution:** Update backend .htaccess:
```apache
Header set Access-Control-Allow-Origin "https://2sweety.com"
```

### Pitfall 3: Database connection failed
**Problem:** Backend can't connect to MySQL

**Why:** Using wrong host name or credentials

**Solution:** Use service name as host:
```bash
DB_HOST=2sweety-mysql  # NOT localhost!
```

### Pitfall 4: Images won't upload
**Problem:** File upload returns 500 error

**Why:** Directory permissions too restrictive

**Solution:**
```bash
docker exec 2sweety-backend-api chmod -R 777 /var/www/html/images
```

### Pitfall 5: SSL certificate fails
**Problem:** Let's Encrypt can't verify domain

**Why:** DNS not propagated or port 80 blocked

**Solution:**
- Check DNS: `nslookup 2sweety.com`
- Ensure port 80 accessible
- Wait for DNS propagation (up to 48h)

---

## 📊 Resource Requirements

### Minimum (Development/Testing)
```
Server: 2GB RAM, 2 CPU cores, 20GB disk
MySQL: 512MB RAM
Backend: 256MB RAM
Frontend: 128MB RAM
Total: ~1GB RAM allocated
```

### Recommended (Production - 100 users)
```
Server: 4GB RAM, 4 CPU cores, 50GB disk
MySQL: 1GB RAM, 10GB disk
Backend: 512MB RAM, 5GB disk
Frontend: 256MB RAM, 2GB disk
Total: ~2GB RAM allocated
```

### Scaling (Production - 10,000+ users)
```
Server: 8GB+ RAM, 8+ CPU cores, 200GB+ disk
MySQL: 2GB+ RAM (or managed database)
Backend: Multiple instances (2-4 replicas)
Frontend: CDN + multiple replicas
Consider: Load balancer, Redis cache, read replicas
```

---

## 🔄 Deployment Updates (CI/CD)

### Manual Deployment (via Coolify)
```
1. Make code changes locally
2. Commit to Git repository
3. Push to GitHub/GitLab
4. Coolify auto-deploys on push (if webhook configured)
   OR
   Click "Redeploy" in Coolify dashboard
```

### Automated Deployment (GitHub Actions)
```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Trigger Coolify Webhook
        run: |
          curl -X POST https://your-coolify-instance.com/api/deploy/webhook-url
```

---

## 📈 Post-Deployment Monitoring

### Day 1 - Critical Monitoring
- [ ] All services running (green status in Coolify)
- [ ] No errors in application logs
- [ ] SSL certificates active
- [ ] Database connections stable
- [ ] User registration working
- [ ] Payment sandbox tested
- [ ] Chat functionality working
- [ ] Image uploads working

### Week 1 - Performance Monitoring
- [ ] Response times < 2 seconds
- [ ] Database query performance
- [ ] Server resource usage (CPU, memory, disk)
- [ ] Error rate < 1%
- [ ] Backup verification
- [ ] User feedback collection

### Month 1 - Optimization
- [ ] Database optimization (indexes, query analysis)
- [ ] CDN setup (Cloudflare)
- [ ] Cost optimization
- [ ] Feature analytics
- [ ] Security audit
- [ ] Performance testing (load testing)

---

## 🆘 Emergency Contacts & Resources

### If Something Breaks:

1. **Check Service Logs:**
   - Coolify → Service → Logs tab
   - Look for red error messages

2. **Restart Services:**
   - Coolify → Service → Actions → Restart

3. **Rollback Deployment:**
   - Coolify → Service → Deployments → Previous version → Redeploy

4. **Database Issues:**
   - Restore from backup
   - Check Connection.php credentials

5. **Get Help:**
   - Coolify Discord: https://coollabs.io/discord
   - Full deployment guide: COOLIFY_DEPLOYMENT_GUIDE.md
   - Security guide: SECURITY_GUIDE.md (if created)

---

## 📚 Next Steps After Deployment

1. **Content Setup (30 minutes):**
   - Add subscription plans via admin panel
   - Configure coin packages
   - Upload app logo and branding
   - Set app name and description
   - Add FAQs and pages

2. **Payment Gateway Testing (1 hour):**
   - Test each payment method in sandbox mode
   - Verify webhook callbacks
   - Test refund flows
   - Document transaction IDs

3. **User Testing (2 hours):**
   - Create 5-10 test accounts
   - Test full user journey
   - Verify matching algorithm
   - Test chat between users
   - Test video/audio calling
   - Test gift sending

4. **Mobile App Integration (if applicable):**
   - Update API URLs in Flutter app
   - Test mobile → backend connectivity
   - Verify push notifications
   - Test mobile payments

5. **Go Live Preparation:**
   - Switch to LIVE API keys (payment gateways)
   - Invite beta testers
   - Set up analytics dashboards
   - Prepare marketing materials
   - Plan launch strategy

---

## 🎉 Success Metrics

Your deployment is successful when:

✅ Frontend loads at https://2sweety.com
✅ Admin panel accessible at https://api.2sweety.com
✅ Users can register and create profiles
✅ Image uploads working
✅ Chat functionality working (Firebase)
✅ Video calls working (Agora)
✅ Payments working (sandbox mode)
✅ No errors in logs for 24 hours
✅ SSL certificates active (A+ rating)
✅ All services running with < 50% resource usage
✅ Database backups running daily
✅ Monitoring and alerts configured

---

**Congratulations! You're ready to deploy 2Sweety! 🚀**

For detailed step-by-step instructions, refer to:
- **COOLIFY_DEPLOYMENT_GUIDE.md** - Complete deployment instructions
- **API_KEYS_GUIDE.md** - How to get all required API keys
- **SECURITY_GUIDE.md** - Security best practices (optional)

**Estimated Total Deployment Time:** 2-3 hours (including API key acquisition)

Good luck! 💪
