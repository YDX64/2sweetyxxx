import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, X, Star, MapPin, Calendar, Music, Plane, Utensils, Dumbbell, Book, Film, Camera, Activity, TreePine, Coffee, Palette, Music2, Laptop, Shirt, Gamepad2, BookOpen, Waves, User, Bike, Mountain, Tent, LucideIcon, Stars, Zap, Shield, Users2, Circle, Crown, Wheat, Scale, Flame, Target, Fish, GraduationCap, Briefcase, Wine, Cigarette, Users, Baby, Ruler, ChefHat, Theater, Code, Building, Globe, Wrench } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/useLanguage";

type Profile = Tables<'profiles'>;

interface ProfilePreviewProps {
  profile: Profile;
  onClose: () => void;
}

// İlgi alanları için icon mapping
const getInterestIcon = (interestKey: string): LucideIcon => {
  // "interest." prefix'ini kaldır
  const cleanKey = interestKey.startsWith('interest.') ? interestKey.replace('interest.', '') : interestKey.toLowerCase();
  
  const iconMap: Record<string, LucideIcon> = {
    // İngilizce interestler
    music: Music,
    travel: Plane,
    food: Utensils,
    sports: Dumbbell,
    books: Book,
    movies: Film,
    photography: Camera,
    yoga: Activity,
    nature: TreePine,
    coffee: Coffee,
    art: Palette,
    dance: Music2,
    technology: Laptop,
    fashion: Shirt,
    gaming: Gamepad2,
    fitness: Dumbbell,
    reading: BookOpen,
    swimming: Waves,
    running: User,
    cycling: Bike,
    mountaineering: Mountain,
    camping: TreePine,
    hiking: Mountain,
    cooking: ChefHat,
    wine: Wine,
    theater: Theater,
    poetry: BookOpen,
    coding: Code,
    design: Palette,
    
    // Türkçe interestler
    'müzik': Music,
    'seyahat': Plane,
    'yemek': Utensils,
    'spor': Dumbbell,
    'kitap': Book,
    'sinema': Film,
    'fotoğrafçılık': Camera,
    'dans': Music2,
    'teknoloji': Laptop,
    'oyun': Gamepad2,
    'kahve': Coffee,
    'sanat': Palette,
    'doğa': TreePine,
    'okuma': BookOpen,
    'koşu': User,
    'bisiklet': Bike,
    'tırmanış': Mountain,
    'programlama': Code,
    'tasarım': Palette,
    
    // İsveççe interestler (küçük harf)
    'arkitektur': Building,
    'äventyr': Mountain,
    'bakning': ChefHat,
    'ballet': Music2,
    'böcker': Book,
    'bröllop': Heart,
    'cykling': Bike,
    'djur': Heart,
    'dykning': Waves,
    'familj': Users,
    'flyg': Plane,
    'förnybar energi': TreePine,
    'forskning': BookOpen,
    'fotografering': Camera,
    'gallerier': Palette,
    'geografi': Globe,
    'hållbarhet': TreePine,
    'ingenjör': Wrench,
    'instrument': Music,
    'jazz': Music,
    'kaffe': Coffee,
    'kärlek': Heart,
    'klättring': Mountain,
    'konserter': Music,
    'konst': Palette,
    'konsthistoria': Palette,
    'läsning': BookOpen,
    'litteratur': Book,
    'löpning': User,
    'målning': Palette,
    'marin biologi': Waves,
    'mat': Utensils,
    'matlagning': ChefHat,
    'medicin': Heart,
    'meditation': Activity,
    'museer': Building,
    'musikproduktion': Music,
    'nordisk mat': Utensils,
    'piano': Music,
    'programmering': Code,
    'promenader': User,
    'psykologi': Heart,
    'resor': Plane,
    'restaurang': Utensils,
    'skapande': Palette,
    'skrivande': BookOpen,
    'surfing': Waves,
    'svenska artister': Music,
    'te': Coffee,
    'teater': Theater,
    'trädgård': TreePine,
    'träning': Dumbbell,
    'undervisning': BookOpen,
    'utomhus': TreePine,
    'vandring': Mountain,
    'veterinär': Heart,
    'violin': Music,
    
    // Büyük harfli versiyonlar
    'Music': Music,
    'Travel': Plane,
    'Gaming': Gamepad2,
    'Poetry': BookOpen,
    'Coding': Code,
    'Design': Palette,
    'Seyahat': Plane,
    'Kahve': Coffee,
    'Kitap': Book,
    'Spor': Dumbbell,
    'Yemek': Utensils,
    'Musik': Music,
    'Mat': Utensils,
    'Kaffe': Coffee,
    'Böcker': Book,
    'Träning': Dumbbell,
    'Löpning': User,
    'Cykling': Bike,
    'Klättring': Mountain,
    'Vandring': Mountain,
    'Meditation': Activity,
    'Yoga': Activity,
    'Läsning': BookOpen,
    'Skrivande': BookOpen,
    'Målning': Palette,
    'Skapande': Palette,
    'Teknoloji': Laptop,
    'Fotografering': Camera,
    'Dans': Music2,
    'Flyg': Plane,
    'Promenader': User,
    'Trädgård': TreePine,
    'Djur': Heart,
    'Familj': Users,
    'Te': Coffee,
    'Restaurang': Utensils,
    'Nordisk mat': Utensils,
    'Jazz': Music,
    'Musikproduktion': Music,
    'Instrument': Music,
    'Piano': Music,
    'Violin': Music,
    'Svenska artister': Music,
    'Ballet': Music2,
    'Konsthistoria': Palette,
    'Gallerier': Palette,
    'Konst': Palette,
    'Konserter': Music,
    'Teater': Theater,
    'Museer': Building,
    'Medicin': Heart,
    'Veterinär': Heart,
    'Undervisning': BookOpen,
    'Forskning': BookOpen,
    'Ingenjör': Wrench,
    'Psykologi': Heart,
    'Geografi': Globe,
    'Arkitektur': Building,
    'Hållbarhet': TreePine,
    'Förnybar energi': TreePine,
    'Marin biologi': Waves,
    'Dykning': Waves,
    'Surfing': Waves,
    'Utomhus': TreePine,
    'Äventyr': Mountain,
    'Bakning': ChefHat,
    'Bröllop': Heart,
    'Kärlek': Heart
  };

  return iconMap[cleanKey] || Heart; // Default icon
};

// Burçlar için icon mapping
const getZodiacIcon = (zodiacKey: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
    aries: Zap,        // Koç
    taurus: Shield,    // Boğa
    gemini: Users2,    // İkizler
    cancer: Circle,    // Yengeç
    leo: Crown,        // Aslan
    virgo: Wheat,      // Başak
    libra: Scale,      // Terazi
    scorpio: Flame,    // Akrep
    sagittarius: Target, // Yay
    capricorn: Mountain, // Oğlak
    aquarius: Waves,   // Kova
    pisces: Fish       // Balık
  };
  
  return iconMap[zodiacKey] || Stars;
};

export const ProfilePreview = ({ profile, onClose }: ProfilePreviewProps) => {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const { t } = useLanguage();

  const photos = profile.photos && profile.photos.length > 0 
    ? profile.photos 
    : [profile.gender === 'male' ? "/media/images/default_male.jpg" : "/media/images/default_female.jpg"];

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full max-h-[90vh] overflow-hidden">
        {/* Close Button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm hover:bg-white"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Preview Badge */}
        <div className="absolute top-4 left-4 z-10 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
          <Eye className="w-3 h-3" />
          {t('preview')}
        </div>

        {/* Photo Section */}
        <div className="relative h-96">
          <img 
            src={photos[currentPhotoIndex]} 
            alt={`${profile.name} - Fotoğraf ${currentPhotoIndex + 1}`}
            className="w-full h-full object-cover" 
          />

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-background/60 rounded-full flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
              >
                ‹
              </button>
              <button
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-background/60 rounded-full flex items-center justify-center text-foreground hover:bg-background/80 transition-colors"
              >
                ›
              </button>

              {/* Photo Indicators */}
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
                {photos.map((_, index) => (
                  <div
                    key={index}
                    className={`w-1.5 h-1.5 rounded-full transition-colors ${
                      index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent" />

          {/* Basic Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-2xl font-bold mb-1">
              {profile.name}, {profile.age}
            </h3>
            {profile.location && (
              <p className="flex items-center gap-1 text-sm opacity-90">
                <MapPin className="w-4 h-4" />
                {profile.location}
              </p>
            )}
          </div>
        </div>

        {/* Content Section */}
        <CardContent className="p-6 space-y-4 max-h-60 overflow-y-auto">
          {/* Bio */}
          {profile.bio && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('about')}</h4>
              <p className="text-gray-700 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Interests */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('interests')}</h4>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => {
                  const IconComponent = getInterestIcon(interest);
                  return (
                    <Badge key={index} variant="secondary" className="text-xs flex items-center gap-1">
                      <IconComponent className="w-3 h-3" />
                      {t(`interest.${interest}`)}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Personal Details */}
          {(profile.zodiac_sign || profile.education || profile.occupation || 
            profile.height || profile.religion) && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">{t('personalDetailsTitle')}</h4>
              <div className="space-y-2">
                
                {/* Zodiac Sign */}
                {profile.zodiac_sign && (
                  <div className="flex items-center gap-2 text-gray-600">
                    {(() => {
                      const ZodiacIcon = getZodiacIcon(profile.zodiac_sign);
                      return <ZodiacIcon className="w-3 h-3 text-purple-500" />;
                    })()}
                    <span className="text-xs">{t(`options.zodiac.${profile.zodiac_sign}`)}</span>
                  </div>
                )}

                {/* Education */}
                {profile.education && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <GraduationCap className="w-3 h-3 text-blue-500" />
                    <span className="text-xs">{t(`options.education.${profile.education}`)}</span>
                  </div>
                )}

                {/* Occupation */}
                {profile.occupation && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Briefcase className="w-3 h-3 text-green-500" />
                    <span className="text-xs">{profile.occupation}</span>
                  </div>
                )}

                {/* Height */}
                {profile.height && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Ruler className="w-3 h-3 text-indigo-500" />
                    <span className="text-xs">{profile.height} cm</span>
                  </div>
                )}

                {/* Religion */}
                {profile.religion && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Heart className="w-3 h-3 text-pink-500" />
                    <span className="text-xs">{t(`options.religion.${profile.religion}`)}</span>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Stats */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{photos.length} {t('photo')}</span>
              <span>{profile.interests?.length || 0} {t('interests').toLowerCase()}</span>
            </div>
          </div>
        </CardContent>

        {/* Action Buttons */}
        <div className="p-4 border-t bg-gray-50">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1">
              <X className="w-4 h-4 mr-2" />
              {t('pass')}
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white">
              <Heart className="w-4 h-4 mr-2 text-white" />
              {t('like')}
            </Button>
            <Button variant="outline" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              <Star className="w-4 h-4 text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
