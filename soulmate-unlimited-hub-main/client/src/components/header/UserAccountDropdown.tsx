import { Settings, User, LogOut, Shield, Users, Crown, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { UserRole, ROLE_INFO } from "@/types/roles";
import { useSubscription } from "@/hooks/useSubscription";
import { TIER_INFO } from "@/types/subscription";
import { getTierBadgeStyle } from "@/utils/tierUtils";
import { syncUtils } from "@/utils/syncUtils";
import { toast } from "sonner";

interface UserAccountDropdownProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export const UserAccountDropdown = ({ onLoginClick, onRegisterClick }: UserAccountDropdownProps) => {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const { subscription_tier } = useSubscription();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserRole();
    } else {
      setUserRole(null);
      setIsAdmin(false);
      setIsModerator(false);
    }
  }, [user]);

  const loadUserRole = async () => {
    if (!user) return;
    
    try {
      // Check actual user role from profiles table
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (!error && profileData && profileData.role) {
        const role = profileData.role as UserRole;
        setUserRole(role);
        setIsAdmin(role === 'admin');
        setIsModerator(role === 'moderator');
      } else {
        // Default to subscription tier if no role found
        setUserRole(subscription_tier || 'registered');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
      setUserRole(subscription_tier || 'registered');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const handleSettingsClick = () => {
    navigate('/settings');
  };

  const handleSyncData = async () => {
    if (!user || isSyncing) return;
    
    setIsSyncing(true);
    toast.loading('Syncing data...');
    
    const result = await syncUtils.forceRefreshUserData(user.id);
    
    if (result.success) {
      toast.success(t('interface.syncSuccess'));
      // Reload the page to ensure all components get fresh data
      setTimeout(() => window.location.reload(), 500);
    }
    
    setIsSyncing(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="default"
          className="btn-primary h-9 flex-shrink-0 gap-2 text-white"
        >
          <User className="w-4 h-4 text-white" />
          <span className="hidden sm:inline text-responsive-sm text-white">{t('account')}</span>
          {/* Show admin/moderator badge */}
          {isAdmin && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-0">
              {t('roles.admin')}
            </Badge>
          )}
          {isModerator && !isAdmin && (
            <Badge className="bg-blue-500 text-white text-xs px-2 py-0">
              {t('roles.moderator')}
            </Badge>
          )}
          {/* Show subscription tier badge (only if not admin/moderator role) */}
          {subscription_tier && 
           subscription_tier !== 'registered' && 
           subscription_tier !== 'admin' && 
           subscription_tier !== 'moderator' && 
           TIER_INFO[subscription_tier] && (
            <Badge className={`${getTierBadgeStyle(subscription_tier)} text-xs px-2 py-0`}>
              {TIER_INFO[subscription_tier].displayName}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-48 bg-white dark:bg-gray-800/95 border dark:border-gray-700/50 shadow-lg z-[60] backdrop-blur-md"
        sideOffset={5}
      >
        {user ? (
          <>
            {/* Admin Menu Item */}
            {isAdmin && (
              <>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
                  onClick={() => navigate('/admin')}
                >
                  <Shield className="w-4 h-4 mr-2 text-red-500" />
                  <span className="text-responsive-sm">{t('navigation.adminPanel')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700/50" />
              </>
            )}
            
            {/* Moderator Menu Item */}
            {/* Sync Data Menu Item */}
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
              onClick={handleSyncData}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="text-responsive-sm">{isSyncing ? 'Syncing...' : 'Sync Data'}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="dark:bg-gray-700/50" />
            
            {(isModerator || isAdmin) && (
              <>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
                  onClick={() => navigate('/moderator')}
                >
                  <Users className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-responsive-sm">{t('navigation.moderatorPanel')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700/50" />
              </>
            )}
            
            {/* Premium Status */}
            {subscription_tier && ['silver', 'gold', 'platinum'].includes(subscription_tier) && (
              <>
                <DropdownMenuItem 
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element"
                  onClick={() => navigate('/upgrades')}
                >
                  <Crown className="w-4 h-4 mr-2 text-yellow-500" />
                  <div className="flex items-center gap-2">
                    <span className="text-responsive-sm">Premium</span>
                    <Badge className={`${getTierBadgeStyle(subscription_tier)} text-xs`}>
                      {TIER_INFO[subscription_tier].displayName}
                    </Badge>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="dark:bg-gray-700/50" />
              </>
            )}
            
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
              onClick={handleSettingsClick}
            >
              <Settings className="w-4 h-4 mr-2" />
              <span className="text-responsive-sm">{t('settings')}</span>
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="dark:bg-gray-700/50" />
            
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 text-red-600 dark:text-red-400 interactive-element"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              <span className="text-responsive-sm">{t('signOut')}</span>
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
              onClick={onLoginClick}
            >
              <User className="w-4 h-4 mr-2" />
              <span className="text-responsive-sm">{t('signIn')}</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 interactive-element dark:text-gray-200"
              onClick={onRegisterClick}
            >
              <User className="w-4 h-4 mr-2" />
              <span className="text-responsive-sm">{t('signUp')}</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
