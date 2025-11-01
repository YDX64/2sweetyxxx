import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useSubscription } from "@/hooks/useSubscription";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { Eye, Heart, Zap, Sparkles, Phone, Video, Filter, RotateCcw, Globe, Ghost, Crown, BarChart3, Shield, Ban, Users } from "lucide-react";

export const FeatureCards = () => {
  const { t } = useLanguage();
  const { subscription_tier } = useSubscription();

  // Features organized by subscription tier hierarchy: Free → Silver → Gold → Platinum
  const features = [
    // FREE FEATURES
    {
      icon: <Shield className="w-6 h-6" />,
      title: t('features.verifiedBadge.title'),
      description: t('features.verifiedBadge.description'),
      tier: "free",
      gradient: "from-blue-500 to-blue-600"
    },
    
    // SILVER TIER FEATURES (Entry-level premium)
    {
      icon: <Heart className="w-6 h-6" />,
      title: "50 Daily Likes",
      description: "Boost your chances with 50 daily likes instead of 10",
      tier: "silver",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "5 Super Likes",
      description: "Stand out with 5 super likes per day",
      tier: "silver",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: <Filter className="w-6 h-6" />,
      title: t('feature.advancedFilters'),
      description: t('features.advancedFilters.description'),
      tier: "silver",
      gradient: "from-teal-500 to-blue-500"
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: t('feature.seeWhoLikesYou'),
      description: t('features.seeWhoLikesYou.description'),
      tier: "silver",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "1 Boost per Month",
      description: "Get 10x more visibility with monthly profile boost",
      tier: "silver",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: <RotateCcw className="w-6 h-6" />,
      title: "Rewind",
      description: "Undo your last swipe if you changed your mind",
      tier: "silver",
      gradient: "from-amber-500 to-yellow-500"
    },
    {
      icon: <Phone className="w-6 h-6" />,
      title: "Voice Calls",
      description: "High-quality voice calls with your matches",
      tier: "silver",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: <Ban className="w-6 h-6" />,
      title: t('features.disableAds.title'),
      description: t('features.disableAds.description'),
      tier: "silver",
      gradient: "from-gray-500 to-gray-600"
    },
    
    // GOLD TIER FEATURES (Mid-tier premium)
    {
      icon: <Heart className="w-6 h-6" />,
      title: "100 Daily Likes",
      description: "Double your chances with 100 daily likes",
      tier: "gold",
      gradient: "from-red-500 to-pink-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "10 Super Likes",
      description: "Stand out with 10 super likes per day",
      tier: "gold",
      gradient: "from-orange-500 to-yellow-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "3 Boosts per Month",
      description: "Triple your visibility with 3 monthly boosts",
      tier: "gold",
      gradient: "from-purple-500 to-violet-500"
    },
    {
      icon: <Ghost className="w-6 h-6" />,
      title: "Invisible Browsing",
      description: "Browse profiles privately without being seen",
      tier: "gold",
      gradient: "from-gray-500 to-gray-600"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Passport",
      description: "Change your location to meet people anywhere",
      tier: "gold",
      gradient: "from-cyan-500 to-teal-500"
    },
    {
      icon: <Video className="w-6 h-6" />,
      title: "HD Video Calls",
      description: "Crystal clear HD video calls for better connections",
      tier: "gold",
      gradient: "from-indigo-500 to-purple-500"
    },
    
    // PLATINUM TIER FEATURES (Highest tier premium)
    {
      icon: <Heart className="w-6 h-6" />,
      title: "Unlimited Likes",
      description: "Like as many profiles as you want without daily limits",
      tier: "platinum",
      gradient: "from-pink-500 to-red-500"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "25 Super Likes",
      description: "Maximum impact with 25 super likes per day",
      tier: "platinum",
      gradient: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "10 Boosts per Month",
      description: "Maximum visibility with 10 monthly boosts",
      tier: "platinum",
      gradient: "from-purple-600 to-pink-600"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Profile Analytics",
      description: "Detailed insights about your profile performance",
      tier: "platinum",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      icon: <Crown className="w-6 h-6" />,
      title: "VIP Matching",
      description: "Get priority placement in the discover queue",
      tier: "platinum",
      gradient: "from-yellow-400 to-amber-500"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-language Translation",
      description: "Chat in any language with automatic translation",
      tier: "platinum",
      gradient: "from-emerald-500 to-teal-500"
    }
  ];

  const getFeatureStatus = (tierRequired: string) => {
    // Handle free features
    if (tierRequired === 'free') {
      return {
        hasAccess: true,
        isCurrentTier: false,
        needsUpgrade: false
      };
    }
    
    // Check if user has access based on their current tier
    const tierHierarchy = ['registered', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tierHierarchy.indexOf(subscription_tier || 'registered');
    const requiredTierIndex = tierHierarchy.indexOf(tierRequired);
    
    console.log('🎯 DEBUG FeatureCards - Current subscription_tier:', subscription_tier);
    console.log('🎯 DEBUG FeatureCards - Required tier:', tierRequired);
    console.log('🎯 DEBUG FeatureCards - Current tier index:', currentTierIndex);
    console.log('🎯 DEBUG FeatureCards - Required tier index:', requiredTierIndex);
    console.log('🎯 DEBUG FeatureCards - Tier hierarchy:', tierHierarchy);
    
    const hasAccess = currentTierIndex >= requiredTierIndex;
    console.log('🎯 DEBUG FeatureCards - Has access result:', hasAccess);
    
    return {
      hasAccess,
      isCurrentTier: subscription_tier === tierRequired,
      needsUpgrade: !hasAccess
    };
  };

  return (
    <div className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Premium Features
        </h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Unlock powerful features designed to help you find meaningful connections faster
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {features.map((feature, index) => {
          const status = getFeatureStatus(feature.tier);
          
          return (
            <Card key={index} className={`relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/80 dark:border-gray-600/50 ${
              status.hasAccess ? 'ring-2 ring-green-500/20' : 'hover:scale-105'
            }`}>
              <CardContent className="p-6 text-center">
                <div className="absolute top-3 right-3">
                  {feature.tier === 'free' ? (
                    <Badge className="bg-blue-500 text-white text-xs">
                      FREE
                    </Badge>
                  ) : status.hasAccess ? (
                    <Badge className="bg-green-500 text-white text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge className={`text-white text-xs bg-gradient-to-r ${
                      feature.tier === 'silver' ? 'from-gray-400 to-gray-500' :
                      feature.tier === 'gold' ? 'from-yellow-400 to-amber-500' :
                      'from-purple-500 to-pink-500'
                    }`}>
                      {feature.tier.toUpperCase()}
                    </Badge>
                  )}
                </div>
                
                <div className={`w-12 h-12 mx-auto mb-4 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center text-white`}>
                  {feature.icon}
                </div>
                
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 text-lg">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                  {feature.description}
                </p>
                
                {feature.tier === 'free' ? (
                  <Button
                    size="sm"
                    className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white`}
                    onClick={() => window.location.href = '/settings'}
                  >
                    {t('verification.getVerified')}
                  </Button>
                ) : !status.hasAccess && (
                  <Button
                    size="sm"
                    className={`w-full bg-gradient-to-r ${feature.gradient} hover:opacity-90 text-white`}
                    onClick={() => window.location.href = '/upgrades'}
                  >
                    Upgrade to {feature.tier.charAt(0).toUpperCase() + feature.tier.slice(1)}
                  </Button>
                )}
                
                {status.hasAccess && (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Ready to use
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
