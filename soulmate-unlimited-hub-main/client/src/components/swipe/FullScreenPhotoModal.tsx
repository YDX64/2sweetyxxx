
import { Tables } from "@/integrations/supabase/types";

type Profile = Tables<'profiles'>;

interface FullScreenPhotoModalProps {
  photos: string[];
  currentPhotoIndex: number;
  user: Profile;
  onClose: () => void;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
}

export const FullScreenPhotoModal = ({
  photos,
  currentPhotoIndex,
  user,
  onClose,
  onNextPhoto,
  onPrevPhoto
}: FullScreenPhotoModalProps) => {
  return (
    <div
      className="fixed inset-0 bg-background/95 backdrop-blur-md z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div className="relative max-w-full max-h-full">
        <img 
          src={photos[currentPhotoIndex]}
          alt={user.name || 'Profile'}
          className="max-w-full max-h-full object-contain"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-foreground text-2xl bg-background/80 rounded-full w-10 h-10 flex items-center justify-center hover:bg-background/90 transition-all"
        >
          ×
        </button>
        {photos.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrevPhoto();
              }}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-foreground text-2xl bg-background/80 rounded-full w-12 h-12 flex items-center justify-center hover:bg-background/90 transition-all"
            >
              ←
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNextPhoto();
              }}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-foreground text-2xl bg-background/80 rounded-full w-12 h-12 flex items-center justify-center hover:bg-background/90 transition-all"
            >
              →
            </button>
          </>
        )}
      </div>
    </div>
  );
};
