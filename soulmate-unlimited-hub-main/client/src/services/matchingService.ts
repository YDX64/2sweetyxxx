import { supabase } from '@/integrations/supabase/client';
import { Profile, SexualOrientation, InterestedIn, FilterOptions } from '@/types/profile';
import { calculateDistance } from '@/utils/locationUtils';

// Type definitions - Modern TypeScript utility types approach
export interface MatchScore {
  userId: string;
  score: number;
  reasons: string[];
  compatibilityLevel: 'high' | 'medium' | 'low';
}

export interface OrientationCompatibility {
  isCompatible: boolean;
  reason: string;
}

// Modern TypeScript utility type for compatibility scores
type CompatibilityResult = {
  score: number;
  reason: string | null;
};

// Type-safe gender preference checker with normalization
function checkGenderPreference(interestedIn: InterestedIn, targetGender: string): boolean {
  // Normalize gender values to handle both formats
  const normalizedGender = targetGender.toLowerCase();
  
  switch (interestedIn) {
    case 'both':
      return true;
    case 'men':
      // Handle both 'men' and 'male' formats
      return normalizedGender === 'men' || normalizedGender === 'male' || normalizedGender === 'man';
    case 'women':
      // Handle both 'women' and 'female' formats  
      return normalizedGender === 'women' || normalizedGender === 'female' || normalizedGender === 'woman';
    default:
      return false;
  }
}

// Type-safe compatibility reason generator
function getCompatibilityReason(
  userOrientation: SexualOrientation, 
  userGender: string, 
  userInterestedIn: InterestedIn,
  targetOrientation: SexualOrientation, 
  targetGender: string, 
  targetInterestedIn: InterestedIn
): string {
  // Modern conditional type pattern
  if (userOrientation === 'homosexual' && targetOrientation === 'homosexual' && userGender === targetGender) {
    return userGender === 'male' ? 'Gay erkek uyumluluğu' : 'Lesbian kadın uyumluluğu';
  }

  if (userOrientation === 'bisexual' || targetOrientation === 'bisexual') {
    return 'Bisexual uyumluluğu';
  }

  if (userOrientation === 'pansexual' || targetOrientation === 'pansexual') {
    return 'Pansexual uyumluluğu';
  }

  if (userOrientation === 'heterosexual' && targetOrientation === 'heterosexual' && userGender !== targetGender) {
    return 'Heterosexual uyumluluğu';
  }

  return 'Temel cinsiyet tercihi uyumluluğu';
}

// Core orientation compatibility checker - Type guard pattern
function checkOrientationCompatibility(
  userProfile: Profile,
  targetProfile: Profile
): OrientationCompatibility {
  const userOrientation = userProfile.sexual_orientation;
  const userInterestedIn = userProfile.interested_in;
  const userGender = userProfile.gender;
  
  const targetOrientation = targetProfile.sexual_orientation;
  const targetInterestedIn = targetProfile.interested_in;
  const targetGender = targetProfile.gender;

  // Handle null/undefined values
  if (!userGender || !targetGender || !userInterestedIn || !targetInterestedIn) {
    if (import.meta.env.DEV) {
      console.log('Missing required fields for orientation compatibility:', {
        userGender,
        targetGender,
        userInterestedIn,
        targetInterestedIn
      });
    }
    return { isCompatible: false, reason: 'Eksik profil bilgileri' };
  }

  const userWantsTarget = checkGenderPreference(userInterestedIn, targetGender);
  const targetWantsUser = checkGenderPreference(targetInterestedIn, userGender);
  const isCompatible = userWantsTarget && targetWantsUser;

  // Debug logging for orientation compatibility
  if (import.meta.env.DEV) {
    console.log('Orientation compatibility check:', {
      user: { gender: userGender, interestedIn: userInterestedIn, orientation: userOrientation },
      target: { gender: targetGender, interestedIn: targetInterestedIn, orientation: targetOrientation },
      userWantsTarget,
      targetWantsUser,
      isCompatible
    });
  }

  if (!isCompatible) {
    const reason = !userWantsTarget && !targetWantsUser
      ? 'Karşılıklı cinsiyet tercihi uyumsuzluğu'
      : !userWantsTarget
      ? 'Kullanıcı bu cinsiyeti aramıyor'
      : 'Hedef kişi kullanıcının cinsiyetini aramıyor';
    
    return { isCompatible: false, reason };
  }

  const compatibilityReason = getCompatibilityReason(
    userOrientation || 'heterosexual', userGender, userInterestedIn,
    targetOrientation || 'heterosexual', targetGender, targetInterestedIn
  );

  return { isCompatible: true, reason: compatibilityReason };
}

// Age compatibility calculator with explicit return type
function calculateAgeCompatibility(userProfile: Profile, targetProfile: Profile): CompatibilityResult {
  const userAge = userProfile.age ?? 25;
  const targetAge = targetProfile.age ?? 25;
  const ageDiff = Math.abs(userAge - targetAge);

  if (ageDiff <= 2) return { score: 25, reason: 'Yaş çok yakın' };
  if (ageDiff <= 5) return { score: 15, reason: 'Benzer yaş aralığı' };
  if (ageDiff <= 10) return { score: 8, reason: 'Uyumlu yaş farkı' };
  if (ageDiff <= 15) return { score: 3, reason: 'Kabul edilebilir yaş farkı' };
  
  return { score: 0, reason: null };
}

// Interest compatibility calculator with type safety
function calculateInterestCompatibility(userProfile: Profile, targetProfile: Profile): CompatibilityResult {
  const userInterests = userProfile.interests;
  const targetInterests = targetProfile.interests;
  
  if (!userInterests?.length || !targetInterests?.length) {
    return { score: 0, reason: null };
  }

  const userInterestSet = new Set(userInterests);
  const commonInterests = targetInterests.filter(interest => userInterestSet.has(interest));
  
  if (commonInterests.length === 0) {
    return { score: 0, reason: null };
  }

  const interestScore = Math.min(30, commonInterests.length * 8);
  const reason = `${commonInterests.length} ortak ilgi: ${commonInterests.slice(0, 3).join(', ')}`;
  
  return { score: interestScore, reason };
}

// Location compatibility with type narrowing
function calculateLocationCompatibility(
  userProfile: Profile,
  targetProfile: Profile,
  userLocation?: { latitude: number; longitude: number }
): CompatibilityResult {
  // Type guard pattern
  if (!userLocation || 
      typeof targetProfile.latitude !== 'number' || 
      typeof targetProfile.longitude !== 'number') {
    return { score: 0, reason: null };
  }

  const distance = calculateDistance(
    userLocation,
    { latitude: targetProfile.latitude, longitude: targetProfile.longitude }
  );
  
  if (distance <= 5) return { score: 20, reason: 'Çok yakın mesafe' };
  if (distance <= 15) return { score: 15, reason: 'Yakın lokasyon' };
  if (distance <= 30) return { score: 10, reason: 'Aynı bölge' };
  if (distance <= 50) return { score: 5, reason: 'Makul mesafe' };
  
  return { score: 0, reason: null };
}

// Profile quality calculator with explicit typing
function calculateProfileQuality(targetProfile: Profile): CompatibilityResult {
  let qualityScore = 0;
  const reasons: string[] = [];

  if (targetProfile.bio && targetProfile.bio.length > 20) {
    qualityScore += 3;
    reasons.push('detaylı bio');
  }
  
  if (targetProfile.photos && targetProfile.photos.length >= 3) {
    qualityScore += 4;
    reasons.push('çoklu fotoğraf');
  }
  
  if (targetProfile.interests && targetProfile.interests.length >= 3) {
    qualityScore += 3;
    reasons.push('çeşitli ilgi alanları');
  }

  const reason = reasons.length > 0 ? `Kaliteli profil: ${reasons.join(', ')}` : null;
  return { score: qualityScore, reason };
}

// Main compatibility score calculator - Modern async pattern
async function calculateCompatibilityScore(
  userProfile: Profile,
  targetProfile: Profile,
  userLocation?: { latitude: number; longitude: number }
): Promise<MatchScore> {
  // Type-safe initial values
  let score = 0;
  const reasons: string[] = [];

  // Orientation compatibility check - KO factor
  const orientationCheck = checkOrientationCompatibility(userProfile, targetProfile);
  if (!orientationCheck.isCompatible) {
    return {
      userId: targetProfile.id,
      score: 0,
      reasons: [orientationCheck.reason],
      compatibilityLevel: 'low' as const
    };
  }
  
  reasons.push(orientationCheck.reason);

  // Modern TypeScript - calculate all compatibility scores
  const ageScore = calculateAgeCompatibility(userProfile, targetProfile);
  const interestScore = calculateInterestCompatibility(userProfile, targetProfile);
  const locationScore = calculateLocationCompatibility(userProfile, targetProfile, userLocation);
  const qualityScore = calculateProfileQuality(targetProfile);

  // Accumulate scores with type safety
  score += ageScore.score;
  score += interestScore.score;
  score += locationScore.score;
  score += qualityScore.score;

  // Add reasons with null checking
  [ageScore, interestScore, locationScore, qualityScore].forEach(result => {
    if (result.reason) reasons.push(result.reason);
  });

  // Type-safe compatibility level determination
  const compatibilityLevel: MatchScore['compatibilityLevel'] = 
    score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low';

  return {
    userId: targetProfile.id,
    score: Math.min(100, score),
    reasons,
    compatibilityLevel
  };
}

// Smart matches with modern TypeScript patterns
async function getSmartMatches(
  userProfile: Profile,
  userLocation?: { latitude: number; longitude: number },
  filters: FilterOptions = {},
  limit: number = 20
): Promise<Profile[]> {
  try {
    // Parallel data fetching - ALWAYS get fresh data for rewind compatibility
    const [swipesResponse, blocksResponse] = await Promise.all([
      supabase
        .from('swipes')
        .select('target_user_id')
        .eq('user_id', userProfile.id),
      supabase
        .from('user_blocks')
        .select('blocked_user_id')
        .eq('blocker_id', userProfile.id)
    ]);
    
    const swipedUserIds = swipesResponse.data?.map(s => s.target_user_id) ?? [];
    const blockedUserIds = blocksResponse.data?.map(b => b.blocked_user_id) ?? [];
    const excludedIds = [...swipedUserIds, ...blockedUserIds];
    
    if (import.meta.env.DEV) {
      console.log(`[getSmartMatches] Excluded ${swipedUserIds.length} swiped users and ${blockedUserIds.length} blocked users`);
    }

    // Fetch essential fields including photos
    const { data: allProfiles, error } = await supabase
      .from('profiles')
      .select('id, name, age, gender, interested_in, sexual_orientation, bio, interests, location, latitude, longitude, subscription_tier, is_banned, created_at, updated_at, photos')
      .neq('id', userProfile.id)
      .not('name', 'is', null)
      .not('age', 'is', null)
      .not('gender', 'is', null)
      .not('interested_in', 'is', null)
      .limit(25);

    if (error || !allProfiles) {
      console.error('Error fetching profiles:', error);
      return [];
    }

    if (import.meta.env.DEV) {
      console.log(`getSmartMatches: Fetched ${allProfiles.length} total profiles from database`);
    }

    // Modern filtering with type guards
    const compatibleProfiles = allProfiles.filter((profile): profile is Profile => {
      // Type guard for excluded users
      if (excludedIds.includes(profile.id)) return false;

      // Age filter with type safety
      if (filters.ageRange && profile.age) {
        const [minAge, maxAge] = filters.ageRange;
        if (profile.age < minAge || profile.age > maxAge) return false;
      }

      // Gender preference filter
      if (userProfile.interested_in && userProfile.interested_in !== 'both') {
        // Check both formats (men/women and male/female)
        if (!profile.gender || !checkGenderPreference(userProfile.interested_in, profile.gender)) {
          if (import.meta.env.DEV) {
            console.log(`Gender preference filter: User wants ${userProfile.interested_in}, profile is ${profile.gender} - REJECTED`);
          }
          return false;
        }
      }

      // Orientation compatibility - safely handle partial profile
      const compatibility = checkOrientationCompatibility(userProfile, profile as Profile);
      if (!compatibility.isCompatible) {
        if (import.meta.env.DEV) {
          console.log(`Orientation compatibility filter: ${compatibility.reason} - REJECTED`);
        }
      }
      return compatibility.isCompatible;
    });

    if (import.meta.env.DEV) {
      console.log(`getSmartMatches: ${compatibleProfiles.length} profiles passed all filters`);
    }

    // Score and sort profiles with type safety
    const scoredProfiles = await Promise.all(
      compatibleProfiles.map(async (profile) => {
        const matchScore = await calculateCompatibilityScore(userProfile, profile, userLocation);
        return { profile, score: matchScore.score };
      })
    );

    // Sort by score and return limited results
    return scoredProfiles
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.profile);

  } catch (error) {
    console.error('Error in getSmartMatches:', error);
    return [];
  }
}

// Quick compatibility check with type safety
async function quickCompatibilityCheck(userProfile: Profile, targetProfile: Profile): Promise<boolean> {
  const compatibility = checkOrientationCompatibility(userProfile, targetProfile);
  return compatibility.isCompatible;
}

// Modern TypeScript service export - no recursive inference issues
export const matchingService = {
  // Core functions
  checkOrientationCompatibility,
  checkGenderPreference,
  getCompatibilityReason,
  
  // Compatibility calculators
  calculateCompatibilityScore,
  calculateAgeCompatibility,
  calculateInterestCompatibility,
  calculateLocationCompatibility,
  calculateProfileQuality,
  
  // Main service functions
  getSmartMatches,
  quickCompatibilityCheck
} as const;

// Type-safe service type for external use
export type MatchingService = typeof matchingService;
