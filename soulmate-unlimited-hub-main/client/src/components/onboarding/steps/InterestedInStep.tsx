import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { InterestedIn } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";

interface InterestedInStepProps {
  value: InterestedIn;
  onChange: (value: InterestedIn) => void;
}

export const InterestedInStep = ({ value, onChange }: InterestedInStepProps) => {
  const { t } = useLanguage();
  
  const interestedInOptions = [
    { value: 'women' as InterestedIn, label: t('onboarding.interestedIn.women') },
    { value: 'men' as InterestedIn, label: t('onboarding.interestedIn.men') },
    { value: 'both' as InterestedIn, label: t('onboarding.interestedIn.both') },
  ];
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.interestedIn.question')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <RadioGroup 
          value={value} 
          onValueChange={onChange}
          className="space-y-4"
        >
          {interestedInOptions.map((option) => (
            <div 
              key={option.value}
              className="flex items-center space-x-3 p-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option.value} id={option.value} className="w-5 h-5" />
              <Label 
                htmlFor={option.value}
                className="flex-1 text-lg cursor-pointer"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
};