
interface SwipeVisualEffectsProps {
  dragOffset: { x: number; y: number };
  isDragging: boolean;
  isAnimating: boolean;
}

export const useSwipeVisualEffects = ({ dragOffset, isDragging, isAnimating }: SwipeVisualEffectsProps) => {
  const ROTATION_MULTIPLIER = 0.08;

  // Enhanced visual feedback with better opacity handling
  const rotation = dragOffset.x * ROTATION_MULTIPLIER;
  const opacity = isAnimating ? 0 : Math.max(0.7, 1 - Math.abs(dragOffset.x) / 600); // Better minimum opacity
  const scale = isDragging ? Math.max(0.98, 1 - Math.abs(dragOffset.x) / 1500) : 1; // Less dramatic scaling

  // Super like visual feedback
  const superLikeScale = dragOffset.y < -30 ? 1.02 : 1; // Subtle scale increase
  const superLikeGlow = dragOffset.y < -30 ? '0 0 30px rgba(59, 130, 246, 0.4)' : 'none';

  const getBoxShadow = () => {
    if (dragOffset.x > 50) {
      return '0 25px 50px rgba(34, 197, 94, 0.3)';
    } else if (dragOffset.x < -50) {
      return '0 25px 50px rgba(239, 68, 68, 0.3)';
    } else if (dragOffset.y < -30) {
      return superLikeGlow;
    }
    return '0 20px 40px rgba(0, 0, 0, 0.1)'; // Lighter default shadow
  };

  const getTransform = () => {
    if (isAnimating) return '';
    return `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${rotation}deg) scale(${scale * superLikeScale})`;
  };

  const getCursorStyle = () => {
    if (isDragging) return 'cursor-grabbing';
    return 'cursor-pointer hover:shadow-2xl'; // Changed from grab to pointer for better UX
  };

  return {
    opacity,
    transform: getTransform(),
    boxShadow: getBoxShadow(),
    cursorStyle: getCursorStyle()
  };
};
