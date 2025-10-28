# Social Login Integration Guide - 2Sweety Dating App

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Google OAuth Integration](#google-oauth-integration)
4. [Apple Sign In Integration](#apple-sign-in-integration)
5. [Facebook Login Integration](#facebook-login-integration)
6. [Backend API Integration](#backend-api-integration)
7. [Security Best Practices](#security-best-practices)
8. [Testing](#testing)
9. [Troubleshooting](#troubleshooting)
10. [Environment Variables](#environment-variables)

---

## Overview

### Purpose
This document provides comprehensive guidance for integrating social login functionality (Google, Apple, Facebook) into the 2Sweety dating app across all platforms (Web, iOS, Android).

### Benefits for Users
- **Simplified Registration**: One-click signup without password management
- **Faster Onboarding**: Pre-filled profile data from social accounts
- **Enhanced Security**: OAuth 2.0 industry-standard authentication
- **Cross-Platform Continuity**: Seamless experience across devices
- **Reduced Password Fatigue**: No need to remember additional passwords

### Supported Platforms
- **Web Application**: React-based web app with responsive design
- **iOS**: Native iOS integration via React Native
- **Android**: Native Android integration via React Native

### Technology Stack
- React 18.2.0 (Current project version)
- OAuth 2.0 Protocol
- Firebase Authentication (Already integrated in project)
- Platform-specific SDKs

---

## Prerequisites

### Required Packages

Install the following packages for social authentication:

```bash
# Google OAuth
npm install @react-oauth/google

# Apple Sign In (Web)
npm install react-apple-signin-auth

# Apple Sign In (React Native)
npm install @invertase/react-native-apple-authentication

# Facebook Login (Web)
npm install react-facebook-login

# Facebook Login (React Native)
npm install react-native-fbsdk-next

# Google Auth Library for backend token verification
npm install google-auth-library

# Additional utilities
npm install jwt-decode
```

### Developer Account Requirements

#### Google Cloud Console
1. Create or access existing Google Cloud Project
2. Enable Google+ API and OAuth 2.0
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials

#### Apple Developer Account
1. Active Apple Developer Program membership ($99/year)
2. App ID with Sign in with Apple capability
3. Service ID for web authentication
4. Private key for backend token verification

#### Facebook Developer Account
1. Create Facebook App at developers.facebook.com
2. Configure Facebook Login product
3. Set up platform-specific settings
4. Complete App Review for public access

### OAuth 2.0 Understanding

#### Key Concepts
- **Authorization Code Flow**: Most secure flow for web and mobile apps
- **PKCE (Proof Key for Code Exchange)**: Enhanced security for mobile apps
- **Access Token**: Short-lived token for API access
- **Refresh Token**: Long-lived token to obtain new access tokens
- **ID Token**: JWT containing user identity information
- **Scopes**: Permissions requested from user

#### Security Principles
- Never expose client secrets in frontend code
- Always validate tokens on the backend
- Implement CSRF protection using state parameter
- Use HTTPS for all authentication endpoints
- Store tokens securely (never in localStorage for sensitive data)

---

## Google OAuth Integration

### Step 1: Google Cloud Console Setup

#### Create Project
1. Navigate to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a project" → "New Project"
3. Enter project name: "2Sweety Dating App"
4. Click "Create"

#### Configure OAuth Consent Screen
1. Go to "APIs & Services" → "OAuth consent screen"
2. Select "External" user type
3. Fill in required information:
   - App name: "2Sweety"
   - User support email: your-email@example.com
   - Developer contact: your-email@example.com
4. Add scopes:
   - `email`
   - `profile`
   - `openid`
5. Add test users during development
6. Save and continue

#### Create OAuth 2.0 Credentials

**For Web Application:**
1. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Name: "2Sweety Web Client"
4. Authorized JavaScript origins:
   ```
   http://localhost:3000
   https://yourdomain.com
   ```
5. Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://yourdomain.com/auth/callback
   ```
6. Save and copy Client ID

**For iOS:**
1. Create new OAuth client ID
2. Application type: "iOS"
3. Name: "2Sweety iOS Client"
4. Bundle ID: com.2sweety.dating (your actual bundle ID)
5. Save and copy Client ID

**For Android:**
1. Create new OAuth client ID
2. Application type: "Android"
3. Name: "2Sweety Android Client"
4. Package name: com.2sweety.dating
5. Get SHA-1 fingerprint:
   ```bash
   keytool -keystore path/to/keystore -list -v
   ```
6. Enter SHA-1 fingerprint
7. Save and copy Client ID

### Step 2: Environment Variables

Add to your `.env.local` file:

```bash
# Google OAuth - Web
REACT_APP_GOOGLE_CLIENT_ID=your_web_client_id.apps.googleusercontent.com

# Google OAuth - iOS (for React Native config)
GOOGLE_CLIENT_ID_IOS=your_ios_client_id.apps.googleusercontent.com

# Google OAuth - Android (for React Native config)
GOOGLE_CLIENT_ID_ANDROID=your_android_client_id.apps.googleusercontent.com

# Backend verification
GOOGLE_CLIENT_SECRET=your_client_secret
```

### Step 3: Web Implementation

#### App-Level Setup

Update `src/App.js` to include Google OAuth Provider:

```javascript
import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Router>
        {/* Your existing routes */}
      </Router>
    </GoogleOAuthProvider>
  );
};

export default App;
```

#### Create Google Login Component

Create `src/components/GoogleLoginButton.jsx`:

```javascript
import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { toast } from 'react-toastify';

const GoogleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    try {
      // Decode the JWT token to get user info
      const decoded = jwtDecode(credentialResponse.credential);

      console.log('Google User Info:', decoded);

      // Send to backend for verification and user creation
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/google`,
        {
          token: credentialResponse.credential,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture,
          sub: decoded.sub, // Google unique user ID
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store authentication token
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('UserId', response.data.userId);
      localStorage.setItem('authProvider', 'google');

      toast.success('Successfully logged in with Google!');

      // Check if user needs to complete profile
      if (response.data.isNewUser) {
        navigate('/birthdate'); // Start onboarding flow
      } else {
        navigate('/dashboard'); // Go to main app
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to login with Google. Please try again.');
    }
  };

  const handleError = () => {
    console.error('Google Login Failed');
    toast.error('Google login failed. Please try again.');
  };

  return (
    <div className="google-login-container">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap
        theme="outline"
        size="large"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
};

export default GoogleLoginButton;
```

#### Custom Button with useGoogleLogin Hook

If you want a custom-styled button:

```javascript
import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FcGoogle } from 'react-icons/fc';

const CustomGoogleButton = () => {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        // Get user info from Google
        const userInfo = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );

        console.log('User Info:', userInfo.data);

        // Send to backend
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/google`,
          {
            accessToken: tokenResponse.access_token,
            email: userInfo.data.email,
            name: userInfo.data.name,
            picture: userInfo.data.picture,
            sub: userInfo.data.sub,
          }
        );

        // Handle authentication
        localStorage.setItem('token', response.data.token);
        toast.success('Successfully logged in with Google!');
      } catch (error) {
        console.error('Error:', error);
        toast.error('Login failed. Please try again.');
      }
    },
    onError: (error) => {
      console.error('Login Failed:', error);
      toast.error('Google login failed.');
    },
  });

  return (
    <button
      onClick={() => login()}
      className="flex items-center justify-center w-full px-4 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <FcGoogle className="w-5 h-5 mr-2" />
      <span className="font-medium">Continue with Google</span>
    </button>
  );
};

export default CustomGoogleButton;
```

### Step 4: React Native Implementation

#### Install Dependencies

```bash
# For React Native
npm install @react-native-google-signin/google-signin
```

#### iOS Setup

1. Install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

2. Update `ios/YourApp/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleTypeRole</key>
       <string>Editor</string>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>com.googleusercontent.apps.YOUR-CLIENT-ID</string>
       </array>
     </dict>
   </array>
   ```

#### Android Setup

1. Update `android/app/build.gradle`:
   ```gradle
   dependencies {
     implementation 'com.google.android.gms:play-services-auth:20.7.0'
   }
   ```

2. Update `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
     android:name="com.google.android.gms.version"
     android:value="@integer/google_play_services_version" />
   ```

#### React Native Component

```javascript
import React, { useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import axios from 'axios';

const GoogleLoginButton = () => {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // From Google Console
      iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // Optional
      offlineAccess: true,
      scopes: ['profile', 'email'],
    });
  }, []);

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      console.log('User Info:', userInfo);

      // Get tokens
      const tokens = await GoogleSignin.getTokens();

      // Send to backend
      const response = await axios.post(
        'YOUR_API_URL/auth/google',
        {
          idToken: tokens.idToken,
          accessToken: tokens.accessToken,
          user: userInfo.user,
        }
      );

      // Handle successful authentication
      console.log('Backend response:', response.data);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is in progress');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services not available');
      } else {
        console.error('Error:', error);
      }
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={signIn}>
      <Text style={styles.buttonText}>Sign in with Google</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default GoogleLoginButton;
```

### Step 5: Error Handling

```javascript
const handleGoogleError = (error) => {
  const errorMessages = {
    popup_closed_by_user: 'Login popup was closed. Please try again.',
    access_denied: 'Access denied. Please grant necessary permissions.',
    immediate_failed: 'No saved credentials found. Please login manually.',
    network_error: 'Network error. Please check your connection.',
  };

  const message = errorMessages[error.error] || 'An unexpected error occurred.';
  toast.error(message);

  // Log to error tracking service
  console.error('Google OAuth Error:', {
    error: error.error,
    details: error.details,
    timestamp: new Date().toISOString(),
  });
};
```

---

## Apple Sign In Integration

### Step 1: Apple Developer Account Setup

#### Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers" → "+" button
4. Select "App IDs" → "Continue"
5. Select "App" → "Continue"
6. Fill in details:
   - Description: "2Sweety Dating App"
   - Bundle ID: com.2sweety.dating
7. Enable "Sign In with Apple" capability
8. Click "Continue" → "Register"

#### Create Service ID (for Web)
1. Click "Identifiers" → "+" button
2. Select "Services IDs" → "Continue"
3. Fill in details:
   - Description: "2Sweety Web Login"
   - Identifier: com.2sweety.dating.web
4. Enable "Sign In with Apple"
5. Click "Configure" next to Sign In with Apple
6. Select Primary App ID: com.2sweety.dating
7. Add web domains:
   - Domains: yourdomain.com
   - Return URLs: https://yourdomain.com/auth/apple/callback
8. Save and Continue

#### Create Private Key
1. Navigate to "Keys" → "+" button
2. Key Name: "2Sweety Apple Auth Key"
3. Enable "Sign In with Apple"
4. Click "Configure" → Select Primary App ID
5. Save and Download the key (.p8 file)
6. Note the Key ID (10-character string)

### Step 2: Environment Variables

```bash
# Apple Sign In - Web
REACT_APP_APPLE_CLIENT_ID=com.2sweety.dating.web
REACT_APP_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback

# Backend
APPLE_TEAM_ID=YOUR_TEAM_ID
APPLE_KEY_ID=YOUR_KEY_ID
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----
```

### Step 3: Web Implementation

#### Install Package

```bash
npm install react-apple-signin-auth
```

#### Create Apple Login Component

Create `src/components/AppleLoginButton.jsx`:

```javascript
import React from 'react';
import AppleSignin from 'react-apple-signin-auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaApple } from 'react-icons/fa';

const AppleLoginButton = () => {
  const navigate = useNavigate();

  const handleSuccess = async (response) => {
    try {
      console.log('Apple Response:', response);

      // Send to backend for verification
      const backendResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/auth/apple`,
        {
          code: response.authorization.code,
          id_token: response.authorization.id_token,
          user: response.user, // Only available on first login
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store authentication
      localStorage.setItem('token', backendResponse.data.token);
      localStorage.setItem('UserId', backendResponse.data.userId);
      localStorage.setItem('authProvider', 'apple');

      toast.success('Successfully logged in with Apple!');

      if (backendResponse.data.isNewUser) {
        navigate('/birthdate');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Apple login error:', error);
      toast.error('Failed to login with Apple. Please try again.');
    }
  };

  const handleError = (error) => {
    console.error('Apple Sign-In Error:', error);
    if (error.error !== 'popup_closed_by_user') {
      toast.error('Apple login failed. Please try again.');
    }
  };

  return (
    <div className="apple-login-container">
      <AppleSignin
        authOptions={{
          clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
          scope: 'email name',
          redirectURI: process.env.REACT_APP_APPLE_REDIRECT_URI,
          state: 'state',
          nonce: 'nonce',
          usePopup: true,
        }}
        uiType="dark"
        className="apple-auth-btn"
        onSuccess={handleSuccess}
        onError={handleError}
        skipScript={false}
        render={(props) => (
          <button
            {...props}
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-black border border-black rounded-lg hover:bg-gray-900 transition-colors"
          >
            <FaApple className="w-5 h-5 mr-2" />
            <span className="font-medium">Continue with Apple</span>
          </button>
        )}
      />
    </div>
  );
};

export default AppleLoginButton;
```

### Step 4: iOS Native Implementation (React Native)

#### Install Package

```bash
npm install @invertase/react-native-apple-authentication
cd ios && pod install && cd ..
```

#### Configure Xcode

1. Open `ios/YourApp.xcworkspace` in Xcode
2. Select your project in Project Navigator
3. Select your target
4. Go to "Signing & Capabilities"
5. Click "+ Capability"
6. Add "Sign In with Apple"

#### iOS Component

Create `src/components/AppleLoginButton.native.jsx`:

```javascript
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { appleAuth } from '@invertase/react-native-apple-authentication';
import axios from 'axios';
import { useNavigation } from '@react-navigation/native';

const AppleLoginButton = () => {
  const navigation = useNavigation();

  const onAppleButtonPress = async () => {
    try {
      // Start the sign-in request
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

      console.log('Apple Auth Response:', appleAuthRequestResponse);

      // Get credential state
      const credentialState = await appleAuth.getCredentialStateForUser(
        appleAuthRequestResponse.user
      );

      // Verify user is authenticated
      if (credentialState === appleAuth.State.AUTHORIZED) {
        // Send to backend
        const response = await axios.post(
          'YOUR_API_URL/auth/apple',
          {
            identityToken: appleAuthRequestResponse.identityToken,
            authorizationCode: appleAuthRequestResponse.authorizationCode,
            user: appleAuthRequestResponse.user,
            email: appleAuthRequestResponse.email,
            fullName: appleAuthRequestResponse.fullName,
            realUserStatus: appleAuthRequestResponse.realUserStatus,
          }
        );

        // Handle successful authentication
        console.log('Backend response:', response.data);

        // Navigate based on user status
        if (response.data.isNewUser) {
          navigation.navigate('Onboarding');
        } else {
          navigation.navigate('Dashboard');
        }
      }
    } catch (error) {
      if (error.code === appleAuth.Error.CANCELED) {
        console.log('User canceled Apple Sign in.');
      } else {
        console.error('Error during Apple Sign in:', error);
      }
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={onAppleButtonPress}>
        <Text style={styles.buttonText}>Sign in with Apple</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#000000',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AppleLoginButton;
```

### Step 5: Android Implementation

#### Configure Service ID

1. In Apple Developer Portal, configure your Service ID
2. Add Android package name: com.2sweety.dating
3. Generate SHA-256 fingerprint:
   ```bash
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   ```

#### Android Component

The same React Native component works for Android after configuration.

### Important Notes for Apple Sign In

1. **First Login Only**: Apple only returns email and name on the first login. Store this data immediately.
2. **Testing**: Must test on real devices; simulator always returns errors
3. **Private Email Relay**: Users can choose to hide their email; handle relay emails properly
4. **Real User Indicator**: Use `realUserStatus` to detect likely real users vs. fraudulent accounts

---

## Facebook Login Integration

### Step 1: Facebook Developer Setup

#### Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Select "Consumer" use case
4. Fill in app details:
   - App Name: "2Sweety"
   - Contact Email: your-email@example.com
5. Create App ID

#### Configure Facebook Login
1. In app dashboard, click "Add Product"
2. Find "Facebook Login" → "Set Up"
3. Select platform (Web, iOS, Android)

**For Web:**
1. Enter Site URL: https://yourdomain.com
2. Save changes

**For iOS:**
1. Enter Bundle ID: com.2sweety.dating
2. Enable Single Sign On
3. Save changes

**For Android:**
1. Enter Package Name: com.2sweety.dating
2. Enter Class Name: com.2sweety.MainActivity
3. Generate and enter Key Hashes:
   ```bash
   keytool -exportcert -alias androiddebugkey -keystore ~/.android/debug.keystore | openssl sha1 -binary | openssl base64
   ```
4. Enable Single Sign On
5. Save changes

#### App Settings
1. Go to "Settings" → "Basic"
2. Note your App ID and App Secret
3. Add Privacy Policy URL
4. Add Terms of Service URL
5. Select Category: "Social Networking"
6. Save changes

#### App Review (for Production)
1. Go to "App Review" → "Permissions and Features"
2. Request "email" and "public_profile" permissions
3. Provide detailed use case descriptions
4. Submit for review

### Step 2: Environment Variables

```bash
# Facebook Login
REACT_APP_FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret
```

### Step 3: Web Implementation

#### Install Package

```bash
npm install react-facebook-login
```

#### Create Facebook Login Component

Create `src/components/FacebookLoginButton.jsx`:

```javascript
import React from 'react';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaFacebook } from 'react-icons/fa';

const FacebookLoginButton = () => {
  const navigate = useNavigate();

  const responseFacebook = async (response) => {
    try {
      console.log('Facebook Response:', response);

      if (response.accessToken) {
        // Send to backend for verification
        const backendResponse = await axios.post(
          `${process.env.REACT_APP_API_URL}/auth/facebook`,
          {
            accessToken: response.accessToken,
            userID: response.userID,
            name: response.name,
            email: response.email,
            picture: response.picture?.data?.url,
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        // Store authentication
        localStorage.setItem('token', backendResponse.data.token);
        localStorage.setItem('UserId', backendResponse.data.userId);
        localStorage.setItem('authProvider', 'facebook');

        toast.success('Successfully logged in with Facebook!');

        if (backendResponse.data.isNewUser) {
          navigate('/birthdate');
        } else {
          navigate('/dashboard');
        }
      } else {
        console.error('Facebook login failed:', response);
        toast.error('Facebook login failed. Please try again.');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      toast.error('Failed to login with Facebook. Please try again.');
    }
  };

  return (
    <div className="facebook-login-container">
      <FacebookLogin
        appId={process.env.REACT_APP_FACEBOOK_APP_ID}
        autoLoad={false}
        fields="name,email,picture"
        scope="public_profile,email"
        callback={responseFacebook}
        render={(renderProps) => (
          <button
            onClick={renderProps.onClick}
            className="flex items-center justify-center w-full px-4 py-3 text-white bg-blue-600 border border-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaFacebook className="w-5 h-5 mr-2" />
            <span className="font-medium">Continue with Facebook</span>
          </button>
        )}
      />
    </div>
  );
};

export default FacebookLoginButton;
```

### Step 4: React Native Implementation

#### Install Package

```bash
npm install react-native-fbsdk-next
cd ios && pod install && cd ..
```

#### iOS Setup

1. Update `ios/Podfile`:
   ```ruby
   use_frameworks! :linkage => :static
   ```

2. Update `ios/YourApp/Info.plist`:
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>fbYOUR_APP_ID</string>
       </array>
     </dict>
   </array>
   <key>FacebookAppID</key>
   <string>YOUR_APP_ID</string>
   <key>FacebookDisplayName</key>
   <string>2Sweety</string>
   <key>LSApplicationQueriesSchemes</key>
   <array>
     <string>fbapi</string>
     <string>fb-messenger-share-api</string>
   </array>
   ```

3. Update `ios/YourApp/AppDelegate.mm`:
   ```objc
   #import <FBSDKCoreKit/FBSDKCoreKit.h>

   - (BOOL)application:(UIApplication *)application
       didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
   {
     [[FBSDKApplicationDelegate sharedInstance] application:application
       didFinishLaunchingWithOptions:launchOptions];
     return YES;
   }

   - (BOOL)application:(UIApplication *)application
       openURL:(NSURL *)url
       options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
   {
     return [[FBSDKApplicationDelegate sharedInstance] application:application
       openURL:url options:options];
   }
   ```

#### Android Setup

1. Update `android/app/src/main/res/values/strings.xml`:
   ```xml
   <string name="facebook_app_id">YOUR_APP_ID</string>
   <string name="fb_login_protocol_scheme">fbYOUR_APP_ID</string>
   ```

2. Update `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data
     android:name="com.facebook.sdk.ApplicationId"
     android:value="@string/facebook_app_id"/>

   <activity
     android:name="com.facebook.FacebookActivity"
     android:configChanges="keyboard|keyboardHidden|screenLayout|screenSize|orientation"
     android:label="@string/app_name" />

   <activity
     android:name="com.facebook.CustomTabActivity"
     android:exported="true">
     <intent-filter>
       <action android:name="android.intent.action.VIEW" />
       <category android:name="android.intent.category.DEFAULT" />
       <category android:name="android.intent.category.BROWSABLE" />
       <data android:scheme="@string/fb_login_protocol_scheme" />
     </intent-filter>
   </activity>
   ```

#### React Native Component

```javascript
import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { LoginManager, AccessToken, Profile } from 'react-native-fbsdk-next';
import axios from 'axios';

const FacebookLoginButton = () => {
  const [loading, setLoading] = useState(false);

  const handleFacebookLogin = async () => {
    try {
      setLoading(true);

      // Logout first to ensure clean state
      LoginManager.logOut();

      // Attempt login with permissions
      const result = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ]);

      if (result.isCancelled) {
        console.log('Login cancelled');
        return;
      }

      // Get access token
      const data = await AccessToken.getCurrentAccessToken();

      if (!data) {
        throw new Error('Failed to get access token');
      }

      console.log('Access Token:', data.accessToken);

      // Get user profile
      const profile = await Profile.getCurrentProfile();

      if (profile) {
        console.log('Profile:', profile);

        // Fetch additional user data from Graph API
        const response = await fetch(
          `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${data.accessToken}`
        );
        const userData = await response.json();

        console.log('User Data:', userData);

        // Send to backend
        const backendResponse = await axios.post(
          'YOUR_API_URL/auth/facebook',
          {
            accessToken: data.accessToken,
            userID: userData.id,
            name: userData.name,
            email: userData.email,
            picture: userData.picture?.data?.url,
          }
        );

        // Handle successful authentication
        console.log('Backend response:', backendResponse.data);
        Alert.alert('Success', 'Logged in with Facebook!');
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      Alert.alert('Error', 'Failed to login with Facebook');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={handleFacebookLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Logging in...' : 'Continue with Facebook'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    backgroundColor: '#1877F2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default FacebookLoginButton;
```

---

## Backend API Integration

### API Endpoint Structure

Create the following endpoints in your backend:

```
POST /api/auth/google
POST /api/auth/apple
POST /api/auth/facebook
POST /api/auth/verify-token
POST /api/auth/refresh-token
POST /api/auth/logout
```

### Google Backend Verification (Node.js/Express)

#### Install Dependencies

```bash
npm install google-auth-library jsonwebtoken
```

#### Implementation

```javascript
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /api/auth/google
app.post('/api/auth/google', async (req, res) => {
  try {
    const { token, email, name, picture, sub } = req.body;

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleUserId = payload['sub'];
    const userEmail = payload['email'];
    const emailVerified = payload['email_verified'];

    // Security check
    if (!emailVerified) {
      return res.status(400).json({ error: 'Email not verified' });
    }

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { googleId: googleUserId },
        { email: userEmail }
      ]
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new User({
        email: userEmail,
        name: name,
        profilePicture: picture,
        googleId: googleUserId,
        authProvider: 'google',
        emailVerified: true,
        createdAt: new Date(),
      });

      await user.save();
      isNewUser = true;
    } else {
      // Update existing user with Google ID if not set
      if (!user.googleId) {
        user.googleId = googleUserId;
        user.authProvider = 'google';
        await user.save();
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        authProvider: 'google',
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token: authToken,
      refreshToken: refreshToken,
      userId: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});
```

### Apple Backend Verification

#### Install Dependencies

```bash
npm install apple-signin-auth jsonwebtoken
```

#### Implementation

```javascript
const appleSignin = require('apple-signin-auth');
const jwt = require('jsonwebtoken');
const fs = require('fs');

// POST /api/auth/apple
app.post('/api/auth/apple', async (req, res) => {
  try {
    const { code, id_token, user } = req.body;

    // Verify the authorization code
    const clientSecret = appleSignin.getClientSecret({
      clientID: process.env.APPLE_CLIENT_ID, // Service ID
      teamID: process.env.APPLE_TEAM_ID,
      privateKey: process.env.APPLE_PRIVATE_KEY, // Content of .p8 file
      keyIdentifier: process.env.APPLE_KEY_ID,
    });

    const tokens = await appleSignin.getAuthorizationToken(code, {
      clientID: process.env.APPLE_CLIENT_ID,
      clientSecret: clientSecret,
      redirectUri: process.env.APPLE_REDIRECT_URI,
    });

    // Verify the ID token
    const { sub: appleUserId, email, email_verified } = await appleSignin.verifyIdToken(
      tokens.id_token,
      {
        audience: process.env.APPLE_CLIENT_ID,
        ignoreExpiration: false,
      }
    );

    // Check if user exists
    let dbUser = await User.findOne({
      $or: [
        { appleId: appleUserId },
        { email: email }
      ]
    });

    let isNewUser = false;

    if (!dbUser) {
      // Create new user
      // Note: Apple only sends user data (name, email) on first login
      dbUser = new User({
        email: email || null,
        name: user?.name ? `${user.name.firstName} ${user.name.lastName}` : 'Apple User',
        appleId: appleUserId,
        authProvider: 'apple',
        emailVerified: email_verified === 'true',
        createdAt: new Date(),
      });

      await dbUser.save();
      isNewUser = true;
    } else {
      // Update existing user
      if (!dbUser.appleId) {
        dbUser.appleId = appleUserId;
        dbUser.authProvider = 'apple';
        await dbUser.save();
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: dbUser._id,
        email: dbUser.email,
        authProvider: 'apple',
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: dbUser._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    dbUser.refreshToken = refreshToken;
    await dbUser.save();

    res.json({
      success: true,
      token: authToken,
      refreshToken: refreshToken,
      userId: dbUser._id,
      email: dbUser.email,
      name: dbUser.name,
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error('Apple auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});
```

### Facebook Backend Verification

```javascript
const axios = require('axios');
const jwt = require('jsonwebtoken');

// POST /api/auth/facebook
app.post('/api/auth/facebook', async (req, res) => {
  try {
    const { accessToken, userID, name, email, picture } = req.body;

    // Verify the access token with Facebook
    const debugResponse = await axios.get(
      `https://graph.facebook.com/debug_token`,
      {
        params: {
          input_token: accessToken,
          access_token: `${process.env.FACEBOOK_APP_ID}|${process.env.FACEBOOK_APP_SECRET}`,
        },
      }
    );

    const { data } = debugResponse.data;

    // Verify token is valid and for this app
    if (!data.is_valid || data.app_id !== process.env.FACEBOOK_APP_ID) {
      return res.status(401).json({ error: 'Invalid access token' });
    }

    // Fetch user data from Facebook Graph API
    const userResponse = await axios.get(
      `https://graph.facebook.com/v18.0/me`,
      {
        params: {
          fields: 'id,name,email,picture.type(large)',
          access_token: accessToken,
        },
      }
    );

    const fbUser = userResponse.data;

    // Check if user exists
    let user = await User.findOne({
      $or: [
        { facebookId: fbUser.id },
        { email: fbUser.email }
      ]
    });

    let isNewUser = false;

    if (!user) {
      // Create new user
      user = new User({
        email: fbUser.email || null,
        name: fbUser.name,
        profilePicture: fbUser.picture?.data?.url,
        facebookId: fbUser.id,
        authProvider: 'facebook',
        emailVerified: !!fbUser.email,
        createdAt: new Date(),
      });

      await user.save();
      isNewUser = true;
    } else {
      // Update existing user
      if (!user.facebookId) {
        user.facebookId = fbUser.id;
        user.authProvider = 'facebook';
        await user.save();
      }
    }

    // Generate JWT token
    const authToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        authProvider: 'facebook',
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    user.refreshToken = refreshToken;
    await user.save();

    res.json({
      success: true,
      token: authToken,
      refreshToken: refreshToken,
      userId: user._id,
      email: user.email,
      name: user.name,
      profilePicture: user.profilePicture,
      isNewUser: isNewUser,
    });
  } catch (error) {
    console.error('Facebook auth error:', error);
    res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
});
```

### Database Schema for Social Accounts

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Info
  email: {
    type: String,
    sparse: true, // Allow null for users without email (some Apple users)
    lowercase: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
  },
  profilePicture: String,

  // Authentication
  authProvider: {
    type: String,
    enum: ['google', 'apple', 'facebook', 'phone', 'email'],
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  appleId: {
    type: String,
    sparse: true,
    unique: true,
  },
  facebookId: {
    type: String,
    sparse: true,
    unique: true,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },

  // Tokens
  refreshToken: String,

  // Profile Data (from your existing schema)
  birthDate: Date,
  gender: String,
  preferences: {
    interestedIn: [String],
    ageRange: {
      min: Number,
      max: Number,
    },
    distance: Number,
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: Date,
});

// Update timestamp on save
userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Ensure at least one social ID exists
userSchema.index(
  { googleId: 1, appleId: 1, facebookId: 1 },
  {
    partialFilterExpression: {
      $or: [
        { googleId: { $exists: true } },
        { appleId: { $exists: true } },
        { facebookId: { $exists: true } },
      ],
    },
  }
);

module.exports = mongoose.model('User', userSchema);
```

---

## Security Best Practices

### 1. Token Storage

#### Web (React)

**DO NOT store sensitive tokens in localStorage or sessionStorage**

For web applications, use:
1. **httpOnly Cookies** (Recommended for refresh tokens)
2. **Memory storage** (For access tokens)
3. **Secure, SameSite cookies**

```javascript
// Backend: Set httpOnly cookie
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
});

// Backend: Send access token in response
res.json({
  accessToken: authToken,
  expiresIn: 3600,
});

// Frontend: Store access token in memory
let accessToken = null;

export const setAccessToken = (token) => {
  accessToken = token;
};

export const getAccessToken = () => {
  return accessToken;
};
```

#### Mobile (React Native)

Use **react-native-keychain** for secure storage:

```bash
npm install react-native-keychain
```

```javascript
import * as Keychain from 'react-native-keychain';

// Store tokens
await Keychain.setGenericPassword(
  'auth',
  JSON.stringify({
    accessToken: authToken,
    refreshToken: refreshToken,
  }),
  {
    service: 'com.2sweety.dating',
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  }
);

// Retrieve tokens
const credentials = await Keychain.getGenericPassword({
  service: 'com.2sweety.dating',
});

if (credentials) {
  const tokens = JSON.parse(credentials.password);
  console.log('Access Token:', tokens.accessToken);
}

// Delete tokens
await Keychain.resetGenericPassword({
  service: 'com.2sweety.dating',
});
```

### 2. CSRF Protection

Implement state parameter for OAuth flows:

```javascript
// Generate random state
const generateState = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Store state before OAuth redirect
const state = generateState();
sessionStorage.setItem('oauth_state', state);

// Verify state in callback
const callbackState = new URLSearchParams(window.location.search).get('state');
const storedState = sessionStorage.getItem('oauth_state');

if (callbackState !== storedState) {
  throw new Error('Invalid state parameter - possible CSRF attack');
}

sessionStorage.removeItem('oauth_state');
```

### 3. Redirect URI Validation

Backend validation:

```javascript
const ALLOWED_REDIRECT_URIS = [
  'http://localhost:3000/auth/callback',
  'https://yourdomain.com/auth/callback',
  'https://www.yourdomain.com/auth/callback',
];

app.post('/api/auth/google', (req, res) => {
  const redirectUri = req.body.redirectUri;

  if (!ALLOWED_REDIRECT_URIS.includes(redirectUri)) {
    return res.status(400).json({ error: 'Invalid redirect URI' });
  }

  // Continue with authentication
});
```

### 4. Scope Limitations

Request only necessary permissions:

```javascript
// Google - Minimal scopes
const scopes = ['openid', 'email', 'profile'];

// Apple - Minimal scopes
const scopes = ['email', 'name'];

// Facebook - Minimal scopes
const scopes = ['public_profile', 'email'];

// DO NOT request additional scopes unless absolutely necessary
// Examples of scopes to avoid unless needed:
// - 'https://www.googleapis.com/auth/calendar' (Google Calendar)
// - 'user_birthday' (Facebook birthday)
// - 'user_location' (Facebook location)
```

### 5. Refresh Token Handling

Implement secure refresh token rotation:

```javascript
// Backend: Refresh token endpoint
app.post('/api/auth/refresh-token', async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        authProvider: user.authProvider,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Generate new refresh token (rotation)
    const newRefreshToken = jwt.sign(
      { userId: user._id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '90d' }
    );

    // Update refresh token in database
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    res.json({
      accessToken: newAccessToken,
      expiresIn: 3600,
    });
  } catch (error) {
    res.status(401).json({ error: 'Token refresh failed' });
  }
});
```

### 6. Rate Limiting

Implement rate limiting for auth endpoints:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.post('/api/auth/google', authLimiter, async (req, res) => {
  // Authentication logic
});

app.post('/api/auth/apple', authLimiter, async (req, res) => {
  // Authentication logic
});

app.post('/api/auth/facebook', authLimiter, async (req, res) => {
  // Authentication logic
});
```

### 7. Input Validation

Validate all inputs:

```bash
npm install joi
```

```javascript
const Joi = require('joi');

const googleAuthSchema = Joi.object({
  token: Joi.string().required(),
  email: Joi.string().email().required(),
  name: Joi.string().min(1).max(100).required(),
  picture: Joi.string().uri().optional(),
  sub: Joi.string().required(),
});

app.post('/api/auth/google', async (req, res) => {
  // Validate input
  const { error } = googleAuthSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      error: 'Validation failed',
      details: error.details[0].message,
    });
  }

  // Continue with authentication
});
```

### 8. Security Headers

Add security headers to responses:

```bash
npm install helmet
```

```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'accounts.google.com', 'appleid.cdn-apple.com', 'connect.facebook.net'],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ['accounts.google.com', 'appleid.apple.com', 'www.facebook.com'],
      connectSrc: ["'self'", 'accounts.google.com', 'appleid.apple.com', 'graph.facebook.com'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
```

---

## Testing

### Test Accounts Setup

#### Google
1. Go to Google Cloud Console
2. OAuth consent screen → "Test users"
3. Add test user emails
4. Test users can login without app verification

#### Apple
1. Apple only allows testing on real devices
2. Use your Apple ID for testing
3. Enable "Sign In with Apple" in device Settings

#### Facebook
1. Go to Facebook App Dashboard
2. Roles → "Test Users"
3. Create test users with specific permissions
4. Use test users during development

### Testing on Localhost

#### Google
Works out of the box with `http://localhost:3000`

#### Apple
Requires HTTPS or localhost. For localhost:
1. Add `http://localhost:3000` to authorized domains
2. Use `https://localhost:3000` for testing (requires SSL cert)

#### Facebook
1. Add `http://localhost:3000` to "Site URL"
2. Enable "Localhost OAuth Redirect URIs" in advanced settings

### Testing on Staging

#### Setup Staging Environment

1. Create staging subdomain: `staging.yourdomain.com`
2. Deploy app to staging
3. Update OAuth redirect URIs in all providers

#### Google Staging Setup
```
Authorized JavaScript origins:
https://staging.yourdomain.com

Authorized redirect URIs:
https://staging.yourdomain.com/auth/callback
```

#### Apple Staging Setup
```
Domains: staging.yourdomain.com
Return URLs: https://staging.yourdomain.com/auth/apple/callback
```

#### Facebook Staging Setup
```
Site URL: https://staging.yourdomain.com
```

### Production Checklist

- [ ] **Google OAuth**
  - [ ] Production redirect URIs configured
  - [ ] OAuth consent screen verified (if required)
  - [ ] Client IDs for all platforms (Web, iOS, Android)
  - [ ] Environment variables set on production server
  - [ ] HTTPS enabled
  - [ ] Rate limiting implemented

- [ ] **Apple Sign In**
  - [ ] Production domains added
  - [ ] Service ID configured for web
  - [ ] App ID with Sign In capability
  - [ ] Private key securely stored
  - [ ] Email relay handling implemented
  - [ ] First-login data capture implemented

- [ ] **Facebook Login**
  - [ ] App submitted for review (if using advanced permissions)
  - [ ] Production URL configured
  - [ ] Privacy policy URL added
  - [ ] Terms of service URL added
  - [ ] App category selected
  - [ ] Platform-specific settings verified

- [ ] **Backend**
  - [ ] Token verification implemented for all providers
  - [ ] Database indexes created
  - [ ] Refresh token rotation implemented
  - [ ] Rate limiting active
  - [ ] Error logging configured
  - [ ] Security headers enabled
  - [ ] HTTPS enforced

- [ ] **Security**
  - [ ] CSRF protection enabled
  - [ ] Secure token storage implemented
  - [ ] Input validation on all endpoints
  - [ ] Scope limitations verified
  - [ ] No secrets in frontend code
  - [ ] Security audit completed

- [ ] **Testing**
  - [ ] All flows tested on web
  - [ ] All flows tested on iOS
  - [ ] All flows tested on Android
  - [ ] Error scenarios tested
  - [ ] Token refresh tested
  - [ ] Logout tested
  - [ ] Performance tested

---

## Troubleshooting

### Common Errors and Solutions

#### Google OAuth

**Error: `redirect_uri_mismatch`**
```
Solution:
1. Check exact match of redirect URI (including http/https, trailing slash)
2. Verify in Google Cloud Console > Credentials
3. Common issues: http vs https, www vs non-www
```

**Error: `access_denied`**
```
Solution:
1. User cancelled authorization
2. Check OAuth consent screen configuration
3. Verify requested scopes are allowed
```

**Error: `invalid_client`**
```
Solution:
1. Verify CLIENT_ID matches the one from Google Console
2. Check CLIENT_SECRET (backend only)
3. Ensure using correct credentials for platform (web/ios/android)
```

#### Apple Sign In

**Error: `invalid_client`**
```
Solution:
1. Verify Service ID matches exactly
2. Check Team ID and Key ID
3. Verify private key is correctly formatted (with BEGIN/END headers)
4. Ensure Service ID is configured for Sign In with Apple
```

**Error: `invalid_grant`**
```
Solution:
1. Authorization code can only be used once
2. Code expires after 5 minutes
3. Don't reuse the same code for multiple requests
```

**Error: User data is null**
```
Solution:
This is normal behavior. Apple only returns user data on FIRST login.
You MUST save the user's name and email immediately on first authentication.
For subsequent logins, retrieve from your database.
```

**Error: Testing on simulator fails**
```
Solution:
Apple Sign In does NOT work on iOS simulator.
MUST test on real device with valid Apple ID.
```

#### Facebook Login

**Error: `App Not Setup`**
```
Solution:
1. Enable Facebook Login product in app dashboard
2. Configure platform settings (iOS/Android/Web)
3. Add platform-specific Bundle ID or Package Name
```

**Error: `Invalid Scopes`**
```
Solution:
1. Verify requested permissions are approved
2. Check App Review status for advanced permissions
3. Use only 'public_profile' and 'email' during development
```

**Error: `redirect_uri is not owned by the application`**
```
Solution:
1. Add redirect URI to "Valid OAuth Redirect URIs"
2. Must exactly match (including protocol and path)
3. For localhost: enable "Use Strict Mode for Redirect URIs"
```

### Debugging Tips

#### Enable Debug Logging

```javascript
// Frontend - Google
<GoogleOAuthProvider
  clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
  onScriptLoadError={() => console.error('Google script failed to load')}
  onScriptLoadSuccess={() => console.log('Google script loaded successfully')}
>
```

```javascript
// Frontend - Detailed error logging
const handleAuthError = (error, provider) => {
  console.group(`${provider} Authentication Error`);
  console.error('Error Object:', error);
  console.error('Error Code:', error.code);
  console.error('Error Message:', error.message);
  console.error('Error Details:', error.details);
  console.error('Timestamp:', new Date().toISOString());
  console.groupEnd();

  // Send to error tracking service
  if (window.Sentry) {
    window.Sentry.captureException(error, {
      tags: { authProvider: provider },
    });
  }
};
```

#### Backend Debug Logging

```javascript
// Middleware for logging all auth requests
app.use('/api/auth', (req, res, next) => {
  console.log({
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.path,
    body: { ...req.body, token: '[REDACTED]' },
    headers: {
      'user-agent': req.headers['user-agent'],
      'x-forwarded-for': req.headers['x-forwarded-for'],
    },
  });
  next();
});
```

#### Network Debugging

Use browser DevTools Network tab:
1. Filter by "XHR" or "Fetch"
2. Look for requests to:
   - `accounts.google.com`
   - `appleid.apple.com`
   - `graph.facebook.com`
3. Check request/response payloads
4. Verify CORS headers

#### React Native Debugging

```javascript
// Enable network debugging
import { NativeModules } from 'react-native';

if (__DEV__) {
  NativeModules.DevSettings.setIsDebuggingRemotely(true);
}

// Log all network requests
global.XMLHttpRequest = global.originalXMLHttpRequest || global.XMLHttpRequest;
global.FormData = global.originalFormData || global.FormData;

if (window.FETCH_SUPPORT) {
  window.FETCH_SUPPORT.blob = false;
} else {
  global.Blob = global.originalBlob || global.Blob;
  global.FileReader = global.originalFileReader || global.FileReader;
}
```

### Support Resources

#### Google
- Documentation: https://developers.google.com/identity
- Stack Overflow: https://stackoverflow.com/questions/tagged/google-oauth
- Issue Tracker: https://issuetracker.google.com/

#### Apple
- Documentation: https://developer.apple.com/sign-in-with-apple/
- Developer Forums: https://developer.apple.com/forums/
- Support: https://developer.apple.com/contact/

#### Facebook
- Documentation: https://developers.facebook.com/docs/facebook-login/
- Community: https://www.facebook.com/groups/fbdevelopers/
- Support: https://developers.facebook.com/support/

---

## Environment Variables

### Complete Template

Create a `.env.local` file in your project root:

```bash
# ==================================
# GOOGLE OAUTH CONFIGURATION
# ==================================

# Web Application
REACT_APP_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnOpQrStUvWxYz

# iOS Application
GOOGLE_CLIENT_ID_IOS=123456789-iosabcdefghijklmnop.apps.googleusercontent.com

# Android Application
GOOGLE_CLIENT_ID_ANDROID=123456789-androidabcdefghijklmnop.apps.googleusercontent.com

# ==================================
# APPLE SIGN IN CONFIGURATION
# ==================================

# Service ID (for web)
REACT_APP_APPLE_CLIENT_ID=com.2sweety.dating.web

# Redirect URI
REACT_APP_APPLE_REDIRECT_URI=https://yourdomain.com/auth/apple/callback

# Backend Configuration
APPLE_TEAM_ID=ABCD123456
APPLE_KEY_ID=ABCD123456
APPLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----
MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQg...
-----END PRIVATE KEY-----"

# ==================================
# FACEBOOK LOGIN CONFIGURATION
# ==================================

# App ID and Secret
REACT_APP_FACEBOOK_APP_ID=1234567890123456
FACEBOOK_APP_SECRET=abcdef0123456789abcdef0123456789

# ==================================
# JWT CONFIGURATION
# ==================================

# Generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters_long
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here_minimum_32_characters_long

# ==================================
# API CONFIGURATION
# ==================================

# Backend API URL
REACT_APP_API_URL=https://api.yourdomain.com
# For local development:
# REACT_APP_API_URL=http://localhost:5000

# ==================================
# ENVIRONMENT
# ==================================

NODE_ENV=production
# For local development:
# NODE_ENV=development

# ==================================
# SECURITY
# ==================================

# CORS Allowed Origins (comma-separated)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Cookie settings
COOKIE_DOMAIN=.yourdomain.com
COOKIE_SECURE=true
```

### Environment-Specific Files

#### Development (`.env.development`)
```bash
REACT_APP_GOOGLE_CLIENT_ID=dev-client-id.apps.googleusercontent.com
REACT_APP_API_URL=http://localhost:5000
NODE_ENV=development
```

#### Staging (`.env.staging`)
```bash
REACT_APP_GOOGLE_CLIENT_ID=staging-client-id.apps.googleusercontent.com
REACT_APP_API_URL=https://api-staging.yourdomain.com
NODE_ENV=staging
```

#### Production (`.env.production`)
```bash
REACT_APP_GOOGLE_CLIENT_ID=prod-client-id.apps.googleusercontent.com
REACT_APP_API_URL=https://api.yourdomain.com
NODE_ENV=production
```

### Security Notes

1. **Never commit `.env` files to version control**
   ```bash
   # Add to .gitignore
   .env
   .env.local
   .env.development
   .env.staging
   .env.production
   ```

2. **Use environment-specific files for different deployments**

3. **Store production secrets in secure vault** (AWS Secrets Manager, Azure Key Vault, etc.)

4. **Rotate secrets regularly** (every 90 days recommended)

5. **Use different credentials for each environment** (dev, staging, prod)

---

## Integration Checklist

### Pre-Integration
- [ ] Review current authentication flow
- [ ] Plan user migration strategy (if existing users)
- [ ] Design database schema updates
- [ ] Set up developer accounts for all providers

### Development Phase
- [ ] Install required packages
- [ ] Configure OAuth providers
- [ ] Implement frontend components
- [ ] Implement backend verification
- [ ] Add error handling
- [ ] Implement token management
- [ ] Add security measures

### Testing Phase
- [ ] Test Google login (web/iOS/Android)
- [ ] Test Apple login (web/iOS/Android)
- [ ] Test Facebook login (web/iOS/Android)
- [ ] Test error scenarios
- [ ] Test token refresh flow
- [ ] Test logout flow
- [ ] Test account linking (if same email)
- [ ] Security audit

### Deployment Phase
- [ ] Update environment variables
- [ ] Configure production OAuth settings
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Verify all platforms
- [ ] Monitor error logs
- [ ] Update documentation

### Post-Deployment
- [ ] Monitor authentication metrics
- [ ] Collect user feedback
- [ ] Optimize conversion rates
- [ ] Regular security reviews
- [ ] Keep dependencies updated

---

## Conclusion

This guide provides comprehensive instructions for integrating Google, Apple, and Facebook social login into the 2Sweety dating app. Follow the steps carefully, implement all security measures, and thoroughly test across all platforms before deploying to production.

For additional help or questions:
1. Review the troubleshooting section
2. Check provider-specific documentation
3. Search Stack Overflow for similar issues
4. Contact provider support if needed

**Remember**: Security is paramount. Always validate tokens on the backend, never expose secrets, and keep all dependencies up to date.

Happy coding! 🚀
