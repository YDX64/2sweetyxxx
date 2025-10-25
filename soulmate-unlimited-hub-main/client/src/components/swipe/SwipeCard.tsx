import { useState, useRef, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useSwipeGestures } from "./SwipeGestures";
import { useSwipeVisualEffects } from "./SwipeVisualEffects";
import { useSwipeKeyboardHandler } from "./SwipeKeyboardHandler";
import { SwipeCardContent } from "./SwipeCardContent";
import { SwipeActionButtons } from "./SwipeActionButtons";
import { FullScreenPhotoModal } from "./FullScreenPhotoModal";

type Profile = Tables<"profiles"> & { distance?: number; verified?: boolean };

interface SwipeCardProps {
  user: Profile;
  onSwipe: (direction: "left" | "right") => void;
  onSuperLike?: () => void;
  isInteractive: boolean;
  onRewind?: () => void;
}

const SwipeCard = memo(
  ({ user, onSwipe, onSuperLike, isInteractive, onRewind }: SwipeCardProps) => {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showFullScreenPhoto, setShowFullScreenPhoto] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null!);
    const navigate = useNavigate();

    // Tap handler for mobile touch events (no parameters needed)
    const handleTap = useCallback(() => {
      // Don't navigate if animating
      if (isAnimating) return;
      navigate(`/profile/${user.id}`);
    }, [isAnimating, navigate, user.id]);

    // Use the gesture handling hook
    const {
      isDragging,
      dragOffset,
      handleMouseDown,
      handleMouseMove,
      handleMouseUp,
      handleTouchStart,
      handleTouchMove,
      handleTouchEnd,
    } = useSwipeGestures({
      isInteractive,
      isAnimating,
      onSwipe,
      onSuperLike,
      onTap: handleTap,
      cardRef,
      setIsAnimating,
    });

    // Use the visual effects hook
    const { opacity, transform, boxShadow, cursorStyle } =
      useSwipeVisualEffects({
        dragOffset,
        isDragging,
        isAnimating,
      });

    // Use the keyboard handler hook
    useSwipeKeyboardHandler({
      isInteractive,
      isAnimating,
      onSwipe,
      onSuperLike,
    });

    const photos =
      user.photos && user.photos.length > 0
        ? user.photos
        : [
            user.gender === "male"
              ? "/media/images/default_male.jpg"
              : "/media/images/default_female.jpg",
          ];

    const nextPhoto = useCallback(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, [photos.length]);

    const prevPhoto = useCallback(() => {
      setCurrentPhotoIndex(
        (prev) => (prev - 1 + photos.length) % photos.length,
      );
    }, [photos.length]);

    const handleCardClick = useCallback(
      (e: React.MouseEvent) => {
        // Don't navigate if dragging or clicking on interactive elements
        if (isDragging || isAnimating) return;

        const target = e.target as HTMLElement;
        if (
          target.closest("button") ||
          target.closest('[role="button"]') ||
          target.closest(".action-buttons-area")
        )
          return;

        navigate(`/profile/${user.id}`);
      },
      [isDragging, isAnimating, navigate, user.id],
    );

    const handlePhotoClick = useCallback((e: React.MouseEvent) => {
      e.stopPropagation();
      setShowFullScreenPhoto(true);
    }, []);

    const handlePass = useCallback(() => {
      onSwipe("left");
    }, [onSwipe]);

    const handleLike = useCallback(() => {
      onSwipe("right");
    }, [onSwipe]);

    const handleSuperLike = useCallback(() => {
      onSuperLike?.();
    }, [onSuperLike]);

    return (
      <div className="w-full h-full p-2 flex items-center justify-center">
        <div
          ref={cardRef}
          className={`relative rounded-3xl shadow-2xl overflow-hidden select-none w-full max-w-[400px] h-full max-h-[calc(100vh-300px)] ${
            cursorStyle
          } ${isAnimating ? "pointer-events-none" : ""}`}
          style={{
            transform,
            opacity,
            boxShadow,
            aspectRatio: '3/4',
            margin: '0 auto',
            minHeight: '500px',
            maxHeight: 'calc(100vh - 300px)'
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={handleCardClick}
        >
          <SwipeCardContent
            user={user}
            photos={photos}
            currentPhotoIndex={currentPhotoIndex}
            onNextPhoto={nextPhoto}
            onPrevPhoto={prevPhoto}
            onPhotoClick={handlePhotoClick}
            dragOffset={dragOffset}
            isInteractive={isInteractive}
            isDragging={isDragging}
            isAnimating={isAnimating}
            onSwipe={onSwipe}
            onSuperLike={onSuperLike}
          />
        </div>

        {/* Full screen photo modal */}
        {showFullScreenPhoto && (
          <FullScreenPhotoModal
            photos={photos}
            currentPhotoIndex={currentPhotoIndex}
            user={user}
            onClose={() => setShowFullScreenPhoto(false)}
            onNextPhoto={nextPhoto}
            onPrevPhoto={prevPhoto}
          />
        )}
      </div>
    );
  },
);

SwipeCard.displayName = "SwipeCard";

export { SwipeCard };
