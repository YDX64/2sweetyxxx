# 🚨 QUICK FIX CHECKLIST - Language Not Updating in Production

## ⚡ IMMEDIATE ACTIONS (Do These First)

### 1. Check Coolify Deployment Status (2 minutes)
```bash
□ Log into Coolify dashboard
□ Go to 2sweety.com application
□ Check "Deployments" tab
□ Find latest deployment commit hash
□ Compare with GitHub latest: 4d81791
```

**Is the commit hash different?**
- ✅ **YES** → Proceed to Step 2 (Force Rebuild)
- ❌ **NO** → Skip to Step 3 (Verify Build)

---

### 2. Force Rebuild in Coolify (5 minutes)
```bash
□ Click "Redeploy" button in Coolify
□ Enable "Clear Build Cache" option
□ Click "Start Deployment"
□ Wait for build to complete (3-5 minutes)
□ Check build logs for errors
□ Wait for "Deployment Successful" message
```

**Build Log Should Show:**
```
✓ npm ci completed
✓ npm run build completed
✓ Docker image built: 2sweety-web
✓ Container started
✓ Health check passed
```

---

### 3. Verify Language Works (2 minutes)
```bash
□ Open https://2sweety.com in browser
□ Hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)
□ Open browser Console (F12)
□ Check for any red errors
□ Click language selector
□ Change to Turkish or another language
□ Verify UI text changes
□ Refresh page
□ Verify language persists
```

**✅ SUCCESS:** Language changes and persists after refresh
**❌ FAILED:** Continue to Detailed Diagnostics below

---

## 🔧 DETAILED DIAGNOSTICS (If Quick Fix Didn't Work)

### A. Check GitHub Webhook
```bash
□ GitHub Repository → Settings → Webhooks
□ Find Coolify webhook
□ Check "Recent Deliveries"
□ Verify last push shows green checkmark (200 response)
□ If red X, click "Redeliver"
```

**Webhook Not Found?**
1. Go to Coolify → Application Settings → Git Integration
2. Copy webhook URL
3. Add to GitHub → Settings → Webhooks → Add webhook

---

### B. Verify Build Arguments in Coolify
```bash
□ Coolify → Application → Environment Variables → Build Arguments
□ Verify these exist:
  - REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
  - REACT_APP_DEFAULT_LANGUAGE=en
  - REACT_APP_FIREBASE_API_KEY=[your key]
```

**Missing or Wrong Values?**
1. Copy entire content from `.env.coolify` file
2. Paste into Build Arguments section
3. Save and redeploy

---

### C. Check Browser Console for Errors
```bash
□ Open https://2sweety.com
□ Press F12 → Console tab
□ Look for errors containing:
  - "i18next"
  - "useTranslation"
  - "Language"
  - "translation"
```

**Common Error Messages and Solutions:**

**Error:** `i18next not initialized`
**Solution:** Rebuild required - I18nextProvider missing from bundle

**Error:** `useTranslation hook not found`
**Solution:** Cached build - hard refresh or rebuild

**Error:** `Cannot find module './Language'`
**Solution:** Build issue - check build logs

---

### D. Verify Deployed Commit Has Critical Fix
```bash
□ Check if commit b906e3f is in deployment
  Critical commit: "CRITICAL FIX: Add missing I18nextProvider"

□ In Coolify, check deployment history
□ Find when this commit was last deployed
□ If never deployed or old deployment, force rebuild
```

---

## 🎯 STEP-BY-STEP RESOLUTION

### Scenario 1: Old Commit Deployed
**Solution:** Force rebuild (see Step 2 above)

### Scenario 2: Webhook Not Triggering
**Solution:**
1. Verify webhook exists in GitHub
2. Check webhook deliveries for errors
3. Re-create webhook if necessary
4. Test with manual push to main branch

### Scenario 3: Build Succeeds But Old Version Shows
**Solution:**
1. Clear browser cache (Ctrl+Shift+R)
2. Disable service worker temporarily
3. Check if CDN/proxy caching
4. Verify nginx cache headers

### Scenario 4: Translations Missing in Build
**Solution:**
1. Verify `src/Language.jsx` exists in repo
2. Check Dockerfile copies all source files
3. Rebuild with cache cleared
4. Check build logs for file copy confirmations

---

## 📱 QUICK TEST COMMANDS

### Test from Command Line:
```bash
# Check if site is up
curl https://2sweety.com

# Check if specific commit is deployed (look for commit hash in HTML)
curl -s https://2sweety.com | grep -i "version\|commit"

# Test API connectivity
curl https://api.2sweety.com/api/health
```

### Test in Browser Console:
```javascript
// Check if i18next is initialized
console.log(window.i18next);

// Check current language
localStorage.getItem('i18nextLng');

// Check available languages
console.log(Object.keys(window.i18next.options.resources));

// Force language change
window.i18next.changeLanguage('tr');
```

---

## 🆘 EMERGENCY ROLLBACK

If deployment breaks site completely:

```bash
1. Go to Coolify → Deployments
2. Find last working deployment
3. Click "Rollback to this version"
4. Wait for rollback to complete
5. Verify site is working
```

---

## ✅ VERIFICATION CHECKLIST

After any fix, verify ALL of these:

```
□ Site loads at https://2sweety.com
□ No errors in browser console
□ Language selector visible
□ Can switch to at least 3 different languages
□ UI text changes when language changes
□ Language persists after page refresh
□ Images and assets loading correctly
□ Login/authentication working
□ API calls succeeding (check Network tab)
```

---

## 📞 WHEN TO ESCALATE

Contact Coolify support if:
- ❌ Rebuild fails repeatedly with same error
- ❌ Webhook never triggers despite configuration
- ❌ Container starts but immediately crashes
- ❌ Build succeeds but container won't start
- ❌ Logs show server-level errors (out of memory, disk full)

---

## 💡 PREVENTION - Setup for Future

To prevent this issue recurring:

```bash
□ Set up Coolify build notifications (email/Slack)
□ Enable GitHub Actions (already configured)
□ Add deployment status badge to README
□ Schedule periodic deployment tests
□ Monitor webhook delivery success rate
□ Keep this checklist handy for troubleshooting
```

---

## 🔗 RELATED DOCUMENTS

For more details, see:
- `COOLIFY_DEPLOYMENT_VERIFICATION.md` - Complete deployment guide
- `.env.coolify` - Environment variables reference
- `Dockerfile` - Build configuration
- `.github/workflows/deploy-coolify.yml` - CI/CD workflow

---

**Priority Order:**
1. Force Coolify rebuild (5 min)
2. Check webhook (2 min)
3. Verify environment variables (5 min)
4. Test language switching (2 min)

**Total Time to Fix:** ~15 minutes if standard rebuild works

**Last Updated:** November 6, 2025
