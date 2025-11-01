# BUG_FIXING_GUIDE.md - Systematic Debugging Strategies

## Bug Severity Classification

### 🔴 Critical (P0) - Fix Immediately
- App crashes or won't start
- Payment/subscription failures  
- Data loss or corruption
- Security vulnerabilities
- Complete feature breakage

### 🟡 Major (P1) - Fix Within 24h
- Feature partially broken
- Performance degradation >50%
- UI breaking on specific devices
- Incorrect business logic

### 🟢 Minor (P2) - Fix Within Sprint
- Visual glitches
- Minor UX issues
- Edge case errors
- Non-critical warnings

## Debugging Workflow

### 1. Reproduce the Bug

```typescript
// Create minimal reproduction
const BugRepro = () => {
  // Remove all unrelated code
  // Focus on the exact failing scenario
  const [state, setState] = useState();
  
  // Add console logs at each step
  console.log('Step 1: Initial state', state);
  
  const triggerBug = () => {
    console.log('Step 2: Before action');
    // Action that causes bug
    console.log('Step 3: After action', state);
  };
  
  return <button onClick={triggerBug}>Trigger Bug</button>;
};
```

### 2. Isolate the Problem

#### Frontend Debugging
```typescript
// Enable debug mode
localStorage.setItem('debug', 'true');

// Add breakpoints in DevTools
debugger; // Execution will pause here

// Use React DevTools
// - Check component props/state
// - Profile for performance issues
// - Track re-renders

// Network inspection
console.log('Request:', { url, headers, body });
console.log('Response:', { status, data, error });
```

#### Backend Debugging
```typescript
// server/index.ts - Add debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, {
    body: req.body,
    query: req.query,
    user: req.user?.id
  });
  next();
});

// Add timing logs
console.time('database-query');
const result = await supabase.from('profiles').select();
console.timeEnd('database-query');
```

### 3. Common Bug Patterns & Fixes

#### A. State Update Issues

**Bug**: State not updating / stale closure
```typescript
// ❌ Problem
const [count, setCount] = useState(0);
const increment = () => {
  setCount(count + 1); // Uses stale value
  setCount(count + 1); // Still uses stale value
};

// ✅ Solution
const increment = () => {
  setCount(prev => prev + 1); // Uses latest value
  setCount(prev => prev + 1); // Uses latest value
};
```

**Bug**: Race conditions in async operations
```typescript
// ❌ Problem
const [data, setData] = useState(null);
useEffect(() => {
  fetchData().then(setData); // May set wrong data if called multiple times
}, [id]);

// ✅ Solution
useEffect(() => {
  let cancelled = false;
  
  fetchData().then((result) => {
    if (!cancelled) {
      setData(result);
    }
  });
  
  return () => { cancelled = true; };
}, [id]);
```

#### B. Database & RLS Issues

**Bug**: "Permission denied" errors
```sql
-- Debug RLS policies
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims.sub TO 'user-id-here';

-- Test the query that's failing
SELECT * FROM profiles WHERE id = 'user-id-here';

-- Check which policy is blocking
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';
```

**Bug**: Subscription data inconsistency
```typescript
// Check both tables
const debugSubscription = async (userId: string) => {
  // Profile table
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_tier, subscription_status')
    .eq('id', userId)
    .single();
    
  // Subscription table
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('current', true)
    .single();
    
  console.log('Mismatch?', {
    profile,
    subscription,
    match: profile?.subscription_tier === subscription?.tier
  });
};
```

#### C. Real-time Connection Issues

**Bug**: WebSocket disconnections
```typescript
// Add reconnection logic
class ReconnectingWebSocket {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  
  connect() {
    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      this.scheduleReconnect();
    }
  }
  
  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
      console.log(`Reconnecting in ${delay}ms...`);
      
      setTimeout(() => {
        this.reconnectAttempts++;
        this.connect();
      }, delay);
    }
  }
}
```

#### D. Memory Leaks

**Bug**: Component memory leaks
```typescript
// ❌ Problem - Subscriptions not cleaned up
useEffect(() => {
  const subscription = supabase
    .channel('test')
    .on('postgres_changes', { event: '*' }, handler)
    .subscribe();
    
  // Missing cleanup!
}, []);

// ✅ Solution
useEffect(() => {
  const channel = supabase.channel('test');
  const subscription = channel
    .on('postgres_changes', { event: '*' }, handler)
    .subscribe();
    
  return () => {
    channel.unsubscribe();
  };
}, []);

// Memory leak detection
if (process.env.NODE_ENV === 'development') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    trackAllPureComponents: true,
    logOnDifferentValues: true
  });
}
```

### 4. Advanced Debugging Techniques

#### Performance Profiling
```typescript
// React DevTools Profiler
// 1. Open React DevTools
// 2. Go to Profiler tab
// 3. Click record
// 4. Perform the slow action
// 5. Stop recording
// 6. Analyze flame graph

// Manual performance marks
performance.mark('myFeature-start');
// ... code to measure
performance.mark('myFeature-end');
performance.measure('myFeature', 'myFeature-start', 'myFeature-end');

const measure = performance.getEntriesByName('myFeature')[0];
console.log(`Feature took ${measure.duration}ms`);
```

#### Network Debugging
```typescript
// Intercept all Supabase requests
const originalFrom = supabase.from;
supabase.from = function(...args) {
  console.log('Supabase query:', args);
  const query = originalFrom.apply(this, args);
  
  // Intercept select
  const originalSelect = query.select;
  query.select = function(...selectArgs) {
    console.log('Select:', selectArgs);
    return originalSelect.apply(this, selectArgs);
  };
  
  return query;
};
```

#### Database Query Analysis
```sql
-- Enable query timing
\timing on

-- Analyze query performance
EXPLAIN ANALYZE
SELECT p.*, 
       COUNT(DISTINCT m.id) as match_count
FROM profiles p
LEFT JOIN matches m ON (m.user1_id = p.id OR m.user2_id = p.id)
WHERE p.is_active = true
GROUP BY p.id;

-- Find slow queries
SELECT 
  query,
  mean_exec_time,
  calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

## Bug Fix Verification

### 1. Unit Testing (Informal)
```typescript
// Quick test in browser console
async function testFix() {
  // Setup
  const testUser = { id: 'test-123', name: 'Test User' };
  
  // Execute
  const result = await yourFunction(testUser);
  
  // Verify
  console.assert(result.success === true, 'Expected success');
  console.assert(result.data.id === testUser.id, 'ID mismatch');
  
  console.log('✅ All tests passed');
}

testFix();
```

### 2. Regression Testing
```typescript
// Create a test checklist
const regressionTests = [
  { test: 'User can log in', status: '⏳' },
  { test: 'Profile loads correctly', status: '⏳' },
  { test: 'Swipe cards appear', status: '⏳' },
  { test: 'Chat messages send', status: '⏳' },
  { test: 'Subscription features work', status: '⏳' }
];

// Run through each manually
regressionTests.forEach((test, i) => {
  console.log(`${i + 1}. ${test.test}: ${test.status}`);
});
```

### 3. Production Verification
```bash
# Deploy to staging first
git checkout -b fix/bug-description
# ... make fixes
git push origin fix/bug-description

# After staging verification
git checkout main
git merge fix/bug-description
git push origin main

# Monitor production logs
tail -f /var/log/2sweety/app.log | grep ERROR
```

## Emergency Hotfixes

### Database Corruption
```sql
-- Emergency user data recovery
CREATE TABLE profiles_backup AS 
SELECT * FROM profiles;

-- Fix corrupted data
UPDATE profiles
SET subscription_tier = 'registered'
WHERE subscription_tier IS NULL;

-- Verify fix
SELECT COUNT(*) 
FROM profiles 
WHERE subscription_tier IS NULL;
```

### Payment System Down
```typescript
// Temporary manual subscription activation
const emergencyActivateSubscription = async (userEmail: string, tier: string) => {
  const { data: user } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', userEmail)
    .single();
    
  if (!user) throw new Error('User not found');
  
  // Manual activation
  await supabase
    .from('profiles')
    .update({
      subscription_tier: tier,
      subscription_status: 'active',
      // 30 days from now
      subscription_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    })
    .eq('id', user.id);
    
  // Log for reconciliation
  await supabase
    .from('manual_activations')
    .insert({
      user_id: user.id,
      tier,
      reason: 'Payment system outage',
      activated_by: 'admin',
      activated_at: new Date()
    });
};
```

### Complete System Recovery
```bash
#!/bin/bash
# emergency-recovery.sh

echo "🚨 Starting emergency recovery..."

# 1. Restore database from backup
pg_restore -h localhost -U postgres -d sweety_db latest_backup.dump

# 2. Clear all caches
redis-cli FLUSHALL

# 3. Restart all services
docker-compose restart

# 4. Run health checks
curl http://localhost:3000/health
curl http://localhost:3001/health

echo "✅ Recovery complete"
```

## Prevention Strategies

1. **Add Defensive Checks**
```typescript
// Always validate inputs
if (!userId || typeof userId !== 'string') {
  throw new Error('Invalid userId');
}

// Check for null/undefined
const name = profile?.name ?? 'Anonymous';

// Verify array operations
if (Array.isArray(items) && items.length > 0) {
  // Safe to operate on array
}
```

2. **Error Boundaries**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Component error:', error, errorInfo);
    // Log to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

3. **Monitoring & Alerts**
```typescript
// Client-side error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to logging service
});

// Unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise:', event.reason);
});
```