
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { supabase } from '@/integrations/supabase/client';

export const usePhotoUpload = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [uploading, setUploading] = useState(false);

  const uploadPhoto = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const formData = new FormData();
      formData.append('photo', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload-photo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const { url } = await response.json();
      return url;
    } catch (error) {
      console.error(t('debug.upload.errorUploading'), error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deletePhoto = async (url: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No authentication token');
      }

      const response = await fetch('/api/delete-photo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ url }),
      });
      
      return response.ok;
    } catch (error) {
      console.error(t('debug.upload.errorDeleting'), error);
      return false;
    }
  };

  return { uploadPhoto, deletePhoto, uploading };
};
