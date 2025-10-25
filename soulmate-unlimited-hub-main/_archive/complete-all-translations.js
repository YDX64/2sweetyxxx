
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read English file as reference
const enPath = path.join(__dirname, 'client/src/i18n/locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const localesDir = path.join(__dirname, 'client/src/i18n/locales');
const languageFiles = fs.readdirSync(localesDir).filter(file => file.endsWith('.json') && file !== 'en.json');


// Track what was updated
const updateReport = {};

// Process each language
languageFiles.forEach(langFile => {
  const lang = langFile.replace('.json', '');
  const langPath = path.join(localesDir, langFile);
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));

  // Find missing keys
  const missingKeys = Object.keys(enData).filter(key => !(key in langData));

  if (missingKeys.length > 0) {
    // Add missing keys from English
    missingKeys.forEach(key => {
      langData[key] = enData[key];
    });

    // Sort keys alphabetically for consistency
    const sortedData = {};
    Object.keys(langData).sort().forEach(key => {
      sortedData[key] = langData[key];
    });

    // Write back to file
    fs.writeFileSync(langPath, JSON.stringify(sortedData, null, 2), 'utf8');

    updateReport[lang] = missingKeys.length;
    console.log(`✅ Updated ${lang}.json - Added ${missingKeys.length} missing keys`);
  } else {
    console.log(`✓ ${lang}.json - Already complete`);
  }
});

console.log('\n📊 Summary:');
console.log('==========');
Object.entries(updateReport).forEach(([lang, count]) => {
  console.log(`${lang}: ${count} keys added`);
});

console.log('\n⚠️  Note: The missing translations have been filled with English text.');
console.log('Professional translation services should be used to properly translate these keys.');

