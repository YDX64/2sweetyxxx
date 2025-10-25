import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Crown, Eye, EyeOff, Lock, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { PremiumGate } from '@/components/PremiumGate';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useLanguage } from '@/hooks/useLanguage';

interface UserLike {
  id: string;
  name: string;
  age: number;
  photos: string[];
  location: string;
  likedAt: string;
  isSuperLike: boolean;
}

export const WhoLikesYou: React.FC = () => {
  const { user } = useAuth();
  const { features, subscription_tier } = useSubscription();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [likes, setLikes] = useState<UserLike[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBlurred, setShowBlurred] = useState(true);

  const canSeeWhoLikesYou = features.seeWhoLikesYou;

  const loadLikes = async () => {
    if (!user) return;

    try {
      // Get regular likes
      const { data: swipes, error: swipesError } = await supabase
        .from('swipes')
        .select(`
          id,
          created_at,
          user_id,
          profiles!swipes_user_id_fkey (
            id,
            name,
            age,
            photos,
            location
          )
        `)
        .eq('target_user_id', user.id)
        .eq('direction', 'right')
        .order('created_at', { ascending: false })
        .limit(50);

      if (swipesError) throw swipesError;

      // Get super likes
      const { data: superLikes, error: superLikesError } = await supabase
        .from('super_likes')
        .select(`
          id,
          created_at,
          user_id
        `)
        .eq('target_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (superLikesError) throw superLikesError;

      // Get profiles for super likes users
      const superLikeUserIds = superLikes?.map(sl => sl.user_id) || [];
      let superLikeProfiles: any[] = [];
      
      if (superLikeUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, name, age, photos, location')
          .in('id', superLikeUserIds);
        
        superLikeProfiles = profiles || [];
      }

      // Format regular likes
      const regularLikes = swipes?.map(swipe => ({
        id: swipe.profiles?.id || swipe.user_id,
        name: swipe.profiles?.name || 'Unknown',
        age: swipe.profiles?.age || 0,
        photos: swipe.profiles?.photos || [],
        location: swipe.profiles?.location || '',
        likedAt: swipe.created_at,
        isSuperLike: false
      })) || [];

      // Format super likes
      const formattedSuperLikes = superLikeProfiles?.map(profile => ({
        id: profile.id,
        name: profile.name || 'Unknown',
        age: profile.age || 0,
        photos: profile.photos || [],
        location: profile.location || '',
        likedAt: superLikes?.find(sl => sl.user_id === profile.id)?.created_at || '',
        isSuperLike: true
      })) || [];

      // Combine and sort by date (super likes first)
      const formattedLikes = [...formattedSuperLikes, ...regularLikes]
        .sort((a, b) => {
          // Super likes first
          if (a.isSuperLike && !b.isSuperLike) return -1;
          if (!a.isSuperLike && b.isSuperLike) return 1;
          // Then by date
          return new Date(b.likedAt).getTime() - new Date(a.likedAt).getTime();
        });

      setLikes(formattedLikes);
    } catch (error) {
      console.error('Error loading likes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLikes();
    
    // Real-time subscription for new likes
    const channel = supabase
      .channel(`who-likes-${user?.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swipes',
          filter: `target_user_id=eq.${user?.id}`
        },
        () => {
          loadLikes();
        }
      )
      .subscribe();
      
    return () => {
      channel.unsubscribe();
    };
  }, [user]);

  if (!canSeeWhoLikesYou) {
    return (
      <PremiumGate
        feature="Seni Kimler Beğendi?"
        requiredTier="silver"
      >
        <div />
      </PremiumGate>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-pink-500" />
            <CardTitle>{t('whoLikesYou')}</CardTitle>
            <Badge variant="secondary">{likes.length}</Badge>
          </div>
          {subscription_tier && ['silver', 'gold', 'platinum', 'moderator', 'admin'].includes(subscription_tier) && likes.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowBlurred(!showBlurred)}
            >
              {showBlurred ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {likes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>{t('noLikesYet')}</p>
            <p className="text-sm mt-2">{t('completeProfileToGetLikes')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {likes.map((like) => (
              <div
                key={like.id}
                className={`relative cursor-pointer group ${showBlurred ? '' : 'hover:scale-105'} transition-transform`}
                onClick={() => !showBlurred && navigate(`/profile/${like.id}`)}
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                  {like.photos[0] ? (
                    <img
                      src={like.photos[0]}
                      alt={like.name}
                      className={`w-full h-full object-cover ${showBlurred ? 'blur-lg' : ''}`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Heart className="w-8 h-8 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Super Like Badge */}
                  {like.isSuperLike && (
                    <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-400 to-yellow-600 p-2 rounded-full shadow-lg z-10">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  
                  {showBlurred && (
                    <div className="absolute inset-0 bg-gray-900/70 dark:bg-gray-800/70 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-white" />
                    </div>
                  )}
                  
                  {!showBlurred && (
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 dark:from-gray-800/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <p className="font-semibold">{like.name}, {like.age}</p>
                        <p className="text-xs opacity-80">{like.location}</p>
                        <p className="text-xs opacity-60 mt-1">
                          {format(new Date(like.likedAt), 'dd MMM', { locale: tr })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {likes.length > 0 && showBlurred && (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              {t('peopleWhoLikedYou', { count: likes.length })}
            </p>
            <Button
              onClick={() => setShowBlurred(false)}
              className="bg-gradient-to-r from-pink-500 to-purple-600"
            >
              <Crown className="w-4 h-4 mr-2" />
              {t('seeAll')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};