import { drizzle as drizzleSupabase } from 'drizzle-orm/postgres-js';
import { drizzle as drizzleLocal } from 'drizzle-orm/node-postgres';
import postgres from 'postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

// Supabase connection - ONLY for auth operations
const supabaseConnectionString = process.env.DATABASE_URL!;
const supabaseClient = postgres(supabaseConnectionString, {
  max: 5, // Minimal connections since we only use for auth
  idle_timeout: 20,
  connect_timeout: 10,
});

export const supabaseDb = drizzleSupabase(supabaseClient, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Local PostgreSQL connection - For ALL application data
const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgresql://sweety_user:sweety_secure_password_2024@localhost:5432/sweety_db',
  max: 20, // More connections for main database
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Add error handling for pool
localPool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export const localDb = drizzleLocal(localPool, {
  schema,
  logger: process.env.NODE_ENV === 'development',
});

// Health check function
export async function checkDatabaseConnections() {
  try {
    // Check local PostgreSQL
    const localResult = await localPool.query('SELECT 1');
    console.log('✅ Local PostgreSQL connected');

    // Check Supabase (auth only)
    const supabaseResult = await supabaseClient`SELECT 1`;
    console.log('✅ Supabase (Auth) connected');

    return { local: true, supabase: true };
  } catch (error) {
    console.error('❌ Database connection error:', error);
    return { local: false, supabase: false };
  }
}

// Cleanup function for graceful shutdown
export async function closeDatabaseConnections() {
  await localPool.end();
  await supabaseClient.end();
  console.log('Database connections closed');
}