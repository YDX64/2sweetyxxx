# 2Sweety - Security Hardening Guide

Comprehensive security guide for production deployment of 2Sweety dating application.

## Table of Contents

1. [Security Overview](#security-overview)
2. [Client-Side Security](#client-side-security)
3. [API Key Management](#api-key-management)
4. [Network Security](#network-security)
5. [Firebase Security](#firebase-security)
6. [Third-Party Services Security](#third-party-services-security)
7. [Container Security](#container-security)
8. [Compliance & Privacy](#compliance--privacy)
9. [Security Monitoring](#security-monitoring)
10. [Incident Response](#incident-response)

---

## Security Overview

### Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Infrastructure: SSL/TLS, Firewall, DDoS Protection      │
│ 2. Application: CSP, CORS, Security Headers                 │
│ 3. Authentication: Firebase Auth, Social Login              │
│ 4. Data: Encryption at Rest & Transit, Firestore Rules     │
│ 5. API: Rate Limiting, Input Validation, HTTPS Only        │
│ 6. Container: Non-root User, Minimal Image, Scanning       │
│ 7. Monitoring: Logging, Alerting, Audit Trails             │
└─────────────────────────────────────────────────────────────┘
```

### Threat Model

**Assets to Protect**:
- User personal information (names, photos, location)
- Chat messages and conversations
- Payment information
- Authentication credentials
- User preferences and matches

**Threat Actors**:
- Malicious users (spam, harassment)
- Automated bots
- Payment fraud
- Data scrapers
- XSS/CSRF attackers
- DDoS attackers

**Attack Vectors**:
- Cross-Site Scripting (XSS)
- Cross-Site Request Forgery (CSRF)
- Man-in-the-Middle (MITM)
- SQL Injection (backend)
- Authentication bypass
- Data exfiltration
- Payment fraud

---

## Client-Side Security

### 1. Content Security Policy (CSP)

Already configured in `nginx-default.conf`:

```nginx
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'unsafe-inline' 'unsafe-eval'
    https://www.gstatic.com
    https://cdn.onesignal.com
    https://checkout.razorpay.com
    https://js.stripe.com
    https://maps.googleapis.com;
  style-src 'self' 'unsafe-inline'
    https://fonts.googleapis.com;
  font-src 'self'
    https://fonts.gstatic.com data:;
  img-src 'self' data: https: blob:;
  connect-src 'self'
    https://gomeet.cscodetech.cloud
    https://*.googleapis.com
    wss://*.agora.io;
```

**Hardening CSP**:

1. **Remove 'unsafe-inline' and 'unsafe-eval'** (requires code refactoring):
   ```javascript
   // Instead of inline scripts:
   // <script>...</script>

   // Use external scripts with nonces or hashes
   // Generate nonce on server-side
   ```

2. **Implement CSP Reporting**:
   ```nginx
   # Add to nginx config
   add_header Content-Security-Policy-Report-Only "...;report-uri /csp-report";

   # Monitor violations before enforcing
   ```

3. **Progressive Tightening**:
   - Start with CSP in report-only mode
   - Monitor violations for 1-2 weeks
   - Fix violations (refactor inline scripts)
   - Enforce CSP

### 2. XSS Protection

**Current Measures**:
- React's built-in XSS protection (escapes by default)
- X-XSS-Protection header enabled
- Content-Type: nosniff

**Additional Hardening**:

1. **Sanitize User Input**:
   ```javascript
   import DOMPurify from 'dompurify';

   // Sanitize user-generated content
   const cleanHTML = DOMPurify.sanitize(userInput);

   // Use in React
   <div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
   ```

2. **Validate All Inputs**:
   ```javascript
   // Input validation example
   const validateMessage = (message) => {
     // Length check
     if (message.length > 1000) return false;

     // No script tags
     if (/<script>/i.test(message)) return false;

     // No dangerous patterns
     if (/javascript:/i.test(message)) return false;

     return true;
   };
   ```

3. **Secure innerHTML Usage**:
   ```javascript
   // BAD: Direct innerHTML
   element.innerHTML = userInput;

   // GOOD: Use textContent
   element.textContent = userInput;

   // Or sanitize first
   element.innerHTML = DOMPurify.sanitize(userInput);
   ```

### 3. CSRF Protection

**React SPA Considerations**:
- No traditional forms submitted to backend
- All API calls use JSON with tokens

**Implement CSRF Tokens** (if using cookies):

```javascript
// Get CSRF token from backend
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

// Include in all API requests
axios.defaults.headers.common['X-CSRF-Token'] = csrfToken;
```

**Alternative: SameSite Cookies**:
```javascript
// Backend sets cookies with SameSite=Strict
Set-Cookie: session=...; SameSite=Strict; Secure; HttpOnly
```

### 4. Clickjacking Protection

Already configured:
```nginx
X-Frame-Options: SAMEORIGIN
```

**For specific embeds**, use:
```nginx
# Allow specific domain
X-Frame-Options: ALLOW-FROM https://trusted-domain.com
```

### 5. Secure Authentication

**Firebase Auth Best Practices**:

1. **Enforce Strong Passwords**:
   ```javascript
   // Minimum password requirements
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

   if (!passwordRegex.test(password)) {
     throw new Error('Password must be at least 8 characters with uppercase, lowercase, number, and special character');
   }
   ```

2. **Enable MFA (Multi-Factor Authentication)**:
   ```javascript
   import { getAuth, multiFactor } from 'firebase/auth';

   // Enroll user in MFA
   const auth = getAuth();
   const user = auth.currentUser;
   const multiFactorUser = multiFactor(user);

   // Implement SMS or TOTP MFA
   ```

3. **Session Management**:
   ```javascript
   // Set session timeout
   const auth = getAuth();
   auth.setPersistence(browserSessionPersistence); // Session only

   // Or local persistence with refresh
   auth.setPersistence(browserLocalPersistence);
   ```

4. **Prevent Session Fixation**:
   ```javascript
   // Regenerate session after login
   await signInWithEmailAndPassword(auth, email, password);
   const newToken = await user.getIdToken(true); // Force refresh
   ```

### 6. Secure Local Storage

**Never Store Sensitive Data in LocalStorage**:

```javascript
// BAD: Storing sensitive data
localStorage.setItem('password', password);
localStorage.setItem('creditCard', cardNumber);

// GOOD: Store only non-sensitive data
localStorage.setItem('theme', 'dark');
localStorage.setItem('language', 'en');

// For tokens, use Firebase Auth (handles securely)
// Or use sessionStorage for temporary data
sessionStorage.setItem('tempData', data);
```

**Encrypt if Necessary**:
```javascript
import CryptoJS from 'crypto-js';

// Encrypt before storing
const encrypted = CryptoJS.AES.encrypt(data, secretKey).toString();
localStorage.setItem('data', encrypted);

// Decrypt when retrieving
const decrypted = CryptoJS.AES.decrypt(encrypted, secretKey).toString(CryptoJS.enc.Utf8);
```

---

## API Key Management

### 1. Public vs Private Keys

**CRITICAL UNDERSTANDING**:

**Public Keys** (Safe for client-side):
- ✅ Firebase API Key
- ✅ Agora App ID (with token auth)
- ✅ Google Maps API Key (with restrictions)
- ✅ Razorpay Key ID (not secret)
- ✅ PayPal Client ID
- ✅ Stripe Publishable Key
- ✅ OneSignal App ID

**Private Keys** (NEVER on client-side):
- ❌ Firebase Service Account Key
- ❌ Razorpay Key Secret
- ❌ PayPal Secret
- ❌ Stripe Secret Key
- ❌ Agora App Certificate (use for token generation)
- ❌ Database passwords
- ❌ JWT secrets

### 2. Restricting Public API Keys

**Firebase API Key**:
```
Firebase Console → Project Settings → General
→ Set application restrictions (Android, iOS, Web)
→ Add authorized domains: 2sweety.com, localhost
```

**Note**: Firebase API key is not secret. Security comes from Firestore rules and Auth.

**Google Maps API Key**:
```
Google Cloud Console → APIs & Services → Credentials
→ Edit API Key
→ Application restrictions: HTTP referrers
→ Add: https://2sweety.com/*, http://localhost:3000/*
→ API restrictions:
  - Maps JavaScript API
  - Geocoding API
  - Places API
```

**Agora App ID**:
```
Agora Console → Project Management → [Your Project]
→ Enable App Certificate
→ Implement token authentication on backend
→ Frontend requests token from backend before joining call
```

**OneSignal App ID**:
```
OneSignal Dashboard → Settings → Keys & IDs
→ Web Push Configuration
→ Allowed Origins: https://2sweety.com
```

### 3. API Key Rotation

**Regular Rotation Schedule**:
- **Firebase**: No need to rotate (restricted by rules)
- **Agora**: Rotate every 90 days
- **Google Maps**: Rotate every 6 months
- **Payment Gateways**: Rotate annually or on breach

**Rotation Process**:
1. Generate new API key in provider dashboard
2. Update key in both:
   - Coolify environment variables (Build Args)
   - GitHub Secrets (for CI/CD)
3. Deploy new version
4. Verify functionality with new key
5. Revoke old key after 24 hours (grace period)

### 4. Environment-Specific Keys

**Use Different Keys per Environment**:

```bash
# Development (.env.development)
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
REACT_APP_PAYPAL_MODE=sandbox

# Production (.env.production)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxx
REACT_APP_PAYPAL_MODE=production
```

**Never Commit .env Files**:
```bash
# .gitignore (already configured)
.env
.env.local
.env.development
.env.production
```

### 5. Detecting Exposed Secrets

**Automated Scanning**:

1. **TruffleHog** (already in GitHub Actions):
   ```bash
   # Scan repository for secrets
   docker run --rm -v $(pwd):/code trufflesecurity/trufflehog filesystem /code
   ```

2. **git-secrets**:
   ```bash
   # Install
   brew install git-secrets

   # Set up
   cd /path/to/repo
   git secrets --install
   git secrets --register-aws  # Add custom patterns

   # Scan commits
   git secrets --scan
   ```

3. **GitHub Secret Scanning**:
   - Enabled by default on public repos
   - Alerts on detected secrets
   - Partner patterns for major providers

**If Secret is Exposed**:
1. **Immediately revoke** the exposed key
2. Generate new key
3. Update deployment
4. Audit usage logs for unauthorized access
5. Notify security team/users if compromised

---

## Network Security

### 1. HTTPS Everywhere

**Enforce HTTPS**:
```nginx
# Already configured in nginx
# Force redirect HTTP → HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

**HSTS (HTTP Strict Transport Security)**:
```nginx
# Add to nginx config
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

**Preload HSTS**:
1. Submit domain to https://hstspreload.org/
2. Ensures browsers always use HTTPS

### 2. CORS Configuration

**Frontend (if proxying API)**:
```javascript
// axios config
axios.defaults.withCredentials = true;
axios.defaults.headers.common['Origin'] = 'https://2sweety.com';
```

**Backend** (must configure on backend API):
```javascript
// Express.js example
const cors = require('cors');

app.use(cors({
  origin: [
    'https://2sweety.com',
    'https://www.2sweety.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### 3. Rate Limiting

**Client-Side Rate Limiting**:
```javascript
// Implement debouncing for API calls
import { debounce } from 'lodash';

const searchUsers = debounce(async (query) => {
  const response = await axios.get(`/api/search?q=${query}`);
  return response.data;
}, 500); // 500ms debounce
```

**Cloudflare Rate Limiting** (if using):
```
Cloudflare Dashboard → Security → WAF
→ Rate Limiting Rules
→ Create rule:
  - URL: /api/*
  - Requests: 100 per 10 seconds
  - Action: Challenge or Block
```

**Backend Rate Limiting** (must implement on API):
```javascript
// Express.js example
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests from this IP'
});

app.use('/api/', limiter);
```

### 4. DDoS Protection

**Cloudflare Protection** (recommended):
1. Add site to Cloudflare
2. Enable:
   - DDoS Protection (automatic)
   - Under Attack Mode (if under attack)
   - Bot Fight Mode
   - Rate Limiting

**Server-Level Protection**:
```bash
# iptables rules (on Coolify server)
# Limit connections per IP
iptables -A INPUT -p tcp --dport 443 -m connlimit --connlimit-above 50 -j REJECT

# Limit new connections rate
iptables -A INPUT -p tcp --dport 443 -m state --state NEW -m recent --set
iptables -A INPUT -p tcp --dport 443 -m state --state NEW -m recent --update --seconds 60 --hitcount 20 -j DROP
```

### 5. Firewall Configuration

**Coolify Server Firewall**:
```bash
# Allow only necessary ports
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh (port 22)
ufw allow http (port 80)
ufw allow https (port 443)
ufw enable
```

**Application-Level Firewall**:
```nginx
# Block known bad user agents
if ($http_user_agent ~* (bot|crawler|spider)) {
  return 403;
}

# Block by referrer (prevent hotlinking)
valid_referers none blocked 2sweety.com *.2sweety.com;
if ($invalid_referer) {
  return 403;
}
```

---

## Firebase Security

### 1. Firestore Security Rules

**Production-Ready Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function isValidUser() {
      return isAuthenticated() &&
             request.auth.token.email_verified == true;
    }

    // User profiles
    match /users/{userId} {
      // Anyone can read (for matching)
      allow read: if isValidUser();

      // Only owner can write their profile
      allow write: if isOwner(userId) && isValidUser();

      // Validate data structure
      allow create: if isOwner(userId) &&
                       request.resource.data.keys().hasAll([
                         'name', 'age', 'gender', 'bio'
                       ]) &&
                       request.resource.data.age >= 18 &&
                       request.resource.data.age <= 100;
    }

    // User private data (email, phone, payment info)
    match /users/{userId}/private/{document=**} {
      allow read, write: if isOwner(userId) && isValidUser();
    }

    // Matches
    match /matches/{matchId} {
      allow read: if isValidUser() &&
                     request.auth.uid in resource.data.participants;

      allow create: if isValidUser() &&
                       request.auth.uid in request.resource.data.participants;

      allow update: if isValidUser() &&
                       request.auth.uid in resource.data.participants;

      allow delete: if false; // Matches can't be deleted
    }

    // Chat rooms
    match /chats/{chatId} {
      allow read: if isValidUser() &&
                     request.auth.uid in resource.data.participants;

      allow create: if isValidUser() &&
                       request.auth.uid in request.resource.data.participants;

      allow update: if isValidUser() &&
                       request.auth.uid in resource.data.participants;
    }

    // Chat messages
    match /chats/{chatId}/messages/{messageId} {
      // Read if participant in parent chat
      allow read: if isValidUser() &&
                     request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;

      // Create message if participant and valid data
      allow create: if isValidUser() &&
                       request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants &&
                       request.resource.data.senderId == request.auth.uid &&
                       request.resource.data.text.size() <= 1000; // Max 1000 chars

      // Can't update or delete messages
      allow update, delete: if false;
    }

    // Reports (abuse reports)
    match /reports/{reportId} {
      allow create: if isValidUser();
      allow read, update, delete: if false; // Admin only
    }

    // Blocks
    match /users/{userId}/blocks/{blockedUserId} {
      allow read, write: if isOwner(userId) && isValidUser();
    }

    // Admin collections (read-only for users)
    match /settings/{document=**} {
      allow read: if isValidUser();
      allow write: if false; // Admin only
    }

    // Default deny all other collections
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Test Security Rules**:
```javascript
// Firebase Console → Firestore → Rules → Rules Playground
// Test scenarios:
// - Unauthenticated user trying to read profiles
// - User trying to edit another user's profile
// - User sending message longer than 1000 chars
```

### 2. Firebase Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {

    // Profile images
    match /profiles/{userId}/{imageId} {
      // Anyone can read
      allow read: if true;

      // Only owner can upload
      allow write: if request.auth != null &&
                      request.auth.uid == userId &&
                      // Max 5MB image size
                      request.resource.size < 5 * 1024 * 1024 &&
                      // Only image files
                      request.resource.contentType.matches('image/.*');
    }

    // Chat media (images, videos)
    match /chats/{chatId}/{messageId}/{filename} {
      // Read if authenticated
      allow read: if request.auth != null;

      // Write if participant in chat
      allow write: if request.auth != null &&
                      request.resource.size < 10 * 1024 * 1024 && // 10MB max
                      request.resource.contentType.matches('image/.*|video/.*');
    }

    // Default deny
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

### 3. Firebase Authentication Security

**Enable Email Verification**:
```javascript
import { sendEmailVerification } from 'firebase/auth';

// After registration
const user = await createUserWithEmailAndPassword(auth, email, password);
await sendEmailVerification(user);

// Before allowing access
if (!user.emailVerified) {
  throw new Error('Please verify your email first');
}
```

**Password Policy**:
```
Firebase Console → Authentication → Settings
→ Password policy: Strict
→ Minimum length: 8
→ Require uppercase, lowercase, number, special character
```

**Authorized Domains**:
```
Firebase Console → Authentication → Settings → Authorized domains
→ Add: 2sweety.com
→ Remove: localhost (for production project)
```

**Rate Limiting**:
```
Firebase Console → Authentication → Settings
→ Email enumeration protection: Enabled
→ SMS fraud protection: Enabled
```

### 4. Firestore Audit Logging

**Enable Audit Logs**:
```
Google Cloud Console → Logging → Logs Explorer
→ Enable Data Access logs for Firestore
→ Configure:
  - Admin Read: Enabled
  - Data Read: Enabled (warning: high volume)
  - Data Write: Enabled
```

**Query Audit Logs**:
```
# Example: Find all deletes in last 24 hours
resource.type="cloud_firestore_database"
protoPayload.methodName=~"Delete"
timestamp>="2024-01-01T00:00:00Z"
```

---

## Third-Party Services Security

### 1. Agora (Video/Audio)

**Token-Based Authentication** (CRITICAL for production):

**Backend Implementation**:
```javascript
// Node.js example - BACKEND ONLY
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

function generateAgoraToken(channelName, uid, role) {
  const appId = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE; // SECRET!

  const expirationTimeInSeconds = 3600; // 1 hour
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  return RtcTokenBuilder.buildTokenWithUid(
    appId,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpiredTs
  );
}

// API endpoint
app.post('/api/agora/token', authenticate, (req, res) => {
  const { channelName, uid, role } = req.body;
  const token = generateAgoraToken(channelName, uid, role);
  res.json({ token });
});
```

**Frontend Usage**:
```javascript
// Request token from backend
const response = await axios.post('/api/agora/token', {
  channelName: 'chat-room-123',
  uid: currentUser.uid,
  role: 'publisher'
});

const { token } = response.data;

// Use token to join Agora channel
await client.join(AGORA_APP_ID, channelName, token, uid);
```

**Security Settings**:
```
Agora Console → Project Management → [Project]
→ Enable App Certificate (required for tokens)
→ Whitelist: IP addresses of your backend servers (optional)
```

### 2. Payment Gateways

**Razorpay**:
```javascript
// FRONTEND: Only use Key ID
const options = {
  key: process.env.REACT_APP_RAZORPAY_KEY_ID, // Public key
  amount: amount * 100, // Amount in paise
  currency: 'INR',
  name: '2Sweety',
  description: 'Premium Subscription',
  handler: function (response) {
    // Send payment_id to backend for verification
    verifyPayment(response.razorpay_payment_id);
  }
};

// BACKEND: Verify payment with Key Secret
const crypto = require('crypto');
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET // SECRET!
});

// Verify signature
const generatedSignature = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (generatedSignature === razorpaySignature) {
  // Payment verified
}
```

**Stripe**:
```javascript
// FRONTEND: Only Publishable Key
import { loadStripe } from '@stripe/stripe-js';

const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// BACKEND: Use Secret Key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 1000,
  currency: 'usd',
});
```

**Security Best Practices**:
1. **Never trust frontend amounts** - Always verify on backend
2. **Use webhooks** - Verify payment status via webhook, not frontend callback
3. **Implement idempotency** - Prevent duplicate charges
4. **Log all transactions** - Audit trail for disputes
5. **PCI compliance** - Never store card details (use tokenization)

### 3. OneSignal

**Secure Configuration**:
```
OneSignal Dashboard → Settings → All Browsers
→ Allowed Origins: https://2sweety.com
→ HTTPS Required: Yes
→ Service Worker scope: /

→ Settings → Keys & IDs
→ REST API Key: Keep secret (backend only)
```

**Backend-Only Operations**:
```javascript
// Sending notifications - BACKEND ONLY
const OneSignal = require('onesignal-node');

const client = new OneSignal.Client({
  userAuthKey: process.env.ONESIGNAL_USER_AUTH_KEY,
  app: {
    appAuthKey: process.env.ONESIGNAL_REST_API_KEY, // SECRET!
    appId: process.env.ONESIGNAL_APP_ID
  }
});

// Send notification
const notification = {
  contents: { en: 'You have a new match!' },
  include_player_ids: [userId]
};

await client.createNotification(notification);
```

---

## Container Security

### 1. Docker Image Security

**Scan Images for Vulnerabilities**:
```bash
# Using Trivy
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image 2sweety-web:latest

# Using Snyk
snyk container test 2sweety-web:latest
```

**Minimal Base Images**:
```dockerfile
# Already using alpine (minimal)
FROM node:18-alpine AS builder
FROM nginx:1.25-alpine
```

**Non-Root User** (already implemented):
```dockerfile
# Create non-root user
RUN addgroup -g 1001 -S nginx-app && \
    adduser -u 1001 -S nginx-app -G nginx-app

# Switch to non-root
USER nginx-app
```

### 2. Image Signing & Verification

**Docker Content Trust**:
```bash
# Enable content trust
export DOCKER_CONTENT_TRUST=1

# Sign images
docker trust sign 2sweety-web:latest

# Verify signatures before deployment
docker trust inspect 2sweety-web:latest
```

### 3. Runtime Security

**Read-Only Filesystem**:
```yaml
# docker-compose.yml or Coolify config
services:
  web:
    read_only: true
    tmpfs:
      - /tmp
      - /var/cache/nginx
      - /var/run
```

**Drop Capabilities**:
```yaml
security_opt:
  - no-new-privileges:true
cap_drop:
  - ALL
cap_add:
  - NET_BIND_SERVICE
```

### 4. Secrets Management

**Never Build Secrets into Images**:
```dockerfile
# BAD: Secrets in image
ARG SECRET_KEY=abc123
ENV SECRET_KEY=$SECRET_KEY

# GOOD: Secrets injected at runtime
# Via Coolify environment variables
```

**Use Docker Secrets** (if using Swarm):
```bash
echo "my_secret" | docker secret create razorpay_secret -
```

---

## Compliance & Privacy

### 1. GDPR Compliance

**User Data Rights**:
1. **Right to Access**: Provide data export functionality
2. **Right to Erasure**: Implement account deletion with data purge
3. **Right to Portability**: Export user data in JSON format
4. **Right to Rectification**: Allow users to edit their data

**Implementation**:
```javascript
// Data export
async function exportUserData(userId) {
  const userData = await db.collection('users').doc(userId).get();
  const messages = await db.collection('chats')
    .where('participants', 'array-contains', userId)
    .get();

  return {
    profile: userData.data(),
    messages: messages.docs.map(doc => doc.data()),
    exported_at: new Date().toISOString()
  };
}

// Data deletion
async function deleteUserData(userId) {
  // Delete profile
  await db.collection('users').doc(userId).delete();

  // Anonymize messages (don't delete - preserves chat for others)
  const userMessages = await db.collectionGroup('messages')
    .where('senderId', '==', userId)
    .get();

  for (const msg of userMessages.docs) {
    await msg.ref.update({
      senderId: 'deleted_user',
      senderName: 'Deleted User',
      deleted: true
    });
  }

  // Delete Storage files
  const bucket = admin.storage().bucket();
  await bucket.deleteFiles({
    prefix: `profiles/${userId}/`
  });
}
```

### 2. Data Encryption

**In Transit**:
- ✅ HTTPS/TLS 1.3 (enforced)
- ✅ WebSocket Secure (WSS) for Agora
- ✅ Firebase SDK uses HTTPS

**At Rest**:
- ✅ Firestore encrypts by default
- ✅ Firebase Storage encrypts by default
- ✅ Consider field-level encryption for sensitive data

**Field-Level Encryption** (optional):
```javascript
import CryptoJS from 'crypto-js';

// Encrypt before storing in Firestore
const encryptedData = CryptoJS.AES.encrypt(
  sensitiveData,
  process.env.ENCRYPTION_KEY
).toString();

await db.collection('users').doc(userId).set({
  encryptedField: encryptedData
});

// Decrypt when reading
const decrypted = CryptoJS.AES.decrypt(
  encryptedData,
  process.env.ENCRYPTION_KEY
).toString(CryptoJS.enc.Utf8);
```

### 3. Privacy Policy & Terms

**Required for Dating App**:
1. **Privacy Policy**: How data is collected, used, shared
2. **Terms of Service**: Rules, liability, dispute resolution
3. **Cookie Policy**: What cookies are used
4. **Age Verification**: Must be 18+ (required for dating)

**Implementation**:
```javascript
// Age verification on registration
if (age < 18) {
  throw new Error('You must be 18 or older to use this service');
}

// Accept terms on registration
const termsAccepted = await showTermsDialog();
if (!termsAccepted) {
  throw new Error('You must accept Terms of Service to continue');
}

// Log consent
await db.collection('user_consents').add({
  userId,
  termsVersion: '1.0',
  privacyVersion: '1.0',
  acceptedAt: new Date(),
  ipAddress: req.ip
});
```

### 4. Data Retention

**Policy**:
- Active users: Keep data indefinitely
- Deleted accounts: Purge data after 30 days
- Inactive users (>2 years): Notify before deletion
- Backups: Retain for 90 days

**Implementation**:
```javascript
// Cloud Function - runs daily
exports.deleteInactiveUsers = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);

    const inactiveUsers = await db.collection('users')
      .where('lastActiveAt', '<', twoYearsAgo)
      .where('deletionNotified', '==', false)
      .get();

    for (const user of inactiveUsers.docs) {
      // Send notification email
      await sendDeletionWarningEmail(user.data().email);

      // Mark as notified
      await user.ref.update({ deletionNotified: true });
    }
  });
```

---

## Security Monitoring

### 1. Logging

**Nginx Access Logs**:
```nginx
# Custom log format with security info
log_format security '$remote_addr - $remote_user [$time_local] '
                    '"$request" $status $body_bytes_sent '
                    '"$http_referer" "$http_user_agent" '
                    '$request_time $upstream_response_time '
                    '$ssl_protocol $ssl_cipher';

access_log /var/log/nginx/access.log security;
```

**Application Logging**:
```javascript
// Log security events
function logSecurityEvent(event, details) {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    event,
    details,
    userId: details.userId || 'anonymous',
    ip: details.ip,
    userAgent: details.userAgent
  }));
}

// Examples
logSecurityEvent('login_attempt', { userId, success: false, reason: 'invalid_password' });
logSecurityEvent('payment_initiated', { userId, amount, gateway: 'razorpay' });
logSecurityEvent('suspicious_activity', { userId, reason: 'multiple_failed_logins' });
```

### 2. Monitoring & Alerting

**Key Metrics to Monitor**:
- Failed login attempts (>5 in 5 min = alert)
- Payment failures (>10% failure rate = alert)
- API error rates (>5% = alert)
- Response times (>2s average = alert)
- Memory/CPU usage (>80% = alert)

**Implement Alerts**:

**Using Sentry**:
```javascript
import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: 'production',
  beforeSend(event, hint) {
    // Filter sensitive data
    if (event.request) {
      delete event.request.cookies;
      delete event.request.headers['Authorization'];
    }
    return event;
  }
});
```

**Using Custom Monitoring**:
```javascript
// Send alerts to Slack
async function sendSecurityAlert(message) {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: `🚨 Security Alert: ${message}` })
  });
}

// Trigger alerts
if (failedLoginAttempts > 5) {
  await sendSecurityAlert(`User ${userId} has 5+ failed login attempts`);
}
```

### 3. Intrusion Detection

**Detect Suspicious Patterns**:
```javascript
// Rate limiting per user
const userActionCounts = new Map();

function checkSuspiciousActivity(userId, action) {
  const key = `${userId}:${action}`;
  const count = userActionCounts.get(key) || 0;

  // Increment count
  userActionCounts.set(key, count + 1);

  // Check thresholds
  if (action === 'message' && count > 100) {
    // Spam detection
    blockUser(userId, 'spam');
    return false;
  }

  if (action === 'match' && count > 50) {
    // Bot detection
    flagForReview(userId, 'possible_bot');
    return false;
  }

  // Reset after 1 minute
  setTimeout(() => userActionCounts.delete(key), 60000);

  return true;
}
```

**Honeypot Fields**:
```javascript
// Add hidden field in forms
<input type="text" name="website" style={{display: 'none'}} />

// On submit
if (formData.website) {
  // Bot detected (humans can't see this field)
  logSecurityEvent('bot_detected', { form: 'registration' });
  return;
}
```

### 4. Security Audit Schedule

**Daily**:
- Review error logs
- Check failed login attempts
- Monitor payment transactions

**Weekly**:
- Review Firestore security rule violations
- Check API usage patterns
- Scan for vulnerabilities (npm audit)

**Monthly**:
- Full security audit
- Penetration testing (if budget allows)
- Review and update dependencies
- Rotate API keys

**Quarterly**:
- Third-party security assessment
- Compliance review (GDPR, etc.)
- Disaster recovery drill
- Security training for team

---

## Incident Response

### 1. Incident Response Plan

**Severity Levels**:

**P0 - Critical** (Data breach, complete outage):
- Response time: Immediate
- Notify: CEO, CTO, Security Team, Users
- Action: All hands on deck

**P1 - High** (Partial outage, security vulnerability):
- Response time: 1 hour
- Notify: CTO, Security Team
- Action: Dedicated response team

**P2 - Medium** (Degraded performance, minor bug):
- Response time: 4 hours
- Notify: On-call engineer
- Action: Fix in next deployment

**P3 - Low** (Minor issue, cosmetic bug):
- Response time: Next business day
- Notify: Engineering team
- Action: Add to backlog

### 2. Data Breach Response

**Immediate Actions** (within 1 hour):
1. **Contain**: Isolate affected systems
2. **Assess**: Determine scope of breach
3. **Preserve**: Save logs and evidence
4. **Notify**: Security team and management

**Short-term Actions** (within 24 hours):
1. **Investigate**: Root cause analysis
2. **Remediate**: Fix vulnerability
3. **Rotate**: All API keys and secrets
4. **Monitor**: Enhanced monitoring

**Long-term Actions** (within 72 hours):
1. **Notify**: Affected users (GDPR requirement)
2. **Report**: Regulatory authorities if required
3. **Review**: Security practices
4. **Improve**: Implement preventive measures

### 3. Contact Information

**Security Contacts**:
- **Security Team**: security@2sweety.com
- **On-call Engineer**: +1-XXX-XXX-XXXX
- **External Security Firm**: [If applicable]

**Regulatory Contacts**:
- **Data Protection Officer**: dpo@2sweety.com
- **Legal Counsel**: legal@2sweety.com

### 4. Post-Incident Review

**After every incident**, conduct review:
1. **Timeline**: What happened and when?
2. **Root Cause**: Why did it happen?
3. **Response**: What was done?
4. **Lessons**: What can we learn?
5. **Action Items**: What needs to be fixed?

**Document in**:
```
/docs/incidents/YYYY-MM-DD-incident-name.md
```

---

## Security Checklist

Use this checklist before production deployment:

**Infrastructure**:
- [ ] HTTPS enabled with valid SSL certificate
- [ ] HSTS header configured
- [ ] Firewall configured (only ports 80, 443 open)
- [ ] DDoS protection enabled (Cloudflare recommended)
- [ ] Server OS and packages updated

**Application**:
- [ ] CSP header configured and tested
- [ ] XSS protection enabled
- [ ] CSRF protection implemented
- [ ] Input validation on all forms
- [ ] Output encoding for user content
- [ ] Error messages don't leak sensitive info

**Authentication**:
- [ ] Firebase Auth configured
- [ ] Email verification required
- [ ] Strong password policy enforced
- [ ] Session timeout configured
- [ ] MFA available (recommended)

**Authorization**:
- [ ] Firestore security rules tested
- [ ] Storage security rules tested
- [ ] Role-based access control implemented
- [ ] Principle of least privilege applied

**API Security**:
- [ ] All API keys restricted by domain/IP
- [ ] Public vs private keys separated
- [ ] No secrets in client-side code
- [ ] No secrets committed to Git
- [ ] Payment processing secured
- [ ] Agora token auth implemented

**Data Protection**:
- [ ] Data encrypted in transit (HTTPS)
- [ ] Data encrypted at rest (Firebase)
- [ ] Personal data minimized
- [ ] Data retention policy implemented
- [ ] GDPR compliance reviewed

**Monitoring**:
- [ ] Application monitoring configured
- [ ] Error tracking configured (Sentry)
- [ ] Uptime monitoring configured
- [ ] Security alerts configured
- [ ] Log retention policy set

**Incident Response**:
- [ ] Incident response plan documented
- [ ] Security contacts defined
- [ ] Backup and recovery tested
- [ ] Rollback procedure tested

**Compliance**:
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Cookie policy published
- [ ] Age verification implemented (18+)
- [ ] User consent logged

---

## Conclusion

Security is an ongoing process, not a one-time task. Regularly review and update security measures, stay informed about new threats, and maintain a security-first culture.

**Key Takeaways**:
1. ✅ Never commit secrets to Git
2. ✅ Restrict all API keys to your domain
3. ✅ Implement Firestore security rules
4. ✅ Use HTTPS everywhere
5. ✅ Monitor and alert on suspicious activity
6. ✅ Have an incident response plan
7. ✅ Comply with GDPR and other regulations
8. ✅ Regular security audits and updates

**Stay secure! 🔒**
