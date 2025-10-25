
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useTranslation } from "react-i18next";

interface BioCardProps {
  bio: string;
  isEditing: boolean;
  onBioChange: (bio: string) => void;
}

export const BioCard = ({ bio, isEditing, onBioChange }: BioCardProps) => {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('profile.bio.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={t('profile.bio.placeholder')}
          className="min-h-32 resize-none"
          disabled={!isEditing}
          maxLength={500}
        />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{bio.length < 20 ? t('profile.bio.minCharsRemaining', { count: 20 - bio.length }) : t('profile.bio.sufficient')}</span>
          <span>{bio.length}/500</span>
        </div>
      </CardContent>
    </Card>
  );
};
