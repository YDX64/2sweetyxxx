import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "@/hooks/use-toast";
import { Shield, Eye, Lock, MapPin, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface PrivacySettings {
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showDistance: boolean;
  showAge: boolean;
  profileVisibility: 'everyone' | 'matches' | 'nobody';
  allowSuperLikes: boolean;
  showInDiscovery: boolean;
  readReceipts: boolean;
  allowScreenshots: boolean;
  hideFromContacts: boolean;
  incognitoMode: boolean;
  dataCollection: boolean;
  analytics: boolean;
}

export const PrivacySettings = () => {
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<PrivacySettings>({
    showOnlineStatus: true,
    showLastSeen: false,
    showDistance: true,
    showAge: true,
    profileVisibility: 'everyone',
    allowSuperLikes: true,
    showInDiscovery: true,
    readReceipts: true,
    allowScreenshots: true,
    hideFromContacts: false,
    incognitoMode: false,
    dataCollection: true,
    analytics: true
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Simulated data loading
  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Burada gerçek API çağrısı yapılacak
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data - gerçek uygulamada API'den gelecek
        const loadedSettings = {
          showOnlineStatus: true,
          showLastSeen: false,
          showDistance: true,
          showAge: true,
          profileVisibility: 'everyone' as const,
          allowSuperLikes: true,
          showInDiscovery: true,
          readReceipts: true,
          allowScreenshots: true,
          hideFromContacts: false,
          incognitoMode: false,
          dataCollection: true,
          analytics: true
        };
        
        setSettings(loadedSettings);
      } catch (error) {
        toast({
          title: t("error"),
          description: t("privacySettingsLoadError"),
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [t]);

  const handleSwitchChange = (key: keyof PrivacySettings, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleRadioChange = (key: keyof PrivacySettings, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Burada gerçek API çağrısı yapılacak
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log('Saving privacy settings:', settings);
      setHasChanges(false);
      toast({
        title: t("privacySettingsSavedToastTitle"),
        description: t("privacySettingsSavedToastDesc"),
      });
    } catch (error) {
      toast({
        title: t("error"),
        description: t("privacySettingsSaveError"),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings({
      showOnlineStatus: true,
      showLastSeen: false,
      showDistance: true,
      showAge: true,
      profileVisibility: 'everyone',
      allowSuperLikes: true,
      showInDiscovery: true,
      readReceipts: true,
      allowScreenshots: true,
      hideFromContacts: false,
      incognitoMode: false,
      dataCollection: true,
      analytics: true
    });
    setHasChanges(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">{t("privacySettingsLoading")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("privacySettingsTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("privacySettingsDescription")}</p>
      </div>

      {/* Profil Görünürlüğü */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Eye className="w-5 h-5 text-pink-500" />
            {t("profileVisibilityCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup 
            value={settings.profileVisibility} 
            onValueChange={(value) => handleRadioChange('profileVisibility', value)}
          >
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="everyone" id="visibility-everyone" />
              <Label htmlFor="visibility-everyone" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("visibilityEveryoneLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("visibilityEveryoneDescription")}</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="matches" id="visibility-matches" />
              <Label htmlFor="visibility-matches" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("visibilityMatchesLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("visibilityMatchesDescription")}</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="nobody" id="visibility-nobody" />
              <Label htmlFor="visibility-nobody" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("visibilityNobodyLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("visibilityNobodyDescription")}</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Keşif ve Konum Ayarları */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <MapPin className="w-5 h-5 text-pink-500" />
            {t("discoveryAndLocationCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("showInDiscoveryLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("showInDiscoveryDescription")}</div>
            </div>
            <Switch
              checked={settings.showInDiscovery}
              onCheckedChange={(checked) => handleSwitchChange('showInDiscovery', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("showDistanceLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("showDistanceDescription")}</div>
            </div>
            <Switch
              checked={settings.showDistance}
              onCheckedChange={(checked) => handleSwitchChange('showDistance', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("showAgeLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("showAgeDescription")}</div>
            </div>
            <Switch
              checked={settings.showAge}
              onCheckedChange={(checked) => handleSwitchChange('showAge', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("hideFromContactsLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("hideFromContactsDescription")}</div>
            </div>
            <Switch
              checked={settings.hideFromContacts}
              onCheckedChange={(checked) => handleSwitchChange('hideFromContacts', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Etkileşim Ayarları */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Lock className="w-5 h-5 text-pink-500" />
            {t("interactionSettingsCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("allowSuperLikesLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("allowSuperLikesDescription")}</div>
            </div>
            <Switch
              checked={settings.allowSuperLikes}
              onCheckedChange={(checked) => handleSwitchChange('allowSuperLikes', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("showOnlineStatusLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("showOnlineStatusDescription")}</div>
            </div>
            <Switch
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => handleSwitchChange('showOnlineStatus', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("showLastSeenLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("showLastSeenDescription")}</div>
            </div>
            <Switch
              checked={settings.showLastSeen}
              onCheckedChange={(checked) => handleSwitchChange('showLastSeen', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("readReceiptsLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("readReceiptsDescription")}</div>
            </div>
            <Switch
              checked={settings.readReceipts}
              onCheckedChange={(checked) => handleSwitchChange('readReceipts', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("allowScreenshotsLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("allowScreenshotsDescription")}</div>
            </div>
            <Switch
              checked={settings.allowScreenshots}
              onCheckedChange={(checked) => handleSwitchChange('allowScreenshots', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gelişmiş Gizlilik */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Shield className="w-5 h-5 text-pink-500" />
            {t("advancedPrivacyCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100 flex items-center gap-2">
                {t("incognitoModeLabel")}
                <span className="bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 px-2 py-1 rounded-full text-xs">{t("premium")}</span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("incognitoModeDescription")}</div>
            </div>
            <Switch
              checked={settings.incognitoMode}
              onCheckedChange={(checked) => handleSwitchChange('incognitoMode', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("dataCollectionLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("dataCollectionDescription")}</div>
            </div>
            <Switch
              checked={settings.dataCollection}
              onCheckedChange={(checked) => handleSwitchChange('dataCollection', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("analyticsLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("analyticsDescription")}</div>
            </div>
            <Switch
              checked={settings.analytics}
              onCheckedChange={(checked) => handleSwitchChange('analytics', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Güvenlik Bilgisi */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800/50">
        <CardContent className="p-4">
          <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t("privacyTip")}
          </h3>
          <p className="text-blue-600 dark:text-blue-300 text-sm">
            {t("privacyTipDescription")}
          </p>
        </CardContent>
      </Card>

      {/* Alt Butonlar */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm border-t dark:border-gray-600/50 border-gray-200/70 p-4 rounded-t-lg">
        <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-600/50"
            disabled={saving}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            {t("resetToDefaultButton")}
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                {t("saving")}
              </>
            ) : (
              <>
                {hasChanges ? <Save className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                {hasChanges ? t("savePrivacySettingsButton") : t("noChangesToSave")}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
