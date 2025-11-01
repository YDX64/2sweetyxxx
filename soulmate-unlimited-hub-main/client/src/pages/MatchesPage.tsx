import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useMatches } from "@/hooks/useMatches";
import { useLanguage } from "@/hooks/useLanguage";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Heart, Star } from "lucide-react";

export const MatchesPage = () => {
  const { t } = useLanguage();
  const { matches, loading } = useMatches();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-700 dark:text-gray-200">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💕</span>
            <h1 className="text-3xl font-bold text-gray-800">{t('myMatches')}</h1>
            <span className="bg-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              {matches.length}
            </span>
          </div>

          {matches.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">💔</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                {t('noMatchesYetMessage')}
              </h2>
              <p className="text-gray-600 mb-6">
                {t('exploreMoreToMatch')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matches.map((match) => (
                <Card key={match.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative">
                    <img
                      src={match.matched_user.photos?.[0] || "https://images.unsplash.com/photo-1494790108755-2616b612b1e0?w=400&h=300&fit=crop&crop=face"}
                      alt={match.matched_user.name || t('profile')}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      {t('match')}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-xl font-bold mb-2">
                      {match.matched_user.name}, {match.matched_user.age}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {match.matched_user.bio || t('noBioAdded')}
                    </p>
                    <div className="flex gap-2">
                      <Button className="flex-1 bg-pink-500 hover:bg-pink-600">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        {t('sendMessage')}
                      </Button>
                      <Button variant="outline" size="sm">
                        <Heart className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
