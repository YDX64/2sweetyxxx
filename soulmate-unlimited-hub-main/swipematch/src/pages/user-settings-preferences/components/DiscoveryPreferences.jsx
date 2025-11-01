import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const DiscoveryPreferences = () => {
  const [preferences, setPreferences] = useState({
    ageRange: [22, 35],
    maxDistance: 25,
    genderPreference: ['women'],
    showMe: 'everyone',
    dealBreakers: {
      smoking: false,
      drinking: false,
      kids: false,
      pets: false
    }
  });

  const handleAgeRangeChange = (index, value) => {
    const newRange = [...preferences.ageRange];
    newRange[index] = parseInt(value);
    
    // Ensure min <= max
    if (index === 0 && newRange[0] > newRange[1]) {
      newRange[1] = newRange[0];
    } else if (index === 1 && newRange[1] < newRange[0]) {
      newRange[0] = newRange[1];
    }
    
    setPreferences(prev => ({
      ...prev,
      ageRange: newRange
    }));
  };

  const handleDistanceChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      maxDistance: parseInt(value)
    }));
  };

  const handleGenderToggle = (gender) => {
    setPreferences(prev => ({
      ...prev,
      genderPreference: prev.genderPreference.includes(gender)
        ? prev.genderPreference.filter(g => g !== gender)
        : [...prev.genderPreference, gender]
    }));
  };

  const handleShowMeChange = (value) => {
    setPreferences(prev => ({
      ...prev,
      showMe: value
    }));
  };

  const handleDealBreakerToggle = (key) => {
    setPreferences(prev => ({
      ...prev,
      dealBreakers: {
        ...prev.dealBreakers,
        [key]: !prev.dealBreakers[key]
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Age Range */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Age Range
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-text-secondary">
              {preferences.ageRange[0]} - {preferences.ageRange[1]} years old
            </span>
            <span className="text-sm font-caption text-text-secondary">
              18-65
            </span>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-caption text-text-secondary mb-2">
                Minimum Age: {preferences.ageRange[0]}
              </label>
              <input
                type="range"
                min="18"
                max="65"
                value={preferences.ageRange[0]}
                onChange={(e) => handleAgeRangeChange(0, e.target.value)}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>
            
            <div>
              <label className="block text-sm font-caption text-text-secondary mb-2">
                Maximum Age: {preferences.ageRange[1]}
              </label>
              <input
                type="range"
                min="18"
                max="65"
                value={preferences.ageRange[1]}
                onChange={(e) => handleAgeRangeChange(1, e.target.value)}
                className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Maximum Distance */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Maximum Distance
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-body text-text-secondary">
              Up to {preferences.maxDistance} miles away
            </span>
            <span className="text-sm font-caption text-text-secondary">
              1-100 miles
            </span>
          </div>
          
          <input
            type="range"
            min="1"
            max="100"
            value={preferences.maxDistance}
            onChange={(e) => handleDistanceChange(e.target.value)}
            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Gender Preferences */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Show Me
        </h3>
        
        <div className="space-y-3">
          {[
            { value: 'women', label: 'Women', icon: 'User' },
            { value: 'men', label: 'Men', icon: 'User' },
            { value: 'everyone', label: 'Everyone', icon: 'Users' }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => handleGenderToggle(option.value)}
              className={`w-full flex items-center space-x-3 p-4 rounded-lg border-2 transition-smooth ${
                preferences.genderPreference.includes(option.value) || 
                (option.value === 'everyone' && preferences.showMe === 'everyone')
                  ? 'border-primary bg-primary/10 text-primary' :'border-border bg-background text-text-secondary hover:border-primary/50'
              }`}
            >
              <Icon name={option.icon} size={20} />
              <span className="font-body font-medium">{option.label}</span>
              {(preferences.genderPreference.includes(option.value) || 
                (option.value === 'everyone' && preferences.showMe === 'everyone')) && (
                <Icon name="Check" size={16} className="ml-auto" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Deal Breakers */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
          Deal Breakers
        </h3>
        <p className="text-sm font-caption text-text-secondary mb-4">
          Don't show me people who have these preferences
        </p>
        
        <div className="space-y-3">
          {[
            { key: 'smoking', label: 'Smoking', icon: 'Cigarette' },
            { key: 'drinking', label: 'Heavy Drinking', icon: 'Wine' },
            { key: 'kids', label: 'Has Children', icon: 'Baby' },
            { key: 'pets', label: 'Has Pets', icon: 'Heart' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex items-center space-x-3">
                <Icon name={item.icon} size={20} className="text-text-secondary" />
                <span className="font-body text-text-primary">{item.label}</span>
              </div>
              <button
                onClick={() => handleDealBreakerToggle(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.dealBreakers[item.key] ? 'bg-error' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.dealBreakers[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Location Settings */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Location Settings
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="MapPin" size={20} className="text-text-secondary" />
              <div>
                <p className="font-body text-text-primary">Current Location</p>
                <p className="text-sm font-caption text-text-secondary">
                  San Francisco, CA
                </p>
              </div>
            </div>
            <button className="text-primary hover:text-primary/80 transition-smooth">
              <Icon name="Edit2" size={16} />
            </button>
          </div>
          
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Navigation" size={20} className="text-text-secondary" />
              <div>
                <p className="font-body text-text-primary">Auto-Update Location</p>
                <p className="text-sm font-caption text-text-secondary">
                  Update your location automatically
                </p>
              </div>
            </div>
            <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors">
              <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoveryPreferences;