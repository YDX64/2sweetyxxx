-- Example migration for local PostgreSQL (no RLS needed)
-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  age INTEGER,
  role VARCHAR(50) DEFAULT 'registered',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  -- ... other fields
);

-- Create auth table (replace Supabase auth)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- No RLS policies needed!
-- Direct queries will work

-- Admin can see everything with simple queries:
-- SELECT COUNT(*) FROM profiles;  -- Works directly!