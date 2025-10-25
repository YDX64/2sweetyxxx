#!/bin/bash

# Backup Verification Script
# This script verifies the integrity and completeness of backups

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
}

log_fail() {
    echo -e "${RED}[✗]${NC} $1"
}

# Check if backup file is provided
if [ $# -eq 0 ]; then
    echo "Usage: $0 <backup_file.tar.gz>"
    echo ""
    echo "This script verifies the integrity and completeness of a backup file."
    echo ""
    echo "Example: $0 backups/2sweety_backup_20240625_120000.tar.gz"
    exit 1
fi

BACKUP_FILE=$1
TEMP_DIR="verify_temp_$(date +%Y%m%d_%H%M%S)"
VERIFICATION_PASSED=true

# Verify backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    log_error "Backup file not found: $BACKUP_FILE"
    exit 1
fi

log_info "Backup Verification Script"
log_info "Verifying: $BACKUP_FILE"
echo ""

# Create temporary directory for verification
mkdir -p "$TEMP_DIR"

# Step 1: Verify file integrity
log_info "Verifying file integrity..."
if tar -tzf "$BACKUP_FILE" > /dev/null 2>&1; then
    log_success "Backup file integrity check passed"
else
    log_fail "Backup file is corrupted or invalid"
    VERIFICATION_PASSED=false
fi

# Step 2: Extract backup for content verification
log_info "Extracting backup for verification..."
tar -xzf "$BACKUP_FILE" -C "$TEMP_DIR" 2>/dev/null || {
    log_fail "Failed to extract backup"
    VERIFICATION_PASSED=false
    rm -rf "$TEMP_DIR"
    exit 1
}

# Find the extracted backup directory
BACKUP_DIR=$(find "$TEMP_DIR" -maxdepth 1 -type d -name "*_backup_*" | head -1)

if [ -z "$BACKUP_DIR" ]; then
    log_fail "Could not find backup directory in extracted files"
    VERIFICATION_PASSED=false
    rm -rf "$TEMP_DIR"
    exit 1
fi

cd "$BACKUP_DIR"

# Step 3: Verify manifest
log_info "Checking backup manifest..."
if [ -f "manifest.json" ]; then
    log_success "Manifest file found"
    
    # Check if jq is available for JSON parsing
    if command -v jq &> /dev/null; then
        BACKUP_DATE=$(jq -r '.backup_date' manifest.json 2>/dev/null || echo "unknown")
        BACKUP_NAME=$(jq -r '.backup_name' manifest.json 2>/dev/null || echo "unknown")
        log_info "Backup date: $BACKUP_DATE"
        log_info "Backup name: $BACKUP_NAME"
    fi
else
    log_fail "Manifest file missing"
    VERIFICATION_PASSED=false
fi

# Step 4: Verify essential components
log_info "Verifying backup components..."

# Check source code
if [ -f "source_code.tar.gz" ]; then
    log_success "Source code archive present"
    
    # Verify source code archive integrity
    if tar -tzf source_code.tar.gz > /dev/null 2>&1; then
        FILE_COUNT=$(tar -tzf source_code.tar.gz | wc -l)
        log_info "  Source files: $FILE_COUNT files"
    else
        log_fail "  Source code archive is corrupted"
        VERIFICATION_PASSED=false
    fi
else
    log_fail "Source code archive missing"
    VERIFICATION_PASSED=false
fi

# Check Git bundle
if [ -f "git_bundle.bundle" ]; then
    log_success "Git bundle present"
    
    # Verify Git bundle
    if command -v git &> /dev/null; then
        if git bundle verify git_bundle.bundle > /dev/null 2>&1; then
            log_info "  Git bundle is valid"
        else
            log_fail "  Git bundle is corrupted"
            VERIFICATION_PASSED=false
        fi
    fi
else
    log_warn "Git bundle missing (may be intentional if not a Git repo)"
fi

# Check database backups
if [ -d "database" ]; then
    log_success "Database backup directory present"
    
    MIGRATION_COUNT=$(find database -name "*.sql" -type f 2>/dev/null | wc -l || echo 0)
    if [ $MIGRATION_COUNT -gt 0 ]; then
        log_info "  Migration files: $MIGRATION_COUNT SQL files"
    else
        log_warn "  No SQL migration files found"
    fi
    
    if [ -f "database/schema.ts" ]; then
        log_info "  Schema file present"
    fi
else
    log_warn "Database backup directory missing"
fi

# Check configurations
if [ -d "configs" ]; then
    log_success "Configuration directory present"
    
    CONFIG_COUNT=$(ls -1 configs/ 2>/dev/null | wc -l || echo 0)
    log_info "  Configuration files: $CONFIG_COUNT files"
else
    log_warn "Configuration directory missing"
fi

# Check environment template
if [ -f "env.example" ]; then
    log_success "Environment template present"
else
    log_warn "Environment template missing"
fi

# Check restoration instructions
if [ -f "RESTORE_INSTRUCTIONS.md" ]; then
    log_success "Restoration instructions present"
else
    log_fail "Restoration instructions missing"
    VERIFICATION_PASSED=false
fi

# Step 5: Size analysis
log_info "Analyzing backup size..."
TOTAL_SIZE=$(du -sh . | awk '{print $1}')
log_info "Total backup size: $TOTAL_SIZE"

# Step 6: Additional checks
log_info "Running additional checks..."

# Check for sensitive data (basic check)
SENSITIVE_FILES=$(find . -name ".env" -o -name "*.key" -o -name "*.pem" -o -name "*secret*" 2>/dev/null | wc -l || echo 0)
if [ $SENSITIVE_FILES -gt 0 ]; then
    log_warn "Found $SENSITIVE_FILES potentially sensitive files in backup"
    log_warn "Ensure these are encrypted or removed before sharing backup"
fi

# Cleanup
cd - > /dev/null
rm -rf "$TEMP_DIR"

# Final verification result
echo ""
echo "======================================"
echo "Verification Summary"
echo "======================================"

if [ "$VERIFICATION_PASSED" = true ]; then
    log_success "BACKUP VERIFICATION PASSED"
    echo ""
    echo "This backup appears to be complete and valid."
    echo "It can be safely used for restoration."
    exit 0
else
    log_fail "BACKUP VERIFICATION FAILED"
    echo ""
    echo "This backup has issues and may not restore properly."
    echo "Please create a new backup or investigate the failures above."
    exit 1
fi