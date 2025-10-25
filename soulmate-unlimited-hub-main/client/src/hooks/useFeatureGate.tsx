import { useSubscription } from './useSubscription';
import { useLanguage } from './useLanguage';
import { useToast } from './use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { SubscriptionTier, SubscriptionFeatures } from '@/types/subscription';

export interface FeatureGateResult {
  hasAccess: boolean;
  requiresUpgrade: boolean;
  requiredTier: SubscriptionTier;
  upgradeMessage: string;
  showUpgradeDialog: () => void;
}

// Premium özellik gereksinimleri - mevcut SubscriptionFeatures ile uyumlu
const FEATURE_REQUIREMENTS = {
  // Silver tier features
  'seeWhoLikesYou': 'silver',
  'advancedFilters': 'silver',
  'readReceipts': 'silver',
  'monthlyBoosts': 'silver',
  'rewindFeature': 'silver',
  'voiceCalls': 'silver',
  'videoCalls': 'silver',
  
  // Gold tier features
  'unlimitedMessages': 'gold',
  'priorityMessages': 'gold',
  'invisibleBrowsing': 'gold',
  'locationChange': 'gold',
  'videoProfile': 'gold',
  'profileBoost': 'gold',
  'passportFeature': 'gold',
  'topPicksAccess': 'gold',
  
  // Platinum features
  'multiLanguageChat': 'platinum',
  
  // Admin features
  'adminPanel': 'admin',
  'userManagement': 'admin',
  'contentModeration': 'admin',
  'systemSettings': 'admin',
  'analytics': 'admin'
} as const;

// Tier hierarchy for upgrade suggestions
const TIER_HIERARCHY: Record<SubscriptionTier, number> = {
  'registered': 0,
  'silver': 1,
  'gold': 2,
  'platinum': 3,
  'moderator': 4,
  'admin': 5
} as const;

export const useFeatureGate = (feature: keyof typeof FEATURE_REQUIREMENTS): FeatureGateResult => {
  const { subscription_tier, subscribed, hasFeature } = useSubscription();
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const requiredTier = FEATURE_REQUIREMENTS[feature];
  const currentTierLevel = TIER_HIERARCHY[subscription_tier || 'registered'];
  const requiredTierLevel = TIER_HIERARCHY[requiredTier];
  
  // Feature map to SubscriptionFeatures keys
  const featureMap: Partial<Record<keyof typeof FEATURE_REQUIREMENTS, keyof SubscriptionFeatures>> = {
    'seeWhoLikesYou': 'seeWhoLikesYou',
    'advancedFilters': 'advancedFilters',
    'readReceipts': 'readReceipts',
    'voiceCalls': 'voiceCalls',
    'videoCalls': 'videoCalls',
    'unlimitedMessages': 'unlimitedMessages',
    'priorityMessages': 'priorityMessages',
    'invisibleBrowsing': 'invisibleBrowsing',
    'rewindFeature': 'rewindFeature',
    'videoProfile': 'videoProfile',
    'passportFeature': 'passportFeature',
    'topPicksAccess': 'topPicksAccess',
    'multiLanguageChat': 'multiLanguageChat',
    'adminPanel': 'adminPanel',
    'userManagement': 'userManagement',
    'contentModeration': 'contentModeration',
    'systemSettings': 'systemSettings',
    'analytics': 'analytics'
  };
  
  const subscriptionFeatureKey = featureMap[feature];
  const hasFeatureAccess = subscriptionFeatureKey ? !!hasFeature(subscriptionFeatureKey) : false;
  const hasAccess = hasFeatureAccess || currentTierLevel >= requiredTierLevel;
  const requiresUpgrade = !hasAccess;
  
  // Debug logging for rewind feature
  if (feature === 'rewindFeature') {
    console.log('[useFeatureGate] Rewind feature check:', {
      feature,
      subscription_tier,
      subscribed,
      currentTierLevel,
      requiredTierLevel,
      hasFeatureAccess,
      hasAccess,
      subscriptionFeatureKey
    });
  }

  const getUpgradeMessage = (): string => {
    switch (requiredTier) {
      case 'silver':
        return t('feature.requires.silver');
      case 'gold':
        return t('feature.requires.gold');
      case 'platinum':
        return t('feature.requires.platinum');
      case 'admin':
        return t('feature.requires.admin');
      default:
        return t('feature.requires.gold');
    }
  };

  const showUpgradeDialog = () => {
    if (requiredTier === 'admin') {
      toast({
        title: t('validation.accessDenied'),
        description: t('feature.requires.admin'),
        variant: "destructive"
      });
      return;
    }

    const tierNames = {
      'silver': 'Silver',
      'gold': 'Gold',
      'platinum': 'Platinum'
    };

    toast({
      title: t('upgradeRequired'),
      description: getUpgradeMessage(),
      variant: "destructive",
      action: (
        <Button
          size="sm"
          onClick={() => navigate('/upgrades')}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
        >
          {t('upgradeTo')} {tierNames[requiredTier as keyof typeof tierNames]}
        </Button>
      )
    });
  };

  return {
    hasAccess,
    requiresUpgrade,
    requiredTier,
    upgradeMessage: getUpgradeMessage(),
    showUpgradeDialog
  };
};

// Convenience hook for component-level feature checking
export const useFeatureCheck = (feature: keyof typeof FEATURE_REQUIREMENTS) => {
  const featureGate = useFeatureGate(feature);
  
  const checkFeatureAccess = () => {
    if (featureGate.requiresUpgrade) {
      featureGate.showUpgradeDialog();
      return false;
    }
    return true;
  };

  return {
    ...featureGate,
    checkFeatureAccess
  };
};

// HOC for protecting components with feature gates
export const withFeatureGate = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  feature: keyof typeof FEATURE_REQUIREMENTS,
  fallbackComponent?: React.ComponentType<P>
) => {
  return (props: P) => {
    const { hasAccess } = useFeatureGate(feature);
    
    if (!hasAccess) {
      if (fallbackComponent) {
        const FallbackComponent = fallbackComponent;
        return <FallbackComponent {...props} />;
      }
      return null;
    }
    
    return <WrappedComponent {...props} />;
  };
};