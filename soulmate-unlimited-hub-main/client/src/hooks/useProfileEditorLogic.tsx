
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useProfiles } from "@/hooks/useProfiles";

export const useProfileEditorLogic = () => {
  const { userProfile, updateProfile } = useProfiles();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    bio: "",
    photos: [] as string[],
    interests: [] as string[],
    location: "",
    gender: "",
    religion: "",
    languages: [] as string[],
    education: "",
    occupation: "",
    drinking: "",
    smoking: "",
    exercise: "",
    relationship_type: "",
    children: "",
    height: "",
    zodiac_sign: ""
  });

  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || "",
        age: userProfile.age?.toString() || "",
        bio: userProfile.bio || "",
        photos: userProfile.photos || [],
        interests: userProfile.interests || [],
        location: userProfile.location || "",
        gender: userProfile.gender || "",
        religion: userProfile.religion || "",
        languages: userProfile.languages || [],
        education: userProfile.education || "",
        occupation: userProfile.occupation || "",
        drinking: userProfile.drinking || "",
        smoking: userProfile.smoking || "",
        exercise: userProfile.exercise || "",
        relationship_type: userProfile.relationship_type || "",
        children: userProfile.children || "",
        height: userProfile.height?.toString() || "",
        zodiac_sign: userProfile.zodiac_sign || ""
      });
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
    if (formData.location) completed++;
    if (formData.religion) completed++;
    if (formData.education) completed++;
    if (formData.occupation) completed++;
    if (formData.relationship_type) completed++;
    
    return Math.round((completed / total) * 100);
  };

  const toggleInterest = (interest: string) => {
    const newInterests = formData.interests.includes(interest)
      ? formData.interests.filter(i => i !== interest)
      : [...formData.interests, interest];
    
    if (newInterests.length <= 8) {
      setFormData(prev => ({ ...prev, interests: newInterests }));
    }
  };

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      const success = await updateProfile({
        name: formData.name,
        age: parseInt(formData.age),
        bio: formData.bio,
        photos: formData.photos,
        interests: formData.interests,
        location: formData.location,
        gender: formData.gender,
        religion: formData.religion,
        languages: formData.languages,
        education: formData.education,
        occupation: formData.occupation,
        drinking: formData.drinking,
        smoking: formData.smoking,
        exercise: formData.exercise,
        relationship_type: formData.relationship_type,
        children: formData.children,
        height: formData.height ? parseInt(formData.height) : undefined,
        zodiac_sign: formData.zodiac_sign
      });

      if (success) {
        toast({
          title: "Profil güncellendi!",
          description: "Değişiklikler başarıyla kaydedildi.",
        });
        setIsEditing(false);
      } else {
        throw new Error("Update failed");
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Profil güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
    
    setIsSaving(false);
  };

  return {
    formData,
    isEditing,
    isSaving,
    completionPercentage: calculateCompletionPercentage(),
    setIsEditing,
    toggleInterest,
    handleInputChange,
    handleSave,
    setFormData,
    userProfile
  };
};
