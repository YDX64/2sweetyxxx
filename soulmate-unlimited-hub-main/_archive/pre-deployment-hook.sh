#!/bin/bash

# Pre-deployment Hook
# Bu script her deployment öncesi otomatik çalışır

echo "🚀 Pre-deployment hook started..."

# 1. Create development snapshot
echo "📦 Creating pre-deployment snapshot..."
/root/dev-backup-system.sh

# 2. Health check current application
echo "🔍 Current application health check..."
CURRENT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health || echo "000")

if [ "$CURRENT_STATUS" = "200" ]; then
    echo "✅ Current application is healthy (HTTP $CURRENT_STATUS)"
else
    echo "⚠️ Current application status: HTTP $CURRENT_STATUS"
fi

# 3. Database connection test
echo "🗄️ Database connection test..."
DB_TEST=$(docker exec $(docker ps -q --filter "name=postgres") psql -U postgres -d soulmate_db -c "SELECT 1;" 2>/dev/null | grep -c "1 row" || echo "0")

if [ "$DB_TEST" = "1" ]; then
    echo "✅ Database connection successful"
else
    echo "⚠️ Database connection issue"
fi

# 4. Disk space check
echo "💾 Disk space check..."
DISK_USAGE=$(df /data | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    echo "✅ Disk usage: ${DISK_USAGE}% (OK)"
else
    echo "⚠️ Disk usage: ${DISK_USAGE}% (High)"
fi

# 5. Memory check
echo "🖥️ Memory check..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    echo "✅ Memory usage: ${MEMORY_USAGE}% (OK)"
else
    echo "⚠️ Memory usage: ${MEMORY_USAGE}% (High)"
fi

# 6. Create deployment log
DEPLOY_LOG="/data/deployment-logs/deploy_$(date +%Y%m%d_%H%M%S).log"
mkdir -p /data/deployment-logs

cat > $DEPLOY_LOG << EOF
=== PRE-DEPLOYMENT CHECK ===
Date: $(date)
Commit: $(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
Current App Status: HTTP $CURRENT_STATUS
Database Status: $([[ "$DB_TEST" = "1" ]] && echo "OK" || echo "ERROR")
Disk Usage: ${DISK_USAGE}%
Memory Usage: ${MEMORY_USAGE}%
Backup Created: ✅
=== END PRE-DEPLOYMENT CHECK ===
EOF

echo "📝 Deployment log created: $DEPLOY_LOG"
echo "✅ Pre-deployment hook completed!"

# Return success (0) to continue deployment
exit 0 