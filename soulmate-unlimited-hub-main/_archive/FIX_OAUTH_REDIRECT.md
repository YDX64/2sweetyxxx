# Fix OAuth Redirect Issue - URGENT

## Problem
Google OAuth is redirecting to `http://localhost:3000` instead of `https://2sweety.com`

## Solution

### 1. Update Supabase Dashboard Settings

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Update these fields:

   - **Site URL**: Change from `http://localhost:3000` to `https://2sweety.com`
   - **Redirect URLs**: Add these URLs (one per line):
     ```
     https://2sweety.com
     https://2sweety.com/*
     https://2sweety.com/login
     https://2sweety.com/auth/callback
     http://localhost:5173
     http://localhost:5173/*
     ```

5. Click **Save**

### 2. Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Add these to **Authorized redirect URIs**:
   ```
   https://kvrlzpdyeezmhjiiwfnp.supabase.co/auth/v1/callback
   ```
6. Add these to **Authorized JavaScript origins**:
   ```
   https://2sweety.com
   https://kvrlzpdyeezmhjiiwfnp.supabase.co
   ```
7. Click **Save**

### 3. Clear Browser Cache

After making these changes:
1. Clear your browser cache and cookies for 2sweety.com
2. Try logging in again with Google

### 4. Verify Environment Variables (if needed)

Make sure your production server has:
```env
VITE_SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Alternative Quick Fix (Temporary)

If you need an immediate fix while waiting for settings to propagate, add this to your production server's nginx configuration:

```nginx
# Redirect OAuth callbacks from port 3000 to your app
location ~ ^/.*#access_token= {
    return 301 https://2sweety.com$request_uri;
}
```

## Notes
- Changes may take 5-10 minutes to propagate
- The redirect URL in the OAuth response is controlled by Supabase's Site URL setting
- This is NOT a code issue - it's a configuration issue in Supabase Dashboard