# 2Sweety Alternative Payment Methods Guide

Bu rehber, Stripe dışındaki ödeme yöntemlerini (Manuel Abonelik, Apple Pay, Google Pay) nasıl kullanacağınızı açıklar.

## İçindekiler
1. [Genel Bakış](#1-genel-bakış)
2. [Manuel Abonelik Yönetimi](#2-manuel-abonelik-yönetimi)
3. [Apple Pay Entegrasyonu](#3-apple-pay-entegrasyonu)
4. [Google Pay Entegrasyonu](#4-google-pay-entegrasyonu)
5. [Mobil Uygulama Entegrasyonu](#5-mobil-uygulama-entegrasyonu)
6. [Test ve Doğrulama](#6-test-ve-doğrulama)

## 1. Genel Bakış

2Sweety, birden fazla ödeme yöntemi destekler:

### Mevcut Ödeme Yöntemleri
1. **Stripe** - Kredi kartı ödemeleri (ayrı rehberde)
2. **Manuel Abonelik** - Admin panelinden manuel olarak
3. **Apple Pay** - iOS cihazlar için
4. **Google Pay** - Android ve web için

### Sistem Mimarisi
```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────┐
│   Web Client    │────▶│ Payment Service  │────▶│   Supabase   │
└─────────────────┘     └──────────────────┘     └──────────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
              ┌─────▼─────┐        ┌─────▼─────┐
              │Apple Pay  │        │Google Pay │
              └───────────┘        └───────────┘
```

## 2. Manuel Abonelik Yönetimi

### 2.1 Admin Panel Erişimi
Manuel abonelik yönetimi sadece admin ve yetkili kullanıcılar tarafından kullanılabilir.

**Erişim URL**: `/admin/manual-subscription`

### 2.2 Kullanım Adımları
1. Admin paneline giriş yapın
2. "Manual Subscription Management" sayfasına gidin
3. Kullanıcı listesinden abonelik verilecek kullanıcıyı seçin
4. Abonelik tier'ını seçin (Silver, Gold, Platinum)
5. Süreyi seçin (7, 30, 90, 365 gün)
6. "Grant Subscription" butonuna tıklayın

### 2.3 Kod Yapısı
Manuel abonelik işlemi `adminService.grantSubscription()` fonksiyonu ile yapılır:

```typescript
// client/src/services/adminService.ts
async grantSubscription(userId: string, tier: string, days: number) {
  // 1. Profile güncelleme
  await supabase
    .from('profiles')
    .update({ role: tier, subscription_status: 'active' })
    .eq('id', userId);

  // 2. Subscribers tablosu güncelleme
  await supabase
    .from('subscribers')
    .upsert({
      user_id: userId,
      subscribed: true,
      subscription_tier: tier,
      subscription_end: new Date(Date.now() + days * 24 * 60 * 60 * 1000)
    });
}
```

### 2.4 Yetkilendirme
Sadece şu roller manuel abonelik verebilir:
- `admin`
- `manage_subscriptions` yetkisine sahip kullanıcılar

## 3. Apple Pay Entegrasyonu

### 3.1 Ön Gereksinimler
1. Apple Developer hesabı
2. Merchant ID oluşturma
3. Domain doğrulama

### 3.2 Apple Developer Ayarları
1. [developer.apple.com](https://developer.apple.com) giriş yapın
2. **Certificates, Identifiers & Profiles** → **Identifiers** → **Merchant IDs**
3. Yeni Merchant ID oluşturun: `merchant.com.2sweety.com`
4. Domain doğrulama için dosyayı indirin ve sunucuya yükleyin

### 3.3 Ortam Değişkenleri
```bash
# .env dosyasına ekleyin
VITE_APPLE_PAY_MERCHANT_ID=merchant.com.2sweety.com
VITE_APPLE_PAY_DOMAIN=2sweety.com
```

### 3.4 Edge Functions
Apple Pay için 2 edge function gerekli:

#### apple-pay-validate
```typescript
// supabase/functions/apple-pay-validate/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(async (req: Request) => {
  const { validationURL, displayName, domainName } = await req.json();
  
  // Apple'a merchant validation isteği gönder
  const response = await fetch(validationURL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      merchantIdentifier: Deno.env.get('APPLE_PAY_MERCHANT_ID'),
      displayName,
      initiative: 'web',
      initiativeContext: domainName
    })
  });
  
  const merchantSession = await response.json();
  
  return new Response(
    JSON.stringify({ merchantSession }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

#### apple-pay-process
```typescript
// supabase/functions/apple-pay-process/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  const { paymentToken, amount, tier, userId } = await req.json();
  
  // Apple Pay token'ı işle
  // Gerçek uygulamada payment processor'a gönderilir
  
  // Aboneliği güncelle
  await supabase
    .from('profiles')
    .update({ 
      role: tier,
      subscription_status: 'active'
    })
    .eq('id', userId);
  
  await supabase
    .from('subscribers')
    .upsert({
      user_id: userId,
      subscribed: true,
      subscription_tier: tier,
      subscription_end: calculateEndDate(tier)
    });
  
  return new Response(
    JSON.stringify({ 
      success: true,
      transactionId: generateTransactionId()
    }),
    { headers: { 'Content-Type': 'application/json' } }
  );
});
```

### 3.5 Deploy Edge Functions
```bash
supabase functions deploy apple-pay-validate
supabase functions deploy apple-pay-process
```

## 4. Google Pay Entegrasyonu

### 4.1 Google Pay Console Ayarları
1. [Google Pay Console](https://pay.google.com/business/console) giriş yapın
2. Yeni merchant hesabı oluşturun
3. Merchant ID'yi not alın

### 4.2 Ortam Değişkenleri
```bash
# .env dosyasına ekleyin
VITE_GOOGLE_PAY_MERCHANT_ID=1234567890
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_... # Google Pay Stripe tokenization için
```

### 4.3 Web Entegrasyonu
Google Pay script'i otomatik yüklenir:

```html
<!-- index.html'e otomatik eklenir -->
<script src="https://pay.google.com/gp/p/js/pay.js"></script>
```

### 4.4 Edge Function
```typescript
// supabase/functions/google-pay-process/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new (await import('https://esm.sh/stripe@14.21.0')).Stripe(
  Deno.env.get('STRIPE_SECRET_KEY')!,
  { apiVersion: '2023-10-16' }
);

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

Deno.serve(async (req: Request) => {
  const { paymentToken, amount, tier, userId } = await req.json();
  
  // Google Pay token'ı Stripe ile işle
  const paymentMethod = await stripe.paymentMethods.create({
    type: 'card',
    card: { token: paymentToken }
  });
  
  const paymentIntent = await stripe.paymentIntents.create({
    amount: amount * 100, // cents
    currency: 'usd',
    payment_method: paymentMethod.id,
    confirm: true
  });
  
  if (paymentIntent.status === 'succeeded') {
    // Aboneliği güncelle
    await supabase
      .from('profiles')
      .update({ 
        role: tier,
        subscription_status: 'active'
      })
      .eq('id', userId);
    
    return new Response(
      JSON.stringify({ 
        success: true,
        transactionId: paymentIntent.id
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  throw new Error('Payment failed');
});
```

### 4.5 Deploy
```bash
supabase functions deploy google-pay-process
```

## 5. Mobil Uygulama Entegrasyonu

### 5.1 React Native Expo - Apple Pay
```bash
# Gerekli paketleri yükle
npx expo install expo-apple-pay
```

#### app.json Güncelleme
```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.in-app-payments": ["merchant.com.2sweety.com"]
      }
    }
  }
}
```

#### Kullanım Örneği
```typescript
import * as ApplePay from 'expo-apple-pay';

const makeApplePayPayment = async (tier: SubscriptionTier) => {
  // Check availability
  const isAvailable = await ApplePay.isAvailableAsync();
  if (!isAvailable) return;
  
  // Create payment request
  const paymentRequest = {
    merchantIdentifier: 'merchant.com.2sweety.com',
    merchantCapabilities: ApplePay.MerchantCapability.threeDSecure,
    countryCode: 'US',
    currencyCode: 'USD',
    supportedNetworks: [
      ApplePay.PaymentNetwork.visa,
      ApplePay.PaymentNetwork.masterCard,
    ],
    summaryItems: [
      {
        label: tier.displayName,
        amount: tier.price.toString(),
      },
    ],
  };
  
  // Request payment
  const { paymentData } = await ApplePay.paymentRequestAsync(paymentRequest);
  
  // Process with backend
  const response = await fetch(
    'https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/apple-pay-process',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentToken: paymentData.token,
        amount: tier.price,
        tier: tier.name,
        userId: user.id
      })
    }
  );
  
  const result = await response.json();
  if (result.success) {
    // Payment successful
    await ApplePay.completePaymentAsync(
      ApplePay.PaymentAuthorizationStatus.Success
    );
  }
};
```

### 5.2 React Native Expo - Google Pay
```bash
# Gerekli paketleri yükle
npx expo install @stripe/stripe-react-native
```

#### Kullanım Örneği
```typescript
import { useGooglePay } from '@stripe/stripe-react-native';

const { isGooglePaySupported, initGooglePay, presentGooglePay } = useGooglePay();

const makeGooglePayPayment = async (tier: SubscriptionTier) => {
  if (!await isGooglePaySupported()) return;
  
  // Initialize Google Pay
  const { error: initError } = await initGooglePay({
    merchantName: '2Sweety',
    countryCode: 'US',
    billingAddressConfig: {
      format: 'FULL',
      isPhoneNumberRequired: false,
      isRequired: true,
    },
    existingPaymentMethodRequired: false,
    isEmailRequired: true,
  });
  
  if (initError) return;
  
  // Present Google Pay
  const { error: presentError } = await presentGooglePay({
    clientSecret: paymentIntent.client_secret,
    forSetupIntent: false,
  });
  
  if (!presentError) {
    // Payment successful
  }
};
```

## 6. Test ve Doğrulama

### 6.1 Manuel Abonelik Test
1. Test kullanıcısı oluşturun
2. Admin panelinden manuel abonelik verin
3. Kullanıcının profilinde tier'ın güncellendiğini kontrol edin
4. Subscribers tablosunda kayıt olduğunu doğrulayın

### 6.2 Apple Pay Test (Sandbox)
1. iOS Simulator veya test cihazında
2. Sandbox test kartı ekleyin
3. Ödeme yapın ve başarılı olduğunu doğrulayın

### 6.3 Google Pay Test
Test kartları:
- 4111 1111 1111 1111 (Visa)
- 5555 5555 5555 4444 (Mastercard)

### 6.4 Veritabanı Kontrolleri
```sql
-- Kullanıcı aboneliğini kontrol et
SELECT * FROM profiles WHERE id = 'user-id';
SELECT * FROM subscribers WHERE user_id = 'user-id';

-- Son işlemleri kontrol et
SELECT * FROM payment_history 
WHERE user_id = 'user-id' 
ORDER BY created_at DESC;
```

## Sorun Giderme

### Apple Pay Görünmüyor
1. HTTPS üzerinde çalıştığınızdan emin olun
2. Domain doğrulamasının tamamlandığını kontrol edin
3. iOS Safari'de test edin

### Google Pay Çalışmıyor
1. Google Pay API script'inin yüklendiğini kontrol edin
2. Merchant ID'nin doğru olduğunu kontrol edin
3. HTTPS üzerinde çalıştığınızdan emin olun

### Manuel Abonelik Başarısız
1. Admin yetkilerinizi kontrol edin
2. RLS politikalarını kontrol edin
3. Supabase loglarını inceleyin

## Güvenlik Notları

1. **Yetkilendirme**: Tüm ödeme işlemleri authenticated kullanıcı gerektirir
2. **Validasyon**: Server-side validasyon yapılmalı
3. **Logging**: Tüm ödeme işlemleri loglanmalı
4. **Encryption**: Hassas veriler şifrelenmiş olarak saklanmalı
5. **PCI Compliance**: Kredi kartı bilgileri asla saklanmamalı

## Destek
- Apple Pay: [developer.apple.com/apple-pay](https://developer.apple.com/apple-pay/)
- Google Pay: [developers.google.com/pay](https://developers.google.com/pay)
- Supabase: [supabase.com/docs](https://supabase.com/docs)