# 🔧 Coolify Ayarları - 2Sweety

## 📋 Coolify Dashboard Ayarları

### 1️⃣ General (Genel Ayarlar)

```
Application Name: 2sweety-web
Description: 2Sweety Dating Web Application
```

### 2️⃣ Source (Kaynak)

**Public Repository:**
```
Source Type: Public Repository
Repository URL: https://github.com/KULLANICI_ADINIZ/2sweety-web
Branch: main
```

**Private Repository:**
```
Source Type: Private Repository (GitHub)
GitHub Token: [Personal Access Token]
Repository: KULLANICI_ADINIZ/2sweety-web
Branch: main
```

### 3️⃣ Build Pack

```
Build Pack: nixpacks (otomatik seçilir)
```

veya

```
Build Pack: dockerfile (eğer Dockerfile eklerseniz)
```

### 4️⃣ Domains (Domain)

```
Primary Domain: 2sweety.com
Additional Domains: www.2sweety.com
```

**Domain Settings:**
- ✅ Redirect www to non-www
- ✅ Enable HTTPS
- ✅ Force HTTPS

### 5️⃣ Build Configuration

```
Install Command: npm install
Build Command: npm run build
Start Command: [BOŞ BIRAK - static hosting]
Base Directory: /
Publish Directory: build
Port: 80
```

### 6️⃣ Environment Variables

**⚠️ ÖNEMLİ:** "Build Arguments" sekmesine eklenmeli!

**Hangi .env dosyasını kullanmalısınız?**

#### Seçenek A: Kendi Backend'iniz Varsa

`.env.coolify.KENDI-BACKEND` dosyasını kullanın:

```bash
# Önce API URL'inizi düzenleyin!
# Dosyayı açın ve şu satırları kendi backend URL'inizle değiştirin:

REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
REACT_APP_IMAGE_BASE_URL=https://api.2sweety.com/
REACT_APP_PAYMENT_BASE_URL=https://api.2sweety.com/
```

Sonra tüm dosya içeriğini Coolify'a yapıştırın.

#### Seçenek B: Backend Henüz Yoksa (Test Amaçlı)

`.env.coolify.TEST-API` dosyasını kullanın:

```bash
# Test API kullanır (gomeet.cscodetech.cloud)
# ⚠️ Production için önerilmez!
# Sadece test etmek için kullanın
```

**Coolify'da Nereye Eklenecek:**

```
Settings > Environment Variables > Build Arguments > [YAPIŞTIR]
```

**❌ YAPMAYIN:**
- Runtime Variables'a eklemeyin
- Secrets'a eklemeyin
- Normal Environment Variables'a eklemeyin

**✅ DOĞRU:**
- Build Arguments'a ekleyin

### 7️⃣ Resources (Kaynaklar)

**Minimum Önerilen:**
```
Memory: 2GB
CPU: 1 Core
Storage: 5GB
```

**Önerilen (Daha İyi Performans):**
```
Memory: 4GB
CPU: 2 Cores
Storage: 10GB
```

### 8️⃣ Health Check

```
Health Check Path: /
Health Check Method: GET
Health Check Interval: 60 seconds
Health Check Timeout: 30 seconds
Health Check Retries: 3
```

### 9️⃣ SSL/TLS

```
✅ Enable Auto SSL (Let's Encrypt)
✅ Force HTTPS
Certificate Type: Let's Encrypt
```

**SSL Oluşturma Adımları:**
1. Domain'in DNS ayarlarını yaptıktan sonra 5-30 dakika bekleyin
2. `SSL/TLS` sekmesine gidin
3. `Generate Certificate` butonuna tıklayın
4. 1-2 dakika bekleyin
5. ✅ Sertifika hazır!

### 🔟 Deployment Settings

```
✅ Auto Deploy on Push (GitHub webhook ile otomatik)
Deployment Strategy: Rolling Update
Deployment Timeout: 600 seconds (10 dakika)
```

---

## 🎯 DOĞRU AYARLAR KONTROLÜ

### Build Arguments Kontrolü

Coolify > Application > Environment Variables > Build Arguments

**MUTLAKA olması gerekenler:**

```bash
✅ ESLINT_NO_DEV_ERRORS=true
✅ GENERATE_SOURCEMAP=false
✅ REACT_APP_NAME=2Sweety
✅ REACT_APP_FIREBASE_API_KEY=AIzaSy...
✅ REACT_APP_FIREBASE_PROJECT_ID=sweet-a6718
✅ REACT_APP_API_BASE_URL=https://...
```

### Build Configuration Kontrolü

```bash
✅ Build Command: npm install && npm run build
✅ Publish Directory: build
✅ Start Command: [BOŞ]
```

### Domain Kontrolü

```bash
# DNS test
ping 2sweety.com
# Coolify sunucu IP'si dönmeli

# HTTPS test
curl -I https://2sweety.com
# HTTP/2 200 dönmeli
```

---

## ❌ Sık Yapılan Hatalar

### Hata 1: Environment Variables Yanlış Yere Eklendi

**Yanlış:**
```
Runtime Variables ❌
Secrets ❌
Environment Variables ❌
```

**Doğru:**
```
Build Arguments ✅
```

### Hata 2: Start Command Doldurulmuş

**Yanlış:**
```
Start Command: npm start ❌
Start Command: serve -s build ❌
```

**Doğru:**
```
Start Command: [BOŞ BIRAK] ✅
```

Coolify static dosyalar için otomatik Nginx kullanır!

### Hata 3: Publish Directory Yanlış

**Yanlış:**
```
Publish Directory: / ❌
Publish Directory: public ❌
Publish Directory: dist ❌
```

**Doğru:**
```
Publish Directory: build ✅
```

### Hata 4: API URL Eksik/Yanlış

**Yanlış:**
```
REACT_APP_API_BASE_URL yok ❌
REACT_APP_API_BASE_URL=localhost:3000 ❌
```

**Doğru:**
```
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/ ✅
```

---

## 🚀 Deployment Sonrası Test

### 1. Build Logs Kontrol

```
▶ Cloning repository... ✅
▶ Installing dependencies... ✅
▶ npm install ✅
▶ Building application... ✅
▶ npm run build ✅
▶ Creating optimized production build... ✅
✓ Compiled successfully! ✅
▶ Deploying... ✅
✓ Deployed successfully! ✅
```

### 2. Uygulama Testi

```bash
# URL'yi aç
https://2sweety-web-xxxx.coolify.io

# Kontroller:
✅ Sayfa açılıyor
✅ Firebase bağlanıyor
✅ API çağrıları çalışıyor
✅ Console'da kritik hata yok
```

### 3. Environment Variables Testi

Browser Console (F12) > Console:

```javascript
// Kontrol
console.log(process.env.REACT_APP_FIREBASE_PROJECT_ID)
// "sweet-a6718" dönmeli

console.log(process.env.REACT_APP_NAME)
// "2Sweety" dönmeli
```

**⚠️ Dikkat:** Build-time variables build sırasında embed edilir, runtime'da değiştirilemez!

---

## 📸 Coolify Screenshot'ları İçin Kontrol Listesi

Eğer screenshot gönderdiyseniz, şunları kontrol edin:

### Build Configuration Screenshot:
- [ ] Build Command doğru
- [ ] Publish Directory: `build`
- [ ] Start Command boş

### Environment Variables Screenshot:
- [ ] "Build Arguments" sekmesi seçili
- [ ] Tüm REACT_APP_* değişkenler var
- [ ] Firebase config tam
- [ ] API URL'ler doğru

### Domain Screenshot:
- [ ] 2sweety.com eklendi
- [ ] SSL aktif
- [ ] Force HTTPS aktif

---

## 💡 Backend URL Kararı

**Backend'iniz VAR:**
```bash
REACT_APP_API_BASE_URL=https://api.2sweety.com/api/
```

**Backend'iniz YOK (geçici test):**
```bash
REACT_APP_API_BASE_URL=https://gomeet.cscodetech.cloud/api/
```

**Backend planlıyorsunuz:**
Önce test API ile deploy edin, backend hazır olunca:
1. .env.coolify değiştir
2. Coolify'da Build Arguments güncelle
3. Redeploy yap

---

## ✅ Özet Checklist

Deployment öncesi:

- [ ] GitHub'a push edildi
- [ ] Coolify'da application oluşturuldu
- [ ] **Build Arguments** doğru şekilde eklendi (.env.coolify'dan kopyalandı)
- [ ] Build Command: `npm install && npm run build`
- [ ] Publish Directory: `build`
- [ ] Start Command: **BOŞ**
- [ ] Domain eklendi (opsiyonel)
- [ ] SSL aktif edildi (opsiyonel)

**Deployment'a hazırsınız! 🚀**
