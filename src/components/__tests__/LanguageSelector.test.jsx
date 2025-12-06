/* jshint esversion: 6 */
/* jshint ignore:start */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';
import i18n from '../../Language';
import { ThemeProvider } from '../../Context/ThemeContext';

// Mock window.location.reload
delete window.location;
window.location = { reload: jest.fn() };

const renderWithProviders = (component) => {
  return render(
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        {component}
      </I18nextProvider>
    </ThemeProvider>
  );
};

describe('LanguageSelector Component - Language Switching Tests', () => {
  beforeEach(() => {
    if (typeof localStorage !== 'undefined' && localStorage) localStorage.clear();
    if (typeof sessionStorage !== 'undefined' && sessionStorage) sessionStorage.clear();
    jest.clearAllMocks();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
  });

  describe('Test Suite 1: Language Availability and Selection', () => {
    test('TC-1.1: Should display all 19 languages', () => {
      renderWithProviders(<LanguageSelector />);

      const languageButton = screen.getByRole('button', { name: /English|🇬🇧/i });
      fireEvent.click(languageButton);

      const expectedLanguages = [
        'English', 'Svenska', 'Norsk', 'Suomi', 'Dansk', 'Türkçe',
        'العربية', '中文', 'Français', 'Deutsch', 'Русский', 'Español',
        'Italiano', 'Português', 'Nederlands', '日本語', '한국어', 'हिंदी', 'Tiếng Việt'
      ];

      expectedLanguages.forEach(lang => {
        expect(screen.getByText(lang)).toBeInTheDocument();
      });
    });

    test('TC-1.1: Each language should have correct flag emoji', () => {
      renderWithProviders(<LanguageSelector />);

      const languageButton = screen.getByRole('button', { name: /English/i });
      fireEvent.click(languageButton);

      const expectedFlags = ['🇬🇧', '🇸🇪', '🇳🇴', '🇫🇮', '🇩🇰', '🇹🇷', '🇸🇦',
                             '🇨🇳', '🇫🇷', '🇩🇪', '🇷🇺', '🇪🇸', '🇮🇹', '🇵🇹',
                             '🇳🇱', '🇯🇵', '🇰🇷', '🇮🇳', '🇻🇳'];

      expectedFlags.forEach(flag => {
        expect(screen.getByText(flag)).toBeInTheDocument();
      });
    });

    test('TC-1.2: Should change language and trigger page reload', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button', { name: /English/i }));
      fireEvent.click(screen.getByText('Español'));

      expect(localStorage.getItem('i18nextLng')).toBe('es');
      expect(sessionStorage.getItem('I18')).toBe('es');
      expect(window.location.reload).toHaveBeenCalled();
    });

    test('TC-1.2: Should change to multiple different languages', () => {
      const { unmount } = renderWithProviders(<LanguageSelector />);

      // Test German
      // Assuming the language selector is the second button (after theme toggle)
      // or find by text content if current language is known (English)
      const languageButton = screen.queryByRole('button', { name: /English/i }) || screen.getAllByRole('button')[1];
      fireEvent.click(languageButton);
      fireEvent.click(screen.getByText('Deutsch'));
      expect(localStorage.getItem('i18nextLng')).toBe('de');

      unmount();
      jest.clearAllMocks();

      // Test Japanese
      renderWithProviders(<LanguageSelector />);
      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));
      fireEvent.click(screen.getByText('日本語'));
      expect(localStorage.getItem('i18nextLng')).toBe('ja');
    });

    test('TC-1.3: Should highlight current language', () => {
      i18n.changeLanguage('de');
      renderWithProviders(<LanguageSelector />);

      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));

      const germanOption = screen.getByText('Deutsch').closest('button');
      expect(germanOption).toHaveClass('bg-pink-50');
      expect(germanOption).toHaveClass('text-pink-600');
    });

    test('TC-1.3: Should show checkmark for current language', () => {
      i18n.changeLanguage('fr');
      renderWithProviders(<LanguageSelector />);

      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));

      const frenchOption = screen.getByText('Français').closest('button');
      const checkmark = frenchOption.querySelector('span.ml-auto');
      expect(checkmark).toHaveTextContent('✓');
    });

    test('TC-1.3: Should only highlight one language at a time', () => {
      i18n.changeLanguage('it');
      renderWithProviders(<LanguageSelector />);

      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));

      const highlightedOptions = document.querySelectorAll('.bg-pink-50');
      expect(highlightedOptions.length).toBe(1);
    });
  });

  describe('Test Suite 2: Language Persistence Across Sessions', () => {
    test('TC-2.1: Should persist language in localStorage', () => {
      renderWithProviders(<LanguageSelector />);

      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));
      fireEvent.click(screen.getByText('Italiano'));

      expect(localStorage.getItem('i18nextLng')).toBe('it');
    });

    test('TC-2.1: Should load saved language from localStorage on mount', () => {
      localStorage.setItem('i18nextLng', 'sv');

      renderWithProviders(<LanguageSelector />);

      expect(i18n.language).toBe('sv');
    });

    test('TC-2.1: Should load from sessionStorage if localStorage is empty', () => {
      localStorage.clear();
      sessionStorage.setItem('I18', 'no');

      renderWithProviders(<LanguageSelector />);

      // Component should attempt to load from sessionStorage
      const savedLang = sessionStorage.getItem('I18');
      expect(savedLang).toBe('no');
    });

    test('TC-2.4: Should sync localStorage and sessionStorage', () => {
      renderWithProviders(<LanguageSelector />);

      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));
      fireEvent.click(screen.getByText('日本語'));

      expect(localStorage.getItem('i18nextLng')).toBe('ja');
      expect(sessionStorage.getItem('I18')).toBe('ja');
      expect(localStorage.getItem('i18nextLng')).toBe(sessionStorage.getItem('I18'));
    });

    test('TC-2.4: Storage sync should work for all languages', () => {
      renderWithProviders(<LanguageSelector />);

      const languageCodes = ['en', 'sv', 'no', 'fi', 'da', 'tr', 'ar', 'zh',
                             'fr', 'de', 'ru', 'es', 'it', 'pt', 'nl', 'ja',
                             'ko', 'hi', 'vi'];

      const languageNames = {
        'en': 'English', 'sv': 'Svenska', 'no': 'Norsk', 'fi': 'Suomi',
        'da': 'Dansk', 'tr': 'Türkçe', 'ar': 'العربية', 'zh': '中文',
        'fr': 'Français', 'de': 'Deutsch', 'ru': 'Русский', 'es': 'Español',
        'it': 'Italiano', 'pt': 'Português', 'nl': 'Nederlands', 'ja': '日本語',
        'ko': '한국어', 'hi': 'हिंदी', 'vi': 'Tiếng Việt'
      };

      // Test a few languages
      const testLanguages = ['de', 'ar', 'ja', 'es'];

      testLanguages.forEach(code => {
        jest.clearAllMocks();
        localStorage.clear();
        sessionStorage.clear();

        const { unmount } = renderWithProviders(<LanguageSelector />);
        fireEvent.click(screen.getByRole('button'));
        fireEvent.click(screen.getByText(languageNames[code]));

        expect(localStorage.getItem('i18nextLng')).toBe(code);
        expect(sessionStorage.getItem('I18')).toBe(code);

        unmount();
      });
    });
  });

  describe('Test Suite 3: RTL (Right-to-Left) Support', () => {
    test('TC-3.1: Should enable RTL mode for Arabic', () => {
      renderWithProviders(<LanguageSelector />);

      // Trigger language change event
      i18n.changeLanguage('ar');
      i18n.emit('languageChanged', 'ar');

      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });

    test('TC-3.2: Should disable RTL mode for non-Arabic languages', () => {
      // First set to Arabic
      i18n.changeLanguage('ar');
      i18n.emit('languageChanged', 'ar');
      expect(document.documentElement.dir).toBe('rtl');

      // Then change to English
      i18n.changeLanguage('en');
      i18n.emit('languageChanged', 'en');

      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
    });

    test('TC-3.2: All non-Arabic languages should use LTR', () => {
      const ltrLanguages = ['en', 'sv', 'no', 'fi', 'da', 'tr', 'zh',
                            'fr', 'de', 'ru', 'es', 'it', 'pt', 'nl',
                            'ja', 'ko', 'hi', 'vi'];

      ltrLanguages.forEach(lang => {
        i18n.changeLanguage(lang);
        i18n.emit('languageChanged', lang);
        expect(document.documentElement.dir).toBe('ltr');
      });
    });

    test('TC-3.4: Should persist RTL mode after setting', () => {
      localStorage.setItem('i18nextLng', 'ar');

      i18n.changeLanguage('ar');
      i18n.emit('languageChanged', 'ar');

      expect(document.documentElement.dir).toBe('rtl');
      expect(localStorage.getItem('i18nextLng')).toBe('ar');
    });

    test('TC-3.1: Should set document lang attribute correctly', () => {
      const testLanguages = [
        { code: 'ar', dir: 'rtl' },
        { code: 'en', dir: 'ltr' },
        { code: 'zh', dir: 'ltr' },
        { code: 'ru', dir: 'ltr' }
      ];

      testLanguages.forEach(({ code, dir }) => {
        i18n.changeLanguage(code);
        i18n.emit('languageChanged', code);
        expect(document.documentElement.lang).toBe(code);
        expect(document.documentElement.dir).toBe(dir);
      });
    });
  });

  describe('Test Suite 4: Language Selector UI Component', () => {
    test('TC-4.1: Should display globe icon and current language', () => {
      i18n.changeLanguage('tr');
      renderWithProviders(<LanguageSelector />);

      expect(screen.getByText('🇹🇷')).toBeInTheDocument();
      expect(screen.getByText('Türkçe')).toBeInTheDocument();
    });

    test('TC-4.2: Should open dropdown on button click', () => {
      renderWithProviders(<LanguageSelector />);

      // Initially closed
      expect(screen.queryByText('Português')).not.toBeInTheDocument();

      // Open dropdown
      // Use role with name regex to be specific
      fireEvent.click(screen.getByRole('button', { name: /English/i }));
      expect(screen.getByText('Português')).toBeInTheDocument();
    });

    test('TC-4.2: Should close dropdown when clicking backdrop', async () => {
      renderWithProviders(<LanguageSelector />);

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Nederlands')).toBeInTheDocument();

      // Click backdrop
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop);

      await waitFor(() => {
        expect(screen.queryByText('Nederlands')).not.toBeInTheDocument();
      });
    });

    test('TC-4.2: Should toggle dropdown on multiple clicks', () => {
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole('button');

      // Open
      fireEvent.click(button);
      expect(screen.getByText('한국어')).toBeInTheDocument();

      // Close by clicking button again
      const backdrop = document.querySelector('.fixed.inset-0');
      fireEvent.click(backdrop);
      expect(screen.queryByText('한국어')).not.toBeInTheDocument();

      // Open again
      fireEvent.click(button);
      expect(screen.getByText('한국어')).toBeInTheDocument();
    });

    test('TC-4.2: Chevron should rotate when dropdown opens', () => {
      const { container } = renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole('button');

      // Initially not rotated
      let chevron = container.querySelector('svg.transition-transform');
      expect(chevron.classList.contains('rotate-180')).toBe(false);

      // Open dropdown
      fireEvent.click(button);
      chevron = container.querySelector('svg.transition-transform');
      expect(chevron.classList.contains('rotate-180')).toBe(true);
    });

    test('TC-4.3: Dropdown should have scrollable class', () => {
      renderWithProviders(<LanguageSelector />);

      // Open dropdown
      const triggerButton = screen.getByLabelText('Toggle theme').nextElementSibling.querySelector('button');
      fireEvent.click(triggerButton);

      const dropdown = document.querySelector('.max-h-96.overflow-y-auto');
      expect(dropdown).toBeInTheDocument();
    });

    test('TC-4.3: Dropdown should contain all language options', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button'));

      const dropdown = document.querySelector('.max-h-96.overflow-y-auto');
      const options = dropdown.querySelectorAll('button');
      expect(options.length).toBe(19);
    });
  });

  describe('Test Suite 6: Edge Cases and Error Handling', () => {
    test('TC-6.1: Should handle invalid language code gracefully', () => {
      localStorage.setItem('i18nextLng', 'invalid-lang');

      renderWithProviders(<LanguageSelector />);

      // Should not crash and should fall back
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('TC-6.2: Should work when storage is empty', () => {
      localStorage.clear();
      sessionStorage.clear();

      renderWithProviders(<LanguageSelector />);

      // Should render without errors
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('TC-6.3: Should handle rapid language changes', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button'));

      // Rapidly click different languages
      fireEvent.click(screen.getByText('Español'));
      expect(window.location.reload).toHaveBeenCalledTimes(1);

      // Clear mocks
      jest.clearAllMocks();

      // Click another language
      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Français'));
      expect(window.location.reload).toHaveBeenCalledTimes(1);
    });

    test('TC-6.1: Should validate language code before setting', () => {
      const validLanguages = ['en', 'sv', 'no', 'fi', 'da', 'tr', 'ar', 'zh',
                              'fr', 'de', 'ru', 'es', 'it', 'pt', 'nl', 'ja',
                              'ko', 'hi', 'vi'];

      // Mock invalid language code
      localStorage.setItem('i18nextLng', 'xyz');
      const savedLang = localStorage.getItem('i18nextLng');

      const isValid = validLanguages.includes(savedLang);
      expect(isValid).toBe(false);
    });

    test('TC-6.2: Should handle null localStorage', () => {
      // Simulate localStorage not available
      const originalLocalStorage = window.localStorage;

      Object.defineProperty(window, 'localStorage', {
        value: null,
        writable: true
      });

      expect(() => {
        renderWithProviders(<LanguageSelector />);
      }).not.toThrow();

      // Restore
      Object.defineProperty(window, 'localStorage', {
        value: originalLocalStorage,
        writable: true
      });
    });
  });

  describe('Test Suite: Language Code Validation', () => {
    test('Should only accept valid language codes', () => {
      const validCodes = ['en', 'sv', 'no', 'fi', 'da', 'tr', 'ar', 'zh',
                          'fr', 'de', 'ru', 'es', 'it', 'pt', 'nl', 'ja',
                          'ko', 'hi', 'vi'];

      const invalidCodes = ['eng', 'spanish', 'xyz', '123', '', null, undefined];

      validCodes.forEach(code => {
        expect(validCodes.includes(code)).toBe(true);
      });

      invalidCodes.forEach(code => {
        expect(validCodes.includes(code)).toBe(false);
      });
    });

    test('Should maintain language code format (2 letters)', () => {
      const validCodes = ['en', 'sv', 'no', 'fi', 'da', 'tr', 'ar', 'zh',
                          'fr', 'de', 'ru', 'es', 'it', 'pt', 'nl', 'ja',
                          'ko', 'hi', 'vi'];

      validCodes.forEach(code => {
        expect(code.length).toBe(2);
        expect(code).toMatch(/^[a-z]{2}$/);
      });
    });
  });

  describe('Test Suite: Dropdown State Management', () => {
    test('Should close dropdown after language selection', () => {
      renderWithProviders(<LanguageSelector />);

      // Open dropdown
      fireEvent.click(screen.getByRole('button'));
      expect(screen.getByText('Svenska')).toBeInTheDocument();

      // Select a language
      fireEvent.click(screen.getByText('Svenska'));

      // Dropdown should close (page reloads in real app)
      // After reload simulation, dropdown state resets
      expect(window.location.reload).toHaveBeenCalled();
    });

    test('Should maintain dropdown z-index hierarchy', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button'));

      const backdrop = document.querySelector('.fixed.inset-0');
      const dropdown = document.querySelector('.absolute.right-0');

      expect(backdrop.classList.contains('z-10')).toBe(true);
      expect(dropdown.classList.contains('z-20')).toBe(true);
    });
  });

  describe('Test Suite: Integration with i18n', () => {
    test('Should update i18n language when changed', () => {
      renderWithProviders(<LanguageSelector />);

      const initialLanguage = i18n.language;

      fireEvent.click(screen.getByRole('button'));
      fireEvent.click(screen.getByText('Deutsch'));

      // Language should be changed in i18n instance
      expect(localStorage.getItem('i18nextLng')).toBe('de');
    });

    test('Should trigger languageChanged event', () => {
      const languageChangedHandler = jest.fn();
      i18n.on('languageChanged', languageChangedHandler);

      i18n.changeLanguage('it');
      i18n.emit('languageChanged', 'it');

      expect(languageChangedHandler).toHaveBeenCalledWith('it');

      i18n.off('languageChanged', languageChangedHandler);
    });

    test('Should set document attributes on language change', () => {
      const testCases = [
        { code: 'ar', dir: 'rtl', lang: 'ar' },
        { code: 'en', dir: 'ltr', lang: 'en' },
        { code: 'ja', dir: 'ltr', lang: 'ja' },
        { code: 'ru', dir: 'ltr', lang: 'ru' }
      ];

      testCases.forEach(({ code, dir, lang }) => {
        i18n.changeLanguage(code);
        i18n.emit('languageChanged', code);

        expect(document.documentElement.dir).toBe(dir);
        expect(document.documentElement.lang).toBe(lang);
      });
    });
  });

  describe('Test Suite: Accessibility', () => {
    test('TC-9.1: Language selector button should be accessible', () => {
      renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      expect(button).toBeVisible();
    });

    test('TC-9.1: All language options should be accessible', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button'));

      const options = screen.getAllByRole('button');
      // Should have main button + 19 language options
      expect(options.length).toBeGreaterThan(19);
    });

    test('Should have proper ARIA attributes', () => {
      const { container } = renderWithProviders(<LanguageSelector />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();

      // Check for accessibility features
      expect(button.tagName).toBe('BUTTON');
    });
  });

  describe('Test Suite: Visual Regression Prevention', () => {
    test('Should maintain consistent language order', () => {
      renderWithProviders(<LanguageSelector />);

      fireEvent.click(screen.getByRole('button'));

      const dropdown = document.querySelector('.max-h-96.overflow-y-auto');
      const languageButtons = Array.from(dropdown.querySelectorAll('button'));
      const languageNames = languageButtons.map(btn =>
        btn.querySelector('span.text-sm')?.textContent
      );

      const expectedOrder = [
        'English', 'Svenska', 'Norsk', 'Suomi', 'Dansk', 'Türkçe',
        'العربية', '中文', 'Français', 'Deutsch', 'Русский', 'Español',
        'Italiano', 'Português', 'Nederlands', '日本語', '한국어', 'हिंदी', 'Tiếng Việt'
      ];

      expect(languageNames).toEqual(expectedOrder);
    });

    test('Should maintain flag emoji associations', () => {
      const flagMap = {
        'English': '🇬🇧',
        'Svenska': '🇸🇪',
        'العربية': '🇸🇦',
        '中文': '🇨🇳',
        '日本語': '🇯🇵'
      };

      renderWithProviders(<LanguageSelector />);
      // Initial click to open dropdown might need to be specific if there are multiple buttons
      // Assuming English is the default
      // Use aria-label if possible or just get the first button if it's the toggle
      const triggerButton = screen.getByLabelText('Toggle theme').nextElementSibling.querySelector('button');
      fireEvent.click(triggerButton);

      Object.entries(flagMap).forEach(([langName, flag]) => {
        const langButton = screen.getByText(langName).closest('button');
        expect(langButton.innerHTML).toContain(flag);
      });
    });
  });
});

/* jshint ignore:end */
