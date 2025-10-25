import { UnifiedSubscriptionCard } from "@/components/subscription/UnifiedSubscriptionCard";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/hooks/useLanguage";

export const SubscriptionSettings = () => {
  const navigate = useNavigate();
  const { manageSubscription } = useSubscription();
  const { t } = useLanguage();

  const handleUpgrade = () => {
    navigate('/upgrades');
  };

  const handleManageSubscription = async () => {
    try {
      await manageSubscription();
    } catch (error) {
      toast({
        title: t('toast.error.title'),
        description: t('toast.error.subscriptionPortal'),
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {t('subscription.title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {t('subscription.description')}
        </p>
      </div>

      {/* Unified Subscription Card */}
      <UnifiedSubscriptionCard
        onUpgradeClick={handleUpgrade}
        onManageClick={handleManageSubscription}
      />
    </div>
  );
};