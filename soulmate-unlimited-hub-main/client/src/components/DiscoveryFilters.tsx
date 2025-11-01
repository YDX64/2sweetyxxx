import { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/hooks/useLanguage';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { useSubscription } from '@/hooks/useSubscription';
import { X, ArrowLeft, Car, Globe, User, Lock, Crown } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { PremiumGate } from '@/components/PremiumGate';

interface DiscoveryFiltersProps {
  onFiltersChange: (filters: DiscoveryFilters) => void;
  currentFilters: DiscoveryFilters;
}

export interface DiscoveryFilters {
  ageRange: [number, number];
  distance: number;
  interests: string[];
  gender?: 'men' | 'women' | 'everyone';
}

const INTEREST_OPTIONS = [
  'Resor', 'Fotografering', 'Kaffe', 'Konst', 'Matlagning', 'Musik', 
  'Dans', 'Yoga', 'Meditation', 'Böcker', 'Teknologi', 'Gaming',
  'Klättring', 'Fitness', 'Träning', 'Utomhus', 'Piano', 'Violin',
  'Jazz', 'Arkitektur', 'Design', 'Cykling', 'Mat', 'Litteratur',
  'Skrivande', 'Poetry', 'Te', 'Djur', 'Veterinär', 'Natur',
  'Seyahat', 'Fotoğrafçılık', 'Kahve', 'Sanat', 'Yemek Pişirme', 'Müzik',
  'Dans', 'Yoga', 'Meditasyon', 'Kitaplar', 'Teknoloji', 'Oyun',
  'Tırmanış', 'Fitness', 'Antrenman', 'Doğa', 'Piyano', 'Keman',
  'Caz', 'Mimarlık', 'Tasarım', 'Bisiklet', 'Yemek', 'Edebiyat',
  'Yazma', 'Şiir', 'Çay', 'Hayvanlar', 'Veteriner'
];

export const DiscoveryFilters = ({ onFiltersChange, currentFilters }: DiscoveryFiltersProps) => {
  const { t } = useLanguage();
  const { features } = useSubscription();
  const { preferences, updatePreferences, loading } = useUserPreferences();
  const [ageRange, setAgeRange] = useState<[number, number]>(currentFilters.ageRange);
  const [distance, setDistance] = useState(currentFilters.distance);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(currentFilters.interests);
  const [selectedGender, setSelectedGender] = useState<string>(currentFilters.gender || 'everyone');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const hasAdvancedFilters = features.advancedFilters;

  // Load preferences when component mounts and when preferences change
  useEffect(() => {
    if (preferences && !loading && !isInitialized) {
      console.log('Loading preferences into filters:', preferences);
      // If max_distance is very large (like 999999), show as 600 for worldwide
      const displayDistance = preferences.max_distance && preferences.max_distance > 600 
        ? 600 
        : preferences.max_distance || 50;
        
      setAgeRange([preferences.min_age || 18, preferences.max_age || 35]);
      setDistance(displayDistance);
      setSelectedGender(preferences.show_me || 'everyone');
      setIsInitialized(true);
      
      // Apply the loaded preferences immediately
      const loadedFilters = {
        ageRange: [preferences.min_age || 18, preferences.max_age || 35] as [number, number],
        distance: displayDistance,
        interests: selectedInterests,
        gender: (preferences.show_me || 'everyone') as 'men' | 'women' | 'everyone'
      };
      
      console.log('Applying loaded preferences as filters:', loadedFilters);
      onFiltersChange(loadedFilters);
    }
  }, [preferences, loading, isInitialized]);

  // Helper function to get distance display text and icon
  const getDistanceDisplay = (distance: number) => {
    if (distance >= 600) {
      return {
        text: t("worldwide"),
        icon: Globe
      };
    }
    return {
      text: `${distance} km`,
      icon: Car
    };
  };

  const distanceDisplay = getDistanceDisplay(distance);
  const DistanceIcon = distanceDisplay.icon;

  const handleInterestToggle = (interest: string) => {
    setSelectedInterests(prev => {
      const newInterests = prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest];
      
      return newInterests;
    });
  };

  const handleApplyFilters = async () => {
    console.log('Saving filters to preferences...');
    
    // If worldwide is selected, save a large distance value
    const distanceToSave = distance >= 600 ? 999999 : distance;
    
    // Save to user preferences - this is the most important part
    const success = await updatePreferences({
      min_age: ageRange[0],
      max_age: ageRange[1],
      max_distance: distanceToSave,
      show_me: selectedGender as 'men' | 'women' | 'everyone'
    });

    if (success) {
      console.log('Preferences saved successfully');
      
      // Apply the filters to the discovery
      const newFilters = {
        ageRange,
        distance: distanceToSave,
        interests: selectedInterests,
        gender: selectedGender as 'men' | 'women' | 'everyone'
      };
      
      console.log('Applying new filters:', newFilters);
      onFiltersChange(newFilters);
      
      toast({
        title: 'Ayarlar kaydedildi',
        description: 'Tercihleriniz kalıcı olarak kaydedildi ve her zaman hatırlanacak',
        duration: 3000,
      });
    } else {
      toast({
        title: 'Hata',
        description: 'Ayarlar kaydedilemedi, lütfen tekrar deneyin',
        variant: 'destructive',
      });
    }
  };

  const handleReset = async () => {
    console.log('Resetting to default filters...');
    
    const defaultFilters = {
      ageRange: [18, 35] as [number, number],
      distance: 50,
      interests: [],
      gender: 'everyone' as const
    };
    
    setAgeRange(defaultFilters.ageRange);
    setDistance(defaultFilters.distance);
    setSelectedInterests(defaultFilters.interests);
    setSelectedGender(defaultFilters.gender);
    
    // Save the reset preferences
    const success = await updatePreferences({
      min_age: defaultFilters.ageRange[0],
      max_age: defaultFilters.ageRange[1],
      max_distance: defaultFilters.distance,
      show_me: defaultFilters.gender
    });
    
    if (success) {
      onFiltersChange(defaultFilters);
      toast({
        title: 'Ayarlar sıfırlandı',
        description: 'Varsayılan ayarlar kaydedildi',
        duration: 2000,
      });
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">Ayarlar yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center dark:text-gray-100">{t('discoveryPreferences')}</CardTitle>
        <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
          Ayarlarınız otomatik olarak kaydedilir ve her zaman hatırlanır
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Gender Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('showMe')}
          </label>
          <Select value={selectedGender} onValueChange={setSelectedGender}>
            <SelectTrigger className="w-full dark:bg-gray-700/70 dark:border-gray-600/50 dark:text-gray-100 border-gray-200/70">
              <SelectValue placeholder={t('selectGender')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="everyone">{t('everyone')}</SelectItem>
              <SelectItem value="men">{t('men')}</SelectItem>
              <SelectItem value="women">{t('women')}</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 dark:text-gray-300 mt-1">
            Seçilen: {selectedGender === 'women' ? 'Kadınlar' : selectedGender === 'men' ? 'Erkekler' : 'Herkes'}
          </p>
        </div>

        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
            {t('ageRange')}: {ageRange[0]} - {ageRange[1]} {t('years')}
          </label>
          <div className="relative">
            <Slider
              value={ageRange}
              onValueChange={(value) => setAgeRange([value[0], value[1]])}
              min={18}
              max={65}
              step={1}
              className="w-full [&_[role=slider]:first-child]:bg-green-500 [&_[role=slider]:first-child]:border-2 [&_[role=slider]:first-child]:border-white [&_[role=slider]:last-child]:bg-blue-500 [&_[role=slider]:last-child]:border-2 [&_[role=slider]:last-child]:border-white [&_[role=slider]]:shadow-md [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:cursor-grab [&_[role=slider]:active]:cursor-grabbing"
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{ageRange[0]} {t('years')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">{ageRange[1]} {t('years')}</span>
            </div>
          </div>
        </div>

        {/* Distance */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            <DistanceIcon className="w-4 h-4 text-pink-500" />
            {t('maximumDistance')}: {distanceDisplay.text}
          </label>
          <div className="relative">
            <Slider
              value={[distance]}
              onValueChange={(value) => setDistance(value[0])}
              min={1}
              max={600}
              step={distance < 100 ? 5 : distance < 300 ? 10 : 50}
              className="w-full [&_[role=slider]]:bg-pink-500 [&_[role=slider]]:border-2 [&_[role=slider]]:border-white [&_[role=slider]]:shadow-md [&_[role=slider]]:w-6 [&_[role=slider]]:h-6 [&_[role=slider]]:cursor-grab [&_[role=slider]:active]:cursor-grabbing"
            />
          </div>
        </div>

        {/* Interests - Premium Feature */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2 flex items-center gap-2">
            {t('interests')}
            {!hasAdvancedFilters && <Crown className="w-4 h-4 text-yellow-500" />}
          </label>
          {hasAdvancedFilters ? (
            <>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                {INTEREST_OPTIONS.map(interest => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className={`cursor-pointer transition-colors ${
                      selectedInterests.includes(interest)
                        ? 'bg-pink-500 text-white hover:bg-pink-600'
                        : 'hover:bg-pink-50/70 dark:hover:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600/50 border-gray-200/70'
                    }`}
                    onClick={() => handleInterestToggle(interest)}
                  >
                    {interest}
                    {selectedInterests.includes(interest) && (
                      <X className="w-3 h-3 ml-1" />
                    )}
                  </Badge>
                ))}
              </div>
              {selectedInterests.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedInterests.length} {t('interestsSelected')}
                  </span>
                </div>
              )}
            </>
          ) : (
            <div className="relative">
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto blur-sm">
                {INTEREST_OPTIONS.slice(0, 10).map(interest => (
                  <Badge
                    key={interest}
                    variant="outline"
                    className="cursor-not-allowed"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
              <div className="absolute inset-0 bg-white/80 dark:bg-gray-800/80 flex items-center justify-center rounded-lg">
                <div className="text-center">
                  <Lock className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm font-medium">İlgi Alanı Filtresi</p>
                  <p className="text-xs text-gray-500 mt-1">Silver+ üyelik gerekli</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            onClick={handleApplyFilters}
            className="flex-1 bg-pink-500 hover:bg-pink-600"
          >
            Kaydet ve Uygula
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="flex-1 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/50 border-gray-200/70 hover:bg-gray-50/70"
          >
            {t('reset')}
          </Button>
        </div>
        
        <div className="text-xs text-center text-gray-500 dark:text-gray-300">
          ✓ Ayarlarınız otomatik olarak kaydedilir
        </div>
      </CardContent>
    </Card>
  );
};
