
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Shield, Smartphone, Globe } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

interface LocationPermissionProps {
  onPermissionGranted: () => void;
  onSkip?: () => void;
}

// Modern Context7 pattern: Type-safe geolocation error handling
interface GeolocationError {
  code: number;
  message: string;
}

export const LocationPermission = ({ onPermissionGranted, onSkip }: LocationPermissionProps) => {
  const { t } = useLanguage();
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = async () => {
    setIsRequesting(true);
    setError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      console.log('Location permission granted:', position.coords);
      onPermissionGranted();
    } catch (err: unknown) {
      console.error('Location permission error:', err);

      let errorMessageKey = 'location.unknownError';
      if (err instanceof Error && 'code' in err) {
        const geoError = err as GeolocationError;
        switch (geoError.code) {
          case 1:
            errorMessageKey = 'location.permissionDenied';
            break;
          case 2:
            errorMessageKey = 'location.positionUnavailable';
            break;
          case 3:
            errorMessageKey = 'location.timeout';
            break;
        }
      } else if (err instanceof Error && err.message.includes('not supported')) {
        errorMessageKey = 'location.notSupported';
      }

      setError(t(errorMessageKey));
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mb-4">
            <MapPin className="w-8 h-8 text-pink-500" />
          </div>
          <CardTitle className="text-xl">{t('enableLocation')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600 text-center">
            {t('locationHelpsMatch')}
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Shield className="w-5 h-5 text-green-500" />
              <span>{t('locationPrivacySecure')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Smartphone className="w-5 h-5 text-blue-500" />
              <span>{t('worksOnAllDevices')}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-5 h-5 text-purple-500" />
              <span>{t('findPeopleNearby')}</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button
              onClick={requestLocation}
              disabled={isRequesting}
              className="w-full bg-pink-500 hover:bg-pink-600"
            >
              {isRequesting ? t('gettingLocation') : t('enableLocation')}
            </Button>
            
            {onSkip && (
              <Button
                onClick={onSkip}
                variant="outline"
                className="w-full"
              >
                {t('skipForNow')}
              </Button>
            )}
          </div>

          <p className="text-xs text-gray-500 text-center">
            {t('locationPermissionNote')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
