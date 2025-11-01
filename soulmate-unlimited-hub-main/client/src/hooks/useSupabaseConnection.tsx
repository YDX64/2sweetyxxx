import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useSupabaseConnection = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [lastError, setLastError] = useState<Error | null>(null);

  useEffect(() => {
    let reconnectAttempts = 0;
    const maxReconnectAttempts = 5;
    let reconnectTimeout: NodeJS.Timeout;

    const checkConnection = async () => {
      try {
        // EGRESS OPTIMIZED: Lightweight connection check using auth session instead of DB query
        const { error } = await supabase.auth.getSession();
        
        if (error && error.message.includes('network')) {
          throw error;
        }
        
        if (!isConnected) {
          setIsConnected(true);
          setLastError(null);
          reconnectAttempts = 0;
          toast.success('Supabase connection restored');
        }
      } catch (error) {
        console.error('Supabase connection check failed:', error);
        setIsConnected(false);
        setLastError(error as Error);
        
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectAttempts++;
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
          
          console.log(`Attempting reconnection ${reconnectAttempts}/${maxReconnectAttempts} in ${delay}ms`);
          reconnectTimeout = setTimeout(checkConnection, delay);
        } else {
          toast.error('Unable to connect to server', {
            description: 'Please check your connection and refresh the page',
            duration: Infinity,
          });
        }
      }
    };

    // Check connection immediately
    checkConnection();

    // EGRESS OPTIMIZED: Reduced connection check frequency from 30s to 2 minutes
    const interval = setInterval(checkConnection, 120000); // Check every 2 minutes

    return () => {
      clearInterval(interval);
      clearTimeout(reconnectTimeout);
    };
  }, [isConnected]);

  return { isConnected, lastError };
};