import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PhotoVerification = ({ onVerificationStart }) => {
  const [showSteps, setShowSteps] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const verificationSteps = [
    {
      title: 'Take a selfie',
      description: 'Hold your phone at arm\'s length and look directly at the camera',
      icon: 'Camera',
      tip: 'Make sure your face is clearly visible and well-lit'
    },
    {
      title: 'Follow the pose',
      description: 'Copy the pose shown on screen exactly as demonstrated',
      icon: 'User',
      tip: 'This helps us verify it\'s really you taking the photo'
    },
    {
      title: 'Submit for review',
      description: 'Our team will review your verification within 24 hours',
      icon: 'Clock',
      tip: 'You\'ll get a notification once your verification is approved'
    }
  ];

  const handleStartVerification = () => {
    console.log('Starting photo verification process...');
    onVerificationStart();
  };

  const benefits = [
    'Get more matches with verified profiles',
    'Build trust with potential matches',
    'Stand out from unverified profiles',
    'Access to verified-only features'
  ];

  return (
    <div className="bg-gradient-to-br from-secondary/10 to-primary/10 rounded-2xl p-6 border border-secondary/20">
      <div className="flex items-start space-x-4 mb-4">
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center">
          <Icon name="ShieldCheck" size={24} color="white" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
            Verify Your Photos
          </h3>
          <p className="text-sm font-body text-text-secondary mb-4">
            Get a blue checkmark and increase your matches by up to 3x with photo verification.
          </p>
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-6">
        <h4 className="text-sm font-body font-semibold text-text-primary mb-3">
          Why verify your photos?
        </h4>
        <div className="space-y-2">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-3">
              <Icon name="Check" size={16} className="text-success flex-shrink-0" />
              <span className="text-sm font-body text-text-secondary">{benefit}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="w-full flex items-center justify-between p-3 bg-surface rounded-lg border border-border hover:border-primary/50 transition-smooth"
        >
          <span className="text-sm font-body font-medium text-text-primary">
            How does verification work?
          </span>
          <Icon 
            name={showSteps ? "ChevronUp" : "ChevronDown"} 
            size={16} 
            className="text-text-secondary" 
          />
        </button>

        {showSteps && (
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="space-y-4">
              {verificationSteps.map((step, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    index <= currentStep ? 'bg-primary text-white' : 'bg-border text-text-secondary'
                  }`}>
                    {index < currentStep ? (
                      <Icon name="Check" size={16} />
                    ) : (
                      <span className="text-sm font-caption font-semibold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h5 className="text-sm font-body font-semibold text-text-primary mb-1">
                      {step.title}
                    </h5>
                    <p className="text-xs font-body text-text-secondary mb-1">
                      {step.description}
                    </p>
                    <p className="text-xs font-caption text-primary">
                      💡 {step.tip}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          onClick={handleStartVerification}
          className="w-full bg-gradient-to-r from-secondary to-primary text-white font-body font-semibold py-3 px-4 rounded-lg hover:shadow-warm-md transition-smooth flex items-center justify-center space-x-2"
        >
          <Icon name="Camera" size={20} />
          <span>Start Verification</span>
        </button>
      </div>

      {/* Security Note */}
      <div className="mt-4 bg-surface/50 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Icon name="Shield" size={14} className="text-secondary mt-0.5 flex-shrink-0" />
          <p className="text-xs font-body text-text-secondary">
            Your verification photos are encrypted and only used for identity verification. 
            They won't be shown on your profile or shared with other users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PhotoVerification;