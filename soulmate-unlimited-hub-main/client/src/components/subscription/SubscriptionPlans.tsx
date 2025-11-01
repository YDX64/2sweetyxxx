import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Sparkles, CreditCard } from 'lucide-react';
import { subscriptionService, SUBSCRIPTION_TIERS, type SubscriptionTier, type UserSubscription } from '@/services/subscriptionService';
import { paymentService, type PaymentMethod } from '@/services/paymentService';
import ApplePayButton from '@/components/payment/ApplePayButton';
import GooglePayButton from '@/components/payment/GooglePayButton';
import { toast } from '@/hooks/use-toast';

interface SubscriptionPlansProps {
  onPlanSelect?: (tier: typeof SUBSCRIPTION_TIERS[0]) => void;
  showCurrentPlan?: boolean;
  adminMode?: boolean;
  userId?: string;
}

const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({
  onPlanSelect,
  showCurrentPlan = true,
  adminMode = false,
  userId
}) => {
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<PaymentMethod[]>(['stripe']);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod>('stripe');

  useEffect(() => {
    if (showCurrentPlan && !adminMode) {
      loadCurrentSubscription();
    }
  }, [showCurrentPlan, adminMode]);

  const loadCurrentSubscription = async () => {
    try {
      const subscription = await subscriptionService.getCurrentSubscription();
      setCurrentSubscription(subscription);
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const getTierIcon = (tierName: string) => {
    switch (tierName) {
      case 'gold':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'silver':
        return <Star className="w-6 h-6 text-gray-400" />;
      case 'vip':
        return <Sparkles className="w-6 h-6 text-pink-500" />;
      default:
        return <Zap className="w-6 h-6 text-blue-500" />;
    }
  };

  const getTierGradient = (tierName: string) => {
    switch (tierName) {
      case 'gold':
        return 'from-yellow-400 via-yellow-500 to-yellow-600';
      case 'silver':
        return 'from-gray-400 via-gray-500 to-gray-600';
      case 'vip':
        return 'from-pink-400 via-pink-500 to-pink-600';
      default:
        return 'from-blue-400 via-blue-500 to-blue-600';
    }
  };

  const handlePlanSelect = async (tier: typeof SUBSCRIPTION_TIERS[0]) => {
    if (adminMode && userId) {
      // Admin granting subscription
      setLoading(true);
      setSelectedPlan(tier.name);
      
      try {
        // Calculate end date (all tiers are monthly)
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1);
        
        await subscriptionService.syncSubscriptionWithRole(userId, {
          status: 'active',
          tier: tier.name,
          role: tier.name,
          endDate: endDate.toISOString()
        });
        
        toast({
          title: '✅ Subscription Granted',
          description: `${tier.displayName} subscription activated for 30 days`,
          variant: "default"
        });
        
        if (onPlanSelect) {
          onPlanSelect(tier);
        }
      } catch (error) {
        toast({
          title: '❌ Subscription Failed',
          description: 'Failed to grant subscription. Please try again.',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setSelectedPlan(null);
      }
    } else {
      // Regular user subscription
      setLoading(true);
      setSelectedPlan(tier.name);
      
      try {
        // Check if mobile app environment
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
          // Mobile purchase flow
          toast({
            title: '📱 Mobile Purchase',
            description: 'Redirecting to mobile app store...',
            variant: "default"
          });
          
          // This would trigger mobile purchase
          if (onPlanSelect) {
            onPlanSelect(tier);
          }
        } else {
          // Web Stripe checkout
          const successUrl = `${window.location.origin}/subscription/success?tier=${tier.name}`;
          const cancelUrl = `${window.location.origin}/subscription/cancel`;
          
          const checkoutResult = await subscriptionService.createStripeCheckout(
            tier.stripePriceId,
            successUrl,
            cancelUrl
          );
          
          if (checkoutResult?.url) {
            window.location.href = checkoutResult.url;
          } else {
            throw new Error('Failed to create checkout session');
          }
        }
      } catch (error) {
        toast({
          title: '❌ Purchase Failed',
          description: 'Failed to initiate purchase. Please try again.',
          variant: "destructive"
        });
      } finally {
        setLoading(false);
        setSelectedPlan(null);
      }
    }
  };

  const isCurrentPlan = (tierName: string) => {
    return currentSubscription?.tier === tierName && currentSubscription?.status === 'active';
  };

  const canUpgrade = (tierName: string) => {
    if (!currentSubscription || currentSubscription.status !== 'active') return true;
    
    const tierOrder = ['registered', 'silver', 'gold', 'platinum'];
    const currentTierIndex = tierOrder.indexOf(currentSubscription.tier);
    const targetTierIndex = tierOrder.indexOf(tierName);
    
    return targetTierIndex > currentTierIndex;
  };

  const formatPrice = (price: number, interval: string) => {
    return `$${price.toFixed(2)}/${interval === 'year' ? 'year' : 'month'}`;
  };

  return (
    <div className="space-y-6">
      {/* Current Plan Display */}
      {showCurrentPlan && currentSubscription && !adminMode && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getTierIcon(currentSubscription.tier)}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                    Current Plan: {currentSubscription.tier.toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Status: {currentSubscription.status} • 
                    {currentSubscription.currentPeriodEnd && (
                      <span> Expires: {new Date(currentSubscription.currentPeriodEnd).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
              </div>
              <Badge className={`bg-gradient-to-r ${getTierGradient(currentSubscription.tier)} text-white border-0`}>
                {currentSubscription.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {SUBSCRIPTION_TIERS.map((tier) => (
          <Card 
            key={tier.name} 
            className={`relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 ${
              tier.name === 'gold' ? 'ring-2 ring-yellow-400 shadow-lg' : ''
            } ${isCurrentPlan(tier.name) ? 'ring-2 ring-green-400 bg-green-50 dark:bg-green-900/20' : ''}`}
          >
            {/* Popular Badge */}
            {tier.name === 'gold' && (
              <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-3 py-1 text-xs font-bold rounded-bl-lg">
                MOST POPULAR
              </div>
            )}

            {/* Current Plan Badge */}
            {isCurrentPlan(tier.name) && (
              <div className="absolute top-0 left-0 bg-gradient-to-r from-green-400 to-green-500 text-white px-3 py-1 text-xs font-bold rounded-br-lg">
                CURRENT PLAN
              </div>
            )}

            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className={`p-3 rounded-full bg-gradient-to-r ${getTierGradient(tier.name)} shadow-lg`}>
                  {getTierIcon(tier.name)}
                </div>
              </div>
              
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                {tier.displayName}
              </CardTitle>
              
              <div className="space-y-2">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                  {formatPrice(tier.price, tier.interval)}
                </div>
                {tier.interval === 'month' && (
                  <Badge className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                    Save 33%
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Features List */}
              <ul className="space-y-3">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* Action Button */}
              <div className="pt-4">
                {isCurrentPlan(tier.name) ? (
                  <Button 
                    disabled 
                    className="w-full bg-green-500 hover:bg-green-600 text-white"
                  >
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => handlePlanSelect(tier)}
                    disabled={loading}
                    className={`w-full bg-gradient-to-r ${getTierGradient(tier.name)} hover:opacity-90 text-white shadow-lg transition-all duration-300`}
                  >
                    {loading && selectedPlan === tier.name ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </div>
                    ) : adminMode ? (
                      `Grant ${tier.displayName}`
                    ) : (
                      `Upgrade to ${tier.displayName}`
                    )}
                  </Button>
                )}
              </div>

              {/* Mobile App Store Info - Hidden as mobileProductId not in tier structure */}
              {/* {tier.mobileProductId && !adminMode && (
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    📱 Also available in mobile app
                  </p>
                </div>
              )} */}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Info */}
      {!adminMode && (
        <div className="text-center space-y-4 pt-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
              🔒 Secure Payment & Privacy
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              All payments are processed securely through Stripe. We never store your payment information.
              Cancel anytime from your account settings.
            </p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span>✓ 30-day money back guarantee</span>
            <span>✓ Cancel anytime</span>
            <span>✓ Instant activation</span>
            <span>✓ 24/7 support</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
