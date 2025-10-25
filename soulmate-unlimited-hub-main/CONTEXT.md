# CONTEXT.md - 2Sweety Project Context

## Project Overview

2Sweety is a production-ready dating application with complex features including real-time messaging, video calls, subscription tiers, and AI-powered matching. The codebase has evolved through multiple iterations with careful attention to performance, security, and user experience.

## Key Architectural Decisions

### 1. Database Architecture
- **Supabase as Primary Database**: Chosen for real-time capabilities, built-in auth, and RLS
- **Local PostgreSQL Option**: Docker setup available for offline development
- **Hybrid Approach**: Can switch between Supabase and local DB via environment variables

### 2. Authentication Strategy
- **Supabase Auth**: Handles OAuth providers (Google, Apple, Facebook)
- **Role-Based Access**: Hierarchical system (registered → silver → gold → platinum → moderator → admin)
- **Session Management**: Auto-refresh with network monitoring and retry logic

### 3. Real-time Architecture
- **WebSocket Server**: Custom implementation for chat messages
- **Supabase Realtime**: Database change subscriptions
- **WebRTC**: Peer-to-peer video calls with Supabase as signaling server

### 4. Payment Integration
- **Stripe**: Subscription management with webhooks
- **Edge Functions**: Handle payment webhooks securely
- **Manual Fallbacks**: Admin panel for manual subscription management

## Critical System Components

### Subscription System
```
Tiers: registered → silver → gold → platinum
Features progressively unlock:
- Daily swipe limits
- See who likes you
- Boost profile
- Rewind last swipe
- Advanced filters
```

### Matching Algorithm
- Location-based with configurable radius
- Preference matching (age, gender, interests)
- Boost system affects visibility
- Already swiped profiles filtered out

### Performance Optimizations
- Image compression with Sharp
- Virtual scrolling for large lists
- Database query optimization with indexes
- Lazy loading for media content
- Code splitting by route

## Known Technical Debt

1. **No Automated Tests**: Manual testing only via dedicated test pages
2. **Translation Completeness**: Some languages may have missing keys
3. **Mobile App**: Separate React Native app in `/swipematch` not fully integrated
4. **Error Boundaries**: Limited error recovery in some components
5. **WebSocket Reconnection**: Could be more robust in poor network conditions

## Environment Variables

### Critical Variables
```
SUPABASE_URL          # Required for database
SUPABASE_ANON_KEY     # Public client key
SUPABASE_SERVICE_ROLE_KEY  # Backend only - NEVER expose
STRIPE_SECRET_KEY     # Payment processing
STRIPE_WEBHOOK_SECRET # Webhook validation
```

### Feature Flags (Environment-based)
```
USE_LOCAL_DB         # Switch to local PostgreSQL
ENABLE_WEBSOCKETS    # Real-time chat
ENABLE_VIDEO_CALLS   # WebRTC features
```

## Data Privacy & Security

### User Data
- Photos stored in Supabase Storage with public URLs
- Personal data protected by RLS policies
- Location data used for matching but not exposed
- Chat messages encrypted in transit

### Security Measures
- Content moderation for uploaded images
- Rate limiting on API endpoints
- CORS properly configured
- Security monitoring middleware
- SQL injection prevention via parameterized queries

## Common Gotchas

1. **RLS Policies**: Can cause "permission denied" errors if not properly configured
2. **Subscription Sync**: Manual interventions may break webhook sync
3. **OAuth Redirects**: Must be configured in Supabase Dashboard
4. **Edge Function Secrets**: Different from main app environment
5. **WebSocket CORS**: Requires special handling for production

## Development Workflow

### Feature Development
1. Check existing patterns in similar features
2. Create service layer functions first
3. Implement UI with existing components
4. Add translations for all languages
5. Test with appropriate user roles

### Database Changes
1. Create migration with RLS policies
2. Test locally first
3. Apply to Supabase
4. Update TypeScript types
5. Test all affected features

### Debugging Production Issues
1. Check Supabase logs first
2. Verify RLS policies
3. Check browser console for client errors
4. Review Edge Function logs for payment issues
5. Use admin panel for user-specific issues

## Integration Points

### External Services
- **Stripe**: Payments and subscriptions
- **Supabase**: Database, auth, storage, realtime
- **Google Maps API**: Location services (optional)
- **SendGrid**: Email notifications (optional)

### Internal Services
- **WebSocket Server**: Port 3001 for chat
- **Express API**: Main backend
- **Vite Dev Server**: Frontend development
- **Redis**: Session storage (production)