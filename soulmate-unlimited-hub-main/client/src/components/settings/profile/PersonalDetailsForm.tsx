import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { User, Heart, GraduationCap, Briefcase, Wine, Cigarette, Dumbbell, Users, Baby, Ruler, Stars, Zap, Shield, Users2, Circle, Crown, Wheat, Scale, Flame, Target, Mountain, Waves, Fish, Activity } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { LucideIcon } from "lucide-react";

interface PersonalDetailsFormProps {
  formData: {
    religion: string;
    languages: string[];
    education: string;
    occupation: string;
    drinking: string;
    smoking: string;
    exercise: string;
    relationship_type: string;
    children: string;
    height: string;
    zodiac_sign: string;
  };
  isEditing: boolean;
  onInputChange: (field: string, value: string | string[]) => void;
}

const languageOptionKeys = [
  "tr", "en", "ar", "es", "fr", "de", 
  "it", "pt", "ru", "zh", "ja", "ko"
];

const religionOptionKeys = [
  "islam", "christianity", "judaism", "buddhism", "hinduism", 
  "atheist", "agnostic", "spiritual", "other", "none"
];

const educationOptionKeys = [
  "highschool", "associate", "bachelor", "master", "doctorate", "vocational"
];

const zodiacOptionKeys = [
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"
];

const drinkingOptionKeys = ["never", "socially", "regularly"];
const smokingOptionKeys = ["never", "socially", "regularly"];
const exerciseOptionKeys = ["never", "sometimes", "regularly", "daily"];
const relationshipTypeOptionKeys = ["serious", "casual", "marriage", "friendship"];
const childrenOptionKeys = ["none", "have_some", "want_some", "dont_want"];

// Modern Context7 pattern: Type-safe zodiac icon mapping
const getZodiacIcon = (zodiacKey: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    aries: Zap,        // Koç - enerji/güç
    taurus: Shield,    // Boğa - güçlü/koruma 
    gemini: Users2,    // İkizler - iki kişi
    cancer: Circle,    // Yengeç - yuvarlak form
    leo: Crown,        // Aslan - kral/taç
    virgo: Wheat,      // Başak - tarım/doğa
    libra: Scale,      // Terazi - adalet terazisi
    scorpio: Flame,    // Akrep - ateş/güç
    sagittarius: Target, // Yay - hedef/ok
    capricorn: Mountain, // Oğlak - dağ/yükseklik
    aquarius: Waves,   // Kova - su dalgaları
    pisces: Fish       // Balık - balık
  };
  
  return iconMap[zodiacKey] || Stars;
};

export const PersonalDetailsForm = ({ formData, isEditing, onInputChange }: PersonalDetailsFormProps) => {
  const { t } = useLanguage();
  const toggleLanguage = (language: string) => {
    const newLanguages = formData.languages.includes(language)
      ? formData.languages.filter(l => l !== language)
      : [...formData.languages, language];
    
    if (newLanguages.length <= 5) {
      onInputChange('languages', newLanguages);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Din ve Manevi Değerler */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Heart className="w-5 h-5 text-pink-500" />
            {t("religionAndValuesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="religion" className="dark:text-gray-200">{t("religionLabel")}</Label>
            <Select 
              value={formData.religion} 
              onValueChange={(value) => onInputChange('religion', value)}
              disabled={!isEditing}
              name="religion"
            >
              <SelectTrigger id="religion" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("religionPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {religionOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`options.religion.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="zodiac_sign" className="flex items-center gap-2 dark:text-gray-200">
              <Stars className="w-4 h-4" />
              {t("zodiacSignLabel")}
            </Label>
            <Select 
              value={formData.zodiac_sign} 
              onValueChange={(value) => onInputChange('zodiac_sign', value)}
              disabled={!isEditing}
              name="zodiac_sign"
            >
              <SelectTrigger id="zodiac_sign" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("zodiacSignPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {zodiacOptionKeys.map((signKey) => {
                  const IconComponent = getZodiacIcon(signKey);
                  return (
                    <SelectItem key={signKey} value={signKey} className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-4 h-4" />
                        {t(`options.zodiac.${signKey}`)}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Eğitim ve Kariyer */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <GraduationCap className="w-5 h-5 text-blue-500" />
            {t("educationAndCareerTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="education" className="dark:text-gray-200">{t("educationLabel")}</Label>
            <Select 
              value={formData.education} 
              onValueChange={(value) => onInputChange('education', value)}
              disabled={!isEditing}
              name="education"
            >
              <SelectTrigger id="education" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("educationPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {educationOptionKeys.map((educationKey) => (
                  <SelectItem key={educationKey} value={educationKey}>
                    {t(`options.education.${educationKey}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="occupation" className="dark:text-gray-200">{t("occupationLabel")}</Label>
            <Input
              id="occupation"
              name="occupation"
              type="text"
              autoComplete="organization-title"
              value={formData.occupation}
              onChange={(e) => onInputChange('occupation', e.target.value)}
              placeholder={t("occupationPlaceholder")}
              disabled={!isEditing}
              className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Diller */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Users className="w-5 h-5 text-green-500" />
            {t("languagesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <fieldset>
            <legend className="sr-only">{t("languagesTitle")}</legend>
            <div className="flex flex-wrap gap-2">
              {languageOptionKeys.map((langKey) => (
                <Badge
                  key={langKey}
                  variant={formData.languages.includes(langKey) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    !isEditing 
                      ? "cursor-default" 
                      : formData.languages.includes(langKey)
                      ? 'bg-green-500 hover:bg-green-600 text-white'
                      : 'hover:bg-green-100 dark:hover:bg-gray-700/50 dark:text-gray-200 dark:border-gray-600/50 hover:border-green-300'
                  } ${
                    !formData.languages.includes(langKey) && 
                    formData.languages.length >= 5 && 
                    isEditing ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (isEditing && (formData.languages.includes(langKey) || formData.languages.length < 5)) {
                      toggleLanguage(langKey);
                    }
                  }}
                  role="checkbox"
                  aria-checked={formData.languages.includes(langKey)}
                  aria-label={t(`options.lang.${langKey}`)}
                  tabIndex={isEditing ? 0 : -1}
                  onKeyDown={(e) => {
                    if ((e.key === 'Enter' || e.key === ' ') && isEditing) {
                      e.preventDefault();
                      if (formData.languages.includes(langKey) || formData.languages.length < 5) {
                        toggleLanguage(langKey);
                      }
                    }
                  }}
                >
                  {t(`options.lang.${langKey}`)}
                </Badge>
              ))}
            </div>
          </fieldset>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3" aria-live="polite">
            {formData.languages.length}/5 seçildi
          </p>
        </CardContent>
      </Card>

      {/* Fiziksel Özellikler */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Ruler className="w-5 h-5 text-purple-500" />
            {t("physicalFeaturesTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="height" className="dark:text-gray-200">{t("heightLabel")}</Label>
            <Input
              id="height"
              name="height"
              type="number"
              min="140"
              max="220"
              autoComplete="off"
              value={formData.height}
              onChange={(e) => onInputChange('height', e.target.value)}
              placeholder={t("heightPlaceholder")}
              disabled={!isEditing}
              aria-describedby="height-help"
              className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <p id="height-help" className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {t("heightPlaceholder")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Yaşam Tarzı */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Activity className="w-5 h-5 text-orange-500" />
            {t("lifestyleTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="drinking" className="dark:text-gray-200">{t("drinkingLabel")}</Label>
            <Select 
              value={formData.drinking} 
              onValueChange={(value) => onInputChange('drinking', value)}
              disabled={!isEditing}
              name="drinking"
            >
              <SelectTrigger id="drinking" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("drinkingPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {drinkingOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`options.drinking.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="smoking" className="dark:text-gray-200">{t("smokingLabel")}</Label>
            <Select 
              value={formData.smoking} 
              onValueChange={(value) => onInputChange('smoking', value)}
              disabled={!isEditing}
              name="smoking"
            >
              <SelectTrigger id="smoking" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("smokingPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {smokingOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`options.smoking.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="exercise" className="dark:text-gray-200">{t("exerciseLabel")}</Label>
            <Select 
              value={formData.exercise} 
              onValueChange={(value) => onInputChange('exercise', value)}
              disabled={!isEditing}
              name="exercise"
            >
              <SelectTrigger id="exercise" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("exercisePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {exerciseOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`options.exercise.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      
      {/* İlişki ve Aile */}
      <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-gray-100">
            <Heart className="w-5 h-5 text-red-500" />
            {t("relationshipAndFamilyTitle")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="relationship_type" className="dark:text-gray-200">{t("relationshipTypeLabel")}</Label>
            <Select 
              value={formData.relationship_type} 
              onValueChange={(value) => onInputChange('relationship_type', value)}
              disabled={!isEditing}
              name="relationship_type"
            >
              <SelectTrigger id="relationship_type" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("relationshipTypePlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypeOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`relationshipType.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="children" className="dark:text-gray-200">{t("childrenLabel")}</Label>
            <Select 
              value={formData.children} 
              onValueChange={(value) => onInputChange('children', value)}
              disabled={!isEditing}
              name="children"
            >
              <SelectTrigger id="children" className="dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-100">
                <SelectValue placeholder={t("childrenPlaceholder")} />
              </SelectTrigger>
              <SelectContent>
                {childrenOptionKeys.map((key) => (
                  <SelectItem key={key} value={key}>
                    {t(`options.children.${key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
