# 🔧 MCP (Model Context Protocol) Kullanım Kuralları

## 📋 ZORUNLU MCP KULLANIMI

Bu projede çalışırken aşağıdaki MCP'leri **MUTLAKA** kullanmalısın:

### 1. 📚 Context7 MCP - Güncel Dokümantasyon
**Ne zaman kullanılmalı:**
- Yeni bir teknoloji/framework hakkında bilgi gerektiğinde
- Best practice'ler için
- Güncel API dokümantasyonu için

**Kullanım:**
```typescript
// ❌ YANLIŞ - Eski bilgi kullanma
const oldPattern = "eski kod örneği"

// ✅ DOĞRU - Önce Context7'den güncel bilgi al
mcp__context7__resolve-library-id("react")
mcp__context7__get-library-docs("/facebook/react")
```

### 2. 🗄️ Supabase MCP - Database İşlemleri
**Ne zaman kullanılmalı:**
- Tablo yapısı kontrolü
- Migration oluşturma
- SQL sorguları
- Edge function deployment
- Database dokümantasyonu

**Kullanım:**
```typescript
// ❌ YANLIŞ - Manuel SQL yazma
const query = "CREATE TABLE ..."

// ✅ DOĞRU - Supabase MCP kullan
mcp__supabase__list_tables()
mcp__supabase__apply_migration()
mcp__supabase__search_docs()
```

### 3. 🌐 Puppeteer MCP - Web Test/Debug
**Ne zaman kullanılmalı:**
- Deployment sonrası test
- UI element kontrolü
- Screenshot alma

### 4. 📁 FileSystem MCP - Dosya İşlemleri
**Ne zaman kullanılmalı:**
- Çoklu dosya okuma/yazma
- Directory tree görüntüleme
- Dosya arama

## 🚫 YAPMAMALISIN

1. **Eski kod pattern'leri kullanma**
   - Önce Context7'den güncel örnek al
   
2. **Manuel SQL yazma**
   - Supabase MCP kullan
   
3. **Hardcoded değerler**
   - Environment variable veya config kullan

4. **Tek tek dosya okuma**
   - FileSystem MCP ile toplu oku

## ✅ HER ZAMAN YAP

### Yeni Feature Eklerken:
1. `mcp__context7__resolve-library-id` ile güncel docs bul
2. `mcp__context7__get-library-docs` ile best practice öğren
3. `mcp__supabase__list_tables` ile mevcut yapıyı kontrol et
4. `mcp__supabase__search_docs` ile Supabase özelliklerini araştır

### Database İşlemlerinde:
1. `mcp__supabase__list_tables` - Mevcut tabloları gör
2. `mcp__supabase__apply_migration` - Migration uygula
3. `mcp__supabase__execute_sql` - Query çalıştır
4. `mcp__supabase__get_advisors` - Güvenlik kontrolü

### Deployment Sonrası:
1. `mcp__puppeteer__puppeteer_navigate` - Siteyi aç
2. `mcp__puppeteer__puppeteer_screenshot` - Screenshot al
3. `mcp__supabase__get_logs` - Log kontrolü

## 📝 ÖRNEK WORKFLOW

### Yeni Authentication Feature:
```bash
1. Context7'den güncel auth pattern'leri al:
   - mcp__context7__resolve-library-id("supabase auth")
   - mcp__context7__get-library-docs("/supabase/supabase")

2. Supabase'den mevcut yapıyı kontrol et:
   - mcp__supabase__list_tables()
   - mcp__supabase__search_docs({"graphql_query": "auth providers"})

3. Implementation yap (güncel pattern'lerle)

4. Test et:
   - mcp__puppeteer__puppeteer_navigate("https://2sweety.com")
   - mcp__puppeteer__puppeteer_screenshot("auth-test")
```

## 🔴 KRİTİK KURALLAR

1. **Her zaman güncel bilgi kullan**
   - Context7 MCP öncelikli
   
2. **Database işlemlerinde Supabase MCP kullan**
   - Manuel SQL minimum
   
3. **Test için Puppeteer MCP kullan**
   - Manuel test yerine otomatik

4. **Dokümantasyon için MCP kullan**
   - Tahmin etme, araştır

## 💡 İPUCU

MCP kullanımı hem daha doğru hem daha hızlı sonuç verir. 
Her zaman "MCP ile nasıl yaparım?" diye düşün!

---

**Not**: Bu kurallar CLAUDE.md ile birlikte okunmalı ve uygulanmalıdır.