import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useSubscription } from '@/hooks/useSubscription';
import { subscriptionLimits } from '@/services/subscriptionLimits';
import { boostService } from '@/services/boostService';
import { rewindService } from '@/services/rewindService';
import { TIER_FEATURES } from '@/types/subscription';
import { CheckCircle, XCircle, Crown, Heart, Eye, Filter, Phone, Video, RotateCcw, Zap, MessageCircle, Camera, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/hooks/useLanguage';

interface FeatureTest {
  name: string;
  key: keyof typeof TIER_FEATURES.silver;
  icon: React.ElementType;
  test: () => Promise<boolean>;
  description: string;
}

export const SilverFeatureTest = () => {
  const { user } = useAuth();
  const { features, subscription_tier } = useSubscription();
  const { t } = useLanguage();
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});
  const [testing, setTesting] = useState(false);
  const [remainingLikes, setRemainingLikes] = useState<number>(0);
  const [remainingSuperLikes, setRemainingSuperLikes] = useState<number>(0);
  const [remainingBoosts, setRemainingBoosts] = useState<number>(0);

  const silverFeatures = TIER_FEATURES.silver;

  const featureTests: FeatureTest[] = [
    {
      name: t('silverFeatureTest.features.dailyLikes.name', { count: silverFeatures.dailyLikes }),
      key: 'dailyLikes',
      icon: Heart,
      description: t('silverFeatureTest.features.dailyLikes.description', { count: silverFeatures.dailyLikes }),
      test: async () => {
        return silverFeatures.dailyLikes === 50;
      }
    },
    {
      name: t('silverFeatureTest.features.dailySuperlikes.name', { count: silverFeatures.dailySuperlikes }),
      key: 'dailySuperlikes',
      icon: Star,
      description: t('silverFeatureTest.features.dailySuperlikes.description', { count: silverFeatures.dailySuperlikes }),
      test: async () => {
        return silverFeatures.dailySuperlikes === 5;
      }
    },
    {
      name: t('silverFeatureTest.features.monthlyBoosts.name', { count: silverFeatures.monthlyBoosts }),
      key: 'monthlyBoosts',
      icon: Zap,
      description: t('silverFeatureTest.features.monthlyBoosts.description', { count: silverFeatures.monthlyBoosts }),
      test: async () => {
        return silverFeatures.monthlyBoosts === 1;
      }
    },
    {
      name: t('silverFeatureTest.features.unlimitedMessages.name'),
      key: 'unlimitedMessages',
      icon: MessageCircle,
      description: t('silverFeatureTest.features.unlimitedMessages.description'),
      test: async () => {
        return features.unlimitedMessages === true;
      }
    },
    {
      name: t('silverFeatureTest.features.readReceipts.name'),
      key: 'readReceipts',
      icon: CheckCircle,
      description: t('silverFeatureTest.features.readReceipts.description'),
      test: async () => {
        return features.readReceipts === true;
      }
    },
    {
      name: t('silverFeatureTest.features.advancedFilters.name'),
      key: 'advancedFilters',
      icon: Filter,
      description: t('silverFeatureTest.features.advancedFilters.description'),
      test: async () => {
        return features.advancedFilters === true;
      }
    },
    {
      name: t('silverFeatureTest.features.seeWhoLikesYou.name'),
      key: 'seeWhoLikesYou',
      icon: Eye,
      description: t('silverFeatureTest.features.seeWhoLikesYou.description'),
      test: async () => {
        return features.seeWhoLikesYou === true;
      }
    },
    {
      name: t('silverFeatureTest.features.maxPhotos.name', { count: silverFeatures.maxPhotos }),
      key: 'maxPhotos',
      icon: Camera,
      description: t('silverFeatureTest.features.maxPhotos.description', { count: silverFeatures.maxPhotos }),
      test: async () => {
        return silverFeatures.maxPhotos === 10;
      }
    },
    {
      name: t('silverFeatureTest.features.rewindFeature.name'),
      key: 'rewindFeature',
      icon: RotateCcw,
      description: t('silverFeatureTest.features.rewindFeature.description'),
      test: async () => {
        return features.rewindFeature === true;
      }
    },
    {
      name: t('silverFeatureTest.features.voiceCalls.name'),
      key: 'voiceCalls',
      icon: Phone,
      description: t('silverFeatureTest.features.voiceCalls.description'),
      test: async () => {
        return features.voiceCalls === true;
      }
    },
    {
      name: t('silverFeatureTest.features.videoCalls.name'),
      key: 'videoCalls',
      icon: Video,
      description: t('silverFeatureTest.features.videoCalls.description'),
      test: async () => {
        return features.videoCalls === silverFeatures.videoCalls;
      }
    }
  ];

  useEffect(() => {
    loadUsageLimits();
  }, [user]);

  const loadUsageLimits = async () => {
    if (!user) return;
    
    try {
      const likes = await subscriptionLimits.getRemainingLikes(user.id, subscription_tier || 'registered');
      const superLikes = await subscriptionLimits.getRemainingSuperLikes(user.id, subscription_tier || 'registered');
      const boosts = await boostService.getRemainingBoosts(user.id);
      
      setRemainingLikes(likes);
      setRemainingSuperLikes(superLikes);
      setRemainingBoosts(boosts);
    } catch (error) {
      console.error('Error loading usage limits:', error);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    const results: Record<string, boolean | null> = {};
    
    for (const test of featureTests) {
      try {
        results[test.key] = await test.test();
      } catch (error) {
        console.error(`Test failed for ${test.name}:`, error);
        results[test.key] = false;
      }
    }
    
    setTestResults(results);
    setTesting(false);
    
    const passed = Object.values(results).filter(r => r === true).length;
    const total = Object.keys(results).length;
    
    toast.success(`Tests completed: ${passed}/${total} passed`);
  };

  const testLikeFeature = async () => {
    if (!user) return;
    
    try {
      const result = await subscriptionLimits.checkAndRecordLike(user.id, subscription_tier || 'registered');
      if (result.allowed) {
        toast.success(`Like recorded! Remaining: ${result.remainingUses}`);
        loadUsageLimits();
      } else {
        toast.error(result.reason || 'Cannot like');
      }
    } catch (error) {
      toast.error('Error testing like feature');
    }
  };

  const testSuperLikeFeature = async () => {
    if (!user) return;
    
    try {
      const result = await subscriptionLimits.checkAndRecordSuperLike(user.id, subscription_tier || 'registered');
      if (result.allowed) {
        toast.success(`Super like recorded! Remaining: ${result.remainingUses}`);
        loadUsageLimits();
      } else {
        toast.error(result.reason || 'Cannot super like');
      }
    } catch (error) {
      toast.error('Error testing super like feature');
    }
  };

  const testBoostFeature = async () => {
    if (!user) return;
    
    try {
      const result = await boostService.activateBoost('profile', 30);
      if (result.success) {
        toast.success(result.message);
        loadUsageLimits();
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Error testing boost feature');
    }
  };

  const testRewindFeature = async () => {
    if (!user) return;
    
    try {
      const result = await rewindService.rewindLastSwipe(user.id);
      if (result.success) {
        toast.success('Rewind successful!');
      } else {
        toast.error(result.message || 'Cannot rewind');
      }
    } catch (error) {
      toast.error('Error testing rewind feature');
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t('silverFeatureTest.title')}</h1>
        <p className="text-muted-foreground">
          {t('silverFeatureTest.description', { email: user?.email })}
        </p>
        <Badge variant={subscription_tier === 'silver' ? 'default' : 'destructive'} className="mt-2">
          {t('silverFeatureTest.currentRole')}: {subscription_tier || 'registered'}
        </Badge>
      </div>

      {/* Usage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('silverFeatureTest.stats.dailyLikes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingLikes}/{silverFeatures.dailyLikes}</div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={testLikeFeature}
            >
              {t('silverFeatureTest.buttons.testLike')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('silverFeatureTest.stats.superLikes')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingSuperLikes}/{silverFeatures.dailySuperlikes}</div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={testSuperLikeFeature}
            >
              {t('silverFeatureTest.buttons.testSuperLike')}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">{t('silverFeatureTest.stats.monthlyBoosts')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{remainingBoosts}/{silverFeatures.monthlyBoosts}</div>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={testBoostFeature}
            >
              {t('silverFeatureTest.buttons.testBoost')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Feature Tests */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t('silverFeatureTest.featureTestsTitle')}</CardTitle>
            <Button
              onClick={runAllTests}
              disabled={testing}
            >
              {testing ? t('silverFeatureTest.buttons.testing') : t('silverFeatureTest.buttons.runAll')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {featureTests.map((test) => {
              const Icon = test.icon;
              const result = testResults[test.key];

              return (
                <div
                  key={test.key}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{test.name}</p>
                      <p className="text-sm text-muted-foreground">{test.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {result === null ? (
                      <Badge variant="outline">{t('silverFeatureTest.status.notTested')}</Badge>
                    ) : result ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        {t('silverFeatureTest.status.passed')}
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-4 h-4 mr-1" />
                        {t('silverFeatureTest.status.failed')}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Additional Actions */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{t('silverFeatureTest.additionalTestsTitle')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={testRewindFeature}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              {t('silverFeatureTest.buttons.testRewind')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/likes'}
            >
              <Eye className="w-4 h-4 mr-2" />
              {t('silverFeatureTest.buttons.testSeeLikes')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/discover'}
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('silverFeatureTest.buttons.testAdvancedFilters')}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = '/messages'}
            >
              <Phone className="w-4 h-4 mr-2" />
              {t('silverFeatureTest.buttons.testCalls')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};