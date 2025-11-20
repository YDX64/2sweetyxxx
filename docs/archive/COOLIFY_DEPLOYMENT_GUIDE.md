# 2Sweety - Coolify Deployment Guide

Complete production deployment guide for deploying 2Sweety React dating app to Coolify platform.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Architecture](#deployment-architecture)
4. [Step-by-Step Deployment](#step-by-step-deployment)
5. [Environment Variables Configuration](#environment-variables-configuration)
6. [Post-Deployment Configuration](#post-deployment-configuration)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)
9. [Rollback Procedures](#rollback-procedures)

---

## Overview

### What is 2Sweety?

2Sweety is a production-ready dating web application built with:
- **Frontend**: React 18.2.0
- **Build Tool**: Create React App
- **Deployment**: Docker + Nginx on Coolify
- **Real-time**: Firebase (Firestore, Messaging, Analytics)
- **Video/Audio**: Agora RTC
- **Push Notifications**: OneSignal
- **Payments**: Multiple gateways (Razorpay, PayPal, Stripe, etc.)

### Deployment Strategy

**Architecture**: Multi-stage Docker build with Nginx serving static React build

**Benefits**:
- ✅ Fast deployment (Docker-based)
- ✅ Optimized production builds
- ✅ Secure (non-root container, security headers)
- ✅ Scalable (stateless container)
- ✅ Zero-downtime deployments
- ✅ Built-in health checks
- ✅ Automated CI/CD with GitHub Actions

---

## Prerequisites

### Required Services & Accounts

1. **Coolify Instance**
   - Coolify v4+ installed and running
   - Access to Coolify dashboard
   - GitHub repository connected

2. **GitHub Repository**
   - Repository with 2Sweety code
   - GitHub Actions enabled
   - Repository secrets configured

3. **Firebase Project** ✅ (Already configured: sweet-a6718)
   - Web app registered
   - Firestore database enabled
   - Firebase Messaging enabled
   - Firebase Analytics enabled

4. **Third-Party Services** (Required for full functionality)
   - [ ] **Agora.io Account**: Video/audio calling
   - [ ] **OneSignal Account**: Push notifications
   - [ ] **Google Cloud Console**:
     - Maps API key
     - OAuth 2.0 credentials
   - [ ] **Payment Gateways** (as needed):
     - Razorpay
     - PayPal
     - Stripe
   - [ ] **Facebook Developer**: Facebook login

### Technical Requirements

- Domain name pointing to Coolify server (recommended)
- SSL certificate (Coolify can auto-provision via Let's Encrypt)
- Minimum server specs:
  - 2 CPU cores
  - 4GB RAM
  - 20GB storage

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              CLOUDFLARE / CDN (Optional)                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│              COOLIFY REVERSE PROXY (Traefik)                 │
│                    SSL Termination                           │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│                   DOCKER CONTAINER                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Nginx Web Server (Port 8080)            │   │
│  │  ┌────────────────────────────────────────────────┐  │   │
│  │  │         React Build (Static Files)             │  │   │
│  │  │  - index.html                                  │  │   │
│  │  │  - JavaScript bundles                          │  │   │
│  │  │  - CSS                                         │  │   │
│  │  │  - Images, fonts                               │  │   │
│  │  │  - Service Workers                             │  │   │
│  │  └────────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  │ API Calls
                  ▼
┌─────────────────────────────────────────────────────────────┐
│               EXTERNAL SERVICES                              │
│  - Backend API: gomeet.cscodetech.cloud                     │
│  - Firebase: Authentication, Firestore, Messaging           │
│  - Agora: Video/Audio calling                               │
│  - OneSignal: Push notifications                            │
│  - Payment Gateways: Razorpay, PayPal, Stripe, etc.        │
│  - Google Maps API                                           │
└─────────────────────────────────────────────────────────────┘
```

### Build Process

```
Developer → GitHub Push → GitHub Actions → Build Docker Image → Deploy to Coolify → Live
```

**Multi-stage Docker Build**:
1. **Stage 1 (Builder)**: Install deps → Build React app → Optimize
2. **Stage 2 (Production)**: Copy build → Configure Nginx → Serve

---

## Step-by-Step Deployment

### Option 1: Deploy via Coolify Dashboard (Recommended)

#### Step 1: Create New Application in Coolify

1. Log into your Coolify dashboard
2. Click **"New Resource"** → **"Application"**
3. Choose **"Public Repository"** or connect your GitHub repo
4. Configure:
   - **Repository URL**: `https://github.com/yourusername/2sweety.git`
   - **Branch**: `main` or `production`
   - **Build Pack**: `Dockerfile`
   - **Dockerfile Location**: `./Dockerfile` (in GoMeet Web folder)

#### Step 2: Configure Build Settings

In Coolify application settings:

1. **General Settings**:
   - **Name**: `2sweety-web`
   - **Port**: `8080`
   - **Health Check Path**: `/health`
   - **Health Check Method**: `GET`

2. **Build Configuration**:
   - **Build Command**: (Handled by Dockerfile)
   - **Base Directory**: `GoMeet Web` (if repo root is 2sweet)
   - **Dockerfile Path**: `Dockerfile`

3. **Domain Settings**:
   - Add your domain: `2sweety.com` or `app.2sweety.com`
   - Enable **SSL/TLS** (Let's Encrypt)
   - Enable **Force HTTPS**

#### Step 3: Configure Environment Variables

In Coolify **Environment Variables** section, add all variables as **Build Args**:

**CRITICAL**: These must be set as **Build Arguments**, not runtime environment variables, because React embeds them during build time.

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/

# Firebase (Already configured for sweet-a6718 project)
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

# OneSignal (Get from onesignal.com)
REACT_APP_ONESIGNAL_APP_ID=94b2b6c5-fabb-4454-a2b7-75cf75b84789

# Agora (Get from agora.io)
REACT_APP_AGORA_APP_ID=your_agora_app_id_here

# Google Maps (Get from console.cloud.google.com)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Payment Gateways
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxx

# Social Login
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here.apps.googleusercontent.com
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id_here
```

#### Step 4: Deploy

1. Click **"Deploy"** button in Coolify
2. Monitor build logs in real-time
3. Wait for deployment to complete (typically 3-5 minutes)
4. Verify health check passes

#### Step 5: Verify Deployment

```bash
# Check if app is running
curl https://2sweety.com/health

# Check main page
curl https://2sweety.com/

# Check service workers
curl https://2sweety.com/firebase-messaging-sw.js
curl https://2sweety.com/OneSignalSDKWorker.js
```

---

### Option 2: Deploy via GitHub Actions (CI/CD)

#### Step 1: Configure GitHub Repository Secrets

In your GitHub repository, go to **Settings** → **Secrets and variables** → **Actions**

Add the following secrets:

**Coolify Integration**:
- `COOLIFY_WEBHOOK_URL`: Your Coolify deployment webhook URL
- `COOLIFY_API_TOKEN`: Coolify API token
- `PRODUCTION_URL`: Your production URL (e.g., https://2sweety.com)

**Application Secrets** (all REACT_APP_* variables from above):
- `REACT_APP_API_BASE_URL`
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_ONESIGNAL_APP_ID`
- `REACT_APP_AGORA_APP_ID`
- `REACT_APP_GOOGLE_MAPS_API_KEY`
- `REACT_APP_RAZORPAY_KEY_ID`
- `REACT_APP_PAYPAL_CLIENT_ID`
- `REACT_APP_STRIPE_PUBLISHABLE_KEY`
- `REACT_APP_GOOGLE_CLIENT_ID`
- `REACT_APP_FACEBOOK_APP_ID`
- ... (all other REACT_APP_ variables)

**Optional**:
- `SLACK_WEBHOOK_URL`: For deployment notifications

#### Step 2: Enable GitHub Actions

The workflow file `.github/workflows/deploy-coolify.yml` is already configured.

Workflow triggers:
- Push to `main` or `production` branch
- Pull requests to `main` or `production`
- Manual trigger via GitHub Actions UI

#### Step 3: Deploy

**Automatic**: Push to `main` branch
```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

**Manual**: Go to GitHub Actions → "Deploy to Coolify" → Run workflow

#### Step 4: Monitor Deployment

1. Watch GitHub Actions logs
2. Monitor Coolify dashboard
3. Check deployment notifications (Slack, if configured)

---

## Environment Variables Configuration

### Complete Environment Variables List

#### Core Application Settings

```bash
# General
REACT_APP_NAME=2Sweety
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_MODE=false
REACT_APP_SHOW_API_LOGS=false
REACT_APP_ENABLE_ANALYTICS=true

# API Configuration
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_API_TIMEOUT=30000
```

#### Firebase Configuration

```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP
```

#### Third-Party Integrations

```bash
# Push Notifications
REACT_APP_ONESIGNAL_APP_ID=your_onesignal_app_id

# Video/Audio Calling
REACT_APP_AGORA_APP_ID=your_agora_app_id

# Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_DEFAULT_LATITUDE=37.7749
REACT_APP_DEFAULT_LONGITUDE=-122.4194

# Social Login
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id
```

#### Payment Gateways

```bash
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_PAYPAL_MODE=production
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxx
```

#### App Features & Settings

```bash
# Localization
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_DEFAULT_CURRENCY=USD
REACT_APP_CURRENCY_SYMBOL=$

# Matching Settings
REACT_APP_MAX_DISTANCE_KM=50000
REACT_APP_MIN_AGE=18
REACT_APP_MAX_AGE=100

# Feature Flags
REACT_APP_ENABLE_VIDEO_CALL=true
REACT_APP_ENABLE_VOICE_CALL=true
REACT_APP_ENABLE_GIFT_SENDING=true
REACT_APP_ENABLE_PREMIUM_FEATURES=true

# Image Upload
REACT_APP_MAX_IMAGE_SIZE=5242880
REACT_APP_ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/jpg,image/webp
REACT_APP_MAX_IMAGES_PER_PROFILE=6
```

### How to Get API Keys

#### Agora (Video/Audio Calling)

1. Sign up at https://www.agora.io/
2. Create a new project
3. Get **App ID** from project settings
4. Enable services: RTC (Real-Time Communication), RTM (Real-Time Messaging)
5. Set `REACT_APP_AGORA_APP_ID=your_app_id`

**Important**: For production, implement token-based authentication (backend generates tokens).

#### OneSignal (Push Notifications)

1. Sign up at https://onesignal.com/
2. Create new app → **Web Push**
3. Configure:
   - Site URL: `https://2sweety.com`
   - Auto Resubscribe: ON
   - Default Notification Icon: Upload your icon
4. Get **App ID** from Settings → Keys & IDs
5. Set `REACT_APP_ONESIGNAL_APP_ID=your_app_id`

#### Google Maps API

1. Go to https://console.cloud.google.com/
2. Create project or select existing
3. Enable APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API
4. Create credentials → API Key
5. Restrict API key:
   - Application restrictions: HTTP referrers
   - Add: `https://2sweety.com/*`
   - API restrictions: Select only enabled APIs
6. Set `REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key`

#### Razorpay (Payment)

1. Sign up at https://razorpay.com/
2. Complete KYC verification
3. Go to Settings → API Keys
4. Generate **Live Keys** (not Test Keys)
5. Set `REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxx`

**Note**: Keep Key Secret secure on backend only!

#### PayPal

1. Sign up at https://developer.paypal.com/
2. Create app in Dashboard
3. Get **Live Client ID** (not Sandbox)
4. Set `REACT_APP_PAYPAL_CLIENT_ID=your_client_id`
5. Set `REACT_APP_PAYPAL_MODE=production`

#### Stripe

1. Sign up at https://stripe.com/
2. Activate account
3. Get **Publishable Key** from Developers → API Keys
4. Set `REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxx`

**Note**: Keep Secret Key on backend only!

#### Google OAuth (Social Login)

1. Go to https://console.cloud.google.com/
2. APIs & Services → Credentials
3. Create OAuth 2.0 Client ID
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `https://2sweety.com`
   - `http://localhost:3000` (for development)
6. Authorized redirect URIs:
   - `https://2sweety.com/login`
7. Get **Client ID**
8. Set `REACT_APP_GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com`

#### Facebook Login

1. Go to https://developers.facebook.com/
2. Create app → **Consumer**
3. Add **Facebook Login** product
4. Settings → Basic:
   - App Domains: `2sweety.com`
   - Privacy Policy URL: Your URL
   - Terms of Service URL: Your URL
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `https://2sweety.com/login`
6. Get **App ID**
7. Set `REACT_APP_FACEBOOK_APP_ID=your_app_id`

---

## Post-Deployment Configuration

### 1. Verify All Services

**Firebase**:
```bash
# Test Firestore connection
# Open browser console on https://2sweety.com
# Should see Firebase initialized without errors
```

**OneSignal**:
```bash
# Test push notification subscription
# Click "Allow" when prompted
# Send test notification from OneSignal dashboard
```

**Agora**:
```bash
# Test video call functionality
# Start a call between two users
# Verify audio/video streams work
```

**Payment Gateways**:
```bash
# Test payment flow in production mode
# Use test cards provided by each gateway
# Verify webhook endpoints if configured
```

### 2. Configure Firebase Security Rules

Update Firestore security rules for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // User profiles - authenticated users only
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat messages - participants only
    match /chats/{chatId}/messages/{messageId} {
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.participants;
      allow write: if request.auth != null &&
        request.auth.uid in request.resource.data.participants;
    }

    // Matches - authenticated users only
    match /matches/{matchId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

### 3. Configure Domain & SSL

In Coolify:
1. Add custom domain
2. Enable Let's Encrypt SSL
3. Force HTTPS redirect
4. Configure DNS:
   ```
   A    2sweety.com          → [Coolify_Server_IP]
   A    www.2sweety.com      → [Coolify_Server_IP]
   AAAA 2sweety.com          → [Coolify_Server_IPv6] (if available)
   ```

### 4. Set Up Monitoring

**Coolify Built-in Monitoring**:
- CPU usage
- Memory usage
- Network I/O
- Container logs

**External Monitoring** (Recommended):

**Google Analytics** (Already configured):
- Verify GA4 tracking working
- Set up conversion goals
- Monitor user behavior

**Sentry** (Error Tracking - Optional):
```javascript
// Add to src/index.js
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: "production",
  tracesSampleRate: 0.1,
});
```

**Uptime Monitoring**:
- UptimeRobot: Monitor `/health` endpoint
- Better Uptime: Advanced monitoring with status page
- Pingdom: Comprehensive monitoring

### 5. Performance Optimization

**Enable CDN** (Highly Recommended):

**Option A: Cloudflare**:
1. Add site to Cloudflare
2. Update DNS to Cloudflare nameservers
3. Enable:
   - Auto Minify (JS, CSS, HTML)
   - Brotli compression
   - Rocket Loader
   - Cache Level: Standard
4. Page Rules:
   ```
   *2sweety.com/static/*
   - Cache Level: Cache Everything
   - Edge Cache TTL: 1 month
   ```

**Option B: BunnyCDN**:
1. Create Pull Zone
2. Origin URL: `https://2sweety.com`
3. Update DNS CNAME
4. Configure caching rules

### 6. Backup Strategy

**Database Backups** (Firebase):
- Enable daily Firestore backups
- Export to Google Cloud Storage
- Retention: 30 days

**Container Backups** (Coolify):
- Coolify automatic snapshots
- Manual backups before major updates

**Code Backups** (GitHub):
- Already backed up in Git
- Enable branch protection
- Require PR reviews

---

## Monitoring & Maintenance

### Daily Monitoring

**Automated Checks**:
- Health endpoint monitoring (every 5 minutes)
- SSL certificate expiry monitoring
- Uptime monitoring

**Manual Checks**:
- Review error logs in Coolify
- Check Firebase usage quotas
- Monitor payment gateway transactions
- Review Sentry errors (if configured)

### Weekly Maintenance

1. **Security Updates**:
   ```bash
   # Check for npm vulnerabilities
   npm audit --production

   # Update critical dependencies
   npm update
   ```

2. **Performance Review**:
   - Check Google Analytics page load times
   - Review Core Web Vitals
   - Analyze user drop-off points

3. **Resource Monitoring**:
   - Check Coolify resource usage
   - Review Firebase quota consumption
   - Monitor bandwidth usage

### Monthly Maintenance

1. **Dependency Updates**:
   ```bash
   # Update all dependencies
   npm update
   npm audit fix

   # Test thoroughly before deploying
   npm test
   npm run build
   ```

2. **Security Audit**:
   - Review Firestore security rules
   - Audit API key usage and restrictions
   - Check for exposed secrets in code
   - Review HTTPS configuration

3. **Cost Review**:
   - Firebase usage costs
   - Agora minutes consumed
   - OneSignal notifications sent
   - Server hosting costs
   - CDN bandwidth costs

4. **Backup Verification**:
   - Test backup restoration
   - Verify backup integrity
   - Update disaster recovery plan

### Scaling Considerations

**When to scale**:
- CPU consistently > 70%
- Memory consistently > 80%
- Response times > 2 seconds
- User base > 10,000 active users

**Horizontal Scaling** (Coolify):
1. Create additional container instances
2. Configure load balancer
3. Ensure stateless architecture (already is)

**Database Scaling** (Firebase):
- Firestore auto-scales
- Monitor quotas and upgrade plan if needed

**CDN Optimization**:
- Enable aggressive caching
- Optimize images with WebP
- Implement lazy loading
- Use HTTP/3 (QUIC)

---

## Troubleshooting

### Common Issues & Solutions

#### Issue 1: Build Fails in Coolify

**Symptoms**: Deployment fails during build stage

**Diagnosis**:
```bash
# Check Coolify build logs
# Look for errors like:
# - npm install failures
# - Out of memory
# - Missing environment variables
```

**Solutions**:
1. **Out of Memory**:
   ```bash
   # Increase container memory in Coolify
   # Settings → Resources → Memory: 2GB
   ```

2. **Missing Dependencies**:
   ```bash
   # Verify package.json is committed
   git add package.json package-lock.json
   git commit -m "Add package files"
   git push
   ```

3. **Environment Variables Missing**:
   - Verify all `REACT_APP_*` variables are set as **Build Args**
   - Not runtime environment variables!

#### Issue 2: App Loads but Shows Blank Page

**Symptoms**: 2sweety.com loads but shows white screen

**Diagnosis**:
```bash
# Check browser console for errors
# Common errors:
# - Firebase initialization failed
# - API connection refused
# - CORS errors
```

**Solutions**:
1. **Firebase Errors**:
   - Verify all Firebase env vars are correct
   - Check Firebase project is active
   - Verify domain is authorized in Firebase console

2. **API Connection Issues**:
   ```bash
   # Test API connectivity
   curl https://gomeet.cscodetech.cloud/api/health

   # Verify CORS headers allow your domain
   ```

3. **Build Path Issues**:
   - Verify `homepage` in package.json (should be `/` or your domain)
   - Check nginx config serves from correct path

#### Issue 3: Service Workers Not Loading

**Symptoms**: Firebase messaging or OneSignal not working

**Diagnosis**:
```bash
# Check service worker files are accessible
curl https://2sweety.com/firebase-messaging-sw.js
curl https://2sweety.com/OneSignalSDKWorker.js

# Should return JavaScript code, not 404
```

**Solutions**:
1. **Files Not Found**:
   ```bash
   # Verify files are in build output
   # Check Dockerfile copies them to nginx html root
   ```

2. **HTTPS Required**:
   - Service workers require HTTPS
   - Verify SSL certificate is valid
   - Check forced HTTPS redirect is enabled

3. **Scope Issues**:
   ```bash
   # Add Service-Worker-Allowed header in nginx
   # Already configured in nginx-default.conf
   ```

#### Issue 4: Video/Audio Calls Not Working

**Symptoms**: Agora calls fail to connect

**Diagnosis**:
- Check browser console for Agora errors
- Verify microphone/camera permissions granted
- Test on different browsers

**Solutions**:
1. **Invalid Agora App ID**:
   - Verify `REACT_APP_AGORA_APP_ID` is correct
   - Check App ID is for correct environment (production)

2. **Token Authentication Required**:
   ```javascript
   // Production Agora requires tokens
   // Implement token generation on backend
   // Update frontend to use tokens
   ```

3. **Firewall/Network Issues**:
   - Agora uses WebRTC (UDP ports)
   - Check firewall allows WebRTC
   - Test on different network

#### Issue 5: High Response Times

**Symptoms**: Slow page loads, poor performance

**Diagnosis**:
```bash
# Test response time
curl -o /dev/null -s -w '%{time_total}' https://2sweety.com

# Check server load in Coolify
# Review nginx logs for slow requests
```

**Solutions**:
1. **Enable CDN**:
   - Set up Cloudflare or BunnyCDN
   - Cache static assets aggressively

2. **Optimize Images**:
   ```bash
   # Compress images before upload
   # Use WebP format
   # Implement lazy loading
   ```

3. **Enable Compression**:
   ```bash
   # Verify gzip enabled in nginx.conf (already configured)
   # Check Content-Encoding header
   curl -I https://2sweety.com | grep -i content-encoding
   ```

4. **Resource Optimization**:
   ```bash
   # Analyze bundle size
   npm run build -- --stats

   # Use code splitting
   # Lazy load routes
   # Remove unused dependencies
   ```

#### Issue 6: Payment Gateway Errors

**Symptoms**: Payment processing fails

**Diagnosis**:
- Check browser console for gateway errors
- Verify payment gateway dashboard for issues
- Test with different payment methods

**Solutions**:
1. **Incorrect API Keys**:
   - Verify using **Live** keys, not Test keys
   - Check keys match environment (Razorpay, PayPal, Stripe)

2. **Domain Not Authorized**:
   - Add `2sweety.com` to authorized domains in gateway dashboard
   - Verify HTTPS is used (required for payments)

3. **Webhook Configuration**:
   ```bash
   # Configure webhook URLs in gateway dashboard
   # Razorpay: https://2sweety.com/api/razorpay-webhook
   # PayPal: https://2sweety.com/api/paypal-webhook
   # Stripe: https://2sweety.com/api/stripe-webhook
   ```

#### Issue 7: Push Notifications Not Received

**Symptoms**: OneSignal notifications not appearing

**Diagnosis**:
- Check browser notification permissions
- Verify OneSignal dashboard shows subscribed users
- Test sending notification from dashboard

**Solutions**:
1. **Service Worker Not Registered**:
   - Check OneSignalSDKWorker.js is accessible
   - Verify HTTPS enabled

2. **Incorrect OneSignal Config**:
   - Verify `REACT_APP_ONESIGNAL_APP_ID` is correct
   - Check OneSignal SDK version matches

3. **Browser Permissions**:
   ```javascript
   // Check notification permission status
   console.log(Notification.permission); // should be "granted"
   ```

#### Issue 8: Social Login Failures

**Symptoms**: Google/Facebook login doesn't work

**Diagnosis**:
- Check browser console for OAuth errors
- Verify redirect URIs in provider console

**Solutions**:
1. **Incorrect Redirect URIs**:
   - Google: Add `https://2sweety.com/login` to authorized URIs
   - Facebook: Add same to valid OAuth redirect URIs

2. **Domain Not Authorized**:
   - Google: Add `2sweety.com` to authorized JavaScript origins
   - Facebook: Add `2sweety.com` to app domains

3. **Client ID Mismatch**:
   - Verify `REACT_APP_GOOGLE_CLIENT_ID` matches Google Console
   - Verify `REACT_APP_FACEBOOK_APP_ID` matches Facebook Dashboard

### Debug Mode

For troubleshooting, temporarily enable debug mode:

```bash
# In Coolify, add these build args:
REACT_APP_DEBUG_MODE=true
REACT_APP_SHOW_API_LOGS=true

# Rebuild and deploy
# Check browser console for detailed logs

# IMPORTANT: Disable after debugging!
```

### Logs Access

**Coolify Logs**:
```bash
# Real-time logs in Coolify dashboard
# Or via SSH:
docker logs -f [container_name]
```

**Nginx Logs**:
```bash
# Access logs
docker exec [container_name] cat /var/log/nginx/access.log

# Error logs
docker exec [container_name] cat /var/log/nginx/error.log
```

**Browser Logs**:
```javascript
// Open Developer Console (F12)
// Check:
// - Console tab: JavaScript errors
// - Network tab: Failed requests
// - Application tab: Service workers, storage
```

---

## Rollback Procedures

### Quick Rollback (Coolify)

If deployment causes critical issues:

1. **Via Coolify Dashboard**:
   - Go to Deployments history
   - Click previous successful deployment
   - Click "Redeploy" button
   - Confirm rollback

2. **Via GitHub**:
   ```bash
   # Revert to previous commit
   git revert HEAD
   git push origin main

   # Or rollback to specific commit
   git reset --hard [commit_hash]
   git push --force origin main
   ```

### Emergency Maintenance Mode

Create maintenance page:

```bash
# In Coolify, temporarily change nginx config
# or create maintenance.html and redirect all traffic
```

### Data Backup Before Major Updates

```bash
# 1. Backup Firebase data
# Use Firebase Console → Firestore → Export data

# 2. Tag current release
git tag -a v1.0.0 -m "Pre-update backup"
git push origin v1.0.0

# 3. Document changes in CHANGELOG.md

# 4. Test in staging environment first (if available)
```

### Post-Rollback Checklist

- [ ] Verify app is accessible
- [ ] Test critical user flows (login, matching, chat)
- [ ] Check error rates in monitoring
- [ ] Notify users if necessary
- [ ] Investigate root cause
- [ ] Document incident for future reference

---

## Additional Resources

### Official Documentation

- **React**: https://react.dev/
- **Create React App**: https://create-react-app.dev/
- **Coolify**: https://coolify.io/docs
- **Firebase**: https://firebase.google.com/docs
- **Agora**: https://docs.agora.io/
- **OneSignal**: https://documentation.onesignal.com/
- **Docker**: https://docs.docker.com/
- **Nginx**: https://nginx.org/en/docs/

### Payment Gateway Docs

- **Razorpay**: https://razorpay.com/docs/
- **PayPal**: https://developer.paypal.com/docs/
- **Stripe**: https://stripe.com/docs

### Support Channels

- **2Sweety Issues**: GitHub Issues (create one if needed)
- **Coolify Support**: https://coolify.io/discord
- **Firebase Support**: https://firebase.google.com/support

### Performance Tools

- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/
- **Lighthouse**: Built into Chrome DevTools

---

## Conclusion

You now have a complete production deployment of 2Sweety on Coolify! 🚀

**Next Steps**:
1. ✅ Verify all integrations are working
2. ✅ Set up monitoring and alerts
3. ✅ Configure backups
4. ✅ Enable CDN for performance
5. ✅ Document any custom configurations
6. ✅ Train team on deployment process

For ongoing support, refer to troubleshooting section or contact support channels.

**Happy Dating App Deployment!** 💕
