import { Button } from "@/components/ui/button";
import { Heart, X, Star, Zap, RotateCcw, Rocket } from "lucide-react";
import { useSwipeLimits } from "@/hooks/useSwipeLimits";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import { boostService } from "@/services/boostService";
import { rewindService } from "@/services/rewindService";
import { useAuth } from "@/hooks/useAuth";
import { useActionButtonFeedback } from "@/hooks/useSwipeFeedback";
import { useState, useEffect } from "react";

interface SwipeActionButtonsProps {
  onPass: () => void;
  onLike: () => void;
  onSuperLike: () => void;
  onBoost?: () => void;
  isInteractive?: boolean;
  onSwipe?: (direction: "left" | "right") => void;
  onRewind?: (rewindedProfileId?: string) => void;
}

export const SwipeActionButtons = ({
  onPass,
  onLike,
  onSuperLike,
  onBoost,
  isInteractive = true,
  onSwipe,
  onRewind,
}: SwipeActionButtonsProps) => {
  const swipeLimits = useSwipeLimits();
  const { subscribed: isPremium } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Button feedback system
  const { pressedButton, showButtonPress } = useActionButtonFeedback();

  // Feature gates
  const boostGate = useFeatureGate("profileBoost"); // Changed from monthlyBoosts to profileBoost
  const rewindGate = useFeatureGate("rewindFeature");
  
  // Debug logging for rewind
  console.log('[SwipeActionButtons] Rewind gate:', {
    hasAccess: rewindGate.hasAccess,
    requiresUpgrade: rewindGate.requiresUpgrade,
    requiredTier: rewindGate.requiredTier,
    onRewindProvided: !!onRewind,
    shouldShowButton: rewindGate.hasAccess && !!onRewind
  });

  // Loading states
  const [isBoostLoading, setIsBoostLoading] = useState(false);
  const [isRewindLoading, setIsRewindLoading] = useState(false);

  // Button states
  const [canLike, setCanLike] = useState(true);
  const [canSuperLike, setCanSuperLike] = useState(true);

  // Update button states when limits change
  useEffect(() => {
    const updateButtonStates = async () => {
      if (swipeLimits.isInitialized) {
        const likeResult = await swipeLimits.canPerformLike();
        const superLikeResult = await swipeLimits.canPerformSuperLike();
        setCanLike(likeResult.allowed);
        setCanSuperLike(superLikeResult.allowed);
      }
    };

    updateButtonStates();
  }, [
    swipeLimits.isInitialized,
    swipeLimits.remainingLikes,
    swipeLimits.remainingSuperLikes,
  ]);

  const handleLike = async () => {
    console.log('[SwipeActionButtons] Like button clicked');
    
    // Check limits first
    try {
      const canLikeResult = await swipeLimits.canPerformLike();
      console.log('[SwipeActionButtons] Can perform like check:', canLikeResult);
      
      if (!canLikeResult.allowed && !isPremium) {
        toast({
          title: t("limit.title.dailyLikes"),
          description: t(
            canLikeResult.reason || "limit.description.upgradeLikes",
          ),
          variant: "destructive",
          action: (
            <Button
              size="sm"
              onClick={() => navigate("/upgrades")}
              className="bg-gradient-to-r from-pink-500 to-red-500 text-white"
            >
              {t("upgradeToPremiumText")}
            </Button>
          ),
        });
        return;
      }
    } catch (limitError) {
      console.warn('[SwipeActionButtons] Limit check failed, proceeding anyway:', limitError);
    }

    // Show button press feedback
    showButtonPress("like");

    // Try to record the like usage, but proceed even if it fails
    try {
      console.log('[SwipeActionButtons] Recording like usage...');
      const recorded = await swipeLimits.recordLike();
      console.log('[SwipeActionButtons] Like recording result:', recorded);
      
      if (recorded) {
        console.log('[SwipeActionButtons] Like recorded successfully, executing swipe');
        onLike();
        onSwipe?.("right");
      } else {
        console.warn('[SwipeActionButtons] Like recording failed, but proceeding with swipe');
        onLike();
        onSwipe?.("right");
      }
    } catch (recordError) {
      console.error('[SwipeActionButtons] Like recording threw error, but proceeding with swipe:', recordError);
      // Proceed with like anyway to ensure functionality
      onLike();
      onSwipe?.("right");
    }
  };

  const handlePass = () => {
    // Show button press feedback
    showButtonPress("pass");

    onPass();
    onSwipe?.("left");
  };

  const handleSuperLike = async () => {
    if (!user?.id) return;
    
    console.log('[SwipeActionButtons] SuperLike button pressed');
    console.log('[SwipeActionButtons] Current user info:', {
      userId: user.id,
      isPremium,
      swipeLimitsInitialized: swipeLimits.isInitialized,
      canSuperLike,
      remainingSuperLikes: swipeLimits.remainingSuperLikes
    });
    
    // Check subscription limits for super likes
    const canSuperLikeResult = await swipeLimits.canPerformSuperLike();
    console.log('[SwipeActionButtons] SuperLike limit check:', canSuperLikeResult);
    
    if (!canSuperLikeResult.allowed) {
      toast({
        title: t("limit.title.dailySuperLikes"),
        description: t(
          canSuperLikeResult.reason || "limit.description.upgradeSuperLikes",
        ),
        variant: "destructive",
        action: (
          <Button
            size="sm"
            onClick={() => navigate("/subscription")}
            className="bg-gradient-to-r from-pink-500 to-red-500 text-white"
          >
            {t("upgrade")}
          </Button>
        ),
      });
      return;
    }

    // Show button press feedback
    showButtonPress("superlike");

    try {
      // Record the super like usage first
      await swipeLimits.recordSuperLike();
      console.log('[SwipeActionButtons] SuperLike usage recorded');
      
      // Execute the super like
      onSuperLike();
    } catch (error) {
      console.error('[SwipeActionButtons] SuperLike recording error:', error);
      
      // Log the SuperLike error with detailed context
      import('@/services/logService').then(({ logService }) => {
        logService.error('USER_ACTION', 'SuperLike operation failed', {
          error: error instanceof Error ? error.message : error,
          stack: error instanceof Error ? error.stack : undefined,
          userId: user.id,
          userEmail: user.email,
          canSuperLike,
          remainingSuperLikes: swipeLimits.remainingSuperLikes,
          isPremium,
          isConstraintError: error instanceof Error && error.message.includes('constraint'),
          isDuplicateError: error instanceof Error && (error.message.includes('duplicate') || error.message.includes('409')),
          timestamp: new Date().toISOString()
        });
      });
      
      toast({
        title: t("superLikeFailed"),
        description: t("superLikeErrorDescription"),
        variant: "destructive",
      });
    }
  };

  const handleBoost = async () => {
    if (!boostGate.hasAccess) {
      boostGate.showUpgradeDialog();
      return;
    }

    if (!user) return;

    setIsBoostLoading(true);
    try {
      const result = await boostService.activateBoost("profile", 30);

      if (result.success) {
        toast({
          title: t("boost.success.title"),
          description: t("boost.success.description"),
          variant: "default",
        });
        onBoost?.();
      } else {
        toast({
          title: t("boost.failed.title"),
          description: t(result.message || "boost.failed.description"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Boost error:", error);
      toast({
        title: t("boost.error.title"),
        description: t("boost.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsBoostLoading(false);
    }
  };

  const handleRewind = async () => {
    if (!rewindGate.hasAccess) {
      rewindGate.showUpgradeDialog();
      return;
    }

    if (!user) return;

    // Show button press feedback
    showButtonPress("rewind");

    setIsRewindLoading(true);
    try {
      const result = await rewindService.rewindLastSwipe(user.id);

      if (result.success) {
        toast({
          title: t("rewind.success.title"),
          description: t("rewind.success.description"),
          variant: "default",
        });
        // Pass the rewound profile ID to trigger immediate restoration
        onRewind?.(result.rewindedSwipe?.target_user_id);
      } else {
        toast({
          title: t("rewind.failed.title"),
          description: t(result.message || "rewind.failed.description"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Rewind error:", error);
      toast({
        title: t("rewind.error.title"),
        description: t("rewind.error.description"),
        variant: "destructive",
      });
    } finally {
      setIsRewindLoading(false);
    }
  };

  if (!isInteractive) {
    return null;
  }

  return (
    <div className="relative w-full mx-auto">
      {/* Modern Action Buttons Container - Clean and responsive design */}
      <div
        className="flex justify-center items-center gap-3 sm:gap-4 py-2"
      >
        {/* Rewind Button (Premium Feature) - Show for all users */}
        {onRewind && (
          <button
            onClick={handleRewind}
            disabled={isRewindLoading}
            aria-label="Rewind last swipe"
            className={`flex-shrink-0 aspect-square w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md border border-blue-200 dark:border-blue-600/50 hover:scale-110 hover:shadow-lg transition-all duration-200 flex items-center justify-center group hover:bg-blue-50 dark:hover:bg-blue-900/30 active:scale-95 disabled:opacity-50 ${pressedButton === "rewind" ? "scale-90" : ""} ${!rewindGate.hasAccess ? "opacity-75" : ""}`}
          >
            <RotateCcw
              className={`w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors ${isRewindLoading ? "animate-spin" : ""}`}
            />
            {!rewindGate.hasAccess && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            )}
          </button>
        )}

        {/* Pass Button */}
        <button
          onClick={handlePass}
          aria-label="Pass this profile"
          className="flex-shrink-0 aspect-square w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-md border border-gray-200 dark:border-gray-600/50 hover:scale-110 hover:shadow-lg transition-all duration-200 flex items-center justify-center group hover:bg-white dark:hover:bg-gray-700/50 active:scale-95"
        >
          <X className="w-6 h-6 sm:w-7 sm:h-7 text-gray-500 dark:text-gray-300 group-hover:text-gray-700 dark:group-hover:text-gray-100 transition-colors" />
        </button>

        {/* Like Button - Central */}
        <button
          onClick={handleLike}
          aria-label="Like this profile"
          className={`flex-shrink-0 aspect-square w-16 h-16 sm:w-20 sm:h-20 rounded-full shadow-lg hover:scale-110 transition-all duration-200 flex items-center justify-center group active:scale-95 relative ${
            !canLike && !isPremium
              ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
              : "bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 hover:shadow-pink-500/30"
          } ${pressedButton === "like" ? "scale-90" : ""}`}
        >
          <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-110 transition-transform" />
          {!canLike && !isPremium && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          )}
        </button>

        {/* Super Like Button */}
        <button
          onClick={handleSuperLike}
          aria-label="Super like this profile"
          className={`flex-shrink-0 aspect-square w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md hover:scale-110 transition-all duration-200 flex items-center justify-center group active:scale-95 relative ${
            !canSuperLike && !isPremium
              ? "bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600"
              : "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 hover:shadow-blue-500/30"
          } ${pressedButton === "superlike" ? "scale-90" : ""}`}
        >
          <Star className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          {!canSuperLike && !isPremium && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">+</span>
            </div>
          )}
        </button>

        {/* Boost Button (Premium Feature) - Show for all users */}
        {onBoost && (
          <button
            onClick={handleBoost}
            disabled={isBoostLoading}
            aria-label="Boost your profile"
            className={`flex-shrink-0 aspect-square w-12 h-12 sm:w-14 sm:h-14 rounded-full shadow-md hover:scale-110 transition-all duration-200 flex items-center justify-center group active:scale-95 relative overflow-hidden ${
              isBoostLoading
                ? "bg-gray-300 dark:bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 hover:shadow-purple-500/30"
            } ${!boostGate.hasAccess ? "opacity-75" : ""}`}
          >
            <Rocket
              className={`w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform ${isBoostLoading ? "animate-pulse" : ""}`}
            />
            {!boostGate.hasAccess && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">+</span>
              </div>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
