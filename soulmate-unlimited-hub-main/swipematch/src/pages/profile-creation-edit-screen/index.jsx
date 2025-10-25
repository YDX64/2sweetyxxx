import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';

import PhotoUploadGrid from './components/PhotoUploadGrid';
import BasicInfoForm from './components/BasicInfoForm';
import AboutMeSection from './components/AboutMeSection';
import InterestsSection from './components/InterestsSection';
import PreferencesSection from './components/PreferencesSection';
import AdvancedSettings from './components/AdvancedSettings';
import PhotoVerification from './components/PhotoVerification';
import ProgressIndicator from './components/ProgressIndicator';

const ProfileCreationEditScreen = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    photos: [
      { id: 1, url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop', isPrimary: true },
      { id: 2, url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=600&fit=crop', isPrimary: false },
      { id: 3, url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=600&fit=crop', isPrimary: false },
      null, null, null
    ],
    basicInfo: {
      name: 'Alex Johnson',
      age: 28,
      occupation: 'Software Engineer',
      education: 'Bachelor\'s in Computer Science',
      company: 'Tech Solutions Inc.'
    },
    aboutMe: `I'm a passionate software engineer who loves building innovative solutions and exploring new technologies. When I'm not coding, you'll find me hiking mountain trails, trying new coffee shops, or planning my next travel adventure.

I believe in living life to the fullest and making meaningful connections with people who share similar values and interests.`,
    interests: [
      'Technology', 'Hiking', 'Coffee', 'Travel', 'Photography', 'Cooking', 'Music', 'Reading', 'Fitness', 'Movies'
    ],
    preferences: {
      ageRange: [22, 35],
      distance: 25,
      genderPreference: 'women',relationshipType: 'serious'
    },
    advanced: {
      height: '5\'10"',
      religion: 'Agnostic',
      smoking: 'Never',
      drinking: 'Socially',
      exercise: 'Regularly',
      pets: 'Love dogs',
      children: 'Want someday'
    },
    isVerified: false
  });

  const [errors, setErrors] = useState({});

  const handleSave = async () => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      console.log('Profile saved:', profileData);
      setIsLoading(false);
      navigate('/profile-discovery-swipe-screen');
    }, 2000);
  };

  const handleBack = () => {
    navigate('/profile-discovery-swipe-screen');
  };

  const updateProfileData = (section, data) => {
    setProfileData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const calculateProgress = () => {
    let completed = 0;
    let total = 7;

    // Photos (at least 2)
    if (profileData.photos.filter(photo => photo !== null).length >= 2) completed++;
    
    // Basic info
    if (profileData.basicInfo.name && profileData.basicInfo.age && profileData.basicInfo.occupation) completed++;
    
    // About me
    if (profileData.aboutMe && profileData.aboutMe.length >= 50) completed++;
    
    // Interests (at least 3)
    if (profileData.interests.length >= 3) completed++;
    
    // Preferences
    if (profileData.preferences.ageRange && profileData.preferences.distance) completed++;
    
    // Advanced settings (at least 3 filled)
    const advancedFilled = Object.values(profileData.advanced).filter(val => val && val !== '').length;
    if (advancedFilled >= 3) completed++;
    
    // Verification
    if (profileData.isVerified) completed++;

    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 bg-surface border-b border-border z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background transition-smooth"
            aria-label="Go back"
          >
            <Icon name="ArrowLeft" size={24} />
          </button>
          
          <h1 className="text-xl font-heading font-semibold text-text-primary">
            Edit Profile
          </h1>
          
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold px-6 py-2 rounded-lg hover:shadow-warm-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : (
              <span>Save</span>
            )}
          </button>
        </div>
      </header>

      {/* Progress Indicator */}
      <ProgressIndicator progress={calculateProgress()} />

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Photos */}
          <div className="space-y-6">
            <PhotoUploadGrid
              photos={profileData.photos}
              onPhotosChange={(photos) => updateProfileData('photos', photos)}
              errors={errors.photos}
            />
            
            {!profileData.isVerified && (
              <PhotoVerification
                onVerificationStart={() => setShowVerification(true)}
              />
            )}
          </div>

          {/* Right Column - Form Sections */}
          <div className="space-y-6">
            <BasicInfoForm
              data={profileData.basicInfo}
              onChange={(data) => updateProfileData('basicInfo', data)}
              errors={errors.basicInfo}
            />

            <AboutMeSection
              data={profileData.aboutMe}
              onChange={(data) => setProfileData(prev => ({ ...prev, aboutMe: data }))}
              errors={errors.aboutMe}
            />

            <InterestsSection
              data={profileData.interests}
              onChange={(data) => setProfileData(prev => ({ ...prev, interests: data }))}
              errors={errors.interests}
            />

            <PreferencesSection
              data={profileData.preferences}
              onChange={(data) => updateProfileData('preferences', data)}
              errors={errors.preferences}
            />

            <AdvancedSettings
              data={profileData.advanced}
              onChange={(data) => updateProfileData('advanced', data)}
              errors={errors.advanced}
            />
          </div>
        </div>
      </div>

      {/* Mobile Save Button */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-4">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-primary to-secondary text-white font-body font-semibold py-3 px-4 rounded-lg hover:shadow-warm-md transition-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving Profile...</span>
            </>
          ) : (
            <span>Save Profile</span>
          )}
        </button>
      </div>

      {/* Bottom Spacer for Mobile */}
      <div className="h-20 lg:h-0"></div>
    </div>
  );
};

export default ProfileCreationEditScreen;