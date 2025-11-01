import React from 'react';
import Icon from '../../../components/AppIcon';

const EmptyState = ({ type, title, description, actionText, onAction }) => {
  const getIcon = () => {
    switch (type) {
      case 'search':
        return 'Search';
      case 'messages':
        return 'MessageCircle';
      case 'matches':
        return 'Heart';
      default:
        return 'MessageCircle';
    }
  };

  const getGradient = () => {
    switch (type) {
      case 'search':
        return 'from-secondary to-accent';
      case 'messages':
        return 'from-primary to-secondary';
      case 'matches':
        return 'from-primary to-accent';
      default:
        return 'from-primary to-secondary';
    }
  };

  return (
    <div className="text-center py-12 px-4">
      <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${getGradient()} rounded-full mb-6 shadow-warm-md`}>
        <Icon name={getIcon()} size={32} color="white" />
      </div>
      
      <h3 className="text-xl font-heading font-semibold text-text-primary mb-2">
        {title}
      </h3>
      
      <p className="text-text-secondary font-body mb-6 max-w-sm mx-auto">
        {description}
      </p>
      
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-3 px-6 rounded-lg hover:shadow-warm-md transition-smooth"
        >
          <span>{actionText}</span>
          <Icon name="ArrowRight" size={16} />
        </button>
      )}
    </div>
  );
};

export default EmptyState;