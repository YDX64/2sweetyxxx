# 🔧 Sorun ve Çözüm Rehberi

## 🎯 Tespit Edilen Ana Sorunlar

### 1. 🔐 Authentication Sorunları

#### Sorun: Google/Apple/Facebook Login Çalışmıyor
- **Sebep**: Supabase Dashboard'da OAuth provider'ları aktif edilmemiş
- **Çözüm**:
  1. [Supabase Dashboard](https://supabase.com/dashboard) açın
  2. Projenizi seçin
  3. Authentication > Providers bölümüne gidin
  4. Her provider için:
     - Google: Enable Google → Client ID ve Secret girin
     - Apple: Enable Apple → Service ID, Team ID, Key ID girin
     - Facebook: Enable Facebook → App ID ve Secret girin
  5. Redirect URL'leri ayarlayın:
     - Development: `http://localhost:5173/`
     - Production: `https://yourdomain.com/`

#### Sorun: Authentication kodları eklendi ama hala çalışmıyor
- **Sebep**: Provider ayarları eksik
- **Çözüm**: Yukarıdaki adımları takip edin

### 2. 💻 Server Çalıştırma

#### Sorun: "Server nedir, nasıl çalıştırılır?"
- **Açıklama**: Express.js backend sunucusu, API endpoint'leri sağlar
- **Çalıştırma**:
  ```bash
  # Önce .env dosyasını oluşturun
  cp env.example .env
  
  # Bağımlılıkları yükleyin
  npm install
  
  # Development modda çalıştırın
  npm run dev
  ```
  Bu komut hem frontend (http://localhost:5173) hem de backend (http://localhost:5000) başlatır.

### 3. 🔑 Environment Variables

#### Sorun: ".env dosyası eksik"
- **Çözüm**:
  1. `env.example` dosyasını `.env` olarak kopyalayın
  2. Supabase Dashboard > Settings > API'dan:
     - `SUPABASE_SERVICE_ROLE_KEY` alın ve .env'ye ekleyin
  3. Stripe kullanacaksanız:
     - `STRIPE_SECRET_KEY` ekleyin

### 4. 📊 Üyelik Planları Eşleşme Sorunu

#### Sorun: "Kullanıcı rolü ve subscription tier uyumsuz"
- **Sebep**: İki farklı sistem var:
  - `profiles.role`: Kullanıcının sistem rolü
  - `subscribers` tablosu: Ödeme/subscription bilgisi
  
- **Çözüm**: `/api/check-subscription` endpoint'i her iki kaynağı kontrol ediyor:
  1. Önce `subscribers` tablosuna bakar
  2. Yoksa `profiles.role` değerini kullanır
  3. Admin rolü her zaman premium kabul edilir

### 5. 🗄️ Database Migrations

#### Sorun: "RPC fonksiyonları bulunamıyor"
- **Çözüm**: Migration'ları çalıştırın:
  ```bash
  npm run db:push
  ```

## 📋 Hızlı Kontrol Listesi

### ✅ Başlamadan Önce:
- [ ] Node.js 20+ yüklü mü?
- [ ] `.env` dosyası oluşturuldu mu?
- [ ] `SUPABASE_SERVICE_ROLE_KEY` doğru mu?
- [ ] `npm install` çalıştırıldı mı?

### ✅ OAuth Setup:
- [ ] Google OAuth aktif mi?
- [ ] Apple OAuth aktif mi? 
- [ ] Facebook OAuth aktif mi?
- [ ] Redirect URL'ler doğru mu?

### ✅ Development:
- [ ] `npm run dev` çalışıyor mu?
- [ ] Frontend: http://localhost:5173 açılıyor mu?
- [ ] Backend: http://localhost:5000/api/health yanıt veriyor mu?

## 🚀 Önerilen Başlangıç Adımları

1. **İlk kurulum:**
   ```bash
   cp env.example .env
   npm install
   ```

2. **Supabase OAuth aktifleştirme:**
   - Dashboard'a gidin
   - Authentication > Providers
   - İstediğiniz provider'ları aktifleştirin

3. **Development başlatma:**
   ```bash
   npm run dev
   ```

4. **Test etme:**
   - http://localhost:5173 açın
   - Email/password ile kayıt olun
   - OAuth butonlarını test edin

## 🆘 Yardım

Sorun devam ederse:
1. Browser console'da hata mesajlarını kontrol edin
2. Network sekmesinde failed request'leri inceleyin
3. Server terminal'de error log'ları kontrol edin

## 🔐 Güvenlik Notları

- `SUPABASE_SERVICE_ROLE_KEY` asla client tarafında kullanmayın
- Production'da HTTPS kullanın
- OAuth redirect URL'lerini production domain'e güncelleyin