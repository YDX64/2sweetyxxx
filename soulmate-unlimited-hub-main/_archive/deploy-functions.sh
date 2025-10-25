#!/bin/bash

# Supabase Edge Functions Deployment Script
# coldwar6464@gmail.com kullanıcısının abonelik sorunu için webhook sistemini düzelt

echo "🚀 Deploying Supabase Edge Functions..."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Deploy create-checkout function
echo "📦 Deploying create-checkout function..."
supabase functions deploy create-checkout --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ create-checkout function deployed successfully"
else
    echo "❌ Failed to deploy create-checkout function"
    exit 1
fi

# Deploy stripe-webhook function
echo "📦 Deploying stripe-webhook function..."
supabase functions deploy stripe-webhook --no-verify-jwt

if [ $? -eq 0 ]; then
    echo "✅ stripe-webhook function deployed successfully"
else
    echo "❌ Failed to deploy stripe-webhook function"
    exit 1
fi

echo ""
echo "🎉 All functions deployed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Set up Stripe webhook endpoint:"
echo "   URL: https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/stripe-webhook"
echo "   Events: customer.subscription.created, customer.subscription.updated, invoice.payment_succeeded, customer.subscription.deleted"
echo ""
echo "2. Add these environment variables to Supabase:"
echo "   STRIPE_SECRET_KEY=sk_live_..."
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "3. Fix coldwar6464@gmail.com subscription manually"
echo ""

# Create SQL script to fix the user's subscription
cat > fix_coldwar6464_subscription.sql << 'EOF'
-- Fix coldwar6464@gmail.com subscription
-- Run this in Supabase SQL Editor

DO $$
DECLARE
    v_user_id UUID;
    v_email TEXT := 'coldwar6464@gmail.com';
    v_tier TEXT := 'silver';
    v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '30 days';
BEGIN
    -- Find user
    SELECT id INTO v_user_id 
    FROM profiles 
    WHERE email = v_email;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User % not found', v_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found user: %', v_user_id;
    
    -- Update profiles table
    UPDATE profiles
    SET 
        role = v_tier,
        subscription_tier = v_tier,
        subscription_status = 'active',
        subscription_expires_at = v_expires_at,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RAISE NOTICE 'Updated profiles table';
    
    -- Update/insert subscribers table
    INSERT INTO subscribers (
        user_id,
        email,
        subscribed,
        subscription_tier,
        subscription_end,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        v_email,
        true,
        v_tier,
        v_expires_at,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        subscribed = true,
        subscription_tier = v_tier,
        subscription_end = v_expires_at,
        updated_at = NOW();
    
    RAISE NOTICE 'Updated subscribers table';
    
    -- Update/insert subscriptions table if exists
    INSERT INTO subscriptions (
        user_id,
        status,
        subscription_tier,
        current_period_end,
        created_at,
        updated_at
    ) VALUES (
        v_user_id,
        'active',
        v_tier,
        v_expires_at,
        NOW(),
        NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
        status = 'active',
        subscription_tier = v_tier,
        current_period_end = v_expires_at,
        updated_at = NOW();
    
    RAISE NOTICE 'Updated subscriptions table';
    
    RAISE NOTICE 'Successfully fixed subscription for %', v_email;
    
END $$;

-- Verify the fix
SELECT 
    id,
    email,
    role,
    subscription_tier,
    subscription_status,
    subscription_expires_at
FROM profiles 
WHERE email = 'coldwar6464@gmail.com';
EOF

echo "📄 Created fix_coldwar6464_subscription.sql"
echo "   Run this SQL script in Supabase Dashboard to fix the user's subscription"