# 🔐 Social Login Setup Guide - 2Sweety
**Complete Guide for Google, Facebook, and Apple OAuth Integration**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Database Setup](#database-setup)
3. [Google OAuth Setup](#google-oauth-setup)
4. [Facebook Login Setup](#facebook-login-setup)
5. [Apple Sign In Setup](#apple-sign-in-setup)
6. [Backend Configuration](#backend-configuration)
7. [Web Frontend Configuration](#web-frontend-configuration)
8. [Flutter App Configuration](#flutter-app-configuration)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

### What's Implemented:

✅ **Web (React):**
- Google OAuth with custom styled buttons
- Facebook Login with Graph API
- Apple Sign In
- One Tap login support
- Auto profile picture import
- Email verification from providers

✅ **Backend (PHP):**
- `social_login_v2.php` - Social login endpoint
- `social_register.php` - Social registration endpoint
- Database schema with social auth columns
- Multi-provider support (Google, Facebook, Apple)

🔄 **Mobile (Flutter):** Ready for integration

### Architecture:

```
User clicks social button
    ↓
OAuth Provider (Google/Facebook/Apple)
    ↓
Frontend receives token/credentials
    ↓
Backend validates and creates/logs in user
    ↓
User redirected to app
```

---

## 💾 Database Setup

### Step 1: Run Migration

Navigate to your database and run:

```bash
cd "2Sweety Admin"
mysql -u your_username -p your_database < database/migrations/001_add_social_login_support.sql
```

Or manually execute the SQL:

```sql
-- Add social authentication columns
ALTER TABLE tbl_user 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'email' AFTER password,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL AFTER auth_type,
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) NULL AFTER google_id,
ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) NULL AFTER facebook_id,
ADD COLUMN IF NOT EXISTS social_profile_pic TEXT NULL AFTER apple_id,
ADD COLUMN IF NOT EXISTS email_verified TINYINT(1) DEFAULT 0 AFTER email;

-- Add indexes
ALTER TABLE tbl_user
ADD INDEX IF NOT EXISTS idx_auth_type (auth_type),
ADD INDEX IF NOT EXISTS idx_google_id (google_id),
ADD INDEX IF NOT EXISTS idx_facebook_id (facebook_id),
ADD INDEX IF NOT EXISTS idx_apple_id (apple_id);

-- Add unique constraints
ALTER TABLE tbl_user
ADD CONSTRAINT unique_google_id UNIQUE (google_id),
ADD CONSTRAINT unique_facebook_id UNIQUE (facebook_id),
ADD CONSTRAINT unique_apple_id UNIQUE (apple_id);

-- Update existing users
UPDATE tbl_user SET auth_type = 'email' WHERE auth_type IS NULL OR auth_type = '';
```

### Step 2: Verify Tables

```sql
-- Check if columns were added
DESCRIBE tbl_user;

-- Should see: auth_type, google_id, facebook_id, apple_id, social_profile_pic, email_verified
```

---

## 🔴 Google OAuth Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Project name: `2Sweety` (or your choice)

### Step 2: Enable APIs

1. Go to **APIs & Services** → **Library**
2. Search and enable:
   - Google+ API
   - People API (optional, for profile data)

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client ID**
3. Configure consent screen first (if prompted):
   - User Type: **External**
   - App name: `2Sweety`
   - User support email: `support@2sweety.app`
   - Developer email: `developer@2sweety.app`
   - Authorized domains: `2sweety.app`
   - Scopes: Default (email, profile, openid)

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `2Sweety Web`
   
5. **Authorized JavaScript origins:**
   ```
   https://2sweety.app
   https://www.2sweety.app
   http://localhost:3000
   ```

6. **Authorized redirect URIs:**
   ```
   https://2sweety.app
   https://www.2sweety.app
   http://localhost:3000
   ```

7. **Copy the Client ID** - You'll need this!

### Step 4: Add to Environment Variables

```bash
# .env.production
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com
```

### For Mobile Apps:

**Android:**
1. Create Android OAuth Client ID
2. Add SHA-1 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```
3. Package name: `com.2sweety.app`

**iOS:**
1. Create iOS OAuth Client ID
2. Bundle ID: `com.2sweety.app`
3. Download `GoogleService-Info.plist`

---

## 🔵 Facebook Login Setup

### Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. App Type: **Consumer**
4. App Name: `2Sweety`
5. App Contact Email: `support@2sweety.app`

### Step 2: Add Facebook Login Product

1. Dashboard → **Add Product**
2. Select **Facebook Login** → **Set Up**
3. Platform: **Website**
4. Site URL: `https://2sweety.app`

### Step 3: Configure Settings

1. Go to **Facebook Login** → **Settings**

2. **Valid OAuth Redirect URIs:**
   ```
   https://2sweety.app
   https://www.2sweety.app
   http://localhost:3000
   ```

3. **Allowed Domains for the JavaScript SDK:**
   ```
   2sweety.app
   localhost
   ```

4. Go to **Settings** → **Basic**
   - Copy **App ID**
   - Copy **App Secret** (for backend)
   - Add **App Domains:** `2sweety.app`
   - **Privacy Policy URL:** `https://2sweety.app/privacy`
   - **Terms of Service URL:** `https://2sweety.app/terms`

### Step 4: Add to Environment Variables

```bash
# .env.production
REACT_APP_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID
```

### Step 5: App Review (For Production)

Before going live with 100+ users:
1. Submit app for review
2. Provide test credentials
3. Explain use case
4. Wait for approval (usually 1-3 days)

---

## 🍎 Apple Sign In Setup

### Step 1: Apple Developer Account

**Required:** Apple Developer Program membership ($99/year)

1. Go to [Apple Developer](https://developer.apple.com/account/)
2. Sign in with your Apple ID

### Step 2: Create App ID

1. **Certificates, Identifiers & Profiles** → **Identifiers**
2. Click **+** → **App IDs**
3. Description: `2Sweety`
4. Bundle ID: `com.2sweety.app`
5. Enable **Sign In with Apple**
6. Save

### Step 3: Create Service ID (for Web)

1. **Identifiers** → **+** → **Services IDs**
2. Description: `2Sweety Web`
3. Identifier: `com.2sweety.web`
4. Enable **Sign In with Apple**
5. Click **Configure**:
   - **Domains:** `2sweety.app`
   - **Return URLs:** `https://2sweety.app`
6. Save

### Step 4: Create Key

1. **Keys** → **+**
2. Key Name: `2Sweety Sign In Key`
3. Enable **Sign In with Apple**
4. Click **Configure** → Select your App ID
5. **Download the key** (you can only download once!)
6. Note the **Key ID**

### Step 5: Get Team ID

1. Go to **Membership**
2. Copy your **Team ID**

### Step 6: Add to Environment Variables

```bash
# .env.production
REACT_APP_APPLE_CLIENT_ID=com.2sweety.web
```

**For Backend (if needed):**
```bash
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----...
```

---

## ⚙️ Backend Configuration

### Step 1: Upload API Files

Upload these files to your backend:

```
2Sweety Admin/
├── api/
│   ├── social_login_v2.php
│   └── social_register.php
└── database/
    └── migrations/
        └── 001_add_social_login_support.sql
```

### Step 2: Test Endpoints

**Test Social Login:**
```bash
curl -X POST https://api.2sweety.app/social_login_v2.php \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@gmail.com",
    "auth_type": "google",
    "social_id": "1234567890",
    "name": "Test User",
    "profile_pic": "https://example.com/pic.jpg"
  }'
```

**Expected Response:**
```json
{
  "Result": "true",
  "ResponseCode": "200",
  "ResponseMsg": "Login successfully!",
  "UserLogin": {
    "id": "123",
    "name": "Test User",
    "email": "test@gmail.com",
    ...
  }
}
```

### Step 3: Admin Panel Settings (Optional)

Add social login settings to admin panel:

```php
// setting.php - Add these fields
<input type="text" name="google_client_id" value="<?php echo $set['google_client_id'];?>" />
<input type="text" name="facebook_app_id" value="<?php echo $set['facebook_app_id'];?>" />
<input type="text" name="apple_client_id" value="<?php echo $set['apple_client_id'];?>" />
```

---

## 🌐 Web Frontend Configuration

### Step 1: Environment Variables

Create `.env.production`:

```bash
# API
REACT_APP_API_BASE_URL=https://api.2sweety.app/

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID.apps.googleusercontent.com

# Facebook Login
REACT_APP_FACEBOOK_APP_ID=YOUR_FACEBOOK_APP_ID

# Apple Sign In
REACT_APP_APPLE_CLIENT_ID=com.2sweety.web
```

### Step 2: Build and Deploy

```bash
npm run build
```

Deploy the `build/` folder to your hosting.

### Step 3: Verify on Production

1. Open `https://2sweety.app/login`
2. Click "Continue with Google"
3. Should see Google login popup
4. After login, should redirect to home

---

## 📱 Flutter App Configuration

### Step 1: Add Dependencies

```yaml
# pubspec.yaml
dependencies:
  google_sign_in: ^6.1.0
  flutter_facebook_auth: ^6.0.0
  sign_in_with_apple: ^5.0.0
```

### Step 2: Android Configuration

**android/app/build.gradle:**
```gradle
defaultConfig {
    applicationId "com.2sweety.app"
    ...
}
```

**android/app/src/main/AndroidManifest.xml:**
```xml
<meta-data
    android:name="com.google.android.gms.version"
    android:value="@integer/google_play_services_version" />
```

Add `google-services.json` to `android/app/`

### Step 3: iOS Configuration

**ios/Runner/Info.plist:**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>com.googleusercontent.apps.YOUR_CLIENT_ID</string>
        </array>
    </dict>
</array>

<key>GIDClientID</key>
<string>YOUR_CLIENT_ID.apps.googleusercontent.com</string>
```

Add `GoogleService-Info.plist` to `ios/Runner/`

### Step 4: Implement Social Login

```dart
import 'package:google_sign_in/google_sign_in.dart';

final GoogleSignIn _googleSignIn = GoogleSignIn(
  scopes: ['email', 'profile'],
);

Future<void> signInWithGoogle() async {
  try {
    final GoogleSignInAccount? account = await _googleSignIn.signIn();
    if (account != null) {
      // Send to backend
      final response = await http.post(
        Uri.parse('https://api.2sweety.app/social_login_v2.php'),
        body: json.encode({
          'email': account.email,
          'name': account.displayName,
          'profile_pic': account.photoUrl,
          'social_id': account.id,
          'auth_type': 'google',
        }),
      );
      // Handle response
    }
  } catch (error) {
    print('Google Sign In Error: $error');
  }
}
```

---

## 🧪 Testing

### Test Checklist:

**Google Login:**
- [ ] Button appears correctly
- [ ] Click opens Google popup
- [ ] Can select account
- [ ] Redirects to home after login
- [ ] Profile picture imported
- [ ] Email verified automatically
- [ ] One Tap works on return visits

**Facebook Login:**
- [ ] Button appears correctly
- [ ] Click opens Facebook popup
- [ ] Can authorize app
- [ ] Redirects to home after login
- [ ] Profile picture imported

**Apple Sign In:**
- [ ] Button appears correctly
- [ ] Click opens Apple popup
- [ ] Can sign in with Apple ID
- [ ] Redirects to home after login

**Edge Cases:**
- [ ] User tries to login with Google but registered with email
- [ ] User tries to register with email already used by Google
- [ ] Network error handling
- [ ] Popup blocked handling

---

## 🔧 Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Check Authorized redirect URIs in Google Console
- Must match exactly (including http/https)

**Error: "idpiframe_initialization_failed"**
- Client ID is incorrect
- Check `.env` file

**One Tap not working:**
- Third-party cookies blocked
- Try incognito mode
- Check browser console for errors

### Facebook Login Issues

**Error: "App Not Setup"**
- App ID is incorrect
- Check `.env` file

**Error: "URL Blocked"**
- Add domain to App Domains in Facebook settings
- Add redirect URI to Valid OAuth Redirect URIs

### Apple Sign In Issues

**Error: "invalid_client"**
- Service ID is incorrect
- Check domains and return URLs configuration

**Not showing on non-Apple devices:**
- This is expected - Apple Sign In only works on Apple devices/browsers

---

## 📞 Support

For issues:
1. Check browser console for errors
2. Check network tab for API responses
3. Verify all credentials are correct
4. Test in incognito mode
5. Check backend logs

---

## 🎉 Success!

If everything is set up correctly:
- Users can login with Google, Facebook, or Apple
- Profile pictures are automatically imported
- Email is verified from providers
- Seamless experience across web and mobile

**Next Steps:**
- Monitor user adoption
- Add analytics
- Optimize conversion rates
- Consider adding more providers (Twitter, LinkedIn, etc.)

---

**Last Updated:** November 20, 2024  
**Version:** 1.0.0  
**Author:** 2Sweety Development Team
