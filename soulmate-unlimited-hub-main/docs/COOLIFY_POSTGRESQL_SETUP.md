# Coolify PostgreSQL Setup Guide

## Step 1: Deploy PostgreSQL in Coolify

1. Login to Coolify Dashboard
2. Go to your Project
3. Click "New Resource"
4. Select "PostgreSQL"
5. Configure:
   - Name: `soulmate-db`
   - Version: `16`
   - Password: (auto-generated or set your own)
   - Volume: Enable for data persistence

## Step 2: Get Connection Details

After deployment, Coolify provides:
- Internal URL: `postgresql://postgres:password@soulmate-db:5432/postgres`
- External URL: (if exposed publicly)

## Step 3: Update Your App

1. In your app's Coolify settings, add environment variable:
```
DATABASE_URL=postgresql://postgres:password@soulmate-db:5432/soulmate_db
```

2. The database name in the internal network will be the service name you gave it

## Step 4: Initialize Database

Add an init script to your deployment:

```dockerfile
# In your Dockerfile
COPY ./migrations /app/migrations
RUN npm run migrate
```

Or use Coolify's "Post Deploy Command":
```bash
npm run db:migrate
```

## Step 5: Data Migration from Supabase

1. Export from Supabase:
```bash
pg_dump postgresql://[SUPABASE_URL] > backup.sql
```

2. Import to Coolify PostgreSQL:
```bash
psql postgresql://[COOLIFY_DB_URL] < backup.sql
```

## Advantages:
- No external dependencies
- Faster (same network)
- Full SQL access
- No RLS complications
- Automatic backups
- Better cost efficiency

## Connection in Code:

```javascript
// server/db.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export const db = {
  query: (text: string, params?: any[]) => pool.query(text, params)
};
```

## No More Supabase Issues!
- ✅ No API keys
- ✅ No RLS policies
- ✅ Direct SQL access
- ✅ Full admin control
- ✅ Faster queries
- ✅ Lower latency