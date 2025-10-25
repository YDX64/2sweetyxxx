#!/bin/bash
# =====================================================
# 2Sweety Database Backup Script
# =====================================================
# Automated MySQL database backup with rotation
# Usage: ./database-backup.sh
# =====================================================

set -e

# Color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_NAME:-dating_db}"
DB_USER="${DB_USER:-dating_user}"
DB_PASSWORD="${DB_PASSWORD:-}"

BACKUP_DIR="${BACKUP_DIR:-/var/backups/mysql}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting database backup...${NC}"
echo "Database: $DB_NAME"
echo "Backup file: $BACKUP_FILE"
echo ""

# Perform backup
if mysqldump -h"$DB_HOST" -P"$DB_PORT" -u"$DB_USER" -p"$DB_PASSWORD" \
    --single-transaction \
    --routines \
    --triggers \
    --events \
    --add-drop-database \
    --add-drop-table \
    --create-options \
    --complete-insert \
    --extended-insert \
    --set-charset \
    "$DB_NAME" | gzip > "$BACKUP_FILE"; then

    echo -e "${GREEN}✓ Backup created successfully${NC}"
    echo "File size: $(du -h "$BACKUP_FILE" | cut -f1)"
else
    echo -e "${RED}✗ Backup failed${NC}"
    exit 1
fi

# Remove old backups
echo ""
echo -e "${YELLOW}Cleaning up old backups (older than $RETENTION_DAYS days)...${NC}"
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓ Cleanup complete${NC}"

# List recent backups
echo ""
echo "Recent backups:"
ls -lh "$BACKUP_DIR" | grep "${DB_NAME}_" | tail -5

echo ""
echo -e "${GREEN}Backup completed successfully!${NC}"
