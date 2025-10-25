# 2sweety Backup Strategy

## Overview

This document outlines the comprehensive backup and recovery strategy for the 2sweety project. Our backup system ensures that code, database schemas, and configurations are protected against data loss with multiple layers of redundancy.

## Backup Types

### 1. Continuous Backups (Automatic)
- **Frequency**: Daily at 2 AM UTC + on every push to main branch
- **Retention**: 30 days
- **Storage**: GitHub Releases (tagged as `backup-*`)
- **Workflow**: `.github/workflows/backup.yml`

### 2. Pre-Deployment Snapshots (Automatic)
- **Trigger**: Before deployments and on pull requests
- **Retention**: 14 days
- **Storage**: GitHub Artifacts
- **Workflow**: `.github/workflows/pre-deploy-backup.yml`

### 3. Database Backups (Automatic)
- **Frequency**: Daily at 3 AM UTC
- **Retention**: 30 days
- **Storage**: `database-backups` branch
- **Workflow**: `.github/workflows/database-backup.yml`

### 4. Manual Backups (On-Demand)
- **Script**: `scripts/github-backup.sh`
- **Types**: full, code-only, database-only
- **Storage**: Local `backups/` directory

## Backup Components

### Full Backup Includes:
- All source code (excluding node_modules, build artifacts)
- Database migrations and schema files
- Configuration files (excluding .env)
- Documentation
- Static assets

### Database Backup Includes:
- All SQL migrations
- TypeScript schema definitions
- Drizzle ORM configuration
- RLS policies
- Restoration scripts

## How to Create Backups

### Automated Backups
Automated backups run on schedule. To trigger manually:

1. **Full Backup**: 
   - Go to Actions → Continuous Backup → Run workflow
   - Select backup type (full/incremental/code-only/database-only)

2. **Database Backup**:
   - Go to Actions → Database Backup → Run workflow

### Manual Local Backup
```bash
# Full backup
./scripts/github-backup.sh

# Code only (no database files)
./scripts/github-backup.sh code

# Database only
./scripts/github-backup.sh database
```

## How to Restore from Backups

### Using the Restore Script
```bash
# Restore from local backup file
./scripts/restore-backup.sh backups/backup-file.tar.gz

# Restore from GitHub release
./scripts/restore-backup.sh --type release backup-1.0.0-20240120

# Restore from git tag
./scripts/restore-backup.sh --type tag snapshot/pre-deploy-main-20240120

# Restore from commit
./scripts/restore-backup.sh --type commit abc123def

# Dry run (see what would be restored)
./scripts/restore-backup.sh --dry-run backup-file.tar.gz
```

### Emergency Recovery via GitHub Actions
1. Go to Actions → Emergency Recovery → Run workflow
2. Select recovery type:
   - `restore-from-backup`: Restore from GitHub release
   - `restore-from-tag`: Restore from git tag
   - `restore-from-commit`: Restore from specific commit
   - `restore-database-only`: Restore only database files
3. Enter backup source (tag name, commit SHA, or backup ID)
4. Type "CONFIRM" to proceed

### Manual Database Restoration
```bash
# 1. Checkout database backup branch
git fetch origin database-backups
git checkout database-backups

# 2. Find and extract backup
tar -xzf db-backup-20240120-030000.tar.gz

# 3. Apply migrations
psql $DATABASE_URL < schema-20240120-030000.sql

# 4. Update TypeScript schema
cp schema-20240120-030000.ts shared/schema.ts

# 5. Sync with Drizzle
npm run db:push
```

## Backup Verification

### Automated Verification
- Each backup workflow includes verification steps
- Integrity checks ensure archives are not corrupted
- Metadata files track backup contents

### Manual Verification
```bash
# Verify backup integrity
./backups/verify-backup.sh backups/backup-file.tar.gz

# List backup contents
tar -tzf backups/backup-file.tar.gz | less

# Check metadata
cat backups/backup-*-metadata.json
```

## Recovery Procedures

### Scenario 1: Accidental File Deletion
1. Use git to restore: `git checkout -- path/to/file`
2. Or restore from latest backup using restore script

### Scenario 2: Failed Deployment
1. Pre-deployment snapshots are created automatically
2. Download snapshot from GitHub Actions artifacts
3. Use restore script with the snapshot file

### Scenario 3: Database Schema Corruption
1. Go to Emergency Recovery workflow
2. Select `restore-database-only`
3. Enter the date of the last known good backup
4. Confirm and let the workflow handle restoration

### Scenario 4: Complete System Recovery
1. Clone repository: `git clone <repo-url>`
2. Go to Emergency Recovery workflow
3. Select `restore-from-backup` 
4. Enter the backup release tag
5. Confirm restoration

## Best Practices

### Before Major Changes
1. Manually trigger a full backup
2. Document the current working state
3. Test changes in a branch first

### Regular Maintenance
1. Verify automated backups are running (check Actions tab)
2. Test restoration procedures monthly
3. Clean up old manual backups locally

### Security
1. Never commit .env files or secrets
2. Backups exclude sensitive data by default
3. Use environment variables for restoration

## Monitoring

### Backup Health Checks
- GitHub Actions will show backup status
- Failed backups trigger notifications
- Check Actions tab regularly for backup history

### Storage Management
- Automated cleanup removes backups older than retention period
- Monitor repository size and release storage
- Database backup branch is force-pushed to prevent growth

## Troubleshooting

### Backup Failures
1. Check GitHub Actions logs for errors
2. Ensure sufficient storage quota
3. Verify file permissions for local backups

### Restoration Issues
1. Ensure you have the correct backup file
2. Check Node.js version compatibility
3. Verify database connection before restoring schema
4. Review restoration script output for errors

### Common Issues
- **"Permission denied"**: Make scripts executable with `chmod +x`
- **"No such file"**: Ensure you're in project root directory
- **"Database error"**: Check DATABASE_URL environment variable
- **"Build fails after restore"**: Clear node_modules and reinstall

## Contact & Support

For backup-related issues:
1. Check GitHub Actions logs
2. Review this documentation
3. Test with dry-run option first
4. Create an issue if problems persist