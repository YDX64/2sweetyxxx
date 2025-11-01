import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Heart, Sparkles, Check, Loader2, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/hooks/useLanguage";
import { BillingToggle } from "./BillingToggle";
import { ROLE_INFO, UserRole, getRoleInfo } from "@/types/roles";

interface PricingPlansProps {
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  processingPlan: string | null;
  onPurchase: (planName: string) => Promise<void>;
}

export const PricingPlans = ({ billingCycle, setBillingCycle, processingPlan, onPurchase }: PricingPlansProps) => {
  const { subscribed, subscription_tier, loading, manageSubscription } = useSubscription();
  const { t } = useLanguage();

  const plans = [
    {
      roleKey: 'silver' as UserRole,
      popular: false,
      icon: <Heart className="w-8 h-8" />,
      discount: billingCycle === 'monthly' ? t('discount33') : t('discount44'),
    },
    {
      roleKey: 'gold' as UserRole,
      popular: true,
      icon: <Star className="w-8 h-8" />,
      discount: t('mostPopular'),
    },
    {
      roleKey: 'platinum' as UserRole,
      popular: false,
      icon: <Crown className="w-8 h-8" />,
      discount: billingCycle === 'monthly' ? t('discount25') : t('discount37'),
    }
  ];

  const isCurrentPlan = (roleKey: UserRole) => {
    return subscribed && subscription_tier === roleKey;
  };

  const formatPrice = (price: number) => {
    // Always use USD currency symbol across all languages - CRITICAL FOR PAYMENT SYSTEM
    // Convert cents to dollars (999 cents = $9.99)
    return `$${(price / 100).toFixed(2)}`;
  };

  const calculateOriginalPrice = (price: number, roleKey: UserRole) => {
    const discounts: Record<UserRole, { monthly: number; yearly: number }> = {
      silver: { monthly: 0.33, yearly: 0.44 },
      gold: { monthly: 0.20, yearly: 0.30 },
      platinum: { monthly: 0.25, yearly: 0.37 },
      registered: { monthly: 0, yearly: 0 },
      moderator: { monthly: 0, yearly: 0 },
      admin: { monthly: 0, yearly: 0 },
    };
    
    const discount = billingCycle === 'monthly' 
      ? discounts[roleKey].monthly 
      : discounts[roleKey].yearly;
    
    return Math.round(price / (1 - discount));
  };

  return (
    <div>
      {/* Billing Toggle - Fiyat kartlarının hemen üstünde */}
      <BillingToggle billingCycle={billingCycle} setBillingCycle={setBillingCycle} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        {plans.map((plan, index) => {
          const roleInfo = getRoleInfo(plan.roleKey, t);
          const isActive = isCurrentPlan(plan.roleKey);
          const isProcessing = processingPlan === plan.roleKey;
          const price = billingCycle === 'monthly' ? roleInfo.monthlyPrice : roleInfo.yearlyPrice;
          const originalPrice = calculateOriginalPrice(price, plan.roleKey);
          
          return (
            <Card key={index} className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-2xl dark:bg-gray-800/80 ${
              plan.popular 
                ? 'border-gradient-to-r from-yellow-400 to-amber-500 scale-105 shadow-xl' 
                : isActive
                ? 'border-green-500 shadow-lg'
                : 'border-gray-200 dark:border-gray-600/50 hover:border-gray-300 dark:hover:border-gray-500/50'
            }`}>
              
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-400 to-amber-500 text-gray-900 text-center py-3 text-sm font-semibold">
                  {plan.discount}
                </div>
              )}

              {isActive && (
                <div className="absolute top-0 left-0 right-0 bg-green-500 text-white text-center py-3 text-sm font-semibold">
                  {t('currentPlan')}
                </div>
              )}
              
              <CardHeader className={`text-center ${plan.popular || isActive ? 'pt-16' : 'pt-8'} pb-4`}>
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-r ${roleInfo.bgGradient} flex items-center justify-center mb-4`}>
                  <div className="text-white">
                    {plan.icon}
                  </div>
                </div>
                
                <div className="flex items-center justify-center gap-2 mb-4">
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {roleInfo.badge}
                  </CardTitle>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-4">{roleInfo.description}</p>
                
                <div className="space-y-1">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-4xl font-bold text-gray-900 dark:text-gray-100">
                      {formatPrice(price)}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                      {billingCycle === 'monthly' ? t('month') : t('year')}
                    </span>
                  </div>
                  {originalPrice > price && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      {formatPrice(originalPrice)}
                    </div>
                  )}
                  {billingCycle === 'yearly' && (
                    <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {t('monthly')} {formatPrice(Math.round(price / 12))} 
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="px-6 pb-8">
                <ul className="space-y-4 mb-8">
                  {roleInfo.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {isActive ? (
                  <Button 
                    onClick={manageSubscription}
                    className="w-full h-12 text-base font-semibold bg-green-500 hover:bg-green-600 text-white transition-all duration-300"
                  >
                    {t('manageSubscription')}
                  </Button>
                ) : (
                  <Button 
                    onClick={() => onPurchase(plan.roleKey)}
                    disabled={isProcessing || loading}
                    className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-500 hover:to-amber-600 text-gray-900'
                        : `bg-gradient-to-r ${roleInfo.bgGradient} text-white`
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('processing')}
                      </>
                    ) : (
                      t('choosePlan')
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Trust Badges */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-8">
        <div className="flex items-center justify-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{t('instantAccess')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{t('securePayment')}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-green-500" />
            <span>{t('cancelAnytime')}</span>
          </div>
        </div>
      </div>

    </div>
  );
};
