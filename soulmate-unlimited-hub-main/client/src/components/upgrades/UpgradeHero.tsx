import { Crown, Star } from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { useLanguage } from "@/hooks/useLanguage";

export const UpgradeHero = () => {
  const { t } = useLanguage();
  const { isPremiumUser, subscription_tier, subscription_end } = useSubscription();
  const isPremium = isPremiumUser();

  return (
    <div className="text-center mb-16">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full mb-6">
        <Crown className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {t('upgradeToPremiumTitle')}
      </h1>
      {isPremium && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-lg">
          <p className="text-green-800 dark:text-green-200 font-medium">
            {subscription_tier === 'admin' ? (
              <span>{t('adminAccess')}</span>
            ) : subscription_tier === 'moderator' ? (
              <span>{t('moderatorAccess')}</span>
            ) : (
              <>
                {t('activeSubscription', { tier: subscription_tier ? subscription_tier.charAt(0).toUpperCase() + subscription_tier.slice(1) : 'Premium' })}
                {subscription_end && (
                  <span className="block text-sm text-green-600 dark:text-green-300 mt-1">
                    {t('subscriptionEnds', { 
                      date: (() => {
                        try {
                          return new Date(subscription_end).toLocaleDateString('tr-TR');
                        } catch {
                          return subscription_end;
                        }
                      })()
                    })}
                  </span>
                )}
              </>
            )}
          </p>
        </div>
      )}
      <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
        {t('premiumDesc')}
      </p>
      <div className="flex items-center justify-center gap-2 text-amber-500 mb-8">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-current" />
        ))}
        <span className="text-gray-700 dark:text-gray-300 ml-2 font-medium">{t('userRating')}</span>
      </div>
    </div>
  );
};
