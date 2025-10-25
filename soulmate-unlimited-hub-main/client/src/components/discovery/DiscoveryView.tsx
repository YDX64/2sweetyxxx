import { useState, useEffect } from "react";
import { MainContent } from "@/components/MainContent";
import { MatchModal } from "@/components/MatchModal";
import { MatchNotificationManager } from "@/components/MatchNotificationManager";
import { useProfiles } from "@/hooks/useProfiles";
import { useSwipeStats } from "@/hooks/useSwipeStats";
import { useAuth } from "@/hooks/useAuth";
import { ToastAction } from "@/components/ui/toast";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useLanguage } from "@/hooks/useLanguage";
import { ProfileWithDistance } from "@/types/profile";
import { toast } from "@/hooks/use-toast";
import { DiscoveryFilters as DiscoveryFiltersType } from "@/components/DiscoveryFilters";
import { useAnalytics } from "@/hooks/useAnalytics";
import { testSupabaseConnection } from "@/utils/testSupabase";
import { subscriptionService } from "@/services/subscriptionService";
import { useNavigate } from "react-router-dom";
import { rewindService } from "@/services/rewindService";
import { supabase } from "@/integrations/supabase/client";

export const DiscoveryView = () => {
  const { t } = useLanguage();
  const {
    profiles,
    setProfiles,
    loading: profilesLoading,
    swipeUser,
    superLikeUser,
    refetchProfiles,
  } = useProfiles();
  const { stats, updateStats } = useSwipeStats();
  const { user, userRole } = useAuth();
  const { latitude, longitude } = useGeolocation();
  const { trackSwipe, trackMatch, trackPageView } = useAnalytics();
  const navigate = useNavigate();
  const [showMatch, setShowMatch] = useState<ProfileWithDistance | null>(null);
  const [newMatches, setNewMatches] = useState<ProfileWithDistance[]>([]);
  const [discoveryFilters, setDiscoveryFilters] =
    useState<DiscoveryFiltersType>({
      ageRange: [18, 50],
      distance: 50,
      interests: [],
      gender: "everyone",
    });

  // Track page view and test Supabase connection
  useEffect(() => {
    trackPageView("discovery", {
      total_profiles: profiles.length,
      has_location: !!(latitude && longitude),
    });

    // Test Supabase connection for debugging
    testSupabaseConnection().then((result) => {
      console.log("Supabase connection test result:", result);
    });
  }, []);

  // Update filters with user location when available
  useEffect(() => {
    if (latitude && longitude) {
      const userLocation = { latitude, longitude };
      // Just refresh profiles, filters are handled internally
      refetchProfiles();
    }
  }, [latitude, longitude]);

  const handleSwipe = async (userId: string, direction: "left" | "right"): Promise<boolean> => {
    if (!user?.id || !userRole) return false;

    // Check subscription limits for likes
    if (direction === "right") {
      const limitCheck = await subscriptionService.checkAndRecordLike(
        user.id,
        userRole,
      );

      if (!limitCheck.allowed) {
        toast({
          title: t("dailyLimitReached"),
          description: t("upgradeLikesMessage", {
            limit: limitCheck.remainingUses || 0,
            tier: limitCheck.suggestedTier || "silver",
          }),
          variant: "destructive",
          action: (
            <ToastAction
              altText="Upgrade"
              onClick={() => navigate("/subscription")}
            >
              {t("upgrade")}
            </ToastAction>
          ),
        });
        return false;
      }
    }

    try {
      const isMatch = await swipeUser(userId, direction);

      // Update stats for successful swipe
      updateStats(direction === "right" ? "like" : "pass");

      // Track swipe action
      trackSwipe(direction, userId);

      if (isMatch && direction === "right") {
        const matchedUser = profiles.find((p) => p.id === userId);
        if (matchedUser) {
          setShowMatch(matchedUser);
          setNewMatches((prev) => [...prev, matchedUser]);
          updateStats("match");

          // Track match event
          trackMatch(userId);

          toast({
            title: t("newMatch"),
            description: t("youHaveANewMatch"),
            duration: 3000,
          });
        }
      }
      return true;
    } catch (error) {
      console.error('[DiscoveryView] Swipe error:', error);
      toast({
        title: t("swipeFailed"),
        description: t("swipeErrorDescription"),
        variant: "destructive",
        duration: 5000,
      });
      return false;
    }
  };

  const handleSuperLike = async (userId: string): Promise<boolean> => {
    if (!user?.id || !userRole) return false;

    console.log('[DiscoveryView] SuperLike request for user:', userId);

    try {
      const isMatch = await superLikeUser(userId);
      console.log('[DiscoveryView] SuperLike result - isMatch:', isMatch);
      
      // Note: isMatch can be true (match), false (no match), or false (error)
      // We need to distinguish between successful SuperLike with no match vs actual error
      // The swipeService should return false only on actual errors, not when no match is found
      
      if (isMatch !== false) {
        // SuperLike was successful
        updateStats("superLike");

        if (isMatch === true) {
          // It's a match!
          const matchedUser = profiles.find((p) => p.id === userId);
          if (matchedUser) {
            console.log('[DiscoveryView] SuperLike resulted in match with:', matchedUser.name);
            setShowMatch(matchedUser);
            setNewMatches((prev) => [...prev, matchedUser]);
            updateStats("match");
            trackMatch(userId);
          }
        }

        toast({
          title: t("superLikeSent"),
          description: t("superLikeSuccess"),
          duration: 3000,
        });
        return true;
      } else {
        console.warn('[DiscoveryView] SuperLike failed - service returned false');
        toast({
          title: t("superLikeFailed"),
          description: t("superLikeErrorDescription"),
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('[DiscoveryView] SuperLike error:', error);
      toast({
        title: t("superLikeFailed"),
        description: t("superLikeErrorDescription"),
        variant: "destructive",
      });
      return false;
    }
  };

  const handleMatchSeen = (userId: string) => {
    setNewMatches((prev) => prev.filter((match) => match.id !== userId));
  };

  const handleRefresh = () => {
    const filtersWithLocation =
      latitude && longitude
        ? { ...discoveryFilters, userLocation: { latitude, longitude } }
        : discoveryFilters;

    // Update filters state and refresh
    setDiscoveryFilters(filtersWithLocation);
    refetchProfiles();
  };

  const handleRewind = async (rewindedProfileId?: string) => {
    if (!rewindedProfileId) {
      console.log('[DiscoveryView] No rewindedProfileId provided');
      return;
    }

    try {
      console.log('[DiscoveryView] Restoring rewound profile to deck:', rewindedProfileId);
      console.log('[DiscoveryView] Current profiles before rewind:', profiles.map(p => p.name));
      
      // Fetch the rewound profile immediately 
      const { data: rewindedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', rewindedProfileId)
        .single();

      console.log('[DiscoveryView] Fetched rewound profile:', rewindedProfile?.name);

      if (rewindedProfile) {
        // Add the rewound profile to the FRONT of the current profiles
        // Remove it first if it already exists to prevent duplicates
        setProfiles(currentProfiles => {
          const filtered = currentProfiles.filter(p => p.id !== rewindedProfileId);
          const newProfiles = [rewindedProfile, ...filtered];
          console.log('[DiscoveryView] New profiles after rewind:', newProfiles.map(p => p.name));
          return newProfiles;
        });
        console.log('[DiscoveryView] Rewound profile added to front of deck');
      }
    } catch (error) {
      console.error("Profile restoration error after rewind:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <MainContent
        profiles={profiles}
        profilesLoading={profilesLoading}
        stats={stats}
        onSwipe={handleSwipe}
        onSuperLike={handleSuperLike}
        onRefresh={handleRefresh}
        onRewind={handleRewind}
      />

      {/* Match Modal */}
      {showMatch && (
        <MatchModal user={showMatch} onClose={() => setShowMatch(null)} />
      )}

      {/* Match Notifications */}
      <MatchNotificationManager
        newMatches={newMatches}
        onMatchSeen={handleMatchSeen}
      />
    </div>
  );
};
