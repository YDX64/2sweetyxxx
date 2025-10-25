import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const AboutMeSection = ({ data, onChange, errors }) => {
  const [charCount, setCharCount] = useState(data?.length || 0);
  const maxChars = 500;

  const handleTextChange = (e) => {
    const text = e.target.value;
    if (text.length <= maxChars) {
      setCharCount(text.length);
      onChange(text);
    }
  };

  const suggestions = [
    "What makes you unique?",
    "What are you passionate about?",
    "What do you do for fun?",
    "What are you looking for?",
    "Describe your ideal weekend",
    "What's your favorite way to spend time?"
  ];

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <h2 className="text-lg font-heading font-semibold text-text-primary mb-4">
        About Me
      </h2>

      <div className="space-y-4">
        <div>
          <label htmlFor="aboutMe" className="block text-sm font-body font-semibold text-text-primary mb-2">
            Tell others about yourself
          </label>
          <textarea
            id="aboutMe"
            value={data || ''}
            onChange={handleTextChange}
            rows={6}
            className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body resize-none"
            placeholder="Write something that shows your personality and what makes you special..."
          />
          
          {/* Character Counter */}
          <div className="flex justify-between items-center mt-2">
            <span className={`text-sm font-caption ${
              charCount < 50 ? 'text-warning' : 'text-text-secondary'
            }`}>
              {charCount < 50 ? `${50 - charCount} more characters recommended` : 'Good length!'}
            </span>
            <span className={`text-sm font-caption ${
              charCount > maxChars * 0.9 ? 'text-warning' : 'text-text-secondary'
            }`}>
              {charCount}/{maxChars}
            </span>
          </div>
          
          {errors && (
            <p className="text-error text-sm font-body mt-1">{errors}</p>
          )}
        </div>

        {/* Writing Suggestions */}
        <div className="bg-background rounded-lg p-4">
          <div className="flex items-start space-x-3 mb-3">
            <Icon name="Lightbulb" size={16} className="text-accent mt-0.5" />
            <h3 className="text-sm font-body font-semibold text-text-primary">
              Writing prompts to get you started:
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => {
                  const currentText = data || '';
                  const newText = currentText ? `${currentText}\n\n${suggestion}` : suggestion;
                  if (newText.length <= maxChars) {
                    onChange(newText);
                    setCharCount(newText.length);
                  }
                }}
                className="text-left p-2 text-sm font-body text-text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-smooth"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-secondary/10 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="MessageCircle" size={16} className="text-secondary mt-0.5" />
            <div className="text-sm font-body text-text-secondary">
              <p className="mb-2 font-semibold text-text-primary">Tips for a great bio:</p>
              <ul className="space-y-1 text-xs">
                <li>• Be authentic and show your personality</li>
                <li>• Mention your hobbies and interests</li>
                <li>• Share what you're looking for</li>
                <li>• Keep it positive and engaging</li>
                <li>• Avoid negativity or deal-breakers</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutMeSection;