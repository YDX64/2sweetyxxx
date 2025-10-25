# 🚀 2sweety.com Coolify Deployment Rehberi

## 📋 Hızlı Başlangıç

### 1. Coolify'da Yeni Application Oluşturma

1. Coolify Dashboard'a giriş yapın
2. **Projects** > Projenizi seçin (veya yeni oluşturun)
3. **+ New** > **Application**
4. **Source**: GitHub
5. **Repository**: `https://github.com/YDX64/2sweety-unlimited-hub`
6. **Branch**: `main`

### 2. Build Configuration

**General** tab'da:
- **Application Name**: `2sweety`
- **Build Pack**: `Dockerfile`
- **Dockerfile Location**: `./Dockerfile.coolify`
- **Port**: `5000`

### 3. Environment Variables

**Environment Variables** tab'ında aşağıdakileri ekleyin:

```bash
# Database Configuration (Supabase)
DATABASE_URL=postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw@db.kvrlzpdyeezmhjiiwfnp.supabase.co:5432/postgres

# Supabase Configuration
SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw

# Server Configuration
NODE_ENV=production
PORT=5000
SERVER_URL=https://2sweety.com

# Stripe (production key ekleyin)
STRIPE_SECRET_KEY=sk_live_YOUR_STRIPE_LIVE_KEY

# Google Translate API (isteğe bağlı)
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# Logging
VITE_ENABLE_LOGGING=false
VITE_LOG_LEVEL=ERROR
```

### 4. Domain Configuration

**Domains** tab'da:
1. **+ Add Domain**
2. Domain: `2sweety.com`
3. **www redirect**: Enable (www.2sweety.com → 2sweety.com)
4. **Force HTTPS**: Enable
5. **Auto-generate SSL**: Enable

### 5. Advanced Settings

**Advanced** tab'da:
- **Resource Limits**:
  - Memory: `2GB` (minimum)
  - CPU: `1` (veya daha fazla)
- **Health Check**:
  - Path: `/api/health`
  - Interval: `30s`
  - Timeout: `10s`

### 6. Deploy

1. **Deploy** butonuna tıklayın
2. **Deployments** tab'dan build log'larını takip edin
3. Build tamamlandığında otomatik başlayacak

## 🔧 Deployment Sonrası Yapılacaklar

### 1. Supabase OAuth Setup

[Supabase Dashboard](https://supabase.com/dashboard)'a girin ve:

1. **Authentication** > **Providers**
2. Her provider için redirect URL'leri ekleyin:
   - **Google**: 
     - Site URL: `https://2sweety.com`
     - Redirect URLs: `https://2sweety.com`
   - **Apple**: Aynı URL'ler
   - **Facebook**: Aynı URL'ler

### 2. Database Migrations

Coolify terminal'den veya local'de:
```bash
npm run db:push
```

### 3. Test

1. https://2sweety.com adresine girin
2. Sign up/Login test edin
3. OAuth provider'ları test edin

## 🚨 Troubleshooting

### Port Hatası
Eğer "port already in use" hatası alırsanız:
- Coolify'da port'u `3000` olarak değiştirin
- Veya Environment Variables'a `PORT=3000` ekleyin

### SSL Sertifika Sorunu
- Coolify otomatik Let's Encrypt kullanır
- DNS kayıtlarının doğru olduğundan emin olun
- A record: `2sweety.com` → `VPS_IP`

### Build Hatası
Log'larda şunları kontrol edin:
- Node version uyumsuzluğu
- npm install hataları
- Memory yetersizliği

### Database Bağlantı Hatası
- Supabase dashboard'dan connection string'i kontrol edin
- IP whitelist'e VPS IP'nizi ekleyin (gerekirse)

## 📊 Monitoring

### Coolify Dashboard'da:
- **Logs**: Real-time application logs
- **Metrics**: CPU, Memory, Network usage
- **Deployments**: Deploy history

### Uptime Monitoring:
- UptimeRobot veya benzeri servis ekleyin
- Endpoint: `https://2sweety.com/api/health`

## 🔄 Auto-deployment

GitHub'a her push'ta otomatik deploy için:
1. Coolify'da **Settings** > **Auto Deploy**: Enable
2. GitHub webhook otomatik oluşturulur

## 🎉 Başarılı Deployment Checklist

- [ ] Site açılıyor (https://2sweety.com)
- [ ] Email/password login çalışıyor
- [ ] Google OAuth çalışıyor
- [ ] Apple OAuth çalışıyor
- [ ] Facebook OAuth çalışıyor
- [ ] SSL sertifikası aktif
- [ ] Health check yeşil

## 📞 Destek

Sorun yaşarsanız:
1. Coolify logs'ları kontrol edin
2. Browser console'da hata var mı bakın
3. Network tab'da failed request'ler var mı kontrol edin

---

**Not**: Production Stripe key'i eklemeyi unutmayın!