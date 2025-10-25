# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ IMPORTANT: MCP Usage Required
**MUST READ**: See `MCP_USAGE_RULES.md` for mandatory MCP (Model Context Protocol) usage guidelines.
- Always use Context7 MCP for latest documentation
- Always use Supabase MCP for database operations
- Never use outdated code patterns

## Development Commands

### Core Commands
- **Development**: `npm run dev` - Starts Express backend server with Vite frontend
- **Build**: `npm run build` - Builds frontend with Vite and bundles backend with esbuild
- **Production**: `npm start` - Runs the production server
- **Type Check**: `npm run check` - TypeScript type checking
- **Database Push**: `npm run db:push` - Applies database schema changes via Drizzle

### Environment Setup
1. Node.js version: >=20.0.0 required
2. Copy `env.example` to `.env` and configure:
   - `SUPABASE_SERVICE_ROLE_KEY`: Get from Supabase Dashboard > Settings > API
   - `STRIPE_SECRET_KEY`: For payment processing (optional for dev)
   - `DATABASE_URL`: Already configured in env.example
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`

### Authentication Setup
- **Supabase OAuth Providers**: Must be enabled in Supabase Dashboard
  - Google: Settings > Authentication > Providers > Google
  - Apple: Settings > Authentication > Providers > Apple
  - Facebook: Settings > Authentication > Providers > Facebook
- **Redirect URLs**: Configure in provider settings to match your domain

## Architecture Overview

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + TypeScript
- **Database**: Supabase (PostgreSQL) + Drizzle ORM
- **State Management**: TanStack Query (React Query)
- **UI Components**: Radix UI with shadcn/ui pattern
- **Styling**: Tailwind CSS
- **Real-time**: WebSockets + Supabase Realtime
- **Payments**: Stripe
- **i18n**: i18next with 17 languages

### Key Architectural Patterns

#### 1. Component Organization (client/src/components/)
- Feature-based folders (chat/, profile/, subscription/, etc.)
- Shared UI components in ui/ following shadcn pattern
- Custom hooks co-located with features

#### 2. Service Layer (client/src/services/)
- All API calls centralized in service files
- Consistent error handling and typing
- Direct database queries for critical operations

#### 3. Authentication & Authorization
- Supabase Auth with JWT tokens
- Role-based access: registered → silver → gold → platinum → moderator → admin
- Protected routes check roles/permissions before rendering
- RLS policies enforce backend security

#### 4. Subscription System
- 6 tiers with progressive feature unlocking
- Daily usage limits tracked in database
- Feature gating via useFeatureGate hook
- Stripe for payment processing

#### 5. Real-time Features
- WebRTC for voice/video calls (using Supabase for signaling)
- WebSocket server for instant messaging
- Supabase Realtime for database change subscriptions

#### 6. State Management
- Server state: TanStack Query with optimistic updates
- Local state: React Context for auth, theme, language
- Form state: React Hook Form + Zod validation

### Critical Files & Patterns

#### Database Schema
- Migrations in `supabase/migrations/` define the complete schema
- RLS policies control row-level access
- Extensive indexing for performance (especially geolocation)

#### Type Safety
- Shared types in `client/src/types/`
- Database types generated from schema
- Strict TypeScript throughout

#### Security Considerations
- Never expose Supabase service role key
- All sensitive operations go through RLS
- Content moderation service for uploads
- Security monitoring middleware

#### Performance Patterns
- Image compression on upload
- Lazy loading for media content
- Database query optimization with proper indexes
- Code splitting for routes

### Common Development Tasks

#### Adding New Features
1. Check existing patterns in similar features
2. Create service functions in appropriate service file
3. Use TanStack Query for data fetching
4. Follow existing component structure
5. Add translations to all language files

#### Working with Subscriptions
- Check `subscriptionService.ts` for tier logic
- Use `useFeatureGate` hook for UI gating
- Update `subscriptionLimits.ts` for new limits

#### Database Changes
1. Create migration in `supabase/migrations/`
2. Include RLS policies in migration
3. Run `npm run db:push` to apply
4. Update TypeScript types if needed

#### Deployment
- Supports Vercel, Railway, Coolify
- See deployment guides in root directory
- Environment variables required for each platform

### Testing Approach
- No test framework currently configured
- Manual testing via dedicated test pages
- Subscription test pages for payment flow validation

### Important Conventions
- Use existing UI components from ui/ folder
- Follow established error handling patterns
- Maintain TypeScript strict mode compliance
- Keep translations synchronized across all languages
- Respect the existing color scheme and theme system

## GitHub Actions & Backup System

### Automated Workflows
The project includes comprehensive GitHub Actions workflows for backup and recovery:

#### 1. Continuous Backup (`.github/workflows/backup.yml`)
- **Triggers**: Daily at 2 AM UTC + on push to main
- **Creates**: Full/incremental backups as GitHub releases
- **Retention**: 30 days
- **Manual trigger**: Actions tab → Run workflow

#### 2. Pre-Deployment Backup (`.github/workflows/pre-deploy-backup.yml`)
- **Triggers**: On PRs and before deployments
- **Creates**: Deployment snapshots with health checks
- **Storage**: GitHub artifacts (14 days retention)

#### 3. Database Backup (`.github/workflows/database-backup.yml`)
- **Triggers**: Daily at 3 AM UTC
- **Backs up**: Schema, migrations, RLS policies
- **Storage**: `database-backups` branch

#### 4. Emergency Recovery (`.github/workflows/emergency-recovery.yml`)
- **Purpose**: Disaster recovery from various sources
- **Options**: Restore from backup/tag/commit/database-only
- **Requires**: Manual confirmation ("CONFIRM")

### Local Backup Scripts
- **Create backups**: `./scripts/github-backup.sh [full|code|database]`
- **Restore backups**: `./scripts/restore-backup.sh [options] <source>`
- **Verify backups**: `./backups/verify-backup.sh <backup-file>`

### Important Backup Practices
1. Before major changes: Create manual backup
2. After deployments: Verify automated backups succeeded
3. Test restoration: Monthly disaster recovery drills
4. Documentation: See `BACKUP_STRATEGY.md` and `DISASTER_RECOVERY.md`

## Change Checkpoints

### Checkpoint 1: Onboarding & Theme Fixes (2025-06-20)
**Fixed Issues:**
1. Database migration: Added missing `birth_date_locked` and `gender_locked` columns
2. Profile matching: Fixed gender value compatibility (handles both 'men/women' and 'male/female')
3. Onboarding completion: Fixed profile update failing due to missing columns
4. Theme colors: Replaced all black backgrounds with gray-900/gray-950 alternatives
5. Added Header/Footer to onboarding flow with dark mode support

**Files Modified:**
- `client/src/pages/Index.tsx` - Increased onboarding completion timeout to 2s
- `client/src/services/profileService.ts` - Added .select().single() for update verification
- `client/src/components/onboarding/hooks/useOnboardingLogic.tsx` - Improved error handling, removed lock fields
- `client/src/components/onboarding/OnboardingFlow.tsx` - Added Header/Footer, better error handling
- Multiple component files - Replaced black backgrounds with theme-aware grays

**Database Changes:**
- Migration: `add_missing_profile_lock_columns` - Added birth_date_locked and gender_locked columns

**Status:** Onboarding should now save properly without errors

### Checkpoint 2: Age & Gender Lock Implementation (2025-06-20)
**Purpose:** Prevent users from changing age and gender after onboarding (critical for dating app trust)

**Implementation:**
1. Database: Added `birth_date_locked` and `gender_locked` boolean columns via migration
2. Onboarding: Sets both fields to `true` when completing onboarding
3. Profile Editor UI: Disables age and gender fields when locked
4. Backend Protection: profileService filters out locked fields from updates

**Files Modified:**
- `client/src/components/profile/ProfileEditor.tsx` - Pass lock fields to BasicInfoCard
- `client/src/components/profile/sections/BasicInfoCard.tsx` - Disable inputs based on lock status
- `client/src/hooks/useProfileEditorLogic.tsx` - Export userProfile for lock field access
- `client/src/services/profileService.ts` - Filter out locked fields before database update
- `client/src/components/onboarding/hooks/useOnboardingLogic.tsx` - Set lock fields to true

**Security:** Even if someone bypasses UI, backend will reject updates to locked fields

### Checkpoint 3: RLS Infinite Recursion Fix (2025-06-20)
**Issue:** Database error "infinite recursion detected in policy for relation user_roles"

**Root Cause:** 
- `user_roles` table had a policy that checked admin status by querying itself
- This created a circular dependency causing infinite recursion

**Solution:**
1. Created `is_admin()` security definer function to check admin status without RLS
2. Updated all admin-related policies to use this function
3. This breaks the recursion chain

**Migration Applied:** `fix_user_roles_infinite_recursion`
- Dropped problematic policies
- Created `is_admin()` function
- Recreated policies using the function

**Files Modified:**
- Added more detailed logging to track onboarding flow
- `client/src/components/onboarding/OnboardingFlow.tsx` - Added timing logs
- `client/src/services/profileService.ts` - Added verification logs
- `client/src/pages/Index.tsx` - Added reload tracking logs

**Status:** Onboarding should now save without RLS errors

### Checkpoint 4: Relationship Type Constraint Fix (2025-06-20)
**Issue:** Database error "violates check constraint profiles_relationship_type_check"

**Root Cause:**
- Database constraint only accepts: 'casual', 'serious', 'marriage', 'friendship'
- Onboarding form used different values: 'long_term', 'short_term_fun', etc.

**Solution:**
- Added `mapRelationshipType()` function to convert onboarding values to database values
- Mapping:
  - 'long_term' → 'serious'
  - 'long_term_open_to_short' → 'serious'
  - 'short_term_open_to_long' → 'casual'
  - 'short_term_fun' → 'casual'
  - 'new_friends' → 'friendship'
  - 'still_figuring_out' → 'casual'

**Files Modified:**
- `client/src/components/onboarding/hooks/useOnboardingLogic.tsx` - Added mapping function

**Status:** Onboarding should now complete successfully with proper data transformation

### Checkpoint 5: Full Sync & Consistency Implementation (2025-06-20)
**Verification Results:**
- ✅ Onboarding completion working (user 'selin' successfully completed)
- ✅ Age/Gender locks applied correctly
- ✅ Relationship type mapping working
- ✅ Role assignment trigger added (all users have 'registered' role)
- ✅ Subscription system integrated

**Synchronization Enhancements:**
1. **Network Monitoring**: Added `useNetworkStatus` and `useSupabaseConnection` hooks
2. **Session Management**: Auto-refresh sessions before expiry
3. **Retry Logic**: 3 retries with exponential backoff for failed requests
4. **Manual Sync**: Added "Sync Data" button in user dropdown
5. **Cross-tab Sync**: Broadcast channel for multi-tab updates
6. **Connection Status**: Visual indicator for offline/connection issues

**Database Improvements:**
- Migration: `add_default_role_trigger_v2` - Auto-assigns 'registered' role to new users
- Fixed RLS infinite recursion with security definer functions
- All users now have proper roles and can use the platform

**Current Database State:**
- 10 users total
- 2 admin users
- 3 users with active subscriptions (2 Silver, 1 Gold)
- 1 user fully onboarded with locked age/gender

**Status:** Full synchronization between website and Supabase achieved

### Checkpoint 6: Post-Onboarding Navigation & Theme Consistency (2025-06-20)
**Changes Made:**
1. **Onboarding Redirect**: After completion, users are redirected to `/settings` instead of page reload
2. **Theme Color Consistency**: Updated all onboarding components to use consistent theme colors
   - Primary buttons: Pink gradient (`from-pink-500 to-red-500`)
   - Focus states: Pink ring (`focus:ring-pink-500`)
   - Progress indicators: Pink instead of yellow
   - Dark mode support: All components now properly support dark mode

**Color System Reference:**
- **Primary**: Pink/Rose (`hsl(340 82% 52%)`)
- **Buttons**: Pink gradient for primary, gray for secondary
- **Premium**: Yellow/Amber gradient for upgrade buttons only
- **Cards**: White (light) / Same as background (dark)
- **Borders**: Gray-200 (light) / Gray-700 (dark)
- **Text**: Gray-900 (light) / Gray-100 (dark)

**Components Updated:**
- OnboardingFlow.tsx - Pink theme, redirect to settings
- NameStep.tsx - Dark mode support
- BirthDateStep.tsx - Dark mode support
- GenderStep.tsx - Dark mode support
- RelationshipStep.tsx - Dark mode support
- PhotoStep.tsx - Dark mode support
- ConnectionStatus.tsx - Turkish translation, proper theme colors

**Status:** Onboarding flow now seamlessly integrates with the app's design system

### Checkpoint 7: Color Changes Rollback (2025-06-20)
**User Request**: Rollback all color changes, keep only functional improvements

**Changes Rolled Back:**
- Restored yellow colors in onboarding flow (buttons, focus states, progress)
- Removed all dark mode specific colors from onboarding steps
- Restored original ConnectionStatus component styling
- Kept functional improvements:
  - Redirect to /settings after onboarding ✅
  - All bug fixes and database improvements ✅
  - Synchronization enhancements ✅

**Important Note**: No color changes should be made without explicit user request