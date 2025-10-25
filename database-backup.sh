#!/bin/bash

# =====================================================
# 2Sweety Database Backup Script
# Automated daily backups with rotation
# =====================================================

set -e

# Configuration
MYSQL_CONTAINER="2sweety-mysql"
DB_NAME="gommet"
DB_USER="root"
BACKUP_DIR="/backups/mysql"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/gomeet_$DATE.sql"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "==================================================="
echo "2Sweety Database Backup - $(date)"
echo "==================================================="

# Get MySQL root password
if [ -z "$MYSQL_ROOT_PASSWORD" ]; then
    read -p "MySQL Root Password: " -s MYSQL_ROOT_PASSWORD
    echo ""
fi

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "Creating backup: $BACKUP_FILE"
docker exec "$MYSQL_CONTAINER" mysqldump -u "$DB_USER" -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --databases "$DB_NAME" > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backup created successfully${NC}"

    # Compress backup
    echo "Compressing backup..."
    gzip "$BACKUP_FILE"
    echo -e "${GREEN}✓ Backup compressed: $BACKUP_FILE.gz${NC}"

    # Get file size
    SIZE=$(du -h "$BACKUP_FILE.gz" | cut -f1)
    echo "Backup size: $SIZE"

    # Optional: Upload to cloud storage (uncomment and configure)
    # echo "Uploading to cloud storage..."
    # aws s3 cp "$BACKUP_FILE.gz" s3://your-bucket/backups/mysql/
    # rclone copy "$BACKUP_FILE.gz" remote:backups/mysql/

    # Delete old backups
    echo "Cleaning up old backups (older than $RETENTION_DAYS days)..."
    find "$BACKUP_DIR" -name "gomeet_*.sql.gz" -mtime +$RETENTION_DAYS -delete
    echo -e "${GREEN}✓ Old backups removed${NC}"

    echo ""
    echo "==================================================="
    echo "Backup completed successfully!"
    echo "Location: $BACKUP_FILE.gz"
    echo "==================================================="
else
    echo -e "${RED}✗ Backup failed!${NC}"
    exit 1
fi
