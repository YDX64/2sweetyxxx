
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart } from "lucide-react";
import { PersonalDetailsForm } from "../../settings/profile/PersonalDetailsForm";

interface PersonalDetailsCardProps {
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

export const PersonalDetailsCard = ({ formData, isEditing, onInputChange }: PersonalDetailsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Kişisel Detaylar
        </CardTitle>
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
