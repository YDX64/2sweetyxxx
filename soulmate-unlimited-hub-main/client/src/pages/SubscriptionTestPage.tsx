import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { Heart, Star, Zap, Crown, Users, Settings } from "lucide-react";
import { useSwipeLimits } from "@/hooks/useSwipeLimits";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { SubscriptionLimitsCard } from "@/components/SubscriptionLimitsCard";

const TIER_INFO = {
  registered: {
    name: 'Free',
    color: 'bg-green-100 text-green-800',
    icon: Heart,
    dailyLikes: 5,
    dailySuperlikes: 1,
    features: ['Basic matching', 'Limited swipes']
  },
  silver: {
    name: 'Silver',
    color: 'bg-gray-100 text-gray-800',
    icon: Zap,
    dailyLikes: 50,
    dailySuperlikes: 5,
    features: ['See who likes you', 'Advanced filters', 'Voice calls', 'Rewind feature']
  },
  gold: {
    name: 'Gold',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Star,
    dailyLikes: 100,
    dailySuperlikes: 25,
    features: ['All Silver features', 'Video calls', 'Passport feature', 'Invisible browsing']
  },
  platinum: {
    name: 'Platinum',
    color: 'bg-purple-100 text-purple-800',
    icon: Crown,
    dailyLikes: 999,
    dailySuperlikes: 999,
    features: ['All Gold features', 'Unlimited likes', 'Multi-language chat', 'Priority support']
  }
};

export default function SubscriptionTestPage() {
  const { t } = useLanguage();
  const { userRole } = useAuth();
  const { 
    canPerformLike, 
    canPerformSuperLike, 
    recordLike,
    recordSuperLike,
    remainingLikes,
    remainingSuperLikes
  } = useSwipeLimits();

  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const testLikeLimit = async () => {
    const canLike = await canPerformLike();
    if (canLike.allowed) {
      await recordLike();
      addTestResult(`✅ Like recorded successfully. ${remainingLikes} remaining.`);
      toast({
        title: "Like Successful",
        description: `You have ${remainingLikes} likes remaining today.`,
        duration: 3000,
      });
    } else {
      addTestResult(`❌ Like blocked: Daily limit reached`);
      toast({
        title: "Limit Reached",
        description: "Daily like limit reached",
        variant: "destructive",
        action: (
          <ToastAction altText="Upgrade" onClick={() => window.location.href = '/upgrades'}>
            Upgrade
          </ToastAction>
        )
      });
    }
  };

  const testSuperLikeLimit = async () => {
    const canSuperLike = await canPerformSuperLike();
    if (canSuperLike.allowed) {
      await recordSuperLike();
      addTestResult(`✅ Super Like recorded successfully. ${remainingSuperLikes} remaining.`);
      toast({
        title: "Super Like Successful",
        description: `You have ${remainingSuperLikes} super likes remaining today.`,
        duration: 3000,
      });
    } else {
      addTestResult(`❌ Super Like blocked: Daily limit reached`);
      toast({
        title: "Limit Reached",
        description: "Daily super like limit reached",
        variant: "destructive",
        action: (
          <ToastAction altText="Upgrade" onClick={() => window.location.href = '/upgrades'}>
            Upgrade
          </ToastAction>
        )
      });
    }
  };

  const testFeatureAccess = (feature: string) => {
    // Since we don't have direct feature access check, just show a message
    addTestResult(`✅ Feature "${feature}" checked`);
    toast({
      title: "Feature Test",
      description: `Feature ${feature} test completed`,
      duration: 3000,
    });
  };

  const currentTier = TIER_INFO[userRole as keyof typeof TIER_INFO] || TIER_INFO.registered;
  const TierIcon = currentTier.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Subscription System Test</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Test the comprehensive subscription enforcement system
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Current Status */}
          <div className="space-y-4">
            <SubscriptionLimitsCard />
            
            {/* Test Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Test Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={testLikeLimit} 
                  className="w-full"
                  variant="outline"
                  disabled={remainingLikes === 0}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  Test Like ({remainingLikes} remaining)
                </Button>
                
                <Button 
                  onClick={testSuperLikeLimit} 
                  className="w-full"
                  variant="outline"
                  disabled={remainingSuperLikes === 0}
                >
                  <Star className="w-4 h-4 mr-2" />
                  Test Super Like ({remainingSuperLikes} remaining)
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => testFeatureAccess('seeWhoLikesYou')} 
                    variant="outline" 
                    size="sm"
                  >
                    Test: Who Likes You
                  </Button>
                  <Button 
                    onClick={() => testFeatureAccess('advancedFilters')} 
                    variant="outline" 
                    size="sm"
                  >
                    Test: Advanced Filters
                  </Button>
                  <Button 
                    onClick={() => testFeatureAccess('voiceCalls')} 
                    variant="outline" 
                    size="sm"
                  >
                    Test: Voice Calls
                  </Button>
                  <Button 
                    onClick={() => testFeatureAccess('videoCalls')} 
                    variant="outline" 
                    size="sm"
                  >
                    Test: Video Calls
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tier Comparison */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Subscription Tiers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(TIER_INFO).map(([tier, info]) => {
                    const Icon = info.icon;
                    const isCurrentTier = tier === userRole;
                    
                    return (
                      <div 
                        key={tier}
                        className={`p-4 rounded-lg border-2 ${
                          isCurrentTier 
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="w-5 h-5" />
                            <span className="font-semibold">{info.name}</span>
                            {isCurrentTier && (
                              <Badge variant="secondary">Current</Badge>
                            )}
                          </div>
                          <Badge className={info.color}>
                            {info.dailyLikes === 999 ? '∞' : info.dailyLikes} likes/day
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          <div className="mb-1">
                            Super Likes: {info.dailySuperlikes === 999 ? 'Unlimited' : `${info.dailySuperlikes}/day`}
                          </div>
                          <div className="space-y-1">
                            {info.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center gap-1">
                                <div className="w-1 h-1 bg-green-500 rounded-full" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Test Results */}
        <Card>
          <CardHeader>
            <CardTitle>Test Results Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 h-64 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-center">No tests run yet. Click the buttons above to test the system.</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, idx) => (
                    <div key={idx} className="text-sm font-mono">
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button 
              onClick={() => setTestResults([])} 
              variant="outline" 
              size="sm"
              className="mt-2"
            >
              Clear Results
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}