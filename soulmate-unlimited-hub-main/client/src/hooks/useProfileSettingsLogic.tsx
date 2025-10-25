import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { toast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "@/hooks/useLanguage";

export const useProfileSettingsLogic = () => {
  const { user } = useAuth();
  const { userProfile, updateProfile } = useProfiles();
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    age: 0,
    email: "",
    location: "",
    gender: "",
    bio: "",
    photos: [] as string[],
    interests: [] as string[],
    religion: "",
    languages: [] as string[],
    education: "",
    occupation: "",
    drinking: "",
    smoking: "",
    exercise: "",
    relationship_type: "",
    children: "none",
    height: "",
    zodiac_sign: "",
    verified: false
  });

  useEffect(() => {
    // console.log('ProfileSettings: User changed:', user);
    // console.log('ProfileSettings: UserProfile changed:', userProfile);
    
    if (userProfile) {
      // console.log('ProfileSettings: Setting form data from userProfile:', userProfile);
      setFormData({
        name: userProfile.name || "",
        age: userProfile.age || 0,
        email: userProfile.email || "",
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        bio: userProfile.bio || "",
        photos: userProfile.photos || [],
        interests: userProfile.interests || [],
        religion: userProfile.religion || "",
        languages: userProfile.languages || [],
        education: userProfile.education || "",
        occupation: userProfile.occupation || "",
        drinking: userProfile.drinking || "",
        smoking: userProfile.smoking || "",
        exercise: userProfile.exercise || "",
        relationship_type: userProfile.relationship_type || "",
        children: userProfile.children || "none",
        height: userProfile.height?.toString() || "",
        zodiac_sign: userProfile.zodiac_sign || "",
        verified: userProfile.verified || false
      });
      setLoading(false);
    } else if (user) {
      // console.log('ProfileSettings: No userProfile but user exists, keeping loading state');
      // Keep loading state if user exists but profile not loaded yet
    } else {
      // console.log('ProfileSettings: No user, setting loading to false');
      setLoading(false);
    }
  }, [userProfile, user]);

  useEffect(() => {
    // Check if edit mode should be enabled from URL
    const editParam = searchParams.get('edit');
    if (editParam === 'true') {
      setIsEditing(true);
      // Clear the edit parameter from URL to clean it up
      searchParams.delete('edit');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const handleInputChange = (field: string, value: string | string[] | number) => {
    // console.log('ProfileSettings: Input changed:', field, value);
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // console.log('ProfileSettings: New form data:', newData);
      return newData;
    });
    setHasChanges(true);
  };

  const toggleInterest = (interest: string) => {
    // console.log('ProfileSettings: Toggling interest:', interest);
    setFormData(prev => {
      const newInterests = prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest];
      // console.log('ProfileSettings: New interests:', newInterests);
      return { ...prev, interests: newInterests };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!user) {
      // console.error('ProfileSettings: No user found when trying to save');
      toast({
        title: t('error'),
        description: t('validation.userSessionNotFound'),
        variant: "destructive",
      });
      return;
    }

    console.log('ProfileSettings: Starting save process');
    console.log('ProfileSettings: Form data to save:', formData);

    try {
      const updateData = {
        name: formData.name,
        age: formData.age,
        email: formData.email,
        location: formData.location,
        gender: formData.gender,
        bio: formData.bio,
        photos: formData.photos,
        interests: formData.interests,
        religion: formData.religion || null,
        languages: formData.languages,
        education: formData.education || null,
        occupation: formData.occupation || null,
        drinking: formData.drinking || null,
        smoking: formData.smoking || null,
        exercise: formData.exercise || null,
        relationship_type: formData.relationship_type || null,
        children: formData.children || "none",
        height: formData.height ? parseInt(formData.height) : null,
        zodiac_sign: formData.zodiac_sign || null
      };

      console.log('ProfileSettings: Calling updateProfile with:', updateData);
      const success = await updateProfile(updateData);
      
      console.log('ProfileSettings: Update result:', success);

      if (success) {
        setHasChanges(false);
        setIsEditing(false);
        toast({
          title: t('success'),
          description: t('profileUpdateSuccess'),
        });
      } else {
        // console.error('ProfileSettings: Update failed');
        toast({
          title: t('error'),
          description: t('validation.profileUpdateError'),
          variant: "destructive",
        });
      }
    } catch (error) {
      // console.error('ProfileSettings: Error during save:', error);
      toast({
        title: t('error'),
        description: t('validation.profileUpdateError'),
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    // console.log('ProfileSettings: Canceling changes');
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        age: userProfile.age || 0,
        email: userProfile.email || "",
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        bio: userProfile.bio || "",
        photos: userProfile.photos || [],
        interests: userProfile.interests || [],
        religion: userProfile.religion || "",
        languages: userProfile.languages || [],
        education: userProfile.education || "",
        occupation: userProfile.occupation || "",
        drinking: userProfile.drinking || "",
        smoking: userProfile.smoking || "",
        exercise: userProfile.exercise || "",
        relationship_type: userProfile.relationship_type || "",
        children: userProfile.children || "none",
        height: userProfile.height?.toString() || "",
        zodiac_sign: userProfile.zodiac_sign || "",
        verified: userProfile.verified || false
      });
    }
    setHasChanges(false);
    setIsEditing(false);
  };

  return {
    formData,
    hasChanges,
    isEditing,
    loading,
    setIsEditing,
    handleInputChange,
    toggleInterest,
    handleSave,
    handleCancel
  };
};
