
import { useEffect } from "react";

interface SwipeKeyboardHandlerProps {
  isInteractive: boolean;
  isAnimating: boolean;
  onSwipe: (direction: 'left' | 'right') => void;
  onSuperLike?: () => void;
}

export const useSwipeKeyboardHandler = ({
  isInteractive,
  isAnimating,
  onSwipe,
  onSuperLike
}: SwipeKeyboardHandlerProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isInteractive || isAnimating) return;
      
      if (e.key === 'ArrowLeft') {
        onSwipe('left');
      } else if (e.key === 'ArrowRight') {
        onSwipe('right');
      } else if (e.key === 'ArrowUp' && onSuperLike) {
        onSuperLike();
      }
    };

    if (isInteractive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isInteractive, onSwipe, onSuperLike, isAnimating]);
};
