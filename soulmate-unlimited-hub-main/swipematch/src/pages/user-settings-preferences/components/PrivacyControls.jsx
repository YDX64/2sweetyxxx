import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PrivacyControls = () => {
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'everyone',
    showDistance: true,
    showAge: true,
    showOnlineStatus: true,
    allowLocationSharing: true,
    showReadReceipts: true,
    allowScreenshots: false,
    incognitoMode: false,
    showActiveStatus: true,
    allowProfileViews: true
  });

  const handleToggle = (key) => {
    setPrivacySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleVisibilityChange = (value) => {
    setPrivacySettings(prev => ({
      ...prev,
      profileVisibility: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Profile Visibility
        </h3>
        
        <div className="space-y-3">
          {[
            { 
              value: 'everyone', 
              label: 'Everyone', 
              description: 'Your profile is visible to all users',
              icon: 'Globe'
            },
            { 
              value: 'matches', 
              label: 'Matches Only', 
              description: 'Only people you\'ve matched with can see your profile',
              icon: 'Heart'
            },
            { 
              value: 'hidden', 
              label: 'Hidden', 
              description: 'Your profile won\'t appear in discovery',
              icon: 'EyeOff'
            }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleVisibilityChange(option.value)}
              className={`w-full flex items-start space-x-3 p-4 rounded-lg border-2 transition-smooth text-left ${
                privacySettings.profileVisibility === option.value
                  ? 'border-primary bg-primary/10' :'border-border bg-background hover:border-primary/50'
              }`}
            >
              <Icon 
                name={option.icon} 
                size={20} 
                className={privacySettings.profileVisibility === option.value ? 'text-primary' : 'text-text-secondary'} 
              />
              <div className="flex-1">
                <h4 className={`font-body font-semibold ${
                  privacySettings.profileVisibility === option.value ? 'text-primary' : 'text-text-primary'
                }`}>
                  {option.label}
                </h4>
                <p className="text-sm font-caption text-text-secondary mt-1">
                  {option.description}
                </p>
              </div>
              {privacySettings.profileVisibility === option.value && (
                <Icon name="Check" size={16} className="text-primary mt-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Information Display */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Information Display
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'showDistance', 
              label: 'Show Distance', 
              description: 'Display how far away you are from other users',
              icon: 'MapPin'
            },
            { 
              key: 'showAge', 
              label: 'Show Age', 
              description: 'Display your age on your profile',
              icon: 'Calendar'
            },
            { 
              key: 'showOnlineStatus', 
              label: 'Show Online Status', 
              description: 'Let others see when you\'re online',
              icon: 'Circle'
            },
            { 
              key: 'showActiveStatus', 
              label: 'Show Recently Active', 
              description: 'Show when you were last active on the app',
              icon: 'Clock'
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
                  privacySettings[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location & Data */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Location & Data
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'allowLocationSharing', 
              label: 'Location Sharing', 
              description: 'Allow the app to access your location for better matches',
              icon: 'Navigation'
            },
            { 
              key: 'allowProfileViews', 
              label: 'Profile Views', 
              description: 'Allow others to see that you\'ve viewed their profile',
              icon: 'Eye'
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
                  privacySettings[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Privacy */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Chat Privacy
        </h3>
        
        <div className="space-y-4">
          {[
            { 
              key: 'showReadReceipts', 
              label: 'Read Receipts', 
              description: 'Show when you\'ve read messages and see when others read yours',
              icon: 'CheckCheck'
            },
            { 
              key: 'allowScreenshots', 
              label: 'Allow Screenshots', 
              description: 'Allow others to take screenshots of your conversations',
              icon: 'Camera'
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
                  privacySettings[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Privacy */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Advanced Privacy
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <Icon name="UserX" size={20} className="text-text-secondary" />
              <div>
                <h4 className="font-body font-semibold text-text-primary">
                  Incognito Mode
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Browse profiles without them knowing you viewed them
                </p>
                <div className="flex items-center space-x-1 mt-1">
                  <Icon name="Crown" size={12} className="text-accent" />
                  <span className="text-xs font-caption text-accent">Premium Feature</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleToggle('incognitoMode')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                privacySettings.incognitoMode ? 'bg-primary' : 'bg-border'
              }`}
              disabled={!privacySettings.incognitoMode}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  privacySettings.incognitoMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Data Management
        </h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="Download" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Download My Data
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Get a copy of all your data
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="Trash2" size={20} className="text-error" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-error">
                  Clear All Data
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Permanently delete all your data
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PrivacyControls;