
import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const { t } = useLanguage();
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: t('debug.location.notSupported'),
        loading: false,
      }));
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const handleError = (error: GeolocationPositionError) => {
      let errorMessage = t('debug.location.unknownError');
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = t('debug.location.permissionDenied');
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = t('debug.location.positionUnavailable');
          break;
        case error.TIMEOUT:
          errorMessage = t('debug.location.timeout');
          break;
      }

      setState(prev => ({
        ...prev,
        error: errorMessage,
        loading: false,
      }));
    };

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: false, // Changed to false for faster response
      timeout: 15000, // Increased timeout to 15 seconds
      maximumAge: 300000, // 5 minutes cache
      ...options,
    };

    // Try to get location with fallback strategy
    const tryGetLocation = () => {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (error) => {
          if (error.code === error.TIMEOUT) {
            // Retry with less accuracy for faster response
            navigator.geolocation.getCurrentPosition(
              handleSuccess,
              handleError,
              {
                enableHighAccuracy: false,
                timeout: 30000,
                maximumAge: 600000, // 10 minutes cache
              }
            );
          } else {
            handleError(error);
          }
        },
        defaultOptions
      );
    };

    tryGetLocation();

    // Watch position for continuous updates but with longer timeout
    const watchId = navigator.geolocation.watchPosition(
      handleSuccess,
      () => {}, // Ignore watch errors to prevent spam
      {
        enableHighAccuracy: false,
        timeout: 30000,
        maximumAge: 600000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const refetch = () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }));
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 0 }
    );
  };

  return { ...state, refetch };
};
