# 🚀 2Sweety Stripe Hızlı Kurulum (Türkçe)

## 📋 Önce Nelere İhtiyacınız Var?
- Stripe hesabı (https://dashboard.stripe.com)
- Supabase Pro (zaten var ✅)
- Supabase CLI (`npm install -g supabase`)

## 1. Stripe API Anahtarlarını Alın
[Stripe API Keys](https://dashboard.stripe.com/apikeys) sayfasından:
- **Publishable key**: `pk_live_...` (veya test için `pk_test_...`)
- **Secret key**: `sk_live_...` (veya test için `sk_test_...`)

## 2. Stripe'da Ürünleri Oluşturun
[Stripe Products](https://dashboard.stripe.com/products) sayfasına gidin ve şu ürünleri oluşturun:

### 🥈 Silver Plan
- **Ürün Adı**: 2Sweety Silver
- **Aylık Fiyat**: $9.99 (recurring/tekrarlayan)
- **Yıllık Fiyat**: $99.99 (recurring/tekrarlayan) - İsteğe bağlı

### 🥇 Gold Plan  
- **Ürün Adı**: 2Sweety Gold
- **Aylık Fiyat**: $19.99 (recurring/tekrarlayan)
- **Yıllık Fiyat**: $199.99 (recurring/tekrarlayan) - İsteğe bağlı

### 💎 Platinum Plan
- **Ürün Adı**: 2Sweety Platinum
- **Aylık Fiyat**: $29.99 (recurring/tekrarlayan)
- **Yıllık Fiyat**: $299.99 (recurring/tekrarlayan) - İsteğe bağlı

## 3. Price ID'leri Kopyalayın
Her ürün oluşturduktan sonra, `price_1ABC123...` şeklinde bir ID alacaksınız.
- Her plan için bir Price ID (sadece aylık fiyatlar için 3 ID yeterli)
- Bu ID'leri bir yere not edin!

## 4. Edge Functions'ları Güncelleyin

### A) stripe-webhook fonksiyonunu güncelleyin
`/supabase/functions/stripe-webhook/index.ts` dosyasını açın ve şunu bulun (satır 17):

```typescript
const PRICE_ID_TO_TIER: Record<string, string> = {
  '': 'silver',    // ← Buraya Silver Price ID
  '': 'gold',      // ← Buraya Gold Price ID  
  '': 'platinum',  // ← Buraya Platinum Price ID
};
```

Stripe'dan aldığınız ID'lerle doldurun:
```typescript
const PRICE_ID_TO_TIER: Record<string, string> = {
  'price_1QSN...': 'silver',
  'price_1QSN...': 'gold',
  'price_1QSN...': 'platinum',
};
```

### B) create-checkout fonksiyonunu güncelleyin
`/supabase/functions/create-checkout/index.ts` dosyasını açın ve şunu bulun (satır 42):

```typescript
const PLAN_TO_PRICE_ID: Record<string, Record<string, string>> = {
  'silver': {
    'monthly': 'price_1234567890abcdefSILVER_MONTHLY', // ← Buraya Silver Price ID
    'yearly': 'price_silver_yearly'  // Şimdilik boş bırakın
  },
  'gold': {
    'monthly': 'price_1234567890abcdefGOLD_MONTHLY',   // ← Buraya Gold Price ID
    'yearly': 'price_gold_yearly'
  },
  'platinum': {
    'monthly': 'price_1234567890abcdefPLATINUM_MONTHLY', // ← Buraya Platinum Price ID
    'yearly': 'price_platinum_yearly'
  }
};
```

## 5. Supabase'e Stripe Key'lerini Ekleyin

### Supabase Dashboard'dan:
1. [Supabase Dashboard](https://supabase.com/dashboard/project/kvrlzpdyeezmhjiiwfnp) açın
2. **Settings → Vault** gidin
3. **Add new secret** tıklayın ve şunları ekleyin:
   - `STRIPE_SECRET_KEY` = `sk_live_...` (veya test için `sk_test_...`)
   - `STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (veya test için `pk_test_...`)

### Alternatif: CLI ile ekleyin
```bash
# Önce Supabase'e login olun
supabase login

# Projenizi bağlayın
supabase link --project-ref kvrlzpdyeezmhjiiwfnp

# Secret'ları ekleyin
supabase secrets set STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE
supabase secrets set STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY_HERE
```

## 6. Edge Functions'ları Deploy Edin

```bash
# Functions'ları deploy edin
supabase functions deploy create-checkout
supabase functions deploy stripe-webhook
supabase functions deploy create-checkout-mobile
```

## 7. Stripe Webhook Oluşturun

1. [Stripe Webhooks](https://dashboard.stripe.com/webhooks) sayfasına gidin
2. **"Add endpoint"** tıklayın
3. **Endpoint URL**: `https://kvrlzpdyeezmhjiiwfnp.supabase.co/functions/v1/stripe-webhook`
4. **Events to send** bölümünde şunları seçin:
   - `checkout.session.completed` ✅
   - `customer.subscription.created` ✅
   - `customer.subscription.updated` ✅
   - `customer.subscription.deleted` ✅
   - `invoice.payment_succeeded` ✅
5. **Add endpoint** tıklayın
6. **Signing secret** (whsec_...) kopyalayın
7. Supabase Vault'a ekleyin:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

## 8. Coolify Environment Variables'a Ekleyin

Coolify dashboard'da şu environment variable'ları ekleyin:
```env
STRIPE_SECRET_KEY=sk_live_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

## 9. Test Edin

1. Uygulamanızı açın: https://2sweety.com
2. **Upgrades** sayfasına gidin
3. Bir plan seçin ve **"Upgrade Now"** tıklayın
4. Stripe Checkout sayfasına yönlendirileceksiniz
5. Test kartı kullanın: `4242 4242 4242 4242` (her şey için 42)
6. Ödeme tamamlandıktan sonra premium özelliklere erişiminiz olacak!

## ✅ Kontrol Listesi

- [ ] Stripe'da 3 ürün oluşturuldu (Silver, Gold, Platinum)
- [ ] Price ID'ler kopyalandı
- [ ] Edge functions'a Price ID'ler eklendi
- [ ] Supabase Vault'a Stripe key'leri eklendi
- [ ] Edge functions deploy edildi
- [ ] Webhook oluşturuldu ve secret eklendi
- [ ] Coolify'a environment variables eklendi
- [ ] Test ödemesi başarılı

## 🆘 Sorun Giderme

**"No price ID found" hatası:**
- Price ID'lerin doğru kopyalandığından emin olun
- Edge functions'ı yeniden deploy edin

**"Invalid API Key" hatası:**
- STRIPE_SECRET_KEY'in doğru olduğundan emin olun
- Live/Test mode karışıklığı olabilir

**Webhook çalışmıyor:**
- Webhook secret'in doğru olduğundan emin olun
- Stripe Dashboard → Webhooks → Webhook attempts'i kontrol edin

## 🎉 Tebrikler!
Stripe entegrasyonu tamamlandı. Artık kullanıcılar premium planları satın alabilir!