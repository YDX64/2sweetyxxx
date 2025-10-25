import { AuthForm } from "@/components/AuthForm";
import { LandingPage } from "@/components/LandingPage";
import { AppNavigation } from "@/components/AppNavigation";
import { LocationPermission } from "@/components/LocationPermission";
import { ProfileCompletionView } from "@/components/profile/ProfileCompletionView";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { useAppState } from "@/hooks/useAppState";
import { useLanguage } from "@/hooks/useLanguage";
import { ExtendedProfile } from "@/types/profile";
import { isAdminUser, isModeratorUser } from "@/services/permissionService";
import { useEffect, useState } from "react";

const Index = () => {
  const { t } = useLanguage();
  const {
    user,
    userProfile,
    authLoading,
    profileLoading,
    showAuth,
    setShowAuth,
    showLocationPermission,
    handleLocationPermissionGranted,
    handleSkipLocation
  } = useAppState();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  // Listen for auth form show event
  useEffect(() => {
    const handleShowAuth = (event: CustomEvent) => {
      setShowAuth(true);
    };

    const handleAuthModeChange = (event: CustomEvent) => {
      if (event.detail?.mode) {
        setAuthMode(event.detail.mode);
      }
    };

    // Type-safe event listeners
    window.addEventListener('showAuth', handleShowAuth as EventListener);
    window.addEventListener('authModeChange', handleAuthModeChange as EventListener);
    
    return () => {
      window.removeEventListener('showAuth', handleShowAuth as EventListener);
      window.removeEventListener('authModeChange', handleAuthModeChange as EventListener);
    };
  }, [setShowAuth]);

  // Auth veya profile loading durumu - tek loading göster
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-700 dark:text-gray-200">{t('loading')}</div>
      </div>
    );
  }

  // Kullanıcı giriş yapmamış
  if (!user) {
    if (showAuth) {
      return <AuthForm defaultMode={authMode} />;
    }
    return (
      <LandingPage 
        onGetStarted={() => {
          setAuthMode('signup');
          setShowAuth(true);
        }} 
        onLoginClick={() => {
          setAuthMode('login');
          setShowAuth(true);
        }}
      />
    );
  }

  // Kullanıcı giriş yapmış ama profile loading devam ediyor
  if (userProfile === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="text-lg text-gray-700 dark:text-gray-200">{t('loading')}</div>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
          >
            Clear Cache & Reload
          </button>
        </div>
      </div>
    );
  }

  // Admin ve moderator kullanıcılar için onboarding ve profil kontrollerini bypass et
  const profileForPermission = userProfile ? {
    ...userProfile,
    role: userProfile.role || undefined
  } : null;
  const isAdmin = isAdminUser(user, profileForPermission as any);
  const isModerator = isModeratorUser(user, profileForPermission as any);
  const isPrivilegedUser = isAdmin || isModerator;
  
  // Admin/moderator kullanıcılar direkt ana uygulamaya geçsin
  if (!isPrivilegedUser) {
    const extendedProfile = userProfile as ExtendedProfile;
    
    // Onboarding kontrolü - temel profil bilgilerinin varlığını kontrol et
    // onboarding_completed field artık database'de olmadığı için basic profile check kullanıyoruz
    const isOnboardingCompleted = false; // Always false, will be determined by hasBasicProfile check below
    
    // Eğer kullanıcının temel profil bilgileri varsa onboarding'i atla
    const hasBasicProfile = userProfile.name &&
      userProfile.age &&
      userProfile.gender &&
      userProfile.photos &&
      userProfile.photos.length > 0;
    
    // Onboarding tamamlanmamışsa göster
    if (!isOnboardingCompleted && !hasBasicProfile) {
      return <OnboardingFlow onComplete={async () => {
        console.log('Index: Onboarding completed, redirecting to profile settings...');
        // Profil güncellemesinin tamamlanmasını bekle
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Profil ayarları sayfasına yönlendir
        window.location.href = '/settings';
      }} />;
    }

    // Profil var ama tamamlanmamış (mevcut kullanıcılar için düzenleme)
    const isProfileComplete = userProfile.name &&
      userProfile.age &&
      userProfile.bio &&
      userProfile.gender;

    if (!isProfileComplete) {
      return <ProfileCompletionView />;
    }
  }

  // Lokasyon izni kontrolü
  if (showLocationPermission) {
    return (
      <LocationPermission
        onPermissionGranted={handleLocationPermissionGranted}
        onSkip={handleSkipLocation}
      />
    );
  }

  // Herşey tamam, ana uygulamayı göster
  return <AppNavigation />;
};

export default Index;
