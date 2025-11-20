# Vercel Deployment Rehberi

Bu proje Vercel'de deploy edilmek için hazırlanmıştır. Aşağıdaki adımları takip ederek projenizi başarıyla deploy edebilirsiniz.

## Gerekli Environment Variables

Vercel dashboard'unuzda aşağıdaki environment variables'ları tanımlamanız gerekmektedir:

### Zorunlu Değişkenler

1. **DATABASE_URL**
   - Açıklama: PostgreSQL veritabanı bağlantı URL'si
   - Örnek: `postgresql://username:password@hostname:port/database_name`
   - Nereden alınır: Database provider'ınızdan (Neon, Supabase, PlanetScale vb.)

2. **SUPABASE_URL**
   - Açıklama: Supabase proje URL'si
   - Örnek: `https://your-project-ref.supabase.co`
   - Nereden alınır: Supabase Dashboard > Settings > API

3. **SUPABASE_ANON_KEY**
   - Açıklama: Supabase anonymous (public) key
   - Nereden alınır: Supabase Dashboard > Settings > API

4. **SUPABASE_SERVICE_ROLE_KEY**
   - Açıklama: Supabase service role (private) key
   - Nereden alınır: Supabase Dashboard > Settings > API
   - ⚠️ **DİKKAT**: Bu key gizli tutulmalıdır!

5. **STRIPE_SECRET_KEY**
   - Açıklama: Stripe ödeme sistemi secret key
   - Örnek: `sk_test_...` (test) veya `sk_live_...` (production)
   - Nereden alınır: Stripe Dashboard > Developers > API keys

6. **GOOGLE_TRANSLATE_API_KEY**
   - Açıklama: Google Translate API anahtarı
   - Nereden alınır: Google Cloud Console > APIs & Services > Credentials

7. **SERVER_URL**
   - Açıklama: Deploy edilen uygulamanızın URL'si
   - Örnek: `https://your-app-name.vercel.app`
   - Not: İlk deploy'dan sonra güncellenmelidir

### İsteğe Bağlı Değişkenler

1. **NODE_ENV**
   - Değer: `production`

2. **VITE_ENABLE_LOGGING**
   - Değer: `false` (production için)

3. **VITE_LOG_LEVEL**
   - Değer: `ERROR`

4. **VITE_APPLE_PAY_MERCHANT_ID**
   - Değer: `merchant.com.2sweety.com`

5. **VITE_APPLE_PAY_DOMAIN**
   - Değer: `2sweety.com`

6. **VITE_GOOGLE_PAY_MERCHANT_ID**
   - Değer: Google Pay merchant ID'niz

## Deployment Adımları

### 1. Vercel Hesabı ve Proje Kurulumu
```bash
# Vercel CLI kurulumu
npm i -g vercel

# Vercel'e login
vercel login

# Proje klasöründe vercel init
vercel
```

### 2. Environment Variables Ayarlama
Vercel Dashboard'da:
1. Project Settings > Environment Variables
2. Yukarıdaki tüm değişkenleri ekleyin
3. Production, Preview ve Development ortamları için uygun değerleri seçin

### 3. Database Migration
```bash
# Migration dosyalarınızı çalıştırın
npm run db:push
```

### 4. Build ve Deploy
```bash
# Production build
npm run build

# Deploy
vercel --prod
```

## Proje Yapısı

Bu proje hybrid bir yapıya sahiptir:
- `/api/` - Vercel Serverless Functions
- `/client/` - Next.js frontend
- `/server/` - Express.js backend (serverless function olarak çalışır)

## Önemli Notlar

1. **vercel.json** dosyası routing ve build ayarlarını içerir
2. API routes `/api/*` prefix'i ile erişilir
3. Static dosyalar `/client/` klasöründen serve edilir
4. Serverless functions cold start süresine dikkat edin
5. Database connection pooling kullanın

## Troubleshooting

### Build Hatası
```bash
# Dependencies'leri temizle ve yeniden yükle
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Hatası
- Tüm required variables'ların tanımlı olduğundan emin olun
- Variable isimlerinde typo olmadığını kontrol edin
- Production/Preview/Development ortamları için doğru değerlerin seçildiğini kontrol edin

### Database Connection Hatası
- DATABASE_URL'nin doğru format'ta olduğundan emin olun
- Database server'ının external connections'a açık olduğunu kontrol edin
- Connection limits'e dikkat edin

## Domain Bağlama

1. Vercel Dashboard > Project > Settings > Domains
2. Custom domain ekleyin
3. DNS kayıtlarını güncelleyin
4. SSL sertifikası otomatik olarak oluşturulacak

## Monitoring ve Logs

- Vercel Dashboard > Functions tab'ından function logs'larını görüntüleyebilirsiniz
- Real-time logs için `vercel logs --follow` komutunu kullanın
- Error tracking için Sentry entegrasyonu önerilir

## Güvenlik

1. Tüm secret key'leri environment variables olarak saklayın
2. CORS ayarlarını production için konfigüre edin
3. Rate limiting ekleyin
4. HTTPS'yi zorunlu kılın 