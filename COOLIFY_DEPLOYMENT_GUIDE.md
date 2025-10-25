# 🚀 2Sweety Complete Deployment Guide for Coolify

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Prerequisites](#prerequisites)
3. [Deployment Steps](#deployment-steps)
4. [Service 1: MySQL Database](#service-1-mysql-database)
5. [Service 2: PHP Backend API](#service-2-php-backend-api)
6. [Service 3: React Frontend](#service-3-react-frontend)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Security Hardening](#security-hardening)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        2Sweety Platform                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐    ┌──────────────────┐   ┌────────────┐ │
│  │   React Frontend │    │  PHP Backend API │   │  MySQL DB  │ │
│  │  (Static Build)  │───▶│  (Admin Panel)   │──▶│ (Database) │ │
│  │                  │    │                  │   │            │ │
│  │ 2sweety.com      │    │ api.2sweety.com  │   │ Internal   │ │
│  │ app.2sweety.com  │    │                  │   │            │ │
│  └──────────────────┘    └──────────────────┘   └────────────┘ │
│         │                        │                      │        │
│         │                        │                      │        │
│  ┌──────▼────────────────────────▼──────────────────────▼──────┐│
│  │              External Services (Firebase, Agora)            ││
│  │  - Firebase Auth, Firestore, Storage, Messaging            ││
│  │  - Agora RTC (Video/Voice)                                 ││
│  │  - Payment Gateways (Razorpay, Stripe, PayPal, etc.)      ││
│  │  - Google Maps, OneSignal Push Notifications              ││
│  └────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Component Details:

**Frontend (React 18.2)**
- Framework: React + Bootstrap + Tailwind CSS
- Build Tool: Create React App
- Real-time: Firebase Firestore + Messaging
- Video/Audio: Agora RTC Engine
- State Management: React Context API
- Deployment: Static build served by Nginx

**Backend (PHP)**
- Language: PHP 7.4+
- Framework: Pure PHP (no framework)
- API: 50+ REST endpoints in `/api/` directory
- Admin Panel: Full-featured admin dashboard
- File Upload: Image processing and storage
- Payment Processing: Multiple gateway integrations

**Database (MySQL/MariaDB)**
- Database: MariaDB 10.6 / MySQL 8.0+
- Tables: 24 tables
- Size: Initial ~1057 SQL lines
- Character Set: utf8mb4 (full emoji support)
- Collation: utf8mb4_unicode_ci

---

## Prerequisites

### Required Before Starting:

1. **Domain Names & DNS Setup**
   - Primary domain: `2sweety.com` (A record → Coolify server IP)
   - API subdomain: `api.2sweety.com` (A record → Coolify server IP)
   - App subdomain: `app.2sweety.com` (optional, CNAME → 2sweety.com)
   - DNS propagation: Wait 1-48 hours

2. **Coolify Server**
   - Ubuntu 20.04+ or Debian 11+
   - Minimum 2GB RAM (4GB recommended)
   - Minimum 20GB disk space (50GB+ recommended)
   - Docker installed via Coolify setup
   - Coolify v4+ installed and running

3. **External Service Accounts**
   - Firebase project created (project ID: sweet-a6718)
   - Agora account + App ID
   - OneSignal account + App ID
   - Google Cloud Console (Maps API, OAuth)
   - Payment gateway accounts (Razorpay, Stripe, PayPal)
   - Social login: Google OAuth, Facebook App

4. **Access & Credentials**
   - Coolify admin access
   - Domain DNS management access
   - All API keys from external services
   - SSH access to server (for troubleshooting)

---

## Deployment Steps

### High-Level Deployment Flow:

```
Step 1: Deploy MySQL Database
   ↓
Step 2: Import Database Schema
   ↓
Step 3: Deploy PHP Backend
   ↓
Step 4: Configure Backend Database Connection
   ↓
Step 5: Test Backend API
   ↓
Step 6: Deploy React Frontend
   ↓
Step 7: Configure Frontend Environment Variables
   ↓
Step 8: Test Frontend → Backend Communication
   ↓
Step 9: SSL Certificates (Let's Encrypt)
   ↓
Step 10: Security Hardening
   ↓
Step 11: Monitoring & Backups
```

---

## Service 1: MySQL Database

### 1.1 Create Database Service in Coolify

1. Navigate to your Coolify dashboard
2. Select your project or create new project: **"2Sweety Production"**
3. Click **"+ New Resource"** → **"Database"** → **"MySQL"**

### 1.2 Database Configuration

**Basic Settings:**
```yaml
Service Name: 2sweety-mysql
Description: 2Sweety dating app database
Version: 8.0 (or MariaDB 10.6)
```

**Database Credentials:**
```yaml
Database Name: gommet
Root Password: [Generate strong password - SAVE THIS!]
Database User: gomeet_user
User Password: [Generate strong password - SAVE THIS!]
```

**⚠️ IMPORTANT: Save these credentials immediately in a password manager!**

**Resource Allocation:**
```yaml
Memory Limit: 512MB (minimum), 1GB recommended
CPU Limit: 1 core (minimum), 2 cores recommended
Storage: 10GB (minimum), 50GB recommended for production
```

**Network Configuration:**
```yaml
Network: coolify-network (default)
Internal Access Only: YES (do NOT expose to internet)
Port: 3306 (internal only)
```

### 1.3 Advanced MySQL Configuration

Add these environment variables in Coolify:

```bash
MYSQL_DATABASE=gommet
MYSQL_USER=gomeet_user
MYSQL_PASSWORD=[your-secure-password]
MYSQL_ROOT_PASSWORD=[your-secure-root-password]

# MySQL Performance Tuning
MYSQL_MAX_CONNECTIONS=100
MYSQL_INNODB_BUFFER_POOL_SIZE=256M
MYSQL_QUERY_CACHE_SIZE=32M
MYSQL_CHARACTER_SET_SERVER=utf8mb4
MYSQL_COLLATION_SERVER=utf8mb4_unicode_ci
```

### 1.4 Deploy Database

1. Click **"Deploy"**
2. Wait for container to start (check logs)
3. Verify status: **"Running"**

### 1.5 Import Database Schema

**Option A: Using Coolify Terminal**

1. Go to database service → **"Terminal"**
2. Run these commands:

```bash
# Access MySQL shell
mysql -u root -p
# Enter root password when prompted

# Create database if not exists
CREATE DATABASE IF NOT EXISTS gommet CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Create user and grant privileges
CREATE USER IF NOT EXISTS 'gomeet_user'@'%' IDENTIFIED BY 'your-password-here';
GRANT ALL PRIVILEGES ON gommet.* TO 'gomeet_user'@'%';
FLUSH PRIVILEGES;

# Exit MySQL
EXIT;
```

3. Upload `Gomeet.sql` file to server:

```bash
# From your local machine
scp "/Users/max/Downloads/2sweet/mobile-app/Gommet Database 1.5/Gomeet.sql" \
    user@your-server:/tmp/gomeet.sql

# SSH into server
ssh user@your-server

# Import SQL file into container
docker cp /tmp/gomeet.sql 2sweety-mysql:/tmp/gomeet.sql
docker exec -i 2sweety-mysql mysql -u root -p gommet < /tmp/gomeet.sql
```

**Option B: Using phpMyAdmin (Easier)**

1. In Coolify, add **phpMyAdmin** service:
   - **"+ New Resource"** → **"Service"** → **"phpMyAdmin"**
   - Link to MySQL database: `2sweety-mysql`
   - Expose on subdomain: `phpmyadmin.2sweety.com` (temporary)

2. Access phpMyAdmin → Import → Upload `Gomeet.sql`

3. **IMPORTANT:** Delete phpMyAdmin after import (security risk)

### 1.6 Verify Database Import

```sql
-- Connect to database
USE gommet;

-- Check tables (should be 24 tables)
SHOW TABLES;

-- Verify admin user
SELECT * FROM admin;
-- Should show: username='admin', password='admin@123'

-- Check structure
DESCRIBE tbl_user;
DESCRIBE tbl_setting;
```

### 1.7 Update Default Admin Password

```sql
-- Change default admin password (REQUIRED for security!)
UPDATE admin
SET password = 'your-new-secure-password'
WHERE username = 'admin';
```

---

## Service 2: PHP Backend API

### 2.1 Prepare Backend Files

Before deployment, we need to prepare the backend code:

1. **Create Database Connection Config**

Create file: `/Users/max/Downloads/2sweet/Gomeet Admin Panel 1.5/inc/Connection.php`

```php
<?php
if (session_status() == PHP_SESSION_NONE) {
    session_start();
}

if(isset($_SESSION["sel_lan"])) {
    $currentLang = $_SESSION["sel_lan"];
    include_once "languages/{$currentLang}.php";
}

try {
    // Database connection using environment variables
    $dbHost = getenv('DB_HOST') ?: 'localhost';
    $dbUser = getenv('DB_USER') ?: 'gomeet_user';
    $dbPass = getenv('DB_PASSWORD') ?: '';
    $dbName = getenv('DB_NAME') ?: 'gommet';

    $dating = new mysqli($dbHost, $dbUser, $dbPass, $dbName);
    $dating->set_charset("utf8mb4");

    if ($dating->connect_error) {
        error_log("Database connection failed: " . $dating->connect_error);
        throw new Exception("Database connection failed");
    }
} catch(Exception $e) {
    error_log($e->getMessage());
    die("Database connection error. Please contact administrator.");
}

$prints = $dating->query("select * from tbl_meet")->fetch_assoc();
$set = $dating->query("SELECT * FROM `tbl_setting`")->fetch_assoc();
$apiKey = $set['map_key'];

if(isset($_SESSION["stype"]) && $_SESSION["stype"] == 'Staff') {
    $sdata = $dating->query("SELECT * FROM `tbl_manager` where email='".$_SESSION['datingname']."'")->fetch_assoc();
    $interest_per = explode(',',$sdata['interest']);
    $page_per = explode(',',$sdata['page']);
    $faq_per = explode(',',$sdata['faq']);
    $plist_per = explode(',',$sdata['plist']);
    $language_per = explode(',',$sdata['language']);
    $payout_per = explode(',',$sdata['payout']);
    $religion_per = explode(',',$sdata['religion']);
    $gift_per = explode(',',$sdata['gift']);
    $rgoal_per = explode(',',$sdata['rgoal']);
    $plan_per = explode(',',$sdata['plan']);
    $package_per = explode(',',$sdata['package']);
    $ulist_per = explode(',',$sdata['ulist']);
    $fakeuser_per = explode(',',$sdata['fakeuser']);
    $report_per = explode(',',$sdata['report']);
    $notification_per = explode(',',$sdata['notification']);
    $wallet_per = explode(',',$sdata['wallet']);
    $coin_per = explode(',',$sdata['coin']);
}
?>
```

2. **Create .htaccess for API Security**

Create file: `/Users/max/Downloads/2sweet/Gomeet Admin Panel 1.5/.htaccess`

```apache
# Enable Rewrite Engine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Force HTTPS (uncomment after SSL setup)
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Protect sensitive files
    <FilesMatch "(\.env|\.git|\.htaccess|composer\.json|composer\.lock|package\.json)$">
        Order allow,deny
        Deny from all
    </FilesMatch>
</IfModule>

# PHP Security Settings
<IfModule mod_php7.c>
    php_value upload_max_filesize 10M
    php_value post_max_size 10M
    php_value max_execution_time 300
    php_value max_input_time 300
    php_value memory_limit 256M
    php_flag display_errors Off
    php_flag log_errors On
    php_value error_log /var/log/php-errors.log
</IfModule>

# CORS Headers for API (adjust origins after deployment)
<IfModule mod_headers.c>
    # Allow from your frontend domains
    Header set Access-Control-Allow-Origin "https://2sweety.com"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Allow-Credentials "true"

    # Security Headers
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"

    # Remove server signature
    Header unset Server
    Header unset X-Powered-By
</IfModule>

# Disable directory listing
Options -Indexes

# Default document
DirectoryIndex index.php index.html

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

### 2.2 Create Backend Service in Coolify

1. Navigate to Coolify dashboard → **"+ New Resource"** → **"Application"**

**Source Configuration:**
```yaml
Type: Public Repository (or Private if you push to GitHub)
Source: Simple Dockerfile

# If using Git:
Git Provider: GitHub/GitLab/Gitea
Repository: your-repo/2sweety-backend
Branch: main
```

**Application Settings:**
```yaml
Name: 2sweety-backend-api
Description: 2Sweety PHP Backend API and Admin Panel
Build Pack: Dockerfile
```

### 2.3 Create Dockerfile for PHP Backend

Create file: `/Users/max/Downloads/2sweet/Gomeet Admin Panel 1.5/Dockerfile`

```dockerfile
FROM php:7.4-apache

# Install PHP extensions
RUN apt-get update && apt-get install -y \
    libpng-dev \
    libjpeg-dev \
    libfreetype6-dev \
    libzip-dev \
    unzip \
    git \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        gd \
        mysqli \
        pdo \
        pdo_mysql \
        zip \
    && rm -rf /var/lib/apt/lists/*

# Enable Apache modules
RUN a2enmod rewrite headers expires deflate

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . /var/www/html/

# Create upload directories and set permissions
RUN mkdir -p /var/www/html/images/user_images \
    /var/www/html/images/uploads \
    /var/www/html/images/gifts \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html \
    && chmod -R 777 /var/www/html/images

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
```

### 2.4 Configure Environment Variables in Coolify

In the backend service settings, add these environment variables:

```bash
# Database Configuration
DB_HOST=2sweety-mysql
DB_NAME=gommet
DB_USER=gomeet_user
DB_PASSWORD=[your-mysql-user-password]

# PHP Configuration
PHP_UPLOAD_MAX_FILESIZE=10M
PHP_POST_MAX_SIZE=10M
PHP_MAX_EXECUTION_TIME=300
PHP_MEMORY_LIMIT=256M

# Application Settings
APP_ENV=production
APP_DEBUG=false
APP_URL=https://api.2sweety.com

# API Keys (will be stored in database settings table)
# These are loaded from tbl_setting table after deployment
```

### 2.5 Configure Domain & SSL

**Domain Configuration:**
```yaml
Domain: api.2sweety.com
Port Mapping: 80:80
SSL/TLS: Enable Let's Encrypt
```

**SSL Certificate:**
- Enable **"Generate Let's Encrypt SSL"**
- Coolify will auto-generate and renew certificates

### 2.6 Deploy Backend

1. Push code to Git repository (if using Git source)
   OR
   Use Coolify's file upload for direct deployment

2. Click **"Deploy"**

3. Monitor deployment logs for errors

4. Wait for status: **"Running"**

### 2.7 Verify Backend Deployment

**Test API Endpoints:**

```bash
# Health check (create this endpoint)
curl https://api.2sweety.com/api/health.php

# Test database connection
curl https://api.2sweety.com/api/languagelist.php

# Admin panel access
curl https://api.2sweety.com/
```

**Expected Responses:**
- HTTP 200 OK
- JSON responses from API
- Admin login page loads

---

## Service 3: React Frontend

### 3.1 Prepare Frontend Build

The frontend uses Create React App and requires environment variables at BUILD TIME.

### 3.2 Create Frontend Service in Coolify

1. **"+ New Resource"** → **"Application"**

**Source Configuration:**
```yaml
Type: Public Repository (or upload)
Build Pack: Nixpacks (or Static Site)
```

**Application Settings:**
```yaml
Name: 2sweety-frontend
Description: 2Sweety React Web Application
```

### 3.3 Create Dockerfile for Frontend

Create file: `/Users/max/Downloads/2sweet/GoMeet Web/Dockerfile`

```dockerfile
# Build stage
FROM node:18-alpine AS build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build arguments (environment variables for React)
ARG REACT_APP_API_BASE_URL
ARG REACT_APP_IMAGE_BASE_URL
ARG REACT_APP_PAYMENT_BASE_URL
ARG REACT_APP_FIREBASE_API_KEY
ARG REACT_APP_FIREBASE_AUTH_DOMAIN
ARG REACT_APP_FIREBASE_PROJECT_ID
ARG REACT_APP_FIREBASE_STORAGE_BUCKET
ARG REACT_APP_FIREBASE_MESSAGING_SENDER_ID
ARG REACT_APP_FIREBASE_APP_ID
ARG REACT_APP_FIREBASE_MEASUREMENT_ID
ARG REACT_APP_AGORA_APP_ID
ARG REACT_APP_ONESIGNAL_APP_ID
ARG REACT_APP_GOOGLE_MAPS_API_KEY

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx-default.conf /etc/nginx/conf.d/default.conf

# Copy built files from build stage
COPY --from=build /app/build /usr/share/nginx/html

# Create non-root user for Nginx
RUN addgroup -g 1000 nginx-app && \
    adduser -D -u 1000 -G nginx-app nginx-app && \
    chown -R nginx-app:nginx-app /usr/share/nginx/html && \
    chown -R nginx-app:nginx-app /var/cache/nginx && \
    chown -R nginx-app:nginx-app /var/log/nginx && \
    touch /var/run/nginx.pid && \
    chown -R nginx-app:nginx-app /var/run/nginx.pid

# Use non-root user
USER nginx-app

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
```

### 3.4 Create Nginx Config for Frontend

Create file: `/Users/max/Downloads/2sweet/GoMeet Web/nginx-default.conf`

```nginx
server {
    listen 8080;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Content Security Policy
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://api.2sweety.com https://firestore.googleapis.com https://fcm.googleapis.com wss://*.firebaseio.com; frame-src 'self' https://www.youtube.com;" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Browser caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # HTML files - no cache
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # API proxy (optional - if you want to proxy through frontend)
    location /api/ {
        proxy_pass https://api.2sweety.com/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

### 3.5 Configure Environment Variables (Build Arguments)

In Coolify, add these as **BUILD ARGUMENTS** (not runtime env vars):

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/

# Firebase Configuration (from your .env.example)
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

# External Services (GET FROM RESPECTIVE PROVIDERS)
REACT_APP_AGORA_APP_ID=[your-agora-app-id]
REACT_APP_ONESIGNAL_APP_ID=[your-onesignal-app-id]
REACT_APP_GOOGLE_MAPS_API_KEY=[your-google-maps-api-key]
REACT_APP_GOOGLE_CLIENT_ID=[your-google-oauth-client-id]
REACT_APP_FACEBOOK_APP_ID=[your-facebook-app-id]

# Payment Gateways (public keys only)
REACT_APP_RAZORPAY_KEY_ID=[your-razorpay-key-id]
REACT_APP_PAYPAL_CLIENT_ID=[your-paypal-client-id]
REACT_APP_STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]

# App Configuration
REACT_APP_ENVIRONMENT=production
REACT_APP_DEBUG_MODE=false
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
```

### 3.6 Configure Domain & SSL

**Domain Configuration:**
```yaml
Domains:
  - 2sweety.com
  - app.2sweety.com (optional)
Port Mapping: 8080:8080
SSL/TLS: Enable Let's Encrypt
```

### 3.7 Deploy Frontend

1. Click **"Deploy"**
2. Monitor build logs (may take 5-10 minutes for npm install + build)
3. Wait for status: **"Running"**

### 3.8 Verify Frontend Deployment

```bash
# Check frontend loads
curl https://2sweety.com/

# Check health endpoint
curl https://2sweety.com/health

# Verify API connectivity (from browser console)
fetch('https://api.2sweety.com/api/languagelist.php')
  .then(r => r.json())
  .then(console.log)
```

---

## Post-Deployment Configuration

### 4.1 Update Backend Settings Table

The backend stores many settings in the database `tbl_setting` table. You need to configure these after deployment.

1. Access phpMyAdmin (temporary) or MySQL shell
2. Update settings:

```sql
USE gommet;

-- Update app URLs
UPDATE tbl_setting SET
    weburl = 'https://2sweety.com',
    apiurl = 'https://api.2sweety.com';

-- Add API keys
UPDATE tbl_setting SET
    map_key = 'your-google-maps-api-key',
    agora_app_id = 'your-agora-app-id',
    onesignal_app_id = 'your-onesignal-app-id',
    onesignal_auth_key = 'your-onesignal-rest-api-key';

-- Configure payment gateways
UPDATE tbl_setting SET
    razorpay_key_id = 'your-razorpay-key-id',
    razorpay_key_secret = 'your-razorpay-key-secret',
    stripe_publishable_key = 'your-stripe-publishable-key',
    stripe_secret_key = 'your-stripe-secret-key',
    paypal_client_id = 'your-paypal-client-id',
    paypal_secret = 'your-paypal-secret';
```

### 4.2 Configure Firebase Backend Integration

Update your backend to validate Firebase tokens:

Create file: `/api/firebase_auth.php`

```php
<?php
// Firebase Admin SDK integration for token verification
// Install Firebase PHP SDK: composer require google/firebase-admin

require_once __DIR__ . '/../vendor/autoload.php';

use Google\Auth\Credentials\ServiceAccountCredentials;
use Firebase\JWT\JWT;

function verifyFirebaseToken($idToken) {
    $projectId = 'sweet-a6718';

    try {
        // Get Firebase public keys
        $keys = file_get_contents('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
        $keys = json_decode($keys, true);

        // Decode and verify token
        $decoded = JWT::decode($idToken, $keys, ['RS256']);

        if ($decoded->aud !== $projectId) {
            throw new Exception('Invalid audience');
        }

        return [
            'success' => true,
            'uid' => $decoded->sub,
            'email' => $decoded->email ?? null
        ];
    } catch (Exception $e) {
        return [
            'success' => false,
            'error' => $e->getMessage()
        ];
    }
}
?>
```

### 4.3 Test Full User Flow

1. **Frontend → Backend → Database:**
   - Open https://2sweety.com
   - Try registration flow
   - Check database for new user entry

2. **Firebase Integration:**
   - Test Google/Facebook login
   - Verify Firebase Authentication works
   - Check Firestore chat functionality

3. **Payment Integration:**
   - Test coin purchase flow
   - Verify payment gateway redirects
   - Check transaction records in database

4. **Media Upload:**
   - Test profile image upload
   - Verify images saved to `/images/user_images/`
   - Check image URLs are accessible

### 4.4 Admin Panel Access

1. Access admin panel: https://api.2sweety.com/
2. Login credentials:
   - Username: `admin`
   - Password: [the password you set in database]

3. Configure app settings via admin panel:
   - Upload app logo
   - Set app name and description
   - Configure notification settings
   - Add subscription plans
   - Set coin packages
   - Configure payment methods

---

## Security Hardening

### 5.1 Database Security

```sql
-- Remove default admin password (if still admin@123)
UPDATE admin SET password = 'new-secure-password' WHERE username = 'admin';

-- Create read-only database user for analytics
CREATE USER 'analytics_readonly'@'%' IDENTIFIED BY 'strong-password';
GRANT SELECT ON gommet.* TO 'analytics_readonly'@'%';
FLUSH PRIVILEGES;
```

### 5.2 Backend Security Checklist

- [ ] Change all default passwords
- [ ] Disable PHP error display in production
- [ ] Enable HTTPS-only (force HTTPS in .htaccess)
- [ ] Implement rate limiting on API endpoints
- [ ] Add CSRF protection for admin panel
- [ ] Sanitize all user inputs (SQL injection prevention)
- [ ] Implement file upload validation (check MIME types)
- [ ] Set proper file permissions (755 for directories, 644 for files)
- [ ] Remove phpMyAdmin after initial setup
- [ ] Enable database backups
- [ ] Implement API authentication tokens
- [ ] Add IP whitelist for admin panel (optional)

### 5.3 Frontend Security

Update CSP headers in Nginx config to restrict external resources:

```nginx
add_header Content-Security-Policy "
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://connect.facebook.net;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    font-src 'self' https://fonts.gstatic.com;
    img-src 'self' data: https: blob:;
    connect-src 'self' https://api.2sweety.com https://*.googleapis.com https://*.firebaseio.com wss://*.firebaseio.com https://api.agora.io;
    frame-src 'self' https://www.youtube.com https://www.facebook.com;
    media-src 'self' blob:;
" always;
```

### 5.4 SSL/TLS Configuration

Coolify handles SSL via Let's Encrypt automatically, but verify:

```bash
# Check SSL certificate
curl -vI https://2sweety.com 2>&1 | grep -i "SSL"

# Test SSL rating
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=2sweety.com
```

Should achieve **A** or **A+** rating.

### 5.5 Firewall Rules

Configure Coolify server firewall:

```bash
# Allow only necessary ports
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP (redirects to HTTPS)
ufw allow 443/tcp   # HTTPS
ufw enable
```

---

## Monitoring & Maintenance

### 6.1 Set Up Monitoring

**Coolify Built-in Monitoring:**
- View service metrics in Coolify dashboard
- Monitor CPU, memory, disk usage
- Check application logs

**Additional Monitoring (Optional):**

1. **Uptime Monitoring:**
   - UptimeRobot (free)
   - Better Uptime
   - Pingdom

   Monitor these endpoints:
   - https://2sweety.com/health
   - https://api.2sweety.com/api/health.php

2. **Error Tracking:**
   - Sentry.io (recommended)
   - Rollbar
   - Bugsnag

   Add to React app:
   ```bash
   npm install @sentry/react
   ```

3. **Analytics:**
   - Already configured: Google Analytics via Firebase
   - Additional: Mixpanel, Amplitude

### 6.2 Backup Strategy

**Database Backups:**

Create automated backup script in Coolify:

```bash
#!/bin/bash
# Database backup script

BACKUP_DIR="/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="2sweety-mysql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
docker exec $CONTAINER_NAME mysqldump -u root -p$MYSQL_ROOT_PASSWORD gommet > $BACKUP_DIR/gommet_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/gommet_$DATE.sql

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
# aws s3 cp $BACKUP_DIR/gommet_$DATE.sql.gz s3://your-bucket/backups/
```

Add to crontab (daily at 2 AM):
```bash
0 2 * * * /path/to/backup-script.sh
```

**File Backups:**
- User uploaded images in `/images/`
- Application code (via Git)
- Configuration files

### 6.3 Log Management

**View Logs in Coolify:**
- Application logs: Service → Logs tab
- Access logs: Nginx access logs
- Error logs: Application error logs

**Log Rotation:**

Coolify handles log rotation automatically. Manual configuration:

```bash
# /etc/logrotate.d/coolify-apps
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

### 6.4 Performance Optimization

**Database Optimization:**

```sql
-- Analyze and optimize tables weekly
ANALYZE TABLE tbl_user;
OPTIMIZE TABLE tbl_user;

-- Add indexes for frequently queried columns
CREATE INDEX idx_user_status ON tbl_user(status);
CREATE INDEX idx_user_lat_long ON tbl_user(latitude, longitude);
```

**Frontend Optimization:**
- Already implemented: Gzip, browser caching, CDN-ready
- Consider: Cloudflare CDN for global distribution

**Backend Optimization:**
- Enable PHP OpCache
- Implement Redis caching (advanced)

---

## Troubleshooting

### Common Issues & Solutions

**Issue 1: Frontend can't connect to Backend API**

**Symptoms:** CORS errors in browser console

**Solution:**
```apache
# Update backend .htaccess CORS headers
Header set Access-Control-Allow-Origin "https://2sweety.com"

# Or allow multiple origins
SetEnvIf Origin "^https://(2sweety\.com|app\.2sweety\.com)$" ORIGIN_ALLOWED=$0
Header set Access-Control-Allow-Origin "%{ORIGIN_ALLOWED}e" env=ORIGIN_ALLOWED
```

**Issue 2: Database connection failed**

**Symptoms:** "Database connection error" on API calls

**Solution:**
1. Check database container is running:
   ```bash
   docker ps | grep mysql
   ```

2. Verify database credentials in backend environment variables

3. Test connection from backend container:
   ```bash
   docker exec -it 2sweety-backend-api php -r "new mysqli('2sweety-mysql', 'gomeet_user', 'password', 'gommet');"
   ```

**Issue 3: Images not uploading**

**Symptoms:** File upload fails or returns 500 error

**Solution:**
1. Check directory permissions:
   ```bash
   docker exec 2sweety-backend-api ls -la /var/www/html/images
   ```

2. Set correct permissions:
   ```bash
   docker exec 2sweety-backend-api chmod -R 777 /var/www/html/images
   ```

**Issue 4: Firebase authentication not working**

**Symptoms:** "Firebase: Error (auth/invalid-api-key)"

**Solution:**
1. Verify Firebase config in frontend build arguments
2. Check Firebase project settings match your domain
3. Add authorized domains in Firebase Console:
   - Firebase Console → Authentication → Settings → Authorized domains
   - Add: `2sweety.com`, `app.2sweety.com`

**Issue 5: SSL certificate not generating**

**Symptoms:** "Let's Encrypt failed" error

**Solution:**
1. Check DNS propagation:
   ```bash
   nslookup 2sweety.com
   nslookup api.2sweety.com
   ```

2. Verify domain points to Coolify server IP

3. Check port 80 is accessible (Let's Encrypt needs it)

4. Retry SSL generation in Coolify

**Issue 6: High server load**

**Symptoms:** Slow response times, high CPU/memory

**Solution:**
1. Check resource usage:
   ```bash
   docker stats
   ```

2. Increase service resource limits in Coolify

3. Optimize database queries

4. Enable caching (Redis/Memcached)

---

## Production Checklist

### Pre-Launch Checklist

- [ ] All environment variables configured correctly
- [ ] Database imported and verified (24 tables)
- [ ] Admin password changed from default
- [ ] Frontend deployed and accessible
- [ ] Backend API endpoints responding
- [ ] Firebase authentication working
- [ ] Payment gateways configured and tested (sandbox mode first!)
- [ ] Image upload functionality working
- [ ] SSL certificates active on all domains
- [ ] CORS headers configured correctly
- [ ] Admin panel accessible and functional
- [ ] User registration flow tested end-to-end
- [ ] Chat functionality working (Firebase Firestore)
- [ ] Video/Audio calling tested (Agora)
- [ ] Mobile app connectivity verified (if deploying mobile)
- [ ] Backup system configured and tested
- [ ] Monitoring and alerts set up
- [ ] Error tracking implemented (Sentry)
- [ ] Security headers verified
- [ ] Database backups automated
- [ ] File upload limits configured
- [ ] Email notifications working
- [ ] Push notifications working (OneSignal)

### Post-Launch Monitoring

**First 24 Hours:**
- Monitor error logs constantly
- Check server resource usage
- Verify database connections stable
- Test critical user flows
- Monitor payment transactions
- Check SSL certificate status

**First Week:**
- Review analytics data
- Check for performance issues
- Monitor database growth
- Verify backups running
- Review error reports
- User feedback collection

**Ongoing:**
- Weekly database optimization
- Monthly security updates
- Regular backup verification
- Performance monitoring
- Cost optimization
- Feature analytics

---

## Additional Resources

### API Key Acquisition Guides

Refer to these guides for obtaining API keys:

1. **Firebase Setup:**
   - Visit: https://console.firebase.google.com/
   - Create project or use existing: sweet-a6718
   - Get config from Project Settings → General → Your apps → Web app

2. **Agora RTC:**
   - Visit: https://console.agora.io/
   - Sign up → Create Project → Get App ID
   - Enable App Certificate for production

3. **Google Maps:**
   - Visit: https://console.cloud.google.com/
   - Enable APIs: Maps JavaScript API, Geocoding API, Places API
   - Create API Key → Restrict by domain

4. **OneSignal:**
   - Visit: https://app.onesignal.com/
   - Create app → Get App ID and REST API Key

5. **Payment Gateways:**
   - Razorpay: https://dashboard.razorpay.com/
   - Stripe: https://dashboard.stripe.com/
   - PayPal: https://developer.paypal.com/

### Support & Documentation

- **Coolify Docs:** https://coolify.io/docs
- **React Docs:** https://react.dev/
- **Firebase Docs:** https://firebase.google.com/docs
- **Agora Docs:** https://docs.agora.io/
- **PHP Docs:** https://www.php.net/docs.php

---

## Summary

You now have a complete production-ready deployment of 2Sweety on Coolify:

1. **MySQL Database** running with proper security
2. **PHP Backend API** serving 50+ endpoints + admin panel
3. **React Frontend** with static build served by Nginx
4. **SSL certificates** on all domains
5. **Firebase integration** for real-time features
6. **Payment gateways** configured
7. **Monitoring** and **backups** in place
8. **Security hardening** applied

**Next Steps:**
1. Test all critical user flows
2. Set up payment gateway sandbox testing
3. Configure admin panel settings
4. Add content (plans, packages, settings)
5. Invite beta testers
6. Monitor performance and errors
7. Plan for scaling as users grow

---

**Deployment Engineer Notes:**

This deployment follows industry best practices:
- ✅ Containerized architecture (Docker)
- ✅ Environment-based configuration
- ✅ Zero-downtime deployments (via Coolify)
- ✅ Automated SSL certificate management
- ✅ Database backups and disaster recovery
- ✅ Security hardening (HTTPS, CSP, CORS)
- ✅ Monitoring and logging
- ✅ Scalable infrastructure (can easily add replicas in Coolify)

For production scaling (10,000+ users):
- Consider: Load balancer (Coolify supports this)
- Consider: Read replicas for database
- Consider: CDN for static assets (Cloudflare)
- Consider: Redis for session management and caching
- Consider: Horizontal scaling (multiple backend instances)

Good luck with your deployment! 🚀
