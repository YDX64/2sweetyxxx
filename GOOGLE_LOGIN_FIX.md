# Google Login Fix - Complete Guide

## Problem
Google OAuth button shows "Google signup coming soon!" instead of opening the OAuth popup.

## Root Cause
Your shell environment has `REACT_APP_GOOGLE_CLIENT_ID` set to a placeholder value that overrides the correct value in your `.env` files.

## Quick Diagnosis
Run this command to check:
```bash
echo $REACT_APP_GOOGLE_CLIENT_ID
```

If it shows `your_google_client_id_here.apps.googleusercontent.com` → That's the problem!

Expected value: `630419143615-bjtr3e3bfrjtr65qgsb4sgu6cle4t2ar.apps.googleusercontent.com`

---

## Solution 1: Quick Fix (Recommended)

### Step 1: Stop the app
Press `Ctrl+C` in the terminal running your React app.

### Step 2: Clear environment variables
```bash
unset REACT_APP_GOOGLE_CLIENT_ID
unset REACT_APP_FACEBOOK_APP_ID
unset REACT_APP_APPLE_CLIENT_ID
```

### Step 3: Restart the app
```bash
npm start
```

### Step 4: Verify it works
1. Open http://localhost:3000
2. Click "Continue with Google"
3. Google OAuth popup should open

---

## Solution 2: Use the Custom Dev Script (Permanent Fix)

I've created a startup script that automatically clears conflicting environment variables.

### Usage:
```bash
npm run dev
```

This runs the `start-dev.sh` script which:
1. Clears any conflicting environment variables
2. Starts the development server with clean environment

---

## Solution 3: Close and Reopen Terminal

If the above doesn't work:
1. Close your terminal completely
2. Open a new terminal window
3. Navigate to project: `cd /Users/max/Downloads/2sweet`
4. Start the app: `npm start`

---

## How Environment Variables Are Loaded in React

React loads environment variables in this order (highest to lowest priority):

1. **Shell environment variables** ← This was causing the issue
2. `.env.local` ← Contains correct value
3. `.env` ← Contains correct value
4. `.env.production` ← Used for production builds

---

## Verify Your Configuration

### Check your .env files contain correct Client ID:
```bash
cat .env
cat .env.local
cat .env.production
```

All should contain:
```
REACT_APP_GOOGLE_CLIENT_ID=630419143615-bjtr3e3bfrjtr65qgsb4sgu6cle4t2ar.apps.googleusercontent.com
```

### Check Google OAuth is properly initialized in code:

**File**: `src/index.js` (Lines 22-23)
```javascript
const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const hasValidGoogleClientId = googleClientId && googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com';
```

**File**: `src/LoginComponent/Login.jsx` (Line 71)
```javascript
const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com';
```

**File**: `src/MobilComponent/Register.jsx` (Line 65)
```javascript
const isGoogleConfigured = googleClientId && googleClientId !== 'your_google_client_id_here.apps.googleusercontent.com';
```

---

## Testing Google Login

After applying the fix:

### 1. Check the browser console
Open DevTools (F12) → Console tab
You should see the Google Client ID loaded correctly.

### 2. Test Login Flow
1. Click "Continue with Google"
2. Google OAuth popup should open
3. Select your Google account
4. You should be redirected back to the app
5. Check if you're logged in successfully

### 3. Debug if still not working
Add this to your Login.jsx temporarily to debug:
```javascript
console.log('Google Client ID:', process.env.REACT_APP_GOOGLE_CLIENT_ID);
console.log('Is Google Configured:', isGoogleConfigured);
```

---

## Additional Notes

### Google Cloud Console Settings
Make sure your Google OAuth Client is properly configured:
- Client ID: `630419143615-bjtr3e3bfrjtr65qgsb4sgu6cle4t2ar.apps.googleusercontent.com`
- Authorized JavaScript origins: `http://localhost:3000` (for development)
- Authorized redirect URIs: `http://localhost:3000` (for development)

### Production Deployment
When deploying to production, add your production domain to:
- Authorized JavaScript origins: `https://yourdomain.com`
- Authorized redirect URIs: `https://yourdomain.com`

---

## Files Modified

1. **Created**: `start-dev.sh` - Startup script that clears environment variables
2. **Modified**: `package.json` - Added `npm run dev` command

---

## Need More Help?

If the issue persists, check:
1. Are you running the app from the correct directory?
2. Is your `.env.local` file being loaded? (not ignored by .gitignore)
3. Is there a `.env.development` file that might be overriding values?
4. Check your shell config files: `~/.zshrc`, `~/.bashrc`, `~/.bash_profile`

---

## Summary

The issue was caused by a shell environment variable with a placeholder value overriding your correct configuration files. The fix is to clear that shell variable before starting the app, which can be done by:
1. Manually using `unset REACT_APP_GOOGLE_CLIENT_ID`
2. Using the new `npm run dev` command
3. Restarting your terminal
