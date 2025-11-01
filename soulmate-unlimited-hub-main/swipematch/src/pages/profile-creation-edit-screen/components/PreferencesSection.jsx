import React from 'react';
import Icon from '../../../components/AppIcon';

const PreferencesSection = ({ data, onChange, errors }) => {
  const handleRangeChange = (field, value, isMin = true) => {
    const currentRange = data[field] || [18, 35];
    const newRange = isMin 
      ? [parseInt(value), Math.max(parseInt(value), currentRange[1])]
      : [Math.min(currentRange[0], parseInt(value)), parseInt(value)];
    
    onChange({ [field]: newRange });
  };

  const handleSelectChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Dating Preferences
      </h2>

      <p className="text-sm font-body text-text-secondary mb-6">
        Set your preferences to help us find compatible matches for you.
      </p>

      <div className="space-y-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-body font-semibold text-text-primary mb-3">
            Age Range
          </label>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <label htmlFor="minAge" className="block text-xs font-caption text-text-secondary mb-1">
                  Minimum Age
                </label>
                <input
                  type="range"
                  id="minAge"
                  min="18"
                  max="65"
                  value={data.ageRange?.[0] || 18}
                  onChange={(e) => handleRangeChange('ageRange', e.target.value, true)}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center mt-1">
                  <span className="text-sm font-caption font-semibold text-primary">
                    {data.ageRange?.[0] || 18}
                  </span>
                </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="maxAge" className="block text-xs font-caption text-text-secondary mb-1">
                  Maximum Age
                </label>
                <input
                  type="range"
                  id="maxAge"
                  min="18"
                  max="65"
                  value={data.ageRange?.[1] || 35}
                  onChange={(e) => handleRangeChange('ageRange', e.target.value, false)}
                  className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="text-center mt-1">
                  <span className="text-sm font-caption font-semibold text-primary">
                    {data.ageRange?.[1] || 35}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="bg-background rounded-lg p-3 text-center">
              <span className="text-sm font-body text-text-primary">
                Looking for people aged {data.ageRange?.[0] || 18} to {data.ageRange?.[1] || 35}
              </span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <label htmlFor="distance" className="block text-sm font-body font-semibold text-text-primary mb-3">
            Maximum Distance
          </label>
          <div className="space-y-3">
            <input
              type="range"
              id="distance"
              min="1"
              max="100"
              value={data.distance || 25}
              onChange={(e) => handleSelectChange('distance', parseInt(e.target.value))}
              className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer slider"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs font-caption text-text-secondary">1 mile</span>
              <div className="bg-background rounded-lg px-3 py-1">
                <span className="text-sm font-body font-semibold text-primary">
                  {data.distance || 25} miles
                </span>
              </div>
              <span className="text-xs font-caption text-text-secondary">100+ miles</span>
            </div>
          </div>
        </div>

        {/* Gender Preference */}
        <div>
          <label className="block text-sm font-body font-semibold text-text-primary mb-3">
            Show Me
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: 'women', label: 'Women', icon: 'User' },
              { value: 'men', label: 'Men', icon: 'User' },
              { value: 'everyone', label: 'Everyone', icon: 'Users' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectChange('genderPreference', option.value)}
                className={`flex items-center justify-center space-x-2 p-3 rounded-lg border-2 transition-smooth ${
                  data.genderPreference === option.value
                    ? 'border-primary bg-primary/10 text-primary' :'border-border text-text-secondary hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Icon name={option.icon} size={20} />
                <span className="font-body font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Relationship Type */}
        <div>
          <label className="block text-sm font-body font-semibold text-text-primary mb-3">
            Looking For
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { value: 'casual', label: 'Something Casual', icon: 'Coffee' },
              { value: 'serious', label: 'Long-term Relationship', icon: 'Heart' },
              { value: 'friendship', label: 'New Friends', icon: 'Users' },
              { value: 'unsure', label: 'Not Sure Yet', icon: 'HelpCircle' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelectChange('relationshipType', option.value)}
                className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-smooth ${
                  data.relationshipType === option.value
                    ? 'border-primary bg-primary/10 text-primary' :'border-border text-text-secondary hover:border-primary/50 hover:text-primary'
                }`}
              >
                <Icon name={option.icon} size={20} />
                <span className="font-body font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {errors && (
        <p className="text-error text-sm font-body mt-4">{errors}</p>
      )}

      {/* Info */}
      <div className="mt-6 bg-accent/10 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Target" size={16} className="text-accent mt-0.5" />
          <div className="text-sm font-body text-text-secondary">
            <p>Your preferences help us show you the most compatible profiles. You can always change these settings later.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection;