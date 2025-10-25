# Test File Exclusion Strategy

This document explains how test files are excluded from production builds in this project.

## Overview

The application includes numerous test pages and debug utilities that should never be deployed to production. These include:

- Subscription test pages
- Database test utilities
- Debug panels
- Test login pages
- SQL execution tools

## Implementation

### 1. Environment-Based Route Loading

Test routes are only loaded in development mode:

```typescript
// client/src/routes/index.tsx
const isDevelopment = import.meta.env.MODE === 'development';

if (isDevelopment) {
  // Test routes are lazy-loaded only in development
  const TestRoutes = lazy(() => import('./testRoutes'));
}
```

### 2. Vite Build Configuration

The Vite configuration includes multiple strategies to exclude test files:

- **Custom Plugin**: A custom Vite plugin blocks test file imports in production builds
- **Tree Shaking**: Configured to remove test modules as side effects
- **Manual Chunks**: Test files are segregated into separate chunks that can be excluded

### 3. Build Script

The production build explicitly sets `NODE_ENV=production`:

```json
"build": "NODE_ENV=production vite build && ..."
```

## Test File Patterns

The following patterns identify test files:

- Files containing "Test" or "test" in the name
- Files containing "Debug" or "debug" in the name
- Specific files: ExecuteSQL, FixDatabase, TestLogin, etc.
- Routes ending with "-test" or "-debug"

## Verification

To verify test files are excluded from production:

1. Run `npm run build`
2. Check the `dist/public/assets` directory
3. Search for test-related strings in the bundled JavaScript files
4. Test routes should return 404 in production

## Development Usage

In development mode, all test routes are accessible:

- `/test-login` - Test authentication
- `/database-test` - Database testing utilities
- `/subscription-test` - Subscription flow testing
- `/debug` - Debug panel (admin only)
- And many more...

These routes are protected by role-based access control where appropriate.

## Security Considerations

- Test routes often bypass normal security checks
- Some test utilities have direct database access
- Never deploy with `NODE_ENV=development`
- Always verify production builds before deployment