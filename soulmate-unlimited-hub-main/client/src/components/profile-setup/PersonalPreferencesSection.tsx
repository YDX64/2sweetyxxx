import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { SexualOrientation, InterestedIn } from "@/types/profile";

interface PersonalPreferencesSectionProps {
  formData: {
    religion: string;
    relationship_type: string;
    sexual_orientation: SexualOrientation;
    interested_in: InterestedIn;
  };
  onInputChange: (field: string, value: string) => void;
}

const religionOptions = [
  "islam", "christianity", "judaism", "buddhism", "hinduism",
  "atheist", "agnostic", "spiritual", "other", "prefer_not_to_say"
];

const relationshipTypeOptions = [
  { value: "casual", key: "relationshipType.casual" },
  { value: "serious", key: "relationshipType.serious" },
  { value: "marriage", key: "relationshipType.marriage" },
  { value: "friendship", key: "relationshipType.friendship" }
];

const sexualOrientationOptions = [
  { value: "heterosexual", key: "sexualOrientation.heterosexual" },
  { value: "homosexual", key: "sexualOrientation.homosexual" },
  { value: "bisexual", key: "sexualOrientation.bisexual" },
  { value: "pansexual", key: "sexualOrientation.pansexual" },
  { value: "asexual", key: "sexualOrientation.asexual" }
];

const interestedInOptions = [
  { value: "men", key: "interestedIn.men" },
  { value: "women", key: "interestedIn.women" },
  { value: "both", key: "interestedIn.both" }
];

export const PersonalPreferencesSection = ({ formData, onInputChange }: PersonalPreferencesSectionProps) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Sexual Orientation */}
      <div>
        <Label htmlFor="sexual_orientation">{t("sexualOrientationLabel")}</Label>
        <Select
          value={formData.sexual_orientation}
          onValueChange={(value) => onInputChange('sexual_orientation', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("sexualOrientationPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {sexualOrientationOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Interested In */}
      <div>
        <Label htmlFor="interested_in">{t("interestedInLabel")}</Label>
        <Select
          value={formData.interested_in}
          onValueChange={(value) => onInputChange('interested_in', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("interestedInPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {interestedInOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Religion */}
      <div>
        <Label htmlFor="religion">{t("religion")}</Label>
        <Select
          value={formData.religion}
          onValueChange={(value) => onInputChange('religion', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("religionPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {religionOptions.map((religion) => (
              <SelectItem key={religion} value={religion}>
                {t(`religion.${religion}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Relationship Type */}
      <div>
        <Label htmlFor="relationship_type">{t("relationshipTypeLabel")}</Label>
        <Select
          value={formData.relationship_type}
          onValueChange={(value) => onInputChange('relationship_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder={t("relationshipTypePlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            {relationshipTypeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {t(option.key)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </>
  );
};
