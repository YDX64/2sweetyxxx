# TROUBLESHOOTING.md - Common Issues & Solutions

## Quick Diagnostics

### 🔴 Critical Issues (App Won't Start)

#### 1. Database Connection Failed
**Symptoms**: `ECONNREFUSED` or `password authentication failed`
```bash
# Check if using local DB
echo $DATABASE_URL

# For local development
docker-compose up -d
npm run db:push

# For Supabase
# Verify .env has correct SUPABASE_URL and keys
```

#### 2. Missing Environment Variables
**Symptoms**: `TypeError: Cannot read properties of undefined`
```bash
# Check required vars
cat .env | grep SUPABASE
cat .env | grep STRIPE

# Minimum required:
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

#### 3. Port Already in Use
**Symptoms**: `EADDRINUSE: address already in use`
```bash
# Find and kill process
lsof -i :3000  # or :3001 for WebSocket
kill -9 <PID>

# Or change port
PORT=3002 npm run dev
```

### 🟡 Authentication Issues

#### 1. OAuth Redirect Error
**Symptoms**: "Redirect URI mismatch" after OAuth login
- Go to Supabase Dashboard → Authentication → URL Configuration
- Add your local/production URLs to "Redirect URLs"
- Format: `http://localhost:5173/auth/callback`

#### 2. Session Expired / Invalid User
**Symptoms**: User logged out unexpectedly
```typescript
// Force refresh session
const { data: { session }, error } = await supabase.auth.refreshSession();
if (error) {
  await supabase.auth.signOut();
  window.location.href = '/';
}
```

#### 3. RLS Policy Violations
**Symptoms**: `new row violates row-level security policy`
```sql
-- Check user's role
SELECT * FROM user_roles WHERE user_id = 'USER_ID';

-- Check if user has permission
SELECT * FROM profiles WHERE id = 'USER_ID';
```

### 🟡 Subscription Issues

#### 1. Stripe Webhook Not Working
**Symptoms**: Payments succeed but subscription not updated
```bash
# Test webhook locally
stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook

# Check Edge Function logs in Supabase Dashboard
```

#### 2. Subscription Limits Not Enforced
**Symptoms**: Users exceeding daily limits
```sql
-- Check usage tracking
SELECT * FROM daily_usage WHERE user_id = 'USER_ID' AND date = CURRENT_DATE;

-- Reset usage manually
DELETE FROM daily_usage WHERE user_id = 'USER_ID' AND date = CURRENT_DATE;
```

#### 3. Feature Gates Not Working
**Symptoms**: Premium features accessible to free users
```typescript
// Debug feature gate
const userTier = profile?.subscription_tier || 'registered';
console.log('User tier:', userTier);
console.log('Feature requires:', requiredTier);
```

### 🟡 Real-time Features

#### 1. Chat Messages Not Sending
**Symptoms**: Messages stay in "sending" state
```bash
# Check WebSocket server
curl http://localhost:3001/health

# Check browser console for WebSocket errors
# Should see: "WebSocket connected"
```

#### 2. Matches Not Showing Real-time
**Symptoms**: Need to refresh to see new matches
```typescript
// Check Supabase realtime subscription
const subscription = supabase
  .channel('matches')
  .on('postgres_changes', { 
    event: 'INSERT', 
    schema: 'public', 
    table: 'matches' 
  }, console.log)
  .subscribe();
```

#### 3. Video Calls Failing
**Symptoms**: "Failed to establish connection"
- Check browser permissions for camera/microphone
- Verify STUN/TURN servers in WebRTC config
- Check firewall settings

### 🟢 Performance Issues

#### 1. Slow Profile Loading
**Symptoms**: Swipe cards take long to load
```sql
-- Check if indexes exist
\d profiles

-- Add missing indexes
CREATE INDEX idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX idx_profiles_active ON profiles(is_active);
```

#### 2. Image Upload Timeout
**Symptoms**: "Upload failed" after selecting photo
```typescript
// Increase timeout in uploadPhoto function
const { data, error } = await supabase.storage
  .from('profiles')
  .upload(fileName, file, {
    cacheControl: '3600',
    upsert: false,
    // Add timeout
    httpOptions: { timeout: 60000 }
  });
```

#### 3. Memory Leaks
**Symptoms**: App becomes sluggish over time
```typescript
// Check for unsubscribed listeners
useEffect(() => {
  const subscription = supabase.channel('test').subscribe();
  
  // IMPORTANT: Cleanup
  return () => {
    subscription.unsubscribe();
  };
}, []);
```

## Debug Commands

### Database Queries
```sql
-- Check user's complete state
SELECT 
  p.*,
  ur.role,
  array_agg(DISTINCT s.tier) as subscription_history
FROM profiles p
LEFT JOIN user_roles ur ON p.id = ur.user_id
LEFT JOIN subscriptions s ON p.id = s.user_id
WHERE p.id = 'USER_ID'
GROUP BY p.id, ur.role;

-- Check today's usage
SELECT * FROM daily_usage 
WHERE user_id = 'USER_ID' 
AND date = CURRENT_DATE;

-- Recent errors
SELECT * FROM error_logs 
ORDER BY created_at DESC 
LIMIT 20;
```

### Browser Console Commands
```javascript
// Get current user
const user = (await window.supabase.auth.getUser()).data.user;
console.log(user);

// Check subscription
const profile = await window.getProfile();
console.log('Tier:', profile.subscription_tier);

// Force refresh
window.location.reload(true);
```

### Server Logs
```bash
# Development logs
npm run dev 2>&1 | tee debug.log

# Production logs (Coolify)
docker logs 2sweety-app --tail 100 -f

# Supabase logs
# Go to Dashboard → Logs → Edge Functions
```

## Emergency Fixes

### Reset User Subscription
```sql
-- Set user to specific tier
UPDATE profiles 
SET subscription_tier = 'silver',
    subscription_status = 'active'
WHERE id = 'USER_ID';

-- Also update subscriptions table
UPDATE subscriptions
SET tier = 'silver',
    status = 'active',
    expires_at = NOW() + INTERVAL '30 days'
WHERE user_id = 'USER_ID'
AND current = true;
```

### Clear Cache & State
```javascript
// Client-side
localStorage.clear();
sessionStorage.clear();
await supabase.auth.signOut();
window.location.href = '/';
```

### Rebuild Search Indexes
```sql
-- Reindex all tables
REINDEX TABLE profiles;
REINDEX TABLE swipes;
REINDEX TABLE matches;
VACUUM ANALYZE;
```

## Prevention Strategies

1. **Always test locally first** with Docker PostgreSQL
2. **Monitor Supabase Dashboard** for errors and usage
3. **Set up error tracking** (Sentry recommended)
4. **Regular database backups** via GitHub Actions
5. **Load test before major releases**

## Getting Help

1. Check browser console for client errors
2. Check Network tab for failed requests  
3. Review Supabase logs for server errors
4. Search closed GitHub issues
5. Enable debug mode: `localStorage.setItem('debug', 'true')`