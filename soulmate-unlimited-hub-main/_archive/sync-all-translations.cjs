const fs = require('fs');
const path = require('path');

// Tüm dil dosyalarını bul
const localesDir = './client/src/i18n/locales';
const allFiles = fs.readdirSync(localesDir)
  .filter(file => file.endsWith('.json') && !file.includes('.backup'))
  .sort();

console.log('🌍 TÜM dil dosyalarını analiz ediliyor...\n');
console.log(`📁 Bulunan dil dosyaları: ${allFiles.length}`);
allFiles.forEach(file => console.log(`  - ${file}`));
console.log();

try {
  // Tüm dil dosyalarını oku
  const allTranslations = {};
  const allKeyCounts = {};

  allFiles.forEach(file => {
    const filePath = path.join(localesDir, file);
    const langCode = file.replace('.json', '');
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      allTranslations[langCode] = data;
      allKeyCounts[langCode] = Object.keys(data).length;
      console.log(`✅ ${langCode.toUpperCase()}: ${Object.keys(data).length} anahtar yüklendi`);
    } catch (error) {
      console.log(`❌ ${langCode.toUpperCase()}: Hata - ${error.message}`);
      allTranslations[langCode] = {};
      allKeyCounts[langCode] = 0;
    }
  });

  console.log('\n📊 Anahtar Sayısı Analizi:');
  Object.entries(allKeyCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([lang, count]) => {
      console.log(`${lang.toUpperCase().padEnd(3)}: ${count.toString().padStart(4)} anahtar`);
    });

  // Tüm benzersiz anahtarları topla
  const allKeys = new Set();
  Object.values(allTranslations).forEach(translations => {
    Object.keys(translations).forEach(key => allKeys.add(key));
  });

  console.log(`\n🔑 Toplam benzersiz anahtar sayısı: ${allKeys.size}\n`);

  // Her dil için eksik anahtarları bul
  const missingKeys = {};
  allFiles.forEach(file => {
    const langCode = file.replace('.json', '');
    missingKeys[langCode] = [];
    
    allKeys.forEach(key => {
      if (!allTranslations[langCode] || !allTranslations[langCode].hasOwnProperty(key)) {
        missingKeys[langCode].push(key);
      }
    });
  });

  // Eksik anahtar raporu
  console.log('❌ Eksik Anahtar Raporu:');
  Object.entries(missingKeys)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([lang, missing]) => {
      if (missing.length > 0) {
        console.log(`${lang.toUpperCase().padEnd(3)}: ${missing.length.toString().padStart(3)} eksik anahtar`);
      }
    });

  // En kapsamlı dosyayı referans olarak bul (muhtemelen EN)
  const referenceLanguage = Object.entries(allKeyCounts)
    .sort((a, b) => b[1] - a[1])[0][0];
  
  console.log(`\n🎯 Referans dil: ${referenceLanguage.toUpperCase()} (${allKeyCounts[referenceLanguage]} anahtar)\n`);

  // Sync işlemini başlat
  console.log('🚀 TÜM dil dosyaları için sync işlemi başlatılıyor...\n');

  let totalAdded = 0;
  
  allFiles.forEach(file => {
    const langCode = file.replace('.json', '');
    const missing = missingKeys[langCode];
    
    if (missing.length > 0) {
      console.log(`📝 ${langCode.toUpperCase()} güncelleniyor: ${missing.length} anahtar eklenecek`);
      
      const updated = { ...allTranslations[langCode] };
      let addedCount = 0;

      missing.forEach(key => {
        // Öncelik sırası: EN -> TR -> DE -> diğerleri
        const priorities = ['en', 'tr', 'de', ...allFiles.map(f => f.replace('.json', ''))];
        
        for (const priorityLang of priorities) {
          if (priorityLang !== langCode && 
              allTranslations[priorityLang] && 
              allTranslations[priorityLang][key]) {
            updated[key] = allTranslations[priorityLang][key];
            addedCount++;
            break;
          }
        }
      });

      // Dosyayı güncelle (alfabetik sıralama ile)
      const sorted = {};
      Object.keys(updated).sort().forEach(key => {
        sorted[key] = updated[key];
      });

      const filePath = path.join(localesDir, file);
      fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2), 'utf8');
      
      console.log(`  ✅ ${addedCount} anahtar eklendi`);
      totalAdded += addedCount;
    } else {
      console.log(`✅ ${langCode.toUpperCase()}: Zaten tam`);
    }
  });

  console.log(`\n🎉 Sync işlemi tamamlandı!`);
  console.log(`📊 Toplam ${totalAdded} anahtar eklendi`);
  console.log(`🌍 ${allFiles.length} dil dosyası sync edildi`);
  console.log(`🔑 Her dosyada artık ${allKeys.size} anahtar var`);
  
} catch (error) {
  console.error('❌ Genel hata:', error.message);
  process.exit(1);
}
