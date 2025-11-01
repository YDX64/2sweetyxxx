import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/hooks/use-toast";
import { Bell, Heart, MessageCircle, Star, Users, Save, Volume2, Clock, Mail } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const NotificationSettings = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState({
    // Push bildirimleri
    newMatches: true,
    newMessages: true,
    superLikes: true,
    profileVisitors: false,
    promotions: false,
    
    // E-posta bildirimleri
    emailMatches: false,
    emailMessages: false,
    emailPromotions: false,
    weeklyDigest: true,
    
    // Ses ve titreşim
    soundEnabled: true,
    vibrationEnabled: true,
    soundVolume: [70],
    
    // Zaman ayarları
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "08:00"
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleSwitchChange = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleVolumeChange = (value: number[]) => {
    setSettings(prev => ({ ...prev, soundVolume: value }));
    setHasChanges(true);
  };

  const handleTimeChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    console.log('Saving notification settings:', settings);
    setHasChanges(false);
    toast({
      title: t("notificationSettingsSavedToastTitle"),
      description: t("notificationSettingsSavedToastDesc"),
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("notificationSettingsTitle")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("notificationSettingsDescription")}</p>
      </div>

      {/* Push Bildirimleri */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Bell className="w-5 h-5 text-pink-500" />
            {t("pushNotificationsCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <Heart className="w-5 h-5 text-pink-500" />
              <div>
                <div className="font-medium dark:text-gray-100">{t("newMatchesLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("newMatchesDescription")}</div>
              </div>
            </div>
            <Switch
              checked={settings.newMatches}
              onCheckedChange={(checked) => handleSwitchChange('newMatches', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-5 h-5 text-blue-500" />
              <div>
                <div className="font-medium dark:text-gray-100">{t("newMessagesLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("newMessagesDescription")}</div>
              </div>
            </div>
            <Switch
              checked={settings.newMessages}
              onCheckedChange={(checked) => handleSwitchChange('newMessages', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <div>
                <div className="font-medium dark:text-gray-100">{t("superLikesLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("superLikesDescription")}</div>
              </div>
            </div>
            <Switch
              checked={settings.superLikes}
              onCheckedChange={(checked) => handleSwitchChange('superLikes', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-green-500" />
              <div>
                <div className="font-medium dark:text-gray-100">{t("profileVisitorsLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("profileVisitorsDescription")}</div>
              </div>
            </div>
            <Switch
              checked={settings.profileVisitors}
              onCheckedChange={(checked) => handleSwitchChange('profileVisitors', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-purple-500" />
              <div>
                <div className="font-medium dark:text-gray-100">{t("promotionsLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("promotionsDescription")}</div>
              </div>
            </div>
            <Switch
              checked={settings.promotions}
              onCheckedChange={(checked) => handleSwitchChange('promotions', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* E-posta Bildirimleri */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Mail className="w-5 h-5 text-pink-500" />
            {t("emailNotificationsCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("emailMatchesLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("emailMatchesDescription")}</div>
            </div>
            <Switch
              checked={settings.emailMatches}
              onCheckedChange={(checked) => handleSwitchChange('emailMatches', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("emailMessagesLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("emailMessagesDescription")}</div>
            </div>
            <Switch
              checked={settings.emailMessages}
              onCheckedChange={(checked) => handleSwitchChange('emailMessages', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("emailPromotionsLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("emailPromotionsDescription")}</div>
            </div>
            <Switch
              checked={settings.emailPromotions}
              onCheckedChange={(checked) => handleSwitchChange('emailPromotions', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("weeklyDigestLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("weeklyDigestDescription")}</div>
            </div>
            <Switch
              checked={settings.weeklyDigest}
              onCheckedChange={(checked) => handleSwitchChange('weeklyDigest', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Ses ve Titreşim */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Volume2 className="w-5 h-5 text-pink-500" />
            {t("soundAndVibrationCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("soundLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("soundDescription")}</div>
            </div>
            <Switch
              checked={settings.soundEnabled}
              onCheckedChange={(checked) => handleSwitchChange('soundEnabled', checked)}
            />
          </div>

          {settings.soundEnabled && (
            <div className="p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg">
              <Label className="block mb-2 dark:text-gray-100">{t("soundVolumeLabel")}</Label>
              <div className="px-3">
                <Slider
                  value={settings.soundVolume}
                  onValueChange={handleVolumeChange}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">{settings.soundVolume[0]}%</span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("vibrationLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("vibrationDescription")}</div>
            </div>
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => handleSwitchChange('vibrationEnabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Sessiz Saatler */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
             <Clock className="w-5 h-5 text-pink-500" />
            {t("quietHoursCardTitle")}
            </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
            <div>
              <div className="font-medium dark:text-gray-100">{t("quietHoursEnableLabel")}</div>
              <div className="text-sm text-gray-500 dark:text-gray-300">{t("quietHoursDescription")}</div>
            </div>
            <Switch
              checked={settings.quietHoursEnabled}
              onCheckedChange={(checked) => handleSwitchChange('quietHoursEnabled', checked)}
            />
          </div>

          {settings.quietHoursEnabled && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quiet-start" className="dark:text-gray-100">{t("quietStartLabel")}</Label>
                <input
                  id="quiet-start"
                  type="time"
                  value={settings.quietStart}
                  onChange={(e) => handleTimeChange('quietStart', e.target.value)}
                  className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100"
                  title={t("quietStartLabel")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quiet-end" className="dark:text-gray-100">{t("quietEndLabel")}</Label>
                <input
                  id="quiet-end"
                  type="time"
                  value={settings.quietEnd}
                  onChange={(e) => handleTimeChange('quietEnd', e.target.value)}
                  className="w-full p-2 border dark:border-gray-600/50 border-gray-200/70 rounded-md dark:bg-gray-700/50 dark:text-gray-100"
                  title={t("quietEndLabel")}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kaydet Butonu */}
      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t dark:border-gray-700/50 border-gray-200/50 p-4 -mx-6">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full ${hasChanges 
            ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
            : 'bg-gray-300'
          }`}
        >
          <Save className="mr-2 h-4 w-4" />
          {t("saveChangesButton")}
        </Button>
      </div>
    </div>
  );
};
