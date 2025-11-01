import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read English file as reference
const enPath = path.join(__dirname, 'client/src/i18n/locales', 'en.json');
const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));

// List of all language files
const languages = ['ar', 'da', 'de', 'es', 'fi', 'fr', 'it', 'ja', 'ko', 'nl', 'no', 'pt', 'ru', 'sv', 'tr', 'zh'];

// Count keys
console.log('English file has', Object.keys(enData).length, 'keys');
console.log('---');

// Check each language
languages.forEach(lang => {
  const langPath = path.join(__dirname, 'client/src/i18n/locales', lang + '.json');
  const langData = JSON.parse(fs.readFileSync(langPath, 'utf8'));
  const langKeys = Object.keys(langData).length;
  const missingKeys = Object.keys(enData).filter(key => !(key in langData));
  
  console.log(`${lang}: ${langKeys} keys, ${missingKeys.length} missing`);
  
  if (missingKeys.length > 0 && missingKeys.length < 50) {
    console.log('  Missing:', missingKeys.join(', '));
  }
  console.log('');
});