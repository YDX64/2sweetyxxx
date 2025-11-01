import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AppPreferences = () => {
  const [preferences, setPreferences] = useState({
    distanceUnit: 'miles',
    language: 'english',
    theme: 'auto',
    dataUsage: 'wifi',
    autoPlay: true,
    soundEffects: true,
    hapticFeedback: true,
    backgroundRefresh: true
  });

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const languages = [
    { code: 'english', name: 'English', flag: '🇺🇸' },
    { code: 'spanish', name: 'Español', flag: '🇪🇸' },
    { code: 'french', name: 'Français', flag: '🇫🇷' },
    { code: 'german', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'italian', name: 'Italiano', flag: '🇮🇹' },
    { code: 'portuguese', name: 'Português', flag: '🇵🇹' },
    { code: 'chinese', name: '中文', flag: '🇨🇳' },
    { code: 'japanese', name: '日本語', flag: '🇯🇵' }
  ];

  return (
    <div className="space-y-6">
      {/* Units & Measurements */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Units & Measurements
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-body font-semibold text-text-primary mb-3">
              Distance Unit
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'miles', label: 'Miles', description: 'Imperial system' },
                { value: 'kilometers', label: 'Kilometers', description: 'Metric system' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('distanceUnit', option.value)}
                  className={`p-4 rounded-lg border-2 transition-smooth text-left ${
                    preferences.distanceUnit === option.value
                      ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-text-secondary hover:border-primary/50'
                  }`}
                >
                  <div className="font-body font-semibold">
                    {option.label}
                  </div>
                  <div className="text-sm font-caption">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Language & Region
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-body font-semibold text-text-primary mb-3">
              App Language
            </h4>
            <div className="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handlePreferenceChange('language', lang.code)}
                  className={`flex items-center justify-between p-3 rounded-lg transition-smooth ${
                    preferences.language === lang.code
                      ? 'bg-primary/10 text-primary' :'bg-background text-text-primary hover:bg-border/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{lang.flag}</span>
                    <span className="font-body">{lang.name}</span>
                  </div>
                  {preferences.language === lang.code && (
                    <Icon name="Check" size={16} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Theme Settings */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Appearance
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-body font-semibold text-text-primary mb-3">
              Theme
            </h4>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: 'Sun' },
                { value: 'dark', label: 'Dark', icon: 'Moon' },
                { value: 'auto', label: 'Auto', icon: 'Smartphone' }
              ].map((theme) => (
                <button
                  key={theme.value}
                  onClick={() => handlePreferenceChange('theme', theme.value)}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 transition-smooth ${
                    preferences.theme === theme.value
                      ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-text-secondary hover:border-primary/50'
                  }`}
                >
                  <Icon name={theme.icon} size={24} className="mb-2" />
                  <span className="font-body font-medium text-sm">
                    {theme.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Data & Performance */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Data & Performance
        </h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-body font-semibold text-text-primary mb-3">
              Data Usage
            </h4>
            <div className="space-y-2">
              {[
                { 
                  value: 'always', 
                  label: 'Always Load Images', 
                  description: 'Use more data for best experience',
                  icon: 'Wifi'
                },
                { 
                  value: 'wifi', 
                  label: 'Wi-Fi Only', 
                  description: 'Save mobile data',
                  icon: 'WifiOff'
                },
                { 
                  value: 'never', 
                  label: 'Never Auto-Load', 
                  description: 'Minimal data usage',
                  icon: 'Download'
                }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => handlePreferenceChange('dataUsage', option.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-lg border transition-smooth ${
                    preferences.dataUsage === option.value
                      ? 'border-primary bg-primary/10' :'border-border bg-background hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon 
                      name={option.icon} 
                      size={20} 
                      className={preferences.dataUsage === option.value ? 'text-primary' : 'text-text-secondary'} 
                    />
                    <div className="text-left">
                      <h5 className={`font-body font-semibold ${
                        preferences.dataUsage === option.value ? 'text-primary' : 'text-text-primary'
                      }`}>
                        {option.label}
                      </h5>
                      <p className="text-sm font-caption text-text-secondary">
                        {option.description}
                      </p>
                    </div>
                  </div>
                  {preferences.dataUsage === option.value && (
                    <Icon name="Check" size={16} className="text-primary" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* App Behavior */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          App Behavior
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'autoPlay', 
              label: 'Auto-Play Videos', 
              description: 'Automatically play videos in profiles',
              icon: 'Play'
            },
            { 
              key: 'soundEffects', 
              label: 'Sound Effects', 
              description: 'Play sounds for swipes and matches',
              icon: 'Volume2'
            },
            { 
              key: 'hapticFeedback', 
              label: 'Haptic Feedback', 
              description: 'Vibrate on interactions (mobile only)',
              icon: 'Smartphone'
            },
            { 
              key: 'backgroundRefresh', 
              label: 'Background Refresh', 
              description: 'Update content when app is in background',
              icon: 'RefreshCw'
            }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex items-center space-x-3 flex-1">
                <Icon name={item.icon} size={20} className="text-text-secondary" />
                <div>
                  <h4 className="font-body font-semibold text-text-primary">
                    {item.label}
                  </h4>
                  <p className="text-sm font-caption text-text-secondary">
                    {item.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Storage & Cache */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Storage & Cache
        </h3>
        
        <div className="space-y-4">
          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-body font-semibold text-text-primary">
                Cache Size
              </h4>
              <span className="text-text-secondary font-caption">
                247 MB
              </span>
            </div>
            <p className="text-sm font-caption text-text-secondary mb-3">
              Cached images and data for faster loading
            </p>
            <button className="bg-warning text-white font-body font-medium py-2 px-4 rounded-lg hover:bg-warning/90 transition-smooth">
              Clear Cache
            </button>
          </div>
          
          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-body font-semibold text-text-primary">
                Downloaded Content
              </h4>
              <span className="text-text-secondary font-caption">
                1.2 GB
              </span>
            </div>
            <p className="text-sm font-caption text-text-secondary mb-3">
              Photos and videos saved for offline viewing
            </p>
            <button className="bg-error text-white font-body font-medium py-2 px-4 rounded-lg hover:bg-error/90 transition-smooth">
              Clear Downloads
            </button>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          App Information
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="font-body text-text-primary">Version</span>
            <span className="font-caption text-text-secondary">2.4.1</span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-background rounded-lg">
            <span className="font-body text-text-primary">Last Updated</span>
            <span className="font-caption text-text-secondary">Dec 1, 2024</span>
          </div>
          
          <button className="w-full flex items-center justify-between p-3 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <span className="font-body text-text-primary">Check for Updates</span>
            <Icon name="Download" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppPreferences;