#!/bin/bash

# Automatic Backup System for Coolify
# Bu script her deployment öncesi otomatik backup alır

BACKUP_DIR="/data/backups"
PROJECT_NAME="soulmate-app"
DATE=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="${PROJECT_NAME}_${DATE}"

echo "🔄 Starting backup process..."

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
echo "📊 Backing up database..."
docker exec coolify-db pg_dump -U postgres soulmate_db > $BACKUP_DIR/${BACKUP_NAME}_database.sql

# Application files backup
echo "📁 Backing up application files..."
tar -czf $BACKUP_DIR/${BACKUP_NAME}_files.tar.gz /data/coolify/applications/$PROJECT_NAME

# Docker images backup
echo "🐳 Backing up Docker images..."
docker save $(docker images --format "table {{.Repository}}:{{.Tag}}" | grep $PROJECT_NAME) | gzip > $BACKUP_DIR/${BACKUP_NAME}_images.tar.gz

# Environment variables backup
echo "⚙️ Backing up environment variables..."
docker exec coolify cat /data/coolify/applications/$PROJECT_NAME/.env > $BACKUP_DIR/${BACKUP_NAME}_env.txt

# Keep only last 7 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "${PROJECT_NAME}_*" -mtime +7 -delete

# Upload to cloud storage (optional)
# aws s3 sync $BACKUP_DIR s3://your-backup-bucket/

echo "✅ Backup completed: $BACKUP_NAME"
echo "📍 Location: $BACKUP_DIR"

# Send notification (optional)
# curl -X POST "https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/sendMessage" \
#      -d "chat_id=$TELEGRAM_CHAT_ID" \
#      -d "text=✅ Backup completed for $PROJECT_NAME at $(date)" 