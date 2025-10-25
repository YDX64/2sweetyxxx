# 🔧 Google OAuth Redirect Döngüsü Çözümü

## 🔴 SORUN
Google OAuth ile giriş yapınca `http://localhost:3000/#access_token=...` şeklinde bir döngüye giriyor.

## ✅ ÇÖZÜM

### 1. Supabase Dashboard OAuth Ayarları

1. [Supabase Dashboard](https://supabase.com/dashboard) açın
2. **Authentication** > **Providers** > **Google**
3. Şu ayarları yapın:

```
Site URL: http://localhost:5173
Redirect URLs: 
- http://localhost:5173
- http://localhost:5173/*
- https://2sweety.com
- https://2sweety.com/*
```

⚠️ **ÖNEMLİ**: Port 3000 değil, **5173** olmalı!

### 2. Google Cloud Console Ayarları

1. [Google Cloud Console](https://console.cloud.google.com) açın
2. Projenizi seçin
3. **APIs & Services** > **Credentials**
4. OAuth 2.0 Client ID'nizi düzenleyin
5. **Authorized redirect URIs** ekleyin:

```
https://kvrlzpdyeezmhjiiwfnp.supabase.co/auth/v1/callback
http://localhost:5173
http://localhost:5173/*
https://2sweety.com
https://2sweety.com/*
```

### 3. Production vs Development

Development için `.env`:
```bash
VITE_SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. AuthForm Güncelleme

Redirect URL'i dinamik yapmak için güncelleme gerekiyor.

## 🎯 HIZLI ÇÖZÜM

1. Supabase Dashboard'da Site URL'i `http://localhost:5173` yapın
2. Google Cloud Console'da redirect URI ekleyin
3. Browser'da cache temizleyin
4. Tekrar deneyin

## 📝 NOT

- Development: `localhost:5173`
- Production: `2sweety.com`
- Port 3000 kullanmayın!