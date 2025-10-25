# 🚀 2Sweety - 15-Minute Quick Start

## For the Impatient Developer

**Goal:** Get 2Sweety running on Coolify in 15 minutes (assuming API keys ready)

---

## ⏱️ Step 1: Database (3 minutes)

```bash
# In Coolify:
New Resource → Database → MySQL 8.0

Name: 2sweety-mysql
Database: gommet
User: gomeet_user
Password: [generate-strong-password-and-save-it]

→ Deploy → Wait for "Running" status

# Import database:
./database-setup.sh
# Enter passwords when prompted
```

---

## ⏱️ Step 2: Backend API (5 minutes)

```bash
# In Coolify:
New Resource → Application → Dockerfile

Name: 2sweety-backend-api
Domain: api.2sweety.com
Source: Local/Git
Path: Gomeet Admin Panel 1.5/

# Environment Variables:
DB_HOST=2sweety-mysql
DB_NAME=gommet
DB_USER=gomeet_user
DB_PASSWORD=[your-database-password]
APP_ENV=production
APP_DEBUG=false

→ Deploy → Enable SSL → Wait 5 minutes
```

**Test:** `curl https://api.2sweety.com/api/languagelist.php`

---

## ⏱️ Step 3: Frontend (7 minutes)

```bash
# In Coolify:
New Resource → Application → Dockerfile

Name: 2sweety-frontend
Domain: 2sweety.com
Source: Local/Git
Path: GoMeet Web/

# BUILD ARGUMENTS (NOT runtime env vars!):
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/

# Firebase (already configured):
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0

# External services (GET THESE FIRST!):
REACT_APP_AGORA_APP_ID=your-agora-app-id
REACT_APP_ONESIGNAL_APP_ID=your-onesignal-app-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-maps-api-key

GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true

→ Deploy → Enable SSL → Wait 10 minutes for build
```

**Test:** Open `https://2sweety.com` in browser

---

## ⏱️ Step 4: Configure (2 minutes)

```sql
# Update backend settings:
# Access: https://api.2sweety.com
# Login: admin / [password-you-set-in-database]

# Or via MySQL:
USE gommet;

UPDATE tbl_setting SET
  weburl = 'https://2sweety.com',
  apiurl = 'https://api.2sweety.com',
  map_key = 'your-google-maps-api-key',
  agora_app_id = 'your-agora-app-id',
  onesignal_app_id = 'your-onesignal-app-id';
```

---

## ✅ Verify Everything Works

```bash
# 1. Frontend loads
curl https://2sweety.com/health
# Expected: "OK"

# 2. Backend API responds
curl https://api.2sweety.com/api/languagelist.php
# Expected: JSON response

# 3. Admin panel accessible
open https://api.2sweety.com
# Expected: Login page loads

# 4. Frontend → Backend connection
# Open https://2sweety.com in browser
# Open DevTools console
fetch('https://api.2sweety.com/api/languagelist.php')
  .then(r => r.json())
  .then(console.log)
# Expected: JSON response, NO CORS errors
```

---

## 🎉 Done!

You now have:
- ✅ MySQL database running with 24 tables
- ✅ PHP backend API + admin panel
- ✅ React frontend deployed
- ✅ SSL certificates on both domains
- ✅ Frontend talking to backend

---

## 🔑 What You Still Need

### Critical (App Won't Work Without):
1. **Agora App ID** - Video/audio calls won't work
   - Get it: https://console.agora.io/ (5 minutes)

2. **Google Maps API Key** - Location features won't work
   - Get it: https://console.cloud.google.com/ (10 minutes)

3. **OneSignal App ID** - Push notifications won't work
   - Get it: https://app.onesignal.com/ (5 minutes)

### Optional (But Recommended):
4. Payment gateways (Razorpay, Stripe, PayPal)
5. Social login (Google OAuth, Facebook)

**Get these ASAP! See:** `API_KEYS_GUIDE.md`

---

## 🚨 Common Issues

### "CORS Error" in Browser Console
**Fix:** Update backend `.htaccess`:
```apache
Header set Access-Control-Allow-Origin "https://2sweety.com"
```

### "Database connection failed"
**Fix:** Check environment variables in backend service:
```bash
DB_HOST=2sweety-mysql  # NOT localhost!
DB_USER=gomeet_user
DB_PASSWORD=[correct-password]
```

### Frontend Shows "undefined" for API URLs
**Fix:** React env vars must be BUILD ARGUMENTS, not runtime env vars!
Rebuild after setting them correctly.

### Images Won't Upload
**Fix:**
```bash
docker exec 2sweety-backend-api chmod -R 777 /var/www/html/images
```

---

## 📚 Full Documentation

For detailed instructions, see:

1. **DEPLOYMENT_SUMMARY.md** - Overview and quick reference
2. **COOLIFY_DEPLOYMENT_GUIDE.md** - Complete step-by-step guide
3. **API_KEYS_GUIDE.md** - How to get all API keys
4. **DEPLOYMENT_CHECKLIST.md** - Production checklist
5. **database-setup.sh** - Automated database import
6. **database-backup.sh** - Automated backups

---

## 🆘 Need Help?

1. Check deployment logs in Coolify
2. Review `COOLIFY_DEPLOYMENT_GUIDE.md` troubleshooting section
3. Join Coolify Discord: https://coollabs.io/discord

---

**Total Time:** ~15 minutes (assuming API keys ready)

**Good luck! 🚀**
