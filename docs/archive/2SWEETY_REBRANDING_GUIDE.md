# 2Sweety Rebranding Guide

This document outlines all the changes needed to rebrand the GoMeet dating system to 2Sweety.

## Brand Identity

### Brand Name
- **Old**: GoMeet
- **New**: 2Sweety

### Domain & URLs
- **Production URL**: https://2sweety.app/
- **API Base URL**: (Keep your current API URL for now)

### Theme Colors

**Primary Color Scheme**:
```css
/* Main brand color */
--primary: #ec4899  /* pink-500 */

/* Gradient combinations */
from-pink-500 to-red-500
from-pink-500 via-red-500 to-orange-500
from-purple-500 to-pink-500

/* Background gradients */
/* Light mode */
from-pink-50 via-red-50 to-orange-50

/* Dark mode */
from-gray-900 via-gray-800 to-gray-900
```

**Color Palette**:
- Primary: Pink (#ec4899)
- Secondary: Red (#ef4444)
- Accent: Orange (#f97316)
- Success: Green (#10b981)
- Info: Blue (#3b82f6)
- Purple: #a855f7

### Logo
- Located in 2sweety source: `/lovable-uploads/17b4c7b9-b9dd-4221-9182-7bf5cf47e3b3.png`
- Copy to GoMeet Web: `GoMeet Web/public/logo.png`
- Mobile app: Copy to `assets/Image/logo.png`

### Design Elements
- Rounded corners: `rounded-full`, `rounded-2xl`, `rounded-3xl`
- Pink heart icons as accents
- Gradient buttons with hover effects
- Trust indicators (Shield, Star icons)
- Profile cards with slight rotation effect

## Files to Update

### Web Application (`GoMeet Web/`)

#### 1. Context/MyProvider.jsx
```javascript
// UPDATE APP NAME REFERENCES
// Change all "GoMeet" to "2Sweety"

// Keep your current API URLs (don't change these yet)
const basUrl = "https://gomeet.cscodetech.cloud/api/";
const imageBaseURL = "https://gomeet.cscodetech.cloud/";
```

#### 2. public/index.html
Create/update with:
```html
<title>2Sweety - Find Your Perfect Match | #1 Dating App</title>
<meta name="theme-color" content="#ec4899" />
<meta property="og:title" content="2Sweety - Find Your Perfect Match" />
<!-- Add favicon, apple-touch-icon -->
```

#### 3. Add Tailwind CSS Configuration
Create `tailwind.config.js`:
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ec4899', // pink-500
          50: '#fdf2f8',
          100: '#fce7f3',
          500: '#ec4899',
          600: '#db2777',
        },
      },
    },
  },
}
```

#### 4. Update CSS/Styling
- Replace green (#10b981) with pink (#ec4899)
- Replace blue (#3b82f6) with pink-red gradient
- Update primary buttons to pink-500/red-500 gradient

#### 5. Components to Update
- `LoginComponent/Login.jsx` - Update branding text
- `LoginComponent/Header.jsx` - Add logo, change colors
- `MobilComponent/Home.jsx` - Landing page redesign
- `LoginComponent/Pages.jsx` - Privacy policy & terms

#### 6. Logo Files
Copy logo to:
- `public/logo.png`
- `public/favicon.png` (create from logo)
- `public/apple-touch-icon.png`

### Mobile Application (`mobile-app/GoMeet Flutter code v1.5/`)

#### 1. pubspec.yaml
```yaml
name: twosweety  # Change from 'dating'
description: "2Sweety - Find Your Perfect Match"
```

#### 2. Android Configuration
**android/app/build.gradle**:
```gradle
applicationId "com.twosweety.app"  // Change from existing
```

**android/app/src/main/AndroidManifest.xml**:
```xml
<application
    android:label="2Sweety"
    ...>
```

**android/app/src/main/res/values/strings.xml**:
```xml
<string name="app_name">2Sweety</string>
```

#### 3. iOS Configuration
**ios/Runner/Info.plist**:
```xml
<key>CFBundleDisplayName</key>
<string>2Sweety</string>
<key>CFBundleName</key>
<string>2Sweety</string>
```

#### 4. Theme Colors
**lib/core/ui.dart** or wherever colors are defined:
```dart
const Color primaryColor = Color(0xFFEC4899);  // pink-500
const Color secondaryColor = Color(0xFFEF4444); // red-500
const Color accentColor = Color(0xFFF97316);   // orange-500

// Gradient
const LinearGradient primaryGradient = LinearGradient(
  colors: [Color(0xFFEC4899), Color(0xFFEF4444)],
  begin: Alignment.topLeft,
  end: Alignment.bottomRight,
);
```

#### 5. Assets
Update logo files in:
- `assets/Image/logo.png`
- `assets/icons/app_icon.png`
- Android launcher icons: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- iOS app icon: `ios/Runner/Assets.xcassets/AppIcon.appiconset/`

#### 6. Language Files
Update all files in `lang/` folder:
```json
{
  "appName": "2Sweety",
  "appDescription": "Find Your Perfect Match",
  // ... update other strings mentioning GoMeet
}
```

#### 7. Firebase Configuration
Update app names in:
- `android/app/google-services.json`
- `ios/firebase_app_id_file.json`
- Firebase Console project settings

### Legal Content (Both Platforms)

#### Privacy Policy
- Company name: 2Sweety
- Website: https://2sweety.app/
- Last updated: December 2024
- GDPR compliant
- Mentions 256-bit SSL encryption, secure storage
- Age requirement: 18+

#### Terms of Service
- Service name: 2Sweety
- Age requirement: 18+
- Zero tolerance policy for abuse
- Verified profiles
- Safe environment emphasis

## Step-by-Step Implementation

### Phase 1: Web Application (Priority)

1. **Branding & Names**
   - Update all "GoMeet" text to "2Sweety"
   - Change meta tags in index.html
   - Update provider context strings

2. **Visual Design**
   - Add logo files
   - Update CSS colors to pink theme
   - Add gradient backgrounds
   - Update button styles

3. **Landing & Login Pages**
   - Redesign homepage with 2Sweety layout
   - Update login page styling
   - Add hero section with profile cards

4. **Legal Pages**
   - Replace privacy policy content
   - Replace terms of service content
   - Update about us page

### Phase 2: Mobile Application

1. **App Configuration**
   - Change package name
   - Update app display name
   - Modify theme colors

2. **Assets**
   - Replace logo files
   - Update app icons
   - Update splash screen

3. **Translations**
   - Update all language files
   - Change app name references
   - Update branding strings

4. **Firebase**
   - Update Firebase project settings
   - Reconfigure authentication
   - Update push notification settings

### Phase 3: Backend & API (Future)

1. **Database**
   - Update company/brand references in database
   - Update email templates with 2Sweety branding

2. **API**
   - Update response messages
   - Update notification texts
   - Update email subject lines

3. **Domain & Deployment**
   - Configure 2sweety.app domain
   - Update API CORS settings
   - Update OAuth redirect URLs

## Testing Checklist

### Web Application
- [ ] Logo appears correctly
- [ ] All "GoMeet" references changed to "2Sweety"
- [ ] Colors match 2Sweety theme
- [ ] Landing page matches design
- [ ] Login page styled correctly
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Favicon displays correctly
- [ ] Meta tags correct

### Mobile Application
- [ ] App name shows "2Sweety"
- [ ] App icon updated
- [ ] Splash screen updated
- [ ] Theme colors are pink/red
- [ ] All screens use new branding
- [ ] Language files updated
- [ ] Push notifications work
- [ ] Deep links configured

## Important Notes

1. **API URLs**: Keep your current API URLs until backend is ready
2. **Firebase**: Will need to reconfigure when changing package names
3. **Payment Gateways**: May need to reconfigure with new domain
4. **OAuth**: Callback URLs will need updating with 2sweety.app domain
5. **App Store**: Will need new app listings for renamed mobile apps

## Resources Needed

- 2Sweety logo (PNG, SVG formats)
- App icons (various sizes for iOS/Android)
- Favicon
- Social media images (og-image.png, twitter-image.png)
- Domain configuration access
- Firebase console access
- Payment gateway dashboard access

## Support Files

All reference files are in:
- `/Users/max/Downloads/2sweet/soulmate-unlimited-hub-main/`
- Privacy Policy: `client/src/pages/PrivacyPolicy.tsx`
- Terms of Service: `client/src/pages/TermsOfService.tsx`
- Landing Page: `client/src/components/LandingPage.tsx`
- Color config: `tailwind.config.ts`
- Meta tags: `client/index.html`
