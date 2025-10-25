import { useIsMobile } from "@/hooks/use-mobile";
import { BasicInfoForm } from "./profile/BasicInfoForm";
import { BioForm } from "./profile/BioForm";
import { InterestsForm } from "./profile/InterestsForm";
import { ProfileCompletionCard } from "./profile/ProfileCompletionCard";
import { ProfileSettingsHeader } from "./profile/ProfileSettingsHeader";
import { PhotosSection } from "./profile/PhotosSection";
import { PersonalDetailsSection } from "./profile/PersonalDetailsSection";
import { VerificationSection } from "./profile/VerificationSection";
import { useProfileSettingsLogic } from "@/hooks/useProfileSettingsLogic";

export const ProfileSettings = () => {
  const isMobile = useIsMobile();
  const {
    formData,
    hasChanges,
    isEditing,
    loading,
    setIsEditing,
    handleInputChange,
    toggleInterest,
    handleSave,
    handleCancel
  } = useProfileSettingsLogic();

  // ProfileCompletionCard için completion percentage hesaplama
  const calculateCompletionPercentage = (data: typeof formData) => {
    const requiredFields = [
      data.name,
      data.age,
      data.bio && data.bio.length >= 20,
      data.interests.length >= 3,
      data.location,
      data.photos.length > 0
    ];
    
    const completedFields = requiredFields.filter(Boolean).length;
    return Math.round((completedFields / requiredFields.length) * 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500 dark:text-gray-400">Profil yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <ProfileSettingsHeader
        isEditing={isEditing}
        hasChanges={hasChanges}
        onEdit={() => setIsEditing(true)}
        onCancel={handleCancel}
        onSave={handleSave}
      />

      <div className="space-y-6">
        {/* Fotoğraflar */}
        <PhotosSection
          photos={formData.photos}
          isEditing={isEditing}
          onPhotosChange={(photos) => handleInputChange('photos', photos)}
        />

        {/* Temel Bilgiler ve Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BasicInfoForm
            formData={{
              name: formData.name,
              age: String(formData.age),
              email: formData.email,
              location: formData.location,
              gender: formData.gender
            }}
            isEditing={isEditing}
            onInputChange={handleInputChange}
          />

          <BioForm
            bio={formData.bio}
            isEditing={isEditing}
            onBioChange={(bio) => handleInputChange('bio', bio)}
          />
        </div>

        {/* İlgi Alanları */}
        <InterestsForm
          interests={formData.interests}
          isEditing={isEditing}
          onToggleInterest={toggleInterest}
        />

        {/* Kişisel Detaylar */}
        <PersonalDetailsSection
          formData={{
            religion: formData.religion,
            languages: formData.languages,
            education: formData.education,
            occupation: formData.occupation,
            drinking: formData.drinking,
            smoking: formData.smoking,
            exercise: formData.exercise,
            relationship_type: formData.relationship_type,
            children: formData.children,
            height: formData.height,
            zodiac_sign: formData.zodiac_sign
          }}
          isEditing={isEditing}
          onInputChange={handleInputChange}
        />

        {/* Profil Tamamlanma */}
        <ProfileCompletionCard 
          completionPercentage={calculateCompletionPercentage(formData)}
        />

        {/* Verification Section */}
        <VerificationSection 
          verified={formData.verified}
          onVerificationComplete={() => {
            // Refresh profile data after verification
            window.location.reload();
          }}
        />
      </div>
    </div>
  );
};
