import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { adminService } from '@/services/adminService';
import { useTranslation } from 'react-i18next';

export const ModeratorPermissionsDisplay = () => {
  const { user, userRole } = useAuth();
  const { t } = useTranslation();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPermissions = async () => {
      if (user && userRole === 'moderator') {
        try {
          const perms = await adminService.getModeratorPermissions(user.id);
          setPermissions(perms);
        } catch (error) {
          console.error('Failed to load moderator permissions:', error);
        }
      }
      setLoading(false);
    };

    loadPermissions();
  }, [user, userRole]);

  if (userRole !== 'moderator' || loading) {
    return null;
  }

  const allPermissions = [
    'manage_users',
    'ban_users',
    'view_reports',
    'manage_content'
  ];

  return (
    <Card className="bg-gray-800/50 border-gray-700 mb-6">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-500" />
          {t('moderatorPermissions.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {allPermissions.map(permission => {
            const hasPermission = permissions.includes(permission);
            return (
              <div
                key={permission}
                className="flex items-center gap-2 p-3 bg-gray-900/50 rounded-lg border border-gray-700"
              >
                {hasPermission ? (
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                ) : (
                  <XCircle className="h-4 w-4 text-gray-500 flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {t(`permissions.${permission}.label`)}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {t(`permissions.${permission}.description`)}
                  </p>
                </div>
                <Badge
                  variant={hasPermission ? "default" : "secondary"}
                  className={hasPermission ? "bg-green-500/20 text-green-400" : ""}
                >
                  {hasPermission ? t('active') : t('inactive')}
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};