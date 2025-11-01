# 🚀 COOLIFY DEPLOYMENT REHBERİ

VPS'iniz hazır ve Coolify kurulu! Şimdi projeyi deploy edelim.

## 📋 ÖN HAZIRLIK

### 1. VPS Bilgilerinizi Öğrenin
```bash
# IP adresinizi öğrenin
curl ifconfig.me

# Coolify dashboard'a erişin
http://YOUR_VPS_IP:8000
```

### 2. Domain Ayarları (İsteğe Bağlı)
Eğer domain'iniz varsa:
- A record: `your-domain.com` → `VPS_IP`
- A record: `*.your-domain.com` → `VPS_IP`

## 🎯 COOLIFY'DA DEPLOYMENT ADIMLARI

### ADIM 1: Yeni Proje Oluşturma

1. **Coolify Dashboard'a girin**
2. **Projects** > **+ New Project**
3. **Name**: `2sweety-app`
4. **Create Project**

### ADIM 2: Resource Ekleme

1. **+ Add Resource**
2. **Docker Image** seçin
3. **Application** seçin

### ADIM 3: Git Repository Bağlama

1. **Source** > **Git Provider** 
2. **GitHub** seçin (ilk kez ise authorize edin)
3. Repository URL'nizi yapıştırın
4. **Branch**: `main` veya `master`

### ADIM 4: Build Ayarları

#### Dockerfile Ayarları:
```dockerfile
# Dockerfile.coolify kullanacak
Build Command: (boş bırakın - Dockerfile kullanacağız)
Install Command: (boş bırakın)
Start Command: (boş bırakın)
```

#### Port Ayarları:
```
Port: 3000
```

### ADIM 5: Environment Variables

**Environment** tab'ına gidin ve şunları ekleyin:

```bash
# ✅ REQUIRED: Supabase Configuration (Only Database Needed)
DATABASE_URL=postgresql://postgres.kvrlzpdyeezmhjiiwfnp:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

VITE_SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw
SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co

# Coolify Environment
COOLIFY=true

# Server Configuration
NODE_ENV=production
SERVER_URL=https://YOUR_DOMAIN.com

# API Keys (şimdilik test keys)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
GOOGLE_TRANSLATE_API_KEY=your_google_translate_api_key_here

# Optional
VITE_ENABLE_LOGGING=false
VITE_LOG_LEVEL=ERROR
```

### ADIM 6: Domain Ayarları

1. **Domains** tab'ına gidin
2. **+ Add Domain**
3. Domain'inizi ekleyin: `your-domain.com`
4. **SSL Certificate** otomatik oluşturulacak

### ADIM 7: Deploy!

1. **Deploy** butonuna tıklayın
2. **Logs** tab'ından build sürecini takip edin
3. İlk deploy 5-10 dakika sürebilir

## 🔧 TROUBLESHOOTING

### Build Hatası Alırsanız:
```bash
# Coolify container'ına bağlanın
docker exec -it CONTAINER_ID /bin/bash

# Logs'lara bakın
docker logs CONTAINER_ID
```

### Common Issues:

#### 1. Node.js Version Hatası
```dockerfile
# Dockerfile.coolify'da Node version'ı değiştirin
FROM node:18-alpine  # 16, 18, 20 deneyin
```

#### 2. Memory Hatası
```bash
# Coolify'da resource limits artırın
Memory: 1GB → 2GB
```

#### 3. Port Hatası
```bash
# server/index.ts dosyasında port ayarını kontrol edin
const port = process.env.PORT || 3000;
```

## 📊 MONITORING

### 1. Application Logs
- Coolify Dashboard > Your App > Logs
- Real-time log stream

### 2. Resource Usage
- CPU ve Memory kullanımını takip edin
- Coolify Dashboard > Resources

### 3. Health Checks
- Dockerfile'da health check tanımlı
- `/health` endpoint'i ekleyin

## 🚀 GELİŞMİŞ AYARLAR

### Auto-deployment
- GitHub'a her push'ta otomatik deploy
- Webhook automatically configured

### Backup Strategy
```bash
# Database backup
pg_dump DATABASE_URL > backup.sql

# Files backup  
tar -czf backup.tar.gz /app/uploads
```

### SSL Sertifikası
- Let's Encrypt otomatik kurulur
- 90 günde bir otomatik yenilenir

## 🎉 DEPLOYMENT SONRASI

1. **Test edin**: https://your-domain.com
2. **Database migration çalıştırın**: `npm run db:push`
3. **Monitoring setup**: Grafana/Prometheus (isteğe bağlı)

## 📞 DESTEK

Sorun yaşarsanız:
1. Coolify logs'larına bakın
2. GitHub issues kontrol edin
3. Coolify Discord'a katılın

**Coolify Dashboard IP'nizi ve domain'inizi paylaşırsanız, daha detaylı yardım edebilirim!** 🚀 