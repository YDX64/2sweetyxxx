# ⚠️ ACİL ÇÖZÜM - coldwar6464@gmail.com Abonelik Sorunu

## 🚨 SORUN
coldwar6464@gmail.com kullanıcısı Silver paket satın aldı ama sistem aboneliği kaydetmedi çünkü webhook handler eksikti.

## ✅ HEMEN YAPILACAKLAR

### 1. Kullanıcının Aboneliğini Manuel Düzelt

1. **Supabase Dashboard'a git**: https://supabase.com/dashboard
2. **Projeyi seç**: kvrlzpdyeezmhjiiwfnp 
3. **SQL Editor'a git** (sol menüden)
4. **Bu SQL script'ini çalıştır**:

```sql
-- Fix coldwar6464@gmail.com subscription
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
```

### 2. Edge Functions Deploy Et

Terminal'de şu komutları çalıştır:

```bash
# Supabase CLI kurulu değilse
npm install -g supabase

# Projeyi link et (eğer henüz bitmemişse)
supabase link --project-ref kvrlzpdyeezmhjiiwfnp

# Fonksiyonları deploy et
supabase functions deploy create-checkout --no-verify-jwt
supabase functions deploy stripe-webhook --no-verify-jwt
```

### 3. Stripe Webhook Endpoint Ekle

1. **Stripe Dashboard'a git**: https://dashboard.stripe.com
2. **Webhooks** bölümüne git
3. **Add endpoint** tıkla
4. **Endpoint URL**: `https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/stripe-webhook`
5. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated` 
   - `invoice.payment_succeeded`
   - `customer.subscription.deleted`
6. **Add endpoint** tıkla
7. **Webhook secret**'i kopyala

### 4. Environment Variables Ekle

Supabase Dashboard → Settings → Environment variables:

```
STRIPE_SECRET_KEY=sk_live_... (gerçek Stripe secret key)
STRIPE_WEBHOOK_SECRET=whsec_... (yukarıda kopyaladığın secret)
```

## 🔍 DOĞRULAMA

1. coldwar6464@gmail.com ile giriş yap
2. Profile → Settings → Subscription kontrol et
3. Silver özellikleri aktif mi kontrol et (50 günlük like, "Kim beğendi" vs.)

## 📞 KULLANICIYA BİLGİ VER

"Aboneliğiniz aktif edildi! Sistem geçici bir sorunda dolayı otomatik olarak güncellenmemişti. Şimdi Silver paket özelliklerinizin tümünü kullanabilirsiniz. Rahatsızlık için özür dileriz."

## 🛠️ GELECEKTEKİ ÖDEMELER

Artık webhook sistemi kuruldu, yeni ödemeler otomatik olarak işlenecek.