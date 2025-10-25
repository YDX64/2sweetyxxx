import { useState, useEffect, useRef, memo } from "react";
import { Tables } from "@/integrations/supabase/types";
import { PhotoGallery } from "./PhotoGallery";
import { SwipeIndicators } from "./SwipeIndicators";
import { ProfileInfoOverlay } from "./ProfileInfoOverlay";

type Profile = Tables<"profiles"> & { distance?: number; verified?: boolean };

// Intersection Observer hook for image lazy loading
const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || hasIntersected) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          setHasIntersected(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, ...options },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasIntersected, options]);

  return { elementRef, isIntersecting: isIntersecting || hasIntersected };
};

interface SwipeCardContentProps {
  user: Profile;
  photos: string[];
  currentPhotoIndex: number;
  onNextPhoto: () => void;
  onPrevPhoto: () => void;
  onPhotoClick: (e: React.MouseEvent) => void;
  dragOffset: { x: number; y: number };
  isInteractive: boolean;
  isDragging: boolean;
  isAnimating: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onSuperLike?: () => void;
}

const SwipeCardContent = memo(
  ({
    user,
    photos,
    currentPhotoIndex,
    onNextPhoto,
    onPrevPhoto,
    onPhotoClick,
    dragOffset,
    isInteractive,
    isDragging,
    isAnimating,
    onSwipe,
    onSuperLike,
  }: SwipeCardContentProps) => {
    const { elementRef, isIntersecting } = useIntersectionObserver();
    const [imageLoaded, setImageLoaded] = useState(false);
    return (
      <div className="relative w-full h-full">
        <PhotoGallery
          photos={photos}
          currentPhotoIndex={currentPhotoIndex}
          onNextPhoto={onNextPhoto}
          onPrevPhoto={onPrevPhoto}
          onPhotoClick={() => onPhotoClick({} as React.MouseEvent)}
          userName={user.name || ""}
          userDistance={user.distance ? String(user.distance) : undefined}
          isInteractive={isInteractive && !isDragging}
        />

        {/* Gradient overlay from top to bottom - transparent at top, dark at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-900/80" />

        <ProfileInfoOverlay
          user={user}
          onSwipe={onSwipe}
          onSuperLike={onSuperLike}
          isInteractive={isInteractive}
          isAnimating={isAnimating}
        />

        <SwipeIndicators
          dragOffset={dragOffset.x}
          dragOffsetY={dragOffset.y}
          isInteractive={isInteractive}
        />
      </div>
    );
  },
);

SwipeCardContent.displayName = "SwipeCardContent";

export { SwipeCardContent };
