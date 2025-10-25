import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Users, UserX, Shield, Ban, UserCheck, MoreVertical, Crown, Star, Zap, Gift, Eye, Edit } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { adminService, AdminUser } from "@/services/adminService";
import { UserRole } from "@/types/roles";
import { RoleAssignmentDialog } from "./RoleAssignmentDialog";
import { useTranslation } from "react-i18next";
import { canPerformAction, checkRateLimit, isValidUUID } from "@/utils/securityChecks";

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userRole, userPermissions } = useAuth();
  const { t } = useTranslation();

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [targetRole, setTargetRole] = useState<string>('');

  // Permission checks
  const canViewUsers = userRole === 'admin' || userRole === 'moderator' || userPermissions.includes('view_users');
  const canManageUsers = userRole === 'admin' || userPermissions.includes('manage_users');

  // Load users
  const loadUsers = async () => {
    try {
      setLoading(true);
      console.log('🔧 [UserManagement] Loading users...');
      const fetchedUsers = await adminService.getAllUsers();
      setUsers(fetchedUsers);
      console.log(`✅ [UserManagement] Loaded ${fetchedUsers.length} users`);
    } catch (error) {
      console.error('🔧 [UserManagement] Load users error:', error);
      toast({
        title: t("loadFailed"),
        description: t("failedToLoadUsers"),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canViewUsers) {
      loadUsers();
    }
  }, [canViewUsers]);

  // Handle role change request (opens dialog)
  const handleRoleChangeRequest = (user: AdminUser, role: string) => {
    setSelectedUser(user);
    setTargetRole(role);
    setRoleDialogOpen(true);
  };

  // Handle confirmed role change
  const handleConfirmRoleChange = async (role: string, permissions?: string[]) => {
    if (!selectedUser || !canManageUsers) {
      toast({
        title: t("accessDenied"),
        description: t("noPermissionToChangeRoles"),
        variant: "destructive"
      });
      return;
    }

    // Güvenlik kontrolleri
    if (!isValidUUID(selectedUser.id)) {
      toast({
        title: t("adminUser.management.securityError"),
        description: t("adminUser.management.invalidUserId"),
        variant: "destructive"
      });
      return;
    }

    // Rate limiting kontrolü
    if (!checkRateLimit('role_update', 20, 60)) {
      toast({
        title: t("adminUser.management.rateLimitExceeded"),
        description: t("adminUser.management.tooManyRoleUpdates"),
        variant: "destructive"
      });
      return;
    }

    // Backend'de de kontrol ediliyor ama UI için de kontrol edelim
    const canUpdate = await canPerformAction('update_user_role');
    if (!canUpdate) {
      toast({
        title: t("accessDenied"),
        description: t("adminUser.management.onlyAdminsCanChangeRoles"),
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(`role-${selectedUser.id}`);
      console.log(`🔧 [UserManagement] Changing role: ${selectedUser.id} → ${role}`);
      
      await adminService.updateUserRole(selectedUser.id, role as UserRole);
      
      // If moderator role with permissions, save permissions
      if (role === 'moderator' && permissions && permissions.length > 0) {
        await adminService.updateModeratorPermissions(selectedUser.id, permissions);
        console.log('🔧 [UserManagement] Saved moderator permissions:', permissions);
      }
      
      await loadUsers();

      toast({
        title: t("roleUpdated"),
        description: t("userRoleChangedTo", { role }),
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });

      console.log(`✅ [UserManagement] Role changed: ${selectedUser.id} → ${role}`);
    } catch (error) {
      console.error('🔧 [UserManagement] Role change error:', error);
      toast({
        title: t("roleChangeFailed"),
        description: error instanceof Error ? error.message : t("failedToUpdateRole"),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle ban user
  const handleBanUser = async (userId: string, banStatus: boolean) => {
    if (!canManageUsers) {
      toast({
        title: t("accessDenied"),
        description: t("noPermissionToBanUsers"),
        variant: "destructive"
      });
      return;
    }

    try {
      setActionLoading(`ban-${userId}`);
      console.log(`🔧 [UserManagement] Toggling ban status: ${userId} → ${banStatus}`);
      
      await adminService.updateBanStatus(userId, banStatus);
      
      // Reload the entire user list to get accurate data from server
      await loadUsers();

      toast({
        title: banStatus ? t("userBanned") : t("userUnbanned"),
        description: banStatus ? t("userBannedSuccessfully") : t("userUnbannedSuccessfully"),
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });

      console.log(`✅ [UserManagement] Ban status updated: ${userId}`);
    } catch (error) {
      console.error('🔧 [UserManagement] Ban toggle error:', error);
      toast({
        title: t("banUpdateFailed"),
        description: error instanceof Error ? error.message : t("failedToUpdateBanStatus"),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete user
  const handleDeleteUser = async (userId: string) => {
    if (!canManageUsers) {
      toast({
        title: t("accessDenied"),
        description: t("noPermissionToDeleteUsers"),
        variant: "destructive"
      });
      return;
    }

    // Güvenlik kontrolleri
    if (!isValidUUID(userId)) {
      toast({
        title: t("adminUser.management.securityError"),
        description: t("adminUser.management.invalidUserId"),
        variant: "destructive"
      });
      return;
    }

    // Rate limiting kontrolü - kullanıcı silme daha sıkı kontrol edilmeli
    if (!checkRateLimit('user_delete', 5, 60)) {
      toast({
        title: t("adminUser.management.rateLimitExceeded"),
        description: t("adminUser.management.tooManyDeletions"),
        variant: "destructive"
      });
      return;
    }

    // Sadece adminler kullanıcı silebilir
    const canDelete = await canPerformAction('delete_user');
    if (!canDelete) {
      toast({
        title: t("accessDenied"),
        description: t("adminUser.management.onlyAdminsCanDeleteUsers"),
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(t('confirmDeleteUser'));
    if (!confirmed) return;

    try {
      setActionLoading(`delete-${userId}`);
      console.log(`🔧 [UserManagement] Deleting user: ${userId}`);
      
      await adminService.deleteUser(userId);
      
      // Reload the entire user list to get accurate data from server
      await loadUsers();

      toast({
        title: t("userDeleted"),
        description: t("userDeletedSuccessfully"),
        className: "bg-green-500/10 text-green-600 border-green-500/20",
      });

      console.log(`✅ [UserManagement] User deleted: ${userId}`);
    } catch (error) {
      console.error('🔧 [UserManagement] Delete user error:', error);
      toast({
        title: t("userDeletionFailed"),
        description: error instanceof Error ? error.message : t("failedToDeleteUser"),
        variant: "destructive"
      });
    } finally {
      setActionLoading(null);
    }
  };

  // Get role badge variant
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive' as const;
      case 'moderator': return 'secondary' as const;
      case 'platinum': return 'default' as const;
      case 'gold': return 'outline' as const;
      case 'silver': return 'outline' as const;
      default: return 'secondary' as const;
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (!canViewUsers) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('adminUser.management.accessDenied')}</h3>
          <p className="text-muted-foreground text-center">
            {t('adminUser.management.accessDeniedDesc')}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">{t("loadingUsersTitle")}</h3>
          <p className="text-muted-foreground text-center">
            {t("loadingUsersDescription")}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-300">
            <Users className="h-5 w-5" />
            {t("userManagement")}
            <Badge variant="secondary" className="ml-auto">
              {filteredUsers.length} {t("users")}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                type="text"
                placeholder={t("searchUsersPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-gray-800/50 border-gray-700 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row gap-4">
                    {/* User Avatar & Basic Info */}
                    <div className="flex items-start gap-3 flex-1">
                      <Avatar className="h-14 w-14">
                        <AvatarImage src={user.photos?.[0]} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-lg">
                          {user.name?.slice(0, 2).toUpperCase() || user.email?.slice(0, 2).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-semibold text-lg truncate">
                            {user.name || t('noName')}
                          </h3>
                          {user.is_banned && (
                            <Badge variant="destructive" className="text-xs">
                              <Ban className="h-3 w-3 mr-1" />
                              {t("banned")}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-muted-foreground text-sm mb-2 truncate">
                          {user.email}
                        </p>
                        
                        <div className="flex flex-wrap gap-2 mb-2">
                          <Badge variant={getRoleBadgeVariant(user.role || 'registered')} className="text-xs">
                            {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                            {user.role === 'moderator' && <Shield className="h-3 w-3 mr-1" />}
                            {user.role === 'platinum' && <Crown className="h-3 w-3 mr-1" />}
                            {user.role === 'gold' && <Star className="h-3 w-3 mr-1" />}
                            {user.role === 'silver' && <Zap className="h-3 w-3 mr-1" />}
                            {user.role === 'registered' && <UserCheck className="h-3 w-3 mr-1" />}
                            <span className="capitalize">{user.role || 'registered'}</span>
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground">
                          {t("joined")} {user.created_at ? new Date(user.created_at).toLocaleDateString() : t("unknown")}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/admin/users/${user.id}`)}
                        className="flex-shrink-0 bg-blue-600 hover:bg-blue-500 text-white border-blue-600 hover:border-blue-500"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("view")}
                      </Button>

                      {canManageUsers && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="flex-shrink-0 bg-gray-700 hover:bg-gray-600 text-white border-gray-600 hover:border-gray-500">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-56 bg-gray-800 border-gray-700">
                            <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)} className="text-white hover:bg-gray-700 focus:bg-gray-700">
                              <Eye className="h-4 w-4 mr-2 text-blue-400" />
                              {t("viewDetails")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-gray-700" />
                            
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-400">{t("roleManagement")}</div>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'registered')}
                              disabled={user.role === 'registered' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <UserCheck className="h-4 w-4 mr-2 text-green-400" />
                              {t("setAsRegistered")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'silver')}
                              disabled={user.role === 'silver' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Zap className="h-4 w-4 mr-2 text-cyan-400" />
                              {t("setAsSilver")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'gold')}
                              disabled={user.role === 'gold' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Star className="h-4 w-4 mr-2 text-yellow-500" />
                              {t("setAsGold")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'platinum')}
                              disabled={user.role === 'platinum' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Crown className="h-4 w-4 mr-2 text-purple-500" />
                              {t("setAsPlatinum")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'moderator')}
                              disabled={user.role === 'moderator' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Shield className="h-4 w-4 mr-2 text-blue-500" />
                              {t("setAsModerator")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleRoleChangeRequest(user, 'admin')}
                              disabled={user.role === 'admin' || actionLoading === `role-${user.id}`}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Shield className="h-4 w-4 mr-2 text-red-500" />
                              {t("setAsAdmin")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-gray-700" />
                            
                            <DropdownMenuItem 
                              onClick={() => navigate(`/admin/users/${user.id}/subscription`)}
                              className="text-white hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <Gift className="h-4 w-4 mr-2 text-green-500" />
                              {t("manageSubscription")}
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-gray-700" />
                            
                            <DropdownMenuItem 
                              onClick={() => handleBanUser(user.id, !user.is_banned)}
                              disabled={actionLoading === `ban-${user.id}`}
                              className={user.is_banned ? "text-green-500 hover:bg-gray-700 focus:bg-gray-700" : "text-orange-500 hover:bg-gray-700 focus:bg-gray-700"}
                            >
                              {user.is_banned ? (
                                <>
                                  <UserCheck className="h-4 w-4 mr-2 text-green-400" />
                                  {t("unbanUser")}
                                </>
                              ) : (
                                <>
                                  <Ban className="h-4 w-4 mr-2 text-orange-400" />
                                  {t("banUser")}
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={actionLoading === `delete-${user.id}`}
                              className="text-red-500 hover:bg-gray-700 focus:bg-gray-700"
                            >
                              <UserX className="h-4 w-4 mr-2 text-red-400" />
                              {t("deleteUser")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>

                    {/* Loading indicator for actions */}
                    {(actionLoading === `role-${user.id}` || 
                      actionLoading === `ban-${user.id}` || 
                      actionLoading === `delete-${user.id}`) && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                          {actionLoading === `role-${user.id}` && t("updatingRole")}
                          {actionLoading === `ban-${user.id}` && (user.is_banned ? t("unbanningUser") : t("banningUser"))}
                          {actionLoading === `delete-${user.id}` && t("deletingUser")}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('adminUser.management.noUsersFound')}</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {searchTerm ? t('adminUser.management.noUsersFoundDesc') : t('adminUser.management.noUsersRegistered')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role Assignment Dialog */}
      <RoleAssignmentDialog
        isOpen={roleDialogOpen}
        onClose={() => {
          setRoleDialogOpen(false);
          setSelectedUser(null);
          setTargetRole('');
        }}
        onConfirm={handleConfirmRoleChange}
        userName={selectedUser?.name || selectedUser?.email || t('adminUser.management.unknownUser')}
        targetRole={targetRole}
      />
    </div>
  );
};

export default UserManagement;