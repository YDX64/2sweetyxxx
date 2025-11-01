import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { 
  Eye, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Users, 
  Crown, 
  BarChart3, 
  Activity,
  ArrowUp,
  ArrowDown
} from "lucide-react";
import { profileViewsService } from "@/services/profileViewsService";
import { guestsService, type GuestStats } from "@/services/guestsService";

interface AnalyticsData {
  totalViews: number;
  todayViews: number;
  weekViews: number;
  monthViews: number;
  premiumViews: number;
  averageViewsPerDay: number;
  peakViewingHour: number;
  weeklyGrowth: number;
  monthlyGrowth: number;
}

interface ViewsChartProps {
  data: number[];
  labels: string[];
  title: string;
}

const ViewsChart = ({ data, labels, title }: ViewsChartProps) => {
  const { t } = useLanguage();
  const maxValue = Math.max(...data);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((value, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-16 text-sm text-gray-600 dark:text-gray-400">
                {labels[index]}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${maxValue > 0 ? (value / maxValue) * 100 : 0}%` }}
                />
              </div>
              <div className="w-8 text-sm font-medium text-gray-900 dark:text-white">
                {value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color = "blue",
  growth,
  trend 
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: any;
  color?: "blue" | "green" | "purple" | "orange" | "pink";
  growth?: number;
  trend?: "up" | "down" | "neutral";
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600", 
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    pink: "from-pink-500 to-pink-600"
  };

  const getTrendIcon = () => {
    if (trend === "up") return <ArrowUp className="w-3 h-3 text-green-500" />;
    if (trend === "down") return <ArrowDown className="w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {title}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {getTrendIcon()}
            </div>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {subtitle}
              </p>
            )}
            {growth !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {getTrendIcon()}
                <span className={`text-xs font-medium ${
                  trend === "up" ? "text-green-600" : 
                  trend === "down" ? "text-red-600" : "text-gray-600"
                }`}>
                  {growth > 0 ? "+" : ""}{growth}%
                </span>
              </div>
            )}
          </div>
          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colorClasses[color]} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ProfileAnalytics = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('week');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, timeframe]);

  const fetchAnalytics = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch guest stats
      const guestStatsResult = await guestsService.getGuestStats(user.id);
      setGuestStats(guestStatsResult);

      // Fetch detailed analytics from profileViewsService
      const viewStatsResult = await profileViewsService.getProfileViewStats(user.id);
      
      // Calculate analytics data
      const analyticsData: AnalyticsData = {
        totalViews: guestStatsResult.totalViews || 0,
        todayViews: guestStatsResult.todayViews || 0,
        weekViews: guestStatsResult.weekViews || 0,
        monthViews: guestStatsResult.monthViews || 0,
        premiumViews: guestStatsResult.premiumViews || 0,
        averageViewsPerDay: Math.round((guestStatsResult.weekViews || 0) / 7),
        peakViewingHour: 18, // Mock data - could be calculated from real data
        weeklyGrowth: 15, // Mock data - could be calculated from historical data
        monthlyGrowth: 34 // Mock data - could be calculated from historical data
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklyData = () => {
    if (!analytics) return { data: [], labels: [] };
    
    // Mock weekly data - in real implementation, this would come from the database
    const labels = [t('monday'), t('tuesday'), t('wednesday'), t('thursday'), t('friday'), t('saturday'), t('sunday')];
    const data = [12, 18, 15, 22, 20, 8, 5]; // Mock data
    
    return { data, labels };
  };

  const getHourlyData = () => {
    if (!analytics) return { data: [], labels: [] };
    
    // Mock hourly data for peak viewing times
    const labels = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00', '00:00'];
    const data = [2, 8, 12, 15, 25, 18, 5]; // Mock data
    
    return { data, labels };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!analytics || !guestStats?.hasAccess) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Eye className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('analyticsNotAvailable')}</h3>
          <p className="text-gray-600 dark:text-gray-400">
            {guestStats?.subscriptionRequired || t('upgradeToViewAnalytics')}
          </p>
        </CardContent>
      </Card>
    );
  }

  const weeklyData = getWeeklyData();
  const hourlyData = getHourlyData();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Activity className="w-6 h-6" />
            {t('profileAnalytics')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {t('trackYourProfilePerformance')}
          </p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'year'] as const).map((period) => (
            <Button
              key={period}
              variant={timeframe === period ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe(period)}
            >
              {t(period)}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalViews')}
          value={analytics.totalViews}
          subtitle={t('allTimeViews')}
          icon={Eye}
          color="blue"
        />
        <StatCard
          title={t('todayViews')}
          value={analytics.todayViews}
          subtitle={t('viewsToday')}
          icon={Calendar}
          color="green"
          growth={analytics.weeklyGrowth}
          trend="up"
        />
        <StatCard
          title={t('weeklyAverage')}
          value={analytics.averageViewsPerDay}
          subtitle={t('viewsPerDay')}
          icon={TrendingUp}
          color="purple"
          growth={analytics.monthlyGrowth}
          trend="up"
        />
        <StatCard
          title={t('premiumViews')}
          value={analytics.premiumViews}
          subtitle={t('premiumUserViews')}
          icon={Crown}
          color="orange"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ViewsChart
          data={weeklyData.data}
          labels={weeklyData.labels}
          title={t('weeklyViews')}
        />
        <ViewsChart
          data={hourlyData.data}
          labels={hourlyData.labels}
          title={t('peakViewingTimes')}
        />
      </div>

      {/* Additional Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="w-5 h-5" />
              {t('bestTimeToPost')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {analytics.peakViewingHour}:00
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('peakActivityTime')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              {t('profilePopularity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {Math.round((analytics.premiumViews / analytics.totalViews) * 100) || 0}%
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('premiumUserEngagement')}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t('growthRate')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center justify-center gap-1">
                +{analytics.monthlyGrowth}%
                <ArrowUp className="w-5 h-5" />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('monthlyGrowth')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tips Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {t('improvementTips')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('increaseVisibility')}
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {t('addMorePhotos')}</li>
                <li>• {t('updateBioRegularly')}</li>
                <li>• {t('stayActiveOnPlatform')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {t('optimizeTiming')}
              </h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• {t('postDuringPeakHours')}</li>
                <li>• {t('engageWithOthers')}</li>
                <li>• {t('useBoostsStrategically')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};