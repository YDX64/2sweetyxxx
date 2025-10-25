import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BottomTabNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const tabs = [
    {
      id: 'discover',
      label: 'Discover',
      icon: 'Heart',
      path: '/profile-discovery-swipe-screen',
      badgeCount: 0
    },
    {
      id: 'matches',
      label: 'Matches',
      icon: 'MessageCircle',
      path: '/matches-conversations-list',
      badgeCount: 3
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: 'User',
      path: '/profile-creation-edit-screen',
      badgeCount: 0
    }
  ];

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  const isActiveTab = (tabPath) => {
    return location.pathname === tabPath || 
           (tabPath === '/profile-creation-edit-screen' && location.pathname === '/user-settings-preferences');
  };

  // Don't show navigation on login/register or chat screens
  if (location.pathname === '/login-register-screen' || location.pathname === '/chat-messaging-screen') {
    return null;
  }

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border z-navigation md:hidden">
        <div className="flex items-center justify-around px-4 py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab)}
              className={`relative flex flex-col items-center justify-center min-h-touch px-3 py-2 rounded-lg transition-smooth ${
                isActiveTab(tab.path)
                  ? 'text-primary bg-primary/10' :'text-text-secondary hover:text-text-primary hover:bg-surface'
              }`}
              aria-label={tab.label}
            >
              <div className="relative">
                <Icon
                  name={tab.icon}
                  size={24}
                  className="mb-1"
                />
                {tab.badgeCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-error text-white text-xs font-caption font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 z-notification animate-scale-in">
                    {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-caption font-medium">
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </nav>

      {/* Desktop Top Navigation */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-surface border-b border-border z-navigation">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="Heart" size={20} color="white" />
              </div>
              <span className="text-xl font-heading font-semibold text-text-primary">
                DateConnect
              </span>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab)}
                  className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg transition-smooth ${
                    isActiveTab(tab.path)
                      ? 'text-primary bg-primary/10' :'text-text-secondary hover:text-text-primary hover:bg-background'
                  }`}
                  aria-label={tab.label}
                >
                  <div className="relative">
                    <Icon
                      name={tab.icon}
                      size={20}
                    />
                    {tab.badgeCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-error text-white text-xs font-caption font-medium rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1 z-notification animate-scale-in">
                        {tab.badgeCount > 99 ? '99+' : tab.badgeCount}
                      </span>
                    )}
                  </div>
                  <span className="font-body font-medium">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Settings Access */}
            <button
              onClick={() => navigate('/user-settings-preferences')}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
              aria-label="Settings"
            >
              <Icon name="Settings" size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Content Spacer for Fixed Navigation */}
      <div className="h-20 md:h-0"></div>
      <div className="hidden md:block h-20"></div>
    </>
  );
};

export default BottomTabNavigation;