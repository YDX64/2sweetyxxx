# ✅ 2Sweety Production Deployment Checklist

## 📋 Pre-Deployment Phase

### Infrastructure Setup
- [ ] Coolify server provisioned (4GB RAM, 4 CPU cores, 50GB disk minimum)
- [ ] Server firewall configured (ports 22, 80, 443 only)
- [ ] Domain DNS configured and propagated
  - [ ] A record: `2sweety.com` → Server IP
  - [ ] A record: `api.2sweety.com` → Server IP
  - [ ] (Optional) CNAME: `app.2sweety.com` → `2sweety.com`
- [ ] DNS propagation verified (nslookup command)

### API Keys Acquired
- [ ] Firebase project configured (sweet-a6718) ✅ Already done
- [ ] Agora App ID obtained
- [ ] Google Maps API Key obtained and restricted
- [ ] OneSignal App ID and REST API Key obtained
- [ ] Payment gateway accounts created:
  - [ ] Razorpay (test keys)
  - [ ] Stripe (test keys)
  - [ ] PayPal (sandbox credentials)
- [ ] Google OAuth Client ID (optional)
- [ ] Facebook App ID (optional)

### Code Preparation
- [ ] Backend code reviewed and ready
- [ ] Frontend code reviewed and ready
- [ ] Database SQL file located: `mobile-app/Gommet Database 1.5/Gomeet.sql`
- [ ] All configuration files created:
  - [ ] Backend Dockerfile
  - [ ] Backend .htaccess
  - [ ] Backend Connection.php updated
  - [ ] Frontend Dockerfile
  - [ ] Frontend nginx.conf
  - [ ] Frontend nginx-default.conf

---

## 🗄️ Database Deployment

### MySQL Container Setup
- [ ] MySQL 8.0 container created in Coolify
  - [ ] Name: `2sweety-mysql`
  - [ ] Database: `gommet`
  - [ ] User: `gomeet_user`
  - [ ] Strong passwords generated and saved
  - [ ] Resource limits set (1GB RAM minimum)
  - [ ] Internal network only (no external exposure)
- [ ] Container status: Running

### Database Import
- [ ] SQL file imported successfully
- [ ] Table count verified: 24 tables
- [ ] Admin user verified: username `admin` exists
- [ ] Admin password changed from default (admin@123)
- [ ] Database connection tested from container

### Database Configuration
- [ ] Backup script configured (`database-backup.sh`)
- [ ] Automated backups scheduled (cron job)
- [ ] Backup retention policy set (30 days)
- [ ] Test backup created and verified
- [ ] Database credentials saved in password manager

---

## 🔧 Backend API Deployment

### Container Setup
- [ ] Backend application created in Coolify
  - [ ] Name: `2sweety-backend-api`
  - [ ] Source: Dockerfile
  - [ ] Domain: `api.2sweety.com`
  - [ ] Resource limits set (512MB RAM, 1 CPU)

### Environment Variables
- [ ] Database connection configured:
  ```
  DB_HOST=2sweety-mysql
  DB_NAME=gommet
  DB_USER=gomeet_user
  DB_PASSWORD=[saved-password]
  ```
- [ ] PHP configuration set:
  ```
  PHP_UPLOAD_MAX_FILESIZE=10M
  PHP_POST_MAX_SIZE=10M
  PHP_MAX_EXECUTION_TIME=300
  PHP_MEMORY_LIMIT=256M
  ```
- [ ] Application settings:
  ```
  APP_ENV=production
  APP_DEBUG=false
  APP_URL=https://api.2sweety.com
  ```

### SSL & Security
- [ ] Let's Encrypt SSL certificate generated
- [ ] HTTPS redirection enabled
- [ ] CORS headers configured in .htaccess
- [ ] Security headers verified (X-Frame-Options, CSP, etc.)
- [ ] File upload directories created and permissions set (777 on /images/)

### Deployment Verification
- [ ] Container status: Running
- [ ] Build logs reviewed (no errors)
- [ ] Health check endpoint responding:
  - [ ] `curl https://api.2sweety.com/` returns admin login page
  - [ ] `curl https://api.2sweety.com/api/languagelist.php` returns JSON
- [ ] Admin panel accessible: `https://api.2sweety.com/`
- [ ] Admin login successful with new password
- [ ] Database connection from backend verified

### Backend Configuration
- [ ] Admin panel settings updated:
  - [ ] App name and logo uploaded
  - [ ] App URL set: `https://2sweety.com`
  - [ ] API URL set: `https://api.2sweety.com`
- [ ] Database settings table updated:
  ```sql
  UPDATE tbl_setting SET
    weburl = 'https://2sweety.com',
    apiurl = 'https://api.2sweety.com',
    map_key = 'your-google-maps-api-key',
    agora_app_id = 'your-agora-app-id',
    onesignal_app_id = 'your-onesignal-app-id',
    onesignal_auth_key = 'your-onesignal-rest-api-key';
  ```
- [ ] Payment gateway credentials added to settings table
- [ ] Subscription plans configured in admin panel
- [ ] Coin packages configured in admin panel

---

## 🎨 Frontend Deployment

### Container Setup
- [ ] Frontend application created in Coolify
  - [ ] Name: `2sweety-frontend`
  - [ ] Source: Dockerfile
  - [ ] Domain: `2sweety.com` (and optional `app.2sweety.com`)
  - [ ] Resource limits set (256MB RAM, 1 CPU)

### Build Arguments (CRITICAL!)
⚠️ **These MUST be set as BUILD ARGUMENTS, not runtime env vars!**

- [ ] API endpoints configured:
  ```
  REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
  REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
  REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/
  ```

- [ ] Firebase configuration (already provided):
  ```
  REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
  REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
  REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
  REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
  REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
  REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
  REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP
  ```

- [ ] External services configured:
  ```
  REACT_APP_AGORA_APP_ID=[your-agora-app-id]
  REACT_APP_ONESIGNAL_APP_ID=[your-onesignal-app-id]
  REACT_APP_GOOGLE_MAPS_API_KEY=[your-google-maps-api-key]
  ```

- [ ] Payment gateways (public keys only):
  ```
  REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxx
  REACT_APP_PAYPAL_CLIENT_ID=[your-paypal-client-id]
  REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxx
  ```

- [ ] Build optimization:
  ```
  REACT_APP_ENVIRONMENT=production
  GENERATE_SOURCEMAP=false
  ESLINT_NO_DEV_ERRORS=true
  ```

### SSL & Security
- [ ] Let's Encrypt SSL certificate generated
- [ ] HTTPS enforced
- [ ] Security headers verified in browser DevTools
- [ ] Content Security Policy (CSP) configured
- [ ] Service workers accessible (if using)

### Deployment Verification
- [ ] Container status: Running
- [ ] Build completed successfully (10-15 minutes)
- [ ] Build logs reviewed (no errors)
- [ ] Health check responding: `curl https://2sweety.com/health`
- [ ] Website loads in browser: `https://2sweety.com`
- [ ] No console errors in browser DevTools
- [ ] All static assets loading (CSS, JS, images)

---

## 🔗 Integration Testing

### Frontend → Backend Connection
- [ ] API calls working (test in browser console):
  ```javascript
  fetch('https://api.2sweety.com/api/languagelist.php')
    .then(r => r.json())
    .then(console.log)
  ```
- [ ] No CORS errors in browser console
- [ ] Images loading from backend
- [ ] API base URL correct in all requests

### Firebase Integration
- [ ] Firebase initialized successfully (check browser console)
- [ ] Firebase Authentication working:
  - [ ] Email/password registration
  - [ ] Email/password login
  - [ ] Google login (if configured)
  - [ ] Facebook login (if configured)
- [ ] Firestore database accessible
- [ ] Firebase Storage working (image uploads)
- [ ] Firebase Messaging initialized (push notifications)
- [ ] Authorized domains added in Firebase Console:
  - [ ] `2sweety.com`
  - [ ] `app.2sweety.com`

### Real-time Features
- [ ] Chat functionality working:
  - [ ] Create 2 test users
  - [ ] Send message from User A
  - [ ] Receive message on User B (real-time)
  - [ ] Messages persisted in Firestore
- [ ] Typing indicators working
- [ ] Online/offline status updating

### Video/Audio Calling (Agora)
- [ ] Agora initialized successfully
- [ ] Video call connects between 2 users
- [ ] Audio call connects between 2 users
- [ ] Call quality acceptable
- [ ] Call disconnect/hangup working
- [ ] Agora usage showing in dashboard

### Location Services
- [ ] Google Maps loading correctly
- [ ] User location detection working
- [ ] Nearby users calculation working
- [ ] Distance display accurate
- [ ] Map markers showing correctly

### Push Notifications (OneSignal)
- [ ] OneSignal initialized
- [ ] Push notification permission prompt showing
- [ ] Test notification sent and received
- [ ] Notification click opens app
- [ ] Notification icon displaying correctly

---

## 💳 Payment Testing

### Razorpay (Test Mode)
- [ ] Razorpay test keys configured
- [ ] Payment gateway UI loading
- [ ] Test payment successful (use test cards)
- [ ] Transaction recorded in database
- [ ] Coins/subscription activated after payment
- [ ] Webhook callback received and processed
- [ ] Payment failure handled gracefully

### Stripe (Test Mode)
- [ ] Stripe test keys configured
- [ ] Stripe Checkout loading
- [ ] Test payment successful (use test card: 4242 4242 4242 4242)
- [ ] Transaction recorded in database
- [ ] Webhook callback working
- [ ] Payment failure scenarios tested

### PayPal (Sandbox Mode)
- [ ] PayPal sandbox credentials configured
- [ ] PayPal button displaying
- [ ] Sandbox payment successful
- [ ] Return URL redirecting correctly
- [ ] Transaction recorded in database
- [ ] Refund process tested (in admin panel)

---

## 👥 User Flow Testing

### Registration & Onboarding
- [ ] Registration form working (all fields)
- [ ] Phone number verification (if implemented)
- [ ] Email verification working
- [ ] Multi-step onboarding completing:
  - [ ] Phone verification
  - [ ] Birthdate selection
  - [ ] Gender selection
  - [ ] Dating goals
  - [ ] Location permission
  - [ ] Hobbies selection
  - [ ] Language preferences
  - [ ] Religion (optional)
  - [ ] Preferences (age range, distance)
  - [ ] Profile images upload (min 1, max 6)
- [ ] Profile created successfully
- [ ] User redirected to main app

### Profile Management
- [ ] Profile view loading correctly
- [ ] Profile edit working (all fields)
- [ ] Image upload working (max 10MB)
- [ ] Image delete working
- [ ] Profile update saving to database
- [ ] Bio character limit enforced
- [ ] Age calculated correctly from birthdate

### Matching & Discovery
- [ ] Home feed showing potential matches
- [ ] Swipe right (like) working
- [ ] Swipe left (dislike) working
- [ ] Match notification showing
- [ ] Match stored in database
- [ ] Filters working (age, distance, gender)
- [ ] Match algorithm calculating correctly
- [ ] No duplicate profiles showing

### Chat & Messaging
- [ ] Match list showing all matches
- [ ] Chat opens when match clicked
- [ ] Text messages sending/receiving
- [ ] Message timestamps correct
- [ ] Read receipts working (if implemented)
- [ ] Chat history loading on scroll
- [ ] Emoji/special characters working
- [ ] Image/GIF sharing (if implemented)

### Premium Features
- [ ] Premium plan display in UI
- [ ] Plan purchase working (test payment)
- [ ] Premium features unlocked after purchase
- [ ] Subscription expiry handled correctly
- [ ] Subscription renewal reminders

### Coin System
- [ ] Coin packages displaying
- [ ] Coin purchase working (test payment)
- [ ] Coin balance updating after purchase
- [ ] Coin deduction for premium actions:
  - [ ] Send gift
  - [ ] Super like
  - [ ] Boost profile
  - [ ] Unlock private photos
- [ ] Insufficient coins error handling

---

## 🔒 Security Verification

### SSL/TLS
- [ ] All domains using HTTPS
- [ ] No mixed content warnings
- [ ] SSL Labs test score A or A+
  - Test at: https://www.ssllabs.com/ssltest/
- [ ] HSTS header enabled (optional but recommended)

### API Security
- [ ] API endpoints not publicly exposed (except public routes)
- [ ] Authentication required for protected routes
- [ ] CORS configured correctly (only allowed origins)
- [ ] SQL injection tested and prevented
- [ ] XSS protection verified
- [ ] CSRF protection enabled (admin panel)
- [ ] Rate limiting implemented (if available)
- [ ] File upload validation working:
  - [ ] File size limits enforced
  - [ ] File type validation (images only)
  - [ ] Malicious file detection

### Authentication & Authorization
- [ ] Password strength requirements enforced
- [ ] Password hashing verified (bcrypt/argon2)
- [ ] Session management secure
- [ ] JWT tokens expiring correctly (if used)
- [ ] Firebase auth rules configured
- [ ] Firestore security rules preventing unauthorized access

### Data Privacy
- [ ] User data encrypted in transit (HTTPS)
- [ ] Database credentials not exposed
- [ ] API keys restricted by domain/IP
- [ ] Admin panel login secure (strong password)
- [ ] User deletion working (GDPR compliance)
- [ ] Data export functionality (optional)

### Secrets Management
- [ ] No .env files committed to Git
- [ ] Build arguments used (not runtime env vars for React)
- [ ] Secret keys never in client-side code
- [ ] Payment gateway secrets on backend only
- [ ] All credentials saved in password manager

---

## 📊 Monitoring & Observability

### Application Monitoring
- [ ] Coolify service metrics accessible
- [ ] CPU usage < 50% under normal load
- [ ] Memory usage < 70% under normal load
- [ ] Disk usage < 60%
- [ ] Application logs accessible in Coolify
- [ ] Error tracking configured (Sentry - optional)

### Uptime Monitoring
- [ ] Uptime monitoring service configured (UptimeRobot)
- [ ] Monitoring endpoints:
  - [ ] `https://2sweety.com/health`
  - [ ] `https://api.2sweety.com/api/health.php`
- [ ] Alert email/SMS configured
- [ ] Check interval: 5 minutes

### Performance Testing
- [ ] Frontend load time < 3 seconds
- [ ] API response time < 1 second
- [ ] Database queries optimized (no N+1 queries)
- [ ] Page size < 2MB (compressed)
- [ ] Lighthouse score > 80 (Performance)
- [ ] Core Web Vitals passing:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1

### Analytics
- [ ] Google Analytics tracking working (via Firebase)
- [ ] User registration events tracked
- [ ] Payment events tracked
- [ ] Error events tracked
- [ ] Custom events configured (match, message, etc.)

---

## 💾 Backup & Disaster Recovery

### Automated Backups
- [ ] Database backup script configured
- [ ] Daily backup cron job scheduled:
  ```
  0 2 * * * /path/to/database-backup.sh
  ```
- [ ] Backup retention policy set (30 days)
- [ ] First backup created and verified
- [ ] Backup restoration tested successfully
- [ ] Backup storage location secure

### Cloud Backup (Optional)
- [ ] Backups uploaded to cloud storage (AWS S3/Google Cloud)
- [ ] Cloud backup access tested
- [ ] Backup encryption enabled

### Disaster Recovery Plan
- [ ] Recovery Time Objective (RTO) defined: < 4 hours
- [ ] Recovery Point Objective (RPO) defined: < 24 hours
- [ ] Disaster recovery procedure documented
- [ ] Emergency contact list created
- [ ] Rollback procedure documented

---

## 🚀 Go-Live Preparation

### Final Checks
- [ ] All test users removed or marked as test
- [ ] Demo content removed
- [ ] Production API keys configured (switch from test)
- [ ] Payment gateways in LIVE mode (after thorough testing)
- [ ] Error messages user-friendly (no stack traces)
- [ ] Debug mode disabled in all services
- [ ] Source maps disabled in frontend
- [ ] Console logs removed from production code

### Content Setup
- [ ] App name and branding finalized
- [ ] App logo uploaded (multiple sizes)
- [ ] About page content added
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Contact information updated
- [ ] FAQ section populated
- [ ] Help/support documentation created

### Marketing & SEO
- [ ] Meta tags configured (title, description, keywords)
- [ ] Open Graph tags for social sharing
- [ ] Twitter Card meta tags
- [ ] Favicon set (multiple sizes)
- [ ] robots.txt configured
- [ ] sitemap.xml generated
- [ ] Google Search Console verified
- [ ] Google Analytics property created

### Legal & Compliance
- [ ] Privacy policy reviewed by legal (if required)
- [ ] Terms of service reviewed
- [ ] Cookie consent banner (if EU users)
- [ ] GDPR compliance verified (if applicable)
- [ ] Age verification (18+ requirement)
- [ ] Content moderation plan in place
- [ ] Abuse reporting system functional

---

## 📱 Mobile App Integration (If Applicable)

### Flutter App Configuration
- [ ] API URLs updated to production:
  ```
  https://api.2sweety.com/api/
  ```
- [ ] Firebase configuration updated (iOS/Android)
- [ ] Agora App ID updated
- [ ] OneSignal App ID updated
- [ ] Google Maps API Key updated (Android/iOS)
- [ ] Payment gateway keys updated

### Mobile Testing
- [ ] App connects to production backend
- [ ] User registration working
- [ ] Login working
- [ ] Push notifications working (iOS/Android)
- [ ] In-app purchases configured (if using)
- [ ] App Store/Play Store metadata ready

---

## 📈 Post-Launch Monitoring (First 48 Hours)

### Hour 1-4 (Critical Window)
- [ ] Monitor error logs every 30 minutes
- [ ] Check server resource usage (CPU, RAM, disk)
- [ ] Verify SSL certificates active
- [ ] Monitor user registrations
- [ ] Check payment processing
- [ ] Verify email/SMS delivery
- [ ] Monitor API response times

### Hour 4-24 (Active Monitoring)
- [ ] Review error logs every 2 hours
- [ ] Check database performance
- [ ] Monitor Firebase usage/quota
- [ ] Review user feedback
- [ ] Check for payment issues
- [ ] Verify chat functionality
- [ ] Monitor video call quality

### Hour 24-48 (Stabilization)
- [ ] Daily error log review
- [ ] Performance metrics analysis
- [ ] User behavior analytics review
- [ ] Payment reconciliation
- [ ] Database optimization if needed
- [ ] Scaling decisions (if high load)

---

## 🎉 Success Criteria

### Technical Success
- ✅ All services running (green status in Coolify)
- ✅ Zero critical errors in 24 hours
- ✅ Uptime > 99.9%
- ✅ Average response time < 1 second
- ✅ SSL certificates active on all domains
- ✅ Backups running successfully
- ✅ Monitoring and alerts functional

### Business Success
- ✅ Users can register and create profiles
- ✅ Matching algorithm working correctly
- ✅ Chat functionality 100% reliable
- ✅ Video calls connecting successfully
- ✅ Payments processing without errors
- ✅ Zero user-reported critical bugs
- ✅ Positive initial user feedback

---

## 🆘 Emergency Contacts

### Technical Support
- **Coolify Support:** https://coollabs.io/discord
- **Server Provider:** [your-hosting-provider]
- **Domain Registrar:** [your-domain-registrar]

### Service Providers
- **Firebase Support:** https://firebase.google.com/support
- **Agora Support:** https://www.agora.io/en/support/
- **Payment Gateways:** (check each provider's support page)

### Internal Team
- **DevOps Lead:** [name/email/phone]
- **Backend Developer:** [name/email/phone]
- **Frontend Developer:** [name/email/phone]
- **Database Admin:** [name/email/phone]

---

## 📋 Deployment Sign-Off

### Deployment Team Sign-Off

**DevOps Engineer:**
- Name: ________________
- Date: ________________
- Signature: ________________

**Backend Developer:**
- Name: ________________
- Date: ________________
- Signature: ________________

**Frontend Developer:**
- Name: ________________
- Date: ________________
- Signature: ________________

**QA Tester:**
- Name: ________________
- Date: ________________
- Signature: ________________

**Project Manager:**
- Name: ________________
- Date: ________________
- Signature: ________________

### Go-Live Authorization

**Authorized By:**
- Name: ________________
- Title: ________________
- Date: ________________
- Signature: ________________

---

## 📝 Notes & Issues Log

### Deployment Notes:
```
[Add any notes, observations, or special configurations here]







```

### Known Issues (Non-Blocking):
```
[List any known issues that don't prevent go-live]







```

### Follow-Up Tasks (Post-Launch):
```
[List tasks to be completed after launch]







```

---

**Deployment Date:** ________________

**Go-Live Time:** ________________

**Deployment Status:** ⬜ In Progress  ⬜ Completed  ⬜ Rolled Back

**Overall Status:** ⬜ Success  ⬜ Partial Success  ⬜ Failed

---

**End of Checklist**

*Estimated completion time: 3-4 hours (excluding API key acquisition)*
*Last updated: October 2025*
