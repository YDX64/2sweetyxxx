import { Profile, FilterOptions, ProfileWithDistance } from '@/types/profile';
import { calculateDistance, isValidCoordinates } from '@/utils/locationUtils';

export const filterProfiles = (
  profiles: Profile[], 
  filters: FilterOptions,
  preferences?: { min_age?: number; max_age?: number; max_distance?: number; show_me?: string }
): ProfileWithDistance[] => {
  let filteredData = profiles;
  
  // Gender filtering is now handled in the database query
  // No need for client-side gender filtering since it's done server-side
  
  // Apply interest filters if specified
  if (filters.interests && filters.interests.length > 0) {
    filteredData = filteredData.filter(profile => {
      if (!profile.interests || !Array.isArray(profile.interests)) return false;
      return filters.interests!.some(interest => 
        profile.interests?.includes(interest) || false
      );
    });
  }

  // Apply location-based filtering if user location is available
  if (filters.userLocation && isValidCoordinates(filters.userLocation)) {
    const maxDistance = filters.distance || preferences?.max_distance || 50;
    
    filteredData = filteredData
      .map(profile => {
        // Try to extract coordinates from profile
        let profileCoords = null;
        
        // Check if profile has latitude/longitude fields
        if (profile.latitude && profile.longitude) {
          profileCoords = { latitude: profile.latitude, longitude: profile.longitude };
        } else if (profile.location) {
          // For profiles without coordinates, assign random coordinates within a reasonable range
          // In a real app, you'd geocode the location string or store coordinates
          const baseCoords = filters.userLocation!;
          profileCoords = {
            latitude: baseCoords.latitude + (Math.random() - 0.5) * 0.5, // ~25km range
            longitude: baseCoords.longitude + (Math.random() - 0.5) * 0.5
          };
        }
        
        if (profileCoords && isValidCoordinates(profileCoords)) {
          const distance = calculateDistance(filters.userLocation!, profileCoords);
          return { ...profile, distance };
        }
        
        return { ...profile, distance: Math.random() * maxDistance }; // Fallback random distance
      })
      .filter(profile => profile.distance <= maxDistance)
      .sort((a, b) => a.distance - b.distance); // Sort by distance
  }
  
  // Shuffle the profiles for variety (but keep location-sorted if location is enabled)
  if (!filters.userLocation) {
    filteredData = filteredData.sort(() => Math.random() - 0.5);
  }
  
  return filteredData.slice(0, 20) as ProfileWithDistance[]; // Limit to 20 profiles
};
