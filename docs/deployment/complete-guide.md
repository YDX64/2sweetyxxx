# 🚀 2Sweety - Complete Production Deployment Guide

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Part 1: Database Setup](#part-1-database-setup)
4. [Part 2: Backend Deployment (PHP API)](#part-2-backend-deployment-php-api)
5. [Part 3: Frontend Deployment (React Web)](#part-3-frontend-deployment-react-web)
6. [Part 4: Domain & SSL Configuration](#part-4-domain--ssl-configuration)
7. [Part 5: Testing & Verification](#part-5-testing--verification)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance & Backup](#maintenance--backup)

---

## Architecture Overview

2Sweety uses a hybrid architecture combining:

```
┌─────────────────────────────────────────────────────┐
│                   2Sweety Platform                  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Frontend (React)          Backend (PHP)           │
│  ├── 2sweety.com           ├── api.2sweety.com    │
│  ├── Firebase Auth         ├── REST API           │
│  ├── Firebase Chat         ├── MySQL Database     │
│  └── Agora RTC             └── Payment Gateways   │
│                                                     │
│  Firebase Services (Cloud)                         │
│  ├── Authentication                                │
│  ├── Firestore (Chat)                             │
│  ├── Storage (Images)                             │
│  └── Cloud Messaging                              │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Technology Stack:**
- **Frontend**: React 18.2, React Router, Bootstrap, Tailwind CSS
- **Backend**: PHP 7.4+, Apache, MySQL 8.0
- **Real-time**: Firebase (Auth, Firestore, Storage, Messaging)
- **Video/Audio**: Agora RTC
- **Deployment**: Coolify (Docker-based)
- **Database**: MySQL 8.0 (24 tables, utf8mb4)

---

## Prerequisites

### Required Accounts & Services

1. **GitHub Account**
   - Create account at: https://github.com

2. **Coolify Instance**
   - Self-hosted or managed Coolify server
   - Accessible via web interface
   - Domain/IP address for Coolify

3. **Domain Names** (2 required)
   - Main domain: `2sweety.com` (frontend)
   - API domain: `api.2sweety.com` (backend)

4. **Firebase Project**
   - Project ID: `sweet-a6718` (already configured)
   - Get credentials from: https://console.firebase.google.com

5. **Payment Gateway Accounts** (Optional but recommended)
   - Razorpay: https://razorpay.com
   - Stripe: https://stripe.com
   - PayPal: https://developer.paypal.com

6. **Third-party Services** (Optional)
   - Agora: https://www.agora.io (video/audio calls)
   - OneSignal: https://onesignal.com (push notifications)
   - Google Maps API: https://console.cloud.google.com

### Required Files

Ensure you have these files ready:
- ✅ `Gomeet.sql` (Database schema - located in `mobile-app/Gommet Database 1.5/`)
- ✅ `Dockerfile` (Backend - already created)
- ✅ `.htaccess` (Backend - already configured)
- ✅ `.env.coolify` files (Frontend - 2 versions available)

---

## Part 1: Database Setup

### Step 1.1: Prepare Database on Coolify

**Option A: Using Coolify's MySQL Service**

1. Log in to Coolify dashboard
2. Go to **Resources** → **+ New Resource** → **Database**
3. Select **MySQL 8.0**
4. Configure:
   ```
   Name: 2sweety-mysql
   Database: dating_db
   Username: dating_user
   Password: [Generate strong password]
   Root Password: [Generate strong root password]
   ```
5. Click **Create Database**
6. Wait for database to be ready (status: Running)
7. **Note the connection details:**
   - Host: `[internal-docker-hostname]` (usually service name)
   - Port: `3306`
   - Database: `dating_db`
   - User: `dating_user`
   - Password: `[your-password]`

**Option B: Using External MySQL Server**

If you have an existing MySQL server:
1. Create database:
   ```sql
   CREATE DATABASE dating_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Create user:
   ```sql
   CREATE USER 'dating_user'@'%' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON dating_db.* TO 'dating_user'@'%';
   FLUSH PRIVILEGES;
   ```

### Step 1.2: Import Database Schema

**Method 1: Direct Import (Recommended)**

1. Access your MySQL database via phpMyAdmin or MySQL Workbench
2. Import the SQL file: `mobile-app/Gommet Database 1.5/Gomeet.sql`
3. Verify import:
   ```sql
   USE dating_db;
   SHOW TABLES;
   -- Should show 24 tables
   ```

**Method 2: Using Command Line**

```bash
# Upload SQL file to server
scp "mobile-app/Gommet Database 1.5/Gomeet.sql" user@server:/tmp/

# SSH into server
ssh user@server

# Import SQL
mysql -u dating_user -p dating_db < /tmp/Gomeet.sql

# Verify
mysql -u dating_user -p dating_db -e "SHOW TABLES;"
```

**Method 3: Using the Setup Script**

```bash
# Copy database setup script
scp "Gomeet Admin Panel 1.5/database-setup.sh" user@server:/tmp/

# SSH and run
ssh user@server
cd /tmp

# Set environment variables
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=dating_db
export DB_USER=dating_user
export DB_PASSWORD=your_password
export DB_ROOT_PASSWORD=root_password
export SQL_FILE=/tmp/Gomeet.sql

# Run setup
chmod +x database-setup.sh
./database-setup.sh
```

### Step 1.3: Verify Database

Check that all tables are created:

```sql
USE dating_db;

-- Check table count (should be 24)
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'dating_db';

-- Verify admin user exists
SELECT id, username, email FROM admin LIMIT 1;
-- Default: username='admin', password='admin@123'

-- Check key tables
SELECT COUNT(*) FROM tbl_user;
SELECT COUNT(*) FROM tbl_plan;
SELECT COUNT(*) FROM tbl_setting;
```

**⚠️ IMPORTANT SECURITY STEP:**

Change the default admin password immediately:

```sql
-- Update admin password (use MD5 hash for now, upgrade to bcrypt later)
UPDATE admin
SET password = MD5('your_new_secure_password')
WHERE id = 1;
```

---

## Part 2: Backend Deployment (PHP API)

### Step 2.1: Prepare GitHub Repository

1. **Create New Repository**
   ```bash
   cd "/Users/max/Downloads/2sweet"

   # Initialize git if not already
   git init

   # Create .gitignore
   cat > .gitignore << 'EOF'
   # Environment files
   .env
   *.env.local

   # Database credentials
   inc/Connection.php

   # Logs and temp files
   error_log
   *.log
   /tmp/

   # IDE files
   .vscode/
   .idea/
   *.swp

   # OS files
   .DS_Store
   Thumbs.db

   # Uploaded files (don't commit user uploads)
   images/user_images/*
   images/uploads/*
   !images/user_images/.gitkeep
   !images/uploads/.gitkeep

   # Backup files
   *.sql
   *.sql.gz
   *.bak
   EOF

   # Create .gitkeep files
   touch "Gomeet Admin Panel 1.5/images/user_images/.gitkeep"
   touch "Gomeet Admin Panel 1.5/images/uploads/.gitkeep"
   ```

2. **Add Files to Git**
   ```bash
   git add .
   git commit -m "Initial commit: 2Sweety dating platform

   - React frontend web app
   - PHP backend API
   - MySQL database schema
   - Docker deployment configuration
   - Complete documentation

   🚀 Generated with Claude Code
   Co-Authored-By: Claude <noreply@anthropic.com>"
   ```

3. **Push to GitHub**
   ```bash
   # Create repository on GitHub first (https://github.com/new)
   # Name: 2sweety
   # Description: Complete dating platform with React + PHP + MySQL
   # Privacy: Private (recommended)

   # Add remote and push
   git remote add origin https://github.com/YOUR_USERNAME/2sweety.git
   git branch -M main
   git push -u origin main
   ```

### Step 2.2: Configure Backend in Coolify

1. **Create New Application in Coolify**
   - Go to **Projects** → Select project → **+ New Resource**
   - Select **Application**

2. **Source Configuration**
   ```
   Name: 2sweety-backend-api
   Source Type: GitHub Repository
   Repository: YOUR_USERNAME/2sweety
   Branch: main
   Base Directory: Gomeet Admin Panel 1.5
   ```

3. **Build Configuration**
   ```
   Build Pack: Dockerfile
   Dockerfile Location: ./Dockerfile
   ```

4. **Domain Configuration**
   ```
   Primary Domain: api.2sweety.com
   Force HTTPS: ✅ Yes
   ```

5. **Environment Variables**

   Go to **Environment Variables** tab and add:

   **Database Configuration:**
   ```
   DB_HOST=2sweety-mysql (or your MySQL host)
   DB_PORT=3306
   DB_NAME=dating_db
   DB_USER=dating_user
   DB_PASSWORD=your_database_password
   ```

   **API Configuration:**
   ```
   API_BASE_URL=https://api.2sweety.com
   APP_ENV=production
   ```

   **Firebase Admin SDK (Server-side):**
   ```
   FIREBASE_PROJECT_ID=sweet-a6718
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   ```

   **Payment Gateways (Server-side secrets):**
   ```
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   STRIPE_SECRET_KEY=sk_live_xxx
   PAYPAL_SECRET=your_paypal_secret
   ```

   **OneSignal:**
   ```
   ONESIGNAL_APP_ID=94b2b6c5-fabb-4454-a2b7-75cf75b84789
   ONESIGNAL_REST_API_KEY=your_rest_api_key
   ```

   **Agora:**
   ```
   AGORA_APP_ID=your_agora_app_id
   AGORA_APP_CERTIFICATE=your_agora_certificate
   ```

   **Security:**
   ```
   JWT_SECRET=your_jwt_secret_min_32_characters
   API_KEY=your_api_key_for_authentication
   ```

6. **Health Check Configuration**
   ```
   Health Check Path: /api/health.php
   Health Check Method: GET
   Health Check Interval: 30 seconds
   Health Check Timeout: 10 seconds
   Health Check Retries: 3
   ```

7. **Resources (Optional but recommended)**
   ```
   Memory: 2GB (minimum) - 4GB (recommended)
   CPU: 1 Core (minimum) - 2 Cores (recommended)
   Storage: 10GB
   ```

### Step 2.3: Update Connection File

**Option A: Replace Connection.php (Recommended)**

```bash
# SSH into your server or use Coolify's file editor
cd /var/www/html/inc

# Backup original
cp Connection.php Connection.php.backup

# Use production version
cp Connection.prod.php Connection.php
```

**Option B: Manual Update**

Edit `inc/Connection.php` directly in Coolify's file editor:

```php
<?php
// Use environment variables
$db_host = getenv('DB_HOST') ?: 'localhost';
$db_user = getenv('DB_USER') ?: 'dating_user';
$db_pass = getenv('DB_PASSWORD') ?: '';
$db_name = getenv('DB_NAME') ?: 'dating_db';
$db_port = getenv('DB_PORT') ?: '3306';

$dating = new mysqli($db_host, $db_user, $db_pass, $db_name, $db_port);
$dating->set_charset("utf8mb4");
?>
```

### Step 2.4: Deploy Backend

1. Click **Deploy** button in Coolify
2. Monitor build logs for errors
3. Wait for deployment to complete (3-5 minutes)
4. Check deployment status: Should show "Running"

### Step 2.5: Test Backend API

```bash
# Test health endpoint
curl https://api.2sweety.com/api/health.php

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-10-25 21:30:00",
  "service": "2Sweety Backend API",
  "version": "1.0.0",
  "database": "connected"
}

# Test settings endpoint
curl https://api.2sweety.com/api/setting.php

# Should return app settings JSON
```

---

## Part 3: Frontend Deployment (React Web)

### Step 3.1: Choose Environment Configuration

You have two `.env.coolify` files to choose from:

**Option A: Using Test API (Temporary)**
- File: `.env.coolify.TEST-API`
- Uses: `https://gomeet.cscodetech.cloud/api/`
- Best for: Testing deployment before backend is ready
- ⚠️ Not recommended for production

**Option B: Using Your Own Backend (Recommended)**
- File: `.env.coolify.KENDI-BACKEND`
- Uses: `https://api.2sweety.com/api/`
- Best for: Production deployment
- ✅ Recommended once backend is deployed

### Step 3.2: Configure Frontend in Coolify

1. **Create New Application**
   - **Projects** → Select project → **+ New Resource** → **Application**

2. **Source Configuration**
   ```
   Name: 2sweety-web-frontend
   Source Type: GitHub Repository
   Repository: YOUR_USERNAME/2sweety
   Branch: main
   Base Directory: GoMeet Web
   ```

3. **Build Configuration**
   ```
   Build Pack: nixpacks (auto-detected) or Static
   Build Command: npm install && npm run build
   Publish Directory: build
   Start Command: [LEAVE EMPTY - Coolify serves static files]
   Port: 80
   ```

4. **Domain Configuration**
   ```
   Primary Domain: 2sweety.com
   Additional Domain: www.2sweety.com
   Redirect www to non-www: ✅ Yes
   Force HTTPS: ✅ Yes
   ```

5. **Build Arguments** (IMPORTANT!)

   Go to **Environment Variables** → **Build Arguments** tab

   Copy the **entire contents** from your chosen .env file:

   **For Production (Using Own Backend):**
   Copy from `.env.coolify.KENDI-BACKEND`

   **For Testing:**
   Copy from `.env.coolify.TEST-API`

   **Critical Build Arguments:**
   ```bash
   # General
   ESLINT_NO_DEV_ERRORS=true
   GENERATE_SOURCEMAP=false
   SKIP_PREFLIGHT_CHECK=true

   # App Info
   REACT_APP_NAME=2Sweety
   REACT_APP_VERSION=1.0.0
   REACT_APP_ENVIRONMENT=production

   # API URLs - UPDATE THESE!
   REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
   REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
   REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/

   # Firebase Configuration
   REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
   REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
   REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
   REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
   REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

   # OneSignal
   REACT_APP_ONESIGNAL_APP_ID=94b2b6c5-fabb-4454-a2b7-75cf75b84789

   # Payment Gateways (Client-side keys)
   REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxx
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
   REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id

   # Agora
   REACT_APP_AGORA_APP_ID=your_agora_app_id

   # Google Maps
   REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key

   # Feature Flags
   REACT_APP_ENABLE_VIDEO_CALL=true
   REACT_APP_ENABLE_VOICE_CALL=true
   REACT_APP_ENABLE_GIFT_SENDING=true
   REACT_APP_ENABLE_PREMIUM_FEATURES=true
   ```

   **⚠️ CRITICAL:**
   - Add to **Build Arguments** NOT Runtime Variables!
   - Build Arguments are embedded during build
   - Cannot be changed after build - requires rebuild

6. **Health Check**
   ```
   Health Check Path: /
   Health Check Method: GET
   Health Check Interval: 60 seconds
   ```

7. **Resources**
   ```
   Memory: 2GB (for build)
   CPU: 1 Core
   Storage: 5GB
   ```

### Step 3.3: Deploy Frontend

1. Click **Deploy** button
2. Monitor build logs:
   ```
   ▶ Cloning repository... ✅
   ▶ Installing dependencies... ✅
   ▶ npm install ✅
   ▶ Building application... ✅
   ▶ npm run build ✅
   ▶ Creating optimized production build... ✅
   ✓ Compiled successfully! ✅
   ▶ Deploying... ✅
   ✓ Deployed successfully! ✅
   ```
3. Wait for deployment (5-10 minutes)
4. Verify status: "Running"

### Step 3.4: Test Frontend

1. **Open in Browser:**
   ```
   https://2sweety.com
   ```

2. **Verify:**
   - ✅ Page loads without errors
   - ✅ Firebase connection works
   - ✅ API calls succeed
   - ✅ No console errors (F12 → Console)

3. **Test Registration:**
   - Try to register a new account
   - Verify Firebase authentication
   - Check API connectivity

---

## Part 4: Domain & SSL Configuration

### Step 4.1: DNS Configuration

Configure DNS records for both domains:

**For 2sweety.com (Frontend):**
```
Type: A
Name: @
Value: [Your Coolify Server IP]
TTL: 3600

Type: A
Name: www
Value: [Your Coolify Server IP]
TTL: 3600
```

**For api.2sweety.com (Backend):**
```
Type: A
Name: api
Value: [Your Coolify Server IP]
TTL: 3600
```

**Verify DNS Propagation:**
```bash
# Check frontend
dig 2sweety.com
dig www.2sweety.com

# Check backend
dig api.2sweety.com

# All should return your Coolify server IP
```

### Step 4.2: SSL Certificate Setup

Coolify automatically handles SSL via Let's Encrypt:

1. **Frontend SSL:**
   - Go to 2sweety-web-frontend → **Domains**
   - Click **Generate Certificate**
   - Wait 1-2 minutes
   - Status should show: "Certificate Valid"

2. **Backend SSL:**
   - Go to 2sweety-backend-api → **Domains**
   - Click **Generate Certificate**
   - Wait 1-2 minutes
   - Status should show: "Certificate Valid"

3. **Force HTTPS:**
   - Ensure "Force HTTPS" is enabled for both apps
   - All HTTP requests will redirect to HTTPS

4. **Verify SSL:**
   ```bash
   # Check SSL certificate
   curl -I https://2sweety.com
   # Should return: HTTP/2 200

   curl -I https://api.2sweety.com
   # Should return: HTTP/2 200

   # Check SSL details
   openssl s_client -connect 2sweety.com:443 -servername 2sweety.com
   openssl s_client -connect api.2sweety.com:443 -servername api.2sweety.com
   ```

### Step 4.3: CORS Configuration

CORS is already configured in `.htaccess` for these origins:
- `https://2sweety.com`
- `https://www.2sweety.com`
- `https://app.2sweety.com`
- `http://localhost:3000` (for development)

If you need to add more origins, edit `.htaccess` line 34.

---

## Part 5: Testing & Verification

### 5.1: Frontend Testing Checklist

- [ ] Homepage loads (`https://2sweety.com`)
- [ ] No JavaScript errors in console (F12)
- [ ] Firebase connection successful
- [ ] User registration works
- [ ] User login works
- [ ] Profile images upload
- [ ] Chat functionality works
- [ ] Payment gateway integration
- [ ] Video/audio call initialization
- [ ] Mobile responsive design
- [ ] All languages load correctly

### 5.2: Backend Testing Checklist

- [ ] Health endpoint responds (`/api/health.php`)
- [ ] Settings endpoint works (`/api/setting.php`)
- [ ] User authentication API
- [ ] Profile API endpoints
- [ ] Chat message API
- [ ] Payment webhook endpoints
- [ ] Image upload/download
- [ ] Database queries execute
- [ ] Error logging works
- [ ] CORS headers present

### 5.3: Database Testing

```sql
-- Verify user registration
SELECT COUNT(*) FROM tbl_user;

-- Check payment plans
SELECT * FROM tbl_plan;

-- Verify settings loaded
SELECT * FROM tbl_setting;

-- Check admin access
SELECT username, email FROM admin;

-- Test wallet functionality
SELECT COUNT(*) FROM wallet_report;
```

### 5.4: Integration Testing

**Test Complete User Flow:**

1. Register new user
2. Verify email/phone
3. Complete profile setup
4. Upload profile images
5. Browse other users
6. Send message (test chat)
7. Initiate video/audio call
8. Purchase subscription
9. Test premium features
10. Update profile
11. Test notifications

### 5.5: Performance Testing

```bash
# Test response times
curl -w "@curl-format.txt" -o /dev/null -s https://2sweety.com
curl -w "@curl-format.txt" -o /dev/null -s https://api.2sweety.com/api/health.php

# Load testing (optional - use Apache Bench)
ab -n 1000 -c 10 https://2sweety.com/
ab -n 1000 -c 10 https://api.2sweety.com/api/health.php
```

---

## Troubleshooting

### Common Issues

#### Issue 1: Build Fails

**Symptoms:**
- Build logs show errors
- Deployment status: Failed

**Solutions:**
1. Check build logs for specific errors
2. Verify all build arguments are set correctly
3. Ensure `package.json` and `package-lock.json` are committed
4. Check Node.js version compatibility
5. Clear build cache and redeploy

#### Issue 2: Environment Variables Not Working

**Symptoms:**
- API calls fail
- Firebase not connecting
- Blank pages

**Solutions:**
1. Verify variables are in **Build Arguments** not Runtime Variables
2. Check variable names (must start with `REACT_APP_`)
3. Rebuild application after changing build arguments
4. Check browser console for `process.env` values

#### Issue 3: Database Connection Failed

**Symptoms:**
- Health check fails
- API returns database errors

**Solutions:**
1. Verify database is running in Coolify
2. Check database credentials in environment variables
3. Test connection from backend container:
   ```bash
   # SSH into backend container
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASSWORD $DB_NAME -e "SELECT 1;"
   ```
4. Check `inc/Connection.php` uses environment variables
5. Verify network connectivity between services

#### Issue 4: CORS Errors

**Symptoms:**
- Browser console shows CORS errors
- API calls blocked

**Solutions:**
1. Check `.htaccess` CORS configuration (line 34)
2. Verify frontend domain matches allowed origins
3. Ensure backend sends correct headers
4. Test with curl to verify CORS headers:
   ```bash
   curl -H "Origin: https://2sweety.com" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://api.2sweety.com/api/health.php -v
   ```

#### Issue 5: SSL Certificate Issues

**Symptoms:**
- SSL certificate invalid
- "Not secure" warning in browser

**Solutions:**
1. Wait 5-30 minutes for DNS propagation
2. Verify DNS points to correct IP
3. Regenerate certificate in Coolify
4. Check Coolify SSL logs
5. Verify domain ownership

#### Issue 6: Images Not Loading

**Symptoms:**
- Profile images don't display
- Upload fails

**Solutions:**
1. Check directory permissions in backend:
   ```bash
   chmod -R 777 /var/www/html/images
   ```
2. Verify `REACT_APP_IMAGE_BASE_URL` is correct
3. Check PHP upload limits in `.htaccess`
4. Verify storage volume is mounted

---

## Maintenance & Backup

### Database Backups

**Automated Backup (Recommended):**

1. Set up cron job:
   ```bash
   # Edit crontab
   crontab -e

   # Add daily backup at 2 AM
   0 2 * * * /path/to/database-backup.sh
   ```

2. Configure backup script:
   ```bash
   export DB_HOST=localhost
   export DB_NAME=dating_db
   export DB_USER=dating_user
   export DB_PASSWORD=your_password
   export BACKUP_DIR=/var/backups/mysql
   export RETENTION_DAYS=7

   ./database-backup.sh
   ```

**Manual Backup:**

```bash
# Backup database
mysqldump -u dating_user -p dating_db \
    --single-transaction \
    --routines \
    --triggers \
    | gzip > dating_db_$(date +%Y%m%d).sql.gz

# Restore from backup
gunzip < dating_db_20241025.sql.gz | mysql -u dating_user -p dating_db
```

### Application Updates

**Frontend Updates:**
1. Make changes to code
2. Commit and push to GitHub
3. Coolify auto-deploys (if webhook enabled)
4. Or manually click "Redeploy"

**Backend Updates:**
1. Update PHP code
2. Commit and push to GitHub
3. Redeploy in Coolify
4. Monitor logs for errors

**Database Updates:**
1. Create backup first!
2. Test schema changes locally
3. Apply to production during low-traffic period
4. Verify application still works

### Monitoring

**Health Checks:**
```bash
# Create monitoring script
cat > monitor-2sweety.sh << 'EOF'
#!/bin/bash

# Frontend health
FRONTEND=$(curl -s -o /dev/null -w "%{http_code}" https://2sweety.com)
# Backend health
BACKEND=$(curl -s -o /dev/null -w "%{http_code}" https://api.2sweety.com/api/health.php)

echo "Frontend: $FRONTEND (should be 200)"
echo "Backend: $BACKEND (should be 200)"

if [ "$FRONTEND" != "200" ] || [ "$BACKEND" != "200" ]; then
    echo "⚠️ Service health check failed!"
    # Send alert (email, Slack, etc.)
fi
EOF

chmod +x monitor-2sweety.sh

# Run every 5 minutes
crontab -e
*/5 * * * * /path/to/monitor-2sweety.sh
```

**Log Management:**

```bash
# Backend logs
docker logs 2sweety-backend --tail 100 -f

# Database logs
docker logs 2sweety-mysql --tail 100 -f

# Frontend logs (Nginx/static server)
docker logs 2sweety-frontend --tail 100 -f

# Clear old logs (weekly)
find /var/log -name "*.log" -type f -mtime +7 -delete
```

### Security Updates

**Regular Tasks:**
1. Update Docker images monthly
2. Update npm packages: `npm update`
3. Update composer packages: `composer update`
4. Review security advisories
5. Update SSL certificates (auto-renewed by Let's Encrypt)
6. Review user permissions
7. Audit database access logs

**Security Checklist:**
- [ ] Change default admin password
- [ ] Use strong database passwords
- [ ] Enable 2FA for admin panel
- [ ] Regular security scans
- [ ] Monitor failed login attempts
- [ ] Review API access logs
- [ ] Update payment gateway settings
- [ ] Check Firebase security rules
- [ ] Review CORS configuration
- [ ] Enable rate limiting (if needed)

---

## 📞 Support & Resources

### Documentation
- **Coolify Docs**: https://coolify.io/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev
- **PHP MySQL Docs**: https://www.php.net/manual/en/book.mysqli.php

### Useful Commands

```bash
# Restart services in Coolify
docker restart 2sweety-frontend
docker restart 2sweety-backend
docker restart 2sweety-mysql

# Check resource usage
docker stats

# View all containers
docker ps -a

# Clean up Docker
docker system prune -a

# Redeploy from Coolify CLI
# (if Coolify has CLI access)
coolify deploy 2sweety-frontend
coolify deploy 2sweety-backend
```

### Emergency Contacts

**Critical Issues:**
1. Check Coolify dashboard
2. Review application logs
3. Check GitHub repository
4. Review Firebase console
5. Contact payment gateway support (if payment issues)

---

## ✅ Post-Deployment Checklist

After completing deployment:

- [ ] Frontend accessible at https://2sweety.com
- [ ] Backend accessible at https://api.2sweety.com
- [ ] SSL certificates valid for both domains
- [ ] Database imported successfully (24 tables)
- [ ] Admin panel accessible
- [ ] Default admin password changed
- [ ] User registration working
- [ ] Firebase authentication working
- [ ] Chat functionality tested
- [ ] Payment gateway configured
- [ ] Video/audio calls working (Agora)
- [ ] Push notifications configured (OneSignal)
- [ ] Mobile responsive design verified
- [ ] All languages tested
- [ ] Backup system configured
- [ ] Monitoring set up
- [ ] Documentation updated
- [ ] Team trained on maintenance procedures

---

## 🎉 Deployment Complete!

Your 2Sweety dating platform is now live and ready for users!

**Next Steps:**
1. Test all features thoroughly
2. Configure payment gateways
3. Set up analytics (Google Analytics, Firebase Analytics)
4. Create user documentation
5. Plan marketing strategy
6. Monitor performance and errors
7. Gather user feedback
8. Plan feature updates

**Remember:**
- Keep backups current
- Monitor logs regularly
- Update dependencies
- Review security settings
- Scale resources as needed

---

**Generated with ❤️ by Claude Code**
**Last Updated: October 25, 2024**
