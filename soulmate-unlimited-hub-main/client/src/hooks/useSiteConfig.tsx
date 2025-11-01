import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeSubscription } from '@/types/common';

interface SiteConfig {
  [key: string]: string;
}

export const useSiteConfig = () => {
  const [config, setConfig] = useState<SiteConfig>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let subscription: RealtimeSubscription | null = null;

    const loadConfig = async () => {
      try {
        const { data, error } = await supabase
          .from('site_configuration')
          .select('key, value')
          .eq('is_active', true);

        if (error) throw error;

        // Convert array to object for easy access
        const configObject: SiteConfig = {};
        data?.forEach(item => {
          configObject[item.key] = item.value || '';
        });

        if (isMounted) {
          setConfig(configObject);
        }
      } catch (error) {
        console.error('Error loading site configuration:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial load
    loadConfig();

    // Subscribe to configuration changes with unique channel name
    const channelName = `site_config_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      subscription = supabase
        .channel(channelName)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: 'site_configuration' },
          () => {
            if (isMounted) {
              loadConfig();
            }
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error('Error subscribing to site config changes:', err);
          }
        });
    } catch (error) {
      console.error('Error setting up site config subscription:', error);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        try {
          subscription.unsubscribe();
        } catch (error) {
          console.error('Error removing site config subscription:', error);
        }
      }
    };
  }, []);

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('key, value')
        .eq('is_active', true);

      if (error) throw error;

      // Convert array to object for easy access
      const configObject: SiteConfig = {};
      data?.forEach(item => {
        configObject[item.key] = item.value || '';
      });

      setConfig(configObject);
    } catch (error) {
      console.error('Error loading site configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  return { config, loading, reload: loadConfig };
};