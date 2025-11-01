# 🔧 Coolify Bad Gateway Hatası Çözümü

## ✅ YAPILAN DÜZELTMELER

### 1. Dockerfile Basitleştirildi
- Health check kaldırıldı (bazen sorun çıkarıyor)
- nginx.conf ayrı dosyaya taşındı
- İzinler düzeltildi

### 2. Nginx Configuration Ayrıldı
- `nginx.conf` dosyası oluşturuldu
- Daha temiz ve okunabilir
- API proxy api.2sweety.com'a yönlendiriliyor

---

## 🚀 Coolify'da YAPMANIZ GEREKENLER

### 1. Environment Variables KONTROL EDİN
Coolify Dashboard > Environment Variables > Build Arguments:

```bash
# ZORUNLU - Firebase Configuration
REACT_APP_FIREBASE_API_KEY=AIzaSyDCZoLgY9bFxRcNFuV6IljwMVnnx0TL2to
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=487435792097
REACT_APP_FIREBASE_APP_ID=1:487435792097:web:12907427892d53c82251a0

# Build Optimizations
CI=false
GENERATE_SOURCEMAP=false
```

### 2. Port Ayarlarını KONTROL EDİN
- **Application Port**: `80` (3000 DEĞİL!)
- **Exposed Port**: `80`

### 3. Build Pack
- **Dockerfile** seçili olmalı (Nixpack DEĞİL)

### 4. Logs'ları Kontrol Edin

#### Build Logs'da Bakılacaklar:
```
✅ "npm ci" başarılı mı?
✅ "npm run build" başarılı mı?
✅ "COPY --from=builder /app/build" başarılı mı?
✅ nginx başlatıldı mı?
```

#### Application Logs'da Bakılacaklar:
```
nginx hatası var mı?
Permission denied var mı?
Port 80 dinleniyor mu?
```

---

## 🔍 HALA BAD GATEWAY ALIYORSANIZ

### Adım 1: Container'ı Kontrol Edin
Coolify'da:
1. Application > Logs > Show Debug Logs
2. Container running durumda mı?
3. Health check passing mi?

### Adım 2: Port Mapping Kontrolü
```
Application Port: 80
Exposed Port: 80
```
**ÖNEMLİ**: 3000 olmamalı!

### Adım 3: Force Rebuild
1. Application > Danger Zone > "Force Rebuild" tıklayın
2. Cache'i temizler ve sıfırdan build eder

### Adım 4: Container Shell'e Girin
Coolify'da Terminal açın ve kontrol edin:
```bash
# Dosyalar var mı?
ls -la /usr/share/nginx/html/

# index.html var mı?
cat /usr/share/nginx/html/index.html

# nginx çalışıyor mu?
ps aux | grep nginx

# Port dinleniyor mu?
netstat -tulpn | grep 80
```

---

## 🆘 ALTERNATIF ÇÖZÜMLER

### Çözüm 1: Health Check'i Geri Ekle
Eğer Coolify health check istiyor ise Dockerfile'a ekleyin:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
```

### Çözüm 2: Custom Start Command
Coolify'da Start Command override:
```bash
nginx -g 'daemon off;'
```

### Çözüm 3: Environment Mode
Coolify'da bir environment variable ekleyin:
```
NODE_ENV=production
```

---

## ✅ SON KONTROL LİSTESİ

- [ ] GitHub repository public mi?
- [ ] Son commit pull edildi mi?
- [ ] Port 80 ayarlandı mı?
- [ ] Build başarılı mı?
- [ ] nginx.conf dosyası var mı?
- [ ] Container running durumda mı?

---

## 📝 Debug İçin Kullanışlı Komutlar

Coolify Terminal'de:
```bash
# nginx config test
nginx -t

# nginx reload
nginx -s reload

# Container logs
docker logs <container_id>

# File permissions
ls -la /usr/share/nginx/html/

# Test localhost
curl http://localhost/
```

---

## 🎯 ÖZET

1. **Dockerfile basitleştirildi**
2. **nginx.conf ayrı dosya oldu**
3. **Port 80 olmalı**
4. **Force Rebuild deneyin**
5. **Container logs kontrol edin**

**GitHub'a yeni değişiklikler push edildi. Coolify'da REDEPLOY tıklayın!**