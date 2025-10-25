#!/usr/bin/env python3
import json
import os
from collections import defaultdict
from typing import Dict, List, Set, Tuple
import re

def load_json_file(filepath: str) -> Dict:
    """Load a JSON file and return its contents."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def flatten_dict(d: Dict, parent_key: str = '', sep: str = '.') -> Dict[str, str]:
    """Flatten a nested dictionary into dot-notation keys."""
    items = []
    for k, v in d.items():
        new_key = f"{parent_key}{sep}{k}" if parent_key else k
        if isinstance(v, dict):
            items.extend(flatten_dict(v, new_key, sep=sep).items())
        else:
            items.append((new_key, str(v)))
    return dict(items)

def detect_language(text: str) -> List[str]:
    """Detect potential languages in text based on character patterns."""
    languages = []
    
    # Turkish specific characters
    if any(char in text for char in 'ğĞıİöÖşŞüÜçÇ'):
        languages.append('Turkish')
    
    # Common Turkish words
    turkish_words = ['ve', 'için', 'bir', 'bu', 'ile', 'değil', 'daha', 'çok', 'gibi', 'kadar', 'olan', 'olarak']
    if any(word in text.lower().split() for word in turkish_words):
        languages.append('Turkish (words)')
    
    # English detection (basic)
    english_only_chars = set('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?\'"-:;()[]{}/@#$%^&*+=_~`|\\<>')
    if all(char in english_only_chars for char in text) and len(text) > 10:
        # Check for common English words
        english_words = ['the', 'and', 'for', 'with', 'that', 'this', 'from', 'have', 'will', 'your', 'are', 'not']
        if any(word in text.lower().split() for word in english_words):
            languages.append('English')
    
    return languages

def analyze_translations(locale_dir: str) -> Dict:
    """Analyze all translation files in the given directory."""
    results = {
        'files': {},
        'all_keys': set(),
        'missing_keys': defaultdict(list),
        'untranslated': defaultdict(list),
        'suspicious_translations': defaultdict(list),
        'key_count_by_file': {},
        'unique_keys_by_file': defaultdict(set)
    }
    
    # Get all JSON files
    json_files = [f for f in os.listdir(locale_dir) if f.endswith('.json')]
    
    # Load all files
    for filename in sorted(json_files):
        filepath = os.path.join(locale_dir, filename)
        lang_code = filename[:-5]  # Remove .json extension
        
        try:
            data = load_json_file(filepath)
            flattened = flatten_dict(data)
            
            results['files'][lang_code] = flattened
            results['all_keys'].update(flattened.keys())
            results['key_count_by_file'][lang_code] = len(flattened)
            
            # Track unique keys per file
            for key in flattened.keys():
                results['unique_keys_by_file'][key].add(lang_code)
                
        except Exception as e:
            print(f"Error loading {filename}: {e}")
    
    # Find missing keys
    for lang_code, translations in results['files'].items():
        file_keys = set(translations.keys())
        missing = results['all_keys'] - file_keys
        if missing:
            results['missing_keys'][lang_code] = sorted(missing)
    
    # Check for untranslated or suspicious translations
    for lang_code, translations in results['files'].items():
        if lang_code == 'en':  # Skip English as base language
            continue
            
        for key, value in translations.items():
            # Check if value is still in English (comparing with English file)
            if 'en' in results['files'] and key in results['files']['en']:
                en_value = results['files']['en'][key]
                if value == en_value and lang_code != 'en':
                    results['untranslated'][lang_code].append({
                        'key': key,
                        'value': value,
                        'reason': 'Identical to English'
                    })
            
            # Detect wrong language
            detected_langs = detect_language(value)
            
            # Special checks for specific languages
            if lang_code == 'sv' and 'Turkish' in detected_langs:
                results['suspicious_translations'][lang_code].append({
                    'key': key,
                    'value': value,
                    'detected': detected_langs,
                    'reason': 'Turkish text in Swedish file'
                })
            elif lang_code not in ['en', 'tr'] and 'Turkish' in detected_langs:
                results['suspicious_translations'][lang_code].append({
                    'key': key,
                    'value': value,
                    'detected': detected_langs,
                    'reason': f'Turkish text in {lang_code} file'
                })
            elif lang_code not in ['en'] and 'English' in detected_langs and len(value) > 20:
                # Only flag longer English texts to avoid false positives
                results['suspicious_translations'][lang_code].append({
                    'key': key,
                    'value': value[:100] + '...' if len(value) > 100 else value,
                    'detected': detected_langs,
                    'reason': f'English text in {lang_code} file'
                })
    
    return results

def generate_report(results: Dict) -> str:
    """Generate a comprehensive report from the analysis results."""
    report = []
    report.append("# Translation Analysis Report\n")
    report.append("=" * 80 + "\n")
    
    # Summary
    report.append("## Summary\n")
    report.append(f"- Total unique keys across all files: {len(results['all_keys'])}\n")
    report.append(f"- Number of language files analyzed: {len(results['files'])}\n")
    report.append("\n### Key Count by Language:\n")
    for lang, count in sorted(results['key_count_by_file'].items()):
        report.append(f"  - {lang}: {count} keys\n")
    
    # Missing Keys
    report.append("\n\n## Missing Keys by Language\n")
    report.append("-" * 80 + "\n")
    
    if results['missing_keys']:
        for lang, keys in sorted(results['missing_keys'].items()):
            if keys:
                report.append(f"\n### {lang.upper()} - Missing {len(keys)} keys:\n")
                for key in keys[:10]:  # Show first 10
                    report.append(f"  - {key}\n")
                if len(keys) > 10:
                    report.append(f"  ... and {len(keys) - 10} more\n")
    else:
        report.append("No missing keys found - all languages have the same keys!\n")
    
    # Keys that exist only in some files
    report.append("\n\n## Keys Not Present in All Files\n")
    report.append("-" * 80 + "\n")
    
    partial_keys = [(key, langs) for key, langs in results['unique_keys_by_file'].items() 
                    if len(langs) < len(results['files'])]
    
    if partial_keys:
        for key, langs in sorted(partial_keys)[:20]:  # Show first 20
            missing_from = set(results['files'].keys()) - langs
            report.append(f"\n- Key: {key}\n")
            report.append(f"  Present in: {', '.join(sorted(langs))}\n")
            report.append(f"  Missing from: {', '.join(sorted(missing_from))}\n")
        
        if len(partial_keys) > 20:
            report.append(f"\n... and {len(partial_keys) - 20} more partial keys\n")
    
    # Untranslated content
    report.append("\n\n## Untranslated Content (Identical to English)\n")
    report.append("-" * 80 + "\n")
    
    for lang, items in sorted(results['untranslated'].items()):
        if items:
            report.append(f"\n### {lang.upper()} - {len(items)} untranslated entries:\n")
            for item in items[:5]:  # Show first 5
                report.append(f"  - {item['key']}: \"{item['value'][:50]}...\"\n" 
                            if len(item['value']) > 50 else f"  - {item['key']}: \"{item['value']}\"\n")
            if len(items) > 5:
                report.append(f"  ... and {len(items) - 5} more\n")
    
    # Suspicious translations
    report.append("\n\n## Suspicious Translations (Wrong Language Detected)\n")
    report.append("-" * 80 + "\n")
    
    for lang, items in sorted(results['suspicious_translations'].items()):
        if items:
            report.append(f"\n### {lang.upper()} - {len(items)} suspicious entries:\n")
            for item in items[:10]:  # Show first 10
                report.append(f"\n  - Key: {item['key']}\n")
                report.append(f"    Value: \"{item['value'][:100]}...\"\n" 
                            if len(item['value']) > 100 else f"    Value: \"{item['value']}\"\n")
                report.append(f"    Issue: {item['reason']}\n")
            if len(items) > 10:
                report.append(f"\n  ... and {len(items) - 10} more\n")
    
    # Special focus on Swedish file
    report.append("\n\n## Special Focus: Swedish (sv.json) Turkish Text Issues\n")
    report.append("-" * 80 + "\n")
    
    if 'sv' in results['suspicious_translations']:
        sv_turkish = [item for item in results['suspicious_translations']['sv'] 
                      if 'Turkish' in item.get('detected', [])]
        if sv_turkish:
            report.append(f"Found {len(sv_turkish)} entries with Turkish text in Swedish file:\n\n")
            for item in sv_turkish:
                report.append(f"- {item['key']}: \"{item['value']}\"\n")
    else:
        report.append("No Turkish text found in Swedish file.\n")
    
    return ''.join(report)

def main():
    locale_dir = "/Users/max/Downloads/soulmate-unlimited-hub-main 3/client/src/i18n/locales"
    
    print("Analyzing translation files...")
    results = analyze_translations(locale_dir)
    
    report = generate_report(results)
    
    # Save report
    report_path = "/Users/max/Downloads/soulmate-unlimited-hub-main 3/translation_analysis_report.txt"
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(report)
    
    print(f"\nReport saved to: {report_path}")
    print("\n" + "=" * 80)
    print(report)

if __name__ == "__main__":
    main()