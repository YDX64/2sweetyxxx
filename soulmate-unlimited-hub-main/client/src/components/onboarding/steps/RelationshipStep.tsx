import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

interface RelationshipStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const RelationshipStep = ({ value, onChange }: RelationshipStepProps) => {
  const { t } = useLanguage();
  
  const relationshipOptions = [
    { value: 'long_term', label: t('onboarding.relationship.longTerm') },
    { value: 'long_term_open_to_short', label: t('onboarding.relationship.longTermOpenToShort') },
    { value: 'short_term_open_to_long', label: t('onboarding.relationship.shortTermOpenToLong') },
    { value: 'short_term_fun', label: t('onboarding.relationship.shortTermFun') },
    { value: 'new_friends', label: t('onboarding.relationship.newFriends') },
    { value: 'still_figuring_out', label: t('onboarding.relationship.stillFiguringOut') },
  ];
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.relationship.question')}
        </h1>
      </div>
      
      <div className="space-y-3">
        <RadioGroup 
          value={value} 
          onValueChange={onChange}
          className="space-y-3"
        >
          {relationshipOptions.map((option) => (
            <div 
              key={option.value}
              className="flex items-center space-x-3 p-3 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-colors cursor-pointer"
            >
              <RadioGroupItem value={option.value} id={option.value} className="w-5 h-5" />
              <Label 
                htmlFor={option.value}
                className="flex-1 text-base cursor-pointer"
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