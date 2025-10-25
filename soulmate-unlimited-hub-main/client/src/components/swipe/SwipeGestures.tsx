import { useState, useRef, useEffect } from "react";
import { useSwipeGestureFeedback } from "@/hooks/useSwipeFeedback";

interface SwipeGesturesProps {
  isInteractive: boolean;
  isAnimating: boolean;
  onSwipe: (direction: "left" | "right") => void;
  onSuperLike?: () => void;
  onTap?: () => void;
  cardRef: React.RefObject<HTMLDivElement>;
  setIsAnimating: (animating: boolean) => void;
}

export const useSwipeGestures = ({
  isInteractive,
  isAnimating,
  onSwipe,
  onSuperLike,
  onTap,
  cardRef,
  setIsAnimating,
}: SwipeGesturesProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [velocity, setVelocity] = useState({ x: 0, y: 0 });
  const lastDragTime = useRef(Date.now());
  
  // Tap detection
  const touchStartTime = useRef(0);
  const touchStartPos = useRef({ x: 0, y: 0 });
  const [hasMoved, setHasMoved] = useState(false);

  // Gesture feedback for progressive animations
  const { updateGesture, resetGesture, triggerGestureComplete } =
    useSwipeGestureFeedback();
  const lastDragPos = useRef({ x: 0, y: 0 });

  const SWIPE_THRESHOLD = 80;
  const SUPER_LIKE_THRESHOLD = -120;
  const VELOCITY_THRESHOLD = 0.5;
  
  // Tap detection constants
  const TAP_TIME_THRESHOLD = 300; // ms
  const TAP_DISTANCE_THRESHOLD = 10; // pixels

  const resetCard = () => {
    setIsAnimating(false);
    setDragOffset({ x: 0, y: 0 });
    setVelocity({ x: 0, y: 0 });
    if (cardRef.current) {
      cardRef.current.style.transition = "";
      cardRef.current.style.transform = "";
      cardRef.current.style.opacity = "";
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    resetGesture();

    // Check if this was a tap (quick touch with minimal movement)
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime.current;
    const touchDistance = Math.sqrt(
      Math.pow(dragOffset.x, 2) + Math.pow(dragOffset.y, 2)
    );

    const isTap =
      touchDuration < TAP_TIME_THRESHOLD &&
      touchDistance < TAP_DISTANCE_THRESHOLD &&
      !hasMoved;

    if (isTap && onTap) {
      resetCard();
      setHasMoved(false);
      onTap();
      return;
    }

    // Check for Super Like first (upward swipe)
    const shouldSuperLike =
      dragOffset.y < SUPER_LIKE_THRESHOLD || velocity.y < -VELOCITY_THRESHOLD;

    if (shouldSuperLike && onSuperLike) {
      setIsAnimating(true);
      triggerGestureComplete("up");

      if (cardRef.current) {
        cardRef.current.style.transition =
          "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out";
        cardRef.current.style.transform = "translateY(-120vh) scale(0.8)";
        cardRef.current.style.opacity = "0";
      }

      setTimeout(() => {
        onSuperLike();
        resetCard();
      }, 500);
      setHasMoved(false);
      return;
    }

    // Check for horizontal swipe
    const shouldSwipe =
      Math.abs(dragOffset.x) > SWIPE_THRESHOLD ||
      Math.abs(velocity.x) > VELOCITY_THRESHOLD;

    if (shouldSwipe) {
      setIsAnimating(true);
      const direction = dragOffset.x > 0 || velocity.x > 0 ? "right" : "left";
      triggerGestureComplete(direction);

      if (cardRef.current) {
        const finalX = direction === "right" ? "120vw" : "-120vw";
        const finalRotation = direction === "right" ? "25deg" : "-25deg";

        cardRef.current.style.transition =
          "transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.4s ease-out";
        cardRef.current.style.transform = `translateX(${finalX}) rotate(${finalRotation}) scale(0.8)`;
        cardRef.current.style.opacity = "0";
      }

      setTimeout(() => {
        onSwipe(direction);
        resetCard();
      }, 500);
      setHasMoved(false);
      return;
    }

    // Return to center if not enough movement
    resetCard();
    setHasMoved(false);
  };

  const updateDragPosition = (clientX: number, clientY: number) => {
    const currentOffset = {
      x: clientX - dragStart.x,
      y: clientY - dragStart.y,
    };
    setDragOffset(currentOffset);

    // Check if user has moved beyond tap threshold
    const distance = Math.sqrt(currentOffset.x * currentOffset.x + currentOffset.y * currentOffset.y);
    if (distance > TAP_DISTANCE_THRESHOLD) {
      setHasMoved(true);
    }

    // Calculate velocity for both X and Y
    const now = Date.now();
    const timeDiff = now - lastDragTime.current;
    if (timeDiff > 0) {
      const velocityX = (clientX - lastDragPos.current.x) / timeDiff;
      const velocityY = (clientY - lastDragPos.current.y) / timeDiff;
      setVelocity({ x: velocityX, y: velocityY });
      lastDragTime.current = now;
      lastDragPos.current = { x: clientX, y: clientY };
    }

    // Progressive gesture feedback
    const absX = Math.abs(currentOffset.x);
    const absY = Math.abs(currentOffset.y);
    const maxOffset = Math.max(absX, absY);
    const intensity = Math.min(maxOffset / 100, 1); // Normalize to 0-1

    // Determine primary direction
    let direction: "left" | "right" | "up" | null = null;
    if (maxOffset > 20) {
      if (absY > absX && currentOffset.y < -30) {
        direction = "up";
      } else if (absX > absY) {
        direction = currentOffset.x > 0 ? "right" : "left";
      }
    }

    updateGesture(true, direction, intensity);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isInteractive || isAnimating) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    lastDragPos.current = { x: e.clientX, y: e.clientY };
    lastDragTime.current = Date.now();
    updateGesture(true, null, 0);
    e.preventDefault();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !isInteractive || isAnimating) return;
    updateDragPosition(e.clientX, e.clientY);
    e.preventDefault();
  };

  const handleMouseUp = () => {
    if (!isInteractive || isAnimating) return;
    handleDragEnd();
  };

  // Touch events for React (without preventDefault)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isInteractive || isAnimating) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
    
    // Initialize tap detection
    touchStartTime.current = Date.now();
    touchStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setHasMoved(false);
    
    lastDragTime.current = Date.now();
    lastDragPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    updateGesture(true, null, 0);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !isInteractive || isAnimating) return;
    updateDragPosition(e.touches[0].clientX, e.touches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!isInteractive || isAnimating) return;
    handleDragEnd();
  };

  // Native touch event handlers with passive: false
  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const nativeTouchStart = (e: TouchEvent) => {
      if (!isInteractive || isAnimating) return;
      e.preventDefault();
    };

    const nativeTouchMove = (e: TouchEvent) => {
      if (!isDragging || !isInteractive || isAnimating) return;
      e.preventDefault();
    };

    // Add non-passive touch event listeners
    card.addEventListener('touchstart', nativeTouchStart, { passive: false });
    card.addEventListener('touchmove', nativeTouchMove, { passive: false });

    return () => {
      card.removeEventListener('touchstart', nativeTouchStart);
      card.removeEventListener('touchmove', nativeTouchMove);
    };
  }, [isDragging, isInteractive, isAnimating, cardRef]);

  return {
    isDragging,
    dragOffset,
    velocity,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    resetCard,
  };
};
