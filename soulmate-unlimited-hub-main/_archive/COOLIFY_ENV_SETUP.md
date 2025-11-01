# 🚀 COOLIFY ENVIRONMENT VARIABLES SETUP

## 📋 **Coolify Environment Configuration**

Copy these exact environment variables to your Coolify application:

### **Navigation:**
1. Go to your Coolify dashboard
2. Select your 2SWEETY-APP application
3. Click "Environment Variables" in the left sidebar
4. Add/update these variables:

---

## 🔑 **Environment Variables (Copy to Coolify):**

```
CLIENT_URL=https://2sweety.com
COOKIE_DOMAIN=2sweety.com
COOKIE_SECURE=true
DATABASE_URL=postgresql://postgres.kvrlzpdyeezmhjiiwfnp:fRNHNDlAgG3pNFr6U6bOQMnU6AMRQ9iDBZLcHFRaSio1d2liZlpV87OkGxqBEYba@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxOTUxMzM0NCwiZXhwIjoyMDM1MDg5MzQ0fQ.cQwJoNBQX0qO2Vns4dJqEKxFuuHlQaUDv4-vdHxq_sw
VITE_SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
COOLIFY=true
JWT_SECRET=8t1Svo2L0onp5/U1OL8kf0xyXDX3w7qI8k70s1laxTI=
JWT_EXPIRES_IN=7d
REFRESH_SECRET=uzLnxwCP7FHtAF9VRSzJRlmby4c/Igx7dqIF4spqszI=
REFRESH_EXPIRES_IN=30d
SESSION_SECRET=8t1Svo2L0onp5/U1OL8kf0xyXDX3w7qI8k70s1laxTI=
SERVER_URL=https://2sweety.com
VITE_API_URL=https://2sweety.com/api
GOOGLE_TRANSLATE_API_KEY=
STRIPE_SECRET_KEY=
VITE_STRIPE_PUBLISHABLE_KEY=
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760
HEALTH_CHECK_PATH=/api/health
LOG_FORMAT=json
LOG_LEVEL=info
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

---

## ✅ **Key Fixes Applied:**

### **🔧 Critical Issues Fixed:**
1. **DATABASE_URL**: ✅ Complete Supabase pooler connection string
2. **VITE_SUPABASE_URL**: ✅ Fixed missing 'i' in URL
3. **VITE_SUPABASE_ANON_KEY**: ✅ Current valid anon key
4. **PORT Consistency**: ✅ PORT=5000 matches Dockerfile EXPOSE 5000
5. **COOLIFY Flag**: ✅ Added COOLIFY=true identifier

### **🚨 Previous Issues:**
- ❌ `postgresql://postgres:fRNHNDlAgG3pNFr6U6bOQMnU6AMRQ9iDBZLcHFRaSio1d2liZlpV87OkGxqBEYba@postgresql-database-b4` (incomplete)
- ❌ `https://kvrlzpdyeezhmjiiwfnp.supabase.co` (typo)
- ❌ PORT=3000 vs EXPOSE 5000 (mismatch)

---

## 🚀 **Deployment Steps:**

1. **Update Environment Variables** in Coolify with the above values
2. **Save** the environment configuration
3. **Trigger New Deployment** from the Coolify interface
4. **Monitor Build Logs** for successful completion
5. **Verify Application** at https://2sweety.com

---

## 🔍 **npm ci Command Info:**

The `npm ci --include=dev` command is already correctly placed in `Dockerfile.coolify` at line 19. This ensures:
- ✅ All dependencies (including Vite) are installed during build
- ✅ Build tools are available for frontend compilation
- ✅ DevDependencies are removed after build for smaller image

---

## 📱 **Expected Results:**

After applying these fixes:
- ✅ Vite build will succeed (no "vite: not found" error)
- ✅ Supabase connection will work properly
- ✅ Frontend will load correctly
- ✅ Authentication will function
- ✅ Database queries will execute successfully

**Ready for deployment! 🚀**