# 🔐 2SWEETY PLATFORM - GÜVENLİK YAPILANDIRMASI

## ⚠️ KRİTİK - HEMEN YAPILMASI GEREKENLER

### 1. Admin Panel Şifre Değişimi

#### Mevcut (GÜVENLİK RİSKİ):
```
Username: admin
Password: admin@123
```

#### Değiştirme Adımları:
1. api.2sweety.com/admin giriş yap
2. Settings > Admin Users git
3. Admin kullanıcısını düzenle
4. Güçlü şifre belirle (min 12 karakter, özel karakter, sayı, büyük/küçük harf)

#### Önerilen Güçlü Şifre Formatı:
```
2Sw##ty@2025!Adm1n$ecure
```

---

### 2. Database Credentials Güncelleme

#### Mevcut (VARSAYILAN - DEĞİŞTİR):
```php
// 2Sweety Admin/inc/Connection.php
$hostname = "localhost";
$username = "root";      // DEĞİŞTİR!
$password = "root";      // DEĞİŞTİR!
$database = "gomeet";
```

#### Güvenli Yapılandırma:
```php
// 2Sweety Admin/inc/Connection_secure.php
<?php
// Environment variables kullan
$hostname = $_ENV['DB_HOST'] ?? 'localhost';
$username = $_ENV['DB_USER'] ?? 'gomeet_user';
$password = $_ENV['DB_PASS'] ?? 'GenerateSecurePasswordHere';
$database = $_ENV['DB_NAME'] ?? 'gomeet';

// SSL bağlantı için (production)
$ssl_ca = $_ENV['DB_SSL_CA'] ?? null;

$con = new mysqli($hostname, $username, $password, $database);

if ($ssl_ca) {
    $con->ssl_set(null, null, $ssl_ca, null, null);
    $con->real_connect($hostname, $username, $password, $database, 3306, null, MYSQLI_CLIENT_SSL);
}

if ($con->connect_error) {
    error_log("Database connection failed: " . $con->connect_error);
    die("Service temporarily unavailable");
}

$con->set_charset("utf8mb4");
?>
```

---

### 3. Firebase Security Rules

#### Firestore Rules:
```javascript
// Firebase Console > Firestore > Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Kullanıcı sadece kendi verilerini okuyabilir/yazabilir
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat sadece katılımcılar tarafından erişilebilir
    match /chats/{chatId} {
      allow read, write: if request.auth != null &&
        request.auth.uid in resource.data.participants;
    }

    // Mesajlar sadece chat katılımcıları tarafından
    match /chats/{chatId}/messages/{messageId} {
      allow read, write: if request.auth != null &&
        exists(/databases/$(database)/documents/chats/$(chatId)) &&
        request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
    }
  }
}
```

#### Storage Rules:
```javascript
// Firebase Console > Storage > Rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Kullanıcı sadece kendi klasörüne yazabilir
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Profil resimleri herkes okuyabilir, sadece sahip yazabilir
    match /profiles/{userId}/{image} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId &&
        request.resource.size < 5 * 1024 * 1024 && // Max 5MB
        request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

### 4. API Security Headers

#### Apache .htaccess (2Sweety Admin):
```apache
# Security Headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "DENY"
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self' https://api.2sweety.com https://*.firebaseapp.com; img-src 'self' data: https:; script-src 'self' 'unsafe-inline' https://*.firebaseapp.com https://js.stripe.com; style-src 'self' 'unsafe-inline'"

# Disable directory browsing
Options -Indexes

# Protect sensitive files
<FilesMatch "\.(env|json|lock|md|log|ini|conf|config)$">
    Order Allow,Deny
    Deny from all
</FilesMatch>

# Rate limiting for API endpoints
<IfModule mod_ratelimit.c>
    SetOutputFilter RATE_LIMIT
    SetEnv rate-limit 100
    SetEnv rate-initial-burst 20
</IfModule>
```

---

### 5. Environment Variables Security

#### .env.production (ÖRNEK):
```bash
# Database - GÜÇLÜ ŞİFRE KULLAN
DB_HOST=localhost
DB_USER=gomeet_prod_user
DB_PASS=xK9#mP2$nL5@wQ8!
DB_NAME=gomeet_production

# Firebase - Production Keys
FIREBASE_PROJECT_ID=sweet-a6718
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@sweet-a6718.iam.gserviceaccount.com

# Payment Gateway Secrets - GERÇEK DEĞERLER İLE DEĞİŞTİR
RAZORPAY_KEY_SECRET=xxx_razorpay_secret_key_xxx
STRIPE_SECRET_KEY=sk_live_xxx_stripe_secret_xxx
PAYPAL_SECRET=xxx_paypal_client_secret_xxx

# JWT Secret - RASTGELE GÜÇLÜ DEĞER
JWT_SECRET=gX3#kL9@mN5$pQ2&wZ8!

# Encryption Key - 32 karakter
APP_ENCRYPTION_KEY=aB3$dE6&fG9@hJ2#kL5%mN8*pQ1!rS4^

# Admin Credentials - DEĞİŞTİR
ADMIN_EMAIL=admin@2sweety.com
ADMIN_INITIAL_PASSWORD=ChangeThisImmediately123!

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=xxx_your_account_sid_xxx
TWILIO_AUTH_TOKEN=xxx_your_auth_token_xxx
TWILIO_PHONE_NUMBER=+1234567890

# Email Service (SendGrid)
SENDGRID_API_KEY=xxx_your_sendgrid_key_xxx
SENDGRID_FROM_EMAIL=noreply@2sweety.com

# Error Tracking (Sentry)
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

---

### 6. SQL Injection Prevention

#### Güvenli Query Örneği:
```php
// KÖTÜ - SQL INJECTION RİSKİ
$uid = $_POST['uid'];
$sql = "SELECT * FROM user WHERE id = $uid";

// İYİ - Prepared Statements
$uid = $_POST['uid'];
$stmt = $con->prepare("SELECT * FROM user WHERE id = ?");
$stmt->bind_param("i", $uid);
$stmt->execute();
$result = $stmt->get_result();
```

---

### 7. Input Validation & Sanitization

#### PHP Validation Fonksiyonları:
```php
// 2Sweety Admin/inc/security.php
<?php
function validateInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

function validateEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL);
}

function validatePhone($phone) {
    return preg_match('/^[\d\+\-\(\)\s]+$/', $phone);
}

function validatePassword($password) {
    // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    return preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/', $password);
}

function generateSecureToken($length = 32) {
    return bin2hex(random_bytes($length));
}

function hashPassword($password) {
    return password_hash($password, PASSWORD_ARGON2ID);
}

function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}
?>
```

---

### 8. Session Security

#### PHP Session Configuration:
```php
// 2Sweety Admin/inc/session_config.php
<?php
// Secure session configuration
ini_set('session.use_only_cookies', 1);
ini_set('session.use_strict_mode', 1);
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1); // HTTPS only
ini_set('session.cookie_samesite', 'Strict');
ini_set('session.gc_maxlifetime', 1800); // 30 minutes
ini_set('session.use_trans_sid', 0);
ini_set('session.sid_length', 48);
ini_set('session.sid_bits_per_character', 6);

// Session başlat
session_start();

// Session hijacking prevention
if (!isset($_SESSION['user_agent'])) {
    $_SESSION['user_agent'] = $_SERVER['HTTP_USER_AGENT'];
} elseif ($_SESSION['user_agent'] !== $_SERVER['HTTP_USER_AGENT']) {
    session_destroy();
    die('Session security error');
}

// Session timeout
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 1800)) {
    session_destroy();
    header('Location: /login.php');
    exit();
}
$_SESSION['last_activity'] = time();
?>
```

---

### 9. File Upload Security

#### Güvenli Upload Fonksiyonu:
```php
// 2Sweety Admin/inc/secure_upload.php
<?php
function secureFileUpload($file, $uploadDir = 'uploads/') {
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 5 * 1024 * 1024; // 5MB

    // Check file size
    if ($file['size'] > $maxSize) {
        return ['error' => 'File too large'];
    }

    // Check MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        return ['error' => 'Invalid file type'];
    }

    // Generate secure filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('img_', true) . '.' . $extension;
    $uploadPath = $uploadDir . $filename;

    // Create directory if not exists
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Move file
    if (move_uploaded_file($file['tmp_name'], $uploadPath)) {
        return ['success' => true, 'filename' => $filename];
    }

    return ['error' => 'Upload failed'];
}
?>
```

---

### 10. CORS Configuration

#### Apache CORS Headers:
```apache
# 2Sweety Admin/.htaccess
<IfModule mod_headers.c>
    # CORS for 2sweety.com only
    SetEnvIf Origin "^https://2sweety\.com$" ORIGIN_ALLOWED=$0
    Header set Access-Control-Allow-Origin "%{ORIGIN_ALLOWED}e" env=ORIGIN_ALLOWED
    Header set Access-Control-Allow-Credentials "true"
    Header set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization, X-Requested-With"
    Header set Access-Control-Max-Age "3600"
</IfModule>
```

---

## 🔄 BACKUP & RECOVERY

### Otomatik Backup Script:
```bash
#!/bin/bash
# /home/backup/daily_backup.sh

# Configuration
BACKUP_DIR="/home/backup/2sweety"
DB_NAME="gomeet"
DB_USER="backup_user"
DB_PASS="backup_password"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mysqldump -u$DB_USER -p$DB_PASS $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Files backup
tar -czf $BACKUP_DIR/files_$DATE.tar.gz /var/www/2sweety/

# Upload to S3 (optional)
# aws s3 cp $BACKUP_DIR/db_$DATE.sql.gz s3://your-backup-bucket/
# aws s3 cp $BACKUP_DIR/files_$DATE.tar.gz s3://your-backup-bucket/

# Delete old backups (keep last 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Crontab Entry:
```bash
# Run daily at 3 AM
0 3 * * * /home/backup/daily_backup.sh >> /var/log/backup.log 2>&1
```

---

## 🚨 MONITORING & ALERTS

### Log Monitoring:
```bash
# Monitor failed login attempts
tail -f /var/log/apache2/error.log | grep "authentication failure"

# Monitor PHP errors
tail -f /var/log/php_errors.log

# Monitor webhook activity
tail -f /var/www/2sweety/admin/logs/webhooks.log
```

### Security Checklist:
- [ ] Admin şifresi değiştirildi
- [ ] Database credentials güncellendi
- [ ] Firebase Security Rules yapılandırıldı
- [ ] SSL sertifikası aktif
- [ ] Security headers eklenmiş
- [ ] Input validation implementasyonu
- [ ] SQL injection koruması
- [ ] XSS koruması
- [ ] CSRF token implementasyonu
- [ ] Rate limiting aktif
- [ ] Backup stratejisi uygulanmış
- [ ] Error logging aktif
- [ ] Monitoring kurulmuş

---

## 📞 ACİL DURUM PLANI

### Security Breach Durumunda:
1. Tüm admin şifrelerini değiştir
2. Database şifrelerini değiştir
3. API key'leri yenile
4. Session'ları temizle
5. Access log'ları incele
6. Firewall rules güncelle
7. Kullanıcıları bilgilendir

### Önemli Komutlar:
```bash
# Block an IP
iptables -A INPUT -s MALICIOUS_IP -j DROP

# Clear all sessions
rm -rf /var/lib/php/sessions/*

# Check for suspicious files
find /var/www -type f -name "*.php" -mtime -1

# Monitor real-time connections
netstat -antp | grep :80
```

---

**GÜVENLİK UYARISI**: Bu dokümandaki tüm örnek şifre ve key'ler sadece örnektir. Production ortamında mutlaka güçlü, benzersiz değerler kullanın!

**Son Güncelleme**: 2025-11-01
**Platform**: 2sweety.com & api.2sweety.com