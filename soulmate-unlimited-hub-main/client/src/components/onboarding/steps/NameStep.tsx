import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";

interface NameStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const NameStep = ({ value, onChange }: NameStepProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('enterYourName')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('enterYourNamePlaceholder')}
          className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
          maxLength={50}
        />
        
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('nameWillBeVisible')}
        </p>
      </div>
    </div>
  );
};