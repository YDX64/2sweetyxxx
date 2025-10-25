#!/bin/bash

echo "🔧 Setting up deployment hooks in Coolify..."

# 1. Copy scripts to server
echo "📋 Installing backup scripts..."
cp dev-backup-system.sh /root/dev-backup-system.sh
cp pre-deployment-hook.sh /root/pre-deployment-hook.sh
chmod +x /root/dev-backup-system.sh
chmod +x /root/pre-deployment-hook.sh

# 2. Create directories
mkdir -p /data/dev-backups
mkdir -p /data/deployment-logs

# 3. Test scripts
echo "🧪 Testing backup system..."
/root/dev-backup-system.sh

echo "✅ Deployment hooks setup completed!"
echo ""
echo "📋 COOLIFY CONFIGURATION:"
echo "1. Go to Coolify Dashboard"
echo "2. Select your application"
echo "3. Go to 'Advanced' or 'Scripts' section"
echo "4. Add Pre-deployment command:"
echo "   /root/pre-deployment-hook.sh"
echo ""
echo "📦 MANUAL BACKUP COMMANDS:"
echo "   Development snapshot: /root/dev-backup-system.sh"
echo "   Quick rollback: /data/dev-backups/quick_rollback.sh"
echo ""
echo "📍 BACKUP LOCATIONS:"
echo "   Development backups: /data/dev-backups/"
echo "   Deployment logs: /data/deployment-logs/"
echo "   Hostinger backups: (Hostinger panel)" 