# 🚀 Coolify'da Server Çalıştırma ve Discovery Sorunu Çözüm Rehberi

## 🔴 ANA SORUN: Server API'ları Çalışmıyor!

Şu an frontend çalışıyor ama backend API'lar çalışmıyor. Bu yüzden:
- Discovery'de profiller görünmüyor
- Swipe işlemleri çalışmıyor
- Match'ler görünmüyor

## 🛠️ ÇÖZÜM ADıMLARı

### 1. Dockerfile.coolify Güncellenmeli

Mevcut Dockerfile sadece frontend build ediyor. Backend için güncelleme gerekli:

```dockerfile
FROM node:20-alpine

# Install dependencies for build
RUN apk add --no-cache git curl python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY postcss.config.js ./
COPY tailwind.config.ts ./
COPY components.json ./
COPY drizzle.config.ts ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Create necessary directories
RUN mkdir -p uploads/photos uploads/compressed

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:5000/api/health || exit 1

# Start the production server
CMD ["npm", "start"]
```

### 2. Build Script Kontrol

`package.json` dosyasında build script'i kontrol edin:

```json
{
  "scripts": {
    "dev": "NODE_ENV=development tsx server/index.ts",
    "build": "vite build && esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist",
    "start": "NODE_ENV=production node dist/index.js"
  }
}
```

### 3. Coolify Environment Variables

Coolify'da şu environment variable'ları eklediğinizden emin olun:

```bash
# Server Port
PORT=5000

# Database
DATABASE_URL=postgresql://postgres:eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw@db.kvrlzpdyeezmhjiiwfnp.supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://kvrlzpdyeezmhjiiwfnp.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg1MjE0OTIsImV4cCI6MjA2NDA5NzQ5Mn0.m95kISdHR3GO9kWS3TzIHGSsH86kcgeQvJ1QQ7rJ6GU
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt2cmx6cGR5ZWV6bWhqaWl3Zm5wIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODUyMTQ5MiwiZXhwIjoyMDY0MDk3NDkyfQ.HGLZjlTNLPGzgHnI7gtWSCNuqafrINEzWnKfDjFl0Bw

# Production
NODE_ENV=production
SERVER_URL=https://2sweety.com

# Vercel bypass (önemli!)
VERCEL=false
```

### 4. Discovery Sorunu İçin Database Kontrol

Discovery çalışmıyor çünkü server API'ları yanıt vermiyor. Debug için:

1. **Browser DevTools Network sekmesini açın**
2. **Discovery sayfasına gidin**
3. **Failed request'leri kontrol edin**

Muhtemelen şu hatayı göreceksiniz:
- `/api/discovery/profiles` → 404 veya 502

### 5. Geçici Çözüm: Direct Supabase Queries

Server çalışana kadar frontend'de direct Supabase kullanabilirsiniz:

```typescript
// client/src/hooks/useProfiles.tsx içinde güncelleme:
const fetchProfiles = async () => {
  try {
    // Direct Supabase query
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!userProfile) return [];

    // Get already swiped users
    const { data: swipes } = await supabase
      .from('swipes')
      .select('target_user_id')
      .eq('user_id', user.id);

    const swipedIds = swipes?.map(s => s.target_user_id) || [];

    // Get profiles
    let query = supabase
      .from('profiles')
      .select('*')
      .neq('id', user.id)
      .not('id', 'in', `(${swipedIds.join(',')})`)
      .not('name', 'is', null)
      .not('age', 'is', null)
      .limit(20);

    // Apply filters
    if (userProfile.interested_in && userProfile.interested_in !== 'both') {
      const gender = userProfile.interested_in === 'men' ? 'male' : 'female';
      query = query.eq('gender', gender);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching profiles:', error);
    return [];
  }
};
```

### 6. RPC Functions Oluşturma

Supabase Dashboard'da şu RPC fonksiyonlarını oluşturun:

```sql
-- Get discovery profiles
CREATE OR REPLACE FUNCTION get_discovery_profiles(
  current_user_id UUID,
  user_interested_in TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  age INTEGER,
  bio TEXT,
  photos TEXT[],
  gender TEXT,
  location TEXT,
  interests TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.age,
    p.bio,
    p.photos,
    p.gender,
    p.location,
    p.interests
  FROM profiles p
  WHERE p.id != current_user_id
    AND p.name IS NOT NULL
    AND p.age IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM swipes s 
      WHERE s.user_id = current_user_id 
      AND s.target_user_id = p.id
    )
    AND NOT EXISTS (
      SELECT 1 FROM matches m 
      WHERE (m.user1_id = current_user_id AND m.user2_id = p.id)
         OR (m.user2_id = current_user_id AND m.user1_id = p.id)
    )
    AND (
      user_interested_in IS NULL 
      OR user_interested_in = 'both'
      OR (user_interested_in = 'men' AND p.gender = 'male')
      OR (user_interested_in = 'women' AND p.gender = 'female')
    )
  ORDER BY RANDOM()
  LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## 🔧 ACİL DÜZELTMELER

### 1. Dockerfile Güncellemesi
```bash
# Local'de test edin
docker build -f Dockerfile.coolify -t 2sweety-test .
docker run -p 5000:5000 --env-file .env 2sweety-test
```

### 2. Health Check
```bash
# API health check
curl http://localhost:5000/api/health

# Expected response:
{"status":"ok","timestamp":"2024-01-25T..."}
```

### 3. Coolify Logs
Coolify dashboard'da:
- Application > Logs
- Build logs ve runtime logs kontrol edin
- Error mesajlarını paylaşın

## 📋 KONTROL LİSTESİ

- [ ] Dockerfile.coolify güncellenecek
- [ ] Environment variables eklenecek
- [ ] Build script kontrol edilecek
- [ ] Deploy sonrası `/api/health` test edilecek
- [ ] Discovery endpoint'i test edilecek
- [ ] RPC fonksiyonları oluşturulacak

## 🚨 HIZLI TEST

Deploy sonrası bu URL'leri test edin:
1. https://2sweety.com/api/health
2. https://2sweety.com/api/discovery/profiles (auth gerekli)

Eğer 404 alıyorsanız, server çalışmıyor demektir!

## 💡 ÖNEMLİ NOT

Server API'ları çalışmadan:
- Discovery çalışmaz
- Swipe işlemleri çalışmaz
- Match'ler görünmez
- Chat çalışmaz

Öncelik server'ı ayağa kaldırmak!