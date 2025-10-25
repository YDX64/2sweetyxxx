import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WifiOff, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

export const ConnectionStatus = () => {
  const { isOnline } = useNetworkStatus();
  const { isConnected: isSupabaseConnected } = useSupabaseConnection();
  const { t } = useLanguage();

  if (isOnline && isSupabaseConnected) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-md mx-auto">
      {!isOnline && (
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertDescription>
            {t('networkStatus.connectionLost')}. {t('networkStatus.featuresUnavailable')}.
          </AlertDescription>
        </Alert>
      )}
      
      {isOnline && !isSupabaseConnected && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t('networkStatus.connectionLost')}. {t('networkStatus.syncingWithServer')}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};