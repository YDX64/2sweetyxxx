import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useProfiles } from "@/hooks/useProfiles";
import { toast } from "@/hooks/use-toast";
import { Heart, MapPin, Calendar, Users, Save, Loader2, Car, Globe, User } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

export const UserPreferencesSettings = () => {
  const { t } = useLanguage();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const { refetchProfiles } = useProfiles();
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    min_age: 18,
    max_age: 35,
    max_distance: 50,
    show_me: 'everyone' as 'men' | 'women' | 'everyone'
  });

  useEffect(() => {
    if (preferences) {
      // If max_distance is very large (like 999999), show as 600 for worldwide
      const displayDistance = preferences.max_distance && preferences.max_distance > 600 
        ? 600 
        : preferences.max_distance || 50;
        
      setFormData({
        min_age: preferences.min_age || 18,
        max_age: preferences.max_age || 35,
        max_distance: displayDistance,
        show_me: (preferences.show_me as 'men' | 'women' | 'everyone') || 'everyone'
      });
    }
  }, [preferences]);

  const handleAgeRangeChange = (values: number[]) => {
    setFormData(prev => ({
      ...prev,
      min_age: values[0],
      max_age: values[1]
    }));
    setHasChanges(true);
  };

  const handleDistanceChange = (values: number[]) => {
    setFormData(prev => ({
      ...prev,
      max_distance: values[0]
    }));
    setHasChanges(true);
  };

  const handleShowMeChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      show_me: value as 'men' | 'women' | 'everyone'
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // If worldwide is selected, save a large distance value
    const distanceToSave = formData.max_distance >= 600 ? 999999 : formData.max_distance;
    
    const success = await updatePreferences({
      ...formData,
      max_distance: distanceToSave
    });
    
    if (success) {
      setHasChanges(false);
      refetchProfiles();
      toast({
        title: t("preferencesSavedToastTitle"),
        description: t("preferencesSavedToastDesc"),
      });
    }
    setSaving(false);
  };

  // Helper function to get distance display text and icon
  const getDistanceDisplay = (distance: number) => {
    if (distance >= 600) {
      return {
        text: t("worldwide"),
        icon: Globe,
        actualDistance: 999999 // Use a very large number for worldwide
      };
    }
    return {
      text: `${distance} km`,
      icon: Car,
      actualDistance: distance
    };
  };

  const distanceDisplay = getDistanceDisplay(formData.max_distance);
  const DistanceIcon = distanceDisplay.icon;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">{t("loadingPreferences")}</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t("discoveryPreferencesHeader")}</h1>
        <p className="text-gray-600 dark:text-gray-300">{t("discoveryPreferencesSubHeader")}</p>
      </div>

      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Calendar className="w-5 h-5 text-pink-500" />
            {t("ageRangeCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-3">
            <Slider
              value={[formData.min_age, formData.max_age]}
              onValueChange={handleAgeRangeChange}
              min={18}
              max={100}
              step={1}
              className="w-full overflow-visible"
            />
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <span>{formData.min_age} {t("years")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{formData.max_age} {t("years")}</span>
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {formData.min_age}-{formData.max_age} {t("yearsOldRange")}
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <DistanceIcon className="w-5 h-5 text-pink-500" />
            {t("maxDistanceCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="px-3">
            <Slider
              value={[formData.max_distance]}
              onValueChange={handleDistanceChange}
              min={1}
              max={600}
              step={formData.max_distance < 100 ? 5 : formData.max_distance < 300 ? 10 : 50}
              className="w-full"
            />
          </div>
          <div className="text-center flex items-center justify-center gap-2">
            <DistanceIcon className="w-5 h-5 text-pink-500" />
            <span className="text-lg font-semibold text-pink-500">
              {distanceDisplay.text}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {formData.max_distance >= 600 
              ? t("worldwide") 
              : `${formData.max_distance} km ${t("maxDistanceText")}`}
          </p>
        </CardContent>
      </Card>

      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Users className="w-5 h-5 text-pink-500" />
            {t("showMeCardTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            value={formData.show_me} 
            onValueChange={handleShowMeChange}
            className="grid grid-cols-1 gap-4"
          >
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="men" id="show-men" />
              <Label htmlFor="show-men" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("showMenLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("showMenDescription")}</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="women" id="show-women" />
              <Label htmlFor="show-women" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("showWomenLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("showWomenDescription")}</div>
              </Label>
            </div>
            
            <div className="flex items-center space-x-2 p-3 border dark:border-gray-600/50 border-gray-200/70 rounded-lg hover:bg-gray-50/70 dark:hover:bg-gray-700/50 transition-colors">
              <RadioGroupItem value="everyone" id="show-everyone" />
              <Label htmlFor="show-everyone" className="flex-1 cursor-pointer">
                <div className="font-medium dark:text-gray-100">{t("showEveryoneLabel")}</div>
                <div className="text-sm text-gray-500 dark:text-gray-300">{t("showEveryoneDescription")}</div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <div className="sticky bottom-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-t dark:border-gray-700/50 border-gray-200/50 p-4 -mx-6">
        <Button 
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`w-full ${hasChanges 
            ? 'bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600'
            : 'bg-gray-300'
          }`}
        >
          {saving ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("saving")}</>
          ) : (
            <><Save className="mr-2 h-4 w-4" />{t("saveChangesButton")}</>
          )}
        </Button>
      </div>

      <Card className="bg-gradient-to-r from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border-pink-200 dark:border-pink-800">
        <CardContent className="p-4">
          <h3 className="font-semibold text-pink-700 dark:text-pink-300 mb-2 flex items-center gap-2">
            <Heart className="w-4 h-4" />
            {t("currentPreferences")}
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">{t("age")}:</span>
              <span className="ml-2 font-medium dark:text-white">{formData.min_age}-{formData.max_age}</span>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">{t("distance")}:</span>
              <span className="ml-2 font-medium dark:text-white">{distanceDisplay.text}</span>
            </div>
            <div className="col-span-2">
              <span className="text-gray-600 dark:text-gray-400">{t("show")}:</span>
              <span className="ml-2 font-medium dark:text-white">
                {formData.show_me === 'men' ? t("men") : 
                 formData.show_me === 'women' ? t("women") : t("everyone")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
