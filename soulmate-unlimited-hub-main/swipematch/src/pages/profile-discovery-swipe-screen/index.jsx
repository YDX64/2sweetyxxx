import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import BottomTabNavigation from '../../components/ui/BottomTabNavigation';

const ProfileDiscoverySwipeScreen = () => {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState(null);
  const [notifications, setNotifications] = useState(2);
  const constraintsRef = useRef(null);

  // Mock profile data
  const mockProfiles = [
    {
      id: 1,
      name: "Emma",
      age: 28,
      distance: 2.5,
      photos: [
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=600&fit=crop&crop=face"
      ],
      bio: "Adventure seeker, coffee enthusiast, and dog lover. Looking for someone to explore the city with!",
      interests: ["Travel", "Photography", "Hiking"],
      profession: "Marketing Manager",
      education: "MBA, Business Administration",
      verified: true
    },
    {
      id: 2,
      name: "Sarah",
      age: 25,
      distance: 1.8,
      photos: [
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=600&fit=crop&crop=face"
      ],
      bio: "Yoga instructor by day, foodie by night. Love trying new restaurants and cooking at home.",
      interests: ["Yoga", "Cooking", "Music"],
      profession: "Yoga Instructor",
      education: "Certified Yoga Teacher",
      verified: true
    },
    {
      id: 3,
      name: "Jessica",
      age: 30,
      distance: 3.2,
      photos: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=face"
      ],
      bio: "Artist and creative soul. I paint landscapes and love weekend gallery visits. Let\'s create something beautiful together!",
      interests: ["Art", "Museums", "Wine Tasting"],
      profession: "Graphic Designer",
      education: "BFA, Fine Arts",
      verified: false
    },
    {
      id: 4,
      name: "Amanda",
      age: 27,
      distance: 4.1,
      photos: [
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=600&fit=crop&crop=face"
      ],
      bio: "Fitness enthusiast and nutritionist. Believe in living a healthy, balanced lifestyle. Gym partner wanted!",
      interests: ["Fitness", "Nutrition", "Running"],
      profession: "Nutritionist",
      education: "MS, Nutrition Science",
      verified: true
    },
    {
      id: 5,
      name: "Rachel",
      age: 26,
      distance: 2.9,
      photos: [
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&h=600&fit=crop&crop=face",
        "https://images.unsplash.com/photo-1506863530036-1efeddceb993?w=400&h=600&fit=crop&crop=face"
      ],
      bio: "Book lover and aspiring writer. Spend my weekends in cozy cafes with a good novel. Looking for my co-author in life!",
      interests: ["Reading", "Writing", "Coffee"],
      profession: "Content Writer",
      education: "BA, English Literature",
      verified: true
    }
  ];

  useEffect(() => {
    // Simulate loading profiles
    setTimeout(() => {
      setProfiles(mockProfiles);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSwipe = (direction, profileId) => {
    if (direction === 'right') {
      // Simulate match (30% chance)
      const isMatch = Math.random() > 0.7;
      if (isMatch) {
        const profile = profiles.find(p => p.id === profileId);
        setMatchedProfile(profile);
        setShowMatch(true);
      }
    }
    
    // Move to next profile
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
    }, 300);
  };

  const handleAction = (action) => {
    if (currentIndex >= profiles.length) return;
    
    const currentProfile = profiles[currentIndex];
    
    switch (action) {
      case 'reject': handleSwipe('left', currentProfile.id);
        break;
      case 'like': handleSwipe('right', currentProfile.id);
        break;
      case 'superlike': handleSwipe('right', currentProfile.id);
        break;
      case 'boost': console.log('Boost profile');
        break;
      default:
        break;
    }
  };

  const handleMatchClose = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  const handleSendMessage = () => {
    navigate('/chat-messaging-screen');
  };

  const handleKeepSwiping = () => {
    setShowMatch(false);
    setMatchedProfile(null);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setCurrentIndex(0);
    setTimeout(() => {
      setProfiles([...mockProfiles]);
      setIsLoading(false);
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mb-4 animate-pulse">
            <Icon name="Heart" size={32} color="white" />
          </div>
          <p className="text-text-secondary font-body">Finding amazing people near you...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-surface border-b border-border z-header">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Icon name="Heart" size={20} color="white" />
            </div>
            <span className="text-xl font-heading font-semibold text-text-primary">
              SwipeMatch
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/user-settings-preferences')}
              className="relative p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-smooth"
              aria-label="Notifications"
            >
              <Icon name="Bell" size={24} />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 bg-error text-white text-xs font-caption font-medium rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {notifications}
                </span>
              )}
            </button>
            
            <button
              onClick={() => navigate('/profile-creation-edit-screen')}
              className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary"
            >
              <Image
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                alt="Your profile"
                className="w-full h-full object-cover"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4 max-w-2xl mx-auto">
        <div className="relative h-[calc(100vh-200px)] flex items-center justify-center" ref={constraintsRef}>
          {currentIndex >= profiles.length ? (
            // Empty State
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full flex items-center justify-center mb-6 mx-auto">
                <Icon name="Users" size={48} className="text-text-secondary" />
              </div>
              <h2 className="text-2xl font-heading font-semibold text-text-primary mb-4">
                No More Profiles
              </h2>
              <p className="text-text-secondary font-body mb-8 max-w-sm">
                You've seen everyone in your area! Check back later for new profiles or expand your search distance.
              </p>
              <button
                onClick={handleRefresh}
                className="bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-3 px-6 rounded-lg hover:shadow-warm-md transition-smooth"
              >
                Refresh Profiles
              </button>
            </div>
          ) : (
            // Profile Cards Stack
            <div className="relative w-full max-w-sm">
              {profiles.slice(currentIndex, currentIndex + 3).map((profile, index) => (
                <ProfileCard
                  key={profile.id}
                  profile={profile}
                  index={index}
                  isActive={index === 0}
                  onSwipe={handleSwipe}
                  constraintsRef={constraintsRef}
                />
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentIndex < profiles.length && (
          <div className="flex items-center justify-center space-x-4 mt-6">
            <button
              onClick={() => handleAction('reject')}
              className="w-14 h-14 bg-surface border-2 border-error text-error rounded-full flex items-center justify-center hover:bg-error hover:text-white transition-smooth shadow-warm-md"
              aria-label="Reject"
            >
              <Icon name="X" size={24} />
            </button>
            
            <button
              onClick={() => handleAction('superlike')}
              className="w-12 h-12 bg-surface border-2 border-accent text-accent rounded-full flex items-center justify-center hover:bg-accent hover:text-white transition-smooth shadow-warm-md"
              aria-label="Super Like"
            >
              <Icon name="Star" size={20} />
            </button>
            
            <button
              onClick={() => handleAction('like')}
              className="w-14 h-14 bg-surface border-2 border-success text-success rounded-full flex items-center justify-center hover:bg-success hover:text-white transition-smooth shadow-warm-md"
              aria-label="Like"
            >
              <Icon name="Heart" size={24} />
            </button>
            
            <button
              onClick={() => handleAction('boost')}
              className="w-12 h-12 bg-surface border-2 border-secondary text-secondary rounded-full flex items-center justify-center hover:bg-secondary hover:text-white transition-smooth shadow-warm-md"
              aria-label="Boost"
            >
              <Icon name="Zap" size={20} />
            </button>
          </div>
        )}
      </main>

      {/* Match Modal */}
      {showMatch && matchedProfile && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-modal p-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-surface rounded-2xl p-6 max-w-sm w-full text-center"
          >
            <div className="mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Heart" size={40} color="white" />
              </div>
              <h2 className="text-2xl font-heading font-bold text-text-primary mb-2">
                It's a Match!
              </h2>
              <p className="text-text-secondary font-body">
                You and {matchedProfile.name} liked each other
              </p>
            </div>

            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face"
                  alt="Your profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                <Icon name="Heart" size={16} color="white" />
              </div>
              <div className="w-16 h-16 rounded-full overflow-hidden">
                <Image
                  src={matchedProfile.photos[0]}
                  alt={matchedProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSendMessage}
                className="w-full bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-3 px-4 rounded-lg hover:shadow-warm-md transition-smooth"
              >
                Send Message
              </button>
              <button
                onClick={handleKeepSwiping}
                className="w-full bg-background text-text-primary font-body font-semibold py-3 px-4 rounded-lg hover:bg-border transition-smooth"
              >
                Keep Swiping
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <BottomTabNavigation />
    </div>
  );
};

// Profile Card Component
const ProfileCard = ({ profile, index, isActive, onSwipe, constraintsRef }) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-30, 30]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event, info) => {
    const threshold = 100;
    
    if (info.offset.x > threshold) {
      onSwipe('right', profile.id);
    } else if (info.offset.x < -threshold) {
      onSwipe('left', profile.id);
    }
  };

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === profile.photos.length - 1 ? 0 : prev + 1
    );
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => 
      prev === 0 ? profile.photos.length - 1 : prev - 1
    );
  };

  return (
    <motion.div
      className={`absolute inset-0 ${isActive ? 'z-30' : index === 1 ? 'z-20' : 'z-10'}`}
      style={{
        x: isActive ? x : 0,
        rotate: isActive ? rotate : 0,
        opacity: isActive ? opacity : 1,
        scale: isActive ? 1 : 0.95 - index * 0.05,
        y: index * 10,
      }}
      drag={isActive ? "x" : false}
      dragConstraints={constraintsRef}
      dragElastic={0.2}
      onDragEnd={handleDragEnd}
      whileTap={{ scale: 0.98 }}
    >
      <div className="w-full h-full bg-surface rounded-2xl shadow-warm-lg overflow-hidden">
        {/* Photo Section */}
        <div className="relative h-3/4">
          <Image
            src={profile.photos[currentPhotoIndex]}
            alt={profile.name}
            className="w-full h-full object-cover"
          />
          
          {/* Photo Navigation */}
          {profile.photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Icon name="ChevronLeft" size={16} />
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-black/30 text-white rounded-full flex items-center justify-center backdrop-blur-sm"
              >
                <Icon name="ChevronRight" size={16} />
              </button>
              
              {/* Photo Indicators */}
              <div className="absolute top-4 left-4 right-4 flex space-x-1">
                {profile.photos.map((_, photoIndex) => (
                  <div
                    key={photoIndex}
                    className={`flex-1 h-1 rounded-full ${
                      photoIndex === currentPhotoIndex ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Verified Badge */}
          {profile.verified && (
            <div className="absolute top-4 right-4 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Icon name="Check" size={16} color="white" />
            </div>
          )}

          {/* Swipe Overlays */}
          <motion.div
            className="absolute inset-0 bg-success/20 flex items-center justify-center"
            style={{ opacity: useTransform(x, [0, 100], [0, 1]) }}
          >
            <div className="bg-success text-white px-4 py-2 rounded-full font-heading font-bold text-lg">
              LIKE
            </div>
          </motion.div>
          
          <motion.div
            className="absolute inset-0 bg-error/20 flex items-center justify-center"
            style={{ opacity: useTransform(x, [-100, 0], [1, 0]) }}
          >
            <div className="bg-error text-white px-4 py-2 rounded-full font-heading font-bold text-lg">
              NOPE
            </div>
          </motion.div>
        </div>

        {/* Profile Info */}
        <div className="p-4 h-1/4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-heading font-semibold text-text-primary">
                {profile.name}, {profile.age}
              </h3>
              <div className="flex items-center space-x-1 text-text-secondary">
                <Icon name="MapPin" size={14} />
                <span className="text-sm font-caption">{profile.distance} km away</span>
              </div>
            </div>
            
            <p className="text-text-secondary font-body text-sm line-clamp-2 mb-2">
              {profile.bio}
            </p>
            
            <div className="flex items-center space-x-2">
              <span className="text-xs font-caption text-text-secondary">{profile.profession}</span>
              {profile.education && (
                <>
                  <span className="text-text-secondary">•</span>
                  <span className="text-xs font-caption text-text-secondary">{profile.education}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileDiscoverySwipeScreen;