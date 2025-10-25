#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}2Sweety Stripe Setup Script${NC}"
echo -e "${BLUE}===========================${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
    echo "Please install it first: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo -e "${GREEN}Step 1: Stripe API Keys${NC}"
echo "Please get your keys from: https://dashboard.stripe.com/apikeys"
echo ""

# Get Stripe keys from user
read -p "Enter your Stripe Secret Key (sk_test_...): " STRIPE_SECRET_KEY
read -p "Enter your Stripe Publishable Key (pk_test_...): " STRIPE_PUBLISHABLE_KEY

# Update local .env file
echo -e "\n${YELLOW}Updating local .env file...${NC}"
sed -i.bak "s|STRIPE_SECRET_KEY=.*|STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY|" .env
sed -i.bak "s|VITE_STRIPE_PUBLISHABLE_KEY=.*|VITE_STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY|" .env

echo -e "${GREEN}✓ Local .env updated${NC}"

# Add secrets to Supabase Vault
echo -e "\n${YELLOW}Adding secrets to Supabase Vault...${NC}"
echo "This will store your Stripe keys securely in Supabase for edge functions."

# Login to Supabase if needed
supabase login

# Set secrets in Supabase
supabase secrets set STRIPE_SECRET_KEY=$STRIPE_SECRET_KEY
supabase secrets set STRIPE_PUBLISHABLE_KEY=$STRIPE_PUBLISHABLE_KEY

echo -e "${GREEN}✓ Secrets added to Supabase Vault${NC}"

echo -e "\n${GREEN}Step 2: Create Stripe Products${NC}"
echo "Now you need to create products in Stripe Dashboard:"
echo "1. Go to: https://dashboard.stripe.com/products"
echo "2. Create these products with prices:"
echo ""
echo -e "${BLUE}Silver Tier:${NC}"
echo "  - Name: 2Sweety Silver"
echo "  - Monthly: \$9.99"
echo "  - Yearly: \$99.99"
echo ""
echo -e "${BLUE}Gold Tier:${NC}"
echo "  - Name: 2Sweety Gold"
echo "  - Monthly: \$19.99"
echo "  - Yearly: \$199.99"
echo ""
echo -e "${BLUE}Platinum Tier:${NC}"
echo "  - Name: 2Sweety Platinum"
echo "  - Monthly: \$29.99"
echo "  - Yearly: \$299.99"
echo ""

echo -e "${YELLOW}Press Enter when you've created all products...${NC}"
read

echo -e "\n${GREEN}Step 3: Update Price IDs${NC}"
echo "Please enter the Price IDs from Stripe (format: price_xxxxx):"
echo ""

read -p "Silver Monthly Price ID: " SILVER_MONTHLY_ID
read -p "Silver Yearly Price ID: " SILVER_YEARLY_ID
read -p "Gold Monthly Price ID: " GOLD_MONTHLY_ID
read -p "Gold Yearly Price ID: " GOLD_YEARLY_ID
read -p "Platinum Monthly Price ID: " PLATINUM_MONTHLY_ID
read -p "Platinum Yearly Price ID: " PLATINUM_YEARLY_ID

# Update edge functions with new Price IDs
echo -e "\n${YELLOW}Updating edge functions with Price IDs...${NC}"

# Update create-checkout function
sed -i.bak "s|'price_1QSNw4P5YF3DuQzx8kE3HQRE'|'$SILVER_MONTHLY_ID'|g" supabase/functions/create-checkout/index.ts
sed -i.bak "s|'price_silver_yearly'|'$SILVER_YEARLY_ID'|g" supabase/functions/create-checkout/index.ts
sed -i.bak "s|'price_1QSNw5P5YF3DuQzxwQB3KZVU'|'$GOLD_MONTHLY_ID'|g" supabase/functions/create-checkout/index.ts
sed -i.bak "s|'price_gold_yearly'|'$GOLD_YEARLY_ID'|g" supabase/functions/create-checkout/index.ts
sed -i.bak "s|'price_1QSNw6P5YF3DuQzxMNOP4RST'|'$PLATINUM_MONTHLY_ID'|g" supabase/functions/create-checkout/index.ts
sed -i.bak "s|'price_platinum_yearly'|'$PLATINUM_YEARLY_ID'|g" supabase/functions/create-checkout/index.ts

# Update stripe-webhook function
sed -i.bak "s|'price_1QSNw4P5YF3DuQzx8kE3HQRE': 'silver'|'$SILVER_MONTHLY_ID': 'silver'|g" supabase/functions/stripe-webhook/index.ts
sed -i.bak "s|'price_1QSNw5P5YF3DuQzxwQB3KZVU': 'gold'|'$GOLD_MONTHLY_ID': 'gold'|g" supabase/functions/stripe-webhook/index.ts
sed -i.bak "s|'price_1QSNw6P5YF3DuQzxMNOP4RST': 'platinum'|'$PLATINUM_MONTHLY_ID': 'platinum'|g" supabase/functions/stripe-webhook/index.ts

# Add yearly price IDs to webhook
sed -i.bak "/const PRICE_ID_TO_TIER: Record<string, string> = {/a\\
  '$SILVER_YEARLY_ID': 'silver',\\
  '$GOLD_YEARLY_ID': 'gold',\\
  '$PLATINUM_YEARLY_ID': 'platinum'," supabase/functions/stripe-webhook/index.ts

# Clean up backup files
rm -f supabase/functions/create-checkout/index.ts.bak
rm -f supabase/functions/stripe-webhook/index.ts.bak

echo -e "${GREEN}✓ Edge functions updated with Price IDs${NC}"

# Deploy edge functions
echo -e "\n${YELLOW}Deploying edge functions...${NC}"
supabase functions deploy create-checkout
supabase functions deploy create-checkout-mobile
supabase functions deploy stripe-webhook

echo -e "${GREEN}✓ Edge functions deployed${NC}"

echo -e "\n${GREEN}Step 4: Configure Webhook${NC}"
echo "1. Go to: https://dashboard.stripe.com/webhooks"
echo "2. Click 'Add endpoint'"
echo "3. Enter this URL: https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/stripe-webhook"
echo "4. Select these events:"
echo "   - checkout.session.completed"
echo "   - customer.subscription.created"
echo "   - customer.subscription.updated"
echo "   - customer.subscription.deleted"
echo "   - invoice.payment_succeeded"
echo "   - payment_intent.succeeded"
echo ""
echo -e "${YELLOW}After creating the webhook, you'll see a 'Signing secret' (whsec_...)${NC}"
read -p "Enter your Webhook Signing Secret: " WEBHOOK_SECRET

# Add webhook secret to Supabase
supabase secrets set STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET

echo -e "${GREEN}✓ Webhook secret added${NC}"

echo -e "\n${GREEN}🎉 Stripe setup complete!${NC}"
echo ""
echo "To test your integration:"
echo "1. Start your dev server: npm run dev"
echo "2. Go to /upgrades page"
echo "3. Try purchasing a subscription with test card: 4242 4242 4242 4242"
echo ""
echo -e "${BLUE}For mobile app integration:${NC}"
echo "- Update your app with the publishable key: $STRIPE_PUBLISHABLE_KEY"
echo "- The mobile checkout endpoint is ready at: /functions/v1/create-checkout-mobile"