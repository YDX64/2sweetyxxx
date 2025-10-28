# 🚀 2Sweety - GitHub ve Coolify Deployment Adımları

## ✅ Hazırlık Tamamlandı!

Aşağıdaki dosyalar hazır:

- ✅ `.env.coolify` - Coolify environment variables template
- ✅ `COOLIFY_DEPLOYMENT_TR.md` - Detaylı Türkçe deployment rehberi
- ✅ `README.md` - Proje dokümantasyonu (güncellendi)
- ✅ `.gitignore` - Git ignore rules
- ✅ `manifest.json` - 2Sweety branding (güncellendi)
- ✅ Firebase configuration - Hazır ve çalışıyor

---

## 📝 ADIM 1: GitHub'a Push

### 1.1 Git Repository Başlat

```bash
cd "/Users/max/Downloads/2sweet/GoMeet Web"

# Git repository'yi başlat
git init

# Tüm dosyaları staging'e ekle
git add .

# İlk commit
git commit -m "Initial commit: 2Sweety dating web app

- React 18.2 web application
- Firebase integration (sweet-a6718)
- Multi-language support (9+ languages)
- Payment gateways (Razorpay, PayPal, Stripe, etc.)
- Real-time chat with Firebase
- Video/audio calls with Agora RTC
- OneSignal push notifications
- Responsive design with Tailwind CSS + Bootstrap
- Production-ready with Coolify deployment config"
```

### 1.2 GitHub'da Repository Oluştur

1. **GitHub'a git**: https://github.com
2. **New repository** tıkla (sağ üst köşe, + işareti)
3. **Repository bilgileri**:
   ```
   Repository name: 2sweety-web
   Description: 2Sweety Dating Web Application - Modern social dating platform
   Visibility: Private (önerilen) veya Public
   ❌ Add a README file (zaten var)
   ❌ Add .gitignore (zaten var)
   ❌ Choose a license (sonra eklersiniz)
   ```
4. **Create repository** tıkla

### 1.3 GitHub'a Push

```bash
# GitHub repository'yi remote olarak ekle
# ÖNEMLİ: KULLANICI_ADINIZ yerine kendi GitHub kullanıcı adınızı yazın!
git remote add origin https://github.com/KULLANICI_ADINIZ/2sweety-web.git

# Branch ismini main olarak ayarla
git branch -M main

# GitHub'a push et
git push -u origin main
```

**Not**: İlk push'ta GitHub kullanıcı adı ve şifre (veya Personal Access Token) isteyecek.

**GitHub Token oluşturmak için**:
1. GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic)
2. Generate new token (classic)
3. Scope: `repo` (full control of private repositories)
4. Generate token ve kopyala
5. Push sırasında **şifre yerine bu token'ı kullan**

---

## 🚀 ADIM 2: Coolify'da Deployment

### 2.1 Coolify Dashboard Aç

1. Coolify sunucunuzun URL'sine gidin (örn: `https://coolify.your-domain.com`)
2. Login yapın

### 2.2 Yeni Uygulama Oluştur

1. **+ New** butonuna tıklayın
2. **Application** seçin
3. **Source** seçimi:

   **Public Repository ise**:
   ```
   ✅ Public Repository
   Repository URL: https://github.com/KULLANICI_ADINIZ/2sweety-web
   Branch: main
   ```

   **Private Repository ise**:
   ```
   ✅ Private Repository (GitHub)
   GitHub Token: [GitHub Personal Access Token yapıştır]
   Repository: KULLANICI_ADINIZ/2sweety-web seçin
   Branch: main
   ```

4. **Next** veya **Continue** tıklayın

### 2.3 Build Configuration Ayarla

```
Application Name: 2sweety-web
Build Pack: nixpacks (otomatik seçilir) veya dockerfile
Build Command: npm install && npm run build
Start Command: [Boş bırakın - static hosting]
Base Directory: /
Publish Directory: build
Port: 80 (otomatik)
```

### 2.4 Environment Variables Ekle

**ÖNEMLİ**: Aşağıdaki adımları DİKKATLE takip edin!

1. **Settings** veya **Environment Variables** sekmesine gidin
2. **Build Arguments** seçin (Build Variables değil!)
3. `.env.coolify` dosyasını açın:
   ```bash
   cat "/Users/max/Downloads/2sweet/GoMeet Web/.env.coolify"
   ```
4. **Tüm içeriği kopyalayın**
5. Coolify'da **tek seferde** yapıştırın

**Alternatif**: Tek tek eklemek isterseniz, aşağıdaki MİNİMUM değişkenleri ekleyin:

```bash
ESLINT_NO_DEV_ERRORS=true
GENERATE_SOURCEMAP=false
SKIP_PREFLIGHT_CHECK=true
REACT_APP_NAME=2Sweety
REACT_APP_VERSION=1.0.0
REACT_APP_ENVIRONMENT=production
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
REACT_APP_IMAGE_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_PAYMENT_BASE_URL=https://gomeet.cscodetech.cloud/
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_AUTH_DOMAIN=sweet-a6718.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
REACT_APP_FIREBASE_STORAGE_BUCKET=sweet-a6718.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0
REACT_APP_FIREBASE_MEASUREMENT_ID=G-EQGMN8DYDP
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_DEFAULT_CURRENCY=USD
REACT_APP_DEBUG_MODE=false
REACT_APP_ENABLE_ANALYTICS=true
```

6. **Save** tıklayın

### 2.5 İlk Deployment

1. **Deploy** butonuna tıklayın
2. **Build Logs** açılacak
3. Build sürecini izleyin (3-5 dakika):
   ```
   ▶ Cloning repository...
   ▶ Installing dependencies...
   ▶ npm install
   ▶ Building application...
   ▶ npm run build
   ▶ Creating optimized production build...
   ✓ Compiled successfully!
   ▶ Deploying...
   ✓ Deployed successfully!
   ```
4. Başarılı olursa: URL gösterilecek (örn: `https://2sweety-web-xxxx.coolify.io`)

### 2.6 İlk Test

1. Verilen URL'yi tarayıcıda açın
2. Uygulamanın açıldığını kontrol edin
3. **F12** > **Console** açıp hata olup olmadığına bakın
4. Temel özellikleri test edin:
   - Login sayfası açılıyor mu?
   - Firebase bağlanıyor mu?
   - API çağrıları çalışıyor mu?

---

## 🌐 ADIM 3: Domain Bağlama (2sweety.com)

### 3.1 DNS Ayarları

Domain sağlayıcınızda (Namecheap, GoDaddy, vb.):

**A Record ekle**:
```
Type: A
Host: @
Value: [COOLIFY_SUNUCU_IP_ADRESI]
TTL: 300 (5 dakika)
```

**CNAME Record ekle** (www için):
```
Type: CNAME
Host: www
Value: 2sweety.com
TTL: 300
```

### 3.2 Coolify'da Domain Ekle

1. **Application** > **Domains** sekmesi
2. **+ Add Domain** tıkla
3. Domain gir:
   ```
   Domain: 2sweety.com
   ✅ Redirect www to non-www
   ```
4. **Save** tıkla
5. **DNS propagation** bekle (5-30 dakika)

Test et:
```bash
ping 2sweety.com
# Coolify sunucu IP'si gelmeli
```

---

## 🔒 ADIM 4: SSL Sertifikası (HTTPS)

### 4.1 Otomatik SSL (Let's Encrypt)

1. **Application** > **SSL/TLS** sekmesi
2. **Enable Auto SSL** aktif et
3. **Generate Certificate** tıkla
4. 1-2 dakika bekle
5. ✅ **SSL Certificate issued!**

Artık: **https://2sweety.com** çalışıyor!

### 4.2 SSL Testi

```bash
# SSL kontrol
curl -I https://2sweety.com

# Sonuç:
# HTTP/2 200
# ✅ HTTPS çalışıyor!
```

---

## 🔄 ADIM 5: Otomatik Deployment Ayarla (Opsiyonel)

### 5.1 Coolify Webhook

1. **Application** > **Settings**
2. **Auto Deploy on Push** aktif et
3. **Webhook URL** kopyala (örn: `https://coolify.io/webhooks/xxxx`)

### 5.2 GitHub Webhook Ekle

1. **GitHub** repository > **Settings** > **Webhooks**
2. **Add webhook**
3. Ayarlar:
   ```
   Payload URL: [Coolify webhook URL'ini yapıştır]
   Content type: application/json
   Secret: [Boş bırak veya Coolify'da belirtilen secret]
   Events: ✅ Just the push event
   ✅ Active
   ```
4. **Add webhook** tıkla

### 5.3 Test Et

```bash
# Bir değişiklik yap
echo "# Test" >> README.md

# Commit ve push
git add .
git commit -m "Test auto deployment"
git push

# Coolify'da otomatik deployment başlayacak!
```

---

## ✅ Deployment Checklist

### GitHub
- [ ] Repository oluşturuldu
- [ ] `.env.coolify` dosyası repository'de (public repo ise gerçek keyleri SİLMEYİ unutma!)
- [ ] `COOLIFY_DEPLOYMENT_TR.md` commitlendi
- [ ] `README.md` güncellendi
- [ ] Tüm dosyalar push edildi

### Coolify
- [ ] Uygulama oluşturuldu
- [ ] GitHub repository bağlandı
- [ ] Build configuration yapıldı
- [ ] Environment variables eklendi
- [ ] İlk deployment başarılı
- [ ] Uygulama test edildi

### Domain (Opsiyonel)
- [ ] DNS A record eklendi
- [ ] DNS CNAME (www) eklendi
- [ ] Coolify'da domain eklendi
- [ ] DNS propagation tamamlandı
- [ ] SSL sertifikası oluşturuldu
- [ ] https://2sweety.com çalışıyor

### Güvenlik
- [ ] Firebase Console'da `2sweety.com` authorized domains'e eklendi
- [ ] Firestore security rules production-ready
- [ ] API keylere domain kısıtlaması eklendi
- [ ] CORS ayarları yapıldı (backend'de)

---

## 🎯 Sonraki Adımlar

### Hemen (10 dakika)
1. GitHub'a push yap
2. Coolify'da deployment yap
3. Test et

### Bu Hafta
1. Domain bağla (2sweety.com)
2. SSL aktif et
3. Firebase Console'da domain ekle
4. Tüm özellikleri test et

### Bu Ay
1. API keylerini al (Agora, OneSignal, Maps, vb.)
2. Payment gateway hesapları oluştur
3. Monitoring kur (Google Analytics, vb.)
4. CDN aktif et (Cloudflare)

---

## 🐛 Sık Karşılaşılan Sorunlar

### Build Hatası

**Hata**: `npm install failed`

**Çözüm**:
```bash
# package-lock.json'ı commitlemediğiniz için olabilir
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Beyaz Ekran

**Hata**: Deployment başarılı ama sayfa açılmıyor

**Çözüm**:
1. Browser console (F12) açıp hataları kontrol et
2. Genellikle environment variable eksik
3. `.env.coolify` dosyasındaki TÜM değişkenlerin Coolify'da olduğundan emin ol
4. **Redeploy** yap

### API Çağrıları Çalışmıyor

**Hata**: `CORS error` veya `Network error`

**Çözüm**:
1. Backend API'de CORS ayarlarını kontrol et
2. `2sweety.com` domain'ini CORS allowed origins'e ekle
3. API URL'lerinin doğru olduğunu kontrol et (.env.coolify)

---

## 📞 Yardım

### Dokümantasyon
- **Detaylı rehber**: `COOLIFY_DEPLOYMENT_TR.md`
- **Environment variables**: `.env.coolify`
- **Proje bilgisi**: `README.md`

### Community
- **Coolify Discord**: https://coolify.io/discord
- **Coolify Docs**: https://coolify.io/docs

---

## 🎉 Başarılı Deployment!

Tüm adımlar tamamlandıktan sonra:

✅ **GitHub**: https://github.com/KULLANICI_ADINIZ/2sweety-web
✅ **Coolify**: https://2sweety-web-xxxx.coolify.io
✅ **Production**: https://2sweety.com (domain bağlandıktan sonra)

---

**Kolay gelsin! 🚀**

Sorularınız için: `COOLIFY_DEPLOYMENT_TR.md` dosyasındaki **Sorun Giderme** bölümüne bakın.
