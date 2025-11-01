import React from 'react';
import Icon from '../../../components/AppIcon';

const ProgressIndicator = ({ progress }) => {
  const getProgressColor = () => {
    if (progress < 30) return 'bg-error';
    if (progress < 60) return 'bg-warning';
    if (progress < 90) return 'bg-accent';
    return 'bg-success';
  };

  const getProgressMessage = () => {
    if (progress < 30) return 'Just getting started';
    if (progress < 60) return 'Making good progress';
    if (progress < 90) return 'Almost complete';
    return 'Profile complete!';
  };

  const getProgressIcon = () => {
    if (progress < 30) return 'User';
    if (progress < 60) return 'UserCheck';
    if (progress < 90) return 'UserCheck2';
    return 'UserCheck';
  };

  return (
    <div className="bg-surface border-b border-border">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center space-x-4">
          {/* Progress Icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
            progress >= 90 ? 'bg-success' : 'bg-primary'
          }`}>
            <Icon name={getProgressIcon()} size={20} color="white" />
          </div>

          {/* Progress Info */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-body font-semibold text-text-primary">
                Profile Completion
              </h3>
              <span className="text-sm font-caption font-semibold text-primary">
                {progress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p className="text-xs font-caption text-text-secondary mt-1">
              {getProgressMessage()}
            </p>
          </div>

          {/* Completion Badge */}
          {progress >= 90 && (
            <div className="flex-shrink-0">
              <div className="flex items-center space-x-1 bg-success/10 text-success px-3 py-1 rounded-full">
                <Icon name="CheckCircle" size={14} />
                <span className="text-xs font-caption font-semibold">Complete</span>
              </div>
            </div>
          )}
        </div>

        {/* Progress Tips */}
        {progress < 90 && (
          <div className="mt-4 bg-background rounded-lg p-3">
            <div className="flex items-start space-x-2">
              <Icon name="Lightbulb" size={14} className="text-accent mt-0.5 flex-shrink-0" />
              <div className="text-xs font-body text-text-secondary">
                {progress < 30 && (
                  <p>Add more photos and fill out your basic information to improve your profile visibility.</p>
                )}
                {progress >= 30 && progress < 60 && (
                  <p>Complete your interests and preferences to get better match recommendations.</p>
                )}
                {progress >= 60 && progress < 90 && (
                  <p>Add more details and verify your photos to maximize your matching potential.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;