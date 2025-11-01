import { useState, useRef, memo, useCallback } from "react";
import { Header } from "@/components/Header";
import { NavigationBar } from "@/components/NavigationBar";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Sparkles, Clock, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { chatService } from "@/services/chatService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Profile } from "@/types/profile";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// Memoized Match Card component for better performance
const MatchCardSkeleton = memo(() => (
  <Card className="w-72 flex-shrink-0">
    <CardContent className="p-4">
      <Skeleton className="w-full h-48 rounded-lg mb-3" />
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-10 w-full" />
    </CardContent>
  </Card>
));

const Matches = () => {
  const { t } = useLanguage();
  const { matches, loading, newMatches, olderMatches } = useMatches();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);

  const handleViewProfile = useCallback((matchedUser: Profile) => {
    navigate(`/profile/${matchedUser.id}`);
  }, [navigate]);

  const handleSendMessage = useCallback(async (matchedUser: Profile) => {
    if (!user) {
      toast({
        title: "Hata",
        description: "Oturum açmanız gerekiyor",
        variant: "destructive",
      });
      return;
    }

    try {
      const conversation = await chatService.getOrCreateConversation(user.id, matchedUser.id);
      
      if (conversation) {
        navigate('/messages', { 
          state: { 
            conversationId: conversation.id, 
            otherUser: matchedUser 
          } 
        });
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Hata",
        description: "Konuşma başlatılamadı, lütfen tekrar deneyin",
        variant: "destructive",
      });
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 pb-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Matches Section */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-8 text-center">
              {t('matches')} ({matches.length})
            </h1>
          
          {loading ? (
            <div className="space-y-8">
              {/* Loading skeleton for new matches */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Skeleton className="h-8 w-32" />
                  <Skeleton className="h-6 w-20" />
                </div>
                <div className="flex space-x-4 overflow-x-hidden">
                  {[...Array(3)].map((_, i) => (
                    <MatchCardSkeleton key={i} />
                  ))}
                </div>
              </div>
              
              {/* Loading skeleton for older matches */}
              <div>
                <Skeleton className="h-8 w-28 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <Skeleton className="w-full h-48 rounded-lg mb-3" />
                        <Skeleton className="h-6 w-3/4 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-2/3 mb-3" />
                        <Skeleton className="h-10 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : matches.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                {t('noMatchesYet')}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">
                {t('keepSwipingToFindMatches')}
              </p>
            </div>
          ) : (
            <>
              {/* New Matches Carousel */}
              {newMatches.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {t('newMatches')}
                  </h2>
                  <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {newMatches.length} {t('new')}
                  </Badge>
                </div>
                
                <div className="overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: 'touch' }}>
                  <div className="flex space-x-4 pb-2">
                    {newMatches.map((match) => (
                      <motion.div
                        key={match.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex-shrink-0"
                      >
                        <Card 
                          className={cn(
                            "w-72 hover:shadow-lg transition-all duration-200 cursor-pointer",
                            "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                            "border-2",
                            activeMatchId === match.id 
                              ? "border-pink-500" 
                              : "border-transparent hover:border-pink-200 dark:hover:border-pink-800"
                          )}
                          onClick={() => setActiveMatchId(match.id)}
                        >
                          <CardContent className="p-4">
                            <div className="relative mb-3">
                              <div className="relative overflow-hidden rounded-lg">
                                <OptimizedImage
                                  src={match.matched_user.photos?.[0] || '/placeholder.svg'}
                                  alt={match.matched_user.name || 'Profile'}
                                  className="w-full h-48 object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                                
                                {/* Match Info Overlay */}
                                <div className="absolute bottom-2 left-2 right-2 text-white">
                                  <h3 className="font-bold text-lg">
                                    {match.matched_user.name}, {match.matched_user.age}
                                  </h3>
                                  {match.matched_user.location && (
                                    <div className="flex items-center text-sm opacity-90">
                                      <MapPin className="w-3 h-3 mr-1" />
                                      {match.matched_user.location}
                                    </div>
                                  )}
                                </div>
                                
                                {/* New Match Badge */}
                                <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white p-2 rounded-full shadow-lg">
                                  <Sparkles className="w-4 h-4" />
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                                {match.matched_user.bio || t('noBioYet')}
                              </p>
                              
                              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                <Clock className="w-3 h-3 mr-1" />
                                {t('matchedJustNow')}
                              </div>
                              
                              <Button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSendMessage(match.matched_user as any);
                                }}
                                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                              >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                {t('startConversation')}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Older Matches Grid */}
            {olderMatches.length > 0 && (
              <div>
                {newMatches.length > 0 && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    {t('allMatches')}
                  </h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <AnimatePresence>
                    {olderMatches.map((match, index) => (
                      <motion.div
                        key={match.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Card 
                          className={cn(
                            "hover:shadow-lg transition-all duration-200",
                            "bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm",
                            "group cursor-pointer"
                          )}
                          onClick={() => handleViewProfile(match.matched_user as any)}
                        >
                          <CardContent className="p-4">
                            <div className="relative overflow-hidden rounded-lg mb-3">
                              <OptimizedImage
                                src={match.matched_user.photos?.[0] || '/placeholder.svg'}
                                alt={match.matched_user.name || 'Profile'}
                                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                                loading="lazy"
                              />
                              <div className="absolute top-2 right-2 bg-pink-500 text-white p-2 rounded-full shadow-lg">
                                <Heart className="w-4 h-4" />
                              </div>
                            </div>
                            
                            <h3 className="font-semibold text-lg mb-1 text-gray-800 dark:text-gray-100">
                              {match.matched_user.name}, {match.matched_user.age}
                            </h3>
                            
                            {match.matched_user.location && (
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                <MapPin className="w-3 h-3 mr-1" />
                                {match.matched_user.location}
                              </div>
                            )}
                            
                            <p className="text-gray-600 dark:text-gray-300 text-sm mb-3 line-clamp-2">
                              {match.matched_user.bio || t('noBioYet')}
                            </p>
                            
                            <Button 
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendMessage(match.matched_user as any);
                              }}
                              className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
                            >
                              <MessageCircle className="w-4 h-4 mr-2" />
                              {t('sendMessage')}
                            </Button>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            )}
            </>
          )}
          </div>
        </div>
      </main>
      
      <NavigationBar />
    </div>
  );
};

export default Matches;
