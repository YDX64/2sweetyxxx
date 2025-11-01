import { useState, lazy, Suspense, memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useLanguage } from "@/hooks/useLanguage";
import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  User, 
  Heart, 
  Shield, 
  Bell, 
  HelpCircle, 
  LogOut,
  Settings as SettingsIcon,
  ChevronRight,
  Crown
} from "lucide-react";

// Lazy load settings components for better performance
const UserPreferencesSettings = lazy(() => import("@/components/settings/UserPreferencesSettings").then(m => ({ default: m.UserPreferencesSettings })));
const ProfileSettings = lazy(() => import("@/components/settings/ProfileSettings").then(m => ({ default: m.ProfileSettings })));
const SubscriptionSettings = lazy(() => import("@/components/settings/SubscriptionSettings").then(m => ({ default: m.SubscriptionSettings })));
const PrivacySettings = lazy(() => import("@/components/settings/PrivacySettings").then(m => ({ default: m.PrivacySettings })));
const NotificationSettings = lazy(() => import("@/components/settings/NotificationSettings").then(m => ({ default: m.NotificationSettings })));
const HelpSettings = lazy(() => import("@/components/settings/HelpSettings").then(m => ({ default: m.HelpSettings })));

// Loading component for settings sections
const SettingsLoader = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="space-y-3 mt-6">
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
));

const Settings = () => {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState("preferences");

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }, [signOut]);

  const menuItems = [
    {
      id: "preferences",
      label: t("discoveryPreferencesTitle"),
      icon: Heart,
      description: t("discoveryPreferencesDesc"),
      badge: t("important")
    },
    {
      id: "profile",
      label: t("profileSettingsTitle"),
      icon: User,
      description: t("profileSettingsDesc"),
    },
    {
      id: "subscription",
      label: t("subscriptionSettingsTitle"),
      icon: Crown,
      description: t("subscriptionSettingsDesc"),
    },
    {
      id: "privacy",
      label: t("privacy"),
      icon: Shield,
      description: t("privacyDesc"),
    },
    {
      id: "notifications",
      label: t("notifications"),
      icon: Bell,
      description: t("notificationsDesc"),
    },
    {
      id: "help",
      label: t("help"),
      icon: HelpCircle,
      description: t("helpDesc"),
    }
  ];

  const renderContent = useCallback(() => {
    const Component = (() => {
      switch (activeTab) {
        case "preferences":
          return UserPreferencesSettings;
        case "profile":
          return ProfileSettings;
        case "subscription":
          return SubscriptionSettings;
        case "privacy":
          return PrivacySettings;
        case "notifications":
          return NotificationSettings;
        case "help":
          return HelpSettings;
        default:
          return UserPreferencesSettings;
      }
    })();
    
    return (
      <Suspense fallback={<SettingsLoader />}>
        <Component />
      </Suspense>
    );
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      
      <div className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-3">
              <SettingsIcon className="w-8 h-8 text-pink-500" />
              {t('settingsTitle')}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">{t('settingsDesc')}</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="xl:col-span-1">
              <Card className="sticky top-6 dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-gray-100">{t('settingsCategories')}</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left p-3 rounded-lg transition-colors flex items-center justify-between group ${
                          activeTab === item.id
                            ? 'bg-pink-50/70 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border-l-4 border-pink-500'
                            : 'hover:bg-gray-50/70 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className={`w-5 h-5 ${
                            activeTab === item.id ? 'text-pink-500' : 'text-gray-400 dark:text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium text-sm">{item.label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs bg-pink-100 dark:bg-pink-900/50 text-pink-700 dark:text-pink-300">
                              {item.badge}
                            </Badge>
                          )}
                          <ChevronRight className={`w-4 h-4 transition-transform ${
                            activeTab === item.id ? 'text-pink-500' : 'text-gray-400 dark:text-gray-400'
                          }`} />
                        </div>
                      </button>
                    ))}
                    
                    <div className="border-t dark:border-gray-600/50 pt-2 mt-4">
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left p-3 rounded-lg transition-colors flex items-center gap-3 hover:bg-red-50/70 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 group"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">{t('signOut')}</span>
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Content */}
            <div className="xl:col-span-3">
              <Card className="min-h-[600px] dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-4 lg:p-6">
                  {renderContent()}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <NavigationBar />
    </div>
  );
};

export default Settings;
