import React from 'react';
import Icon from '../../../components/AppIcon';

const AdvancedSettings = ({ data, onChange, errors }) => {
  const handleSelectChange = (field, value) => {
    onChange({ [field]: value });
  };

  const settings = [
    {
      key: 'height',
      label: 'Height',
      icon: 'Ruler',
      type: 'select',
      options: [
        { value: '', label: 'Select height' },
        { value: '4\'10"', label: '4\'10" (147 cm)' },
        { value: '4\'11"', label: '4\'11" (150 cm)' },
        { value: '5\'0"', label: '5\'0" (152 cm)' },
        { value: '5\'1"', label: '5\'1" (155 cm)' },
        { value: '5\'2"', label: '5\'2" (157 cm)' },
        { value: '5\'3"', label: '5\'3" (160 cm)' },
        { value: '5\'4"', label: '5\'4" (163 cm)' },
        { value: '5\'5"', label: '5\'5" (165 cm)' },
        { value: '5\'6"', label: '5\'6" (168 cm)' },
        { value: '5\'7"', label: '5\'7" (170 cm)' },
        { value: '5\'8"', label: '5\'8" (173 cm)' },
        { value: '5\'9"', label: '5\'9" (175 cm)' },
        { value: '5\'10"', label: '5\'10" (178 cm)' },
        { value: '5\'11"', label: '5\'11" (180 cm)' },
        { value: '6\'0"', label: '6\'0" (183 cm)' },
        { value: '6\'1"', label: '6\'1" (185 cm)' },
        { value: '6\'2"', label: '6\'2" (188 cm)' },
        { value: '6\'3"', label: '6\'3" (191 cm)' },
        { value: '6\'4"', label: '6\'4" (193 cm)' },
        { value: '6\'5"', label: '6\'5" (196 cm)' },
        { value: '6\'6"+', label: '6\'6"+ (198+ cm)' }
      ]
    },
    {
      key: 'religion',
      label: 'Religion',
      icon: 'Church',
      type: 'select',
      options: [
        { value: '', label: 'Select religion' },
        { value: 'Agnostic', label: 'Agnostic' },
        { value: 'Atheist', label: 'Atheist' },
        { value: 'Buddhist', label: 'Buddhist' },
        { value: 'Catholic', label: 'Catholic' },
        { value: 'Christian', label: 'Christian' },
        { value: 'Hindu', label: 'Hindu' },
        { value: 'Jewish', label: 'Jewish' },
        { value: 'Muslim', label: 'Muslim' },
        { value: 'Spiritual', label: 'Spiritual' },
        { value: 'Other', label: 'Other' },
        { value: 'Prefer not to say', label: 'Prefer not to say' }
      ]
    },
    {
      key: 'smoking',
      label: 'Smoking',
      icon: 'Cigarette',
      type: 'select',
      options: [
        { value: '', label: 'Select smoking preference' },
        { value: 'Never', label: 'Never' },
        { value: 'Socially', label: 'Socially' },
        { value: 'Regularly', label: 'Regularly' },
        { value: 'Trying to quit', label: 'Trying to quit' }
      ]
    },
    {
      key: 'drinking',
      label: 'Drinking',
      icon: 'Wine',
      type: 'select',
      options: [
        { value: '', label: 'Select drinking preference' },
        { value: 'Never', label: 'Never' },
        { value: 'Rarely', label: 'Rarely' },
        { value: 'Socially', label: 'Socially' },
        { value: 'Regularly', label: 'Regularly' }
      ]
    },
    {
      key: 'exercise',
      label: 'Exercise',
      icon: 'Dumbbell',
      type: 'select',
      options: [
        { value: '', label: 'Select exercise frequency' },
        { value: 'Never', label: 'Never' },
        { value: 'Rarely', label: 'Rarely' },
        { value: 'Sometimes', label: 'Sometimes' },
        { value: 'Regularly', label: 'Regularly' },
        { value: 'Daily', label: 'Daily' }
      ]
    },
    {
      key: 'pets',
      label: 'Pets',
      icon: 'Heart',
      type: 'select',
      options: [
        { value: '', label: 'Select pet preference' },
        { value: 'Love dogs', label: 'Love dogs' },
        { value: 'Love cats', label: 'Love cats' },
        { value: 'Love all pets', label: 'Love all pets' },
        { value: 'Have pets', label: 'Have pets' },
        { value: 'Allergic to pets', label: 'Allergic to pets' },
        { value: 'No pets', label: 'No pets' }
      ]
    },
    {
      key: 'children',
      label: 'Children',
      icon: 'Baby',
      type: 'select',
      options: [
        { value: '', label: 'Select children preference' },
        { value: 'Want someday', label: 'Want someday' },
        { value: 'Don\'t want', label: 'Don\'t want' },
        { value: 'Have and want more', label: 'Have and want more' },
        { value: 'Have and don\'t want more', label: 'Have and don\'t want more' },
        { value: 'Not sure', label: 'Not sure' }
      ]
    }
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Additional Details
      </h2>

      <p className="text-sm font-body text-text-secondary mb-6">
        Share more about yourself to help find compatible matches. All fields are optional.
      </p>

      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.key}>
            <label htmlFor={setting.key} className="flex items-center space-x-2 text-sm font-body font-semibold text-text-primary mb-2">
              <Icon name={setting.icon} size={16} />
              <span>{setting.label}</span>
            </label>
            
            <select
              id={setting.key}
              value={data[setting.key] || ''}
              onChange={(e) => handleSelectChange(setting.key, e.target.value)}
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body bg-surface"
            >
              {setting.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {errors && (
        <p className="text-error text-sm font-body mt-4">{errors}</p>
      )}

      {/* Privacy Note */}
      <div className="mt-6 bg-background rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Lock" size={16} className="text-secondary mt-0.5" />
          <div className="text-sm font-body text-text-secondary">
            <p className="mb-2 font-semibold text-text-primary">Privacy & Control</p>
            <ul className="space-y-1 text-xs">
              <li>• You can choose which details to display on your profile</li>
              <li>• These preferences help improve match compatibility</li>
              <li>• You can update or remove any information anytime</li>
              <li>• Some details may be used for better matching algorithms</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Completion Status */}
      <div className="mt-4 bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Icon name="CheckCircle" size={16} className="text-primary" />
            <span className="text-sm font-body font-semibold text-text-primary">
              Profile Completeness
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm font-caption text-text-secondary">
              {Object.values(data).filter(val => val && val !== '').length} of {settings.length} completed
            </div>
            <div className="text-xs font-caption text-primary">
              More details = better matches
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSettings;