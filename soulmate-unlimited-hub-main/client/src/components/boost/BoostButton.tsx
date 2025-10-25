import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Clock, Crown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { useSubscription } from '@/hooks/useSubscription';
import { boostService } from '@/services/boostService';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export const BoostButton = () => {
  const { user, userRole } = useAuth();
  const { t } = useLanguage();
  const { features } = useSubscription();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeBoost, setActiveBoost] = useState<{ isActive: boolean; expiresAt?: string }>({ isActive: false });

  // Check for active boost on mount
  useEffect(() => {
    if (user?.id) {
      boostService.getActiveBoost(user.id).then(boost => {
        setActiveBoost({
          isActive: !!boost,
          expiresAt: boost?.ends_at
        });
      }).catch(error => {
        console.error('Failed to get active boost:', error);
        setActiveBoost({ isActive: false });
      });
    }
  }, [user?.id]);

  const handleBoost = async () => {
    if (!user?.id || !userRole) return;
    
    setLoading(true);
    
    try {
      // Check if user can boost first
      const canBoostResult = await boostService.canUserBoost(user.id);
      
      if (!canBoostResult.canBoost) {
        toast({
          title: t('boostLimitReached'),
          description: canBoostResult.reason === 'monthly_limit' 
            ? t('monthlyBoostLimitReached')
            : t('dailyBoostLimitReached'),
          variant: "destructive",
          action: (
            <ToastAction 
              altText="Upgrade" 
              onClick={() => navigate('/subscription')}
            >
              {t('upgrade')}
            </ToastAction>
          ),
        });
        return;
      }
      
      // Activate boost
      const boostResult = await boostService.activateBoost('profile', 30);
      
      if (!boostResult.success) {
        toast({
          title: t('error'),
          description: boostResult.message || t('boostError'),
          variant: "destructive",
        });
        return;
      }
      
      // Boost successful
      toast({
        title: t('boostActivated'),
        description: boostResult.message || t('boostDescription'),
        duration: 5000,
      });
      
      // Update active boost state
      const newActiveBoost = await boostService.getActiveBoost(user.id);
      setActiveBoost({
        isActive: !!newActiveBoost,
        expiresAt: newActiveBoost?.ends_at
      });
      
    } catch (error) {
      console.error('Boost error:', error);
      toast({
        title: t('error'),
        description: t('boostError'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!features.voiceCalls) {
    // Free users can't boost
    return null;
  }

  if (activeBoost.isActive && activeBoost.expiresAt) {
    const timeRemaining = formatDistanceToNow(new Date(activeBoost.expiresAt), { 
      addSuffix: true,
      locale: tr 
    });
    
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Rocket className="w-3 h-3 mr-1" />
          {t('boosted')}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 inline mr-1" />
          {timeRemaining}
        </span>
      </div>
    );
  }

  return (
    <Button
      onClick={handleBoost}
      disabled={loading}
      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
    >
      <Rocket className="w-4 h-4 mr-2" />
      {loading ? t('activating') : t('boost')}
    </Button>
  );
};