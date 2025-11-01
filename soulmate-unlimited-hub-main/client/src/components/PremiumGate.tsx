
import { ReactNode } from 'react';
import { useSubscription } from '@/hooks/useSubscription';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PremiumGateProps {
  children: ReactNode;
  feature: string;
  requiredTier?: 'silver' | 'gold' | 'platinum';
  fallback?: ReactNode;
}

export const PremiumGate = ({ 
  children, 
  feature, 
  requiredTier = 'silver',
  fallback 
}: PremiumGateProps) => {
  const { isPremiumUser, subscription_tier } = useSubscription();
  const navigate = useNavigate();

  const hasAccess = () => {
    console.log('🔒 PremiumGate - Checking access:', {
      isPremium: isPremiumUser(),
      subscription_tier,
      requiredTier,
      feature
    });
    
    if (!isPremiumUser()) return false;
    
    const tierOrder = { 
      'registered': 0,
      'silver': 1, 
      'gold': 2, 
      'platinum': 3,
      'moderator': 4,
      'admin': 5
    };
    
    const userTierLevel = tierOrder[subscription_tier as keyof typeof tierOrder] || 0;
    const requiredTierLevel = tierOrder[requiredTier] || 1;
    
    const hasAccess = userTierLevel >= requiredTierLevel;
    console.log('🔒 PremiumGate - Access result:', { userTierLevel, requiredTierLevel, hasAccess });
    
    return hasAccess;
  };

  if (hasAccess()) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <Card className="border-2 border-yellow-500/20 dark:border-yellow-600/20 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 rounded-full flex items-center justify-center shadow-lg">
          <Crown className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">{feature}</h3>
        <p className="text-muted-foreground mb-4">
          Bu özellik {requiredTier === 'silver' ? 'Silver' : requiredTier === 'gold' ? 'Gold' : 'Platinum'} aboneliği gerektirir
        </p>
        <Button 
          onClick={() => navigate('/upgrades')}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white shadow-lg"
        >
          <Crown className="w-4 h-4 mr-2 text-white" />
          Premium Ol
        </Button>
      </CardContent>
    </Card>
  );
};

export const PremiumBadge = ({ tier }: { tier: string }) => (
  <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 dark:from-yellow-500 dark:to-amber-600 text-white text-xs font-medium rounded-full shadow-md">
    <Crown className="w-3 h-3" />
    {tier}
  </div>
);

export const PremiumFeatureLock = ({ feature, onClick }: { feature: string; onClick?: () => void }) => (
  <div
    className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center cursor-pointer z-10"
    onClick={onClick}
  >
    <div className="text-center text-white">
      <Lock className="w-8 h-8 mx-auto mb-2" />
      <p className="font-medium">{feature}</p>
      <p className="text-sm opacity-80">Premium Gerekli</p>
    </div>
  </div>
);
