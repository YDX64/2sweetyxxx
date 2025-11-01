import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useLanguage } from "@/hooks/useLanguage";

interface BasicInfoSectionProps {
  formData: {
    name: string;
    age: string;
    location: string;
    gender: string;
  };
  genderLocked: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const BasicInfoSection = ({ formData, genderLocked, onInputChange }: BasicInfoSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <>
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">{t('name')} *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onInputChange('name', e.target.value)}
            placeholder={t('yourName')}
            required
          />
        </div>
        <div>
          <Label htmlFor="age">{t('age')} *</Label>
          <Input
            id="age"
            type="number"
            min="18"
            max="100"
            value={formData.age}
            onChange={(e) => onInputChange('age', e.target.value)}
            placeholder={t('yourAge')}
            required
          />
        </div>
      </div>

      {/* Gender Selection */}
      <div className="border-2 border-pink-200 rounded-lg p-4 bg-pink-50">
        <Label className="text-base font-semibold text-pink-700">
          {t('gender')} * {genderLocked && `(${t('cannotBeChanged')})`}
        </Label>
        <p className="text-sm text-gray-600 mb-3">
          {genderLocked 
            ? t('genderAlreadySelected') 
            : t('genderCannotBeChangedLater')
          }
        </p>
        <RadioGroup 
          value={formData.gender} 
          onValueChange={(value) => onInputChange('gender', value)}
          disabled={genderLocked}
          className="flex flex-row gap-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="men" id="men" disabled={genderLocked} />
            <Label htmlFor="men" className={genderLocked ? "text-gray-400" : ""}>{t('men')}</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="women" id="women" disabled={genderLocked} />
            <Label htmlFor="women" className={genderLocked ? "text-gray-400" : ""}>{t('women')}</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="location">{t('location')}</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => onInputChange('location', e.target.value)}
          placeholder={t('cityDistrict')}
        />
      </div>
    </>
  );
};
