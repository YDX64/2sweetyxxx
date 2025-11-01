import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

interface ProfileCompletionCardProps {
  completionPercentage: number;
}

export const ProfileCompletionCard = ({ completionPercentage }: ProfileCompletionCardProps) => {
  const { t } = useLanguage();

  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t("profileCompletionCardTitle")}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{t("profileCompletionCardDescription")}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-pink-500">
              {completionPercentage}%
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{t("profileCompletionCompletedLabel")}</div>
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-4">
          <div 
            className="bg-gradient-to-r from-pink-500 to-red-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>
        
        {completionPercentage < 100 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            {t("profileCompletionTip")}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

