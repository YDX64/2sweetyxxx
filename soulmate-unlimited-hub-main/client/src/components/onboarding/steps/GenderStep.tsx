import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

interface GenderStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const GenderStep = ({ value, onChange }: GenderStepProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.gender.question')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="space-y-4"
        >
          <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors cursor-pointer">
            <RadioGroupItem value="women" id="women" className="w-5 h-5" />
            <Label htmlFor="women" className="flex-1 text-lg cursor-pointer">{t('onboarding.gender.female')}</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors cursor-pointer">
            <RadioGroupItem value="men" id="men" className="w-5 h-5" />
            <Label htmlFor="men" className="flex-1 text-lg cursor-pointer">{t('onboarding.gender.male')}</Label>
          </div>
          
          <div className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors cursor-pointer">
            <RadioGroupItem value="other" id="other" className="w-5 h-5" />
            <Label htmlFor="other" className="flex-1 text-lg cursor-pointer">{t('onboarding.gender.other')}</Label>
          </div>
        </RadioGroup>
        
        <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-lg p-4">
          <p className="text-sm text-pink-700 dark:text-pink-300 font-medium text-center">
            ⚠️ {t('onboarding.gender.warning')}
          </p>
        </div>
      </div>
    </div>
  );
};