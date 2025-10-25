import { MessageCircle, Shield, Zap } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const TrustIndicators = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center mt-12 text-gray-500">
      <div className="flex items-center justify-center gap-8 mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-medium">{t("support247")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          <span className="text-sm font-medium">{t("securePayment")}</span>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          <span className="text-sm font-medium">{t("instantActivation")}</span>
        </div>
      </div>
      <p className="text-sm">{t("cancelAnytime")}</p>
    </div>
  );
};
