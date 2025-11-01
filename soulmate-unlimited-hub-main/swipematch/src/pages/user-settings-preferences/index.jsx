import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';

// Components
import AccountSettings from './components/AccountSettings';
import DiscoveryPreferences from './components/DiscoveryPreferences';
import PrivacyControls from './components/PrivacyControls';
import PremiumSubscription from './components/PremiumSubscription';
import SafetyTools from './components/SafetyTools';
import AppPreferences from './components/AppPreferences';
import AccountActions from './components/AccountActions';

const UserSettingsPreferences = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('account');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);

  // Mock user data
  const currentUser = {
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    isPremium: true,
    isVerified: true,
    joinDate: "March 2024"
  };

  const navigationSections = [
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'discovery', label: 'Discovery', icon: 'Search' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield' },
    { id: 'premium', label: 'Premium', icon: 'Crown' },
    { id: 'safety', label: 'Safety', icon: 'AlertTriangle' },
    { id: 'app', label: 'App Settings', icon: 'Settings' },
    { id: 'actions', label: 'Account Actions', icon: 'MoreHorizontal' }
  ];

  const handleBack = () => {
    navigate('/profile-creation-edit-screen');
  };

  const handleLogout = () => {
    console.log('Logging out...');
    navigate('/login-register-screen');
    setShowLogoutDialog(false);
  };

  const handleDeleteAccount = () => {
    console.log('Deleting account...');
    navigate('/login-register-screen');
    setShowDeleteDialog(false);
  };

  const handleDeactivateAccount = () => {
    console.log('Deactivating account...');
    setShowDeactivateDialog(false);
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'account':
        return <AccountSettings user={currentUser} />;
      case 'discovery':
        return <DiscoveryPreferences />;
      case 'privacy':
        return <PrivacyControls />;
      case 'premium':
        return <PremiumSubscription user={currentUser} />;
      case 'safety':
        return <SafetyTools />;
      case 'app':
        return <AppPreferences />;
      case 'actions':
        return (
          <AccountActions
            onLogout={() => setShowLogoutDialog(true)}
            onDelete={() => setShowDeleteDialog(true)}
            onDeactivate={() => setShowDeactivateDialog(true)}
          />
        );
      default:
        return <AccountSettings user={currentUser} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-surface border-b border-border z-header">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
            aria-label="Go back"
          >
            <Icon name="ArrowLeft" size={24} />
          </button>
          
          <h1 className="text-lg font-heading font-semibold text-text-primary">
            Settings
          </h1>
          
          <div className="w-10"></div>
        </div>
      </header>

      {/* Desktop Layout */}
      <div className="md:flex md:pt-20">
        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-80 bg-surface border-r border-border min-h-screen">
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-8">
              <button
                onClick={handleBack}
                className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
                aria-label="Go back"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <h1 className="text-xl font-heading font-semibold text-text-primary">
                Settings & Preferences
              </h1>
            </div>

            {/* User Profile Summary */}
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <Image
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {currentUser.isVerified && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                      <Icon name="Check" size={12} color="white" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-semibold text-text-primary truncate">
                    {currentUser.name}
                  </h3>
                  <p className="text-sm font-caption text-text-secondary">
                    {currentUser.isPremium ? 'Premium Member' : 'Free Member'}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-smooth text-left ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                  }`}
                >
                  <Icon name={section.icon} size={20} />
                  <span className="font-body font-medium">{section.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 pt-16 md:pt-0">
          {/* Mobile Navigation Tabs */}
          <div className="md:hidden bg-surface border-b border-border sticky top-16 z-10">
            <div className="flex overflow-x-auto scrollbar-hide px-4 py-2">
              {navigationSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-4 py-2 rounded-lg mr-2 transition-smooth ${
                    activeSection === section.id
                      ? 'bg-primary/10 text-primary' :'text-text-secondary hover:text-text-primary hover:bg-background'
                  }`}
                >
                  <Icon name={section.icon} size={16} />
                  <span className="font-caption font-medium text-sm whitespace-nowrap">
                    {section.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="p-4 md:p-8 pb-24 md:pb-8">
            {renderActiveSection()}
          </div>
        </main>
      </div>

      {/* Confirmation Dialogs */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-modal">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="LogOut" size={32} className="text-warning" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                Sign Out
              </h3>
              <p className="text-text-secondary font-body">
                Are you sure you want to sign out of your account?
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutDialog(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-text-primary font-body font-medium hover:bg-background transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-3 bg-warning text-white rounded-lg font-body font-medium hover:bg-warning/90 transition-smooth"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-modal">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Trash2" size={32} className="text-error" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                Delete Account
              </h3>
              <p className="text-text-secondary font-body">
                This action cannot be undone. All your data, matches, and conversations will be permanently deleted.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-text-primary font-body font-medium hover:bg-background transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="flex-1 px-4 py-3 bg-error text-white rounded-lg font-body font-medium hover:bg-error/90 transition-smooth"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeactivateDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-modal">
          <div className="bg-surface rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="UserX" size={32} className="text-warning" />
              </div>
              <h3 className="text-lg font-heading font-semibold text-text-primary mb-2">
                Deactivate Profile
              </h3>
              <p className="text-text-secondary font-body">
                Your profile will be hidden from other users. You can reactivate it anytime by signing back in.
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowDeactivateDialog(false)}
                className="flex-1 px-4 py-3 border border-border rounded-lg text-text-primary font-body font-medium hover:bg-background transition-smooth"
              >
                Cancel
              </button>
              <button
                onClick={handleDeactivateAccount}
                className="flex-1 px-4 py-3 bg-warning text-white rounded-lg font-body font-medium hover:bg-warning/90 transition-smooth"
              >
                Deactivate
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomTabNavigation />
    </div>
  );
};

export default UserSettingsPreferences;