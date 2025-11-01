
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useProfiles } from "@/hooks/useProfiles";
import { SexualOrientation, InterestedIn, ExtendedProfile } from "@/types/profile";

interface FormData {
  name: string;
  age: string;
  bio: string;
  photos: string[];
  interests: string[];
  location: string;
  gender: string;
  religion: string;
  relationship_type: string;
  sexual_orientation: SexualOrientation;
  interested_in: InterestedIn;
}

export const useProfileSetupLogic = () => {
  const { user } = useAuth();
  const { userProfile, updateProfile } = useProfiles();
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<FormData>({
    name: "",
    age: "",
    bio: "",
    photos: [],
    interests: [],
    location: "",
    gender: "",
    religion: "",
    relationship_type: "",
    sexual_orientation: "heterosexual",
    interested_in: "both"
  });

  const [genderLocked, setGenderLocked] = useState(false);

  useEffect(() => {
    if (userProfile) {
      const extendedProfile = userProfile as ExtendedProfile;
      setFormData({
        name: userProfile.name || "",
        age: userProfile.age?.toString() || "",
        bio: userProfile.bio || "",
        photos: userProfile.photos || [],
        interests: userProfile.interests || [],
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        religion: userProfile.religion || "",
        relationship_type: userProfile.relationship_type || "",
        sexual_orientation: extendedProfile.sexual_orientation || "heterosexual",
        interested_in: extendedProfile.interested_in || "both"
      });
      
      setGenderLocked(!!userProfile.gender);
    }
  }, [userProfile]);

  const calculateCompletionPercentage = () => {
    let completed = 0;
    const total = 10;
    
    if (formData.name) completed++;
    if (formData.age) completed++;
    if (formData.bio && formData.bio.length >= 20) completed++;
    if (formData.photos.length >= 2) completed++;
    if (formData.interests.length >= 3) completed++;
    if (formData.gender) completed++;
    if (formData.religion) completed++;
    if (formData.relationship_type) completed++;
    if (formData.sexual_orientation) completed++;
    if (formData.interested_in) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    setFormData(prev => ({ ...prev, interests: newInterests }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.age || !formData.bio || !formData.gender || !formData.sexual_orientation || !formData.interested_in) {
      alert('Lütfen tüm zorunlu alanları doldurun (İsim, Yaş, Hakkında, Cinsiyet, Cinsel Yönelim ve İlgi Alanı)');
      return;
    }

    await updateProfile({
      name: formData.name,
      age: parseInt(formData.age),
      bio: formData.bio,
      photos: formData.photos,
      interests: formData.interests,
      location: formData.location,
      gender: formData.gender,
      religion: formData.religion,
      relationship_type: formData.relationship_type,
      sexual_orientation: formData.sexual_orientation,
      interested_in: formData.interested_in
    });
  };

  return {
    formData,
    genderLocked,
    showPreview,
    userProfile,
    calculateCompletionPercentage,
    handleInputChange,
    toggleInterest,
    handleSubmit,
    setShowPreview
  };
};
