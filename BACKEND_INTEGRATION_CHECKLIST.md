# Backend Integration Checklist - Google OAuth

Bu dosya, backend ekibinin Google OAuth entegrasyonu için yapması gereken değişiklikleri listeler.

## ✅ Yapılması Gerekenler

### 1. Database Schema Güncellemeleri

```sql
-- Users tablosuna yeni kolonlar ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'email';
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_pic_url TEXT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;

-- Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_auth_type ON users(auth_type);

-- Unique constraint (bir Google ID sadece bir hesaba bağlı olabilir)
ALTER TABLE users ADD CONSTRAINT unique_google_id UNIQUE (google_id);
```

### 2. Registration Endpoint (`u_register.php`)

#### Mevcut Request Format:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "user_password",
  "ccode": "+1",
  "mobile": "1234567890",
  "rcode": "REF123",
  "lats": "37.7749",
  "longs": "-122.4194",
  "imei": "device_id"
}
```

#### Yeni Request Format (Google OAuth):
```json
{
  "name": "John Doe",
  "email": "john@gmail.com",
  "password": "google_1234567890",
  "ccode": "+1",
  "mobile": "",
  "rcode": "",
  "lats": "0",
  "longs": "0",
  "imei": "web",
  "auth_type": "google",
  "google_id": "1234567890",
  "profile_pic": "https://lh3.googleusercontent.com/..."
}
```

#### Backend Logic:

```php
<?php
// u_register.php

// Parametreleri al
$auth_type = isset($_POST['auth_type']) ? $_POST['auth_type'] : 'email';
$google_id = isset($_POST['google_id']) ? $_POST['google_id'] : null;
$profile_pic = isset($_POST['profile_pic']) ? $_POST['profile_pic'] : null;

// Google OAuth ile kayıt
if ($auth_type === 'google') {
    // 1. Google ID ile kullanıcı var mı kontrol et
    $existing_user = checkUserByGoogleId($google_id);
    
    if ($existing_user) {
        // Kullanıcı zaten kayıtlı
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'This Google account is already registered. Please login instead.'
        ]);
    }
    
    // 2. Email ile kullanıcı var mı kontrol et
    $existing_email = checkUserByEmail($email);
    
    if ($existing_email && $existing_email['auth_type'] !== 'google') {
        // Email zaten normal kayıt ile kullanılmış
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'This email is already registered. Please login with your password.'
        ]);
    }
    
    // 3. Password kontrolü (güvenlik için)
    $expected_password = "google_" . $google_id;
    if ($password !== $expected_password) {
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'Invalid Google credentials'
        ]);
    }
    
    // 4. Yeni kullanıcı oluştur
    $user_id = createUser([
        'name' => $name,
        'email' => $email,
        'password' => password_hash($password, PASSWORD_BCRYPT), // Hash'le
        'auth_type' => 'google',
        'google_id' => $google_id,
        'profile_pic_url' => $profile_pic,
        'email_verified' => true, // Google'dan gelen email doğrulanmış
        'mobile' => $mobile,
        'ccode' => $ccode,
        'referral_code' => $rcode,
        'latitude' => $lats,
        'longitude' => $longs,
        'device_id' => $imei
    ]);
    
    if ($user_id) {
        // Token oluştur
        $token = generateJWT($user_id);
        
        // Kullanıcı bilgilerini al
        $user_data = getUserById($user_id);
        
        return json_encode([
            'Result' => 'true',
            'ResponseMsg' => 'Registration successful',
            'UserLogin' => $user_data,
            'token' => $token
        ]);
    }
}

// Normal email/password kaydı (mevcut kod)
// ...
?>
```

### 3. Login Endpoint (`user_login.php`)

#### Mevcut Request Format:
```json
{
  "mobile": "john@example.com",
  "ccode": "+1",
  "password": "user_password"
}
```

#### Yeni Request Format (Google OAuth):
```json
{
  "mobile": "john@gmail.com",
  "ccode": "+1",
  "password": "google_1234567890",
  "auth_type": "google",
  "google_id": "1234567890"
}
```

#### Backend Logic:

```php
<?php
// user_login.php

// Parametreleri al
$auth_type = isset($_POST['auth_type']) ? $_POST['auth_type'] : 'email';
$google_id = isset($_POST['google_id']) ? $_POST['google_id'] : null;

// Google OAuth ile giriş
if ($auth_type === 'google') {
    // 1. Google ID ile kullanıcı bul
    $user = getUserByGoogleId($google_id);
    
    if (!$user) {
        // Kullanıcı bulunamadı
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'Account not found. Please sign up first.'
        ]);
    }
    
    // 2. Password kontrolü
    $expected_password = "google_" . $google_id;
    if ($password !== $expected_password) {
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'Invalid credentials'
        ]);
    }
    
    // 3. Auth type kontrolü
    if ($user['auth_type'] !== 'google') {
        return json_encode([
            'Result' => 'false',
            'ResponseMsg' => 'This account was registered with email/password. Please login normally.'
        ]);
    }
    
    // 4. Başarılı giriş
    // Token oluştur
    $token = generateJWT($user['id']);
    
    // Son giriş zamanını güncelle
    updateLastLogin($user['id']);
    
    return json_encode([
        'Result' => 'true',
        'ResponseMsg' => 'Login successful',
        'UserLogin' => $user,
        'token' => $token
    ]);
}

// Normal email/password girişi (mevcut kod)
// ...
?>
```

### 4. Helper Functions

```php
<?php
// helpers.php

/**
 * Google ID ile kullanıcı kontrolü
 */
function checkUserByGoogleId($google_id) {
    global $db;
    
    $stmt = $db->prepare("SELECT * FROM users WHERE google_id = ? LIMIT 1");
    $stmt->bind_param("s", $google_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

/**
 * Google ID ile kullanıcı getir
 */
function getUserByGoogleId($google_id) {
    global $db;
    
    $stmt = $db->prepare("
        SELECT * FROM users 
        WHERE google_id = ? AND auth_type = 'google' 
        LIMIT 1
    ");
    $stmt->bind_param("s", $google_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

/**
 * Email ve auth_type ile kullanıcı kontrolü
 */
function checkUserByEmailAndAuthType($email, $auth_type) {
    global $db;
    
    $stmt = $db->prepare("
        SELECT * FROM users 
        WHERE email = ? AND auth_type = ? 
        LIMIT 1
    ");
    $stmt->bind_param("ss", $email, $auth_type);
    $stmt->execute();
    $result = $stmt->get_result();
    
    return $result->fetch_assoc();
}

/**
 * JWT Token oluştur
 */
function generateJWT($user_id) {
    // JWT library kullanarak token oluştur
    // Örnek: Firebase JWT, PHP-JWT vb.
    
    $payload = [
        'user_id' => $user_id,
        'iat' => time(),
        'exp' => time() + (60 * 60 * 24 * 30) // 30 gün
    ];
    
    return JWT::encode($payload, JWT_SECRET, 'HS256');
}
?>
```

### 5. Güvenlik Kontrolleri

```php
<?php
// security.php

/**
 * Google JWT Token Doğrulama (Opsiyonel ama önerilir)
 * Frontend'den gelen credential'ı doğrula
 */
function verifyGoogleToken($credential) {
    require_once 'vendor/autoload.php';
    
    $client = new Google_Client(['client_id' => GOOGLE_CLIENT_ID]);
    $payload = $client->verifyIdToken($credential);
    
    if ($payload) {
        return [
            'valid' => true,
            'email' => $payload['email'],
            'name' => $payload['name'],
            'picture' => $payload['picture'],
            'sub' => $payload['sub'], // Google ID
            'email_verified' => $payload['email_verified']
        ];
    } else {
        return ['valid' => false];
    }
}

/**
 * Rate Limiting - Google OAuth istekleri için
 */
function checkRateLimit($ip_address, $action = 'google_oauth') {
    global $db;
    
    // Son 1 saatte kaç istek yapılmış?
    $stmt = $db->prepare("
        SELECT COUNT(*) as count 
        FROM rate_limits 
        WHERE ip_address = ? 
        AND action = ? 
        AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)
    ");
    $stmt->bind_param("ss", $ip_address, $action);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    
    if ($result['count'] > 20) { // 1 saatte max 20 istek
        return false;
    }
    
    // İsteği kaydet
    $stmt = $db->prepare("
        INSERT INTO rate_limits (ip_address, action, created_at) 
        VALUES (?, ?, NOW())
    ");
    $stmt->bind_param("ss", $ip_address, $action);
    $stmt->execute();
    
    return true;
}
?>
```

### 6. Response Format Standardizasyonu

Tüm endpoint'ler aynı response formatını kullanmalı:

```json
// Başarılı Response
{
  "Result": "true",
  "ResponseMsg": "Operation successful",
  "UserLogin": {
    "id": "123",
    "name": "John Doe",
    "email": "john@gmail.com",
    "profile_pic": "https://...",
    "auth_type": "google",
    "email_verified": true,
    // ... diğer user bilgileri
  },
  "token": "jwt_token_here"
}

// Hata Response
{
  "Result": "false",
  "ResponseMsg": "Error message here",
  "ErrorCode": "GOOGLE_AUTH_FAILED" // Opsiyonel
}
```

---

## 🧪 Test Senaryoları

### Test 1: Yeni Kullanıcı Kaydı (Google)
```bash
curl -X POST https://api.2sweety.app/u_register.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@gmail.com",
    "password": "google_1234567890",
    "auth_type": "google",
    "google_id": "1234567890",
    "profile_pic": "https://lh3.googleusercontent.com/test.jpg",
    "ccode": "+1",
    "mobile": "",
    "imei": "web"
  }'
```

**Beklenen Sonuç:** 
- `Result: "true"`
- User ID döner
- Token döner

### Test 2: Mevcut Kullanıcı Girişi (Google)
```bash
curl -X POST https://api.2sweety.app/user_login.php \
  -H "Content-Type: application/json" \
  -d '{
    "mobile": "test@gmail.com",
    "password": "google_1234567890",
    "auth_type": "google",
    "google_id": "1234567890",
    "ccode": "+1"
  }'
```

**Beklenen Sonuç:**
- `Result: "true"`
- User bilgileri döner
- Token döner

### Test 3: Duplicate Google ID
```bash
# Aynı Google ID ile tekrar kayıt dene
curl -X POST https://api.2sweety.app/u_register.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User 2",
    "email": "test2@gmail.com",
    "password": "google_1234567890",
    "auth_type": "google",
    "google_id": "1234567890",
    "ccode": "+1",
    "mobile": "",
    "imei": "web"
  }'
```

**Beklenen Sonuç:**
- `Result: "false"`
- `ResponseMsg: "This Google account is already registered"`

### Test 4: Email Conflict
```bash
# Normal kayıt ile kullanılmış email'i Google ile kaydet
curl -X POST https://api.2sweety.app/u_register.php \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "existing@example.com",
    "password": "google_9999999999",
    "auth_type": "google",
    "google_id": "9999999999",
    "ccode": "+1",
    "mobile": "",
    "imei": "web"
  }'
```

**Beklenen Sonuç:**
- `Result: "false"`
- `ResponseMsg: "This email is already registered"`

---

## 📊 Database Migration Script

```sql
-- Migration: Add Google OAuth support
-- Date: 2024-11-20
-- Version: 1.0.0

START TRANSACTION;

-- 1. Add new columns
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS auth_type VARCHAR(20) DEFAULT 'email' AFTER password,
ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) NULL AFTER auth_type,
ADD COLUMN IF NOT EXISTS facebook_id VARCHAR(255) NULL AFTER google_id,
ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) NULL AFTER facebook_id,
ADD COLUMN IF NOT EXISTS profile_pic_url TEXT NULL AFTER apple_id,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE AFTER email;

-- 2. Add indexes
CREATE INDEX IF NOT EXISTS idx_auth_type ON users(auth_type);
CREATE INDEX IF NOT EXISTS idx_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_facebook_id ON users(facebook_id);
CREATE INDEX IF NOT EXISTS idx_apple_id ON users(apple_id);

-- 3. Add unique constraints
ALTER TABLE users ADD CONSTRAINT unique_google_id UNIQUE (google_id);
ALTER TABLE users ADD CONSTRAINT unique_facebook_id UNIQUE (facebook_id);
ALTER TABLE users ADD CONSTRAINT unique_apple_id UNIQUE (apple_id);

-- 4. Update existing users (set auth_type to 'email')
UPDATE users SET auth_type = 'email' WHERE auth_type IS NULL OR auth_type = '';

-- 5. Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_ip_action (ip_address, action),
    INDEX idx_created_at (created_at)
);

COMMIT;

-- Rollback script (if needed)
-- ALTER TABLE users DROP COLUMN auth_type;
-- ALTER TABLE users DROP COLUMN google_id;
-- ALTER TABLE users DROP COLUMN facebook_id;
-- ALTER TABLE users DROP COLUMN apple_id;
-- ALTER TABLE users DROP COLUMN profile_pic_url;
-- ALTER TABLE users DROP COLUMN email_verified;
-- DROP TABLE rate_limits;
```

---

## ✅ Deployment Checklist

- [ ] Database migration çalıştırıldı
- [ ] `u_register.php` güncellendi
- [ ] `user_login.php` güncellendi
- [ ] Helper functions eklendi
- [ ] Security checks eklendi
- [ ] Rate limiting implementasyonu yapıldı
- [ ] Test senaryoları çalıştırıldı
- [ ] Production'a deploy edildi
- [ ] Frontend ile entegrasyon test edildi
- [ ] Error logging aktif
- [ ] Monitoring kuruldu

---

## 📞 İletişim

Sorularınız için:
- Backend Lead: [email]
- Frontend Lead: [email]
- DevOps: [email]

---

**Son Güncelleme:** 20 Kasım 2024
**Versiyon:** 1.0.0
