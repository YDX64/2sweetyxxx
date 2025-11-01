import { SwipeInterface } from "@/components/SwipeInterface";
import { SwipeStats } from "@/components/SwipeStats";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";
import { Tables } from "@/integrations/supabase/types";
import { HeartCrack } from "lucide-react";
import { AdBanner } from "@/components/ads/AdBanner";
import { ProfileSkeleton } from "@/components/discovery/ProfileSkeleton";

type Profile = Tables<'profiles'>;

interface MainContentProps {
  profiles: Profile[];
  profilesLoading: boolean;
  stats: {
    likes: number;
    passes: number;
    superLikes: number;
    matches: number;
  };
  onSwipe: (userId: string, direction: 'left' | 'right') => Promise<boolean>;
  onSuperLike: (userId: string) => Promise<boolean>;
  onRefresh: () => void;
  onRewind?: (rewindedProfileId?: string) => void;
}

export const MainContent = ({ 
  profiles, 
  profilesLoading, 
  stats, 
  onSwipe, 
  onSuperLike, 
  onRefresh,
  onRewind
}: MainContentProps) => {
  const { t } = useLanguage();

  if (profilesLoading) {
    return (
      <div>
        <SwipeStats {...stats} />
        <div className="max-w-sm mx-auto mt-6">
          <ProfileSkeleton />
        </div>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="mb-2">
          <HeartCrack className="w-12 h-12 text-gray-400 mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">
          {t('noMoreProfiles')}
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {t('checkBackLater')}
        </p>
        <SwipeStats {...stats} />
        <Button
          onClick={onRefresh}
          className="bg-pink-500 hover:bg-pink-600"
        >
          {t('refresh')}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Top Ad Banner - Fixed position */}
      <div className="w-full h-[50px] flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-sm z-10">
        <AdBanner format="banner" slot="header" className="w-full h-full" />
      </div>
      
      {/* Main content area - Takes remaining space with scrolling */}
      <div className="flex-1 overflow-y-auto pt-2">
        <div className="container mx-auto max-w-md h-full flex flex-col">
          <div className="flex-1 flex flex-col items-center justify-start px-2 pb-4">
            <div className="w-full max-w-[400px] h-[calc(100vh-280px)] min-h-[500px] max-h-[600px] my-4">
              <SwipeInterface 
                users={profiles} 
                onSwipe={onSwipe}
                onSuperLike={onSuperLike}
                onRewind={onRewind}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Ad Banner - Fixed position */}
      <div className="w-full flex-shrink-0 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-t border-gray-200 dark:border-gray-600/50 z-10">
        <AdBanner format="native" slot="footer" className="w-full" />
      </div>
      
      {/* Spacer to ensure content isn't hidden behind the bottom ad banner */}
      <div className="h-[80px] w-full flex-shrink-0"></div>
    </div>
  );
};
