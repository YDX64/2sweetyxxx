import { Input } from "@/components/ui/input";
import { useLanguage } from "@/hooks/useLanguage";

interface BirthDateStepProps {
  value: string;
  onChange: (value: string) => void;
}

export const BirthDateStep = ({ value, onChange }: BirthDateStepProps) => {
  const { t } = useLanguage();
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const formatDateForDisplay = (dateValue: string) => {
    if (!dateValue) return '';
    return dateValue;
  };

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return '';
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const age = calculateAge(value);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.birthDate.question')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <Input
          type="date"
          value={formatDateForDisplay(value)}
          onChange={handleDateChange}
          className="h-14 text-lg rounded-2xl border-2 border-gray-200 focus:border-pink-500 focus:ring-pink-500"
          max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
          min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
        />
        
        {age && age >= 18 && (
          <p className="text-center text-green-600 dark:text-green-400 font-medium">
            {t('onboarding.birthDate.yourAge')} {age}
          </p>
        )}
        
        {age && age < 18 && (
          <p className="text-center text-red-500 dark:text-red-400 font-medium">
            {t('onboarding.birthDate.tooYoung')}
          </p>
        )}
        
        <div className="bg-pink-50 dark:bg-pink-900/20 border-2 border-pink-200 dark:border-pink-800 rounded-lg p-4">
          <p className="text-sm text-pink-700 dark:text-pink-300 font-medium text-center">
            ⚠️ {t('onboarding.birthDate.warning')}
          </p>
        </div>
      </div>
    </div>
  );
};