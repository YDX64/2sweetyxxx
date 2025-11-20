# Google OAuth Kurulum Rehberi - 2Sweety

Bu dokümantasyon, 2Sweety uygulamasında Google OAuth entegrasyonunun nasıl yapılandırılacağını ve tüm platformlarda (Web, Mobil App, vb.) tutarlı bir şekilde nasıl kullanılacağını açıklar.

## 📋 İçindekiler

1. [Google Cloud Console Kurulumu](#google-cloud-console-kurulumu)
2. [Mevcut Implementasyon](#mevcut-implementasyon)
3. [Environment Variables](#environment-variables)
4. [Backend Entegrasyonu](#backend-entegrasyonu)
5. [Çoklu Platform Desteği](#çoklu-platform-desteği)
6. [Güvenlik ve Best Practices](#güvenlik-ve-best-practices)
7. [Troubleshooting](#troubleshooting)

---

## 🔧 Google Cloud Console Kurulumu

### Adım 1: Google Cloud Project Oluşturma

1. **Google Cloud Console'a gidin:** https://console.cloud.google.com/
2. Yeni bir proje oluşturun veya mevcut projeyi seçin
   - Proje adı: `2Sweety` (veya tercih ettiğiniz isim)
   - Production için ayrı bir proje oluşturmanız önerilir

### Adım 2: OAuth 2.0 Client ID Oluşturma

1. **Credentials sayfasına gidin:**
   - Navigation Menu → APIs & Services → Credentials
   - URL: https://console.developers.google.com/apis/credentials

2. **"Create Credentials" → "OAuth 2.0 Client ID"** seçin

3. **Application Type:** `Web application` seçin

4. **Authorized JavaScript origins** ekleyin:
   ```
   https://2sweety.app
   https://www.2sweety.app
   http://localhost:3000 (development için)
   ```

5. **Authorized redirect URIs** ekleyin (opsiyonel):
   ```
   https://2sweety.app/auth/callback
   https://www.2sweety.app/auth/callback
   http://localhost:3000/auth/callback
   ```

6. **Client ID'yi kaydedin** - Bu değeri `.env` dosyanıza ekleyeceksiniz

### Adım 3: OAuth Consent Screen Yapılandırması

1. **OAuth consent screen sayfasına gidin:**
   - Navigation Menu → APIs & Services → OAuth consent screen
   - URL: https://console.developers.google.com/auth/branding

2. **User Type seçin:**
   - **External** (herkese açık uygulama için)
   - **Internal** (sadece Google Workspace kullanıcıları için)

3. **App Information doldurun:**
   - **App name:** `2Sweety`
   - **User support email:** support@2sweety.app
   - **App logo:** 2Sweety logonuzu yükleyin (120x120 px önerilir)
   - **Application homepage:** `https://2sweety.app`
   - **Application privacy policy:** `https://2sweety.app/privacy`
   - **Application terms of service:** `https://2sweety.app/terms`

4. **Authorized domains ekleyin:**
   ```
   2sweety.app
   ```

5. **Developer contact information:**
   - Email: developer@2sweety.app

6. **Scopes (İzinler):**
   - Default scopes yeterli: `email`, `profile`, `openid`
   - Ek izin gerekmez (kullanıcı verilerini sadece kimlik doğrulama için kullanıyoruz)

7. **Test users** (Development aşamasında):
   - Test için kullanacağınız Gmail adreslerini ekleyin
   - Production'a geçince bu kısım kaldırılabilir

### Adım 4: Verification (Doğrulama)

**Not:** Uygulamanız 100'den fazla kullanıcıya ulaştığında Google'ın doğrulaması gerekir.

1. **Verification Status** kontrol edin
2. Gerekirse **"Submit for Verification"** butonuna tıklayın
3. Google'ın istediği bilgileri sağlayın:
   - Uygulama açıklaması
   - Privacy policy
   - Terms of service
   - Demo video (opsiyonel ama önerilir)

---

## 💻 Mevcut Implementasyon

### Web Uygulaması (React)

#### 1. Paketler Yüklendi

```json
{
  "@react-oauth/google": "^0.12.1",
  "jwt-decode": "^4.0.0"
}
```

#### 2. GoogleOAuthProvider Wrapper (`src/index.js`)

```javascript
import { GoogleOAuthProvider } from '@react-oauth/google';

root.render(
  <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
    <App />
  </GoogleOAuthProvider>
);
```

#### 3. Register Component (`src/MobilComponent/Register.jsx`)

**Özellikler:**
- ✅ Google ile kayıt olma
- ✅ JWT token decode
- ✅ Kullanıcı bilgilerini backend'e gönderme
- ✅ One Tap özelliği aktif
- ✅ Otomatik profil fotoğrafı çekme

```javascript
const handleGoogleSignup = async (credentialResponse) => {
  const decoded = jwtDecode(credentialResponse.credential);
  
  const googleUserData = {
    email: decoded.email,
    name: decoded.name,
    picture: decoded.picture,
    googleId: decoded.sub,
    emailVerified: decoded.email_verified
  };

  // Backend'e gönder
  const response = await axios.post(`${basUrl}u_register.php`, {
    name: googleUserData.name,
    email: googleUserData.email,
    password: `google_${googleUserData.googleId}`,
    auth_type: "google",
    google_id: googleUserData.googleId,
    profile_pic: googleUserData.picture
  });
};
```

#### 4. Login Component (`src/LoginComponent/Login.jsx`)

**Özellikler:**
- ✅ Google ile giriş yapma
- ✅ Mevcut kullanıcı kontrolü
- ✅ Yeni kullanıcıları register'a yönlendirme
- ✅ One Tap özelliği aktif

```javascript
const handleGoogleLogin = async (credentialResponse) => {
  const decoded = jwtDecode(credentialResponse.credential);
  
  const response = await axios.post(`${basUrl}user_login.php`, {
    mobile: decoded.email,
    password: `google_${decoded.sub}`,
    auth_type: "google",
    google_id: decoded.sub
  });
};
```

#### 5. GoogleLogin Component Kullanımı

```jsx
<GoogleLogin
  onSuccess={handleGoogleSignup}
  onError={handleGoogleError}
  useOneTap
  theme="outline"
  size="large"
  text="signup_with"
  shape="rectangular"
  logo_alignment="left"
  width="100%"
/>
```

---

## 🔐 Environment Variables

### Development (`.env.local`)

```bash
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=YOUR_DEV_CLIENT_ID.apps.googleusercontent.com
```

### Production (`.env.production`)

```bash
# Google OAuth
REACT_APP_GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID.apps.googleusercontent.com
```

### Coolify Deployment

Coolify'da **Build Arguments** olarak ekleyin:

```
REACT_APP_GOOGLE_CLIENT_ID=YOUR_PROD_CLIENT_ID.apps.googleusercontent.com
```

**ÖNEMLİ:** React uygulamalarında environment variables **build time**'da embed edilir, bu yüzden:
- Coolify'da **Build Arguments** olarak ekleyin (Runtime Environment Variables değil)
- Her değişiklikten sonra yeniden build gerekir

---

## 🔌 Backend Entegrasyonu

### Backend API Gereksinimleri

Backend API'nizin (`u_register.php` ve `user_login.php`) şu parametreleri desteklemesi gerekiyor:

#### Registration Endpoint (`u_register.php`)

```php
POST /api/u_register.php

// Request Body
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "google_1234567890",  // google_ prefix + Google ID
  "ccode": "+1",
  "mobile": "",
  "rcode": "",                       // Referral code (opsiyonel)
  "lats": "0",
  "longs": "0",
  "imei": "web",
  "auth_type": "google",             // ÖNEMLİ: Auth type
  "google_id": "1234567890",         // Google User ID
  "profile_pic": "https://..."       // Google profile picture URL
}

// Response
{
  "Result": "true",
  "ResponseMsg": "Registration successful",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@gmail.com",
    // ... diğer kullanıcı bilgileri
  },
  "token": "jwt_token_here"
}
```

#### Login Endpoint (`user_login.php`)

```php
POST /api/user_login.php

// Request Body
{
  "mobile": "john@gmail.com",        // Email kullanılıyor
  "ccode": "+1",
  "password": "google_1234567890",   // google_ prefix + Google ID
  "auth_type": "google",             // ÖNEMLİ: Auth type
  "google_id": "1234567890"          // Google User ID
}

// Response
{
  "Result": "true",
  "ResponseMsg": "Login successful",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@gmail.com",
    // ... diğer kullanıcı bilgileri
  },
  "token": "jwt_token_here"
}
```

### Database Schema Önerileri

```sql
ALTER TABLE users ADD COLUMN auth_type VARCHAR(20) DEFAULT 'email';
ALTER TABLE users ADD COLUMN google_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN facebook_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN apple_id VARCHAR(255) NULL;
ALTER TABLE users ADD INDEX idx_google_id (google_id);
```

### Backend Güvenlik Kontrolleri

```php
// Google ID ile giriş kontrolü
if ($auth_type === 'google') {
    // Google ID ile kullanıcı bul
    $user = findUserByGoogleId($google_id);
    
    if (!$user) {
        // Kullanıcı bulunamadı, kayıt olmaya yönlendir
        return error("User not found. Please sign up first.");
    }
    
    // Password kontrolü (google_ prefix + google_id)
    $expected_password = "google_" . $google_id;
    if ($password !== $expected_password) {
        return error("Invalid credentials");
    }
    
    // Başarılı giriş
    return success($user);
}
```

---

## 📱 Çoklu Platform Desteği

### Web (React) ✅ TAMAMLANDI

- `@react-oauth/google` paketi kullanılıyor
- One Tap özelliği aktif
- Responsive tasarım

### React Native (Mobil App)

**Önerilen Paket:** `@react-native-google-signin/google-signin`

```bash
npm install @react-native-google-signin/google-signin
```

**Kurulum:**
```javascript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // Web client ID
  iosClientId: 'YOUR_IOS_CLIENT_ID.apps.googleusercontent.com', // iOS için ayrı
  offlineAccess: true,
});

// Kullanım
const signIn = async () => {
  await GoogleSignin.hasPlayServices();
  const userInfo = await GoogleSignin.signIn();
  // Backend'e gönder
};
```

**Önemli:** 
- iOS için ayrı Client ID gerekir
- Android için SHA-1 fingerprint eklemeniz gerekir

### Flutter (Mobil App)

**Önerilen Paket:** `google_sign_in`

```yaml
dependencies:
  google_sign_in: ^6.1.0
```

### Tüm Platformlar İçin Ortak Yaklaşım

**Aynı Google Cloud Project kullanın** ama her platform için ayrı Client ID:
- **Web Client ID:** Web uygulaması için
- **iOS Client ID:** iOS app için
- **Android Client ID:** Android app için

**Backend'e gönderilen data formatı aynı olmalı:**
```json
{
  "auth_type": "google",
  "google_id": "user_google_id",
  "email": "user@gmail.com",
  "name": "User Name",
  "profile_pic": "https://..."
}
```

---

## 🔒 Güvenlik ve Best Practices

### 1. JWT Token Doğrulama

**Frontend'de:**
```javascript
import { jwtDecode } from 'jwt-decode';

const decoded = jwtDecode(credentialResponse.credential);
// decoded.email, decoded.name, decoded.sub (Google ID)
```

**Backend'de (ÖNEMLİ):**
```php
// Google'ın JWT token'ını doğrulayın
// https://developers.google.com/identity/gsi/web/guides/verify-google-id-token

function verifyGoogleToken($token) {
    $client = new Google_Client(['client_id' => CLIENT_ID]);
    $payload = $client->verifyIdToken($token);
    
    if ($payload) {
        return $payload;
    } else {
        return false;
    }
}
```

### 2. HTTPS Zorunluluğu

- Production'da **mutlaka HTTPS** kullanın
- Google OAuth, HTTP üzerinden çalışmaz (localhost hariç)

### 3. CORS Ayarları

Backend'de CORS headers ekleyin:
```php
header('Access-Control-Allow-Origin: https://2sweety.app');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### 4. Rate Limiting

Google OAuth isteklerini rate limit'e tabi tutun:
- Aynı IP'den çok fazla istek gelirse engelleyin
- Brute force saldırılarına karşı koruma

### 5. Content Security Policy (CSP)

```html
<meta http-equiv="Content-Security-Policy" 
      content="
        script-src 'self' https://accounts.google.com/gsi/client;
        frame-src 'self' https://accounts.google.com;
        connect-src 'self' https://accounts.google.com;
      ">
```

### 6. Password Güvenliği

Google OAuth ile giriş yapan kullanıcılar için:
```
password = "google_" + google_id
```

Bu şekilde:
- ✅ Her kullanıcı için unique
- ✅ Tahmin edilemez
- ✅ Google ID değişmez, güvenli

---

## 🐛 Troubleshooting

### Problem 1: "idpiframe_initialization_failed"

**Sebep:** Client ID yanlış veya eksik

**Çözüm:**
```javascript
// .env dosyasını kontrol edin
console.log(process.env.REACT_APP_GOOGLE_CLIENT_ID);

// Doğru format: XXXXXXXXX.apps.googleusercontent.com
```

### Problem 2: "popup_closed_by_user"

**Sebep:** Kullanıcı popup'ı kapattı

**Çözüm:**
```javascript
const handleGoogleError = () => {
  showTost({ 
    title: "Google login cancelled",
    type: "info"
  });
};
```

### Problem 3: "redirect_uri_mismatch"

**Sebep:** Authorized redirect URIs yanlış yapılandırılmış

**Çözüm:**
1. Google Cloud Console → Credentials
2. Authorized redirect URIs'e tam URL ekleyin
3. `https://2sweety.app` (trailing slash olmadan)

### Problem 4: One Tap çalışmıyor

**Sebep:** Third-party cookies bloke edilmiş veya FedCM desteği yok

**Çözüm:**
```javascript
// useOneTap prop'unu kaldırın veya
// FedCM desteğini kontrol edin
<GoogleLogin
  onSuccess={handleGoogleLogin}
  onError={handleGoogleError}
  // useOneTap // Bu satırı kaldırın
/>
```

### Problem 5: CORS hatası

**Sebep:** Backend CORS headers eksik

**Çözüm:**
```php
// Backend'de CORS headers ekleyin
header('Access-Control-Allow-Origin: https://2sweety.app');
header('Access-Control-Allow-Credentials: true');
```

### Problem 6: "Invalid client ID"

**Sebep:** Client ID production'da değiştirilmemiş

**Çözüm:**
1. Coolify'da Build Arguments kontrol edin
2. `REACT_APP_GOOGLE_CLIENT_ID` değerini güncelleyin
3. Yeniden deploy edin

---

## 📊 Test Checklist

### Development Testi

- [ ] Google login butonu görünüyor
- [ ] Butona tıklayınca Google popup açılıyor
- [ ] Email seçimi yapılabiliyor
- [ ] Başarılı giriş sonrası home sayfasına yönlendiriliyor
- [ ] Kullanıcı bilgileri localStorage'a kaydediliyor
- [ ] One Tap çalışıyor (opsiyonel)

### Production Testi

- [ ] HTTPS üzerinden çalışıyor
- [ ] Production Client ID kullanılıyor
- [ ] Authorized domains doğru yapılandırılmış
- [ ] OAuth consent screen doğru bilgileri gösteriyor
- [ ] Privacy Policy ve Terms linki çalışıyor
- [ ] Mobil cihazlarda responsive çalışıyor

### Backend Testi

- [ ] `auth_type: "google"` ile kayıt çalışıyor
- [ ] `google_id` database'e kaydediliyor
- [ ] Google profile picture URL kaydediliyor
- [ ] Aynı email ile normal kayıt ve Google kayıt ayrı tutuluyor
- [ ] Google ile giriş yapan kullanıcı tekrar giriş yapabiliyor

---

## 📚 Referanslar

- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google GitHub](https://github.com/MomenSherif/react-oauth)
- [Google OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [JWT Decode Library](https://github.com/auth0/jwt-decode)

---

## 🎯 Sonraki Adımlar

1. **Google Cloud Console'da Client ID oluşturun**
2. **`.env.production` dosyasını güncelleyin**
3. **Coolify'da Build Arguments ekleyin**
4. **Backend API'yi güncelleyin** (auth_type ve google_id desteği)
5. **Database schema'yı güncelleyin**
6. **Production'a deploy edin**
7. **Test edin**
8. **Mobil app için aynı sistemi kurun** (React Native veya Flutter)

---

**Son Güncelleme:** 20 Kasım 2024
**Versiyon:** 1.0.0
**Hazırlayan:** AI Assistant (Cascade)
