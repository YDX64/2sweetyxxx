#!/bin/bash
# GitHub Backup Script for 2sweety
# This script creates comprehensive backups that can be used with GitHub Actions

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKUP_DIR="backups"
TIMESTAMP=$(date +'%Y%m%d-%H%M%S')
VERSION=$(node -p "require('./package.json').version || '0.0.0'" 2>/dev/null || echo "0.0.0")
BACKUP_NAME="2sweety-backup-${VERSION}-${TIMESTAMP}"

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

print_info "Starting backup process..."
print_info "Backup name: $BACKUP_NAME"

# Check if git repo
if [ -d .git ]; then
    CURRENT_COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    print_info "Git commit: $CURRENT_COMMIT"
    print_info "Git branch: $CURRENT_BRANCH"
else
    print_warn "Not a git repository"
    CURRENT_COMMIT="unknown"
    CURRENT_BRANCH="unknown"
fi

# Determine backup type from argument
BACKUP_TYPE=${1:-full}

case $BACKUP_TYPE in
    full)
        print_info "Creating full backup..."
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}-full.tar.gz" \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=dist \
            --exclude=build \
            --exclude=.env \
            --exclude=uploads \
            --exclude=backups \
            --exclude=emergency-snapshots \
            --exclude=deployment-snapshots \
            .
        ;;
    
    code)
        print_info "Creating code-only backup..."
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}-code.tar.gz" \
            --exclude=node_modules \
            --exclude=.git \
            --exclude=dist \
            --exclude=build \
            --exclude=.env* \
            --exclude=uploads \
            --exclude=backups \
            --exclude=supabase/migrations \
            --exclude=*.sql \
            --exclude=*.db \
            .
        ;;
    
    database)
        print_info "Creating database backup..."
        mkdir -p "$BACKUP_DIR/db-temp"
        
        # Copy database-related files
        cp -r supabase/migrations "$BACKUP_DIR/db-temp/" 2>/dev/null || print_warn "No migrations found"
        cp shared/schema.ts "$BACKUP_DIR/db-temp/" 2>/dev/null || print_warn "No schema.ts found"
        cp drizzle.config.ts "$BACKUP_DIR/db-temp/" 2>/dev/null || print_warn "No drizzle.config.ts found"
        
        # Create database backup archive
        tar -czf "$BACKUP_DIR/${BACKUP_NAME}-database.tar.gz" -C "$BACKUP_DIR/db-temp" .
        rm -rf "$BACKUP_DIR/db-temp"
        ;;
    
    *)
        print_error "Unknown backup type: $BACKUP_TYPE"
        echo "Usage: $0 [full|code|database]"
        exit 1
        ;;
esac

# Create metadata file
cat > "$BACKUP_DIR/${BACKUP_NAME}-metadata.json" << EOF
{
  "version": "$VERSION",
  "timestamp": "$TIMESTAMP",
  "backup_type": "$BACKUP_TYPE",
  "commit_sha": "$CURRENT_COMMIT",
  "branch": "$CURRENT_BRANCH",
  "created_by": "$(whoami)",
  "hostname": "$(hostname)",
  "files_count": $(find . -type f -not -path "./node_modules/*" -not -path "./.git/*" -not -path "./backups/*" 2>/dev/null | wc -l),
  "backup_size": "$(du -sh "$BACKUP_DIR/${BACKUP_NAME}-${BACKUP_TYPE}.tar.gz" 2>/dev/null | cut -f1)"
}
EOF

# Create restoration script specific to this backup
cat > "$BACKUP_DIR/${BACKUP_NAME}-restore.sh" << 'EOF'
#!/bin/bash
# Restoration script for specific backup

set -e

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Restoring from: $BACKUP_FILE"
echo "WARNING: This will overwrite existing files!"
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo "Restoration cancelled."
    exit 0
fi

# Create pre-restore backup
PRE_RESTORE_BACKUP="pre-restore-$(date +'%Y%m%d-%H%M%S').tar.gz"
echo "Creating pre-restore backup: $PRE_RESTORE_BACKUP"
tar -czf "$PRE_RESTORE_BACKUP" \
    --exclude=node_modules \
    --exclude=.git \
    --exclude=dist \
    --exclude=build \
    --exclude=uploads \
    .

# Extract backup
echo "Extracting backup..."
tar -xzf "$BACKUP_FILE"

# Restore dependencies
if [ -f "package.json" ]; then
    echo "Restoring dependencies..."
    npm ci
fi

# Rebuild if needed
if [ -f "package.json" ] && grep -q '"build"' package.json; then
    echo "Building application..."
    npm run build
fi

echo "Restoration completed!"
echo "Pre-restore backup saved as: $PRE_RESTORE_BACKUP"
EOF

chmod +x "$BACKUP_DIR/${BACKUP_NAME}-restore.sh"

# Create backup verification script
cat > "$BACKUP_DIR/verify-backup.sh" << 'EOF'
#!/bin/bash
# Verify backup integrity

BACKUP_FILE="$1"

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

if [ ! -f "$BACKUP_FILE" ]; then
    echo "Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

echo "Verifying backup: $BACKUP_FILE"

# Test archive integrity
if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
    echo "✓ Archive integrity: OK"
    
    # Count files
    FILE_COUNT=$(tar -tzf "$BACKUP_FILE" | wc -l)
    echo "✓ Files in archive: $FILE_COUNT"
    
    # Check archive size
    SIZE=$(du -h "$BACKUP_FILE" | cut -f1)
    echo "✓ Archive size: $SIZE"
    
    # List key files
    echo ""
    echo "Key files found:"
    tar -tzf "$BACKUP_FILE" | grep -E "(package\.json|server/index\.ts|client/src/main\.tsx)" | head -10
    
    echo ""
    echo "Backup verification: PASSED"
    exit 0
else
    echo "✗ Archive integrity: FAILED"
    exit 1
fi
EOF

chmod +x "$BACKUP_DIR/verify-backup.sh"

# Summary
print_info "Backup completed successfully!"
echo ""
echo "Backup Summary:"
echo "- Type: $BACKUP_TYPE"
echo "- Location: $BACKUP_DIR/${BACKUP_NAME}-${BACKUP_TYPE}.tar.gz"
echo "- Metadata: $BACKUP_DIR/${BACKUP_NAME}-metadata.json"
echo "- Restore script: $BACKUP_DIR/${BACKUP_NAME}-restore.sh"
echo ""
echo "To verify: $BACKUP_DIR/verify-backup.sh $BACKUP_DIR/${BACKUP_NAME}-${BACKUP_TYPE}.tar.gz"
echo "To restore: $BACKUP_DIR/${BACKUP_NAME}-restore.sh $BACKUP_DIR/${BACKUP_NAME}-${BACKUP_TYPE}.tar.gz"