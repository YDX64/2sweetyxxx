
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/hooks/useLanguage";

interface InterestsSectionProps {
  interests: string[];
  onToggleInterest: (interest: string) => void;
}

const interestOptionsKeys = [
  "interest.music", "interest.travel", "interest.food", "interest.sports",
  "interest.books", "interest.movies", "interest.photography",
  "interest.yoga", "interest.nature", "interest.coffee", "interest.art",
  "interest.dance", "interest.technology", "interest.fashion"
];

export const InterestsSection = ({ interests, onToggleInterest }: InterestsSectionProps) => {
  const { t } = useLanguage();
  
  return (
    <div>
      <Label>{t('interestsLabel')}</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {interestOptionsKeys.map((interestKey) => {
          const interestText = t(interestKey);
          return (
            <button
              key={interestKey}
              type="button"
              onClick={() => onToggleInterest(interestText)}
              disabled={!interests.includes(interestText) && interests.length >= 5}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                interests.includes(interestText)
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-pink-100 disabled:opacity-50'
              }`}
            >
              {interestText}
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        {t('interestsSelectionStatus', {
          count: interests.length,
          status: interests.length >= 3 ? t('interestsStatusCheck') : t('interestsStatusWarning')
        })}
      </p>
    </div>
  );
};
