#!/bin/bash

# MANUAL COOLIFY DEPLOYMENT SCRIPT
# This script helps you manually trigger a deployment to Coolify
# when GitHub Actions are failing

echo "=========================================="
echo "🚀 COOLIFY MANUAL DEPLOYMENT SCRIPT"
echo "=========================================="
echo ""
echo "This script will help you deploy your language fix to 2sweety.com"
echo ""

# Option 1: Using Coolify CLI (if available)
echo "📋 Option 1: Coolify CLI Deployment"
echo "------------------------------------"
echo "If you have Coolify CLI installed, run:"
echo ""
echo "coolify deploy --app=2sweety --force --no-cache"
echo ""

# Option 2: Using Coolify API
echo "📋 Option 2: Coolify API Deployment"
echo "------------------------------------"
echo "Replace YOUR_COOLIFY_TOKEN with your actual token:"
echo ""
cat << 'EOF'
curl -X POST "http://45.9.190.79:8000/api/v1/applications/6/deploy" \
  -H "Authorization: Bearer YOUR_COOLIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "force_rebuild": true,
    "clear_cache": true,
    "branch": "main"
  }'
EOF
echo ""

# Option 3: Direct Docker Commands (if you have SSH access)
echo "📋 Option 3: Direct Docker Deployment (Requires SSH)"
echo "-----------------------------------------------------"
echo "If you have SSH access to the server, run these commands:"
echo ""
cat << 'EOF'
# SSH into the server
ssh root@2sweety.com

# Navigate to your application directory
cd /var/www/2sweety

# Pull latest code from GitHub
git pull origin main

# Build with no cache to ensure fresh build
docker build --no-cache -t 2sweety-web:latest .

# Stop current container
docker stop c4c084wkowosc4wosg4sw8os-222702648648

# Remove old container
docker rm c4c084wkowosc4wosg4sw8os-222702648648

# Run new container
docker run -d \
  --name c4c084wkowosc4wosg4sw8os-222702648648 \
  -p 80:80 \
  -p 443:443 \
  --restart unless-stopped \
  2sweety-web:latest

# Verify deployment
docker logs c4c084wkowosc4wosg4sw8os-222702648648 --tail 50
EOF
echo ""

# Option 4: Coolify Web UI
echo "📋 Option 4: Coolify Web UI (EASIEST)"
echo "--------------------------------------"
echo "1. Open Coolify Dashboard:"
echo "   http://45.9.190.79:8000 or http://2sweety.com:8000"
echo ""
echo "2. Log in with your credentials"
echo ""
echo "3. Find your application: 2sweety.com"
echo ""
echo "4. Click the 'Redeploy' button"
echo ""
echo "5. IMPORTANT: Check these options:"
echo "   ✅ Clear Build Cache"
echo "   ✅ Force Rebuild"
echo ""
echo "6. Click 'Deploy' and wait 5-10 minutes"
echo ""

# Verification Script
echo "=========================================="
echo "✅ VERIFICATION SCRIPT"
echo "=========================================="
echo ""
echo "After deployment, run this command to verify the fix:"
echo ""
echo 'curl -s https://2sweety.com/static/js/main.*.js | grep -c "I18nextProvider" && echo "✅ Language Fix Deployed!" || echo "❌ Not deployed yet"'
echo ""

# Test Commands
echo "=========================================="
echo "🧪 BROWSER TEST COMMANDS"
echo "=========================================="
echo ""
echo "Open https://2sweety.com and run these in browser console (F12):"
echo ""
echo "// Test 1: Check if i18n is initialized"
echo "console.log(window.i18n ? '✅ i18n loaded' : '❌ i18n missing');"
echo ""
echo "// Test 2: Try switching language"
echo "localStorage.setItem('language', 'es'); location.reload();"
echo ""
echo "// Test 3: Check available languages"
echo "console.log(window.i18n?.languages || 'No languages found');"
echo ""

echo "=========================================="
echo "📝 NOTES"
echo "=========================================="
echo ""
echo "The issue is that Docker is using cached layers from before the"
echo "I18nextProvider fix was added. A force rebuild will solve this."
echo ""
echo "Your code in GitHub is correct - it just needs to be deployed."
echo ""
echo "Current commits with the fix:"
echo "- b906e3f: Added I18nextProvider wrapper"
echo "- 384642b: Fixed language switching"
echo "- Latest PR #4: Additional homepage fixes"
echo ""