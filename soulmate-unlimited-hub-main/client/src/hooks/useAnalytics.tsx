import { useCallback } from 'react';
import { useSiteConfig } from './useSiteConfig';
import { useAuth } from '@/hooks/useAuth';
import { ExtendedWindow, TrackEventData } from '@/types/common';

export const useAnalytics = () => {
  const { config } = useSiteConfig();
  const { user } = useAuth();

  const trackEvent = useCallback((eventName: string, eventData?: TrackEventData) => {
    // Only track if enabled in config
    if (config.track_user_behavior !== 'true') return;

    // Use the global trackEvent function from AnalyticsProvider
    if ((window as ExtendedWindow).trackEvent) {
      (window as ExtendedWindow).trackEvent?.(eventName, {
        ...eventData,
        user_id: user?.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [config.track_user_behavior, user]);

  const trackSwipe = useCallback((direction: 'left' | 'right', targetUserId: string) => {
    if (config.track_swipe_actions !== 'true') return;
    
    trackEvent('swipe_action', {
      category: 'engagement',
      action: direction === 'right' ? 'like' : 'pass',
      target_user_id: targetUserId
    });
  }, [config.track_swipe_actions, trackEvent]);

  const trackMatch = useCallback((matchedUserId: string) => {
    if (config.track_match_interactions !== 'true') return;
    
    trackEvent('match_created', {
      category: 'engagement',
      matched_user_id: matchedUserId
    });
  }, [config.track_match_interactions, trackEvent]);

  const trackPageView = useCallback((pageName: string, pageData?: TrackEventData) => {
    if (config.track_page_views !== 'true') return;
    
    trackEvent('page_view', {
      category: 'navigation',
      page_name: pageName,
      ...pageData
    });
  }, [config.track_page_views, trackEvent]);

  const trackButtonClick = useCallback((buttonName: string, buttonData?: TrackEventData) => {
    trackEvent('button_click', {
      category: 'ui_interaction',
      button_name: buttonName,
      ...buttonData
    });
  }, [trackEvent]);

  const trackError = useCallback((errorType: string, errorData?: TrackEventData) => {
    trackEvent('error', {
      category: 'error',
      error_type: errorType,
      ...errorData
    });
  }, [trackEvent]);

  return {
    trackEvent,
    trackSwipe,
    trackMatch,
    trackPageView,
    trackButtonClick,
    trackError
  };
};