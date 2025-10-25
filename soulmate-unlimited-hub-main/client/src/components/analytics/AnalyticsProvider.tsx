import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useSiteConfig } from '@/hooks/useSiteConfig';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    trackEvent?: (eventName: string, eventData?: Record<string, unknown>) => void;
  }
}

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  const { config, loading } = useSiteConfig();
  const location = useLocation();
  const { user } = useAuth();

  // Initialize Google Analytics
  useEffect(() => {
    if (loading || !config.google_analytics_enabled || config.google_analytics_enabled !== 'true') return;
    if (!config.google_analytics_id) return;

    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${config.google_analytics_id}`;
    script.async = true;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function() {
      window.dataLayer?.push(arguments);
    };
    window.gtag('js', new Date());
    window.gtag('config', config.google_analytics_id, {
      send_page_view: false // We'll send page views manually
    });

    return () => {
      document.head.removeChild(script);
    };
  }, [config.google_analytics_id, config.google_analytics_enabled, loading]);

  // Initialize Google Tag Manager
  useEffect(() => {
    if (loading || !config.google_tag_manager_enabled || config.google_tag_manager_enabled !== 'true') return;
    if (!config.google_tag_manager_id) return;

    // GTM Script
    const script = document.createElement('script');
    script.innerHTML = `
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
      new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
      j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
      'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
      })(window,document,'script','dataLayer','${config.google_tag_manager_id}');
    `;
    document.head.appendChild(script);

    // GTM NoScript
    const noscript = document.createElement('noscript');
    noscript.innerHTML = `
      <iframe src="https://www.googletagmanager.com/ns.html?id=${config.google_tag_manager_id}"
      height="0" width="0" style="display:none;visibility:hidden"></iframe>
    `;
    document.body.insertBefore(noscript, document.body.firstChild);

    return () => {
      document.head.removeChild(script);
      document.body.removeChild(noscript);
    };
  }, [config.google_tag_manager_id, config.google_tag_manager_enabled, loading]);

  // Initialize Facebook Pixel
  useEffect(() => {
    if (loading || !config.facebook_pixel_enabled || config.facebook_pixel_enabled !== 'true') return;
    if (!config.facebook_pixel_id) return;

    const script = document.createElement('script');
    script.innerHTML = `
      !function(f,b,e,v,n,t,s)
      {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};
      if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
      n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t,s)}(window, document,'script',
      'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', '${config.facebook_pixel_id}');
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [config.facebook_pixel_id, config.facebook_pixel_enabled, loading]);

  // Track page views
  useEffect(() => {
    if (loading || config.track_page_views !== 'true') return;

    // Google Analytics page view
    if (window.gtag && config.google_analytics_enabled === 'true') {
      window.gtag('event', 'page_view', {
        page_path: location.pathname,
        page_title: document.title,
        user_id: user?.id
      });
    }

    // Facebook Pixel page view
    if (window.fbq && config.facebook_pixel_enabled === 'true') {
      window.fbq('track', 'PageView');
    }

    // Custom analytics event
    trackEvent('page_view', {
      path: location.pathname,
      title: document.title
    });
  }, [location, user, config, loading]);

  // Track custom events
  const trackEvent = async (eventName: string, eventData?: Record<string, unknown>) => {
    if (config.track_user_behavior !== 'true') return;

    try {
      // Store in database
      await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        session_id: getSessionId(),
        event_name: eventName,
        event_category: (eventData?.category as string) || 'general',
        event_data: eventData as Json || null,
        page_path: location.pathname,
        user_agent: navigator.userAgent
      });

      // Send to Google Analytics
      if (window.gtag && config.google_analytics_enabled === 'true') {
        window.gtag('event', eventName, {
          ...eventData,
          user_id: user?.id
        });
      }

      // Send to Facebook Pixel
      if (window.fbq && config.facebook_pixel_enabled === 'true') {
        window.fbq('track', eventName, eventData);
      }
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  // Get or create session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  // Expose tracking function globally
  useEffect(() => {
    window.trackEvent = trackEvent;
  }, [config]);

  return <>{children}</>;
};