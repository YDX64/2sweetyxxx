import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { 
  SexualOrientation, 
  InterestedIn, 
  ExtendedProfileUpdate 
} from '@/types/profile';

interface OnboardingFormData {
  name: string;
  birth_date: string;
  gender: string;
  sexual_orientation: SexualOrientation;
  interested_in: InterestedIn;
  relationship_type: string;
  photos: string[];
}

// Modern TypeScript utility for age calculation
const calculateAge = (birthDate: string): number => {
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
};

// Map onboarding relationship types to database constraint values
const mapRelationshipType = (type: string): string => {
  const mapping: Record<string, string> = {
    'long_term': 'serious',
    'long_term_open_to_short': 'serious',
    'short_term_open_to_long': 'casual',
    'short_term_fun': 'casual',
    'new_friends': 'friendship',
    'still_figuring_out': 'casual'
  };
  return mapping[type] || 'casual';
};

// Modern TypeScript utility: Transform onboarding data to profile update
// Only include fields that exist in the actual database schema
const transformOnboardingToProfile = (data: OnboardingFormData): ExtendedProfileUpdate => {
  return {
    name: data.name,
    age: calculateAge(data.birth_date),
    gender: data.gender,
    sexual_orientation: data.sexual_orientation,
    interested_in: data.interested_in,
    relationship_type: mapRelationshipType(data.relationship_type),
    photos: data.photos
    // Note: Removed birth_date, onboarding_completed, gender_locked, birth_date_locked
    // as these fields don't exist in the actual database schema
  };
};

export const useOnboardingLogic = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfiles();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<OnboardingFormData>({
    name: '',
    birth_date: '',
    gender: '',
    sexual_orientation: 'heterosexual',
    interested_in: 'both',
    relationship_type: '',
    photos: []
  });

  // Modern useEffect pattern: Load existing partial data
  useEffect(() => {
    if (user?.user_metadata?.onboarding_progress) {
      setFormData(prev => ({
        ...prev,
        ...user.user_metadata.onboarding_progress
      }));
    }
  }, [user]);

  // Modern useCallback pattern: Type-safe form data updates
  const updateFormData = useCallback((
    field: keyof OnboardingFormData, 
    value: string | string[] | SexualOrientation | InterestedIn
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Modern async pattern: Progress saving with error handling
  const saveProgress = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      // Modern pattern: Save progress to user metadata (optional)
      // This can be implemented later if needed
      console.log('Saving onboarding progress:', formData);
    } catch (error) {
      console.error('Error saving progress:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, formData]);

  // Modern async pattern: Type-safe onboarding completion
  const completeOnboarding = useCallback(async () => {
    if (!user) {
      console.error('No user found during onboarding completion');
      throw new Error('User not authenticated');
    }
    
    try {
      setIsLoading(true);
      
      // Modern utility: Transform with type safety
      console.log('Onboarding completion - Raw form data:', formData);
      const profileUpdate = transformOnboardingToProfile(formData);
      console.log('Onboarding completion - Transformed profile update data:', profileUpdate);
      console.log('Onboarding completion - Relationship type mapping:', formData.relationship_type, '->', profileUpdate.relationship_type);
      
      // Modern error handling: Validate age
      if (profileUpdate.age && (profileUpdate.age < 18 || profileUpdate.age > 100)) {
        throw new Error('Age must be between 18 and 100 years');
      }
      
      // Type-safe profile update with extended fields
      const updateSuccess = await updateProfile(profileUpdate);
      
      if (!updateSuccess) {
        throw new Error('Failed to update profile during onboarding');
      }
      
      console.log('Onboarding completed successfully');
      
      // Wait a bit to ensure database consistency
      await new Promise(resolve => setTimeout(resolve, 500));
      
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, formData, updateProfile]);

  const canProceed = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;
      case 2:
        return formData.birth_date !== '' && isValidBirthDate(formData.birth_date);
      case 3:
        return formData.gender !== '';
      case 4:
        return formData.sexual_orientation !== 'heterosexual' || formData.sexual_orientation === 'heterosexual';
      case 5:
        return true; // interested_in always has a default value
      case 6:
        return formData.relationship_type !== '';
      case 7:
        return formData.photos.length >= 1;
      default:
        return false;
    }
  };

  const isValidBirthDate = (dateString: string): boolean => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    
    // Must be between 18 and 100 years old
    return age >= 18 && age <= 100 && date < today;
  };

  return {
    formData,
    updateFormData,
    saveProgress,
    completeOnboarding,
    isLoading,
    canProceed
  };
};
