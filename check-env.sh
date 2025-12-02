#!/bin/bash
# Environment Variable Checker for 2Sweety

echo "========================================"
echo "2Sweety Environment Variable Checker"
echo "========================================"
echo ""

echo "1. Checking Shell Environment Variable:"
if [ -z "$REACT_APP_GOOGLE_CLIENT_ID" ]; then
    echo "   ✓ Shell variable is NOT set (GOOD)"
else
    echo "   ✗ Shell variable IS set: $REACT_APP_GOOGLE_CLIENT_ID"
    if [ "$REACT_APP_GOOGLE_CLIENT_ID" = "your_google_client_id_here.apps.googleusercontent.com" ]; then
        echo "   ✗ ERROR: Shell variable contains PLACEHOLDER value!"
        echo "   → Run: unset REACT_APP_GOOGLE_CLIENT_ID"
    else
        echo "   ✓ Shell variable has a real Client ID"
    fi
fi
echo ""

echo "2. Checking .env file:"
if [ -f ".env" ]; then
    ENV_VALUE=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env | cut -d '=' -f2)
    if [ -z "$ENV_VALUE" ]; then
        echo "   ✗ .env exists but no REACT_APP_GOOGLE_CLIENT_ID found"
    else
        echo "   ✓ .env contains: $ENV_VALUE"
    fi
else
    echo "   ✗ .env file NOT found"
fi
echo ""

echo "3. Checking .env.local file:"
if [ -f ".env.local" ]; then
    ENV_LOCAL_VALUE=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env.local | cut -d '=' -f2)
    if [ -z "$ENV_LOCAL_VALUE" ]; then
        echo "   ✗ .env.local exists but no REACT_APP_GOOGLE_CLIENT_ID found"
    else
        echo "   ✓ .env.local contains: $ENV_LOCAL_VALUE"
    fi
else
    echo "   ✗ .env.local file NOT found"
fi
echo ""

echo "4. Checking .env.production file:"
if [ -f ".env.production" ]; then
    ENV_PROD_VALUE=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env.production | cut -d '=' -f2)
    if [ -z "$ENV_PROD_VALUE" ]; then
        echo "   ✗ .env.production exists but no REACT_APP_GOOGLE_CLIENT_ID found"
    else
        echo "   ✓ .env.production contains: $ENV_PROD_VALUE"
    fi
else
    echo "   ✗ .env.production file NOT found"
fi
echo ""

echo "========================================"
echo "Expected Google Client ID:"
echo "630419143615-bjtr3e3bfrjtr65qgsb4sgu6cle4t2ar.apps.googleusercontent.com"
echo "========================================"
echo ""

echo "5. Checking Node.js environment (what React will see):"
NODE_VALUE=$(node -e "console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID || 'NOT SET')")
echo "   Node sees: $NODE_VALUE"
if [ "$NODE_VALUE" = "NOT SET" ]; then
    echo "   ✓ Node doesn't see shell variable (GOOD - will use .env files)"
elif [ "$NODE_VALUE" = "your_google_client_id_here.apps.googleusercontent.com" ]; then
    echo "   ✗ PROBLEM: Node sees the PLACEHOLDER value!"
    echo "   → This is why Google login shows 'coming soon'"
    echo "   → Fix: Run 'unset REACT_APP_GOOGLE_CLIENT_ID' or restart terminal"
else
    echo "   ✓ Node sees a real Client ID"
fi
echo ""

echo "========================================"
echo "Recommendations:"
echo "========================================"

if [ "$REACT_APP_GOOGLE_CLIENT_ID" = "your_google_client_id_here.apps.googleusercontent.com" ] || [ "$NODE_VALUE" = "your_google_client_id_here.apps.googleusercontent.com" ]; then
    echo "✗ ISSUE DETECTED: Placeholder value is active"
    echo ""
    echo "Fix Option 1 (Quick):"
    echo "  unset REACT_APP_GOOGLE_CLIENT_ID"
    echo "  npm start"
    echo ""
    echo "Fix Option 2 (Permanent):"
    echo "  npm run dev"
    echo ""
    echo "Fix Option 3 (Clean Start):"
    echo "  Close terminal completely"
    echo "  Open new terminal"
    echo "  cd /Users/max/Downloads/2sweet"
    echo "  npm start"
else
    echo "✓ Configuration looks good!"
    echo ""
    echo "If Google login still doesn't work:"
    echo "  1. Stop your app (Ctrl+C)"
    echo "  2. Run: npm run dev"
    echo "  3. Test in browser"
fi

echo "========================================"
