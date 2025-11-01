# Coolify Environment Variables for 2Sweety

## Required Environment Variables

Copy and paste these into your Coolify deployment settings:

```bash
# ============================================
# REQUIRED - Build will fail without these
# ============================================

# Firebase Configuration (ZORUNLU)
REACT_APP_FIREBASE_API_KEY=AIzaSyCfh0E2339PFjfwz2cIN4TL9bH0DRBZSBc
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=425461413809
REACT_APP_FIREBASE_APP_ID=1:425461413809:web:6bbcb494c42b0970ced125
REACT_APP_FIREBASE_MEASUREMENT_ID=G-BF1TH0REMM

# API URLs (Varsayılan değerler)
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/

# OneSignal Push Notifications
REACT_APP_ONESIGNAL_APP_ID=94b2b6c5-fabb-4454-a2b7-75cf75b84789

# ============================================
# OPTIONAL - Add if you have these services
# ============================================

# Agora Video/Audio Calls (Opsiyonel)
# REACT_APP_AGORA_APP_ID=your_agora_app_id_here

# Google Maps (Opsiyonel)
# REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key_here

# Payment Gateways (Opsiyonel)
# REACT_APP_RAZORPAY_KEY_ID=your_razorpay_key_here
# REACT_APP_STRIPE_PUBLISHABLE_KEY=your_stripe_key_here
# REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id_here

# Social Login (Opsiyonel)
# REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id_here
# REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id_here
```

## How to Add in Coolify

1. Go to your application settings in Coolify
2. Find the "Environment Variables" section
3. Click "Add Environment Variable"
4. Add each variable one by one:
   - Name: Variable name (e.g., `REACT_APP_FIREBASE_API_KEY`)
   - Value: Variable value
   - Build Variable: ✅ CHECK THIS (Important!)
   - Secret: ❌ Uncheck (unless it's sensitive data)

## Important Notes

1. **Build Variables**: Make sure to check "Build Variable" for all REACT_APP_* variables
2. **Firebase**: The Firebase config above is from your existing setup - verify it's correct
3. **API URLs**: Using default cscodetech.cloud URLs - change if you have your own backend
4. **OneSignal**: Using the existing app ID from your code

## Verification

After deployment, you can verify environment variables were applied by:
1. Checking browser console for any Firebase errors
2. Checking Network tab for correct API calls
3. Looking at the build logs in Coolify

## Troubleshooting Bad Gateway

If you still get Bad Gateway after adding environment variables:

1. **Check Build Logs**: Look for npm build errors in Coolify logs
2. **Verify Firebase**: Make sure Firebase project is configured correctly
3. **Check Port**: Ensure Coolify is forwarding to port 80 (not 3000)
4. **Restart**: After adding environment variables, redeploy the application