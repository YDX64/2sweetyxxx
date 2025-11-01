import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface InterestsFormProps {
  interests: string[];
  isEditing: boolean;
  onToggleInterest: (interest: string) => void;
}

const INTEREST_OPTIONS = [
  'travel', 'photography', 'coffee', 'art', 'cooking', 'music',
  'dance', 'yoga', 'meditation', 'books', 'technology', 'gaming',
  'climbing', 'fitness', 'workout', 'nature', 'piano', 'violin',
  'jazz', 'architecture', 'design', 'cycling', 'food', 'literature',
  'writing', 'poetry', 'tea', 'animals', 'veterinary'
];

export const InterestsForm = ({ interests, isEditing, onToggleInterest }: InterestsFormProps) => {
  const { t } = useLanguage();

  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Heart className="w-5 h-5 text-pink-500" />
          {t("interests")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map(interest => {
            const isSelected = interests.includes(interest);
            const canSelect = interests.length < 10 || isSelected;
            
            return (
              <Badge
                key={interest}
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer transition-colors ${
                  !isEditing 
                    ? 'opacity-70 cursor-not-allowed'
                    : !canSelect
                    ? 'opacity-50 cursor-not-allowed'
                    : isSelected
                    ? 'bg-pink-500 text-white hover:bg-pink-600'
                    : 'hover:bg-pink-50/70 dark:hover:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600/50 border-gray-200/70'
                }`}
                onClick={() => {
                  if (isEditing && canSelect) {
                    onToggleInterest(interest);
                  }
                }}
              >
                {t(`interest.${interest}`)}
              </Badge>
            );
          })}
        </div>
        
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-300">
          <p>{interests.length}/10 {t("interestsSelected")}</p>
          {!isEditing && (
            <p className="text-xs mt-1">{t("editToChangeInterests")}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
