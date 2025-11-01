
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Tables } from '@/integrations/supabase/types';
import { toast } from '@/hooks/use-toast';

type UserPreferences = Tables<'user_preferences'>;

export const useUserPreferences = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPreferences = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (data) {
        setPreferences(data);
        console.log(t('debug.preferences.loaded'), data);
      } else if (!error || error.code === 'PGRST116') {
        // Create default preferences if none exist
        console.log(t('debug.preferences.creatingDefault'), user.id);
        const defaultPreferences = {
          user_id: user.id,
          min_age: 18,
          max_age: 35,
          max_distance: 50,
          show_me: 'everyone' as const
        };
        
        const { data: newPrefs, error: insertError } = await supabase
          .from('user_preferences')
          .insert(defaultPreferences)
          .select()
          .single();
        
        if (newPrefs && !insertError) {
          setPreferences(newPrefs);
          console.log(t('debug.preferences.defaultCreated'), newPrefs);
        } else {
          console.error(t('debug.preferences.errorCreatingDefault'), insertError);
        }
      } else {
        console.error(t('debug.preferences.errorFetching'), error);
      }
    } catch (error) {
      console.error(t('debug.preferences.errorInFetch'), error);
    }
    
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!user || !preferences) {
      console.log(t('debug.preferences.cannotUpdate'));
      return false;
    }
    
    try {
      console.log(t('debug.preferences.updating'), updates);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (!error && data) {
        setPreferences(data);
        console.log(t('debug.preferences.updatedSuccessfully'), data);
        
        toast({
          title: t('preferences.settingsSaved'),
          description: t('preferences.preferencesUpdated'),
          duration: 3000,
        });
        
        return true;
      } else {
        console.error(t('debug.preferences.errorUpdating'), error);
        toast({
          title: t('preferences.error'),
          description: t('preferences.settingsNotSaved'),
          variant: 'destructive',
        });
        return false;
      }
    } catch (error) {
      console.error(t('debug.preferences.errorUpdating'), error);
      toast({
        title: t('preferences.error'),
        description: t('preferences.settingsNotSaved'),
        variant: 'destructive',
      });
      return false;
    }
  };

  return { 
    preferences, 
    updatePreferences, 
    loading, 
    refetchPreferences: fetchPreferences 
  };
};
