import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Eye, Heart, Clock, Crown, MapPin, TrendingUp, BarChart3, Calendar } from "lucide-react";
import { guestsService, type GuestProfile, type GuestStats } from "@/services/guestsService";
import { likesService } from "@/services/likesService";
import { useSubscription } from "@/hooks/useSubscription";
import { GuestCard } from "@/components/guests/GuestCard";

const LoadingSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-square" />
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-16" />
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

const StatsCard = ({ stats }: { stats: GuestStats }) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
          {stats.totalViews}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
          <Eye className="w-3 h-3" />
          {t('totalViews')}
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
          {stats.todayViews}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
          <Calendar className="w-3 h-3" />
          {t('today')}
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
          {stats.weekViews}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
          <TrendingUp className="w-3 h-3" />
          {t('thisWeek')}
        </div>
      </Card>
      
      <Card className="p-4 text-center">
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-1">
          {stats.premiumViews}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-1">
          <Crown className="w-3 h-3" />
          {t('premiumViews')}
        </div>
      </Card>
    </div>
  );
};

export const GuestsPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { isPremiumUser } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [guests, setGuests] = useState<GuestProfile[]>([]);
  const [stats, setStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const isPremium = isPremiumUser();

  const fetchGuests = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await guestsService.getProfileGuests(user.id, 50, 0);
      
      if (result.success && result.hasAccess) {
        setGuests(result.guests || []);
        setHasAccess(true);
      } else {
        setHasAccess(false);
        if (result.message) {
          console.warn('Guests access denied:', result.message);
        }
      }
    } catch (error) {
      console.error('Error fetching guests:', error);
      toast({
        title: t('error'),
        description: t('failedToLoadGuests'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, t, toast]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    
    try {
      const statsResult = await guestsService.getGuestStats(user.id);
      setStats(statsResult);
    } catch (error) {
      console.error('Error fetching guest stats:', error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchGuests();
      fetchStats();
    }
  }, [user, fetchGuests, fetchStats, refreshKey]);

  // Real-time subscription for new profile views
  useEffect(() => {
    if (!user) return;

    const subscription = guestsService.subscribeToGuestNotifications(user.id, () => {
      // Refresh guests when new visitor arrives
      setRefreshKey(prev => prev + 1);
      toast({
        title: "👁️ " + t('newVisitor'),
        description: t('someoneViewedYourProfile'),
      });
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [user, t, toast]);

  const handleLike = async (targetUserId: string) => {
    if (!user) return;
    
    try {
      const result = await likesService.likeUser(user.id, targetUserId, false);
      
      if (result.success) {
        if (result.isMatch) {
          toast({
            title: "🎉 " + t('match'),
            description: t('youMatched'),
          });
        } else {
          toast({
            title: "💕 " + t('likeSent'),
            description: t('yourLikeWasSent'),
          });
        }
      } else {
        toast({
          title: t('error'),
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error liking user:', error);
      toast({
        title: t('error'),
        description: t('failedToSendLike'),
        variant: "destructive"
      });
    }
  };

  const handleMessage = (targetUserId: string) => {
    // Navigate to chat or open chat modal
    navigate(`/messages?userId=${targetUserId}`);
  };

  const PremiumPrompt = () => (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
        <Eye className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        {t('profileVisitors')}
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
        {t('seeWhoVisitedDescription')}
      </p>
      
      {stats && stats.totalViews > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600/30 rounded-lg p-6 mb-6 max-w-sm mx-auto">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {stats.totalViews}
          </div>
          <div className="text-blue-800 dark:text-blue-200 font-medium">
            {t('peopleViewedYourProfile')}
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
        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8"
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

    if (guests.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full flex items-center justify-center">
            <Eye className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-semibold mb-2 dark:text-white">{t('noVisitorsYet')}</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">{t('makeProfileMoreActive')}</p>
          <Button 
            onClick={() => navigate('/profile')}
            variant="outline"
            className="border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            {t('improveProfile')}
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {/* Statistics */}
        {stats && <StatsCard stats={stats} />}
        
        {/* Guests Grid */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Eye className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-xl font-bold dark:text-white">{t('recentVisitors')}</h2>
            <Badge variant="secondary">{guests.length}</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {guests.map((guest) => (
              <GuestCard
                key={guest.id}
                guest={guest}
                onLike={handleLike}
                onMessage={handleMessage}
              />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-700 dark:text-gray-200">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8 pb-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <Eye className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('myVisitors')}
            </h1>
            {stats && stats.totalViews > 0 && (
              <Badge className="bg-blue-500 text-white">{stats.totalViews}</Badge>
            )}
          </div>
          
          {isPremium && hasAccess ? <PremiumContent /> : <PremiumPrompt />}
        </div>
      </main>
      <NavigationBar />
    </div>
  );
};
