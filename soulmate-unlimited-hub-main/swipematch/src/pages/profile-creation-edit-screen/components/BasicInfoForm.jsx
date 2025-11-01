import React from 'react';
import Icon from '../../../components/AppIcon';

const BasicInfoForm = ({ data, onChange, errors }) => {
  const handleInputChange = (field, value) => {
    onChange({ [field]: value });
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
        Basic Information
      </h2>

      <div className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Name *
          </label>
          <input
            type="text"
            id="name"
            value={data.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
            placeholder="Enter your name"
            maxLength={50}
          />
          {errors?.name && (
            <p className="text-error text-sm font-body mt-1">{errors.name}</p>
          )}
        </div>

        {/* Age */}
        <div>
          <label htmlFor="age" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Age *
          </label>
          <input
            type="number"
            id="age"
            value={data.age}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value))}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
            placeholder="Enter your age"
            min="18"
            max="100"
          />
          {errors?.age && (
            <p className="text-error text-sm font-body mt-1">{errors.age}</p>
          )}
        </div>

        {/* Occupation */}
        <div>
          <label htmlFor="occupation" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Occupation *
          </label>
          <input
            type="text"
            id="occupation"
            value={data.occupation}
            onChange={(e) => handleInputChange('occupation', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
            placeholder="What do you do for work?"
            maxLength={100}
          />
          {errors?.occupation && (
            <p className="text-error text-sm font-body mt-1">{errors.occupation}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Company
          </label>
          <input
            type="text"
            id="company"
            value={data.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
            placeholder="Where do you work?"
            maxLength={100}
          />
        </div>

        {/* Education */}
        <div>
          <label htmlFor="education" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Education
          </label>
          <select
            id="education"
            value={data.education}
            onChange={(e) => handleInputChange('education', e.target.value)}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body bg-surface"
          >
            <option value="">Select education level</option>
            <option value="High School">High School</option>
            <option value="Some College">Some College</option>
            <option value="Associate's Degree">Associate's Degree</option>
            <option value="Bachelor's Degree">Bachelor's Degree</option>
            <option value="Master's Degree">Master's Degree</option>
            <option value="Doctorate">Doctorate</option>
            <option value="Trade School">Trade School</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-background rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={16} className="text-secondary mt-0.5" />
          <div className="text-sm font-body text-text-secondary">
            <p>Your information is secure and will only be shown to potential matches according to your privacy settings.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoForm;