# 🌐 DOMAIN YÖNETİMİ REHBERİ

## 📋 DOMAIN LİSTESİ (10 Domain)

Aşağıdaki domainlerinizi tek bir uygulamaya yönlendirebilirsiniz:

```bash
# Ana domain
1. yourmain-domain.com

# Alternatif domainler
2. 2sweety-app.com
3. dating-app.net
4. love-connection.org
5. match-maker.io
6. heart-connect.app
7. romance-hub.co
8. couple-finder.net
9. love-match.org
10. dating-platform.com
```

## 🚀 COOLIFY'DA DOMAIN EKLEME

### Adım 1: Application Settings
1. **Coolify Dashboard** > **Your Project** > **Application**
2. **Domains** tab'ına git
3. **+ Add Domain** tıkla

### Adım 2: Her Domain İçin Tekrarla
```bash
# Domain 1
Domain: yourmain-domain.com
SSL: ✅ Enable (Let's Encrypt)
Redirect: ❌ (Ana domain)

# Domain 2-10 (Redirect to main)
Domain: 2sweety-app.com
SSL: ✅ Enable
Redirect: ✅ yourmain-domain.com
```

## 🔧 DNS AYARLARI

Her domain için DNS provider'ınızda:

### A Records
```bash
Type: A
Name: @
Value: 45.9.190.79
TTL: 300

Type: A  
Name: www
Value: 45.9.190.79
TTL: 300
```

### CNAME Records (Alternatif)
```bash
Type: CNAME
Name: www
Value: yourmain-domain.com
TTL: 300
```

## 🛡️ SSL CERTIFICATE

Coolify otomatik olarak her domain için Let's Encrypt SSL sertifikası oluşturacak:

```bash
✅ yourmain-domain.com - SSL Active
✅ www.yourmain-domain.com - SSL Active
✅ 2sweety-app.com - SSL Active
✅ www.2sweety-app.com - SSL Active
... (tüm domainler için)
```

## 🔄 DOMAIN REDIRECT STRATEGY

### Ana Domain (Primary)
- `yourmain-domain.com` - Ana site
- `www.yourmain-domain.com` - Ana siteye redirect

### Alternatif Domainler (Secondary)
Tüm alternatif domainler ana domaine redirect:
```bash
2sweety-app.com → yourmain-domain.com
dating-app.net → yourmain-domain.com
love-connection.org → yourmain-domain.com
... (diğerleri)
```

## 📊 DOMAIN MONITORING

### Coolify Dashboard'da Kontrol
- **Domains** tab'ında tüm domainlerin durumu
- **SSL Status** - Aktif/Pasif
- **Redirect Status** - Çalışıyor/Hata

### External Monitoring Tools
```bash
# SSL Check
https://www.ssllabs.com/ssltest/

# DNS Propagation
https://dnschecker.org/

# Domain Health
https://tools.pingdom.com/
```

## 🚨 TROUBLESHOOTING

### Domain Çalışmıyor
1. **DNS Propagation** bekleyin (24-48 saat)
2. **A Record** doğru IP'yi gösteriyor mu kontrol edin
3. **Coolify Logs** kontrol edin

### SSL Hatası
1. **Let's Encrypt Rate Limit** kontrol edin
2. **Domain validation** başarılı mı kontrol edin
3. **Firewall** 80/443 portları açık mı

### Redirect Çalışmıyor
1. **Redirect settings** Coolify'da doğru mu
2. **Cache** temizleyin (browser/CDN)
3. **DNS CNAME** vs **A Record** karışıklığı

## 🎯 BEST PRACTICES

### SEO İçin
- **Canonical URLs** kullanın
- **301 Redirects** (kalıcı yönlendirme)
- **HSTS Headers** aktif edin

### Performance İçin
- **CDN** kullanın (Cloudflare)
- **Gzip Compression** aktif
- **Browser Caching** ayarlayın

### Security İçin
- **HTTPS Only** (HTTP'yi HTTPS'e redirect)
- **Security Headers** ekleyin
- **Rate Limiting** aktif edin 