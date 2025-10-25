#!/bin/bash

# Development Backup System
# Kod değişiklikleri öncesi hızlı snapshot backup

PROJECT_NAME="soulmate-app"
BACKUP_DIR="/data/dev-backups"
DATE=$(date +"%Y%m%d_%H%M%S")
COMMIT_HASH=$(git rev-parse --short HEAD 2>/dev/null || echo "unknown")
BACKUP_NAME="${PROJECT_NAME}_${COMMIT_HASH}_${DATE}"

echo "🔄 Creating development snapshot..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Quick application state backup
echo "📦 Backing up current application state..."

# 1. Database schema backup (lightweight)
echo "🗄️ Database schema backup..."
docker exec $(docker ps -q --filter "name=postgres") pg_dump -U postgres -s soulmate_db > $BACKUP_DIR/${BACKUP_NAME}_schema.sql

# 2. Environment variables backup
echo "⚙️ Environment backup..."
cp /data/coolify/applications/$PROJECT_NAME/.env $BACKUP_DIR/${BACKUP_NAME}_env.backup 2>/dev/null || echo "No .env found"

# 3. Current deployment info
echo "📋 Deployment info backup..."
cat > $BACKUP_DIR/${BACKUP_NAME}_info.txt << EOF
Backup Date: $(date)
Commit Hash: $COMMIT_HASH
Branch: $(git branch --show-current 2>/dev/null || echo "unknown")
Application Status: $(docker ps --filter "name=$PROJECT_NAME" --format "{{.Status}}" | head -1)
Docker Image: $(docker ps --filter "name=$PROJECT_NAME" --format "{{.Image}}" | head -1)
Port Mapping: $(docker ps --filter "name=$PROJECT_NAME" --format "{{.Ports}}" | head -1)
EOF

# 4. Application logs (last 100 lines)
echo "📝 Recent logs backup..."
docker logs $(docker ps -q --filter "name=$PROJECT_NAME") --tail 100 > $BACKUP_DIR/${BACKUP_NAME}_logs.txt 2>/dev/null || echo "No logs found"

# 5. Git state backup
echo "🌿 Git state backup..."
git log --oneline -10 > $BACKUP_DIR/${BACKUP_NAME}_git_history.txt 2>/dev/null || echo "No git history"
git status > $BACKUP_DIR/${BACKUP_NAME}_git_status.txt 2>/dev/null || echo "No git status"

# Create restore script
echo "🔄 Creating restore script..."
cat > $BACKUP_DIR/${BACKUP_NAME}_restore.sh << EOF
#!/bin/bash
echo "🔄 Restoring from backup: $BACKUP_NAME"

# Restore environment
cp $BACKUP_DIR/${BACKUP_NAME}_env.backup /data/coolify/applications/$PROJECT_NAME/.env

# Restore database schema (if needed)
# docker exec -i \$(docker ps -q --filter "name=postgres") psql -U postgres -d soulmate_db < $BACKUP_DIR/${BACKUP_NAME}_schema.sql

echo "✅ Restore completed!"
echo "📋 Check info: cat $BACKUP_DIR/${BACKUP_NAME}_info.txt"
EOF

chmod +x $BACKUP_DIR/${BACKUP_NAME}_restore.sh

# Keep only last 20 development backups (lightweight)
echo "🧹 Cleaning old development backups..."
ls -t $BACKUP_DIR/${PROJECT_NAME}_* | tail -n +21 | xargs rm -f 2>/dev/null

# Create quick rollback link
ln -sf $BACKUP_DIR/${BACKUP_NAME}_restore.sh $BACKUP_DIR/quick_rollback.sh

echo "✅ Development snapshot completed!"
echo "📦 Backup: $BACKUP_NAME"
echo "📍 Location: $BACKUP_DIR"
echo "🔄 Quick rollback: $BACKUP_DIR/quick_rollback.sh"
echo "📊 Backup size: $(du -sh $BACKUP_DIR/${BACKUP_NAME}* | awk '{print $1}' | head -1)" 