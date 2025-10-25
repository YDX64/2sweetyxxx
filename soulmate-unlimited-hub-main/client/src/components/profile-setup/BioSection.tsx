
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";

interface BioSectionProps {
  bio: string;
  onBioChange: (bio: string) => void;
}

export const BioSection = ({ bio, onBioChange }: BioSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <Label htmlFor="bio">{t('aboutYou')} *</Label>
      <Textarea
        id="bio"
        value={bio}
        onChange={(e) => onBioChange(e.target.value)}
        placeholder={t('introduceYourself')}
        className="min-h-20"
        required
        maxLength={500}
      />
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{bio.length < 20 ? t('minCharsRemaining', { count: 20 - bio.length }) : t('sufficient')}</span>
        <span>{bio.length}/500</span>
      </div>
    </div>
  );
};
