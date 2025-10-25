import { Header } from "@/components/Header";
import { PremiumGate } from "@/components/PremiumGate";
import { useSubscription } from "@/hooks/useSubscription";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, MapPin, Calendar } from "lucide-react";

interface LikeProfile {
  id: string;
  name: string;
  age: number;
  bio: string;
  photos: string[];
  location: string;
  created_at: string;
}

export const LikesPagePremium = () => {
  const { user } = useAuth();
  const { isPremiumUser: isPremium } = useSubscription();
  const [likes, setLikes] = useState<LikeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && isPremium()) {
      fetchLikes();
    }
  }, [user, isPremium]);

  const fetchLikes = async () => {
    if (!user) return;

    const { data: swipesData } = await supabase
      .from('swipes')
      .select(`
        target_user_id,
        created_at,
        profiles!swipes_target_user_id_fkey(*)
      `)
      .eq('user_id', user.id)
      .eq('direction', 'right')
      .order('created_at', { ascending: false });

    if (swipesData) {
      const likesProfiles = swipesData
        .filter(swipe => swipe.profiles)
        .map(swipe => ({
          ...swipe.profiles,
          created_at: swipe.created_at
        })) as LikeProfile[];
      
      setLikes(likesProfiles);
    }
    setLoading(false);
  };

  const LikesContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="text-lg">Yükleniyor...</div>
        </div>
      );
    }

    if (likes.length === 0) {
      return (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Henüz kimseyi beğenmedin</h3>
          <p className="text-gray-600">Keşfet sayfasında profilleri görüntüleyerek beğenmeye başla!</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {likes.map((profile) => (
          <Card key={profile.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-square relative">
              <img 
                src={profile.photos?.[0] || '/placeholder.svg'} 
                alt={profile.name}
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-lg">{profile.name}</h3>
                <span className="text-gray-600">{profile.age}</span>
              </div>
              {profile.location && (
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {profile.location}
                </div>
              )}
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{profile.bio}</p>
              <div className="flex items-center text-xs text-gray-500">
                <Calendar className="w-3 h-3 mr-1" />
                Beğenildi: {new Date(profile.created_at).toLocaleDateString('tr-TR')}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Beğendiklerim</h1>
            <p className="text-gray-600">Beğendiğin profilleri görüntüle</p>
          </div>
          
          <PremiumGate 
            feature="Beğendiklerim"
            requiredTier="silver"
          >
            <LikesContent />
          </PremiumGate>
        </div>
      </main>
    </div>
  );
};
