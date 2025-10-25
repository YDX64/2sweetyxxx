import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const SafetyTools = () => {
  const [showBlockedUsers, setShowBlockedUsers] = useState(false);
  const [showReportHistory, setShowReportHistory] = useState(false);

  // Mock data
  const blockedUsers = [
    {
      id: 1,
      name: "John Smith",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
      blockedDate: "Nov 28, 2024"
    },
    {
      id: 2,
      name: "Mike Johnson",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face",
      blockedDate: "Nov 25, 2024"
    }
  ];

  const reportHistory = [
    {
      id: 1,
      type: "Inappropriate Content",
      reportedUser: "Anonymous User",
      date: "Nov 30, 2024",
      status: "Under Review",
      statusColor: "warning"
    },
    {
      id: 2,
      type: "Fake Profile",
      reportedUser: "Anonymous User",
      date: "Nov 22, 2024",
      status: "Resolved",
      statusColor: "success"
    }
  ];

  const safetyTips = [
    {
      icon: "Shield",
      title: "Meet in Public",
      description: "Always meet your matches in public places for the first few dates."
    },
    {
      icon: "Users",
      title: "Tell Someone",
      description: "Let a friend or family member know about your plans and location."
    },
    {
      icon: "Phone",
      title: "Keep Personal Info Private",
      description: "Don\'t share personal details like your address or workplace too early."
    },
    {
      icon: "AlertTriangle",
      title: "Trust Your Instincts",
      description: "If something feels off, don\'t hesitate to end the conversation or date."
    }
  ];

  const handleUnblockUser = (userId) => {
    console.log('Unblocking user:', userId);
  };

  const handleReportUser = () => {
    console.log('Opening report user dialog...');
  };

  const handleVerifyProfile = () => {
    console.log('Starting profile verification...');
  };

  return (
    <div className="space-y-6">
      {/* Verification Status */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Profile Verification
        </h3>
        
        <div className="flex items-center justify-between p-4 bg-success/10 border border-success/20 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-success rounded-full flex items-center justify-center">
              <Icon name="CheckCircle" size={24} color="white" />
            </div>
            <div>
              <h4 className="font-body font-semibold text-success">
                Profile Verified
              </h4>
              <p className="text-sm font-caption text-text-secondary">
                Your profile has been verified with photo ID
              </p>
            </div>
          </div>
          <Icon name="Shield" size={20} className="text-success" />
        </div>
        
        <div className="mt-4 p-4 bg-background rounded-lg">
          <div className="flex items-center space-x-3">
            <Icon name="Info" size={20} className="text-text-secondary" />
            <div>
              <p className="font-body text-text-primary">
                Verified profiles get 3x more matches
              </p>
              <p className="text-sm font-caption text-text-secondary">
                Show others you're genuine with the blue checkmark
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Safety Actions
        </h3>
        
        <div className="space-y-3">
          <button
            onClick={handleReportUser}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="Flag" size={20} className="text-error" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Report a User
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Report inappropriate behavior or content
                </p>
              </div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-text-secondary" />
          </button>
          
          <button
            onClick={() => setShowBlockedUsers(!showBlockedUsers)}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="UserX" size={20} className="text-warning" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Blocked Users
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  Manage your blocked users list ({blockedUsers.length})
                </p>
              </div>
            </div>
            <Icon 
              name={showBlockedUsers ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-text-secondary" 
            />
          </button>
          
          {showBlockedUsers && (
            <div className="ml-4 space-y-3">
              {blockedUsers.length > 0 ? (
                blockedUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-border/30 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={user.avatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <h5 className="font-body font-medium text-text-primary">
                          {user.name}
                        </h5>
                        <p className="text-sm font-caption text-text-secondary">
                          Blocked on {user.blockedDate}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleUnblockUser(user.id)}
                      className="text-primary hover:text-primary/80 font-caption font-medium text-sm"
                    >
                      Unblock
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary font-caption text-center py-4">
                  No blocked users
                </p>
              )}
            </div>
          )}
          
          <button
            onClick={() => setShowReportHistory(!showReportHistory)}
            className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth"
          >
            <div className="flex items-center space-x-3">
              <Icon name="FileText" size={20} className="text-text-secondary" />
              <div className="text-left">
                <h4 className="font-body font-semibold text-text-primary">
                  Report History
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  View your previous reports ({reportHistory.length})
                </p>
              </div>
            </div>
            <Icon 
              name={showReportHistory ? "ChevronUp" : "ChevronDown"} 
              size={16} 
              className="text-text-secondary" 
            />
          </button>
          
          {showReportHistory && (
            <div className="ml-4 space-y-3">
              {reportHistory.length > 0 ? (
                reportHistory.map((report) => (
                  <div key={report.id} className="p-3 bg-border/30 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-body font-medium text-text-primary">
                        {report.type}
                      </h5>
                      <span className={`text-xs font-caption font-medium px-2 py-1 rounded-full ${
                        report.statusColor === 'success' ?'bg-success/10 text-success'
                          : report.statusColor === 'warning' ?'bg-warning/10 text-warning' :'bg-text-secondary/10 text-text-secondary'
                      }`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm font-caption text-text-secondary">
                      Reported on {report.date}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-text-secondary font-caption text-center py-4">
                  No reports submitted
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Safety Tips */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Safety Tips
        </h3>
        
        <div className="space-y-4">
          {safetyTips.map((tip, index) => (
            <div key={index} className="flex items-start space-x-3 p-4 bg-background rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon name={tip.icon} size={20} className="text-primary" />
              </div>
              <div>
                <h4 className="font-body font-semibold text-text-primary mb-1">
                  {tip.title}
                </h4>
                <p className="text-sm font-caption text-text-secondary">
                  {tip.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Emergency Resources
        </h3>
        
        <div className="space-y-3">
          <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="Phone" size={20} className="text-error" />
              <h4 className="font-body font-semibold text-error">
                Emergency Services
              </h4>
            </div>
            <p className="text-sm font-caption text-text-secondary mb-2">
              If you're in immediate danger, call emergency services
            </p>
            <button className="bg-error text-white font-body font-medium py-2 px-4 rounded-lg hover:bg-error/90 transition-smooth">
              Call 911
            </button>
          </div>
          
          <div className="p-4 bg-background rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Icon name="MessageCircle" size={20} className="text-text-secondary" />
              <h4 className="font-body font-semibold text-text-primary">
                Crisis Text Line
              </h4>
            </div>
            <p className="text-sm font-caption text-text-secondary mb-2">
              Text HOME to 741741 for crisis support
            </p>
            <button className="bg-secondary text-white font-body font-medium py-2 px-4 rounded-lg hover:bg-secondary/90 transition-smooth">
              Learn More
            </button>
          </div>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-surface rounded-xl p-6 shadow-warm-sm">
        <h3 className="text-lg font-heading font-semibold text-text-primary mb-4">
          Community Guidelines
        </h3>
        
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="BookOpen" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Community Guidelines</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="Shield" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Safety Center</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
          
          <button className="w-full flex items-center justify-between p-4 bg-background rounded-lg hover:bg-border/50 transition-smooth">
            <div className="flex items-center space-x-3">
              <Icon name="HelpCircle" size={20} className="text-text-secondary" />
              <span className="font-body text-text-primary">Safety FAQ</span>
            </div>
            <Icon name="ExternalLink" size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafetyTools;