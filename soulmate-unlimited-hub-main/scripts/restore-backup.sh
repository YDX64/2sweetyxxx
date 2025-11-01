#!/bin/bash
# Universal Restore Script for 2sweety Backups
# This script can restore from various backup sources

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

# Show usage
usage() {
    echo "Usage: $0 [OPTIONS] <backup-source>"
    echo ""
    echo "Options:"
    echo "  -t, --type TYPE      Backup type (file, tag, commit, release)"
    echo "  -f, --force          Skip confirmation prompts"
    echo "  -d, --dry-run        Show what would be restored without doing it"
    echo "  -p, --preserve       Preserve current state in a backup"
    echo "  -h, --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 backups/backup-20240120.tar.gz"
    echo "  $0 --type tag v1.2.3"
    echo "  $0 --type commit abc123"
    echo "  $0 --type release backup-1.0.0-20240120"
    exit 1
}

# Parse arguments
TYPE="file"
FORCE=false
DRY_RUN=false
PRESERVE=true
BACKUP_SOURCE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        -t|--type)
            TYPE="$2"
            shift 2
            ;;
        -f|--force)
            FORCE=true
            shift
            ;;
        -d|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -p|--preserve)
            PRESERVE=true
            shift
            ;;
        -h|--help)
            usage
            ;;
        *)
            BACKUP_SOURCE="$1"
            shift
            ;;
    esac
done

if [ -z "$BACKUP_SOURCE" ]; then
    print_error "No backup source specified"
    usage
fi

# Confirmation
if [ "$FORCE" != "true" ] && [ "$DRY_RUN" != "true" ]; then
    echo "======================================"
    echo "       BACKUP RESTORATION TOOL"
    echo "======================================"
    echo ""
    echo "Type: $TYPE"
    echo "Source: $BACKUP_SOURCE"
    echo "Preserve current: $PRESERVE"
    echo ""
    print_warn "This will restore your project from backup!"
    print_warn "Current files may be overwritten!"
    echo ""
    read -p "Continue? (yes/no): " confirm
    
    if [ "$confirm" != "yes" ]; then
        echo "Restoration cancelled."
        exit 0
    fi
fi

# Create pre-restore backup if requested
if [ "$PRESERVE" == "true" ] && [ "$DRY_RUN" != "true" ]; then
    print_step "Creating pre-restore backup..."
    PRE_RESTORE_DIR="pre-restore-backups"
    mkdir -p "$PRE_RESTORE_DIR"
    PRE_RESTORE_FILE="$PRE_RESTORE_DIR/pre-restore-$(date +'%Y%m%d-%H%M%S').tar.gz"
    
    tar -czf "$PRE_RESTORE_FILE" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=build \
        --exclude=uploads \
        --exclude=backups \
        --exclude=pre-restore-backups \
        .
    
    print_info "Pre-restore backup saved: $PRE_RESTORE_FILE"
fi

# Perform restoration based on type
case $TYPE in
    file)
        if [ ! -f "$BACKUP_SOURCE" ]; then
            print_error "Backup file not found: $BACKUP_SOURCE"
            exit 1
        fi
        
        print_step "Restoring from file: $BACKUP_SOURCE"
        
        if [ "$DRY_RUN" == "true" ]; then
            print_info "Files that would be restored:"
            tar -tzf "$BACKUP_SOURCE" | head -20
            echo "... and more"
        else
            tar -xzf "$BACKUP_SOURCE"
            print_info "Files extracted successfully"
        fi
        ;;
        
    tag)
        if [ ! -d .git ]; then
            print_error "Not a git repository"
            exit 1
        fi
        
        print_step "Restoring from git tag: $BACKUP_SOURCE"
        
        if ! git rev-parse "$BACKUP_SOURCE" >/dev/null 2>&1; then
            print_error "Tag not found: $BACKUP_SOURCE"
            exit 1
        fi
        
        if [ "$DRY_RUN" == "true" ]; then
            print_info "Would reset to tag: $BACKUP_SOURCE"
            git show "$BACKUP_SOURCE" --stat
        else
            git reset --hard "$BACKUP_SOURCE"
            print_info "Reset to tag: $BACKUP_SOURCE"
        fi
        ;;
        
    commit)
        if [ ! -d .git ]; then
            print_error "Not a git repository"
            exit 1
        fi
        
        print_step "Restoring from commit: $BACKUP_SOURCE"
        
        if ! git rev-parse "$BACKUP_SOURCE" >/dev/null 2>&1; then
            print_error "Commit not found: $BACKUP_SOURCE"
            exit 1
        fi
        
        if [ "$DRY_RUN" == "true" ]; then
            print_info "Would reset to commit: $BACKUP_SOURCE"
            git show "$BACKUP_SOURCE" --stat
        else
            git reset --hard "$BACKUP_SOURCE"
            print_info "Reset to commit: $BACKUP_SOURCE"
        fi
        ;;
        
    release)
        print_step "Downloading release: $BACKUP_SOURCE"
        
        if [ "$DRY_RUN" == "true" ]; then
            print_info "Would download release assets from: $BACKUP_SOURCE"
            gh release view "$BACKUP_SOURCE" 2>/dev/null || print_warn "Release might not exist"
        else
            TEMP_DIR="temp-restore-$$"
            mkdir -p "$TEMP_DIR"
            
            # Download release assets
            gh release download "$BACKUP_SOURCE" \
                --pattern "*.tar.gz" \
                --dir "$TEMP_DIR" || {
                print_error "Failed to download release"
                rm -rf "$TEMP_DIR"
                exit 1
            }
            
            # Find and extract the appropriate backup
            BACKUP_FILE=$(ls "$TEMP_DIR"/*-full.tar.gz 2>/dev/null | head -1)
            if [ -z "$BACKUP_FILE" ]; then
                BACKUP_FILE=$(ls "$TEMP_DIR"/*-code.tar.gz 2>/dev/null | head -1)
            fi
            
            if [ -n "$BACKUP_FILE" ]; then
                tar -xzf "$BACKUP_FILE"
                print_info "Extracted release backup"
            else
                print_error "No suitable backup found in release"
                rm -rf "$TEMP_DIR"
                exit 1
            fi
            
            rm -rf "$TEMP_DIR"
        fi
        ;;
        
    *)
        print_error "Unknown restore type: $TYPE"
        usage
        ;;
esac

# Post-restore steps (skip for dry run)
if [ "$DRY_RUN" != "true" ]; then
    print_step "Running post-restore steps..."
    
    # Restore dependencies if package.json exists
    if [ -f "package.json" ]; then
        print_info "Installing dependencies..."
        npm ci || npm install
    fi
    
    # Run type checking
    if [ -f "package.json" ] && grep -q '"check"' package.json; then
        print_info "Running type check..."
        npm run check || print_warn "Type check failed - manual fixes may be needed"
    fi
    
    # Rebuild if needed
    if [ -f "package.json" ] && grep -q '"build"' package.json; then
        print_info "Building application..."
        npm run build || print_warn "Build failed - manual intervention may be needed"
    fi
fi

# Summary
echo ""
echo "======================================"
echo "       RESTORATION COMPLETE"
echo "======================================"
echo ""

if [ "$DRY_RUN" == "true" ]; then
    print_info "This was a dry run - no changes were made"
else
    print_info "Project restored from: $BACKUP_SOURCE"
    
    if [ "$PRESERVE" == "true" ]; then
        print_info "Pre-restore backup: $PRE_RESTORE_FILE"
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Verify the restoration was successful"
    echo "2. Check that all services are working"
    echo "3. Update environment variables if needed"
    echo "4. Run any necessary migrations"
fi