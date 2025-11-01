import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface BasicInfoFormProps {
  formData: {
    name: string;
    age: string;
    email: string;
    location: string;
    gender: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string) => void;
}

export const BasicInfoForm = ({ formData, isEditing, onInputChange }: BasicInfoFormProps) => {
  const { t } = useLanguage();
  const isGenderLocked = !!formData.gender; // Gender is locked once it's set
  
  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="dark:text-gray-100">{t("basicInfoTitle")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name" className="dark:text-gray-200">{t("nameLabel")}</Label>
            <Input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              value={formData.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              placeholder={t("namePlaceholder")}
              disabled={!isEditing}
              className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
          <div>
            <Label htmlFor="age" className="dark:text-gray-200">{t("ageLabel")}</Label>
            <Input
              id="age"
              name="age"
              type="number"
              min="18"
              max="100"
              autoComplete="off"
              value={formData.age}
              onChange={(e) => onInputChange('age', e.target.value)}
              placeholder={t("agePlaceholder")}
              disabled={!isEditing}
              className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="dark:text-gray-200">{t("emailLabel")}</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={formData.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            placeholder={t("emailPlaceholder")}
            disabled={!isEditing}
            className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <div>
          <Label htmlFor="location" className="flex items-center gap-2 dark:text-gray-200">
            <MapPin className="w-4 h-4" />
            {t("locationLabel")}
          </Label>
          <Input
            id="location"
            name="location"
            type="text"
            autoComplete="address-level2"
            value={formData.location}
            onChange={(e) => onInputChange('location', e.target.value)}
            placeholder={t("locationPlaceholder")}
            disabled={!isEditing}
            className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>

        <fieldset>
          <legend className="text-base font-semibold dark:text-gray-100">
            {t("genderLabel")} {isGenderLocked && t("genderLocked")}
          </legend>
          {isGenderLocked && (
            <p className="text-sm text-gray-500 dark:text-gray-300 mb-2">
              {t("genderLockedDescription")}
            </p>
          )}
          <RadioGroup 
            value={formData.gender} 
            onValueChange={(value) => onInputChange('gender', value)}
            disabled={!isEditing || isGenderLocked}
            className="flex flex-row gap-6 mt-2"
            name="gender"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="men" id="men" disabled={!isEditing || isGenderLocked} />
              <Label htmlFor="men" className={(!isEditing || isGenderLocked) ? "text-gray-400" : "dark:text-gray-100"}>{t("men")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="women" id="women" disabled={!isEditing || isGenderLocked} />
              <Label htmlFor="women" className={(!isEditing || isGenderLocked) ? "text-gray-400" : "dark:text-gray-100"}>{t("women")}</Label>
            </div>
          </RadioGroup>
        </fieldset>
      </CardContent>
    </Card>
  );
};
