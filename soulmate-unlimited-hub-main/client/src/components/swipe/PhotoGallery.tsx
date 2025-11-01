import { formatDistance } from "@/utils/locationUtils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { OptimizedImage } from "@/components/ui/optimized-image";

interface PhotoGalleryProps {
  photos: string[];
  currentPhotoIndex: number;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onPhotoClick?: () => void;
  userName?: string;
  userDistance?: string;
  isInteractive?: boolean;
}

export const PhotoGallery = ({
  photos,
  currentPhotoIndex = 0,
  onNextPhoto = () => {},
  onPrevPhoto = () => {},
  onPhotoClick,
  userName,
  userDistance,
  isInteractive = true,
}: PhotoGalleryProps) => {
  const [imageError, setImageError] = useState(false);

  const handleImageError = () => {
    setImageError(true);
  };

  const getImageSrc = () => {
    // Always use the first photo if available
    const photo = photos[0];
    console.log('[PhotoGallery] Displaying profile photo:', photo);
    
    if (!photo) {
      return "/media/images/default_female.jpg";
    }

    // Check if it's a valid URL
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }

    // If it's already a local path, use it directly
    if (photo.startsWith("/media/images/")) {
      return photo;
    }

    // If it's just a filename or invalid string, use default
    if (!photo.includes('/') || photo.length < 10) {
      console.warn('[PhotoGallery] Invalid photo format, using default');
      return "/media/images/default_female.jpg";
    }

    // Fallback for image loading errors
    if (imageError) {
      return "/media/images/default_female.jpg";
    }

    return photo;
  };

  return (
    <div className="relative w-full h-full overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        <OptimizedImage
          src={getImageSrc()}
          alt={userName || "Profile"}
          className="w-full h-full object-cover"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          onClick={onPhotoClick}
          onError={handleImageError}
          loading="lazy"
        />
      </div>

      {/* Show distance indicator if available */}
      {userDistance !== undefined && (
        <div className="absolute top-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-full z-10">
          {userDistance} km away
        </div>
      )}
    </div>
  );
};
