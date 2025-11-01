import { Heart, X, Star } from "lucide-react";
import { useState, useEffect } from "react";

interface SwipeIndicatorsProps {
  dragOffset: number;
  dragOffsetY?: number;
  isInteractive: boolean;
}

export const SwipeIndicators = ({
  dragOffset,
  dragOffsetY = 0,
  isInteractive,
}: SwipeIndicatorsProps) => {
  const [hasUsedSuperLike, setHasUsedSuperLike] = useState(false);

  // Check if user has used super like before
  useEffect(() => {
    const hasUsed = localStorage.getItem("hasUsedSuperLike") === "true";
    setHasUsedSuperLike(hasUsed);
  }, []);

  // Track super like usage
  useEffect(() => {
    if (dragOffsetY < -80) {
      // When super like threshold is reached
      localStorage.setItem("hasUsedSuperLike", "true");
      setHasUsedSuperLike(true);
    }
  }, [dragOffsetY]);

  if (!isInteractive) return null;

  const likeOpacity = Math.min(Math.abs(dragOffset) / 80, 1);
  const passOpacity = Math.min(Math.abs(dragOffset) / 80, 1);
  const superLikeOpacity = Math.min(Math.abs(dragOffsetY) / 80, 1);

  return (
    <>
      {/* Like indicator */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-500/20 flex items-center justify-center transition-opacity duration-200 ${
          dragOffset > 30 ? "opacity-100" : "opacity-0"
        }`}
        style={{ opacity: dragOffset > 30 ? likeOpacity : 0 }}
      >
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transform rotate-12 border-4 border-white shadow-2xl flex items-center gap-2 animate-pulse">
          <Heart className="w-6 h-6 fill-current" />
          LIKE
        </div>
      </div>

      {/* Pass indicator */}
      <div
        className={`absolute inset-0 bg-gradient-to-br from-red-400/20 to-rose-500/20 flex items-center justify-center transition-opacity duration-200 ${
          dragOffset < -30 ? "opacity-100" : "opacity-0"
        }`}
        style={{ opacity: dragOffset < -30 ? passOpacity : 0 }}
      >
        <div className="bg-gradient-to-r from-red-500 to-rose-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transform -rotate-12 border-4 border-white shadow-2xl flex items-center gap-2 animate-pulse">
          <X className="w-6 h-6" />
          PASS
        </div>
      </div>

      {/* Super like indicator */}
      {dragOffsetY < -30 && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-500/20 flex items-center justify-center">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-8 py-4 rounded-2xl font-bold text-lg border-4 border-white shadow-2xl flex items-center gap-2 animate-pulse">
            <Star className="w-6 h-6 fill-current" />
            SUPER LIKE
          </div>
        </div>
      )}

      {/* Super like hint - only show if user hasn't used super like before */}
      {!hasUsedSuperLike &&
        Math.abs(dragOffset) < 10 &&
        Math.abs(dragOffsetY) < 10 && (
          <div className="absolute top-16 md:top-10 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1.5 rounded-full text-[11px] md:text-xs font-medium animate-pulse shadow-lg flex items-center gap-1.5 backdrop-blur-sm">
              <Star className="w-2.5 h-2.5 md:w-3 md:h-3 fill-current" />
              Swipe up for Super Like
            </div>
          </div>
        )}
    </>
  );
};
