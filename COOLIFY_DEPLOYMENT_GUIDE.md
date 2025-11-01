# 2Sweety Coolify Deployment Guide

## 🔍 Önemli Bulgular

**Kodunuzu inceledim ve şunları buldum:**

1. **Firebase Config HARDCODED**: `src/Users_Chats/Firebase.js` dosyasında Firebase ayarları sabit yazılmış
2. **API URLs HARDCODED**: `src/Context/MyProvider.jsx` dosyasında API URL'leri sabit yazılmış
3. **Environment Variables KULLANILMIYOR**: React kodunda `process.env` hiç kullanılmamış

Bu yüzden Coolify'da environment variable eklemeniz şu anda bir işe yaramıyor!

## ✅ Mevcut Konfigürasyonunuz

### Firebase (Firebase.js'de sabit):
```javascript
apiKey: "AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to"
authDomain: "sweet-a6718.firebaseapp.com"
projectId: "sweet-a6718"
storageBucket: "sweet-a6718.firebasestorage.app"
messagingSenderId: "487435792097"
appId: "1:487435792097:web:12907427892d53c82251a0"
measurementId: "G-EQGMN8DYDP"
```

### API URLs (MyProvider.jsx'de sabit):
```javascript
basUrl = "https://gomeet.cscodetech.cloud/api/"
imageBaseURL = "https://gomeet.cscodetech.cloud/"
paymentBaseURL = "https://gomeet.cscodetech.cloud/"
```

### .env.coolify Dosyanızda Farklı Firebase Config Var!
```
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to (Aynı)
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097 (Aynı)
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0 (Aynı)
```

## 🚨 Bad Gateway Sorununun ASIL Nedeni

1. **npm ci --only=production** kullanıldığı için `tailwindcss` gibi build için gerekli devDependencies yüklenmiyordu
2. Bu yüzden build başarısız oluyordu
3. Build başarısız olunca nginx'e serve edilecek dosya olmuyordu

## ✅ Çözüm (Zaten Uygulandı)

Dockerfile'da şu değişiklik yapıldı:
```dockerfile
# Önceki (YANLIŞ):
RUN npm ci --only=production

# Yeni (DOĞRU):
RUN npm ci
```

## 🚀 Coolify'da Yapmanız Gerekenler

### 1. Environment Variables (Opsiyonel - Kod bunları kullanmıyor)
Şu an kodunuz environment variable kullanmadığı için bunları eklemenize gerek yok. Ama gelecek için ekleyebilirsiniz:

```bash
# Build optimizasyonu için
GENERATE_SOURCEMAP=false
ESLINT_NO_DEV_ERRORS=true
SKIP_PREFLIGHT_CHECK=true
CI=false
```

### 2. Port Ayarı
- Application Port: **80**
- Exposed Port: **80**

### 3. Domain Ayarı
- Eğer custom domain kullanıyorsanız (örn: 2sweety.com):
  - Coolify'da domain ekleyin
  - DNS A record'u Coolify sunucu IP'sine yönlendirin

### 4. Health Check
Dockerfile'da zaten ayarlı, Coolify otomatik algılayacak.

## 📝 Deploy Adımları

1. **Redeploy** butonuna tıklayın
2. Build log'larını izleyin:
   - `npm ci` başarılı olmalı
   - `npm run build` başarılı olmalı
   - Docker image oluşturulmalı
3. Container başladığında nginx log'ları görünmeli
4. Site açılmalı!

## 🔧 Hala Bad Gateway Alıyorsanız

1. **Application Logs** kontrol edin:
   ```
   - npm run build hata veriyor mu?
   - nginx başladı mı?
   ```

2. **Container içine girin ve kontrol edin:**
   ```bash
   # Coolify'da terminal aç
   ls /usr/share/nginx/html
   # index.html ve diğer dosyalar görünmeli
   ```

3. **Browser Console'da hata var mı?**
   - Firebase connection error?
   - API connection error?

## 💡 Öneriler

1. **Environment Variables Kullanın**: Kodunuzu güncelleyip environment variable'ları kullanmaya başlayın
2. **Firebase Güvenlik**: Firebase console'da domain restriction ekleyin
3. **API Backend**: Kendi backend'inizi deploy edin (şu an cscodetech.cloud kullanıyorsunuz)

## 📞 Yardım

Eğer hala sorun yaşıyorsanız:
1. Build log'larını paylaşın
2. Application log'larını paylaşın
3. Browser console hatalarını paylaşın