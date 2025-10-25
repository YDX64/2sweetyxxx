import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Save, RefreshCcw, ExternalLink, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ConfigItem {
  id: string;
  key: string;
  value: string | null;
  description: string | null;
  category: 'ads' | 'analytics' | 'general';
  is_active: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export const SiteConfiguration: React.FC = () => {
  const { t } = useTranslation();
  const [configs, setConfigs] = useState<ConfigItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editedConfigs, setEditedConfigs] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadConfigurations();
  }, []);

  const loadConfigurations = async () => {
    try {
      const { data, error } = await supabase
        .from('site_configuration')
        .select('*')
        .order('category', { ascending: true })
        .order('key', { ascending: true });

      if (error) throw error;

      setConfigs((data || []).map(item => ({
        ...item,
        value: item.value || '',
        description: item.description || ''
      })));
      setEditedConfigs({});
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading configurations:', error);
      toast({
        title: t('error'),
        description: t('ads.configuration.errors.loadFailed'),
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEditedConfigs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Update each changed configuration
      for (const [key, value] of Object.entries(editedConfigs)) {
        const { error } = await supabase
          .from('site_configuration')
          .update({ value, updated_at: new Date().toISOString() })
          .eq('key', key);

        if (error) throw error;
      }

      toast({
        title: t('success'),
        description: t('ads.configuration.success.saved')
      });

      await loadConfigurations();
    } catch (error) {
      console.error('Error saving configurations:', error);
      toast({
        title: t('error'),
        description: t('ads.configuration.errors.saveFailed'),
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getValue = (key: string) => {
    if (editedConfigs[key] !== undefined) return editedConfigs[key];
    const config = configs.find(c => c.key === key);
    return config?.value || '';
  };

  const renderConfigInput = (config: ConfigItem) => {
    const value = getValue(config.key);
    const isBooleanValue = value === 'true' || value === 'false';

    if (isBooleanValue) {
      return (
        <div className="flex items-center space-x-2">
          <Switch
            checked={value === 'true'}
            onCheckedChange={(checked) => handleChange(config.key, checked.toString())}
          />
          <Label className="text-sm text-gray-400">{value === 'true' ? t('ads.configuration.status.enabled') : t('ads.configuration.status.disabled')}</Label>
        </div>
      );
    }

    return (
      <Input
        type={config.key.includes('password') || config.key.includes('secret') ? 'password' : 'text'}
        value={value}
        onChange={(e) => handleChange(config.key, e.target.value)}
        placeholder={config.description || undefined}
        className="bg-gray-700/50 border-gray-600 text-white"
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const adsConfigs = configs.filter(c => c.category === 'ads');
  const analyticsConfigs = configs.filter(c => c.category === 'analytics');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">{t('ads.configuration.title')}</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={loadConfigurations}
            disabled={saving}
            className="border-gray-600"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            {t('ads.configuration.buttons.refresh')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || saving}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {t('ads.configuration.buttons.saving')}
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {t('ads.configuration.buttons.save')}
              </>
            )}
          </Button>
        </div>
      </div>

      <Alert className="bg-blue-900/20 border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-400" />
        <AlertDescription className="text-gray-300">
          {t('ads.configuration.description')}
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="ads" className="space-y-4">
        <TabsList className="bg-gray-800/50 border-gray-700">
          <TabsTrigger value="ads" className="data-[state=active]:bg-gray-700">
            {t('ads.configuration.tabs.advertising')}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700">
            {t('ads.configuration.tabs.analytics')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-6">
          {/* Google AdSense */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{t('ads.configuration.sections.googleAdsense')}</CardTitle>
                <a
                  href="https://www.google.com/adsense"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {adsConfigs.filter(c => c.key.includes('google_adsense')).map(config => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-gray-300">
                    {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {renderConfigInput(config)}
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Ad Placement Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{t('ads.configuration.sections.adPlacement')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {adsConfigs.filter(c => c.key.includes('ads_') && !c.key.includes('google')).map(config => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-gray-300">
                    {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {renderConfigInput(config)}
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Google Analytics */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{t('ads.configuration.sections.googleAnalytics')}</CardTitle>
                <a
                  href="https://analytics.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsConfigs.filter(c => c.key.includes('google_')).map(config => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-gray-300">
                    {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {renderConfigInput(config)}
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Facebook Pixel */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">{t('ads.configuration.sections.facebookPixel')}</CardTitle>
                <a
                  href="https://business.facebook.com/events_manager"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsConfigs.filter(c => c.key.includes('facebook_')).map(config => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-gray-300">
                    {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {renderConfigInput(config)}
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tracking Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">{t('ads.configuration.sections.trackingSettings')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsConfigs.filter(c => c.key.includes('track_')).map(config => (
                <div key={config.key} className="space-y-2">
                  <Label className="text-gray-300">
                    {config.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  {renderConfigInput(config)}
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};