import { Star, MapPin, Music, Plane, Utensils, Dumbbell, Book, Film, Camera, Activity, TreePine, Coffee, Palette, Music2, Laptop, Shirt, Gamepad2, BookOpen, Waves, User, Bike, Mountain, Tent, Heart, LucideIcon } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { VerifiedBadge } from "@/components/ui/VerifiedBadge";

type Profile = Tables<'profiles'> & { distance?: number; verified?: boolean };

interface ProfileInfoOverlayProps {
  user: Profile;
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike?: () => void;
  isInteractive: boolean;
  isAnimating: boolean;
}

// Modern Context7 pattern: Type-safe interest icon mapping
const getInterestIcon = (interestKey: string): LucideIcon => {
  const iconMap: Record<string, LucideIcon> = {
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
    camping: Tent
  };
  
  return iconMap[interestKey] || Heart;
};

export const ProfileInfoOverlay = ({ 
  user, 
  onSwipe, 
  onSuperLike, 
  isInteractive, 
  isAnimating 
}: ProfileInfoOverlayProps) => {

  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
      {/* Status badge */}
      <div className="mb-3">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg">
          <Star className="w-3 h-3 mr-1 fill-current" />
          New here
        </span>
      </div>

      {/* Name and age */}
      <div className="mb-3">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg flex items-center gap-2">
          <span>{user.name || 'Unknown'}, {user.age || '?'}</span>
          {user.verified && <VerifiedBadge size="md" showTooltip={false} />}
        </h3>
        {user.location && (
          <div className="flex items-center text-white/90 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm font-medium">{user.location}</span>
            {user.distance && (
              <span className="ml-2 text-sm text-white/80">
                {Math.round(user.distance)} km away
              </span>
            )}
          </div>
        )}
      </div>

      {/* Interests tags - Single row with horizontal scroll */}
      {user.interests && user.interests.length > 0 && (
        <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          {user.interests.slice(0, 6).map((interest, index) => {
            const IconComponent = getInterestIcon(interest);
            return (
              <span
                key={index}
                className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30 whitespace-nowrap flex-shrink-0 flex items-center gap-1.5"
              >
                <IconComponent className="w-3 h-3" />
                {interest}
              </span>
            );
          })}
          {user.interests.length > 6 && (
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30 whitespace-nowrap flex-shrink-0">
              +{user.interests.length - 6}
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {user.bio && (
        <p className="text-sm text-white/90 line-clamp-2 leading-relaxed drop-shadow">
          {user.bio}
        </p>
      )}
    </div>
  );
};
