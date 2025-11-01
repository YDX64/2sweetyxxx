# 🚀 Coolify Server Deployment Rehberi

Bu rehber, 2Sweety uygulamasının **server (backend)** kısmını Coolify'da nasıl deploy edeceğinizi adım adım açıklar.

## 📋 Ön Gereksinimler

1. Coolify kurulu bir sunucu
2. GitHub repository erişimi
3. Supabase hesabı ve credentials
4. Stripe hesabı (opsiyonel)
5. Domain (opsiyonel)

## 🛠️ Deployment Adımları

### 1. Coolify'da Yeni Service Oluşturma

1. Coolify Dashboard'a giriş yapın
2. **"New Resource"** → **"Service"** → **"Public/Private Repository"** seçin
3. Repository bilgilerini girin:
   - **Repository URL**: `https://github.com/YDX64/2sweety-unlimited-hub.git`
   - **Branch**: `main`
   - **Build Pack**: `Dockerfile`

### 2. Environment Variables

Coolify'da service'inize gidin ve **"Environment Variables"** sekmesinde şu değişkenleri ekleyin:

```env
# Server Configuration
NODE_ENV=production
PORT=5000

# Database (Supabase)
DATABASE_URL=postgresql://postgres.kvrlzpdyeezmhjiiwfnp:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[YOUR-SERVICE-ROLE-KEY]

# Stripe (Opsiyonel)
STRIPE_SECRET_KEY=sk_live_...[YOUR-STRIPE-SECRET-KEY]
STRIPE_WEBHOOK_SECRET=whsec_...[YOUR-WEBHOOK-SECRET]

# Client URL (CORS için)
CLIENT_URL=https://yourdomain.com

# Content Moderation (Opsiyonel)
MODERATECONTENT_API_KEY=[YOUR-API-KEY]
```

### 3. Dockerfile Konfigürasyonu

Dockerfile zaten repo'da mevcut ve şu özelliklere sahip:
- Node.js 20 Alpine image kullanır
- Health check endpoint'i içerir
- Production için optimize edilmiş build

### 4. Network Ayarları

1. **Ports** sekmesine gidin:
   - **Exposed Port**: `5000`
   - **Domain** (opsiyonel): `api.yourdomain.com`

2. **Health Check** ayarları:
   - **Path**: `/api/health`
   - **Method**: `GET`
   - **Interval**: `30`
   - **Timeout**: `3`
   - **Retries**: `3`

### 5. Build & Deploy

1. **"Deploy"** butonuna tıklayın
2. Build logs'ları takip edin
3. Deploy başarılı olduğunda status "Running" olacak

### 6. SSL Sertifikası (Domain varsa)

Coolify otomatik olarak Let's Encrypt SSL sertifikası oluşturacak. Eğer custom domain kullanıyorsanız:

1. Domain DNS ayarlarınızda A record ekleyin:
   ```
   Type: A
   Name: api (veya @ root domain için)
   Value: [Coolify Server IP]
   ```

2. Coolify'da domain'i ekledikten sonra SSL otomatik aktif olacak

### 7. Client Tarafı Konfigürasyonu

Client'ın server'a bağlanması için:

1. Production build için environment variable ekleyin:
   ```bash
   # client/.env.production
   VITE_API_URL=https://api.yourdomain.com
   ```

2. Veya aynı domain'de farklı port kullanıyorsanız:
   ```bash
   VITE_API_URL=https://yourdomain.com:5000
   ```

### 8. Post-Deployment Kontroller

```bash
# Health check
curl https://api.yourdomain.com/api/health

# Response:
{
  "status": "healthy",
  "timestamp": "2024-12-17T00:00:00.000Z",
  "service": "2sweety-api"
}
```

### 9. Stripe Webhook Konfigürasyonu

Eğer Stripe kullanıyorsanız:

1. Stripe Dashboard → Webhooks → Add endpoint
2. Endpoint URL: `https://api.yourdomain.com/api/stripe/webhook`
3. Events to listen:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 10. Monitoring & Logs

Coolify Dashboard'dan:
- **Logs** sekmesinden real-time log takibi
- **Metrics** sekmesinden CPU/Memory kullanımı
- **Deployments** sekmesinden deployment history

## 🔧 Troubleshooting

### Server başlamıyor
1. Environment variables'ları kontrol edin
2. Database bağlantısını test edin
3. Logs'larda error mesajlarını inceleyin

### CORS hatası
1. `CLIENT_URL` environment variable'ı doğru mu?
2. Client'ta API URL doğru mu?

### Database bağlantı hatası
1. Supabase connection string'i kontrol edin
2. Service role key'i kontrol edin
3. Supabase'de IP whitelist varsa Coolify server IP'sini ekleyin

### SSL/HTTPS sorunları
1. Domain DNS ayarlarını kontrol edin
2. Coolify'da domain doğru girilmiş mi?
3. Let's Encrypt rate limit'e takıldıysanız bekleyin

## 🎯 Production Checklist

- [ ] Environment variables eklenmiş
- [ ] Health check çalışıyor
- [ ] SSL sertifikası aktif
- [ ] CORS ayarları yapılmış
- [ ] Database bağlantısı test edilmiş
- [ ] Stripe webhook'lar konfigüre edilmiş
- [ ] Client API URL'i güncellenmiş
- [ ] Logs monitör ediliyor

## 📝 Notlar

1. **Database Migrations**: İlk deploy'da Supabase migrations otomatik çalışmayabilir. Manuel olarak çalıştırmanız gerekebilir.

2. **Environment Variables**: Production'da hassas bilgileri (API keys, passwords) güvenli saklayın.

3. **Scaling**: Coolify'da horizontal scaling için multiple instance'lar oluşturabilirsiniz.

4. **Backup**: Database backup stratejinizi Supabase üzerinden yönetin.

## 🆘 Destek

Sorun yaşarsanız:
1. Coolify Discord/GitHub community
2. Supabase Discord/Support
3. Bu repo'nun Issues bölümü