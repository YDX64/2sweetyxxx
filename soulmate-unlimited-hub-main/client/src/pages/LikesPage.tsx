import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MapPin, Eye, Crown, Star, Sparkles, Clock, X, Check, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { seeWhoLikesYouService, type LikeInfo, type LikeStats } from "@/services/seeWhoLikesYouService";
import { likesService } from "@/services/likesService";
import { useSubscription } from "@/hooks/useSubscription";
import { LikeCard } from "@/components/likes/LikeCard";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-square" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-8" />
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-12" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const LikesPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const subscriptionData = useSubscription();
  const { isPremiumUser } = subscriptionData;
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [likes, setLikes] = useState<LikeInfo[]>([]);
  const [stats, setStats] = useState<LikeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isPremium = isPremiumUser();

  const fetchLikes = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await seeWhoLikesYouService.getWhoLikesYou(user.id, 50, 0);
      
      if (result.success && result.hasAccess) {
        setLikes(result.likes || []);
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
    } catch (error) {
      console.error('Error fetching likes:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadLikes'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, t, toast]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const statsResult = await seeWhoLikesYouService.getLikeStats(user.id);
      setStats(statsResult);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchLikes();
      fetchStats();
    }
  }, [user, fetchLikes, fetchStats, refreshKey]);

  // Real-time subscription for new likes
  useEffect(() => {
    if (!user) return;

    const subscription = likesService.subscribeToLikeNotifications(user.id, () => {
      // Refresh likes when new one arrives
      setRefreshKey(prev => prev + 1);
      toast({
        title: "💕 " + t('newLike'),
        description: t('someoneNewLikedYou'),
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user, t, toast]);

  const handleLikeBack = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const result = await seeWhoLikesYouService.likeBack(user.id, targetUserId);
      
      if (result.success) {
        if (result.isMatch) {
          toast({
            title: "🎉 " + t('match'),
            description: t('youMatched'),
          });
        } else {
          toast({
            title: "💕 " + t('likeSent'),
            description: t('youLikedBack'),
          });
        }
        
        // Remove from likes list
        setLikes(prev => prev.filter(like => like.user_id !== targetUserId));
      } else {
        toast({
          title: t('error'),
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error liking back:', error);
      toast({
        title: t('error'),
        description: t('failedToLikeBack'),
        variant: "destructive"
      });
    }
  };

  const handleDismiss = async (likerId: string) => {
    if (!user) return;
    
    try {
      const result = await seeWhoLikesYouService.dismissLike(user.id, likerId);
      
      if (result.success) {
        // Remove from likes list
        setLikes(prev => prev.filter(like => like.user_id !== likerId));
        toast({
          title: t('dismissed'),
          description: t('likeRemoved'),
        });
      } else {
        toast({
          title: t('error'),
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error dismissing like:', error);
      toast({
        title: t('error'),
        description: t('failedToDismiss'),
        variant: "destructive"
      });
    }
  };

  const PremiumPrompt = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
        <Eye className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {stats?.totalLikes ? `${stats.totalLikes} ${t('peopleWhoLikedYou')}` : t('whoLikesYou')}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        {t('seeLikesDescription')}
      </p>
      
      {stats && (
        <div className="grid grid-cols-2 gap-4 max-w-sm mx-auto mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="text-2xl font-bold text-pink-500">{stats.totalLikes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('totalLikes')}</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border">
            <div className="text-2xl font-bold text-blue-500">{stats.superLikes}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{t('superLikes')}</div>
          </div>
        </div>
      )}
      
      <div className="bg-gray-50 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-600/50 rounded-lg p-4 mb-6 max-w-sm mx-auto">
        <div className="flex items-center justify-center gap-2 text-gray-800 dark:text-gray-200">
          <Crown className="w-5 h-5" />
          <span className="font-medium">{t('premiumFeature')}</span>
        </div>
      </div>
      
      <Button 
        onClick={() => navigate('/upgrades')}
        size="lg"
        className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white px-8"
      >
        <Crown className="w-5 h-5 mr-2" />
        {t('upgradeToPremium')}
      </Button>
    </div>
  );

  const PremiumContent = () => {
    if (loading) {
      return <LoadingSkeleton />;
    }

    if (likes.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900 dark:to-red-900 rounded-full flex items-center justify-center">
            <Heart className="w-10 h-10 text-pink-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">{t('noOneLikedYet')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('completeProfileToBeDiscovered')}</p>
          <Button 
            onClick={() => navigate('/profile')}
            variant="outline"
            className="border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
          >
            {t('improveProfile')}
          </Button>
        </div>
      );
    }

    // Separate super likes and regular likes
    const superLikes = likes.filter(like => like.is_super_like);
    const regularLikes = likes.filter(like => !like.is_super_like);

    return (
      <div className="space-y-8">
        {/* Super Likes Section */}
        {superLikes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Star className="w-4 h-4 text-white fill-current" />
              </div>
              <h2 className="text-xl font-bold dark:text-white">{t('superLikes')}</h2>
              <Badge variant="secondary">{superLikes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {superLikes.map((like) => (
                <LikeCard
                  key={like.id}
                  like={like}
                  onLikeBack={handleLikeBack}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          </div>
        )}

        {/* Regular Likes Section */}
        {regularLikes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold dark:text-white">{t('likes')}</h2>
              <Badge variant="secondary">{regularLikes.length}</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularLikes.map((like) => (
                <LikeCard
                  key={like.id}
                  like={like}
                  onLikeBack={handleLikeBack}
                  onDismiss={handleDismiss}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-700 dark:text-gray-200">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {t('peopleWhoLikeYou')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t('seeLikesAndMatch')}</p>
          </div>
          
          {isPremium && hasAccess ? <PremiumContent /> : <PremiumPrompt />}
        </div>
      </main>
      <NavigationBar />
    </div>
  );
};
