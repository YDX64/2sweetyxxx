import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const InterestsSection = ({ data, onChange, errors }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customInterest, setCustomInterest] = useState('');

  const availableInterests = [
    'Travel', 'Photography', 'Cooking', 'Music', 'Movies', 'Reading', 'Fitness', 'Yoga',
    'Hiking', 'Swimming', 'Dancing', 'Art', 'Gaming', 'Technology', 'Sports', 'Football',
    'Basketball', 'Tennis', 'Golf', 'Running', 'Cycling', 'Climbing', 'Skiing', 'Surfing',
    'Coffee', 'Wine', 'Beer', 'Cocktails', 'Restaurants', 'Food', 'Baking', 'Gardening',
    'Pets', 'Dogs', 'Cats', 'Nature', 'Outdoors', 'Camping', 'Fishing', 'Hunting',
    'Fashion', 'Shopping', 'Beauty', 'Makeup', 'Skincare', 'Meditation', 'Spirituality',
    'Volunteering', 'Charity', 'Politics', 'History', 'Science', 'Learning', 'Languages',
    'Writing', 'Blogging', 'Podcasts', 'Netflix', 'TV Shows', 'Theater', 'Concerts',
    'Festivals', 'Parties', 'Nightlife', 'Bars', 'Clubs', 'Board Games', 'Puzzles',
    'Crafts', 'DIY', 'Home Improvement', 'Interior Design', 'Architecture', 'Real Estate'
  ];

  const filteredInterests = availableInterests.filter(interest =>
    interest.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !data.includes(interest)
  );

  const handleInterestToggle = (interest) => {
    if (data.includes(interest)) {
      onChange(data.filter(item => item !== interest));
    } else if (data.length < 10) {
      onChange([...data, interest]);
    }
  };

  const handleCustomInterestAdd = () => {
    if (customInterest.trim() && !data.includes(customInterest.trim()) && data.length < 10) {
      onChange([...data, customInterest.trim()]);
      setCustomInterest('');
      setShowCustomInput(false);
    }
  };

  const handleRemoveInterest = (interest) => {
    onChange(data.filter(item => item !== interest));
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Interests
        </h2>
        <span className="text-sm font-caption text-text-secondary">
          {data.length}/10
        </span>
      </div>

      <p className="text-sm font-body text-text-secondary mb-4">
        Select interests that represent you. This helps us find better matches.
      </p>

      {/* Selected Interests */}
      {data.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-body font-semibold text-text-primary mb-3">
            Your Interests
          </h3>
          <div className="flex flex-wrap gap-2">
            {data.map((interest, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 bg-primary/10 text-primary px-3 py-2 rounded-full text-sm font-caption font-medium"
              >
                <span>{interest}</span>
                <button
                  onClick={() => handleRemoveInterest(interest)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-smooth"
                >
                  <Icon name="X" size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative mb-4">
        <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
          placeholder="Search interests..."
        />
      </div>

      {/* Available Interests */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
          {filteredInterests.slice(0, 20).map((interest, index) => (
            <button
              key={index}
              onClick={() => handleInterestToggle(interest)}
              disabled={data.length >= 10}
              className="px-3 py-2 border border-border rounded-full text-sm font-caption text-text-secondary hover:text-primary hover:border-primary hover:bg-primary/5 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Interest Input */}
      <div className="space-y-3">
        {!showCustomInput ? (
          <button
            onClick={() => setShowCustomInput(true)}
            disabled={data.length >= 10}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 font-body text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Icon name="Plus" size={16} />
            <span>Add custom interest</span>
          </button>
        ) : (
          <div className="flex space-x-2">
            <input
              type="text"
              value={customInterest}
              onChange={(e) => setCustomInterest(e.target.value)}
              className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body text-sm"
              placeholder="Enter custom interest"
              maxLength={30}
              onKeyPress={(e) => e.key === 'Enter' && handleCustomInterestAdd()}
            />
            <button
              onClick={handleCustomInterestAdd}
              disabled={!customInterest.trim()}
              className="px-3 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-smooth disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="Plus" size={16} />
            </button>
            <button
              onClick={() => {
                setShowCustomInput(false);
                setCustomInterest('');
              }}
              className="px-3 py-2 border border-border rounded-lg text-text-secondary hover:text-text-primary transition-smooth"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
      </div>

      {errors && (
        <p className="text-error text-sm font-body mt-4">{errors}</p>
      )}

      {/* Info */}
      <div className="mt-6 bg-background rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Heart" size={16} className="text-primary mt-0.5" />
          <div className="text-sm font-body text-text-secondary">
            <p>Choose interests that truly represent you. Quality matches are made when you're authentic about what you enjoy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsSection;