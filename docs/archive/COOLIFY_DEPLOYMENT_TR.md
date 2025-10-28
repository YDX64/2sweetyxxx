# 🚀 2Sweety - Coolify Deployment Rehberi

## 📋 İçindekiler

1. [Hızlı Başlangıç (10 dakika)](#hızlı-başlangıç)
2. [Gereksinimler](#gereksinimler)
3. [Coolify'da Uygulama Oluşturma](#coolifyde-uygulama-oluşturma)
4. [Environment Variables Ayarlama](#environment-variables-ayarlama)
5. [Deployment](#deployment)
6. [Domain Bağlama](#domain-bağlama)
7. [SSL Sertifikası](#ssl-sertifikası)
8. [Sorun Giderme](#sorun-giderme)
9. [Güncelleme ve Bakım](#güncelleme-ve-bakım)

---

## 🎯 Hızlı Başlangıç

### Adım 1: GitHub Repository Oluştur

```bash
cd "/Users/max/Downloads/2sweet/GoMeet Web"

# Git başlat
git init
git add .
git commit -m "Initial commit: 2Sweety dating app"

# GitHub'a push (repository'yi önce GitHub'da oluştur)
git remote add origin https://github.com/KULLANICI_ADINIZ/2sweety-web.git
git branch -M main
git push -u origin main
```

### Adım 2: Coolify'da Proje Oluştur

1. **Coolify Dashboard** açın
2. **"+ New"** > **"Application"** tıklayın
3. **"Public Repository"** seçin
4. GitHub URL'i yapıştırın: `https://github.com/KULLANICI_ADINIZ/2sweety-web`
5. **Branch**: `main`
6. **Build Pack**: `nixpacks` veya `dockerfile` (otomatik seçilir)

### Adım 3: Build Ayarları

**Build Command**:
```bash
npm install && npm run build
```

**Start Command** (static hosting için gerekli DEĞİL):
```bash
# Boş bırakın - Nginx otomatik serve edecek
```

**Base Directory**:
```
/
```

**Publish Directory**:
```
build
```

### Adım 4: Environment Variables Ekle

**Coolify'da**: `Settings` > `Environment Variables` > `Build Arguments`

Aşağıdaki değişkenleri **TAM OLARAK** yapıştırın:

```bash
# ============ MİNİMUM GEREKLİ DEĞİŞKENLER ============

# Build Ayarları
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true

# Uygulama Bilgileri
REACT_APP_NAME=2Sweety
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# API URL'leri - BACKEND HAZIR DEĞİLSE ŞİMDİLİK BUNLARI KULLANIN
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/

# Firebase Ayarları
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

# Temel Ayarlar
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_DEFAULT_CURRENCY=USD
REACT_APP_DEBUG_MODE=false
REACT_APP_ENABLE_ANALYTICS=true
```

### Adım 5: Deploy Et!

1. **"Deploy"** butonuna tıklayın
2. Build logs'u izleyin (3-5 dakika sürer)
3. Build başarılı olunca "✓ Deployed successfully" mesajını göreceksiniz
4. Verilen URL'yi tarayıcıda açın (örn: `https://2sweety.coolify.io`)

---

## 🔧 Gereksinimler

### Coolify Sunucusu
- ✅ Coolify kurulu bir sunucu (VPS/Dedicated)
- ✅ Minimum 2GB RAM, 2 CPU Core
- ✅ Docker kurulu
- ✅ Port 80 ve 443 açık

### GitHub
- ✅ GitHub hesabı
- ✅ Public veya Private repository

### Domain (Opsiyonel)
- ✅ `2sweety.com` domain'i (Namecheap, GoDaddy, vb.)
- ✅ DNS yönetim erişimi

---

## 🏗️ Coolify'da Uygulama Oluşturma

### Yöntem 1: Public GitHub Repository (Önerilen)

1. **Coolify Dashboard** > **"+ New"** > **"Application"**

2. **Source** seçimi:
   - ✅ **Public Repository**
   - Repository URL: `https://github.com/KULLANICI_ADINIZ/2sweety-web`
   - Branch: `main`

3. **Build Configuration**:
   ```
   Build Command: npm install && npm run build
   Base Directory: /
   Publish Directory: build
   ```

4. **Port Configuration**:
   ```
   Port: 80 (otomatik)
   ```

### Yöntem 2: Private GitHub Repository

1. **GitHub Personal Access Token** oluşturun:
   - GitHub > Settings > Developer settings > Personal access tokens
   - Generate new token (classic)
   - Scope: `repo` (full control)
   - Token'ı kopyalayın

2. **Coolify'da**:
   - Source: **Private Repository (with GitHub)**
   - GitHub token'ınızı yapıştırın
   - Repository seçin

### Yöntem 3: Local Build (Manuel)

```bash
# Local'de build al
cd "/Users/max/Downloads/2sweet/GoMeet Web"
npm install
npm run build

# Build klasörünü sunucuya yükle
scp -r build/ user@sunucu:/var/www/2sweety/
```

---

## ⚙️ Environment Variables Ayarlama

### Coolify'da Environment Variables Ekleme

**Önemli**: React uygulamaları environment variables'ı **BUILD TIME**'da embed eder. Yani değişkenleri değiştirince yeniden build gerekir!

#### Adım 1: Build Arguments Ekle

Coolify Dashboard > Application > **Environment Variables** > **Build Arguments**

Aşağıdaki template'i kopyalayıp yapıştırın:

```bash
# ============================================
# ZORUNLU DEĞİŞKENLER (Mutlaka olmalı!)
# ============================================

ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true

REACT_APP_NAME=2Sweety
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production

# Backend API URL'leri
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP

# ============================================
# OPSİYONEL DEĞİŞKENLER (İhtiyaç halinde)
# ============================================

# OneSignal (Push bildirimleri)
REACT_APP_ONESIGNAL_APP_ID=your_onesignal_app_id

# Agora (Video/ses aramaları)
REACT_APP_AGORA_APP_ID=your_agora_app_id

# Google Maps
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key

# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Facebook Login
REACT_APP_FACEBOOK_APP_ID=your_facebook_app_id

# Razorpay
REACT_APP_RAZORPAY_KEY_ID=rzp_live_xxxxx

# PayPal
REACT_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
REACT_APP_PAYPAL_MODE=production

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
```

#### Adım 2: API Keylerini Alın

Her servis için API key almak için:

**🔥 Firebase** (MEVCUT - Değiştirmeyin):
```
✅ Zaten ayarlanmış: sweet-a6718 projesi
```

**🔔 OneSignal** (Push Notifications):
1. https://onesignal.com → Kayıt ol
2. New App/Website → Web Push
3. Site URL: `https://2sweety.com`
4. App ID'yi kopyala

**📞 Agora** (Video/Audio Calls):
1. https://console.agora.io → Kayıt ol
2. Project Management → Create Project
3. App ID'yi kopyala
4. **ÖNEMLİ**: Production'da App Certificate aktif et!

**🗺️ Google Maps**:
1. https://console.cloud.google.com
2. APIs & Services → Enable API → Maps JavaScript API
3. Credentials → Create API Key
4. **Kısıtla**: HTTP referrers → `https://2sweety.com/*`

**💳 Payment Gateways**:
- **Razorpay**: https://dashboard.razorpay.com
- **PayPal**: https://developer.paypal.com
- **Stripe**: https://dashboard.stripe.com

---

## 🚀 Deployment

### İlk Deployment

1. **Coolify Dashboard** > Application > **Deploy** butonu

2. **Build Logs** açılacak, aşağıdakileri göreceksiniz:
   ```
   ▶ Installing dependencies...
   ▶ npm install
   ▶ Building application...
   ▶ npm run build
   ▶ Creating optimized production build...
   ✓ Compiled successfully!
   ▶ Deploying to container...
   ✓ Deployed successfully!
   ```

3. **Build süresi**: ~3-5 dakika

4. **Başarılı olursa**: `https://UYGULAMANIZ.coolify.io` URL'i verilir

### Otomatik Deployment (GitHub Push ile)

1. **Coolify'da Webhook Aktif Et**:
   - Application > Settings > **Auto Deploy on Push**
   - Webhook URL'i kopyalayın

2. **GitHub'da Webhook Ekle**:
   - Repository > Settings > Webhooks > Add webhook
   - Payload URL: Coolify webhook URL'i yapıştır
   - Content type: `application/json`
   - Events: `Just the push event`

3. **Test Et**:
   ```bash
   git add .
   git commit -m "Test auto deployment"
   git push
   ```

   Coolify otomatik deploy başlatacak!

---

## 🌐 Domain Bağlama

### 2sweety.com Domain'ini Bağlama

#### Adım 1: DNS Kayıtlarını Ayarla

Domain yönetim panelinden (Namecheap, GoDaddy, vb.):

**A Record** ekle:
```
Type: A
Host: @
Value: COOLIFY_SUNUCU_IP_ADRESI
TTL: 300 (5 min)
```

**CNAME Record** ekle (www için):
```
Type: CNAME
Host: www
Value: 2sweety.com
TTL: 300
```

#### Adım 2: Coolify'da Domain Ekle

1. **Application** > **Domains** > **+ Add Domain**

2. Domain ekle:
   ```
   Domain: 2sweety.com
   www: ✅ Redirect www to non-www
   ```

3. **Save**

4. DNS propagation bekleyin (5-30 dakika)

5. Test et:
   ```bash
   ping 2sweety.com
   # Coolify sunucu IP'si gelmeli
   ```

---

## 🔒 SSL Sertifikası

Coolify **otomatik** Let's Encrypt SSL sertifikası oluşturur!

### Otomatik SSL

1. Domain bağlandıktan sonra: **Application** > **SSL/TLS**

2. **Auto SSL** aktif et:
   ```
   ✅ Enable Auto SSL (Let's Encrypt)
   ```

3. **Generate Certificate** tıkla

4. 1-2 dakika içinde:
   ```
   ✅ SSL Certificate issued!
   https://2sweety.com ← Artık HTTPS çalışıyor!
   ```

### SSL Sorunları

**Hata**: "Failed to issue certificate"

**Çözüm**:
1. DNS'in yayıldığını kontrol et: `nslookup 2sweety.com`
2. Port 80 ve 443'ün açık olduğunu kontrol et
3. Domain'in Coolify sunucuya işaret ettiğini kontrol et
4. 5 dakika bekle, tekrar dene

---

## 🐛 Sorun Giderme

### Build Hataları

#### Hata: "npm install failed"

```bash
# Çözüm: package-lock.json'ı commitleyip push edin
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

#### Hata: "FATAL ERROR: JavaScript heap out of memory"

**Coolify'da**:
- Application > Resources
- Memory: En az **2GB** ayarlayın

#### Hata: "MODULE_NOT_FOUND"

```bash
# node_modules'ı temizle
rm -rf node_modules package-lock.json
npm install
git add .
git commit -m "Rebuild dependencies"
git push
```

### Runtime Hataları

#### "API calls failing" / "CORS error"

**Backend API CORS ayarları** gerekli!

Backend'de izin ver:
```javascript
// Express.js örneği
app.use(cors({
  origin: ['https://2sweety.com', 'https://www.2sweety.com'],
  credentials: true
}));
```

#### "Firebase not initialized"

Environment variables kontrol et:
```bash
# Coolify'da Build Arguments'ta olmalı
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
# vb.
```

**Değiştirdiyseniz**: Yeniden deploy edin!

#### "White screen" / "Blank page"

1. **Browser console** açın (F12)
2. Hataları kontrol edin
3. Genellikle:
   - Environment variable eksik
   - API endpoint yanlış
   - Firebase config hatalı

**Çözüm**:
```bash
# .env.coolify dosyasındaki tüm değişkenleri kontrol et
# Eksik varsa ekle ve yeniden deploy et
```

### Domain/SSL Sorunları

#### "Domain not resolving"

```bash
# DNS propagation kontrol
nslookup 2sweety.com
dig 2sweety.com

# Coolify sunucu IP'si gelmiyorsa DNS ayarlarını kontrol et
```

#### "SSL Certificate failed"

1. **80 ve 443 portları açık mı?**
   ```bash
   telnet SUNUCU_IP 80
   telnet SUNUCU_IP 443
   ```

2. **Domain Coolify'a işaret ediyor mu?**
   ```bash
   curl http://2sweety.com
   # Coolify sayfası gelmeli
   ```

3. **Let's Encrypt rate limit?**
   - Haftada 5 deneme limiti var
   - Bekle ve tekrar dene

---

## 🔄 Güncelleme ve Bakım

### Kod Güncellemesi

```bash
# Değişiklik yap
git add .
git commit -m "Feature: New login page"
git push

# Coolify otomatik deploy edecek (webhook aktifse)
# Manuel deployment: Coolify'da "Deploy" butonuna tıkla
```

### Environment Variables Güncelleme

```bash
# ÖNEMLİ: React build-time variables kullanır!
# Environment variable değiştirince MUTLAKA rebuild gerekir

# 1. Coolify'da değişkeni güncelle
# 2. "Redeploy" tıkla (yeni build yapılacak)
```

### Rollback (Geri Alma)

**Coolify**:
1. Application > **Deployments** (geçmiş deployments)
2. Eski bir deployment seç
3. **Rollback** butonuna tıkla

**GitHub**:
```bash
# Son commit'i geri al
git revert HEAD
git push

# Belirli commit'e dön
git reset --hard COMMIT_HASH
git push --force
```

### Log İnceleme

**Build Logs**:
- Coolify > Application > **Logs** > **Build Logs**

**Runtime Logs**:
- Coolify > Application > **Logs** > **Application Logs**

**Real-time logs**:
```bash
# Coolify container'a SSH
docker logs -f CONTAINER_ID
```

---

## 📊 Performans Optimizasyonu

### CDN Kullanımı

**Cloudflare** (Ücretsiz CDN):

1. https://cloudflare.com → Domain ekle
2. DNS kayıtlarını Cloudflare'e yönlendir
3. **Proxy** (turuncu bulut) aktif
4. SSL/TLS: **Full**

**Avantajları**:
- ✅ Global CDN (daha hızlı yükleme)
- ✅ DDoS koruması
- ✅ Ücretsiz SSL
- ✅ Cache optimization

### Build Optimizasyonu

`.env.production` dosyasında:
```bash
# Source maps oluşturma (daha küçük build)
GENERATE_SOURCEMAP=false

# Profiling devre dışı
REACT_APP_DEBUG_MODE=false
```

### Image Optimization

```bash
# images klasöründeki resimleri optimize et
npm install -g imagemin-cli
imagemin public/images/* --out-dir=public/images
```

---

## 🎯 Production Checklist

Deployment öncesi kontrol listesi:

### Kod
- [ ] `.env.production` tüm gerekli değişkenlerle dolu
- [ ] `console.log()` ve debug kodları kaldırıldı
- [ ] Error handling eksiksiz
- [ ] API timeout ayarları yapıldı

### Firebase
- [ ] Firebase Console'da domain (`2sweety.com`) authorized domains'e eklendi
- [ ] Firestore security rules production-ready
- [ ] Storage rules production-ready

### API Keys
- [ ] Tüm API keylere domain kısıtlaması eklendi
- [ ] Production keys kullanılıyor (test keys değil)
- [ ] Secret keyler backend'de, client'da DEĞİL

### Security
- [ ] HTTPS aktif ve çalışıyor
- [ ] CORS ayarları doğru
- [ ] CSP headers ayarlanmış (Coolify/Nginx)
- [ ] Rate limiting aktif (backend)

### Performance
- [ ] CDN aktif (Cloudflare)
- [ ] Build optimize edilmiş
- [ ] Images optimize edilmiş
- [ ] Lazy loading eklenmiş

### Monitoring
- [ ] Google Analytics / Firebase Analytics aktif
- [ ] Error tracking (Sentry, vb.)
- [ ] Uptime monitoring (UptimeRobot, vb.)

---

## 📚 Faydalı Komutlar

```bash
# Local development
npm start

# Production build
npm run build

# Test production build locally
npx serve -s build

# Analyze bundle size
npm install --save-dev webpack-bundle-analyzer
npm run build -- --stats
npx webpack-bundle-analyzer build/bundle-stats.json

# Git operations
git status
git log --oneline
git diff

# Docker (Coolify sunucuda)
docker ps
docker logs CONTAINER_ID
docker exec -it CONTAINER_ID sh
```

---

## 🆘 Destek ve Yardım

### Dokümantasyon
- **React**: https://react.dev
- **Coolify**: https://coolify.io/docs
- **Firebase**: https://firebase.google.com/docs

### Community
- **Coolify Discord**: https://coolify.io/discord
- **Firebase Support**: https://firebase.google.com/support

### Sorun Bildirme
GitHub Issues: https://github.com/KULLANICI_ADINIZ/2sweety-web/issues

---

## ✅ Sonraki Adımlar

1. ✅ **GitHub'a push** yap
2. ✅ **Coolify'da uygulama** oluştur
3. ✅ **Environment variables** ekle
4. ✅ **Deploy** et
5. ✅ **Domain bağla** (2sweety.com)
6. ✅ **SSL aktif** et
7. ✅ **Test** et
8. ✅ **Monitoring** kur
9. ✅ **CDN** aktif et (Cloudflare)
10. ✅ **Production checklist** tamamla

---

**🎉 Deployment başarılı olunca**: https://2sweety.com artık canlıda!

**Sorular?** Bu dökümanı tekrar okuyun veya Coolify Discord'a katılın.

**İyi şanslar! 🚀**
