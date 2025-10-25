#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Stripe Integration Test${NC}"
echo -e "${BLUE}======================${NC}"
echo ""

# Check if secrets are set in Supabase
echo -e "${YELLOW}Checking Supabase secrets...${NC}"
SECRETS_LIST=$(supabase secrets list 2>&1)

if echo "$SECRETS_LIST" | grep -q "STRIPE_SECRET_KEY"; then
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY is configured${NC}"
else
    echo -e "${RED}✗ STRIPE_SECRET_KEY is NOT configured${NC}"
fi

if echo "$SECRETS_LIST" | grep -q "STRIPE_PUBLISHABLE_KEY"; then
    echo -e "${GREEN}✓ STRIPE_PUBLISHABLE_KEY is configured${NC}"
else
    echo -e "${RED}✗ STRIPE_PUBLISHABLE_KEY is NOT configured${NC}"
fi

if echo "$SECRETS_LIST" | grep -q "STRIPE_WEBHOOK_SECRET"; then
    echo -e "${GREEN}✓ STRIPE_WEBHOOK_SECRET is configured${NC}"
else
    echo -e "${RED}✗ STRIPE_WEBHOOK_SECRET is NOT configured${NC}"
fi

# Check local .env
echo -e "\n${YELLOW}Checking local .env file...${NC}"
if grep -q "^STRIPE_SECRET_KEY=sk_test_" .env; then
    echo -e "${GREEN}✓ Local STRIPE_SECRET_KEY looks valid${NC}"
else
    echo -e "${RED}✗ Local STRIPE_SECRET_KEY needs to be updated${NC}"
fi

if grep -q "^VITE_STRIPE_PUBLISHABLE_KEY=pk_test_" .env; then
    echo -e "${GREEN}✓ Local VITE_STRIPE_PUBLISHABLE_KEY looks valid${NC}"
else
    echo -e "${RED}✗ Local VITE_STRIPE_PUBLISHABLE_KEY needs to be updated${NC}"
fi

# Test edge functions
echo -e "\n${YELLOW}Testing edge functions...${NC}"
echo "Note: These tests require valid Stripe keys to work properly."

# Get a test user token (you'll need to be logged in)
echo -e "\n${BLUE}To test the checkout function:${NC}"
echo "1. Make sure your dev server is running: npm run dev"
echo "2. Log in to your app"
echo "3. Go to: http://localhost:5173/upgrades"
echo "4. Click on any 'Choose Plan' button"
echo "5. You should be redirected to Stripe Checkout"
echo ""
echo -e "${BLUE}Test cards to use:${NC}"
echo "- Success: 4242 4242 4242 4242"
echo "- 3D Secure: 4000 0025 0000 3155"
echo "- Declined: 4000 0000 0000 9995"
echo ""
echo -e "${BLUE}To verify webhook is working:${NC}"
echo "1. Complete a test purchase"
echo "2. Check Stripe Dashboard > Webhooks > Your webhook"
echo "3. Look for successful webhook attempts"
echo "4. Check if user's subscription was updated in database"

echo -e "\n${YELLOW}Quick database check:${NC}"
echo "Run this SQL in Supabase to see subscription updates:"
echo ""
echo "SELECT "
echo "  p.email,"
echo "  p.role,"
echo "  s.subscription_tier,"
echo "  s.status,"
echo "  s.current_period_end"
echo "FROM profiles p"
echo "LEFT JOIN subscriptions s ON p.id = s.user_id"
echo "WHERE p.role != 'registered'"
echo "ORDER BY s.updated_at DESC"
echo "LIMIT 10;"