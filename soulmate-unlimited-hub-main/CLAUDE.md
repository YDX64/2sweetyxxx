# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

2Sweety is a full-featured dating application built with:
- **Frontend**: React 19 + TypeScript + Vite + TanStack Query
- **Backend**: Express.js + TypeScript  
- **Database**: Supabase (PostgreSQL) with Row-Level Security
- **Real-time**: WebSockets + Supabase Realtime
- **Payments**: Stripe integration
- **UI**: Radix UI + shadcn/ui components + Tailwind CSS
- **i18n**: React-i18next (17 languages)

## Development Commands

```bash
# Install dependencies (Node.js >=20.0.0 required)
npm install

# Development
npm run dev              # Start both frontend and backend
npm run dev:backend      # Backend only on port 3002
npm run dev:frontend     # Frontend only (Vite)
npm run dev:all          # Run backend and frontend concurrently

# Build & Production
npm run build            # Build frontend and bundle backend
npm run build:validate   # Build and check for test files
npm start                # Run production server

# Type checking
npm run check            # TypeScript type checking

# Database
npm run db:push          # Apply Drizzle schema changes
```

## Architecture & Patterns

### Directory Structure
```
client/src/
├── components/         # Feature-based organization
│   ├── chat/          # Chat-related components
│   ├── profile/       # Profile components
│   ├── subscription/  # Subscription features
│   ├── swipe/         # Swipe interface components
│   └── ui/            # Shared UI components (shadcn pattern)
├── services/          # API layer - all backend calls
├── hooks/             # Custom React hooks
├── types/             # TypeScript type definitions
└── i18n/locales/      # 17 language files

server/
├── routes/            # API endpoints
├── middleware/        # Auth, security, etc.
└── db/               # Database utilities

supabase/
├── migrations/        # Database schema migrations
└── functions/         # Edge Functions (Stripe webhooks)
```

### Key Architectural Patterns

1. **Service Layer Pattern**: All API calls go through `client/src/services/`
   - Consistent error handling
   - Type safety with TypeScript
   - Direct Supabase queries for critical operations

2. **Authentication & Authorization**
   - Supabase Auth with OAuth providers (Google, Apple, Facebook)
   - Role hierarchy: registered → silver → gold → platinum → moderator → admin
   - RLS policies enforce backend security
   - Protected routes check permissions before rendering

3. **Subscription System**
   - 6 tiers with progressive feature unlocking
   - Daily usage limits tracked in database
   - Feature gating via `useFeatureGate` hook
   - Stripe for payment processing

4. **Real-time Features**
   - WebRTC for voice/video calls
   - WebSocket server for instant messaging
   - Supabase Realtime for database subscriptions

5. **State Management**
   - Server state: TanStack Query with optimistic updates
   - Local state: React Context (auth, theme, language)
   - Form state: React Hook Form + Zod validation

## Environment Setup

1. Copy `env.example` to `.env`
2. Configure required variables:
   - `SUPABASE_URL` and `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (from Supabase Dashboard > Settings > API)
   - `STRIPE_SECRET_KEY` (optional for dev)
   - `DATABASE_URL` (for local development with Docker)

## Database & Migrations

- Schema defined in `supabase/migrations/`
- RLS policies control row-level access
- Key tables: profiles, swipes, matches, messages, subscriptions
- Extensive indexing for geolocation queries

### Working with Migrations
```bash
# Create new migration
supabase migration new <migration_name>

# Apply migrations
npm run db:push
```

## Common Development Tasks

### Adding New Features
1. Create service functions in appropriate `services/` file
2. Use TanStack Query for data fetching
3. Follow existing component patterns
4. Add translations to all 17 language files in `i18n/locales/`

### Working with Subscriptions
- Check `subscriptionService.ts` for tier logic
- Use `useFeatureGate` hook for UI feature gating
- Update `subscriptionLimits.ts` for new limits
- Test with dedicated subscription test pages

### Modifying Database Schema
1. Create migration in `supabase/migrations/`
2. Include RLS policies in the migration
3. Run `npm run db:push` to apply
4. Update TypeScript types if needed

## Important Conventions

- Use existing UI components from `components/ui/`
- Maintain TypeScript strict mode compliance
- Keep translations synchronized across all languages
- Follow existing error handling patterns in services
- Respect the theme system (dark/light mode support)

## Testing & Quality

- No automated test framework configured
- Manual testing via dedicated test pages in `pages/`
- Subscription flows tested via test pages
- Type safety enforced via TypeScript

## Deployment

Supports multiple platforms:
- **Coolify** (recommended) - See docker-compose files
- **Vercel** - Frontend deployment
- **Railway** - Full stack deployment
- **Traditional VPS** - Using Docker

### Docker Setup
```bash
# Development
docker-compose up

# Production
docker-compose -f docker-compose.production.yml up
```

## Security Considerations

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client code
- All sensitive operations use RLS policies
- Content moderation for uploaded images
- Security monitoring middleware in place
- CORS properly configured for production

## Performance Optimizations

- Image compression on upload (Sharp library)
- Lazy loading for media content
- Database queries optimized with indexes
- Code splitting by route
- Virtual scrolling for large lists