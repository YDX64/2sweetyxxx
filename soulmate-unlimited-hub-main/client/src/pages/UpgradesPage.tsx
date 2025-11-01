import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { UpgradeHero } from "@/components/upgrades/UpgradeHero";
import { FeatureCards } from "@/components/upgrades/FeatureCards";
import { PricingPlans } from "@/components/upgrades/PricingPlans";
import { SpecialOffers } from "@/components/upgrades/SpecialOffers";
import { TrustIndicators } from "@/components/upgrades/TrustIndicators";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { SubscriptionCelebration } from "@/components/subscription/SubscriptionCelebration";

export const UpgradesPage = () => {
  const { user, refreshSession } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { createCheckout, checkSubscription } = useSubscription();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [isUpdatingSubscription, setIsUpdatingSubscription] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const successHandledRef = useRef(false);

  // Check for success parameter on mount
  useEffect(() => {
    const success = searchParams.get('success');
    
    // Only process if we haven't already handled it and success is true
    if (success === 'true' && user && !successHandledRef.current) {
      successHandledRef.current = true;
      setIsUpdatingSubscription(true);
      
      // Remove success parameter from URL immediately
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('success');
      navigate(`/upgrades${newSearchParams.toString() ? `?${newSearchParams.toString()}` : ''}`, { replace: true });

      // Handle the success flow
      const handleSuccess = async () => {
        try {
          // Refresh authentication session first
          await refreshSession();
          
          // Invalidate all queries to force fresh data
          await queryClient.invalidateQueries();
          
          // Force refresh
          await checkSubscription();
          
          // Wait a bit more and refresh again
          await new Promise(resolve => setTimeout(resolve, 1000));
          await checkSubscription();
          
          // Hide loading and show celebration
          setIsUpdatingSubscription(false);
          setShowCelebration(true);
          
          // Navigate after celebration
          setTimeout(() => {
            navigate('/');
          }, 5000);
        } catch (error) {
          console.error('Error updating subscription:', error);
          setIsUpdatingSubscription(false);
          toast({
            title: t('error'),
            description: t('subscriptionUpdateError') || 'There was an error updating your subscription. Please refresh the page.',
            variant: "destructive"
          });
        }
      };

      // Start the process after a short delay to allow webhook to process
      setTimeout(handleSuccess, 3000);
    }
  }, [searchParams, user]);

  const handlePurchase = async (planName: string) => {
    if (!user) {
      toast({
        title: t('authenticationRequired'),
        description: t('pleaseLoginToSubscribe'),
        variant: "destructive"
      });
      return;
    }

    setProcessingPlan(planName);
    try {
      await createCheckout(planName, billingCycle);
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 pb-24">
        {isUpdatingSubscription && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md mx-auto text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-500 mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('updatingSubscription') || 'Updating your subscription...'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {t('pleaseWait') || 'Please wait while we activate your premium features.'}
              </p>
            </div>
          </div>
        )}
        <div className="max-w-6xl mx-auto">
          <UpgradeHero />
          <PricingPlans 
            billingCycle={billingCycle}
            setBillingCycle={setBillingCycle}
            processingPlan={processingPlan}
            onPurchase={handlePurchase}
          />
          <FeatureCards />
          <SpecialOffers />
          <TrustIndicators />
          
          {/* FAQ Section - En altta */}
          <div className="bg-gray-100 dark:bg-gray-800/50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {t('faqTitle')}
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {t('faqAccountQ1')}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('faqAccountA1')}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">
                  {t('faqAccountQ2')}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {t('faqAccountA2')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <NavigationBar />
      
      {/* Subscription Celebration */}
      <SubscriptionCelebration 
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
      />
    </div>
  );
};
