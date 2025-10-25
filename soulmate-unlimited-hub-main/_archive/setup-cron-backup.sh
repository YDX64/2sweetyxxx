#!/bin/bash

# Cron Job Backup System Setup
echo "🔄 Setting up automatic backup system..."

# Copy backup script to server
echo "📋 Installing backup script..."
cp backup-system.sh /root/backup-system.sh
chmod +x /root/backup-system.sh

# Create cron job for daily backups
echo "⏰ Setting up cron job..."
(crontab -l 2>/dev/null; echo "0 2 * * * /root/backup-system.sh >> /var/log/backup.log 2>&1") | crontab -

# Create cron job for weekly cleanup
(crontab -l 2>/dev/null; echo "0 3 * * 0 find /data/backups -name 'soulmate-app_*' -mtime +30 -delete") | crontab -

# Create log rotation
echo "📝 Setting up log rotation..."
cat > /etc/logrotate.d/backup << EOF
/var/log/backup.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF

# Create backup monitoring script
cat > /root/backup-monitor.sh << 'EOF'
#!/bin/bash

BACKUP_DIR="/data/backups"
LAST_BACKUP=$(ls -t $BACKUP_DIR/soulmate-app_* 2>/dev/null | head -1)

if [ -z "$LAST_BACKUP" ]; then
    echo "❌ No backups found!"
    exit 1
fi

BACKUP_AGE=$(stat -c %Y "$LAST_BACKUP")
CURRENT_TIME=$(date +%s)
AGE_HOURS=$(( (CURRENT_TIME - BACKUP_AGE) / 3600 ))

if [ $AGE_HOURS -gt 25 ]; then
    echo "⚠️ Last backup is $AGE_HOURS hours old!"
    # Send alert notification here
    exit 1
else
    echo "✅ Backup is fresh ($AGE_HOURS hours old)"
fi
EOF

chmod +x /root/backup-monitor.sh

# Add monitoring to cron (check every 6 hours)
(crontab -l 2>/dev/null; echo "0 */6 * * * /root/backup-monitor.sh") | crontab -

echo "✅ Backup system setup completed!"
echo "📊 Backup schedule:"
echo "   - Daily backup: 02:00 AM"
echo "   - Weekly cleanup: Sunday 03:00 AM"
echo "   - Monitoring: Every 6 hours"
echo "📍 Backup location: /data/backups"
echo "📝 Log file: /var/log/backup.log" 