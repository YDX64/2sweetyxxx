import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/hooks/useLanguage";

interface BioFormProps {
  bio: string;
  isEditing: boolean;
  onBioChange: (bio: string) => void;
}

export const BioForm = ({ bio, isEditing, onBioChange }: BioFormProps) => {
  const { t } = useLanguage();
  const minBioLength = 20;

  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="dark:text-gray-100">{t("about")}</CardTitle>
      </CardHeader>
      <CardContent>
        <label htmlFor="bio" className="sr-only">{t("about")}</label>
        <Textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => onBioChange(e.target.value)}
          placeholder={t("bioPlaceholder")}
          className="min-h-32 resize-none dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
          disabled={!isEditing}
          maxLength={500}
          aria-describedby="bio-help"
        />
        <div id="bio-help" className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-300" aria-live="polite">
          <span>{bio.length < minBioLength ? t("bioMinCharShort", { count: minBioLength - bio.length }) : t("bioMinCharMet")}</span>
          <span>{bio.length}/500</span>
        </div>
      </CardContent>
    </Card>
  );
};
