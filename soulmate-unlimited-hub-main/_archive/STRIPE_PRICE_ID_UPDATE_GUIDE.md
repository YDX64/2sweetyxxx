# Stripe Price ID Update Guide

After creating your products in Stripe, you need to update the Price IDs in two edge functions:

## 1. Update create-checkout function

File: `/supabase/functions/create-checkout/index.ts`

Find this section (around line 40):
```typescript
const PLAN_TO_PRICE_ID: Record<string, Record<string, string>> = {
  'silver': {
    'monthly': 'price_1QSNw4P5YF3DuQzx8kE3HQRE',
    'yearly': 'price_silver_yearly'
  },
  'gold': {
    'monthly': 'price_1QSNw5P5YF3DuQzxwQB3KZVU',
    'yearly': 'price_gold_yearly'
  },
  'platinum': {
    'monthly': 'price_1QSNw6P5YF3DuQzxMNOP4RST',
    'yearly': 'price_platinum_yearly'
  }
};
```

Replace with your actual Price IDs:
```typescript
const PLAN_TO_PRICE_ID: Record<string, Record<string, string>> = {
  'silver': {
    'monthly': 'YOUR_SILVER_MONTHLY_PRICE_ID',
    'yearly': 'YOUR_SILVER_YEARLY_PRICE_ID'
  },
  'gold': {
    'monthly': 'YOUR_GOLD_MONTHLY_PRICE_ID',
    'yearly': 'YOUR_GOLD_YEARLY_PRICE_ID'
  },
  'platinum': {
    'monthly': 'YOUR_PLATINUM_MONTHLY_PRICE_ID',
    'yearly': 'YOUR_PLATINUM_YEARLY_PRICE_ID'
  }
};
```

## 2. Update stripe-webhook function

File: `/supabase/functions/stripe-webhook/index.ts`

Find this section (around line 17):
```typescript
const PRICE_ID_TO_TIER: Record<string, string> = {
  'price_1QSNw4P5YF3DuQzx8kE3HQRE': 'silver',
  'price_1QSNw5P5YF3DuQzxwQB3KZVU': 'gold',
  'price_1QSNw6P5YF3DuQzxMNOP4RST': 'platinum',
  'price_silver_monthly': 'silver',
  'price_gold_monthly': 'gold',
  'price_platinum_monthly': 'platinum',
};
```

Replace with your actual Price IDs:
```typescript
const PRICE_ID_TO_TIER: Record<string, string> = {
  'YOUR_SILVER_MONTHLY_PRICE_ID': 'silver',
  'YOUR_SILVER_YEARLY_PRICE_ID': 'silver',
  'YOUR_GOLD_MONTHLY_PRICE_ID': 'gold',
  'YOUR_GOLD_YEARLY_PRICE_ID': 'gold',
  'YOUR_PLATINUM_MONTHLY_PRICE_ID': 'platinum',
  'YOUR_PLATINUM_YEARLY_PRICE_ID': 'platinum',
};
```

## 3. Deploy the updated functions

After updating both files, deploy them:

```bash
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
```

## Example Price IDs

Stripe Price IDs look like this:
- `price_1Q2X4YP5YF3DuQzxABCDEFGH` (for monthly plans)
- `price_1Q2X5ZP5YF3DuQzxIJKLMNOP` (for yearly plans)

Make sure to copy them exactly as shown in your Stripe Dashboard.