import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuth } from "@/hooks/useAuth";

interface SwipeStats {
  likes: number;
  passes: number;
  superLikes: number;
  matches: number;
}

export const useSwipeStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SwipeStats>({
    likes: 0,
    passes: 0,
    superLikes: 0,
    matches: 0,
  });

  // Memoize today's date string to prevent recalculation
  const today = useMemo(() => new Date().toDateString(), []);

  // Memoize localStorage keys
  const storageKeys = useMemo(
    () => ({
      date: "swipe_stats_date",
      stats: "swipe_stats",
    }),
    [],
  );

  useEffect(() => {
    // Reset stats daily (stored in localStorage for simplicity)
    const storedDate = localStorage.getItem(storageKeys.date);
    const storedStats = localStorage.getItem(storageKeys.stats);

    if (storedDate === today && storedStats) {
      try {
        setStats(JSON.parse(storedStats));
      } catch (error) {
        console.warn("Failed to parse stored stats:", error);
        // Reset to default if parsing fails
        const newStats = { likes: 0, passes: 0, superLikes: 0, matches: 0 };
        setStats(newStats);
        localStorage.setItem(storageKeys.date, today);
        localStorage.setItem(storageKeys.stats, JSON.stringify(newStats));
      }
    } else {
      // Reset for new day
      const newStats = { likes: 0, passes: 0, superLikes: 0, matches: 0 };
      setStats(newStats);
      localStorage.setItem(storageKeys.date, today);
      localStorage.setItem(storageKeys.stats, JSON.stringify(newStats));
    }
  }, [today, storageKeys]);

  // Optimize updateStats with useCallback and better type mapping
  const updateStats = useCallback(
    (type: "like" | "pass" | "superLike" | "match") => {
      setStats((prev) => {
        const typeMap = {
          like: "likes",
          pass: "passes",
          superLike: "superLikes",
          match: "matches",
        } as const;

        const key = typeMap[type];
        const newStats = {
          ...prev,
          [key]: prev[key] + 1,
        };

        // Use requestIdleCallback for localStorage writes to avoid blocking UI
        if ("requestIdleCallback" in window) {
          requestIdleCallback(() => {
            localStorage.setItem(storageKeys.stats, JSON.stringify(newStats));
          });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            localStorage.setItem(storageKeys.stats, JSON.stringify(newStats));
          }, 0);
        }

        return newStats;
      });
    },
    [storageKeys.stats],
  );

  return { stats, updateStats };
};
