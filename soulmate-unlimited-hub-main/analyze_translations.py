import json
import os
from google import genai
from google.genai.types import HarmCategory, HarmBlockThreshold
from pydantic import BaseModel, Field
from typing import Dict

class Translations(BaseModel):
    translations: Dict[str, str] = Field(description="Object where keys are the original English strings and values are the translated strings.")

def get_api_key():
    """Gets the Gemini API key from the environment variables."""
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY environment variable not set.")
    return api_key

def flatten_json(y):
    """Flattens a nested JSON object."""
    out = {}

    def flatten(x, name=''):
        if type(x) is dict:
            for a in x:
                flatten(x[a], name + a + '.')
        elif type(x) is list:
            i = 0
            for a in x:
                flatten(a, name + str(i) + '.')
                i += 1
        else:
            out[name[:-1]] = x

    flatten(y)
    return out

def translate_texts(texts_to_translate: Dict[str, str], target_language: str, client: genai.Client) -> Dict[str, str]:
    """Translates a dictionary of texts to the target language using the Gemini API."""
    if not texts_to_translate:
        return {}

    prompt = f"Translate the following English JSON values to {target_language}. Return a JSON object with the original keys and translated values.\n\n{json.dumps(texts_to_translate, indent=2)}"

    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
            config=genai.types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=Translations,
            ),
            safety_settings={
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
            }
        )
        # The response.text is a JSON string, so we parse it.
        translated_data = json.loads(response.text)
        return translated_data.get("translations", {})
    except Exception as e:
        # If translation fails, return original English texts as a fallback
        return {key: f"TRANSLATION_ERROR: {value}" for key, value in texts_to_translate.items()}


def main():
    """
    Analyzes i18n files, finds missing keys, translates them, and generates a JSON report.
    """
    try:
        api_key = get_api_key()
        genai.configure(api_key=api_key)
        client = genai.Client()
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        return

    locales_path = "client/src/i18n/locales/"
    try:
        with open(os.path.join(locales_path, "en.json"), 'r', encoding='utf-8') as f:
            en_data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(json.dumps({"error": f"Could not read or parse en.json: {e}"}))
        return

    en_keys_flat = flatten_json(en_data)
    final_report = {}

    language_map = {
        "tr": "Turkish", "es": "Spanish", "fr": "French", "de": "German",
        "it": "Italian", "sv": "Swedish", "pt": "Portuguese", "ru": "Russian",
        "zh": "Chinese", "ar": "Arabic", "ja": "Japanese", "ko": "Korean",
        "hi": "Hindi", "nl": "Dutch", "bn": "Bengali", "da": "Danish",
        "fi": "Finnish", "no": "Norwegian", "vi": "Vietnamese"
    }

    for lang_code, lang_name in language_map.items():
        file_path = os.path.join(locales_path, f"{lang_code}.json")
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                target_data = json.loads(content) if content else {}
        except (FileNotFoundError, json.JSONDecodeError):
            target_data = {}

        target_keys_flat = flatten_json(target_data)
        missing_keys = set(en_keys_flat.keys()) - set(target_keys_flat.keys())

        if missing_keys:
            texts_to_translate = {key: en_keys_flat[key] for key in missing_keys if isinstance(en_keys_flat[key], str)}
            
            if texts_to_translate:
                translated_texts = translate_texts(texts_to_translate, lang_name, client)
                final_report[file_path] = translated_texts

    print(json.dumps(final_report, indent=2, ensure_ascii=False))

if __name__ == "__main__":
    main()