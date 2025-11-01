import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { useMatches } from "@/hooks/useMatches";
import { chatService } from "@/services/chatService";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Heart, X, Star, ArrowLeft, Search, Edit, Music, Plane, Utensils, Dumbbell, Book, Film, Camera, Activity, TreePine, Coffee, Palette, Music2, Laptop, Shirt, Gamepad2, BookOpen, Waves, User, Bike, Mountain, Tent, LucideIcon, Stars, Zap, Shield, Users2, Circle, Crown, Wheat, Scale, Flame, Target, Fish, GraduationCap, Briefcase, Wine, Cigarette, Users, Baby, Ruler, ChefHat, Theater, Code, Building, Globe, Wrench, MessageCircle, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserRole, ROLE_INFO } from "@/types/roles";
import { ProfileBoostButton } from "@/components/profile/ProfileBoostButton";

// TODO: Role sütunu eklendikten sonra ExtendedProfile kullanılacak
// interface ExtendedProfile extends Tables<'profiles'> {
//   role?: UserRole;
// }

type Profile = Tables<'profiles'>;

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { userProfile, swipeUser, superLikeUser, loading: profilesLoading } = useProfiles();
  const { matches } = useMatches();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // If no ID provided, show current user's profile
  const isOwnProfile = !id || (user && id === user.id);
  const displayProfile = isOwnProfile ? userProfile : profile;
  
  // Check if this user is matched with current user
  const isMatched = !isOwnProfile && matches.some(match => 
    match.matched_user.id === id
  );

  useEffect(() => {
    if (id && !isOwnProfile) {
      fetchProfile();
    } else if (isOwnProfile) {
      setProfile(null);
      // For own profile, wait for userProfile to load
      setLoading(profilesLoading);
    }
  }, [id, isOwnProfile, profilesLoading]);

  const fetchProfile = async () => {
    if (!id || isOwnProfile) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    
    if (data) {
      setProfile(data);
    }
    setLoading(false);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (!displayProfile || isOwnProfile) return;
    await swipeUser(displayProfile.id, direction);
    navigate(-1);
  };

  const handleSuperLike = async () => {
    if (!displayProfile || isOwnProfile) return;
    await superLikeUser(displayProfile.id);
    navigate(-1);
  };

  const handleSendMessage = async () => {
    if (!displayProfile || !user) {
      toast({
        title: t('error'),
        description: t('validation.loginRequired'),
        variant: "destructive",
      });
      return;
    }

    try {
      const conversation = await chatService.getOrCreateConversation(user.id, displayProfile.id);
      
      if (conversation) {
        navigate('/messages', { 
          state: { 
            conversationId: conversation.id, 
            otherUser: displayProfile 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: t('error'),
        description: t('validation.conversationStartError'),
        variant: "destructive",
      });
    }
  };

  const handleUnmatch = async () => {
    if (!displayProfile || !user) return;

    try {
      const { error } = await supabase
        .from('matches')
        .delete()
        .or(`and(user1_id.eq.${user.id},user2_id.eq.${displayProfile.id}),and(user1_id.eq.${displayProfile.id},user2_id.eq.${user.id})`);

      if (error) throw error;

      toast({
        title: t('validation.matchRemoved'),
        description: t('validation.matchRemovedSuccess'),
      });
      
      navigate('/matches');
    } catch (error) {
      console.error('Error unmatching:', error);
      toast({
        title: t('error'),
        description: t('validation.matchRemoveError'),
        variant: "destructive",
      });
    }
  };

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

  // Personal details için icon mapping
  const getPersonalDetailIcon = (type: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      education: GraduationCap,
      occupation: Briefcase,
      drinking: Wine,
      smoking: Cigarette,
      exercise: Dumbbell,
      relationship_type: Users,
      children: Baby,
      height: Ruler,
      religion: Heart
    };
    
    return iconMap[type] || User;
  };

  if (loading || (isOwnProfile && profilesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg">{t('loadingProfile')}</div>
      </div>
    );
  }

  if (!displayProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg">{t('profileNotFound')}</div>
      </div>
    );
  }

  const photos = displayProfile.photos || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-4 pb-24">
          {/* Back button centered at top */}
          {!isOwnProfile && (
            <div className="flex justify-center mb-6">
              <Button 
                variant="outline" 
                onClick={handleBack} 
                className="flex items-center gap-2 dark:bg-gray-800/80 dark:border-gray-600/50 dark:text-gray-200 dark:hover:bg-gray-700/50"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('back')}
              </Button>
            </div>
          )}

          {/* Desktop Layout: Two Column, Mobile: Single Column */}
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-6 lg:gap-8 items-start">
              
              {/* Photo Section - Portrait Dimensions */}
              <div className="order-1 mx-auto lg:mx-0">
                <div className="relative w-full max-w-[350px]">
                  <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-700/50 rounded-3xl overflow-hidden shadow-xl group cursor-pointer" onClick={() => setIsModalOpen(true)}>
                    <img 
                      src={photos[currentPhotoIndex] || '/placeholder.svg'} 
                      alt={displayProfile.name || 'Profile'} 
                      className="w-full h-full object-cover transition-all duration-300 group-hover:scale-[1.02]" 
                    />
                    
                    {/* Hover overlay with magnifying glass - CONTAINED within frame */}
                    <div className="absolute inset-0 bg-background/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-3xl">
                      <div className="bg-white/95 dark:bg-gray-800/95 rounded-full p-3 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Search className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                      </div>
                    </div>
                    
                    {/* Photo indicators - only if multiple photos */}
                    {photos.length > 1 && (
                      <div className="absolute top-4 left-4 right-4 z-20">
                        <div className="flex gap-1">
                          {photos.map((_, index) => (
                            <div 
                              key={index} 
                              className={`flex-1 h-1 rounded-full transition-all duration-300 ${
                                index === currentPhotoIndex 
                                  ? 'bg-white shadow-sm' 
                                  : 'bg-white/50'
                              }`} 
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Navigation areas - invisible touch zones */}
                    {photos.length > 1 && (
                      <>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1));
                          }}
                          className="absolute left-0 top-0 w-1/3 h-full z-30 bg-transparent"
                          disabled={currentPhotoIndex === 0}
                          aria-label="Previous photo"
                        />
                        
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1));
                          }}
                          className="absolute right-0 top-0 w-1/3 h-full z-30 bg-transparent"
                          disabled={currentPhotoIndex === photos.length - 1}
                          aria-label="Next photo"
                        />
                        
                        {/* Photo counter */}
                        <div className="absolute bottom-4 right-4 bg-background/80 text-foreground px-2 py-1 rounded-full text-xs font-medium backdrop-blur-sm z-20">
                          {currentPhotoIndex + 1}/{photos.length}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Info Section */}
              <div className="order-2 lg:order-2">
                <Card className="h-fit shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm dark:border-gray-600/50">
                  <CardContent className="p-6 lg:p-8">
                    {/* Header Info */}
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-3">
                          {displayProfile.name}
                          {displayProfile.age && (
                            <span className="text-gray-600 dark:text-gray-300">, {displayProfile.age}</span>
                          )}
                          {/* Role Badge - TODO: Role sütunu eklendikten sonra aktif edilecek */}
                          {/* {displayProfile.role && displayProfile.role !== 'registered' && ROLE_INFO[displayProfile.role] && (
                            <Badge className={`bg-gradient-to-r ${ROLE_INFO[displayProfile.role].bgGradient} text-white border-0 text-xs px-2 py-0.5`}>
                              {ROLE_INFO[displayProfile.role].badge || ROLE_INFO[displayProfile.role].displayName}
                            </Badge>
                          )} */}
                          {/* Edit button for own profile */}
                          {isOwnProfile && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate('/settings/profile?edit=true')}
                              className="ml-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-300 dark:hover:border-blue-600/50 dark:bg-gray-700/50 dark:border-gray-600/50 dark:text-gray-200"
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {t('editButton')}
                            </Button>
                          )}
                        </h1>
                      </div>
                      {displayProfile.location && (
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                          <MapPin className="w-5 h-5" />
                          <span className="text-lg">{displayProfile.location}</span>
                        </div>
                      )}
                      {/* Boost button for own profile */}
                      {isOwnProfile && (
                        <div className="mt-3">
                          <ProfileBoostButton />
                        </div>
                      )}
                    </div>

                    {/* Bio Section */}
                    {displayProfile.bio && (
                      <div className="mb-6">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-lg">{t('about')}</h3>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">{displayProfile.bio}</p>
                      </div>
                    )}

                    {/* Interests Section */}
                    {displayProfile.interests && displayProfile.interests.length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">{t('interests')}</h3>
                        <div className="flex flex-wrap gap-2">
                          {displayProfile.interests.map((interest, index) => {
                            const IconComponent = getInterestIcon(interest);
                            return (
                              <Badge 
                                key={index} 
                                variant="outline" 
                                className="text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-600/50 hover:bg-pink-50 dark:hover:bg-pink-900/20 px-3 py-1 text-sm flex items-center gap-1.5"
                              >
                                <IconComponent className="w-4 h-4" />
                                {t(`interest.${interest}`)}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Personal Details Section */}
                    {(displayProfile.zodiac_sign || displayProfile.education || displayProfile.occupation || 
                      displayProfile.height || displayProfile.religion || displayProfile.drinking || 
                      displayProfile.smoking || displayProfile.exercise || displayProfile.relationship_type || 
                      displayProfile.children) && (
                      <div className="mb-8">
                        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-4 text-lg">{t('personalDetailsTitle')}</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          
                          {/* All Personal Detail Items */}
                          {displayProfile.zodiac_sign && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              {(() => {
                                const ZodiacIcon = getZodiacIcon(displayProfile.zodiac_sign);
                                return <ZodiacIcon className="w-4 h-4 text-purple-500" />;
                              })()}
                              <span className="text-sm">{t(`options.zodiac.${displayProfile.zodiac_sign}`)}</span>
                            </div>
                          )}

                          {displayProfile.education && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <GraduationCap className="w-4 h-4 text-blue-500" />
                              <span className="text-sm">{t(`options.education.${displayProfile.education}`)}</span>
                            </div>
                          )}

                          {displayProfile.occupation && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Briefcase className="w-4 h-4 text-green-500" />
                              <span className="text-sm">
                                {(() => {
                                  const occupationKey = `options.occupation.${displayProfile.occupation.toLowerCase().replace(/\s+/g, '')}`;
                                  const translation = t(occupationKey);
                                  // Eğer çeviri anahtarı bulunamazsa, orijinal metni göster
                                  return translation !== occupationKey ? translation : displayProfile.occupation;
                                })()}
                              </span>
                            </div>
                          )}

                          {displayProfile.height && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Ruler className="w-4 h-4 text-indigo-500" />
                              <span className="text-sm">{displayProfile.height} cm</span>
                            </div>
                          )}

                          {displayProfile.religion && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Heart className="w-4 h-4 text-pink-500" />
                              <span className="text-sm">{t(`options.religion.${displayProfile.religion}`)}</span>
                            </div>
                          )}

                          {displayProfile.drinking && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Wine className="w-4 h-4 text-red-500" />
                              <span className="text-sm">{t(`options.drinking.${displayProfile.drinking}`)}</span>
                            </div>
                          )}

                          {displayProfile.smoking && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Cigarette className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{t(`options.smoking.${displayProfile.smoking}`)}</span>
                            </div>
                          )}

                          {displayProfile.exercise && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Dumbbell className="w-4 h-4 text-orange-500" />
                              <span className="text-sm">{t(`options.exercise.${displayProfile.exercise}`)}</span>
                            </div>
                          )}

                          {displayProfile.relationship_type && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Users className="w-4 h-4 text-teal-500" />
                              <span className="text-sm">{t(`options.relationship.${displayProfile.relationship_type}`)}</span>
                            </div>
                          )}

                          {displayProfile.children && displayProfile.children !== 'none' && (
                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                              <Baby className="w-4 h-4 text-yellow-500" />
                              <span className="text-sm">{t(`options.children.${displayProfile.children}`)}</span>
                            </div>
                          )}

                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {!isOwnProfile && (
                      <div className="space-y-4">
                        {isMatched ? (
                          // Eşleşmiş kişiler için butonlar
                          <div className="space-y-3">
                            {/* Eşleşme Bilgisi */}
                            <div className="text-center bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 rounded-lg py-3 px-4">
                              <div className="flex items-center justify-center gap-2 text-pink-600 dark:text-pink-400 font-semibold">
                                <Heart className="w-5 h-5 fill-current" />
                                {t('eslestiniz')}
                              </div>
                            </div>
                            
                            {/* Mesaj Gönder */}
                            <Button 
                              size="lg" 
                              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold h-12" 
                              onClick={handleSendMessage}
                            >
                              <MessageCircle className="w-5 h-5 mr-2" />
                              {t('mesajAt')}
                            </Button>
                            
                            {/* Eşleşmeyi Kaldır */}
                            <Button 
                              variant="outline" 
                              size="lg" 
                              className="w-full border-red-300 dark:border-red-600/50 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 h-12" 
                              onClick={handleUnmatch}
                            >
                              <UserX className="w-5 h-5 mr-2" />
                              {t('eslesmeKaldir')}
                            </Button>
                          </div>
                        ) : (
                          // Normal kullanıcılar için butonlar (eşleşmemiş)
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                              <Button 
                                variant="outline" 
                                size="lg" 
                                className="border-gray-300 dark:border-gray-600/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 dark:bg-gray-800/50 dark:text-gray-200 h-12" 
                                onClick={() => handleSwipe('left')}
                              >
                                <X className="w-5 h-5 mr-2" />
                                {t('pass')}
                              </Button>
                              <Button 
                                size="lg" 
                                className="bg-pink-500 hover:bg-pink-600 h-12" 
                                onClick={() => handleSwipe('right')}
                              >
                                <Heart className="w-5 h-5 mr-2" />
                                {t('like')}
                              </Button>
                            </div>
                            <Button 
                              size="lg" 
                              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold h-12" 
                              onClick={handleSuperLike}
                            >
                              <Star className="w-5 h-5 mr-2" />
                              Super Like
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
            </div>
          </div>
        </div>
      </main>
      
      {/* Photo Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="relative max-w-4xl max-h-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-foreground bg-background/80 rounded-full p-2 hover:bg-background/90 z-10"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            
            <img 
              src={photos[currentPhotoIndex] || '/placeholder.svg'} 
              alt={displayProfile?.name || 'Profile'} 
              className="max-w-full max-h-full object-contain" 
            />
            
            {/* Navigation in modal */}
            {photos.length > 1 && (
              <>
                <button 
                  onClick={() => setCurrentPhotoIndex(Math.max(0, currentPhotoIndex - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground bg-background/80 rounded-full p-3 hover:bg-background/90 disabled:opacity-50"
                  disabled={currentPhotoIndex === 0}
                  aria-label="Previous photo"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                <button 
                  onClick={() => setCurrentPhotoIndex(Math.min(photos.length - 1, currentPhotoIndex + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground bg-background/80 rounded-full p-3 hover:bg-background/90 disabled:opacity-50"
                  disabled={currentPhotoIndex === photos.length - 1}
                  aria-label="Next photo"
                >
                  <ArrowLeft className="w-6 h-6 rotate-180" />
                </button>
                
                {/* Photo counter in modal */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 text-foreground px-3 py-1 rounded-full text-sm">
                  {currentPhotoIndex + 1}/{photos.length}
                </div>
              </>
            )}
          </div>
        </div>
      )}
      
      <NavigationBar />
    </div>
  );
};

export default Profile;
