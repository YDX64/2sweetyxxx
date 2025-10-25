import React from 'react';

const NotificationBadge = ({ 
  count = 0, 
  maxCount = 99, 
  size = 'md',
  color = 'error',
  className = '',
  showZero = false 
}) => {
  if (!showZero && count === 0) {
    return null;
  }

  const sizeClasses = {
    sm: 'min-w-[14px] h-[14px] text-xs px-1',
    md: 'min-w-[18px] h-[18px] text-xs px-1',
    lg: 'min-w-[20px] h-[20px] text-sm px-1.5'
  };

  const colorClasses = {
    error: 'bg-error text-white',
    warning: 'bg-warning text-white',
    success: 'bg-success text-white',
    primary: 'bg-primary text-white',
    secondary: 'bg-secondary text-white'
  };

  const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

  return (
    <span
      className={`
        inline-flex items-center justify-center
        font-caption font-medium
        rounded-full
        animate-scale-in
        ${sizeClasses[size]}
        ${colorClasses[color]}
        ${className}
      `}
      aria-label={`${count} notifications`}
    >
      {displayCount}
    </span>
  );
};

export default NotificationBadge;