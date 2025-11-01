# 2Sweety Stripe Integration Guide

Bu rehber, 2Sweety projesi için Stripe entegrasyonunu baştan sona anlatmaktadır. Web sitesi ve React Native Expo uygulamaları için ortak bir ödeme sistemi kurulumu içerir.

## İçindekiler
1. [Stripe Hesap Kurulumu](#1-stripe-hesap-kurulumu)
2. [Supabase Ortam Değişkenleri](#2-supabase-ortam-değişkenleri)
3. [Stripe Ürün ve Fiyat Oluşturma](#3-stripe-ürün-ve-fiyat-oluşturma)
4. [Edge Functions Deployment](#4-edge-functions-deployment)
5. [Stripe Webhook Kurulumu](#5-stripe-webhook-kurulumu)
6. [Web Sitesi Entegrasyonu](#6-web-sitesi-entegrasyonu)
7. [React Native Expo Entegrasyonu](#7-react-native-expo-entegrasyonu)
8. [Test ve Doğrulama](#8-test-ve-doğrulama)
9. [Production Geçiş](#9-production-geçiş)

## 1. Stripe Hesap Kurulumu

### 1.1 Stripe Hesabı Oluşturma
1. [stripe.com](https://stripe.com) adresine gidin
2. "Start now" butonuna tıklayın
3. Email ve şifre ile kayıt olun
4. Email adresinizi doğrulayın

### 1.2 Test ve Live Key'leri Alma
1. [Stripe Dashboard](https://dashboard.stripe.com) giriş yapın
2. **Developers** → **API keys** sayfasına gidin
3. Şu key'leri not alın:
   - **Test Mode**:
     - Publishable key: `pk_test_...`
     - Secret key: `sk_test_...`
   - **Live Mode** (production için):
     - Publishable key: `pk_live_...`
     - Secret key: `sk_live_...`

## 2. Supabase Ortam Değişkenleri

### 2.1 Supabase Dashboard'da Secret Ekleme
1. [Supabase Dashboard](https://supabase.com/dashboard/project/kvrlzpdyeezmhjiiwfnp/settings/vault) gidin
2. **Settings** → **Vault** → **Secrets** sayfasına gidin
3. Aşağıdaki secret'ları ekleyin:

```
STRIPE_SECRET_KEY = sk_test_... (test mode için)
STRIPE_PUBLISHABLE_KEY = pk_test_... (test mode için)
STRIPE_WEBHOOK_SECRET = whsec_... (webhook oluşturduktan sonra)
```

### 2.2 Local .env Dosyası Güncelleme
```bash
# /Users/max/Downloads/2sweety/.env
STRIPE_SECRET_KEY=sk_test_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 3. Stripe Ürün ve Fiyat Oluşturma

### 3.1 Stripe Dashboard'da Ürün Oluşturma
1. [Stripe Products](https://dashboard.stripe.com/products) sayfasına gidin
2. **"Add product"** butonuna tıklayın
3. Her tier için ayrı ürün oluşturun:

#### Silver Tier
- **Name**: 2Sweety Silver
- **Description**: Silver subscription with enhanced features
- **Pricing**:
  - Monthly: $9.99 (Recurring)
  - Yearly: $99.99 (Recurring)

#### Gold Tier
- **Name**: 2Sweety Gold
- **Description**: Gold subscription with premium features
- **Pricing**:
  - Monthly: $19.99 (Recurring)
  - Yearly: $199.99 (Recurring)

#### Platinum Tier
- **Name**: 2Sweety Platinum
- **Description**: Platinum subscription with all features
- **Pricing**:
  - Monthly: $29.99 (Recurring)
  - Yearly: $299.99 (Recurring)

### 3.2 Price ID'leri Kaydetme
Her fiyat oluşturduktan sonra, Price ID'leri not alın (örn: `price_1QSNw4P5YF3DuQzx8kE3HQRE`)

## 4. Edge Functions Deployment

### 4.1 Gerekli Edge Functions
Aşağıdaki 3 edge function'ı deploy edeceğiz:
1. `create-checkout` - Web için checkout session
2. `create-checkout-mobile` - Mobil için payment intent
3. `stripe-webhook` - Webhook handler

### 4.2 Edge Functions'ları Deploy Etme

```bash
# Proje dizinine gidin
cd /Users/max/Downloads/2sweety

# Supabase CLI ile login olun (eğer yapmadıysanız)
supabase login

# Edge functions'ları deploy edin
supabase functions deploy create-checkout
supabase functions deploy create-checkout-mobile
supabase functions deploy stripe-webhook
```

### 4.3 CORS Dosyası Güncelleme
`supabase/functions/_shared/cors.ts` dosyasının var olduğundan emin olun:

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

## 5. Stripe Webhook Kurulumu

### 5.1 Webhook Endpoint Oluşturma
1. [Stripe Webhooks](https://dashboard.stripe.com/webhooks) sayfasına gidin
2. **"Add endpoint"** butonuna tıklayın
3. Endpoint URL: `https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/stripe-webhook`
4. **Events to listen to** bölümünde şunları seçin:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `payment_intent.succeeded` (mobil için)

### 5.2 Webhook Secret'ı Kaydetme
1. Webhook oluşturduktan sonra, webhook detaylarına girin
2. **Signing secret** bölümünde `whsec_...` ile başlayan key'i kopyalayın
3. Supabase Vault'a ekleyin:
   ```
   STRIPE_WEBHOOK_SECRET = whsec_...
   ```

## 6. Web Sitesi Entegrasyonu

### 6.1 Stripe Webhook Function'ı Güncelleme
`/supabase/functions/stripe-webhook/index.ts` dosyasında Price ID mapping'i güncelleyin:

```typescript
const PRICE_ID_TO_TIER: Record<string, string> = {
  'price_YOUR_SILVER_MONTHLY_ID': 'silver',
  'price_YOUR_SILVER_YEARLY_ID': 'silver',
  'price_YOUR_GOLD_MONTHLY_ID': 'gold',
  'price_YOUR_GOLD_YEARLY_ID': 'gold',
  'price_YOUR_PLATINUM_MONTHLY_ID': 'platinum',
  'price_YOUR_PLATINUM_YEARLY_ID': 'platinum',
};
```

### 6.2 Create Checkout Function'ı Güncelleme
`/supabase/functions/create-checkout/index.ts` dosyasında Price ID'leri güncelleyin:

```typescript
const PLAN_TO_PRICE_ID: Record<string, Record<string, string>> = {
  'silver': {
    'monthly': 'price_YOUR_SILVER_MONTHLY_ID',
    'yearly': 'price_YOUR_SILVER_YEARLY_ID'
  },
  'gold': {
    'monthly': 'price_YOUR_GOLD_MONTHLY_ID',
    'yearly': 'price_YOUR_GOLD_YEARLY_ID'
  },
  'platinum': {
    'monthly': 'price_YOUR_PLATINUM_MONTHLY_ID',
    'yearly': 'price_YOUR_PLATINUM_YEARLY_ID'
  }
};
```

### 6.3 Functions'ları Yeniden Deploy Etme
```bash
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout
```

## 7. React Native Expo Entegrasyonu

### 7.1 Gerekli Paketleri Yükleme
```bash
cd your-expo-app
npx expo install @stripe/stripe-react-native
npx expo install expo-build-properties
```

### 7.2 app.json Güncelleme
```json
{
  "expo": {
    "plugins": [
      [
        "expo-build-properties",
        {
          "ios": {
            "useFrameworks": "static"
          }
        }
      ],
      [
        "@stripe/stripe-react-native",
        {
          "merchantIdentifier": "merchant.com.2sweety.app",
          "enableGooglePay": true
        }
      ]
    ]
  }
}
```

### 7.3 Stripe Provider Ekleme (App.tsx)
```typescript
import { StripeProvider } from '@stripe/stripe-react-native';

export default function App() {
  return (
    <StripeProvider
      publishableKey="pk_test_..." // Test key
      merchantIdentifier="merchant.com.2sweety.app"
    >
      {/* App content */}
    </StripeProvider>
  );
}
```

### 7.4 Payment Hook Oluşturma
`hooks/useStripePayment.ts`:

```typescript
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../utils/supabase';

export const useStripePayment = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const createSubscription = async (plan: string, billing: 'monthly' | 'yearly') => {
    try {
      // Get session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call edge function
      const response = await fetch(
        'https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/create-checkout-mobile',
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan, billing })
        }
      );

      if (!response.ok) throw new Error('Failed to create payment');

      const { clientSecret, ephemeralKey, customer } = await response.json();

      // Initialize payment sheet
      const { error: initError } = await initPaymentSheet({
        merchantDisplayName: '2Sweety',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: {
          email: session.user.email,
        }
      });

      if (initError) throw initError;

      // Present payment sheet
      const { error: presentError } = await presentPaymentSheet();
      
      if (presentError) throw presentError;

      return { success: true };
    } catch (error) {
      console.error('Payment error:', error);
      return { success: false, error };
    }
  };

  return { createSubscription };
};
```

## 8. Test ve Doğrulama

### 8.1 Test Kartları
Stripe test modunda şu kartları kullanabilirsiniz:
- **Başarılı ödeme**: 4242 4242 4242 4242
- **3D Secure gerektiren**: 4000 0025 0000 3155
- **Reddedilen**: 4000 0000 0000 9995

### 8.2 Web Sitesi Test Adımları
1. Test hesabı ile giriş yapın
2. `/upgrades` sayfasına gidin
3. Bir plan seçin ve "Choose Plan" butonuna tıklayın
4. Stripe Checkout sayfasında test kartı girin
5. Ödeme tamamlandıktan sonra `/upgrades?success=true` sayfasına yönlendirileceksiniz
6. Kutlama animasyonu göreceksiniz
7. Veritabanında subscription'ın güncellendiğini kontrol edin

### 8.3 Mobil Uygulama Test Adımları
1. Test hesabı ile giriş yapın
2. Upgrade ekranına gidin
3. Bir plan seçin
4. Payment Sheet açılacak
5. Test kartı girin
6. Ödeme başarılı olunca subscription güncellenecek

### 8.4 Webhook Test
1. [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks) gidin
2. Webhook'unuza tıklayın
3. "Webhook attempts" sekmesinde başarılı istekleri görebilirsiniz

## 9. Production Geçiş

### 9.1 Live Mode Aktivasyonu
1. Stripe Dashboard'da "Activate your account" tamamlayın
2. Banka hesabı bilgilerinizi girin
3. İşletme bilgilerini doldurun

### 9.2 Production Key'leri Güncelleme
1. Supabase Vault'ta key'leri güncelleyin:
   ```
   STRIPE_SECRET_KEY = sk_live_...
   STRIPE_PUBLISHABLE_KEY = pk_live_...
   ```

2. Production webhook oluşturun ve secret'ı güncelleyin

### 9.3 Price ID'leri Güncelleme
1. Live mode'da yeni ürünler ve fiyatlar oluşturun
2. Edge functions'larda Price ID mapping'i güncelleyin
3. Functions'ları yeniden deploy edin

### 9.4 Mobil Uygulama Production Build
```bash
# iOS
eas build --platform ios --profile production

# Android
eas build --platform android --profile production
```

## Önemli Notlar

1. **Test Mode'da Çalışma**: Production'a geçmeden önce mutlaka test mode'da tüm senaryoları test edin
2. **Webhook Güvenliği**: Webhook secret'ı olmadan gelen istekleri kabul etmeyin
3. **Error Handling**: Tüm ödeme hatalarını loglayn ve kullanıcıya anlamlı mesajlar gösterin
4. **Subscription Yönetimi**: Kullanıcıların subscription'larını iptal edebilmesi için Stripe Customer Portal'ı kullanın
5. **PCI Compliance**: Kredi kartı bilgilerini asla kendi sunucularınızda saklamayın

## Destek ve Kaynaklar

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Stripe React Native](https://github.com/stripe/stripe-react-native)
- [Expo Stripe Plugin](https://docs.expo.dev/versions/latest/sdk/stripe/)