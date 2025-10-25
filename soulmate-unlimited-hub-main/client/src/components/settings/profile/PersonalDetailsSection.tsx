import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalDetailsForm } from "./PersonalDetailsForm";
import { useLanguage } from "@/hooks/useLanguage";

interface PersonalDetailsSectionProps {
  formData: {
    religion: string;
    languages: string[];
    education: string;
    occupation: string;
    drinking: string;
    smoking: string;
    exercise: string;
    relationship_type: string;
    children: string;
    height: string;
    zodiac_sign: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string | string[]) => void;
}

export const PersonalDetailsSection = ({ 
  formData, 
  isEditing, 
  onInputChange 
}: PersonalDetailsSectionProps) => {
  const { t } = useLanguage();
  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="dark:text-gray-100">{t("personalDetailsTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <PersonalDetailsForm
          formData={formData}
          isEditing={isEditing}
          onInputChange={onInputChange}
        />
      </CardContent>
    </Card>
  );
};
