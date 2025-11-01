#!/bin/bash

# Script to migrate data from Supabase to local PostgreSQL

echo "🚀 Starting migration from Supabase to local PostgreSQL..."

# Configuration
SUPABASE_DB_URL="${DATABASE_URL}"
LOCAL_DB_URL="${LOCAL_DATABASE_URL:-postgresql://sweety_user:sweety_secure_password_2024@localhost:5432/sweety_db}"

# Check if environment variables are set
if [ -z "$SUPABASE_DB_URL" ]; then
    echo "❌ Error: DATABASE_URL environment variable not set"
    exit 1
fi

echo "📦 Step 1: Starting Docker containers..."
docker-compose up -d postgres redis

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

# Check if PostgreSQL is ready
until docker exec sweety-postgres pg_isready -U sweety_user -d sweety_db; do
    echo "⏳ PostgreSQL is still starting up..."
    sleep 2
done

echo "✅ PostgreSQL is ready!"

# Create schema
echo "📋 Step 2: Creating database schema..."
docker exec -i sweety-postgres psql -U sweety_user -d sweety_db < migrations/local/001_init_schema.sql
docker exec -i sweety-postgres psql -U sweety_user -d sweety_db < migrations/local/002_realtime_triggers.sql

echo "✅ Schema created successfully!"

# Export data from Supabase (excluding auth tables)
echo "📤 Step 3: Exporting data from Supabase..."

# List of tables to migrate
TABLES=(
    "profiles"
    "user_roles"
    "subscriptions"
    "user_preferences"
    "conversations"
    "messages"
    "swipes"
    "super_likes"
    "matches"
    "profile_views"
    "guests"
    "call_sessions"
    "reports"
    "blocks"
)

# Create temp directory for exports
mkdir -p temp_migration

for table in "${TABLES[@]}"; do
    echo "  📁 Exporting $table..."
    pg_dump "$SUPABASE_DB_URL" \
        --table="public.$table" \
        --data-only \
        --no-owner \
        --no-privileges \
        --no-tablespaces \
        --no-unlogged-table-data \
        --file="temp_migration/${table}.sql"
done

echo "✅ Data export completed!"

# Import data to local PostgreSQL
echo "📥 Step 4: Importing data to local PostgreSQL..."

for table in "${TABLES[@]}"; do
    if [ -f "temp_migration/${table}.sql" ]; then
        echo "  📁 Importing $table..."
        docker exec -i sweety-postgres psql -U sweety_user -d sweety_db < "temp_migration/${table}.sql"
    fi
done

echo "✅ Data import completed!"

# Clean up
echo "🧹 Step 5: Cleaning up temporary files..."
rm -rf temp_migration

# Verify migration
echo "🔍 Step 6: Verifying migration..."

for table in "${TABLES[@]}"; do
    count=$(docker exec sweety-postgres psql -U sweety_user -d sweety_db -t -c "SELECT COUNT(*) FROM $table;")
    echo "  ✓ $table: $count rows"
done

echo "✅ Migration completed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Update your .env file with LOCAL_DATABASE_URL"
echo "2. Start the application with: npm run dev"
echo "3. Test all features to ensure everything works correctly"
echo ""
echo "⚠️  Important: Keep Supabase for authentication only!"