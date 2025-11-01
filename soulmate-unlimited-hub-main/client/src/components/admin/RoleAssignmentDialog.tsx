import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldAlert, User, Crown, Star, Gem } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ClientSecurityService, useSecurityContext } from '@/lib/security';
import { useAuth } from '@/hooks/useAuth';

interface RoleAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (role: string, permissions?: string[]) => void;
  userName: string;
  targetRole: string;
}

const getModeratorPermissions = (t: any) => [
  {
    id: 'manage_users',
    label: t('permissions.manage_users.label'),
    description: t('permissions.manage_users.description')
  },
  {
    id: 'ban_users',
    label: t('permissions.ban_users.label'),
    description: t('permissions.ban_users.description')
  },
  {
    id: 'view_reports',
    label: t('permissions.view_reports.label'),
    description: t('permissions.view_reports.description')
  },
  {
    id: 'manage_content',
    label: t('permissions.manage_content.label'),
    description: t('permissions.manage_content.description')
  }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <ShieldAlert className="h-5 w-5 text-red-500" />;
    case 'moderator':
      return <Shield className="h-5 w-5 text-blue-500" />;
    case 'platinum':
      return <Crown className="h-5 w-5 text-purple-500" />;
    case 'gold':
      return <Star className="h-5 w-5 text-yellow-500" />;
    case 'silver':
      return <Gem className="h-5 w-5 text-gray-400" />;
    default:
      return <User className="h-5 w-5 text-gray-500" />;
  }
};

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'bg-red-500/10 text-red-600 border-red-500/20';
    case 'moderator':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
    case 'platinum':
      return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
    case 'gold':
      return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
    case 'silver':
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    default:
      return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
  }
};

export const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  userName,
  targetRole
}) => {
  const { t } = useTranslation();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const MODERATOR_PERMISSIONS = getModeratorPermissions(t);

  const handlePermissionToggle = (permissionId: string) => {
    setSelectedPermissions(prev => 
      prev.includes(permissionId)
        ? prev.filter(id => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const handleConfirm = () => {
    if (targetRole === 'moderator') {
      onConfirm(targetRole, selectedPermissions);
    } else {
      onConfirm(targetRole);
    }
    setSelectedPermissions([]);
    onClose();
  };

  const handleCancel = () => {
    setSelectedPermissions([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800/95 border-gray-700/50 text-white max-w-2xl backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getRoleIcon(targetRole)}
            {t('roleAssignmentConfirmation')}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            <span className="font-semibold text-white">{userName}</span> {t('roleAssignmentDescription')}{' '}
            <Badge className={getRoleColor(targetRole)}>{targetRole}</Badge> {t('roleWillBeAssigned')}.
          </DialogDescription>
        </DialogHeader>

        {targetRole === 'admin' && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <h4 className="font-semibold text-red-400">{t('adminWarning.title')}</h4>
            </div>
            <p className="text-red-300 text-sm">
              {t('adminWarning.description')}:
            </p>
            <ul className="list-disc list-inside text-red-300 text-sm mt-2 space-y-1">
              <li>{t('adminWarning.permissions.manageAllUsers')}</li>
              <li>{t('adminWarning.permissions.assignRoles')}</li>
              <li>{t('adminWarning.permissions.changePlatformSettings')}</li>
              <li>{t('adminWarning.permissions.accessAllData')}</li>
              <li>{t('adminWarning.permissions.systemChanges')}</li>
            </ul>
            <p className="text-red-400 font-semibold text-sm mt-3">
              {t('adminWarning.irreversible')}
            </p>
          </div>
        )}

        {targetRole === 'moderator' && (
          <div className="space-y-4">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <h4 className="font-semibold text-blue-400">{t('moderatorPermissions.title')}</h4>
              </div>
              <p className="text-blue-300 text-sm">
                {t('moderatorPermissions.description')}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
              {MODERATOR_PERMISSIONS.map((permission) => (
                <div
                  key={permission.id}
                  className="flex items-start gap-3 p-3 bg-gray-700/50 border border-gray-600/50 rounded-lg hover:bg-gray-700/80 transition-colors"
                >
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.includes(permission.id)}
                    onCheckedChange={() => handlePermissionToggle(permission.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={permission.id}
                      className="font-medium text-white cursor-pointer"
                    >
                      {permission.label}
                    </label>
                    <p className="text-sm text-gray-400 mt-1">
                      {permission.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {selectedPermissions.length === 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                <p className="text-yellow-400 text-sm">
                  {t('moderatorPermissions.selectAtLeastOne')}
                </p>
              </div>
            )}
          </div>
        )}

        {['platinum', 'gold', 'silver'].includes(targetRole) && (
          <div className="bg-gray-700/50 border border-gray-600/50 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              {getRoleIcon(targetRole)}
              <h4 className="font-semibold text-white">{t('subscriptionRole.title')}</h4>
            </div>
            <p className="text-gray-400 text-sm">
              {t('subscriptionRole.description', { role: targetRole })}
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-transparent border-gray-600/50 text-gray-300 hover:bg-gray-700/50"
          >
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={targetRole === 'moderator' && selectedPermissions.length === 0}
            className={
              targetRole === 'admin'
                ? "bg-red-600 hover:bg-red-500 text-white"
                : targetRole === 'moderator'
                ? "bg-blue-600 hover:bg-blue-500 text-white"
                : "bg-green-600 hover:bg-green-500 text-white"
            }
          >
            {targetRole === 'admin' ? t('makeAdmin') : 
             targetRole === 'moderator' ? t('makeModerator') : 
             t('makeRole', { role: targetRole })}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};