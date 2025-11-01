import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';
import { useLanguage } from '@/hooks/useLanguage';

interface ResetSwipesButtonProps {
  onReset: () => void;
}

export const ResetSwipesButton = ({ onReset }: ResetSwipesButtonProps) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleReset = async () => {
    if (!user) return;
    
    try {
      // Delete all swipes for this user
      const { error } = await supabase
        .from('swipes')
        .delete()
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      toast({
        title: t('success'),
        description: t('swipesReset'),
      });
      
      // Refresh profiles
      onReset();
    } catch (error) {
      console.error('Error resetting swipes:', error);
      toast({
        title: t('error'),
        description: t('swipesResetError'),
        variant: 'destructive'
      });
    }
  };

  return (
    <Button
      onClick={handleReset}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className="w-4 h-4" />
      {t('resetSwipes')}
    </Button>
  );
};