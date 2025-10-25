import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const PremiumSubscription = ({ user }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');

  const premiumFeatures = [
    { icon: 'Heart', title: 'Unlimited Likes', description: 'Like as many profiles as you want' },
    { icon: 'Zap', title: 'Super Likes', description: 'Stand out with 5 Super Likes per day' },
    { icon: 'TrendingUp', title: 'Boost Profile', description: 'Be a top profile in your area for 30 minutes' },
    { icon: 'Eye', title: 'See Who Likes You', description: 'View all your likes before matching' },
    { icon: 'UserX', title: 'Incognito Mode', description: 'Browse profiles privately' },
    { icon: 'RotateCcw', title: 'Rewind', description: 'Undo your last swipe' },
    { icon: 'MapPin', title: 'Passport', description: 'Match with people anywhere in the world' },
    { icon: 'Crown', title: 'Priority Support', description: 'Get help faster with premium support' }
  ];

  const plans = [
    {
      id: 'monthly',
      name: 'Monthly',
      price: '$19.99',
      period: '/month',
      savings: null,
      popular: false
    },
    {
      id: 'quarterly',
      name: '3 Months',
      price: '$14.99',
      period: '/month',
      savings: 'Save 25%',
      popular: true
    },
    {
      id: 'yearly',
      name: '12 Months',
      price: '$9.99',
      period: '/month',
      savings: 'Save 50%',
      popular: false
    }
  ];

  const handleUpgrade = () => {
    console.log('Upgrading to premium with plan:', selectedPlan);
  };

  const handleManageBilling = () => {
    console.log('Opening billing management...');
  };

  const handleCancelSubscription = () => {
    console.log('Canceling subscription...');
  };

  if (user.isPremium) {
    return (
      <div className="space-y-6">
        {/* Current Subscription Status */}
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 rounded-xl p-6 border border-accent/30">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center">
              <Icon name="Crown" size={24} color="white" />
            </div>
            <div>
              <h3 className="text-lg font-heading font-semibold text-text-primary">
                Premium Member
              </h3>
              <p className="text-text-secondary font-body">
                You're enjoying all premium features
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-sm font-caption text-text-secondary">Current Plan</p>
              <p className="font-body font-semibold text-text-primary">Premium Monthly</p>
            </div>
            <div className="bg-surface/50 rounded-lg p-3">
              <p className="text-sm font-caption text-text-secondary">Next Billing</p>
              <p className="font-body font-semibold text-text-primary">Dec 15, 2024</p>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleManageBilling}
              className="flex-1 bg-surface text-text-primary font-body font-medium py-3 px-4 rounded-lg hover:bg-background transition-smooth"
            >
              Manage Billing
            </button>
            <button
              onClick={handleCancelSubscription}
              className="flex-1 bg-error/10 text-error font-body font-medium py-3 px-4 rounded-lg hover:bg-error/20 transition-smooth"
            >
              Cancel Plan
            </button>
          </div>
        </div>

        {/* Premium Features You're Using */}
        <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            Your Premium Features
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 bg-background rounded-lg">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name={feature.icon} size={20} className="text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-body font-semibold text-text-primary">
                    {feature.title}
                  </h4>
                  <p className="text-sm font-caption text-text-secondary">
                    {feature.description}
                  </p>
                </div>
                <Icon name="Check" size={16} className="text-success" />
              </div>
            ))}
          </div>
        </div>

        {/* Usage Statistics */}
        <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
          <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
            This Month's Usage
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl font-heading font-bold text-primary mb-1">47</div>
              <p className="text-sm font-caption text-text-secondary">Super Likes Used</p>
              <p className="text-xs font-caption text-text-secondary">of 150 available</p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg">
              <div className="text-2xl font-heading font-bold text-secondary mb-1">3</div>
              <p className="text-sm font-caption text-text-secondary">Boosts Used</p>
              <p className="text-xs font-caption text-text-secondary">of 5 available</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Premium Benefits */}
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Crown" size={32} color="white" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-text-secondary font-body">
            Get more matches and better dating experience
          </p>
        </div>
      </div>

      {/* Premium Features */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Premium Features
        </h3>
        
        <div className="space-y-4">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 p-4 bg-background rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name={feature.icon} size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-body font-semibold text-text-primary">
                  {feature.title}
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Choose Your Plan
        </h3>
        
        <div className="space-y-3 mb-6">
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan.id)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border-2 transition-smooth ${
                selectedPlan === plan.id
                  ? 'border-primary bg-primary/10' :'border-border bg-background hover:border-primary/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  selectedPlan === plan.id ? 'border-primary bg-primary' : 'border-border'
                }`}>
                  {selectedPlan === plan.id && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className={`font-body font-semibold ${
                      selectedPlan === plan.id ? 'text-primary' : 'text-text-primary'
                    }`}>
                      {plan.name}
                    </h4>
                    {plan.popular && (
                      <span className="bg-accent text-white text-xs font-caption font-medium px-2 py-1 rounded-full">
                        Most Popular
                      </span>
                    )}
                  </div>
                  {plan.savings && (
                    <p className="text-sm font-caption text-success">
                      {plan.savings}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-heading font-bold ${
                  selectedPlan === plan.id ? 'text-primary' : 'text-text-primary'
                }`}>
                  {plan.price}
                </div>
                <div className="text-sm font-caption text-text-secondary">
                  {plan.period}
                </div>
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={handleUpgrade}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-4 px-6 rounded-lg hover:shadow-warm-md transition-smooth"
        >
          Upgrade to Premium
        </button>
        
        <p className="text-xs font-caption text-text-secondary text-center mt-4">
          Cancel anytime. Terms and conditions apply.
        </p>
      </div>

      {/* Money Back Guarantee */}
      <div className="bg-success/10 border border-success/20 rounded-xl p-4">
        <div className="flex items-center space-x-3">
          <Icon name="Shield" size={20} className="text-success" />
          <div>
            <h4 className="font-body font-semibold text-success">
              30-Day Money Back Guarantee
            </h4>
            <p className="text-sm font-caption text-text-secondary">
              Not satisfied? Get a full refund within 30 days.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumSubscription;