
import { Heart, Star, X, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface SwipeStatsProps {
  likes: number;
  passes: number;
  superLikes: number;
  matches: number;
}

export const SwipeStats = ({ likes, passes, superLikes, matches }: SwipeStatsProps) => {
  const { t } = useTranslation();
  const total = likes + passes;
  const likeRate = total > 0 ? Math.round((likes / total) * 100) : 0;

  return (
    <Card className="w-full max-w-md mx-auto bg-card border-border">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('todaysStatistics')}</h3>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mx-auto mb-2">
              <Heart className="w-6 h-6 text-green-500 fill-current" />
            </div>
            <div className="text-2xl font-bold text-green-500 dark:text-yellow-300">{likes}</div>
            <div className="text-sm text-muted-foreground dark:text-yellow-500">{t('likesStats')}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-red-500/20 rounded-full mx-auto mb-2">
              <X className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-500 dark:text-cyan-300">{passes}</div>
            <div className="text-sm text-muted-foreground dark:text-cyan-500">{t('passesStats')}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-full mx-auto mb-2">
              <Star className="w-6 h-6 text-blue-500 fill-current" />
            </div>
            <div className="text-2xl font-bold text-blue-500">{superLikes}</div>
            <div className="text-sm text-muted-foreground">Super Likes</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-pink-500/20 rounded-full mx-auto mb-2">
              <Heart className="w-6 h-6 text-pink-500 fill-current" />
            </div>
            <div className="text-2xl font-bold text-pink-500">{matches}</div>
            <div className="text-sm text-muted-foreground">{t('matchesStats')}</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{likeRate}%</div>
            <div className="text-sm text-muted-foreground">{t('likeRate')}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
