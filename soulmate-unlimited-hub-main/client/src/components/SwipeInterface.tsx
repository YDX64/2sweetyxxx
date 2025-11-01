import { useState, useEffect, useCallback, memo } from "react";
import { SwipeCard } from "@/components/SwipeCard";
import type { Tables } from "@/integrations/supabase/types";
import { useLanguage } from "@/hooks/useLanguage";
import { RotateCcw, HeartCrack } from "lucide-react";
import { InterstitialAd } from "@/components/ads/InterstitialAd";
import { useSiteConfig } from "@/hooks/useSiteConfig";
import { useSwipeImagePreloader } from "@/hooks/useImagePreloader";
import { useSwipeFeedback } from "@/hooks/useSwipeFeedback";
import { SwipeActionButtons } from "@/components/swipe/SwipeActionButtons";
import { ExtendedWindow } from "@/types/common";

type Profile = Tables<"profiles">;

interface SwipeInterfaceProps {
  users: Profile[];
  onSwipe: (userId: string, direction: "left" | "right") => Promise<boolean>;
  onSuperLike?: (userId: string) => Promise<boolean>;
  onRewind?: (rewindedProfileId?: string) => void;
}

const SwipeInterface = memo(
  ({ users, onSwipe, onSuperLike, onRewind }: SwipeInterfaceProps) => {
    const { t } = useLanguage();
    const { config } = useSiteConfig();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [stackCards, setStackCards] = useState<Profile[]>([]);
    const [showInterstitialAd, setShowInterstitialAd] = useState(false);
    const [swipeCount, setSwipeCount] = useState(0);

    // Preload images for smooth transitions
    const usersForPreload = users.map((user) => ({
      id: user.id,
      photos: user.photos || [],
    }));
    const { isImageLoaded } = useSwipeImagePreloader(
      usersForPreload,
      currentIndex,
      5,
    );

    // Feedback system for visual and haptic effects
    const { showFeedback, currentFeedback } = useSwipeFeedback();

    // Update stack when users change
    useEffect(() => {
      console.log('[SwipeInterface] useEffect triggered - users:', users.length, 'currentIndex:', currentIndex);
      
      // Always reset to index 0 when users array changes
      setCurrentIndex(0);

      // Always show the first 3 profiles in the array
      if (users.length > 0) {
        const newStack = users.slice(0, 3);
        console.log('[SwipeInterface] Updating stack cards:', newStack.map(u => u.name));
        console.log('[SwipeInterface] User photos:', newStack.map(u => u.photos));
        setStackCards(newStack);
      } else {
        console.log('[SwipeInterface] No users, clearing stack cards');
        setStackCards([]);
      }
    }, [users]); // Only depend on users array, not currentIndex

    const handleSwipe = useCallback(
      async (direction: "left" | "right") => {
        if (currentIndex < users.length) {
          const currentUser = users[currentIndex];

          // Show feedback effect immediately
          showFeedback(direction === "right" ? "like" : "pass", currentUser.id);

          try {
            // Call parent's onSwipe which handles backend logic
            // Wait for the result before proceeding
            const success = await onSwipe(currentUser.id, direction);
            
            if (success) {
              console.log('[SwipeInterface] Swipe successful for user:', currentUser.name);
              
              // Track swipes and show ad based on frequency
              const newSwipeCount = swipeCount + 1;
              setSwipeCount(newSwipeCount);

              const adFrequency = parseInt(config.ads_frequency_swipe || "5");
              if (
                newSwipeCount % adFrequency === 0 &&
                config.google_adsense_client_id
              ) {
                setShowInterstitialAd(true);
              }
            } else {
              console.error('[SwipeInterface] Swipe failed for user:', currentUser.name);
              // If swipe failed, we might want to show an error feedback
              // But the parent component should handle showing error toasts
            }
          } catch (error) {
            console.error('[SwipeInterface] Error during swipe:', error);
            // The parent component should handle showing error toasts
          }
        }
      },
      [
        currentIndex,
        users,
        onSwipe,
        swipeCount,
        config.ads_frequency_swipe,
        config.google_adsense_client_id,
        showFeedback,
      ],
    );

    const handleSuperLike = useCallback(async () => {
      if (currentIndex < users.length && onSuperLike) {
        const currentUser = users[currentIndex];

        // Show super like feedback
        showFeedback("superlike", currentUser.id);

        try {
          // Wait for the super like to complete
          const success = await onSuperLike(currentUser.id);
          
          if (success) {
            console.log('[SwipeInterface] SuperLike successful for user:', currentUser.name);
          } else {
            console.error('[SwipeInterface] SuperLike failed for user:', currentUser.name);
            // The parent component should handle showing error toasts
          }
        } catch (error) {
          console.error('[SwipeInterface] Error during superlike:', error);
          // The parent component should handle showing error toasts
        }
      }
    }, [currentIndex, users, onSuperLike, showFeedback]);

    const handlePass = useCallback(async () => {
      await handleSwipe("left");
    }, [handleSwipe]);

    const handleLike = useCallback(async () => {
      await handleSwipe("right");
    }, [handleSwipe]);

    const handleBoost = useCallback(() => {
      // Boost is handled internally by the SwipeActionButtons component
      // This is just a placeholder to trigger any UI updates if needed
      console.log('[SwipeInterface] Boost activated');
    }, []);

    const handleRewind = useCallback((rewindedProfileId?: string) => {
      if (onRewind) {
        console.log('[SwipeInterface] Rewind requested for profile:', rewindedProfileId);
        
        // Show rewind feedback
        showFeedback("rewind", "rewind-action");

        // Call the parent's rewind handler with the rewound profile ID
        onRewind(rewindedProfileId);
        
        // Force reset to first card after a small delay to ensure profiles are updated
        setTimeout(() => {
          console.log('[SwipeInterface] Resetting to first card after rewind');
          setCurrentIndex(0);
        }, 100);
      }
    }, [onRewind, showFeedback]);

    if (users.length === 0 || currentIndex >= users.length) {
      return (
        <div className="w-full h-full flex items-center justify-center px-4">
          <div className="w-full max-w-md text-center">
            <div className="mb-4 flex justify-center">
              <HeartCrack className="w-12 h-12 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              {t("noMoreProfiles")}
            </h2>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {t("checkBackLater")}
            </p>
            <button
              onClick={() => setCurrentIndex(0)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {t("refresh")}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col">
        {/* Main content area with fixed height and scrolling */}
        <div className="flex-1 w-full overflow-y-auto">
          <div className="w-full max-w-md mx-auto h-full flex flex-col">
            {/* Card container with fixed aspect ratio */}
            <div className="relative w-full flex-1 flex items-center justify-center p-2">
              <div className="relative w-full h-0 pb-[133.33%] max-h-[70vh]">
                <div className="absolute inset-0 flex items-center justify-center">
                  {stackCards.map((user, index) => {
              const isCurrentCard = index === 0;
              const zIndex = stackCards.length - index + 10;
              const scale = 1 - index * 0.03;
              const translateY = index * 6;
              const opacity = index === 0 ? 1 : 0;
              const blur = index > 0 ? "blur(0.5px)" : "none";
              const pointerEvents = isCurrentCard ? "auto" : "none";

              // Enhanced performance with preloading check
              const hasMainImageLoaded =
                user.photos && user.photos.length > 0
                  ? isImageLoaded(user.photos[0])
                  : true;

              return (
                <div
                  key={`${user.id}-${currentIndex}-${index}`}
                  className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                    index === 0 ? 'will-change-transform' : 'will-change-auto'
                  }`}
                  style={{
                    zIndex,
                    transform: `translateY(${translateY}px) scale(${scale})`,
                    opacity: hasMainImageLoaded ? opacity : opacity * 0.7,
                    filter: blur,
                    transition: index === 0 ? 'none' : 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    pointerEvents,
                  }}
                >
                  <SwipeCard
                    user={{
                      ...user,
                      verified: user.verified === true
                    }}
                    onSwipe={handleSwipe}
                    onSuperLike={handleSuperLike}
                    isInteractive={isCurrentCard}
                    onRewind={isCurrentCard ? handleRewind : undefined}
                  />
                </div>
                  );
                })}
                </div>
              </div>
            </div>
            
            {/* Fixed position action buttons at bottom - No background container */}
            <div className="sticky bottom-0 left-0 right-0 p-4">
              <SwipeActionButtons
                onPass={handlePass}
                onLike={handleLike}
                onSuperLike={handleSuperLike}
                onBoost={handleBoost}
                onRewind={handleRewind}
                isInteractive={true}
              />
            </div>
          </div>
        </div>
        

        {/* Interstitial Ad */}
        {showInterstitialAd && (
          <InterstitialAd
            onClose={() => setShowInterstitialAd(false)}
            onAdClosed={() => {
              // Track ad view
              const extendedWindow = window as ExtendedWindow;
              if (extendedWindow.trackEvent && typeof extendedWindow.trackEvent === 'function') {
                extendedWindow.trackEvent("ad_view", {
                  category: "ads",
                  ad_type: "interstitial",
                  placement: "swipe_interface",
                });
              }
            }}
          />
        )}

        {/* Action Feedback Overlay - Professional Card Animations */}
        {currentFeedback && (
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <div
              className={`
              transform transition-all duration-700 ease-out
              ${currentFeedback.type === "like" ? "animate-like-slide" : ""}
              ${currentFeedback.type === "pass" ? "animate-pass-slide" : ""}
              ${currentFeedback.type === "superlike" ? "animate-superlike-fly" : ""}
              ${currentFeedback.type === "rewind" ? "animate-rewind-spin" : ""}
            `}
              style={{
                animationFillMode: "forwards",
              }}
            >
              {currentFeedback.type === "like" && (
                <div className="flex items-center justify-center w-32 h-32 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                  </svg>
                </div>
              )}
              {currentFeedback.type === "pass" && (
                <div className="flex items-center justify-center w-32 h-32 bg-gradient-to-r from-red-400 to-rose-500 rounded-full shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
              )}
              {currentFeedback.type === "superlike" && (
                <div className="flex items-center justify-center w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
              )}
              {currentFeedback.type === "rewind" && (
                <div className="flex items-center justify-center w-32 h-32 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-full shadow-2xl">
                  <svg
                    className="w-16 h-16 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                    />
                  </svg>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  },
);

SwipeInterface.displayName = "SwipeInterface";

export { SwipeInterface };
