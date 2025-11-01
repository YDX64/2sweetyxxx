import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { GoogleAdSense } from './GoogleAdSense';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useSubscription } from '@/hooks/useSubscription';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface InterstitialAdProps {
  onClose: () => void;
  onAdClosed?: () => void;
}

export const InterstitialAd: React.FC<InterstitialAdProps> = ({ onClose, onAdClosed }) => {
  const { config } = useSiteConfig();
  const { features } = useSubscription();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(5);
  const [canSkip, setCanSkip] = useState(false);

  useEffect(() => {
    // Don't show if ads are disabled
    if (features.adsDisabled) {
      onClose();
      return;
    }

    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanSkip(true);
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [features.adsDisabled, onClose]);

  const handleClose = () => {
    if (canSkip) {
      onAdClosed?.();
      onClose();
    }
  };

  const handleUpgrade = () => {
    navigate('/upgrades');
  };

  if (features.adsDisabled) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg max-w-lg w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-800">
          <h3 className="text-lg font-semibold">Advertisement</h3>
          {canSkip ? (
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={20} />
            </button>
          ) : (
            <span className="text-sm text-gray-500">
              Skip in {countdown}s
            </span>
          )}
        </div>

        {/* Ad Content */}
        <div className="p-4">
          {config.google_adsense_client_id && config.google_adsense_ad_slot_swipe ? (
            <GoogleAdSense
              slot={config.google_adsense_ad_slot_swipe}
              format="rectangle"
              className="min-h-[250px]"
            />
          ) : (
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Advertisement Space
              </p>
              <div className="h-[250px] flex items-center justify-center">
                <span className="text-gray-500">Ad Content Here</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t dark:border-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpgrade}
            className="w-full"
          >
            Remove ads with Silver membership
          </Button>
        </div>
      </div>
    </div>
  );
};