import React from 'react';
import Icon from '../../../components/AppIcon';

const SearchBar = ({ searchQuery, onSearchChange }) => {
  const handleClear = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon name="Search" size={20} className="text-text-secondary" />
      </div>
      
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search conversations..."
        className="w-full pl-10 pr-10 py-3 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth font-body"
      />
      
      {searchQuery && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-secondary hover:text-text-primary transition-smooth"
          aria-label="Clear search"
        >
          <Icon name="X" size={20} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;