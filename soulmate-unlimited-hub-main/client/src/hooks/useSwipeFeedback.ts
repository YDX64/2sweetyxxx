import React, { useState, useCallback, useRef } from "react";

interface SwipeFeedback {
  type: "like" | "pass" | "superlike" | "rewind";
  userId: string;
  timestamp: number;
}

interface UseSwipeFeedbackReturn {
  showFeedback: (type: SwipeFeedback["type"], userId: string) => void;
  currentFeedback: SwipeFeedback | null;
  playHapticFeedback: (type: SwipeFeedback["type"]) => void;
  playSoundEffect: (type: SwipeFeedback["type"]) => void;
}

export const useSwipeFeedback = (): UseSwipeFeedbackReturn => {
  const [currentFeedback, setCurrentFeedback] = useState<SwipeFeedback | null>(
    null,
  );
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const audioRef = useRef<{ [key: string]: HTMLAudioElement }>({});

  // Initialize audio elements
  const initializeAudio = useCallback(() => {
    if (typeof window === "undefined") return;

    const sounds = {
      like: "/sounds/like.mp3",
      pass: "/sounds/pass.mp3",
      superlike: "/sounds/superlike.mp3",
      rewind: "/sounds/rewind.mp3",
    };

    Object.entries(sounds).forEach(([key, src]) => {
      if (!audioRef.current[key]) {
        const audio = new Audio(src);
        audio.preload = "auto";
        audio.volume = 0.3; // 30% volume
        audioRef.current[key] = audio;
      }
    });
  }, []);

  // Play haptic feedback
  const playHapticFeedback = useCallback((type: SwipeFeedback["type"]) => {
    if (typeof window === "undefined" || !navigator.vibrate) return;

    const hapticPatterns = {
      like: [100], // Single vibration
      pass: [50], // Quick vibration
      superlike: [100, 50, 100, 50, 200], // Pattern for super like
      rewind: [80, 40, 80], // Double vibration
    };

    const pattern = hapticPatterns[type];
    if (pattern) {
      navigator.vibrate(pattern);
    }
  }, []);

  // Play sound effect
  const playSoundEffect = useCallback(
    (type: SwipeFeedback["type"]) => {
      if (typeof window === "undefined") return;

      // Initialize audio if not done yet
      if (Object.keys(audioRef.current).length === 0) {
        initializeAudio();
      }

      const audio = audioRef.current[type];
      if (audio) {
        // Reset audio to beginning and play
        audio.currentTime = 0;
        audio.play().catch(() => {
          // Silently fail if audio can't be played (autoplay restrictions)
        });
      }
    },
    [initializeAudio],
  );

  // Show visual feedback with gesture-based timing
  const showFeedback = useCallback(
    (type: SwipeFeedback["type"], userId: string) => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set new feedback
      setCurrentFeedback({
        type,
        userId,
        timestamp: Date.now(),
      });

      // Play effects
      playHapticFeedback(type);
      playSoundEffect(type);

      // Auto-hide feedback after animation - different timings for different gestures
      const animationDuration = {
        like: 700, // Slide right animation
        pass: 700, // Slide left animation
        superlike: 800, // Fly up animation
        rewind: 600, // Spin animation
      };

      timeoutRef.current = setTimeout(() => {
        setCurrentFeedback(null);
      }, animationDuration[type]);
    },
    [playHapticFeedback, playSoundEffect],
  );

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    showFeedback,
    currentFeedback,
    playHapticFeedback,
    playSoundEffect,
  };
};

// Hook for action button feedback
export const useActionButtonFeedback = () => {
  const [pressedButton, setPressedButton] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const showButtonPress = useCallback((buttonId: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setPressedButton(buttonId);

    // Haptic feedback for button press
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }

    timeoutRef.current = setTimeout(() => {
      setPressedButton(null);
    }, 200);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    pressedButton,
    showButtonPress,
  };
};

// Custom hook for swipe gesture feedback with direction-based animations
export const useSwipeGestureFeedback = () => {
  const [gestureState, setGestureState] = useState({
    isActive: false,
    direction: null as "left" | "right" | "up" | null,
    intensity: 0,
  });

  const updateGesture = useCallback(
    (
      isActive: boolean,
      direction: "left" | "right" | "up" | null = null,
      intensity: number = 0,
    ) => {
      setGestureState({ isActive, direction, intensity });

      // Progressive haptic feedback based on gesture direction and intensity
      if (isActive && intensity > 0.3 && navigator.vibrate) {
        const vibrationPattern = {
          left: [15], // Quick vibration for pass
          right: [25], // Stronger vibration for like
          up: [30, 10, 30], // Pattern for super like
        };

        const pattern = direction ? vibrationPattern[direction] || [20] : [20];
        navigator.vibrate(pattern);
      }
    },
    [],
  );

  const resetGesture = useCallback(() => {
    setGestureState({
      isActive: false,
      direction: null,
      intensity: 0,
    });
  }, []);

  // Trigger feedback based on gesture completion
  const triggerGestureComplete = useCallback(
    (direction: "left" | "right" | "up") => {
      const completionVibration = {
        left: [40], // Pass completion
        right: [60], // Like completion
        up: [40, 20, 60], // Super like completion
      };

      if (navigator.vibrate) {
        navigator.vibrate(completionVibration[direction]);
      }
    },
    [],
  );

  return {
    gestureState,
    updateGesture,
    resetGesture,
    triggerGestureComplete,
  };
};
