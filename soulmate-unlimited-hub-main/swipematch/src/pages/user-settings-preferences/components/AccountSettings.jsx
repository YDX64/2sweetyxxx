import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const AccountSettings = ({ user }) => {
  const [notifications, setNotifications] = useState({
    matches: true,
    messages: true,
    promotional: false,
    emailUpdates: true,
    pushNotifications: true
  });

  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [tempEmail, setTempEmail] = useState(user.email);
  const [tempPhone, setTempPhone] = useState(user.phone);

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleEmailSave = () => {
    console.log('Updating email to:', tempEmail);
    setIsEditingEmail(false);
  };

  const handlePhoneSave = () => {
    console.log('Updating phone to:', tempPhone);
    setIsEditingPhone(false);
  };

  const handleChangePassword = () => {
    console.log('Opening change password dialog...');
  };

  return (
    <div className="space-y-6">
      {/* Profile Summary */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative">
            <Image
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-surface">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-heading font-semibold text-text-primary">
              {user.name}
            </h2>
            <p className="text-text-secondary font-body">
              Member since {user.joinDate}
            </p>
            {user.isPremium && (
              <div className="flex items-center space-x-1 mt-1">
                <Icon name="Crown" size={16} className="text-accent" />
                <span className="text-sm font-caption font-medium text-accent">
                  Premium Member
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Contact Information
        </h3>
        
        <div className="space-y-4">
          {/* Email */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <Icon name="Mail" size={20} className="text-text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-caption text-text-secondary">Email</p>
                {isEditingEmail ? (
                  <input
                    type="email"
                    value={tempEmail}
                    onChange={(e) => setTempEmail(e.target.value)}
                    className="w-full mt-1 px-0 py-1 border-0 border-b border-border bg-transparent focus:outline-none focus:border-primary font-body text-text-primary"
                    autoFocus
                  />
                ) : (
                  <p className="font-body text-text-primary">{user.email}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditingEmail ? (
                <>
                  <button
                    onClick={() => {
                      setTempEmail(user.email);
                      setIsEditingEmail(false);
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary transition-smooth"
                  >
                    <Icon name="X" size={16} />
                  </button>
                  <button
                    onClick={handleEmailSave}
                    className="p-2 text-success hover:text-success/80 transition-smooth"
                  >
                    <Icon name="Check" size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingEmail(true)}
                  className="p-2 text-text-secondary hover:text-primary transition-smooth"
                >
                  <Icon name="Edit2" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <Icon name="Phone" size={20} className="text-text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-caption text-text-secondary">Phone</p>
                {isEditingPhone ? (
                  <input
                    type="tel"
                    value={tempPhone}
                    onChange={(e) => setTempPhone(e.target.value)}
                    className="w-full mt-1 px-0 py-1 border-0 border-b border-border bg-transparent focus:outline-none focus:border-primary font-body text-text-primary"
                    autoFocus
                  />
                ) : (
                  <p className="font-body text-text-primary">{user.phone}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {isEditingPhone ? (
                <>
                  <button
                    onClick={() => {
                      setTempPhone(user.phone);
                      setIsEditingPhone(false);
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary transition-smooth"
                  >
                    <Icon name="X" size={16} />
                  </button>
                  <button
                    onClick={handlePhoneSave}
                    className="p-2 text-success hover:text-success/80 transition-smooth"
                  >
                    <Icon name="Check" size={16} />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditingPhone(true)}
                  className="p-2 text-text-secondary hover:text-primary transition-smooth"
                >
                  <Icon name="Edit2" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="flex items-center justify-between p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3">
              <Icon name="Lock" size={20} className="text-text-secondary" />
              <div>
                <p className="text-sm font-caption text-text-secondary">Password</p>
                <p className="font-body text-text-primary">••••••••</p>
              </div>
            </div>
            <button
              onClick={handleChangePassword}
              className="p-2 text-text-secondary hover:text-primary transition-smooth"
            >
              <Icon name="Edit2" size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Notification Preferences
        </h3>
        
        <div className="space-y-4">
          {[
            { key: 'matches', label: 'New Matches', description: 'Get notified when someone likes you back' },
            { key: 'messages', label: 'New Messages', description: 'Receive alerts for new chat messages' },
            { key: 'promotional', label: 'Promotional Offers', description: 'Special deals and feature updates' },
            { key: 'emailUpdates', label: 'Email Updates', description: 'Weekly summary and important updates' },
            { key: 'pushNotifications', label: 'Push Notifications', description: 'Real-time notifications on your device' }
          ].map((item) => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-background rounded-lg">
              <div className="flex-1">
                <h4 className="font-body font-semibold text-text-primary">
                  {item.label}
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  {item.description}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle(item.key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notifications[item.key] ? 'bg-primary' : 'bg-border'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notifications[item.key] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;