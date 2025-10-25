
import { Tables, TablesUpdate, TablesInsert } from '@/integrations/supabase/types';

// Extended Profile type to include photos
interface ExtendedProfileFields {
  photos?: string[] | null;
}

// Modern utility types for type-safe database operations
export type Profile = Tables<'profiles'> & ExtendedProfileFields;
export type ProfileUpdate = TablesUpdate<'profiles'>;
export type ProfileInsert = TablesInsert<'profiles'>;

// Sexual orientation types
export type SexualOrientation = 'heterosexual' | 'homosexual' | 'bisexual' | 'pansexual' | 'asexual';

// Interested in types (gender preference)
export type InterestedIn = 'men' | 'women' | 'both';

// Gender types
export type Gender = 'male' | 'female' | 'non-binary' | 'other';

// Modern TypeScript pattern: Onboarding fields extension
// Note: Only include fields that actually exist in the database schema
// birth_date, onboarding_completed, gender_locked, birth_date_locked are not in the schema
export type OnboardingFields = {
  // These fields were removed as they don't exist in the actual database schema
  // If these fields are needed, they must be added to the database migration first
};

// Modern utility type: Extended profile with type safety
export type ExtendedProfile = Profile & OnboardingFields & {
  distance?: number;
};

// Modern utility type: Type-safe profile updates with onboarding fields
export type ExtendedProfileUpdate = ProfileUpdate & OnboardingFields;

// Modern utility type: Type-safe profile inserts with onboarding fields
export type ExtendedProfileInsert = ProfileInsert & OnboardingFields;

export interface FilterOptions {
  ageRange?: [number, number];
  distance?: number;
  interests?: string[];
  gender?: 'men' | 'women' | 'everyone';
  userLocation?: { latitude: number; longitude: number };
  religion?: string;
  education?: string;
  occupation?: string;
  drinking?: 'never' | 'socially' | 'regularly';
  smoking?: 'never' | 'socially' | 'regularly';
  exercise?: 'never' | 'sometimes' | 'regularly' | 'daily';
  relationshipType?: 'casual' | 'serious' | 'marriage' | 'friendship';
  children?: 'none' | 'have_some' | 'want_some' | 'dont_want';
  // New orientation-related filters
  sexualOrientation?: SexualOrientation;
  interestedIn?: InterestedIn;
  lgbtqFriendly?: boolean;
}

export type ProfileWithDistance = Profile & { distance?: number };

// Profile setup form data interface
export interface ProfileSetupFormData {
  name: string;
  age: string;
  location: string;
  gender: Gender;
  photos: string[];
  bio: string;
  interests: string[];
  religion: string;
  relationship_type: string;
  // New orientation fields
  sexual_orientation: SexualOrientation;
  interested_in: InterestedIn;
}

// User preferences interface
export interface UserPreferences {
  min_age?: number;
  max_age?: number;
  max_distance?: number;
  show_me?: string;
  // New LGBTQ+ fields
  same_gender_enabled?: boolean;
  lgbtq_friendly?: boolean;
}
