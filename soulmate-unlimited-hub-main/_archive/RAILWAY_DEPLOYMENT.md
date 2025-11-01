# 🚂 RAILWAY DEPLOYMENT REHBERİ

Railway ile projenizi hızla deploy edelim! $5/ay ile full-stack uygulama.

## 🎯 NEDEN RAILWAY?

- ✅ **Full-stack native support** (Express + React)
- ✅ **Built-in PostgreSQL** database
- ✅ **Çok ucuz** ($5/ay sadece)
- ✅ **Kolay deployment** (1 click)
- ✅ **Auto-deploy** GitHub'dan
- ✅ **Environment variables** web UI
- ✅ **Custom domains** ücretsiz
- ✅ **SSL certificate** otomatik

## 📋 HIZLI BAŞLANGIÇ

### Adım 1: Railway Hesabı
1. https://railway.app adresine git
2. **Sign up with GitHub** tıkla
3. GitHub hesabınla bağlan
4. Dashboard'a eriş

### Adım 2: Yeni Proje Oluştur
1. **New Project** tıkla
2. **Deploy from GitHub repo** seç
3. Repository'nizi seçin
4. **Deploy Now** tıkla

### Adım 3: Database Ekle
1. Project dashboard'da **+ New** tıkla
2. **Database** > **PostgreSQL** seç
3. Otomatik oluşacak
4. **DATABASE_URL** otomatik environment'a eklenecek

### Adım 4: Environment Variables
**Variables** tab'ına git ve şunları ekle:

```bash
# Supabase Configuration
SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw

# Server Configuration
NODE_ENV=production
PORT=3000

# API Keys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# Optional
VITE_ENABLE_LOGGING=false
VITE_LOG_LEVEL=ERROR
```

### Adım 5: Custom Domain (İsteğe Bağlı)
1. **Settings** > **Domains**
2. **Custom Domain** ekle
3. DNS ayarlarını yap
4. SSL otomatik aktif olacak

## 🔧 BUILD AYARLARI

Railway otomatik algılayacak ama manuel ayar isterseniz:

### Build Command:
```bash
npm install && npm run build
```

### Start Command:
```bash
npm start
```

### Port:
```bash
PORT=3000  # Environment variable'da tanımlı
```

## 🗄️ DATABASE MIGRATION

Railway PostgreSQL'e geçiş:

### 1. Railway Database URL'ini Al
```bash
# Variables tab'ında DATABASE_URL göreceksiniz
# Format: postgresql://username:password@host:port/database
```

### 2. Migration Çalıştır
```bash
# Local'de migration dosyalarını test edin
npm run db:push

# Veya Railway console'dan:
railway run npm run db:push
```

### 3. Supabase'den Veri Transferi (İsteğe Bağlı)
```bash
# Supabase'den export
pg_dump SUPABASE_DATABASE_URL > backup.sql

# Railway'e import  
psql RAILWAY_DATABASE_URL < backup.sql
```

## 📊 MONITORING

### Logs
- Railway Dashboard > **Deployments** > **View Logs**
- Real-time log streaming

### Metrics
- CPU, Memory, Network usage
- Request analytics
- Error tracking

### Health Checks
- Railway otomatik health check yapar
- `/health` endpoint ekleyin (önerilir)

## 💰 MALIYET HESABI

### Hobby Plan: $5/ay
- 512MB RAM
- 1 vCPU
- 1GB Disk
- **Çoğu proje için yeterli!**

### Pro Plan: $20/ay
- 8GB RAM
- 4 vCPU  
- 100GB Disk
- Priority support

## 🚀 DEPLOYMENT SONRASI

### 1. Test Edin
- https://your-app.up.railway.app
- Tüm özellikler çalışıyor mu?
- Database bağlantısı OK mi?

### 2. Domain Bağla
- Custom domain ekleyin
- SSL otomatik aktif

### 3. Monitoring Kur
- Error tracking
- Performance monitoring
- Uptime monitoring

## 🛠️ TROUBLESHOOTING

### Build Hatası
```bash
# Logs'lara bak
Railway Dashboard > Deployments > View Logs

# Local'de test et
npm run build
npm start
```

### Database Bağlantı Hatası
```bash
# DATABASE_URL doğru mu?
# Migration çalıştırdınız mı?
# Connection pool ayarları?
```

### Memory Hatası
```bash
# Plan upgrade et: $5 → $20
# Veya memory optimization yap
```

### Port Hatası
```bash
# PORT environment variable Railway tarafından sağlanır
# server/index.ts'de:
const port = process.env.PORT || 3000;
```

## 🎉 DEPLOYMENT TAMAMLANDI!

### Sonraki Adımlar:
1. ✅ Production'da test
2. ✅ Custom domain ekle  
3. ✅ SSL aktif
4. ✅ Monitoring kur
5. ✅ Backup stratejisi
6. ✅ CI/CD optimize et

### Performance Optimizasyonu:
- CDN entegrasyonu
- Image optimization
- Code splitting
- Cache strategies

## 📞 DESTEK

- **Railway Discord**: https://discord.gg/railway
- **Documentation**: https://docs.railway.app
- **GitHub Issues**: Her türlü sorun için

**Railway ile deployment çok kolay! Herhangi bir sorun yaşarsanız hemen destek alabiliriz.** 🚀

---

## 🚂 HIZLI KOMUTLAR

```bash
# Railway CLI kurulum
npm install -g @railway/cli

# Login
railway login

# Deploy
railway up

# Logs
railway logs

# Variables
railway variables
```

**Hadi başlayalım! Railway hesabınızı oluşturdunuz mu?** 💪 