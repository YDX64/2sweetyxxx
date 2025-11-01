# Disaster Recovery Plan for 2sweety

## Emergency Contacts

- **Primary Developer**: [Your Name]
- **Backup Contact**: [Backup Person]
- **Hosting Support**: 
  - Supabase: support@supabase.io
  - Vercel/Railway/Coolify: Check respective dashboards

## Quick Recovery Commands

### 🚨 EMERGENCY: Complete System Down
```bash
# 1. Clone repository
git clone https://github.com/[your-org]/2sweety.git
cd 2sweety

# 2. Install dependencies
npm install

# 3. Restore from latest backup
./scripts/restore-backup.sh --type release latest

# 4. Set environment variables
cp env.example .env
# Edit .env with production values

# 5. Build and start
npm run build
npm start
```

### 🔥 Database Emergency
```bash
# Restore database from backup branch
git fetch origin database-backups
git checkout database-backups
tar -xzf db-backup-[LATEST_DATE].tar.gz
psql $DATABASE_URL < schema-[LATEST_DATE].sql
```

## Recovery Scenarios

### 1. Corrupted Deployment

**Symptoms**: Application crashes, white screen, 500 errors

**Recovery Steps**:
1. Check GitHub Actions for last successful deployment
2. Revert to last known good commit:
   ```bash
   git log --oneline -10  # Find last good commit
   git revert [bad-commit-sha]
   git push origin main
   ```
3. Or use Emergency Recovery:
   - Actions → Emergency Recovery → restore-from-commit
   - Enter last good commit SHA
   - Type "CONFIRM"

### 2. Database Issues

**Symptoms**: Login failures, missing data, query errors

**Recovery Steps**:
1. Check Supabase dashboard for service status
2. Verify RLS policies haven't been corrupted:
   ```bash
   # Go to Emergency Recovery
   # Select restore-database-only
   # Use yesterday's backup
   ```
3. If data is corrupted but schema is intact:
   - Use Supabase dashboard backups
   - Contact Supabase support for point-in-time recovery

### 3. Accidental Deletion

**File Deletion**:
```bash
# Single file
git checkout -- path/to/deleted/file

# Multiple files from backup
./scripts/restore-backup.sh --type tag [last-snapshot-tag]
```

**Branch Deletion**:
```bash
# Recover deleted branch
git reflog
git checkout -b recovered-branch [commit-sha]
```

### 4. Security Breach

**Immediate Actions**:
1. Rotate all secrets immediately:
   - Supabase service role key
   - Stripe API keys
   - OAuth client secrets
2. Check for unauthorized commits:
   ```bash
   git log --all --full-history --grep="[suspicious-terms]"
   ```
3. Restore to pre-breach state:
   ```bash
   # Find commit before breach
   git log --before="2024-01-20"
   # Restore
   ./scripts/restore-backup.sh --type commit [safe-commit]
   ```
4. Update all dependencies:
   ```bash
   npm audit fix --force
   npm update
   ```

### 5. Performance Degradation

**Symptoms**: Slow queries, timeouts, high CPU

**Recovery Steps**:
1. Check database indexes:
   ```sql
   -- In Supabase SQL editor
   SELECT schemaname, tablename, indexname 
   FROM pg_indexes 
   WHERE schemaname = 'public';
   ```
2. Clear caches and rebuild:
   ```bash
   rm -rf dist build .cache
   npm run build
   ```
3. Check for runaway queries in Supabase dashboard

### 6. Complete Data Loss

**This is the worst-case scenario**

1. **From GitHub Releases**:
   ```bash
   # List available backups
   gh release list --limit 30
   
   # Restore latest
   ./scripts/restore-backup.sh --type release [latest-backup-tag]
   ```

2. **From Database Backup Branch**:
   ```bash
   git fetch origin database-backups
   git checkout database-backups
   ls -la db-backup-*.tar.gz  # List all backups
   # Follow restoration steps in BACKUP_STRATEGY.md
   ```

3. **From Hosting Provider Backups**:
   - Supabase: Dashboard → Settings → Backups
   - Check if hosting provider has automatic backups

## Recovery Validation

After any recovery, validate:

### Application Health
```bash
# 1. Type checking
npm run check

# 2. Build verification
npm run build

# 3. Start application
npm run dev

# 4. Test critical paths:
#    - User registration/login
#    - Profile creation
#    - Messaging
#    - Payments
```

### Database Health
```sql
-- Check table counts
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public';

-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check user count
SELECT COUNT(*) FROM profiles;
```

### Integration Health
- Test Supabase authentication
- Verify Stripe webhook functionality
- Check image upload capabilities
- Test real-time features

## Prevention Measures

### Daily Checks
- Monitor GitHub Actions for backup success
- Check application logs for errors
- Verify database connection pool health

### Weekly Tasks
- Review backup integrity
- Test restoration procedure on staging
- Update dependencies

### Monthly Tasks
- Full disaster recovery drill
- Review and update emergency contacts
- Audit security settings

## Recovery Time Objectives

- **Critical Fix** (site down): < 30 minutes
- **Database Recovery**: < 1 hour
- **Full System Recovery**: < 2 hours
- **Complete Rebuild**: < 4 hours

## Escalation Path

1. **Level 1**: Development team attempts recovery
2. **Level 2**: Contact hosting provider support
3. **Level 3**: Engage external consultants
4. **Level 4**: Communicate with users about extended downtime

## Post-Recovery Actions

1. **Document the Incident**:
   - What went wrong
   - How it was detected
   - Recovery steps taken
   - Time to recovery

2. **Update Procedures**:
   - Add new scenarios to this guide
   - Update backup strategies if needed
   - Improve monitoring

3. **Communication**:
   - Notify stakeholders
   - Post-mortem meeting
   - User communication if needed

## Important Notes

- Always create a backup before attempting recovery
- Test recovery procedures in non-production first
- Keep this document updated with lessons learned
- Store emergency contacts in multiple locations
- Maintain offline copies of critical documentation