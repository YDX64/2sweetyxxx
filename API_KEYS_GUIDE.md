# 🔑 2Sweety API Keys Acquisition Guide

## 📋 Complete List of Required API Keys

### Priority Levels:
- 🔴 **CRITICAL** - App won't work without these
- 🟡 **HIGH** - Core features won't work
- 🟢 **MEDIUM** - Optional but recommended
- 🔵 **LOW** - Nice to have

---

## 🔴 CRITICAL - Required for App to Function

### 1. Firebase (ALREADY CONFIGURED ✅)

**What it does:** Authentication, Real-time Chat, Push Notifications, Cloud Storage

**Status:** ✅ Already configured for project `sweet-a6718`

**Configuration (Already Done):**
```bash
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP
```

**Additional Setup Required:**
1. Go to https://console.firebase.google.com/
2. Select project: **sweet-a6718**
3. Add authorized domains:
   - Click **Authentication** → **Settings** → **Authorized domains**
   - Add: `2sweety.com` and `app.2sweety.com`
4. Enable required services:
   - ✅ **Authentication** → Enable Email/Password, Google, Facebook
   - ✅ **Firestore Database** → Create database in production mode
   - ✅ **Storage** → Enable Cloud Storage
   - ✅ **Cloud Messaging** → Already enabled

**Cost:** FREE (Spark plan)
- 10GB storage
- 50K reads/day
- 20K writes/day
- 20K deletes/day

**Upgrade when needed:** Blaze plan (pay-as-you-go) for production scaling

---

### 2. Backend API (Internal - No External Key)

**What it does:** Core application logic, user management, database operations

**Status:** ✅ Self-hosted on Coolify

**Configuration:**
```bash
# These are internal database credentials you create during deployment
DB_HOST=2sweety-mysql
DB_NAME=gommet
DB_USER=gomeet_user
DB_PASSWORD=[your-secure-password-here]
```

**Setup:** Covered in deployment guide (COOLIFY_DEPLOYMENT_GUIDE.md)

**Cost:** FREE (self-hosted)

---

## 🟡 HIGH PRIORITY - Core Features

### 3. Agora RTC (Video/Audio Calling)

**What it does:** Real-time video and audio calling between users

**Website:** https://console.agora.io/

**How to get:**

1. **Sign Up:**
   - Visit: https://console.agora.io/
   - Click "Get Started for Free"
   - Register with email or Google account

2. **Create Project:**
   - Dashboard → **Projects** → **Create**
   - Project Name: `2Sweety Production`
   - Use Case: `Social` or `Dating`
   - Click **Create**

3. **Get App ID:**
   - Click on your project
   - Copy the **App ID** (visible immediately)
   - Example: `3a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p`

4. **Enable Features (Recommended):**
   - Click **Configure**
   - Enable: **Recording**, **Cloud Proxy**, **Co-hosting**
   - Save settings

5. **Security (Production):**
   - Enable **App Certificate** (highly recommended)
   - This requires implementing token generation on backend
   - Docs: https://docs.agora.io/en/video-calling/develop/authentication-workflow

**Configuration:**
```bash
REACT_APP_AGORA_APP_ID=your-agora-app-id-here
```

**Free Tier:**
- 10,000 minutes/month FREE
- Unlimited projects
- Basic features included

**Pricing:**
- Free: 10,000 minutes/month
- Paid: $0.99-$3.99 per 1,000 minutes (depends on features)

**Production Notes:**
- ✅ Enable App Certificate before launch
- ✅ Implement token server on backend
- ✅ Monitor usage in dashboard
- ✅ Set up billing alerts

---

### 4. Google Maps API

**What it does:** Location services, maps display, nearby users

**Website:** https://console.cloud.google.com/

**How to get:**

1. **Create Google Cloud Project:**
   - Visit: https://console.cloud.google.com/
   - Click **Select a project** → **New Project**
   - Project Name: `2Sweety Maps`
   - Click **Create**

2. **Enable Required APIs:**
   - Go to **APIs & Services** → **Library**
   - Enable these APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Geocoding API**
     - ✅ **Places API**
     - ✅ **Geolocation API** (optional)

3. **Create API Key:**
   - **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **API Key**
   - Copy the API key immediately
   - Example: `AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Restrict API Key (IMPORTANT!):**
   - Click **Edit API key**
   - **Application restrictions:**
     - Select: **HTTP referrers (web sites)**
     - Add referrers:
       - `https://2sweety.com/*`
       - `https://app.2sweety.com/*`
       - `http://localhost:3000/*` (for development)
   - **API restrictions:**
     - Select: **Restrict key**
     - Select only enabled APIs above
   - Click **Save**

**Configuration:**
```bash
REACT_APP_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Free Tier:**
- $200 FREE credit per month
- 28,000 map loads/month (equivalent)
- Pay-as-you-go after credit exhausted

**Pricing:**
- Maps JavaScript API: $7 per 1,000 loads (after free tier)
- Geocoding API: $5 per 1,000 requests
- Places API: $17 per 1,000 requests

**Production Notes:**
- ✅ ALWAYS restrict API key by domain
- ✅ Monitor usage in Google Cloud Console
- ✅ Set up billing alerts at $50, $100, $150
- ✅ Consider caching geocoding results

---

### 5. OneSignal (Push Notifications)

**What it does:** Web and mobile push notifications

**Website:** https://onesignal.com/

**How to get:**

1. **Sign Up:**
   - Visit: https://onesignal.com/
   - Click **Get Started Free**
   - Register with email or GitHub

2. **Create App:**
   - Dashboard → **New App/Website**
   - App Name: `2Sweety`
   - Select platform: **Web Push**
   - Click **Next**

3. **Web Push Configuration:**
   - Choose: **Typical Site**
   - Site URL: `https://2sweety.com`
   - Auto Resubscribe: **ON**
   - Default Icon URL: `https://2sweety.com/logo192.png`
   - Click **Save**

4. **Get Credentials:**
   - Dashboard → **Settings** → **Keys & IDs**
   - Copy:
     - **OneSignal App ID**: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
     - **REST API Key**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

5. **Configure Allowed Origins:**
   - **Settings** → **All Browsers**
   - Add origins:
     - `https://2sweety.com`
     - `https://app.2sweety.com`
     - `http://localhost:3000` (development)

**Configuration:**
```bash
# Frontend
REACT_APP_ONESIGNAL_APP_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Backend (in database tbl_setting)
onesignal_app_id=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
onesignal_auth_key=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Free Tier:**
- Unlimited subscribers
- Unlimited notifications
- 10,000 email sends/month

**Pricing:**
- Free tier is usually sufficient
- Paid plans for advanced features ($99+/month)

**Production Notes:**
- ✅ Test notifications before launch
- ✅ Customize notification templates
- ✅ Set up automated notifications (new matches, messages)
- ✅ Monitor delivery rates

---

## 🟢 MEDIUM PRIORITY - Payment Gateways

### 6. Razorpay (Primary Payment Gateway)

**What it does:** Accept payments in India (cards, UPI, wallets)

**Website:** https://razorpay.com/

**How to get:**

1. **Sign Up:**
   - Visit: https://dashboard.razorpay.com/signup
   - Register business account
   - Complete KYC verification

2. **Get API Keys:**
   - **Dashboard** → **Settings** → **API Keys**
   - Click **Generate Test Key** (for testing)
   - Copy:
     - **Key ID**: `rzp_test_xxxxxxxxxxxx` (public, safe for client)
     - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx` (private, backend only!)

3. **Live Keys (After Testing):**
   - Complete KYC verification
   - **Settings** → **API Keys** → **Generate Live Key**
   - Copy:
     - **Key ID**: `rzp_live_xxxxxxxxxxxx`
     - **Key Secret**: `xxxxxxxxxxxxxxxxxxxxxxxx`

4. **Webhook Setup:**
   - **Settings** → **Webhooks**
   - Webhook URL: `https://api.2sweety.com/api/razorpay_webhook.php`
   - Events: Select all payment events
   - Click **Create Webhook**

**Configuration:**
```bash
# Frontend (PUBLIC key only!)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx

# Backend (SECRET key - NEVER expose!)
razorpay_key_id=rzp_live_xxxxxxxxxxxx
razorpay_key_secret=xxxxxxxxxxxxxxxxxxxxxxxx
```

**Pricing:**
- 2% transaction fee (cards)
- 0% transaction fee (UPI, most wallets)
- No setup fees
- Instant settlement (T+0) available

**Production Notes:**
- ✅ Use TEST keys until thoroughly tested
- ✅ Verify webhook signature for security
- ✅ Handle all payment states (success, failure, pending)
- ✅ Store transaction IDs in database

---

### 7. Stripe (International Payments)

**What it does:** Accept payments globally (cards, wallets)

**Website:** https://stripe.com/

**How to get:**

1. **Sign Up:**
   - Visit: https://dashboard.stripe.com/register
   - Register with email
   - Complete business verification

2. **Get API Keys:**
   - **Developers** → **API Keys**
   - Copy TEST keys first:
     - **Publishable key**: `pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (public)
     - **Secret key**: `sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (private)

3. **Live Keys (After Testing):**
   - Toggle to **Live mode**
   - Copy LIVE keys:
     - **Publishable key**: `pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - **Secret key**: `sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Webhook Setup:**
   - **Developers** → **Webhooks** → **Add endpoint**
   - Endpoint URL: `https://api.2sweety.com/api/stripe_webhook.php`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy **Webhook signing secret**: `whsec_xxxxxxxxxxxxxxxxxxxxxxxx`

**Configuration:**
```bash
# Frontend (PUBLIC key only!)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Backend (SECRET keys - NEVER expose!)
stripe_publishable_key=pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
stripe_secret_key=sk_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
stripe_webhook_secret=whsec_xxxxxxxxxxxxxxxxxxxxxxxx
```

**Pricing:**
- 2.9% + $0.30 per transaction (US)
- 3.4% + $0.30 per transaction (international)
- No monthly fees

**Production Notes:**
- ✅ Use TEST mode with test cards
- ✅ Verify webhook signatures
- ✅ Handle SCA (Strong Customer Authentication) for Europe
- ✅ Set up automatic receipt emails

---

### 8. PayPal

**What it does:** Accept PayPal payments globally

**Website:** https://developer.paypal.com/

**How to get:**

1. **Create Business Account:**
   - Visit: https://www.paypal.com/business
   - Sign up for Business Account
   - Complete verification

2. **Access Developer Portal:**
   - Visit: https://developer.paypal.com/
   - Log in with PayPal account
   - Go to **Dashboard** → **My Apps & Credentials**

3. **Create App:**
   - **Sandbox** → **Create App**
   - App Name: `2Sweety Payments`
   - App Type: **Merchant**
   - Copy SANDBOX credentials:
     - **Client ID**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
     - **Secret**: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

4. **Live Credentials:**
   - Switch to **Live** tab
   - Create live app
   - Copy LIVE credentials

**Configuration:**
```bash
# Frontend (PUBLIC Client ID only!)
REACT_APP_PAYPAL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_PAYPAL_MODE=production

# Backend (SECRET - NEVER expose!)
paypal_client_id=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
paypal_secret=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
paypal_mode=production
```

**Pricing:**
- 3.49% + fixed fee per transaction
- No monthly fees
- Instant transfers (for a fee)

**Production Notes:**
- ✅ Test thoroughly in Sandbox mode
- ✅ Handle IPN (Instant Payment Notification)
- ✅ Verify payment status server-side
- ✅ Set return URLs correctly

---

## 🔵 LOW PRIORITY - Social Login

### 9. Google OAuth (Social Login)

**What it does:** Allow users to sign in with Google

**Website:** https://console.cloud.google.com/

**How to get:**

1. **Use Existing Google Cloud Project** (from Maps setup)
   - Or create new: **New Project** → `2Sweety Auth`

2. **Configure OAuth Consent Screen:**
   - **APIs & Services** → **OAuth consent screen**
   - User Type: **External**
   - App name: `2Sweety`
   - User support email: your-email@gmail.com
   - Developer contact: your-email@gmail.com
   - Add scopes: `email`, `profile`
   - Save

3. **Create OAuth 2.0 Client ID:**
   - **Credentials** → **Create Credentials** → **OAuth client ID**
   - Application type: **Web application**
   - Name: `2Sweety Web Client`
   - Authorized JavaScript origins:
     - `https://2sweety.com`
     - `https://app.2sweety.com`
     - `http://localhost:3000` (development)
   - Authorized redirect URIs:
     - `https://2sweety.com/login`
     - `https://app.2sweety.com/login`
   - Click **Create**
   - Copy **Client ID**: `xxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com`

**Configuration:**
```bash
REACT_APP_GOOGLE_CLIENT_ID=xxxxxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
```

**Pricing:** FREE

---

### 10. Facebook Login

**What it does:** Allow users to sign in with Facebook

**Website:** https://developers.facebook.com/

**How to get:**

1. **Create Facebook App:**
   - Visit: https://developers.facebook.com/
   - **My Apps** → **Create App**
   - Use case: **Consumer**
   - App name: `2Sweety`
   - Contact email: your-email@example.com
   - Click **Create App**

2. **Add Facebook Login Product:**
   - Dashboard → **Add Product** → **Facebook Login**
   - Select **Web** platform

3. **Configure Settings:**
   - **Facebook Login** → **Settings**
   - Valid OAuth Redirect URIs:
     - `https://2sweety.com/login`
     - `https://app.2sweety.com/login`
   - Save changes

4. **Get App ID:**
   - Dashboard → **Settings** → **Basic**
   - Copy **App ID**: `123456789012345`
   - Copy **App Secret**: (keep this secret!)

5. **Add App Domains:**
   - **Settings** → **Basic**
   - App Domains: `2sweety.com`, `app.2sweety.com`
   - Privacy Policy URL: `https://2sweety.com/privacy`
   - Terms of Service URL: `https://2sweety.com/terms`

6. **Switch to Live Mode:**
   - Toggle app from **Development** to **Live** mode
   - Requires: Privacy Policy, Terms, App Review (for certain permissions)

**Configuration:**
```bash
REACT_APP_FACEBOOK_APP_ID=123456789012345
```

**Pricing:** FREE

---

## 📊 Summary Table

| Service | Priority | Cost | Free Tier | Setup Time |
|---------|----------|------|-----------|------------|
| Firebase | 🔴 Critical | FREE | ✅ Yes (generous) | ✅ Already done |
| Backend Database | 🔴 Critical | FREE | ✅ Self-hosted | 5 min |
| Agora RTC | 🟡 High | FREE-$$ | ✅ 10k min/mo | 10 min |
| Google Maps | 🟡 High | FREE-$ | ✅ $200/mo credit | 15 min |
| OneSignal | 🟡 High | FREE | ✅ Unlimited | 10 min |
| Razorpay | 🟢 Medium | 2% fee | ✅ Test mode | 30 min (KYC) |
| Stripe | 🟢 Medium | 2.9% fee | ✅ Test mode | 15 min |
| PayPal | 🟢 Medium | 3.5% fee | ✅ Sandbox | 20 min |
| Google OAuth | 🔵 Low | FREE | ✅ Unlimited | 10 min |
| Facebook Login | 🔵 Low | FREE | ✅ Unlimited | 15 min |

---

## 🚀 Quick Start Order

**Week 1 - MVP Launch:**
1. ✅ Firebase (already configured)
2. ✅ Backend Database (during deployment)
3. 🔄 Agora RTC (essential for calls)
4. 🔄 Google Maps (essential for location)
5. 🔄 OneSignal (essential for engagement)

**Week 2 - Monetization:**
6. 🔄 Razorpay (test mode)
7. 🔄 Stripe (test mode)
8. 🔄 PayPal (test mode)

**Week 3 - Enhanced UX:**
9. 🔄 Google OAuth (optional)
10. 🔄 Facebook Login (optional)

**Week 4 - Go Live:**
- Switch all services to LIVE/Production mode
- Final testing
- Launch! 🎉

---

## ⚠️ Security Best Practices

### API Key Security Rules:

1. **PUBLIC vs SECRET:**
   - **PUBLIC** (safe in frontend): API Keys, Client IDs, App IDs
   - **SECRET** (backend only): Secret Keys, REST API Keys, Certificates

2. **Restrictions:**
   - ✅ ALWAYS restrict API keys by domain/IP
   - ✅ Use separate keys for development and production
   - ✅ Rotate keys every 3-6 months
   - ✅ Monitor usage for anomalies

3. **Storage:**
   - ✅ Frontend: Use environment variables (embedded at build time)
   - ✅ Backend: Use environment variables (never commit to Git)
   - ✅ Use password manager for credentials storage
   - ✅ Never commit .env files to Git

4. **Monitoring:**
   - ✅ Set up billing alerts on all paid services
   - ✅ Monitor API usage dashboards weekly
   - ✅ Enable anomaly detection where available
   - ✅ Review access logs regularly

---

## 📞 Support & Documentation

### Official Documentation:
- Firebase: https://firebase.google.com/docs
- Agora: https://docs.agora.io/
- Google Maps: https://developers.google.com/maps/documentation
- OneSignal: https://documentation.onesignal.com/
- Razorpay: https://razorpay.com/docs/
- Stripe: https://stripe.com/docs
- PayPal: https://developer.paypal.com/docs/

### Community Support:
- Stack Overflow (all platforms)
- Reddit: r/Firebase, r/webdev
- Discord: Coolify Discord, Firebase Discord

---

**Total Estimated Cost (First Month):**
- Development/Testing: $0 (all free tiers)
- Production (100 users): $0-$50/month
- Production (1,000 users): $50-$200/month
- Production (10,000+ users): $200-$1,000+/month

**Most costs are usage-based, so you only pay as you grow!** 📈

---

Need help? Refer back to COOLIFY_DEPLOYMENT_GUIDE.md for implementation details!
