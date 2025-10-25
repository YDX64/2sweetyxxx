# 🚀 DEVELOPMENT WORKFLOW REHBERİ

## 📊 BRANCH STRATEJİSİ

```bash
main          # 🔴 Production (Otomatik deploy)
├── staging   # 🟡 Test environment
├── develop   # 🟢 Development branch
├── feature/  # 🔵 Yeni özellikler
├── hotfix/   # 🟠 Acil düzeltmeler
├── backups   # 💾 Incremental backups (automated)
└── db-backups # 🗄️ Database backups (automated)
```

## 🔄 YENİ ÖZELLİK EKLEME SÜRECİ

### 1. Feature Branch Oluştur
```bash
# Develop'dan yeni branch oluştur
git checkout develop
git pull origin develop
git checkout -b feature/user-profile-enhancement

# Örnek feature branch isimleri:
# feature/payment-integration
# feature/chat-system
# feature/mobile-responsive
# feature/admin-dashboard
```

### 2. Geliştirme Yap
```bash
# Kod değişikliklerini yap
# Test et
# Commit et
git add .
git commit -m "feat: add user profile photo upload functionality"

# Commit message formatı:
# feat: yeni özellik
# fix: bug düzeltme
# docs: dokümantasyon
# style: kod formatı
# refactor: kod iyileştirme
# test: test ekleme
# chore: build/config değişiklikleri
```

### 3. Push ve Pull Request
```bash
# Feature branch'i push et
git push origin feature/user-profile-enhancement

# GitHub'da Pull Request oluştur:
# feature/user-profile-enhancement → develop
```

### 4. Code Review ve Test
```bash
# Team review
# Automated tests çalışır
# Staging'e deploy edilir (opsiyonel)
```

### 5. Merge ve Deploy
```bash
# Develop'a merge
# Develop → staging (test)
# Staging → main (production)
```

## 🧪 TEST ENVIRONMENT (STAGING)

### Staging Branch Kullanımı
```bash
# Staging'e deploy için
git checkout staging
git merge develop
git push origin staging

# Staging URL: staging.yourdomain.com
# Test tamamlandıktan sonra main'e merge
```

### Staging Environment Özellikleri
- 🔄 Otomatik deployment
- 🧪 Test database
- 📊 Performance monitoring
- 🔍 Error tracking
- 📱 Mobile testing

## 🚨 HOTFIX SÜRECİ (ACİL DÜZELTME)

### Acil Bug Düzeltme
```bash
# Main'den hotfix branch oluştur
git checkout main
git pull origin main
git checkout -b hotfix/critical-payment-bug

# Düzeltmeyi yap
git add .
git commit -m "fix: resolve payment processing error"

# Hem main hem develop'a merge et
git checkout main
git merge hotfix/critical-payment-bug
git push origin main

git checkout develop  
git merge hotfix/critical-payment-bug
git push origin develop

# Hotfix branch'i sil
git branch -d hotfix/critical-payment-bug
git push origin --delete hotfix/critical-payment-bug
```

## 📦 BACKUP STRATEJİSİ

### GitHub Actions Otomatik Backup
```bash
🕐 02:00 - Continuous backup (GitHub Actions)
🕐 03:00 - Database backup (GitHub Actions)
🕐 Her Push - Pre-deployment snapshot
🕐 PR Açılışı - Automatic snapshot
```

### Manuel Backup Komutları
```bash
# Local backup oluştur
./scripts/github-backup.sh

# Backup doğrula
./scripts/verify-backup.sh backups/latest_backup.tar.gz

# GitHub'dan backup indir
gh release download backup-YYYYMMDD

# Emergency recovery başlat
gh workflow run emergency-recovery.yml
```

### Coolify Server Backup
```bash
# SSH ile sunucuya bağlan
ssh root@45.9.190.79

# Manuel backup çalıştır
/root/backup-system.sh

# Backup durumunu kontrol et
ls -la /data/backups/
```

## 🔍 MONİTORİNG VE ALERTLER

### GitHub Actions Notifications
- ✅ Successful deployment
- ❌ Failed deployment  
- 🧪 Test failures
- 📦 Backup completion

### Server Monitoring
- 💾 Disk usage
- 🖥️ CPU/Memory usage
- 🌐 Application uptime
- 📊 Database performance

## 🛡️ GÜVENLİK BEST PRACTICES

### Environment Variables
```bash
# Production secrets
DATABASE_URL=***
STRIPE_SECRET_KEY=***
JWT_SECRET=***

# Staging/Development
DATABASE_URL_STAGING=***
STRIPE_TEST_KEY=***
JWT_SECRET_DEV=***
```

### Code Security
- 🔍 Dependency vulnerability scanning
- 🛡️ HTTPS only
- 🔐 Input validation
- 🚫 No hardcoded secrets
- 📝 Security headers

## 📈 PERFORMANCE OPTIMIZATION

### Build Optimization
```bash
# Production build
npm run build

# Bundle analysis
npm run analyze

# Performance testing
npm run lighthouse
```

### Database Optimization
- 📊 Query optimization
- 🗂️ Index management
- 🔄 Connection pooling
- 📈 Performance monitoring

## 🚀 DEPLOYMENT CHECKLIST

### Pre-deployment
- [ ] ✅ Tests passing
- [ ] 📦 Backup completed
- [ ] 🔍 Code review approved
- [ ] 📊 Performance tested
- [ ] 🛡️ Security scan passed

### Post-deployment
- [ ] 🌐 Application accessible
- [ ] 📊 Monitoring active
- [ ] 🔍 Error logs checked
- [ ] 📱 Mobile responsive
- [ ] 🔗 All domains working

## 📞 EMERGENCY CONTACTS

### Rollback Procedure
```bash
# Acil geri alma
git checkout main
git revert HEAD
git push origin main

# Veya önceki commit'e dön
git reset --hard PREVIOUS_COMMIT_HASH
git push origin main --force
```

### Support Channels
- 🆘 Emergency: Telegram/Discord
- 📧 Non-urgent: Email
- 📊 Monitoring: Coolify Dashboard
- 📝 Documentation: GitHub Wiki 