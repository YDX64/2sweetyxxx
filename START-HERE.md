# 🚀 2Sweety - START HERE!

## ✅ Kurulum Tamamlandı!

Backend (Admin Panel) ve Frontend (React) lokal geliştirme için hazır.

---

## 📊 Mevcut Durum

✅ **MAMP Yüklü** - PHP + MySQL çalışıyor  
✅ **Database Oluşturuldu** - `dating_db` (29 tablo)  
✅ **Backend Yapılandırıldı** - Admin panel hazır  
✅ **Frontend Yapılandırıldı** - React `.env.local` hazır  

---

## 🎯 Hızlı Başlangıç

### 1. Admin Panel'i Aç

```bash
open http://localhost:8888/
```

**Login:**
- Username: `admin`
- Password: `admin@123`

⚠️ Eğer **404 hatası** alırsan:
1. MAMP'ı aç
2. `Preferences` → `Web Server`
3. Document Root: `/Users/max/Downloads/2sweet/2Sweety Admin`
4. `OK` → `Restart Servers`

---

### 2. React App'i Başlat

```bash
cd "/Users/max/Downloads/2sweet/GoMeet Web"
npm install  # İlk seferde
npm start
```

React: http://localhost:3000  
API: http://localhost:8888/api/

---

## 🔗 Bağlantı Testi

1. **Admin Panel** → http://localhost:8888/ → Login yap ✅
2. **React App** → `npm start` → http://localhost:3000 açılır ✅
3. **API Test** → React'ten sign up/login dene → Backend'e istek gitmeli ✅

---

## 🗄️ Database Bilgileri

```
Host:     localhost
Port:     8889
User:     root
Password: root
Database: dating_db
Tables:   29
```

**phpMyAdmin:** http://localhost:8888/phpMyAdmin/

---

## 📁 Proje Yapısı

```
/Users/max/Downloads/2sweet/
├── 2Sweety Admin/          # Backend (PHP/MySQL)
│   ├── api/                # API endpoints
│   ├── inc/                # Core files
│   ├── database/           # Schema
│   └── .env                # DB config
│
└── GoMeet Web/             # Frontend (React)
    ├── src/                # Source code
    ├── public/             # Static files
    └── .env.local          # API config
```

---

## 🐛 Sorun Giderme

### ERR_CONNECTION_REFUSED
```bash
# MAMP çalışıyor mu?
lsof -i :8888  # Apache
lsof -i :8889  # MySQL

# Yoksa başlat
open -a MAMP
# "Start Servers" tıkla
```

### Database Bağlanmıyor
```bash
# Manuel test
/Applications/MAMP/Library/bin/mysql80/bin/mysql \
  -h127.0.0.1 -P8889 -uroot -proot dating_db \
  -e "SHOW TABLES;"
```

### React API Hatası
```bash
# .env.local'i kontrol et
cat "/Users/max/Downloads/2sweet/GoMeet Web/.env.local"

# Şunları görmeli:
# REACT_APP_API_BASE_URL=http://localhost:8888/api/
```

### Admin Panel 404
MAMP'ta document root'u kontrol et → Yukarıdaki adımları takip et

---

## 💡 Faydalı Komutlar

```bash
# MAMP başlat
open -a MAMP

# Database kontrol
/Applications/MAMP/Library/bin/mysql80/bin/mysql \
  -h127.0.0.1 -P8889 -uroot -proot dating_db

# Admin panel logları
tail -f /Applications/MAMP/logs/php_error.log

# React başlat
cd "/Users/max/Downloads/2sweet/GoMeet Web"
npm start

# Admin şifresi sıfırla (admin@123)
/Applications/MAMP/Library/bin/mysql80/bin/mysql \
  -h127.0.0.1 -P8889 -uroot -proot dating_db \
  -e "UPDATE admin SET password='0192023a7bbd73250516f069df18b500' WHERE id=1;"
```

---

## 🚀 Development Workflow

### Tipik bir geliştirme günü:

1. **MAMP'ı başlat**
   ```bash
   open -a MAMP
   # Start Servers tıkla
   ```

2. **Backend'i test et**
   ```bash
   open http://localhost:8888/
   ```

3. **Frontend'i başlat**
   ```bash
   cd "/Users/max/Downloads/2sweet/GoMeet Web"
   npm start
   ```

4. **Geliştir!** 🎨
   - Backend: PHP dosyalarını düzenle → Yenile
   - Frontend: JS/React dosyalarını düzenle → Auto reload

5. **Test et**
   - React: http://localhost:3000
   - API: http://localhost:8888/api/
   - Database: http://localhost:8888/phpMyAdmin/

---

## 📦 Production'a Upload Öncesi

```bash
# 1. Frontend build
cd "/Users/max/Downloads/2sweet/GoMeet Web"
npm run build

# 2. Database export
/Applications/MAMP/Library/bin/mysql80/bin/mysqldump \
  -h127.0.0.1 -P8889 -uroot -proot dating_db \
  > ~/Desktop/dating_db_$(date +%Y%m%d).sql

# 3. Backend zip
cd /Users/max/Downloads/2sweet
zip -r backend.zip "2Sweety Admin" -x "*.git*" "*/node_modules/*"

# 4. Frontend zip (build klasörü)
cd "/Users/max/Downloads/2sweet/GoMeet Web"
zip -r ~/Desktop/frontend_build.zip build/
```

---

## 📚 Dokümantasyon

- **`SETUP-NOW.md`** → Adım adım kurulum
- **`README-LOCAL.md`** → Detaylı lokal setup
- **`README-DEPLOYMENT.md`** → Production deployment
- **`.env.example`** → Tüm environment variables

---

## ✅ Checklist

- [ ] MAMP çalışıyor (yeşil ışıklar)
- [ ] http://localhost:8888/ açılıyor
- [ ] Admin login başarılı (admin/admin@123)
- [ ] phpMyAdmin'de 29 tablo görünüyor
- [ ] React `npm start` çalışıyor
- [ ] http://localhost:3000/ açılıyor
- [ ] React'ten API isteği atılıyor

---

## 🎉 Hazırsın!

Her şey kuruldu ve çalışıyor. Artık geliştirmeye başlayabilirsin!

**İlk adım:**
1. http://localhost:8888/ → Admin login
2. `npm start` → React başlat
3. Her iki tarafı test et
4. Keyifle kod yaz! 🚀

---

**Son Update:** 2025-10-28  
**Platform:** MacOS (Apple Silicon)  
**Tech Stack:** PHP 8.0 + MySQL 8.0 + React 18.2
