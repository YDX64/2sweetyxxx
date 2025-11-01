import React from 'react';
import Icon from '../../../components/AppIcon';

const AccountActions = ({ onLogout, onDelete, onDeactivate }) => {
  const handleContactSupport = () => {
    console.log('Opening support contact...');
  };

  const handleRateApp = () => {
    console.log('Opening app store for rating...');
  };

  const handleShareApp = () => {
    console.log('Opening share dialog...');
  };

  const handleFeedback = () => {
    console.log('Opening feedback form...');
  };

  return (
    <div className="space-y-6">
      {/* Support & Feedback */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Support & Feedback
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={handleContactSupport}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="MessageCircle" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Contact Support
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Get help with your account or app issues
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={handleFeedback}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="MessageSquare" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Send Feedback
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Share your thoughts and suggestions
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={handleRateApp}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Star" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Rate SwipeMatch
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Help others discover our app
                </p>
              </div>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={handleShareApp}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Share2" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Share SwipeMatch
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Invite friends to join the community
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Legal & Terms */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Legal & Terms
        </h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Terms of Service</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Privacy Policy</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="BookOpen" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Community Guidelines</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="Cookie" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Cookie Policy</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Account Actions */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Account Actions
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-warning/10 transition-smooth group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="LogOut" size={20} className="text-warning group-hover:text-warning" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-warning group-hover:text-warning">
                  Sign Out
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Sign out of your account
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={onDeactivate}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-warning/10 transition-smooth group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="UserX" size={20} className="text-warning group-hover:text-warning" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-warning group-hover:text-warning">
                  Deactivate Profile
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Hide your profile temporarily
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={onDelete}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-error/10 transition-smooth group"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Trash2" size={20} className="text-error group-hover:text-error" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-error group-hover:text-error">
                  Delete Account
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Permanently delete your account and data
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          About SwipeMatch
        </h3>
        
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center mx-auto">
            <Icon name="Heart" size={32} color="white" />
          </div>
          
          <div>
            <h4 className="text-xl font-heading font-semibold text-text-primary mb-1">
              SwipeMatch
            </h4>
            <p className="text-text-secondary font-body">
              Version 2.4.1
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-sm font-caption text-text-secondary mb-2">
              Made with ❤️ for meaningful connections
            </p>
            <p className="text-xs font-caption text-text-secondary">
              © {new Date().getFullYear()} SwipeMatch. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountActions;