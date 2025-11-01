# Translation Issues Summary Report

## Overview
Analyzed 17 language files in `/client/src/i18n/locales/`:
- ar.json, da.json, de.json, en.json, es.json, fi.json, fr.json, it.json, ja.json, ko.json, nl.json, no.json, pt.json, ru.json, sv.json, tr.json, zh.json

## Key Findings

### 1. Missing Keys Across Languages
- **Total unique keys**: 1,538 across all files
- **Most complete**: Turkish (tr.json) with 1,532 keys
- **Least complete**: Arabic, Danish, Finnish, Dutch, Norwegian, Swedish with only 1,402 keys each

#### Languages with Most Missing Keys:
1. **Arabic (ar)**: Missing 136 keys
2. **Danish (da)**: Missing 136 keys  
3. **Finnish (fi)**: Missing 136 keys
4. **Dutch (nl)**: Missing 136 keys
5. **Norwegian (no)**: Missing 136 keys
6. **Swedish (sv)**: Missing 136 keys

### 2. Untranslated Content (Still in English)

#### Most Untranslated:
1. **Arabic**: 1,343 untranslated entries (95.6% of content!)
2. **Danish**: 1,344 untranslated entries (95.7% of content!)
3. **Finnish**: 1,343 untranslated entries (95.6% of content!)
4. **Dutch**: 1,344 untranslated entries (95.7% of content!)
5. **Norwegian**: 1,343 untranslated entries (95.6% of content!)
6. **Swedish**: 1,343 untranslated entries (95.6% of content!)

#### Better Translated:
- **Japanese**: 348 untranslated entries
- **Korean**: 349 untranslated entries
- **Russian**: 345 untranslated entries
- **German**: 362 untranslated entries

### 3. Wrong Language Detections

#### Turkish Text in Non-Turkish Files:
- **German (de)**: 177 suspicious entries (many containing Turkish characters)
- **Portuguese (pt)**: 217 suspicious entries (extensive Turkish contamination)
- **Swedish (sv)**: 10 entries with Turkish text detected

#### Swedish File Turkish Text Issues:
The following keys in sv.json contain Turkish text or characters:
1. `errorOccurred`: "Ett fel uppstod. Försök igen."
2. `feature.requires.admin`: "Administratörsåtkomst krävs"
3. `heroProfileCity2`: "Göteborg"
4. `limit.description.dailyLikes`: "Uppgradera för obegränsade gilla-markeringar"
5. `limit.description.dailySuperLikes`: "Uppgradera för fler supergilla-markeringar"
6. `password`: "Lösenord"
7. `passwordPlaceholder`: "Ange ditt lösenord"
8. `testimonialCity2`: "Göteborg"
9. `testimonialCity3`: "Malmö"
10. `validation.conversationStartError`: "Kunde inte starta konversation, försök igen"

**Note**: These appear to be correctly translated Swedish text, but were flagged due to the characters 'ö' and 'å' which are also used in Turkish.

### 4. Common Missing Keys Across Multiple Languages

Keys that are missing from most files but present in Turkish:
- `activeSubscriptions`
- `addMorePhotos`
- `analyticsNotAvailable`
- `bestTimeToPost`
- `dismissed`
- `engageWithOthers`
- `failedToDismiss`
- `failedToLikeBack`
- `failedToLoadGuests`

### 5. Critical Issues

1. **Arabic, Danish, Finnish, Dutch, Norwegian, and Swedish** files are essentially unusable - over 95% of content is still in English.

2. **Admin-related keys** are missing from many languages:
   - `admin.subscription.manual.*` keys missing from: ar, da, en, fi, nl, no, sv

3. **Boost error messages** only exist in English:
   - `boost.error.description`
   - `boost.error.title`

4. **Portuguese file** has significant Turkish contamination with 217 suspicious entries.

## Recommendations

1. **Priority 1**: Complete translations for ar, da, fi, nl, no, sv files (currently 95%+ untranslated)
2. **Priority 2**: Add missing keys to all language files to ensure consistency
3. **Priority 3**: Review and fix Portuguese file for Turkish text contamination
4. **Priority 4**: Translate remaining English text in partially translated files (de, es, fr, it, ja, ko, pt, ru, zh)

## File Status Summary

| Language | Keys | Missing | Untranslated | Status |
|----------|------|---------|--------------|--------|
| Turkish (tr) | 1532 | 6 | 166 | ✓ Good |
| German (de) | 1452 | 86 | 362 | ⚠️ Needs work |
| Spanish (es) | 1433 | 105 | 363 | ⚠️ Needs work |
| French (fr) | 1433 | 105 | 388 | ⚠️ Needs work |
| Italian (it) | 1433 | 105 | 367 | ⚠️ Needs work |
| Japanese (ja) | 1433 | 105 | 348 | ⚠️ Needs work |
| Korean (ko) | 1433 | 105 | 349 | ⚠️ Needs work |
| Portuguese (pt) | 1433 | 105 | 359 | ⚠️ Turkish contamination |
| Russian (ru) | 1433 | 105 | 345 | ⚠️ Needs work |
| Chinese (zh) | 1433 | 105 | 348 | ⚠️ Needs work |
| English (en) | 1403 | 135 | - | ⚠️ Missing keys |
| Arabic (ar) | 1402 | 136 | 1343 | ❌ Critical |
| Danish (da) | 1402 | 136 | 1344 | ❌ Critical |
| Finnish (fi) | 1402 | 136 | 1343 | ❌ Critical |
| Dutch (nl) | 1402 | 136 | 1344 | ❌ Critical |
| Norwegian (no) | 1402 | 136 | 1343 | ❌ Critical |
| Swedish (sv) | 1402 | 136 | 1343 | ❌ Critical |