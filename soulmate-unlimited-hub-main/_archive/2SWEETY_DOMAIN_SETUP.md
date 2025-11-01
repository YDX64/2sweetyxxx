# 🌐 2SWEETY.COM DOMAIN KURULUM REHBERİ

## 📋 MEVCUT DURUM
- ✅ Domain: 2sweety.com (Hostinger'da kayıtlı)
- ✅ VPS: 45.9.190.79 (Hostinger VPS)
- ✅ Coolify: Kurulu ve çalışıyor
- ❌ DNS: Yanlış IP'ye yönlendiriliyor (84.32.84.32)

## 🔧 DNS AYARLARI (HOSTİNGER)

### Adım 1: Hostinger DNS Yönetimi
1. Hostinger Panel > **Domains** > **2sweety.com**
2. **DNS Zone** > **Manage DNS records**

### Adım 2: Mevcut A Record'u Düzeltin
```bash
# SİLİN:
A    @    0    84.32.84.32    50

# EKLEYİN:
A    @    0    45.9.190.79    300
A    www  0    45.9.190.79    300
```

### Adım 3: CNAME Record'u Kontrol Edin
```bash
# MEVCUT (DOĞRU):
CNAME    www    0    2sweety.com    300
```

### Adım 4: CAA Records (DOĞRU - DEĞİŞTİRMEYİN)
```bash
✅ Let's Encrypt için CAA record'lar mevcut
✅ SSL sertifikası otomatik alınabilir
```

## 🚀 COOLIFY DOMAIN KURULUMU

### Adım 1: Ana Domain Ekle
1. Coolify Dashboard > Application > **Domains**
2. **+ Add Domain**
3. Ayarlar:
   ```bash
   Domain: 2sweety.com
   SSL: ✅ Enable (Let's Encrypt)
   Redirect: ❌ (Ana domain)
   ```
4. **Save**

### Adım 2: WWW Subdomain Ekle
1. **+ Add Domain** (tekrar)
2. Ayarlar:
   ```bash
   Domain: www.2sweety.com
   SSL: ✅ Enable
   Redirect: ✅ 2sweety.com
   ```
3. **Save**

## 📧 EMAIL KURULUM SEÇENEKLERİ

### 🥇 SEÇENEK 1: Hostinger Email (ÖNERİLEN)

#### Avantajları:
- 💰 Ucuz ($1-3/ay)
- 🔗 Domain ile entegre
- 📱 Webmail + IMAP/POP3
- 🛡️ Spam koruması

#### Kurulum:
1. Hostinger Panel > **Email**
2. **Email Hosting** > **2sweety.com**
3. **Create Email Account**:
   ```bash
   admin@2sweety.com
   support@2sweety.com
   noreply@2sweety.com
   info@2sweety.com
   ```

#### DNS Ayarları (Otomatik):
```bash
MX    @    0    mx1.hostinger.com    10
MX    @    0    mx2.hostinger.com    20
TXT   @    0    "v=spf1 include:_spf.hostinger.com ~all"
```

### 🥈 SEÇENEK 2: Gmail Workspace

#### Avantajları:
- 📧 Profesyonel Gmail
- ☁️ Google Drive (30GB)
- 📅 Google Calendar
- 🛡️ Güçlü güvenlik

#### Maliyet:
- 💰 $6/ay/kullanıcı
- 📊 Business: $12/ay/kullanıcı

#### DNS Ayarları:
```bash
MX    @    0    aspmx.l.google.com         1
MX    @    0    alt1.aspmx.l.google.com    5
MX    @    0    alt2.aspmx.l.google.com    5
TXT   @    0    "v=spf1 include:_spf.google.com ~all"
```

### 🥉 SEÇENEK 3: Zoho Mail (ÜCRETSİZ)

#### Avantajları:
- 🆓 5 kullanıcıya kadar ücretsiz
- 📧 5GB/kullanıcı
- 📱 Mobile app
- 🔗 Domain entegrasyonu

#### DNS Ayarları:
```bash
MX    @    0    mx.zoho.com           10
MX    @    0    mx2.zoho.com          20
TXT   @    0    "v=spf1 include:zoho.com ~all"
```

## 🔍 KURULUM DOĞRULAMA

### DNS Propagation Kontrol
```bash
# Online araçlar:
https://dnschecker.org/
https://whatsmydns.net/

# Terminal'de:
nslookup 2sweety.com
dig 2sweety.com A
```

### SSL Sertifikası Kontrol
```bash
# Online araç:
https://www.ssllabs.com/ssltest/

# Beklenen sonuç:
https://2sweety.com ✅
https://www.2sweety.com ✅
```

### Email Kontrol
```bash
# MX record kontrol:
nslookup -type=MX 2sweety.com

# Email test:
admin@2sweety.com'a test email gönder
```

## ⏱️ PROPAGATION SÜRELERİ

```bash
DNS Değişiklikleri: 1-24 saat
SSL Sertifikası: 5-10 dakika
Email Kurulumu: 1-2 saat
```

## 🚨 TROUBLESHOOTING

### Domain Erişilemiyor
1. DNS propagation bekleyin (24 saat)
2. A record'ları kontrol edin
3. Coolify logs kontrol edin

### SSL Hatası
1. Let's Encrypt rate limit kontrol
2. CAA records kontrol edin
3. Domain validation bekleyin

### Email Çalışmıyor
1. MX records doğru mu kontrol
2. SPF record eklenmiş mi
3. Email provider ayarları kontrol

## 📞 DESTEK

### Hostinger Destek
- 💬 Live Chat: 7/24
- 📧 Ticket System
- 📚 Knowledge Base

### Coolify Destek
- 📖 Documentation
- 💬 Discord Community
- 🐛 GitHub Issues 