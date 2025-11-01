import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Search, Crown, Star, Zap, Gift, Calendar, User, Mail, Users } from "lucide-react";
import { adminService, AdminUser } from "@/services/adminService";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";

type UserRole = 'registered' | 'silver' | 'gold' | 'platinum' | 'moderator' | 'admin';

const ManualSubscription = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, userPermissions } = useAuth();
  const { t } = useLanguage();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedTier, setSelectedTier] = useState<UserRole>('silver');
  const [duration, setDuration] = useState<number>(30);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Permission checks
  const canManageSubscriptions = userRole === 'admin' || userPermissions.includes('manage_subscriptions');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const allUsers = await adminService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast({
        title: t('loadFailed'),
        description: t('failedToLoadUsers'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  const handleGrantSubscription = async () => {
    if (!selectedUser || !canManageSubscriptions) return;

    try {
      setActionLoading(true);
      
      await adminService.grantSubscription(selectedUser.id, selectedTier, duration);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === selectedUser.id ? {
          ...user,
          role: selectedTier,
          subscribed: true,
          subscription_tier: selectedTier,
          subscription_end: new Date(Date.now() + duration * 24 * 60 * 60 * 1000).toISOString()
        } : user
      ));

      setSelectedUser(null);
      
      toast({
        title: t('subscriptionGranted'),
        description: t('subscriptionGrantedDesc', { tier: selectedTier, days: duration }),
      });

    } catch (error) {
      console.error('Failed to grant subscription:', error);
      toast({
        title: t('grantFailed'),
        description: error instanceof Error ? error.message : t('failedToGrantSubscription'),
        variant: "destructive"
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'platinum': return <Crown className="h-4 w-4 text-purple-500" />;
      case 'gold': return <Star className="h-4 w-4 text-yellow-500" />;
      case 'silver': return <Zap className="h-4 w-4 text-gray-400" />;
      default: return <User className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'moderator': return 'secondary';
      case 'platinum': return 'default';
      case 'gold': return 'default';
      case 'silver': return 'outline';
      default: return 'outline';
    }
  };

  if (!canManageSubscriptions) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToAdmin')}
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-semibold mb-2">{t('accessDenied')}</h3>
            <p className="text-muted-foreground text-center">
              {t('noPermissionToManageSubscriptions')}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/admin')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToAdmin')}
          </Button>
        </div>
        
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">{t('loadingUsers')}</h3>
            <p className="text-muted-foreground text-center">
              {t('pleaseWaitFetchingUsers')}
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
          {t('backToAdmin')}
        </Button>
        <h1 className="text-2xl font-bold">{t('manualSubscriptionManagement')}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Selection */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-300">
              <Users className="h-5 w-5" />
              {t('selectUser')}
              <Badge variant="secondary" className="ml-auto">
                {filteredUsers.length} {t('users')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder={t('searchByNameEmailId')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* User List */}
              <div className="max-h-96 overflow-y-auto space-y-2">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.photos?.[0]} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                          {user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">
                            {user.name || t('unknown')}
                          </h4>
                          <Badge variant={getRoleBadgeVariant(user.role || 'registered')} className="text-xs">
                            {getRoleIcon(user.role || 'registered')}
                            <span className="ml-1 capitalize">{user.role || 'registered'}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Options */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-300">
              <Gift className="h-5 w-5" />
              {t('grantSubscription')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedUser ? (
              <div className="space-y-6">
                {/* Selected User Info */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={selectedUser.photos?.[0]} />
                      <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                        {selectedUser.name?.slice(0, 2).toUpperCase() || selectedUser.email?.slice(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-semibold">{selectedUser.name || t('unknown')}</h4>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {t('current')} <Badge variant={getRoleBadgeVariant(selectedUser.role || 'registered')} className="text-xs ml-1">
                      {selectedUser.role || 'registered'}
                    </Badge>
                  </div>
                </div>

                {/* Subscription Tier */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('subscriptionTier')}</label>
                  <Select value={selectedTier} onValueChange={(value: UserRole) => setSelectedTier(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="silver">
                        <div className="flex items-center gap-2">
                          <Zap className="h-4 w-4 text-gray-400" />
                          {t('silver')}
                        </div>
                      </SelectItem>
                      <SelectItem value="gold">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          {t('gold')}
                        </div>
                      </SelectItem>
                      <SelectItem value="platinum">
                        <div className="flex items-center gap-2">
                          <Crown className="h-4 w-4 text-purple-500" />
                          {t('platinum')}
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t('durationDays')}</label>
                  <Select value={duration.toString()} onValueChange={(value) => setDuration(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">{t('days7')}</SelectItem>
                      <SelectItem value="30">{t('days30')}</SelectItem>
                      <SelectItem value="90">{t('days90')}</SelectItem>
                      <SelectItem value="365">{t('year1')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Grant Button */}
                <Button 
                  onClick={handleGrantSubscription}
                  disabled={actionLoading}
                  className="w-full"
                >
                  {actionLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('granting')}
                    </>
                  ) : (
                    <>
                      <Gift className="h-4 w-4 mr-2" />
                      {t('grantTierForDays', { tier: selectedTier, duration })}
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="font-medium mb-2">{t('noUserSelected')}</h4>
                <p className="text-sm text-muted-foreground">
                  {t('pleaseSelectUserToGrant')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualSubscription;