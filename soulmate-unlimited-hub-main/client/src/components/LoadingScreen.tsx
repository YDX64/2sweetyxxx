import { Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LoadingScreen = () => {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="text-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">{t('loading')}</p>
      </div>
    </div>
  );
};