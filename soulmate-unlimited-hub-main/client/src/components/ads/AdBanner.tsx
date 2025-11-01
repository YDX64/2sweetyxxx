import React from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { GoogleAdSense } from './GoogleAdSense';
import { useSiteConfig } from '@/hooks/useSiteConfig';

interface AdBannerProps {
  slot?: string;
  className?: string;
  format?: 'banner' | 'square' | 'native';
}

export const AdBanner: React.FC<AdBannerProps> = ({ 
  slot = 'default',
  className = '',
  format = 'banner'
}) => {
  const { user } = useAuth();
  const { features } = useSubscription();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { config } = useSiteConfig();
  const [dismissed, setDismissed] = React.useState(false);

  // Don't show ads if user has ads disabled (Silver+ users)
  if (!user || features.adsDisabled) {
    return null;
  }

  const handleUpgrade = () => {
    navigate('/upgrades');
  };

  // Determine which ad slot to use based on format and position
  const getAdSlot = () => {
    if (format === 'banner' && slot === 'header') return config.google_adsense_ad_slot_header;
    if (format === 'banner' && slot === 'footer') return config.google_adsense_ad_slot_footer;
    if (format === 'banner' && slot === 'swipe') return config.google_adsense_ad_slot_swipe;
    if (format === 'native') return config.google_adsense_ad_slot_sidebar;
    return config.google_adsense_ad_slot_header; // default
  };

  const adSlot = getAdSlot();

  // If Google AdSense is configured, use it
  if (config.google_adsense_client_id && adSlot) {
    return (
      <div className={className}>
        <GoogleAdSense
          slot={adSlot}
          format={format === 'banner' ? 'horizontal' : format === 'square' ? 'rectangle' : 'fluid'}
          className="min-h-[90px] w-full"
        />
      </div>
    );
  }

  // Fallback to placeholder ads if AdSense not configured
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 rounded-lg ${format === 'native' ? 'p-2' : 'p-4'} ${className}`}>
      <div className="text-center">
        {format === 'banner' && (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('ads.banner.title')}
            </p>
            <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-500">
                {t('ads.placeholder')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpgrade}
              className="text-xs"
            >
              {t('ads.removeAds')}
            </Button>
          </div>
        )}
        
        {format === 'square' && (
          <div className="space-y-2">
            <div className="bg-gray-200 dark:bg-gray-700 aspect-square rounded flex items-center justify-center">
              <span className="text-gray-500 dark:text-gray-500">
                {t('ads.placeholder')}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpgrade}
              className="text-xs"
            >
              {t('ads.removeAds')}
            </Button>
          </div>
        )}
        
        {format === 'native' && (
          <div className="flex items-center justify-between px-2 py-1">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                {t('ads.native.title')}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">
                {t('ads.native.description')}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleUpgrade}
              className="text-xs h-7 px-2"
            >
              {t('ads.upgrade')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};