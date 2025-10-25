import { Users, Crown, Heart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const SpecialOffers = () => {
  const { t } = useLanguage();

  return (
    <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-8 border border-gray-200 dark:border-gray-600/50">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("specialOffers")}</h3>
        <p className="text-gray-600 dark:text-gray-300">{t("specialOffersDesc")}</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-700/80 rounded-xl p-6 border border-gray-200 dark:border-gray-600/50 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{t("sixMonthPlan")}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{t("sixMonthPlanDesc")}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700/80 rounded-xl p-6 border border-gray-200 dark:border-gray-600/50 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{t("twelveMonthPlan")}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{t("twelveMonthPlanDesc")}</p>
        </div>
        
        <div className="bg-white dark:bg-gray-700/80 rounded-xl p-6 border border-gray-200 dark:border-gray-600/50 text-center hover:shadow-lg transition-shadow">
          <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{t("firstWeek")}</p>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{t("firstWeekDesc")}</p>
        </div>
      </div>
    </div>
  );
};
