# DATA_FLOW.md - System Data Flow Documentation

## Overview

This document traces how data flows through the 2Sweety application, from user actions to database updates and real-time notifications.

## Core Data Flows

### 1. User Registration & Onboarding

```mermaid
User Input → React Form → Supabase Auth → Database → Profile Creation
                ↓                              ↓
          Form Validation              Trigger: create_user_role
                                              ↓
                                      Role Assignment (registered)
```

**Detailed Flow:**
1. User fills registration form (`AuthForm.tsx`)
2. Supabase Auth creates auth.users entry
3. Database trigger creates profiles entry
4. Another trigger assigns 'registered' role
5. User redirected to onboarding flow
6. Onboarding data updates profile
7. Age/gender locked after completion

**Key Files:**
- `client/src/components/AuthForm.tsx`
- `client/src/components/onboarding/OnboardingFlow.tsx`
- `supabase/migrations/*_create_user_role_trigger.sql`

### 2. Swipe & Match Flow

```mermaid
Swipe Action → Swipe Service → Database → Match Check → Real-time Events
      ↓              ↓             ↓           ↓              ↓
  UI Update    Usage Tracking   Store    If Match      Notifications
                               Swipe     Create Match   Both Users
```

**Detailed Flow:**
1. User swipes on profile (`SwipeInterface.tsx`)
2. `swipeService.createSwipe()` called
3. Checks daily limits via `daily_usage` table
4. Creates swipe record in database
5. Database function checks for mutual swipe
6. If match, creates match record
7. Real-time events notify both users
8. Match celebration UI shown

**Key Components:**
```typescript
// Swipe creation
await supabase.from('swipes').insert({
  user_id,
  target_user_id,
  direction,
  created_at: new Date()
});

// Match detection (database function)
CREATE FUNCTION check_match_on_swipe()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'right' THEN
    IF EXISTS (
      SELECT 1 FROM swipes 
      WHERE user_id = NEW.target_user_id 
      AND target_user_id = NEW.user_id 
      AND direction = 'right'
    ) THEN
      INSERT INTO matches (user1_id, user2_id)
      VALUES (NEW.user_id, NEW.target_user_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
```

### 3. Chat Message Flow

```mermaid
Message Input → WebSocket → Server → Database → WebSocket Broadcast
       ↓            ↓         ↓         ↓              ↓
   Encryption   Auth Check  Store   Update      Deliver to Recipient
              Validation  Message  last_message    Real-time
```

**Detailed Flow:**
1. User types message in `ChatInterface.tsx`
2. Message sent via WebSocket connection
3. Server validates user and match
4. Message stored in database
5. Match record updated with timestamp
6. Message broadcast to recipient
7. UI updates for both users

**WebSocket Message Format:**
```typescript
{
  type: 'message',
  matchId: string,
  content: string,
  senderId: string,
  timestamp: Date
}
```

### 4. Subscription & Payment Flow

```mermaid
Stripe Checkout → Payment → Webhook → Edge Function → Database Update
        ↓            ↓         ↓           ↓              ↓
    User Info    Process   Validate    Process      Update Profile
                Payment    Signature    Event     Update Subscription
                                                  Sync Usage Limits
```

**Detailed Flow:**
1. User clicks upgrade (`UpgradesPage.tsx`)
2. `create-checkout` Edge Function called
3. Stripe checkout session created
4. User completes payment
5. Stripe sends webhook
6. `stripe-webhook` Edge Function processes
7. Updates both profiles and subscriptions tables
8. Daily limits reset for new tier
9. UI reflects new features immediately

**Critical Sync Points:**
```typescript
// Edge Function updates
await supabase.rpc('update_user_subscription', {
  p_user_id: userId,
  p_tier: tier,
  p_status: 'active'
});

// This RPC updates both:
// - profiles.subscription_tier
// - subscriptions table
```

### 5. Profile Discovery Flow

```mermaid
Load Profiles → Apply Filters → Exclude Swiped → Sort by Distance → Cache
      ↓              ↓               ↓                ↓              ↓
   Database      Preferences    Already Seen      Geolocation    Memory
   Query         & Settings      Profiles         Algorithm      Storage
```

**Query Pipeline:**
```sql
SELECT * FROM profiles p
WHERE 
  -- Active users only
  p.is_active = true
  -- Not already swiped
  AND NOT EXISTS (
    SELECT 1 FROM swipes s 
    WHERE s.user_id = $1 
    AND s.target_user_id = p.id
  )
  -- Age preferences
  AND p.age BETWEEN $2 AND $3
  -- Gender preferences
  AND p.gender = ANY($4)
  -- Location radius (using PostGIS)
  AND ST_DWithin(
    p.location::geography,
    ST_MakePoint($5, $6)::geography,
    $7 * 1609.34  -- miles to meters
  )
  -- Boost priority
ORDER BY 
  p.is_boosted DESC,
  p.last_active DESC
LIMIT 10;
```

### 6. Real-time Notification Flow

```mermaid
Database Change → Supabase Realtime → Client Subscription → UI Update
       ↓                  ↓                    ↓              ↓
   Trigger           Broadcast            Filter by       Show Toast
   Event            to Clients            User ID        Update Badge
```

**Subscription Setup:**
```typescript
// Match notifications
supabase
  .channel('matches')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'matches',
    filter: `user1_id=eq.${userId},user2_id=eq.${userId}`
  }, (payload) => {
    showMatchNotification(payload.new);
  })
  .subscribe();

// Message notifications
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `recipient_id=eq.${userId}`
  }, (payload) => {
    showMessageNotification(payload.new);
  })
  .subscribe();
```

## Data Storage Patterns

### 1. User Profile Data
```typescript
profiles: {
  id: UUID (auth.users reference)
  name: string
  photos: string[] (Supabase Storage URLs)
  bio: text
  location: POINT (PostGIS)
  preferences: JSONB
  subscription_tier: enum
  created_at: timestamp
  updated_at: timestamp
}
```

### 2. Activity Tracking
```typescript
daily_usage: {
  user_id: UUID
  date: DATE
  swipes_used: integer
  likes_used: integer
  super_likes_used: integer
  messages_sent: integer
  created_at: timestamp
}

// Reset daily at midnight UTC
CREATE OR REPLACE FUNCTION reset_daily_usage()
```

### 3. Media Storage
- Profile photos: Supabase Storage `/profiles/{userId}/{filename}`
- Compressed versions: Server-side with Sharp
- CDN URLs for performance
- Max 6 photos per user

## Caching Strategy

### 1. Client-Side Caching
```typescript
// TanStack Query caching
queryClient.setDefaultOptions({
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  }
});

// Key cache points:
// - User profile (until edited)
// - Matches list (5 min)
// - Discovery profiles (until swiped)
// - Subscription status (until changed)
```

### 2. Server-Side Caching
```typescript
// Redis for session data
const session = {
  secret: process.env.SESSION_SECRET,
  store: new RedisStore({ client: redisClient }),
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  }
};
```

## Performance Optimizations

### 1. Database Indexes
```sql
-- Critical indexes for performance
CREATE INDEX idx_profiles_location ON profiles USING GIST (location);
CREATE INDEX idx_swipes_user_target ON swipes (user_id, target_user_id);
CREATE INDEX idx_messages_match_created ON messages (match_id, created_at DESC);
CREATE INDEX idx_daily_usage_user_date ON daily_usage (user_id, date);
```

### 2. Query Optimization
- Batch profile fetches (10-20 at a time)
- Cursor-based pagination for messages
- Aggregate counts in database, not client
- Use database views for complex queries

### 3. Real-time Optimization
- Channel-based subscriptions (not global)
- Filter at database level
- Debounce UI updates
- Batch notification processing

## Security Considerations

### Data Access Control
1. **RLS Policies**: Every table has row-level security
2. **Service Role**: Only Edge Functions use service role
3. **User Context**: All queries filtered by auth.uid()
4. **Admin Override**: Special policies for admin/moderator

### Sensitive Data Handling
- Passwords: Handled by Supabase Auth (bcrypt)
- Payment info: Never stored, only Stripe tokens
- Location: Approximate only, never exact
- Personal info: Encrypted at rest in database

## Monitoring & Debugging

### Key Metrics to Track
1. **Database Performance**
   - Query execution time
   - Connection pool usage
   - Index hit rate

2. **Real-time Health**
   - WebSocket connections
   - Message delivery rate
   - Subscription lag

3. **User Activity**
   - Daily active users
   - Swipe/match rates
   - Message volume

### Debug Queries
```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Slow queries
SELECT query, mean_exec_time, calls 
FROM pg_stat_statements 
ORDER BY mean_exec_time DESC LIMIT 10;

-- Table sizes
SELECT relname, pg_size_pretty(pg_total_relation_size(relid))
FROM pg_stat_user_tables 
ORDER BY pg_total_relation_size(relid) DESC;
```