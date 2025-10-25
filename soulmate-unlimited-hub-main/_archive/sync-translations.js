const fs = require('fs');
const path = require('path');

// Dil dosyalarını oku
const enPath = './client/src/i18n/locales/en.json';
const trPath = './client/src/i18n/locales/tr.json';
const dePath = './client/src/i18n/locales/de.json';

console.log('🔍 Dil dosyalarını analiz ediliyor...\n');

try {
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const trData = JSON.parse(fs.readFileSync(trPath, 'utf8'));
  const deData = JSON.parse(fs.readFileSync(dePath, 'utf8'));

  // Tüm benzersiz anahtarları topla
  const allKeys = new Set([
    ...Object.keys(enData),
    ...Object.keys(trData),
    ...Object.keys(deData)
  ]);

  console.log(`📊 Toplam benzersiz anahtar sayısı: ${allKeys.size}`);
  console.log(`EN anahtarları: ${Object.keys(enData).length}`);
  console.log(`TR anahtarları: ${Object.keys(trData).length}`);
  console.log(`DE anahtarları: ${Object.keys(deData).length}\n`);

  // Eksik anahtarları bul
  const missingInTr = [];
  const missingInDe = [];
  const missingInEn = [];

  allKeys.forEach(key => {
    if (!trData.hasOwnProperty(key)) missingInTr.push(key);
    if (!deData.hasOwnProperty(key)) missingInDe.push(key);
    if (!enData.hasOwnProperty(key)) missingInEn.push(key);
  });

  console.log(`❌ TR'de eksik: ${missingInTr.length} anahtar`);
  console.log(`❌ DE'de eksik: ${missingInDe.length} anahtar`);
  console.log(`❌ EN'de eksik: ${missingInEn.length} anahtar\n`);

  // Detaylı analiz
  if (missingInTr.length > 0) {
    console.log('🔸 TR\'de eksik anahtarlar (ilk 20):');
    missingInTr.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (missingInTr.length > 20) console.log(`  ... ve ${missingInTr.length - 20} tane daha\n`);
  }

  if (missingInDe.length > 0) {
    console.log('🔸 DE\'de eksik anahtarlar (ilk 20):');
    missingInDe.slice(0, 20).forEach(key => console.log(`  - ${key}`));
    if (missingInDe.length > 20) console.log(`  ... ve ${missingInDe.length - 20} tane daha\n`);
  }

  if (missingInEn.length > 0) {
    console.log('🔸 EN\'de eksik anahtarlar:');
    missingInEn.forEach(key => console.log(`  - ${key}`));
    console.log();
  }

  // Sync işlemini başlat
  console.log('🚀 Sync işlemi başlatılıyor...\n');

  // TR dosyasını sync et
  if (missingInTr.length > 0) {
    const updatedTr = { ...trData };
    let addedToTr = 0;

    missingInTr.forEach(key => {
      if (enData[key]) {
        // EN'den al, eğer İngilizce ise Türkçe placeholder ekle
        if (typeof enData[key] === 'string') {
          updatedTr[key] = enData[key]; // Geçici olarak İngilizce değeri koy
        } else {
          updatedTr[key] = enData[key]; // Objeler için direkt kopyala
        }
        addedToTr++;
      } else if (deData[key]) {
        // EN'de yoksa DE'den al
        updatedTr[key] = deData[key];
        addedToTr++;
      }
    });

    // TR dosyasını güncelle
    const sortedTr = {};
    Object.keys(updatedTr).sort().forEach(key => {
      sortedTr[key] = updatedTr[key];
    });

    fs.writeFileSync(trPath, JSON.stringify(sortedTr, null, 2), 'utf8');
    console.log(`✅ TR dosyası güncellendi: ${addedToTr} anahtar eklendi`);
  }

  // DE dosyasını sync et
  if (missingInDe.length > 0) {
    const updatedDe = { ...deData };
    let addedToDe = 0;

    missingInDe.forEach(key => {
      if (enData[key]) {
        // EN'den al
        updatedDe[key] = enData[key];
        addedToDe++;
      } else if (trData[key]) {
        // EN'de yoksa TR'den al
        updatedDe[key] = trData[key];
        addedToDe++;
      }
    });

    // DE dosyasını güncelle
    const sortedDe = {};
    Object.keys(updatedDe).sort().forEach(key => {
      sortedDe[key] = updatedDe[key];
    });

    fs.writeFileSync(dePath, JSON.stringify(sortedDe, null, 2), 'utf8');
    console.log(`✅ DE dosyası güncellendi: ${addedToDe} anahtar eklendi`);
  }

  // EN dosyasını sync et (eğer gerekiyorsa)
  if (missingInEn.length > 0) {
    const updatedEn = { ...enData };
    let addedToEn = 0;

    missingInEn.forEach(key => {
      if (trData[key]) {
        updatedEn[key] = trData[key];
        addedToEn++;
      } else if (deData[key]) {
        updatedEn[key] = deData[key];
        addedToEn++;
      }
    });

    // EN dosyasını güncelle
    const sortedEn = {};
    Object.keys(updatedEn).sort().forEach(key => {
      sortedEn[key] = updatedEn[key];
    });

    fs.writeFileSync(enPath, JSON.stringify(sortedEn, null, 2), 'utf8');
    console.log(`✅ EN dosyası güncellendi: ${addedToEn} anahtar eklendi`);
  }

  console.log('\n🎉 Sync işlemi tamamlandı!');
  console.log('📝 Not: Eksik çeviriler placeholder olarak eklendi, manuel çeviri gerekebilir.');

} catch (error) {
  console.error('❌ Hata:', error.message);
  process.exit(1);
}
