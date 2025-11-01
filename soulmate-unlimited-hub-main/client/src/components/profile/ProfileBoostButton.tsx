import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Rocket, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { boostService } from '@/services/boostService';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

export const ProfileBoostButton = () => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeBoost, setActiveBoost] = useState<{ isActive: boolean; expiresAt?: string } | null>(null);
  const [canBoost, setCanBoost] = useState<{ allowed: boolean; reason?: string; remaining?: number }>({ allowed: false });

  // Check for active boost and boost eligibility
  useEffect(() => {
    const checkBoostStatus = async () => {
      if (!user?.id) return;
      
      try {
        // Check active boost
        const active = await boostService.getActiveBoost(user.id);
        if (active) {
          setActiveBoost({ isActive: true, expiresAt: active.ends_at });
        } else {
          setActiveBoost({ isActive: false });
        }
        
        // Check if user can boost
        const canBoostResult = await boostService.canUserBoost(user.id);
        setCanBoost({
          allowed: canBoostResult.canBoost,
          reason: canBoostResult.reason,
          remaining: canBoostResult.remainingBoosts
        });
      } catch (error) {
        console.error('Error checking boost status:', error);
      }
    };

    checkBoostStatus();
    
    // Refresh every minute to update countdown
    const interval = setInterval(checkBoostStatus, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const handleBoost = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    
    try {
      const result = await boostService.activateBoost('profile', 30);
      
      if (!result.success) {
        // Check if it's a subscription limit issue
        if (result.message?.includes('silver') || result.message?.includes('üyelik')) {
          toast({
            title: t('boostLimitReached'),
            description: result.message,
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
        } else {
          toast({
            title: t('error'),
            description: result.message,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Boost successful
      toast({
        title: t('boostActivated'),
        description: result.message,
        duration: 5000,
      });
      
      // Update state
      if (result.endsAt) {
        setActiveBoost({ isActive: true, expiresAt: result.endsAt });
      }
      
      // Update remaining boosts
      const canBoostResult = await boostService.canUserBoost(user.id);
      setCanBoost({
        allowed: canBoostResult.canBoost,
        reason: canBoostResult.reason,
        remaining: canBoostResult.remainingBoosts
      });
      
    } catch (error) {
      console.error('Boost error:', error);
      toast({
        title: t('error'),
        description: t('boostError') || 'Boost aktivasyonu başarısız oldu',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't show button if user can't boost at all (free users)
  if (!canBoost.allowed && canBoost.reason?.includes('silver')) {
    return null;
  }

  // Show active boost status
  if (activeBoost?.isActive && activeBoost.expiresAt) {
    const locale = language === 'tr' ? tr : enUS;
    const timeRemaining = formatDistanceToNow(new Date(activeBoost.expiresAt), { 
      addSuffix: true,
      locale
    });
    
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Rocket className="w-3 h-3 mr-1" />
          {t('boosted') || 'Boost Aktif'}
        </Badge>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3 inline mr-1" />
          {timeRemaining}
        </span>
      </div>
    );
  }

  // Show boost button
  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        onClick={handleBoost}
        disabled={loading || !canBoost.allowed}
        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
        size="sm"
      >
        <Rocket className="w-4 h-4 mr-2" />
        {loading ? (t('activating') || 'Aktifleştiriliyor...') : (t('boost') || 'Boost')}
      </Button>
      {canBoost.remaining !== undefined && canBoost.remaining > 0 && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {canBoost.remaining} {t('boostsRemaining') || 'boost kaldı'}
        </span>
      )}
    </div>
  );
};