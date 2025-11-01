
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";

const getInterestOptions = (t: any) => [
  t('interestMusic'), t('interestTravel'), t('interestFood'), t('interestSports'), 
  t('interestBooks'), t('interestMovies'), t('interestPhotography'),
  t('interestYoga'), t('interestNature'), t('interestCoffee'), t('interestArt'), 
  t('interestDancing'), t('interestTechnology'), t('interestFashion'), t('interestGaming'),
  t('interestFitness'), t('interestReading'), t('interestSwimming'), t('interestRunning'), 
  t('interestCycling'), t('interestHiking'), t('interestCamping')
];

interface InterestsCardProps {
  interests: string[];
  isEditing: boolean;
  onToggleInterest: (interest: string) => void;
}

export const InterestsCard = ({ interests, isEditing, onToggleInterest }: InterestsCardProps) => {
  const { t } = useLanguage();
  const interestOptions = getInterestOptions(t);
  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('interestsTitle')} ({t('maxInterests', { max: 8 })})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {interestOptions.map((interest) => (
            <Badge
              key={interest}
              variant={interests.includes(interest) ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                !isEditing 
                  ? "cursor-default" 
                  : interests.includes(interest)
                  ? 'bg-pink-500 hover:bg-pink-600 text-white'
                  : 'hover:bg-pink-100 hover:border-pink-300'
              } ${
                !interests.includes(interest) && 
                interests.length >= 8 && 
                isEditing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={() => {
                if (isEditing && (interests.includes(interest) || interests.length < 8)) {
                  onToggleInterest(interest);
                }
              }}
            >
              {interest}
            </Badge>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          {interests.length}/8 {t('selected')} • {interests.length >= 3 ? "✓" : "⚠️"} {t('selectAtLeast', { min: 3 })}
        </p>
      </CardContent>
    </Card>
  );
};
