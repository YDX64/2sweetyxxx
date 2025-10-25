import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { AdminLanguageSelector } from "@/components/admin/AdminLanguageSelector";
import { supabase } from "@/integrations/supabase/client";
import { debugAuth } from "@/utils/debugAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Users,
  DollarSign,
  FileText,
  Settings,
  Shield,
  Activity,
  LogOut,
  Lock,
  AlertTriangle,
  BarChart3,
  Crown,
  Bug,
  Heart,
  ExternalLink
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import UserManagement from "@/components/admin/UserManagement";
import ContentManagement from "@/components/admin/ContentManagement";
import PlanManagement from "@/components/admin/PlanManagement";
import EnhancedLogViewer from "@/components/admin/EnhancedLogViewer";
import { SiteConfiguration } from "@/components/admin/SiteConfiguration";
import { ModeratorPermissionsDisplay } from "@/components/admin/ModeratorPermissionsDisplay";
import SystemHealthDashboard from "@/components/admin/SystemHealthDashboard";
import ErrorDashboard from "@/components/admin/ErrorDashboard";
import type { User } from "@supabase/supabase-js";

// Modern TypeScript patterns: Type-safe interfaces

// Modern utility: Type-safe database transaction transformation
interface DatabaseTransaction {
  id: string;
  user_id: string;
  subscription_tier: string; // From database
  subscribed: boolean;
  created_at: string;
  email: string;
  stripe_customer_id?: string | null;
  subscription_end?: string | null;
  updated_at: string;
  profiles?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

// Modern transformation function: Convert database transaction to typed transaction
const transformDatabaseTransaction = (dbTransaction: DatabaseTransaction): SubscriptionTransaction | null => {
  // Type-safe conversion with validation
  if (!isValidSubscriptionTier(dbTransaction.subscription_tier)) {
    console.warn(`Invalid subscription tier: ${dbTransaction.subscription_tier}, skipping transaction`);
    return null;
  }

  return {
    ...dbTransaction,
    subscription_tier: dbTransaction.subscription_tier as SubscriptionTier,
    stripe_customer_id: dbTransaction.stripe_customer_id || undefined,
    subscription_end: dbTransaction.subscription_end || undefined
  };
};

// Modern utility types: Type-safe subscription handling
type SubscriptionTier = 'silver' | 'gold' | 'platinum';
type DatabaseSubscriptionTier = string; // What we get from database

// Modern type guard pattern: Runtime type validation
const isValidSubscriptionTier = (tier: DatabaseSubscriptionTier): tier is SubscriptionTier => {
  return ['silver', 'gold', 'platinum'].includes(tier);
};

// Modern interface: Type-safe subscription transaction
interface SubscriptionTransaction {
  id: string;
  user_id: string;
  subscription_tier: SubscriptionTier;
  subscribed: boolean;
  created_at: string;
  email: string;
  stripe_customer_id?: string | null;
  subscription_end?: string | null;
  updated_at: string;
  profiles?: {
    name?: string | null;
    email?: string | null;
  } | null;
}



const AdminPanel = () => {
  console.log('🟢 AdminPanel component started');
  const { user, isLoading: authLoading, isAdmin, hasPermission, userRole } = useAuth();
  console.log('🟢 useAuth hook success:', { user: !!user, authLoading, isAdmin });
  const navigate = useNavigate();
  const { t } = useTranslation();
  console.log('🟢 All hooks successful');
  
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    newUsersToday: 0,
    totalMatches: 0,
    activeChats: 0,
    premiumUsers: 0
  });

  const [recentTransactions, setRecentTransactions] = useState<SubscriptionTransaction[]>([]);

  // Modern useCallback pattern: Type-safe recent transactions loading  
  const loadRecentTransactions = useCallback(async () => {
    console.log('🔄 ===== loadRecentTransactions STARTED =====');
    console.log('🔄 Function called at:', new Date().toISOString());
    
    try {
      console.log('🔍 Executing Supabase query for subscribers with user profiles...');
      
      // Get recent transactions with user profiles using JOIN
      const { data: transactions, error } = await supabase
        .from('subscribers')
        .select(`
          id,
          user_id,
          subscription_tier,
          subscribed,
          created_at,
          email,
          stripe_customer_id,
          subscription_end,
          updated_at,
          profiles:user_id (
            name,
            email
          )
        `)
        .eq('subscribed', true)
        .order('created_at', { ascending: false })
        .limit(10);

      console.log('📊 Supabase query completed');
      console.log('📊 Raw query result:');
      console.log('📊 - data:', transactions);
      console.log('📊 - error:', error);
      console.log('📊 - data type:', typeof transactions);
      console.log('📊 - data length:', transactions?.length);

      if (error) {
        console.error('❌ Recent transactions loading error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        setRecentTransactions([]);
        return;
      }

      if (!transactions) {
        console.log('⚠️ No transactions data returned (null/undefined)');
        setRecentTransactions([]);
        return;
      }

      if (transactions.length === 0) {
        console.log('⚠️ Transactions array is empty');
        console.log('⚠️ This means no subscribers with subscribed=true found');
        setRecentTransactions([]);
        return;
      }

      console.log('✅ Recent transactions loaded successfully');
      console.log('✅ Total transactions found:', transactions.length);
      transactions.forEach((transaction, index) => {
        console.log(`✅ Transaction ${index + 1}:`, {
          id: transaction.id,
          user_id: transaction.user_id,
          subscription_tier: transaction.subscription_tier,
          subscribed: transaction.subscribed,
          created_at: transaction.created_at,
          profile_email: transaction.email,
          profile_data: transaction.profiles
        });
      });
      
      // Modern transformation: Apply type-safe conversion
      const transformedTransactions = (transactions as DatabaseTransaction[])
        .map(transformDatabaseTransaction)
        .filter((transaction): transaction is SubscriptionTransaction => transaction !== null);

      console.log('✅ Recent transactions transformed successfully');
      console.log('✅ Total valid transactions:', transformedTransactions.length);
      
      setRecentTransactions(transformedTransactions);
      console.log('✅ recentTransactions state updated');
    } catch (error) {
      console.error('❌ CATCH: Recent transactions loading error:', error);
      console.error('❌ CATCH: Error type:', typeof error);
      console.error('❌ CATCH: Error details:', JSON.stringify(error, null, 2));
      setRecentTransactions([]);
    }
    
    console.log('🔄 ===== loadRecentTransactions COMPLETED =====');
  }, []); // ✅ All dependencies declared

  // Modern useCallback pattern: Memoized dashboard stats loading
  const loadDashboardStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading dashboard stats...');
      
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count: newUsersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString());

      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: activeUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('updated_at', sevenDaysAgo.toISOString());

      const { count: totalMatches } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      // Get real subscription data
      const { data: subscribers, count: premiumUsers } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact' })
        .eq('subscribed', true);

      console.log('🎯 Real subscribers found:', subscribers);
      console.log('🎯 Premium users count:', premiumUsers);

      // Calculate revenue (basic estimation)
      let totalRevenue = 0;
      if (subscribers) {
        subscribers.forEach(sub => {
          if (sub.subscription_tier === 'silver') totalRevenue += 9.99;
          if (sub.subscription_tier === 'gold') totalRevenue += 19.99;
          if (sub.subscription_tier === 'platinum') totalRevenue += 29.99;
        });
      }

      setStats({
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalRevenue: Math.round(totalRevenue),
        newUsersToday: newUsersToday || 0,
        totalMatches: totalMatches || 0,
        activeChats: premiumUsers || 0,
        premiumUsers: premiumUsers || 0
      });

      // Load recent transactions
      await loadRecentTransactions();
      
      console.log('✅ Dashboard stats loaded successfully');
    } catch (error) {
      console.error('❌ Stats loading error:', error);
    } finally {
      setLoading(false);
      console.log('✅ Loading completed');
    }
  }, [loadRecentTransactions]); // ✅ All dependencies declared



  // Admin kontrolü
  useEffect(() => {
    console.log('🎯 ===== AdminPanel useEffect triggered =====');
    console.log('🎯 authLoading:', authLoading);
    console.log('🎯 user:', user);
    console.log('🎯 user?.id:', user?.id);
    console.log('🎯 user?.email:', user?.email);
    console.log('🎯 Current timestamp:', new Date().toISOString());
    
    // Wait if auth is still loading
    if (authLoading) {
      console.log('⏳ Auth state still loading, waiting...');
      return;
    }
    
    // Load dashboard stats after auth is ready
    if (user) {
      // Debug authentication when user is present
      debugAuth();
      loadDashboardStats();
    } else {
      setLoading(false);
    }
  }, [user, authLoading, loadDashboardStats]); // ✅ All dependencies declared


  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white">
          {authLoading ? t('authSystemLoading') : t('loading')}
        </div>
      </div>
    );
  }

  // Admin access control
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">{t('adminAccess.loginRequired.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">{t('adminAccess.loginRequired.description')}</p>
            <Button onClick={() => navigate('/')} className="w-full">
              {t('adminAccess.loginRequired.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Admin and Moderator access check
  const canAccessAdminPanel = isAdmin || userRole === 'moderator';
  if (!canAccessAdminPanel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <Card className="w-96 bg-gray-800/50 border-gray-700">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <CardTitle className="text-white">{t('adminAccess.accessDenied.title')}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-300 mb-4">{t('adminAccess.accessDenied.description')}</p>
            <p className="text-sm text-gray-400 mb-4">
              {t('adminAccess.accessDenied.yourRole')}: {userRole || t('adminAccess.accessDenied.noRole')}<br/>
              {t('adminAccess.accessDenied.adminPermission')}: {hasPermission('admin.access') ? t('adminAccess.accessDenied.yes') : t('adminAccess.accessDenied.no')}
            </p>
            <Button onClick={() => navigate('/')} className="w-full">
              {t('adminAccess.accessDenied.button')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Shield className="w-8 h-8 text-pink-500" />
              <h1 className="text-2xl font-bold text-white">{t('adminPanel')}</h1>
              {userRole && (
                <Badge className={`${
                  userRole === 'admin'
                    ? 'bg-purple-500/20 text-purple-400 border-purple-500'
                    : userRole === 'moderator'
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500'
                }`}>
                  {userRole === 'admin' ? t('admin') : userRole === 'moderator' ? t('moderator') : userRole}
                </Badge>
              )}
              <Badge className="bg-red-500/20 text-red-400 border-red-500">
                <Bug className="w-3 h-3 mr-1" />
                {t('adminAccess.debugMode')}
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <AdminLanguageSelector />
              <Badge variant="outline" className="text-gray-300 border-gray-600">
                {user?.email}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="text-gray-300 hover:text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('signOut')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Moderator Permissions Display */}
        {userRole === 'moderator' && <ModeratorPermissionsDisplay />}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t('totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <p className="text-xs text-gray-400 mt-1">
                <span className="text-green-400">+{stats.newUsersToday}</span> {t('today')}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t('activeUsers')}</CardTitle>
              <Activity className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.activeUsers}</div>
              <p className="text-xs text-gray-400 mt-1">{t('last7Days')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t('totalRevenue')}</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${stats.totalRevenue}</div>
              <p className="text-xs text-gray-400 mt-1">{t('thisMonth')}</p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{t('totalMatches')}</CardTitle>
              <Heart className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalMatches}</div>
              <p className="text-xs text-gray-400 mt-1">{t('allTime')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className={`bg-gray-800/50 border-gray-700 grid w-full ${isAdmin ? 'grid-cols-9' : 'grid-cols-3'}`}>
            <TabsTrigger value="overview" className="data-[state=active]:bg-gray-700">
              <BarChart3 className="w-4 h-4 mr-2" />
              {t('overview')}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">
              <Users className="w-4 h-4 mr-2" />
              {t('users')}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="payments" className="data-[state=active]:bg-gray-700">
                <DollarSign className="w-4 h-4 mr-2" />
                {t('payments')}
              </TabsTrigger>
            )}
            <TabsTrigger value="content" className="data-[state=active]:bg-gray-700">
              <FileText className="w-4 h-4 mr-2" />
              {t('content')}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="plans" className="data-[state=active]:bg-gray-700">
                <Crown className="w-4 h-4 mr-2" />
                {t('plans')}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="system" className="data-[state=active]:bg-gray-700">
                <Shield className="w-4 h-4 mr-2" />
                System Health
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="errors" className="data-[state=active]:bg-gray-700">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Error Analysis
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="settings" className="data-[state=active]:bg-gray-700">
                <Settings className="w-4 h-4 mr-2" />
                {t('settings')}
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="logs" className="data-[state=active]:bg-gray-700">
                <Bug className="w-4 h-4 mr-2" />
                {t('logs')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('systemStatus')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{t('databaseConnection')}</span>
                    <Badge className="bg-green-500/20 text-green-400">{t('active')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{t('debugMode')}</span>
                    <Badge className="bg-red-500/20 text-red-400">{t('active')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <UserManagement />
          </TabsContent>

          <TabsContent value="payments" className="space-y-4">
            {/* Revenue Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{t('monthlyRevenue')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.totalRevenue > 0 ? `$${stats.totalRevenue}` : t('adminContent.common.noData')}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('fromSubscriptions')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{t('premiumUsers')}</CardTitle>
                  <Crown className="h-4 w-4 text-yellow-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.premiumUsers > 0 ? stats.premiumUsers : t('adminContent.common.noData')}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('activeSubscriptions')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{t('adminPayments.conversionRate')}</CardTitle>
                  <BarChart3 className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {stats.totalUsers > 0 ?
                      `${((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1)}%` :
                      t('adminContent.common.noData')
                    }
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('usersToPremium')}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">{t('adminPayments.mrr')}</CardTitle>
                  <DollarSign className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    ${stats.totalRevenue > 0 ? (stats.totalRevenue * 0.8).toFixed(0) : '0'}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {t('adminPayments.estimatedMonthly')}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Subscription Management Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Manual Subscription Assignment */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Crown className="w-5 h-5 mr-2 text-yellow-400" />
                    {t('adminPayments.manualSubscription.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminPayments.manualSubscription.userEmail')}</label>
                      <input
                        type="email"
                        placeholder={t('adminPayments.manualSubscription.emailPlaceholder')}
                        className="mt-1 w-full p-2 bg-gray-700/50 rounded border border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminPayments.manualSubscription.subscriptionTier')}</label>
                      <select className="mt-1 w-full p-2 bg-gray-700/50 rounded border border-gray-600 text-white">
                        <option value="silver">{t('adminPayments.manualSubscription.tiers.silver')}</option>
                        <option value="gold">{t('adminPayments.manualSubscription.tiers.gold')}</option>
                        <option value="platinum">{t('adminPayments.manualSubscription.tiers.platinum')}</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminPayments.manualSubscription.duration')}</label>
                      <input
                        type="number"
                        placeholder={t('adminPayments.manualSubscription.durationPlaceholder')}
                        className="mt-1 w-full p-2 bg-gray-700/50 rounded border border-gray-600 text-white placeholder-gray-400"
                      />
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminPayments.manualSubscription.reason')}</label>
                      <select className="mt-1 w-full p-2 bg-gray-700/50 rounded border border-gray-600 text-white">
                        <option value="promotional">{t('adminPayments.manualSubscription.reasons.promotional')}</option>
                        <option value="support">{t('adminPayments.manualSubscription.reasons.support')}</option>
                        <option value="testing">{t('adminPayments.manualSubscription.reasons.testing')}</option>
                        <option value="compensation">{t('adminPayments.manualSubscription.reasons.compensation')}</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full bg-yellow-600 hover:bg-yellow-700">
                    <Crown className="w-4 h-4 mr-2" />
                    {t('adminPayments.manualSubscription.grantButton')}
                  </Button>
                </CardContent>
              </Card>

              {/* Stripe Dashboard Integration */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <ExternalLink className="w-5 h-5 mr-2 text-blue-400" />
                    {t('adminPayments.stripe.title')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open('https://dashboard.stripe.com/dashboard', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {t('adminPayments.stripe.openDashboard')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open('https://dashboard.stripe.com/customers', '_blank')}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      {t('adminPayments.stripe.viewCustomers')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open('https://dashboard.stripe.com/subscriptions', '_blank')}
                    >
                      <Crown className="w-4 h-4 mr-2" />
                      {t('adminPayments.stripe.viewSubscriptions')}
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="w-full justify-start border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                      onClick={() => window.open('https://dashboard.stripe.com/payments', '_blank')}
                    >
                      <DollarSign className="w-4 h-4 mr-2" />
                      {t('adminPayments.stripe.viewPayments')}
                    </Button>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                    <p className="text-blue-400 text-sm">
                      <AlertTriangle className="w-4 h-4 inline mr-1" />
                      {t('adminPayments.stripe.note')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('adminPayments.recentTransactions.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.length > 0 ? (
                    recentTransactions.map((transaction, index) => {
                      const tierPrices = {
                        silver: '$9.99',
                        gold: '$19.99',
                        platinum: '$29.99'
                      };
                      
                      const tierColors = {
                        silver: 'bg-blue-500/20 text-blue-400',
                        gold: 'bg-yellow-500/20 text-yellow-400',
                        platinum: 'bg-purple-500/20 text-purple-400'
                      };

                      const planNames = {
                        silver: t('adminPayments.recentTransactions.plans.silver'),
                        gold: t('adminPayments.recentTransactions.plans.gold'),
                        platinum: t('adminPayments.recentTransactions.plans.platinum')
                      };

                      const timeAgo = (date: string) => {
                        const now = new Date();
                        const created = new Date(date);
                        const diffInHours = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
                        const diffInDays = Math.floor(diffInHours / 24);
                        
                        if (diffInDays > 0) {
                          return `${diffInDays} ${diffInDays === 1 ? t('day') : t('days')} ${t('ago')}`;
                        } else if (diffInHours > 0) {
                          return `${diffInHours} ${diffInHours === 1 ? t('hour') : t('hours')} ${t('ago')}`;
                        } else {
                          return t('justNow');
                        }
                      };

                      // Kullanıcı email'ini maskele (privacy için)
                      const maskEmail = (email: string) => {
                        if (!email) return t('emailNotAvailable');
                        const [username, domain] = email.split('@');
                        return `${username.slice(0, 3)}***@${domain}`;
                      };

                      return (
                        <div key={index} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors">
                          <div className="flex items-center space-x-4">
                            {/* Kullanıcı Avatar'ı */}
                                                          <Avatar className="w-10 h-10">
                                <AvatarFallback className="bg-gray-600 text-white">
                                 {transaction.profiles?.name?.[0]?.toUpperCase() ||
                                   transaction.profiles?.email?.[0]?.toUpperCase() ||
                                   '?'}
                                </AvatarFallback>
                              </Avatar>
                            
                            {/* Kullanıcı Bilgileri */}
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-white font-medium">
                                  {transaction.profiles?.name || t('user')}
                                </p>
                                <Badge className={tierColors[transaction.subscription_tier as keyof typeof tierColors] || 'bg-gray-500/20 text-gray-400'}>
                                  {planNames[transaction.subscription_tier as keyof typeof planNames] || transaction.subscription_tier}
                                </Badge>
                              </div>
                              <p className="text-gray-400 text-sm">
                                {transaction.profiles?.email ?
                                  maskEmail(transaction.profiles.email) :
                                  (transaction.email ? maskEmail(transaction.email) : t('emailNotAvailable'))
                                }
                              </p>
                            </div>
                          </div>
                          
                          {/* Fiyat ve İşlemler */}
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="text-white font-medium">
                                {tierPrices[transaction.subscription_tier as keyof typeof tierPrices] || 'N/A'}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {timeAgo(transaction.created_at)}
                              </p>
                            </div>
                            
                            {/* UserDetail Sayfasına Link */}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/user/${transaction.user_id}`)}
                              className="text-gray-300 hover:text-white"
                              title="Kullanıcı detaylarını görüntüle"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex items-center justify-center p-8 text-gray-400">
                      <div className="text-center">
                        <DollarSign className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                        <p>{t('adminPayments.recentTransactions.noTransactions')}</p>
                        <p className="text-sm mt-1">{t('adminPayments.recentTransactions.noTransactionsDesc')}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stripe Status */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('adminPayments.paymentStatus.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{t('adminPayments.paymentStatus.stripeConnection')}</span>
                    <Badge className="bg-green-500/20 text-green-400">{t('active')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{t('adminPayments.paymentStatus.webhookStatus')}</span>
                    <Badge className="bg-green-500/20 text-green-400">{t('active')}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">{t('adminPayments.paymentStatus.testMode')}</span>
                    <Badge className="bg-yellow-500/20 text-yellow-400">{t('active')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content">
            <ContentManagement />
          </TabsContent>

          <TabsContent value="plans">
            <PlanManagement />
          </TabsContent>

          <TabsContent value="system">
            <SystemHealthDashboard />
          </TabsContent>

          <TabsContent value="errors">
            <ErrorDashboard />
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            {/* Site Configuration */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('adminSite.configuration.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminSite.configuration.siteName')}</label>
                      <div className="mt-1 p-2 bg-gray-700/50 rounded border border-gray-600">
                        <span className="text-white">2Sweety</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-gray-300 text-sm">{t('adminSite.configuration.defaultLanguage')}</label>
                      <div className="mt-1 p-2 bg-gray-700/50 rounded border border-gray-600">
                        <span className="text-white">{t('english')}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="text-gray-300 text-sm">{t('adminSite.configuration.siteDescription')}</label>
                    <div className="mt-1 p-2 bg-gray-700/50 rounded border border-gray-600">
                      <span className="text-white">{t('adminSite.configuration.descriptionPlaceholder')}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* App Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('adminSite.appSettings.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.appSettings.registration.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.appSettings.registration.description')}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('ads.configuration.status.enabled')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.appSettings.emailVerification.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.appSettings.emailVerification.description')}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('ads.configuration.status.enabled')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.appSettings.photoModeration.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.appSettings.photoModeration.description')}</p>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">{t('adminSite.appSettings.photoModeration.manual')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.appSettings.aiTranslation.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.appSettings.aiTranslation.description')}</p>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('ads.configuration.status.enabled')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  {t('adminSite.security.title')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.security.twoFactor.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.security.twoFactor.description')}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">{t('optional')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.security.sessionTimeout.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.security.sessionTimeout.description')}</p>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400">{t('adminSite.security.sessionTimeout.hours')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-gray-300">{t('adminSite.security.ipRestriction.label')}</span>
                      <p className="text-gray-500 text-sm">{t('adminSite.security.ipRestriction.description')}</p>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400">{t('ads.configuration.status.disabled')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Integration Status */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">{t('adminSite.integrations.title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{t('adminSite.integrations.stripe')}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('adminSite.integrations.connected')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">{t('adminSite.integrations.supabase')}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('adminSite.integrations.connected')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Settings className="w-4 h-4 text-yellow-400" />
                      <span className="text-gray-300">{t('adminSite.integrations.googleTranslate')}</span>
                    </div>
                    <Badge className="bg-green-500/20 text-green-400">{t('adminSite.integrations.connected')}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-4 h-4 text-red-400" />
                      <span className="text-gray-300">{t('adminSite.integrations.emailService')}</span>
                    </div>
                    <Badge className="bg-yellow-500/20 text-yellow-400">{t('adminSite.integrations.needsSetup')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ads & Analytics Configuration */}
            <SiteConfiguration />
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <EnhancedLogViewer />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPanel;
