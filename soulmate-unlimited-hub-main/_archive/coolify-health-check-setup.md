# 🏥 COOLIFY HEALTH CHECK KURULUM REHBERİ

## 🎯 HEALTH CHECK ENDPOINT

Uygulamanızda zaten health check endpoint'i mevcut:
```
GET /api/health
Response: {"status":"ok","timestamp":"2025-01-13T..."}
```

## 🔧 COOLIFY DASHBOARD AYARLARI

### Adım 1: Application Settings
1. Coolify Dashboard'a gidin: http://45.9.190.79:8000
2. **Projects** > **Your Project** > **Application**
3. **Health Check** veya **Advanced** tab'ına tıklayın

### Adım 2: Health Check Configuration
```bash
✅ Enable Health Check: ON
✅ Health Check URL: /api/health
✅ Health Check Port: 5000
✅ Health Check Method: GET
✅ Health Check Interval: 30 seconds
✅ Health Check Timeout: 10 seconds
✅ Health Check Retries: 3
✅ Health Check Start Period: 60 seconds
✅ Health Check Headers: (boş bırakın)
```

### Adım 3: Save Settings
**Save** butonuna tıklayın ve deployment'ı bekleyin.

## 🚀 DOCKERFILE HEALTH CHECK (ZATEN MEVCUT)

Dockerfile'ınızda zaten health check tanımlı:
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1
```

## 📊 HEALTH CHECK MONITORING

### Coolify Dashboard'da Kontrol
- **Application Status**: Healthy/Unhealthy
- **Health Check Logs**: Son kontrol sonuçları
- **Uptime**: Çalışma süresi
- **Response Time**: Yanıt süresi

### Manuel Test
```bash
# SSH ile sunucuya bağlanın
ssh root@45.9.190.79

# Health check test
curl -f http://localhost:5000/api/health

# Beklenen yanıt:
# {"status":"ok","timestamp":"2025-01-13T..."}
```

## 🔍 TROUBLESHOOTING

### Health Check Başarısız Oluyorsa

1. **Application Logs Kontrol**
   - Coolify Dashboard > Logs
   - Uygulama çalışıyor mu?

2. **Port Kontrolü**
   ```bash
   # SSH'da port kontrolü
   netstat -tlnp | grep 5000
   ```

3. **Health Endpoint Test**
   ```bash
   # Container içinde test
   docker exec -it CONTAINER_NAME curl http://localhost:5000/api/health
   ```

4. **Firewall Kontrolü**
   ```bash
   # Port 5000 açık mı?
   ufw status
   ```

## ✅ BAŞARILI KURULUM SONRASI

Health check başarılı olduktan sonra:
- ✅ **Unhealthy state** uyarısı kaybolacak
- ✅ **Application status**: Healthy
- ✅ **Automatic restart** (health check fail olursa)
- ✅ **Monitoring** aktif olacak

## 🎯 SONUÇ

Health check kurulduktan sonra:
1. **Coolify** uygulamanızın sağlığını sürekli izleyecek
2. **Otomatik restart** (gerekirse)
3. **Status monitoring** aktif olacak
4. **"Unhealthy state"** uyarısı kaybolacak 