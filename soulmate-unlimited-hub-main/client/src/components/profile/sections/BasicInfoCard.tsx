import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface BasicInfoCardProps {
  formData: {
    name: string;
    age: string;
    location: string;
    gender: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
  genderLocked?: boolean;
  birthDateLocked?: boolean;
}

export const BasicInfoCard = ({ formData, isEditing, onInputChange, genderLocked = false, birthDateLocked = false }: BasicInfoCardProps) => {
  const { t } = useLanguage();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t('basicInfo')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">{t('name')} *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => onInputChange("name", e.target.value)}
              placeholder={t('yourName')}
              disabled={!isEditing}
            />
          </div>
          <div>
            <Label htmlFor="age">{t('age')} * {birthDateLocked && `(${t('cannotBeChanged')})`}</Label>
            <Input
              id="age"
              type="number"
              min="18"
              max="100"
              value={formData.age}
              onChange={(e) => onInputChange("age", e.target.value)}
              placeholder={t('yourAge')}
              disabled={!isEditing || birthDateLocked}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="location">
            <MapPin className="w-4 h-4 inline mr-1" />
            {t('location')}
          </Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => onInputChange("location", e.target.value)}
            placeholder={t('cityDistrict')}
            disabled={!isEditing}
          />
        </div>

        {/* Gender - show but don't allow editing if already set */}
        <div>
          <Label className="text-base font-semibold">
            {t('gender')} {genderLocked && `(${t('cannotBeChanged')})`}
          </Label>
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => onInputChange("gender", value)}
            disabled={!isEditing || genderLocked}
            className="flex flex-row gap-6 mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="men" id="men" disabled={!isEditing || genderLocked} />
              <Label htmlFor="men" className={(!isEditing || genderLocked) ? "text-gray-400" : ""}>{t('men')}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="women" id="women" disabled={!isEditing || genderLocked} />
              <Label htmlFor="women" className={(!isEditing || genderLocked) ? "text-gray-400" : ""}>{t('women')}</Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};
