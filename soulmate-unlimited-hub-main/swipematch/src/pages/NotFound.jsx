import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';

const NotFound = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/login-register-screen');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="text-center max-w-md mx-auto">
        {/* 404 Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full mb-6 shadow-warm-lg">
            <Icon name="HeartOff" size={48} color="white" />
          </div>
          <h1 className="text-6xl font-heading font-bold text-text-primary mb-4">404</h1>
          <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary font-body mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleGoHome}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-3 px-6 rounded-lg hover:shadow-warm-md transition-smooth"
        >
          <Icon name="Home" size={20} />
          <span>Go to Home</span>
        </button>

        {/* Additional Links */}
        <div className="mt-8 space-y-2">
          <p className="text-text-secondary font-body text-sm">
            Need help? Contact our support team
          </p>
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={() => navigate('/login-register-screen')}
              className="text-primary hover:underline font-body text-sm"
            >
              Login
            </button>
            <span className="text-border">|</span>
            <button
              onClick={() => window.location.href = 'mailto:support@swipematch.com'}
              className="text-primary hover:underline font-body text-sm"
            >
              Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;