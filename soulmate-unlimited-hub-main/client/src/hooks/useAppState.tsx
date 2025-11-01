import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";

export function useAppState() {
  const { t } = useLanguage();
  const { user, isLoading: authLoading } = useAuth();
  const { userProfile, loading: profileLoading } = useProfiles();
  const { latitude, longitude, error: locationError, loading: locationLoading } = useGeolocation();
  const [showAuth, setShowAuth] = useState(false);
  const [showLocationPermission, setShowLocationPermission] = useState(false);
  const [locationPermissionGranted, setLocationPermissionGranted] = useState(false);

  // Lokasyon izni kontrolü - sadece giriş yapılmış ve profil tamamlanmış kullanıcılar için
  useEffect(() => {
    if (user && userProfile && !authLoading && !profileLoading) {
      const isProfileComplete = userProfile.name && userProfile.age && userProfile.bio && userProfile.gender;
      
      if (isProfileComplete && !locationPermissionGranted) {
        const hasLocationPermission = localStorage.getItem('locationPermissionGranted');
        if (!hasLocationPermission) {
          console.log('Showing location permission dialog');
          setShowLocationPermission(true);
        } else if (hasLocationPermission === 'true') {
          setLocationPermissionGranted(true);
        }
      }
    }
  }, [user, userProfile, authLoading, profileLoading, locationPermissionGranted]);

  const handleLocationPermissionGranted = useCallback(() => {
    console.log('Location permission granted');
    setLocationPermissionGranted(true);
    setShowLocationPermission(false);
    localStorage.setItem('locationPermissionGranted', 'true');
    
    toast({
      title: t('locationEnabled'),
      description: t('locationEnabledSuccess'),
      duration: 3000,
    });
  }, [t]);

  const handleSkipLocation = useCallback(() => {
    console.log('Location permission skipped');
    setShowLocationPermission(false);
    localStorage.setItem('locationPermissionGranted', 'skipped');
  }, []);

  return {
    user,
    userProfile,
    authLoading,
    profileLoading,
    locationLoading,
    locationError,
    latitude,
    longitude,
    showAuth,
    setShowAuth,
    showLocationPermission,
    locationPermissionGranted,
    handleLocationPermissionGranted,
    handleSkipLocation
  };
}
