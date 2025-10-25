import React, { useEffect, useRef } from 'react';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useSubscription } from '@/hooks/useSubscription';

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

interface GoogleAdSenseProps {
  slot: string;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  style?: React.CSSProperties;
  className?: string;
  responsive?: boolean;
}

export const GoogleAdSense: React.FC<GoogleAdSenseProps> = ({
  slot,
  format = 'auto',
  style = {},
  className = '',
  responsive = true
}) => {
  const { config, loading } = useSiteConfig();
  const { features } = useSubscription();
  const adRef = useRef<HTMLModElement>(null);
  const isAdLoaded = useRef(false);

  useEffect(() => {
    if (loading) return;
    
    // Don't show ads if user has ads disabled (Silver+ users)
    if (features.adsDisabled) return;
    
    // Don't show if AdSense is not configured
    if (!config.google_adsense_client_id) return;

    // Load AdSense script if not already loaded
    if (!document.querySelector('script[src*="pagead2.googlesyndication.com"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.setAttribute('data-ad-client', config.google_adsense_client_id);
      document.head.appendChild(script);
    }

    // Push ad to load
    if (adRef.current && !isAdLoaded.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        isAdLoaded.current = true;
      } catch (e) {
        console.error('AdSense error:', e);
      }
    }
  }, [config, loading, features.adsDisabled]);

  // Don't render if ads are disabled or not configured
  if (loading || features.adsDisabled || !config.google_adsense_client_id) {
    return null;
  }

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style
        }}
        data-ad-client={config.google_adsense_client_id}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};