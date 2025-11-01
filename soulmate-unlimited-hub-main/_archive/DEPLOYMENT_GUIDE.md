# 2Sweety Deployment Guide

## 🌐 Production Domain: 2sweety.com

## 📋 Pre-Deployment Checklist

### 1. Supabase Configuration
- [ ] Update **Authentication > URL Configuration**:
  - Site URL: `https://2sweety.com`
  - Redirect URLs:
    - `https://2sweety.com`
    - `https://2sweety.com/*`
    - `https://www.2sweety.com`
    - `https://www.2sweety.com/*`

### 2. Google OAuth Configuration
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com)
- [ ] Update OAuth 2.0 Client ID:
  - Authorized JavaScript origins:
    - `https://2sweety.com`
    - `https://www.2sweety.com`
  - Authorized redirect URIs:
    - `https://kvrlzpdyeezmhjiiwfnp.supabase.co/auth/v1/callback`
    - `https://2sweety.com`
    - `https://2sweety.com/*`

### 3. Environment Variables
Update production environment variables:
```bash
VITE_APP_URL=https://2sweety.com
VITE_SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
```

## 🚀 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add VITE_APP_URL production
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables in Netlify dashboard
```

### Option 3: Traditional Hosting (Apache/Nginx)

#### Build for production:
```bash
npm run build
```

#### Nginx configuration:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name 2sweety.com www.2sweety.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name 2sweety.com www.2sweety.com;

    ssl_certificate /etc/letsencrypt/live/2sweety.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/2sweety.com/privkey.pem;

    root /var/www/2sweety/dist;
    index index.html;

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}
```

## 📱 SSL Certificate
```bash
# Using Let's Encrypt
sudo certbot --nginx -d 2sweety.com -d www.2sweety.com
```

## 🔧 Post-Deployment

### 1. Update DNS Records
- A Record: `2sweety.com` → Your server IP
- A Record: `www.2sweety.com` → Your server IP
- CNAME Record: `www` → `2sweety.com`

### 2. Test OAuth Flows
- [ ] Google login works
- [ ] Apple login works
- [ ] Facebook login works

### 3. Test Stripe Integration
- [ ] Subscription upgrades work
- [ ] Webhooks are received
- [ ] Payment confirmations redirect correctly

### 4. Monitor Performance
- Set up monitoring (Sentry, LogRocket, etc.)
- Enable Supabase logs
- Set up uptime monitoring

## 🐛 Troubleshooting

### OAuth Redirect Issues
If users are redirected to wrong URL after OAuth:
1. Check Supabase Site URL setting
2. Verify OAuth provider redirect URIs
3. Clear browser cache

### CORS Issues
Add to your API server:
```javascript
app.use(cors({
  origin: ['https://2sweety.com', 'https://www.2sweety.com'],
  credentials: true
}));
```

### Environment Variables Not Loading
- Ensure `.env.production` is used in production
- Verify all `VITE_` prefixed variables
- Check build logs for missing variables