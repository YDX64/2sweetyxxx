import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Crown, Star, Zap, Gift, Calendar, DollarSign, User, Mail } from "lucide-react";
import { adminService, AdminUser } from "@/services/adminService";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";

const UserSubscription = () => {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, userPermissions } = useAuth();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Permission checks
  const canManageSubscriptions = userRole === 'admin' || userPermissions.includes('manage_subscriptions');

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  const loadUserData = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const users = await adminService.getAllUsers();
      const foundUser = users.find(u => u.id === userId);
      setUser(foundUser || null);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast({
        title: t('admin.userSubscription.messages.loadFailed'),
        description: t('admin.userSubscription.messages.loadFailedDesc'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubscriptionUpdate = async (tier: string, durationDays: number) => {
    if (!canManageSubscriptions || !userId) {
      toast({
        title: t('admin.userSubscription.messages.accessDenied'),
        description: t('admin.userSubscription.messages.accessDeniedDesc'),
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(`subscription-${tier}`);
      
      // Use the server API endpoint for subscription updates
      const response = await fetch(`/api/admin/users/${userId}/subscription`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await adminService.getAuthToken())}`
        },
        body: JSON.stringify({
          role: tier,
          durationDays: durationDays
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Reload user data
      await loadUserData();

      toast({
        title: t('admin.userSubscription.messages.updateSuccess'),
        description: t('admin.userSubscription.messages.updateSuccessDesc', { tier, days: durationDays }),
        className: "bg-green-500/10 text-green-600 border-green-500/20"
      });
    } catch (error) {
      console.error('Failed to update subscription:', error);
      toast({
        title: t('admin.userSubscription.messages.updateFailed'),
        description: error instanceof Error ? error.message : t('admin.userSubscription.messages.updateFailedDesc'),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  const getSubscriptionIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="h-5 w-5 text-purple-500" />;
      case 'gold': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'silver': return <Zap className="h-5 w-5 text-gray-400" />;
      default: return <Gift className="h-5 w-5 text-gray-300" />;
    }
  };

  const getSubscriptionColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-purple-500/10 border-purple-500/20 text-purple-300';
      case 'gold': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300';
      case 'silver': return 'bg-gray-500/10 border-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/10 border-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">{t('admin.userSubscription.loading.title')}</h3>
            <p className="text-muted-foreground text-center">
              {t('admin.userSubscription.loading.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <User className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{t('admin.userSubscription.userNotFound.title')}</h3>
            <p className="text-muted-foreground text-center">
              {t('admin.userSubscription.userNotFound.description')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('admin.userSubscription.backToAdmin')}
        </Button>
        <h1 className="text-2xl font-bold">{t('admin.userSubscription.title')}</h1>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.photos?.[0]} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                {user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name || t('admin.userSubscription.noName')}</h2>
              <p className="text-muted-foreground flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {user.email}
              </p>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            {t('admin.userSubscription.currentStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">{t('admin.userSubscription.currentStatus.tier')}</label>
              <div className="flex items-center gap-2">
                {getSubscriptionIcon(user.subscription_tier || 'none')}
                <Badge variant="outline" className={getSubscriptionColor(user.subscription_tier || 'none')}>
                  {user.subscription_tier ? user.subscription_tier.charAt(0).toUpperCase() + user.subscription_tier.slice(1) : 'No Subscription'}
                </Badge>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Status</label>
              <div>
                <Badge variant={user.subscribed ? "default" : "secondary"}>
                  {user.subscribed ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
            
            {user.subscription_end && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Expires</label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    {new Date(user.subscription_end).toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subscription Management */}
      {canManageSubscriptions && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Manage Subscription
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {/* Silver Subscription */}
              <div className="border border-gray-700 bg-gray-900/50 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-white">Silver</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Basic premium features with limited benefits
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubscriptionUpdate('silver', 30)}
                    disabled={actionLoading === 'subscription-silver' || user.role === 'silver'}
                    className="w-full bg-gray-600 hover:bg-gray-500 text-white"
                    variant={user.role === 'silver' ? "secondary" : "default"}
                    size="sm"
                  >
                    {actionLoading === 'subscription-silver' ? 'Updating...' : 
                     user.role === 'silver' ? 'Active' : 'Activate Silver'}
                  </Button>

                </div>
              </div>

              {/* Gold Subscription */}
              <div className="border border-yellow-600 bg-yellow-500/10 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-semibold text-white">Gold</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Enhanced features with additional benefits
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubscriptionUpdate('gold', 30)}
                    disabled={actionLoading === 'subscription-gold' || user.role === 'gold'}
                    className="w-full bg-yellow-600 hover:bg-yellow-500 text-white"
                    variant={user.role === 'gold' ? "secondary" : "default"}
                    size="sm"
                  >
                    {actionLoading === 'subscription-gold' ? 'Updating...' : 
                     user.role === 'gold' ? 'Active' : 'Activate Gold'}
                  </Button>
                  {user.subscription_tier === 'gold' && user.subscribed && (
                    <Button
                      onClick={() => handleSubscriptionUpdate('gold', 0)}
                      disabled={actionLoading === 'subscription-gold'}
                      className="w-full"
                      variant="outline"
                      size="sm"
                    >
                      Deactivate
                    </Button>
                  )}
                </div>
              </div>

              {/* Platinum Subscription */}
              <div className="border border-purple-600 bg-purple-500/10 rounded-lg p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold text-white">Platinum</h3>
                </div>
                <p className="text-sm text-gray-400">
                  Premium tier with all features unlocked
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={() => handleSubscriptionUpdate('platinum', 30)}
                    disabled={actionLoading === 'subscription-platinum' || user.role === 'platinum'}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white"
                    variant={user.role === 'platinum' ? "secondary" : "default"}
                    size="sm"
                  >
                    {actionLoading === 'subscription-platinum' ? 'Updating...' : 
                     user.role === 'platinum' ? 'Active' : 'Activate Platinum'}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserSubscription;