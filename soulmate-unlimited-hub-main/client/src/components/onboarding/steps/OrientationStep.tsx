import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { SexualOrientation } from "@/types/profile";
import { useLanguage } from "@/hooks/useLanguage";

interface OrientationStepProps {
  value: SexualOrientation;
  onChange: (value: SexualOrientation) => void;
}

export const OrientationStep = ({ value, onChange }: OrientationStepProps) => {
  const { t } = useLanguage();
  
  const orientationOptions = [
    { value: 'heterosexual' as SexualOrientation, label: t('onboarding.orientation.heterosexual') },
    { value: 'homosexual' as SexualOrientation, label: t('onboarding.orientation.homosexual') },
    { value: 'bisexual' as SexualOrientation, label: t('onboarding.orientation.bisexual') },
    { value: 'pansexual' as SexualOrientation, label: t('onboarding.orientation.pansexual') },
    { value: 'asexual' as SexualOrientation, label: t('onboarding.orientation.asexual') },
  ];
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.orientation.question')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="space-y-4"
        >
          {orientationOptions.map((option) => (
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