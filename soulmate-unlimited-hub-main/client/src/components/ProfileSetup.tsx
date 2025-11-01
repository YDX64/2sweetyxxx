
import { PhotoUpload } from "@/components/PhotoUpload";
import { ProfilePreview } from "./profile/ProfilePreview";
import { ProfileSetupHeader } from "./profile-setup/ProfileSetupHeader";
import { ProfileSetupProgress } from "./profile-setup/ProfileSetupProgress";
import { BasicInfoSection } from "./profile-setup/BasicInfoSection";
import { PersonalPreferencesSection } from "./profile-setup/PersonalPreferencesSection";
import { BioSection } from "./profile-setup/BioSection";
import { InterestsSection } from "./profile-setup/InterestsSection";
import { ProfileSetupActions } from "./profile-setup/ProfileSetupActions";
import { useProfileSetupLogic } from "./profile-setup/useProfileSetupLogic";

interface ProfileSetupProps {
  onProfileComplete: () => void;
  onCancel?: () => void;
}

export const ProfileSetup = ({ onProfileComplete, onCancel }: ProfileSetupProps) => {
  const {
    formData,
    genderLocked,
    showPreview,
    userProfile,
    calculateCompletionPercentage,
    handleInputChange,
    toggleInterest,
    handleSubmit,
    setShowPreview
  } = useProfileSetupLogic();

  const completionPercentage = calculateCompletionPercentage();
  const hasRequiredData = Boolean(formData.name && formData.photos.length > 0);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSubmit();
    onProfileComplete();
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <ProfileSetupHeader 
        showPreview={showPreview}
        onShowPreview={() => setShowPreview(true)}
        hasRequiredData={hasRequiredData}
      />

      <ProfileSetupProgress completionPercentage={completionPercentage} />

      <form onSubmit={onSubmit} className="space-y-6">
        <PhotoUpload
          photos={formData.photos}
          onPhotosChange={(photos) => handleInputChange('photos', photos)}
        />

        <BasicInfoSection
          formData={{
            name: formData.name,
            age: formData.age,
            location: formData.location,
            gender: formData.gender
          }}
          genderLocked={genderLocked}
          onInputChange={handleInputChange}
        />

        <PersonalPreferencesSection
          formData={{
            religion: formData.religion,
            relationship_type: formData.relationship_type,
            sexual_orientation: formData.sexual_orientation,
            interested_in: formData.interested_in
          }}
          onInputChange={handleInputChange}
        />

        <BioSection
          bio={formData.bio}
          onBioChange={(bio) => handleInputChange('bio', bio)}
        />

        <InterestsSection
          interests={formData.interests}
          onToggleInterest={toggleInterest}
        />

        <ProfileSetupActions
          onCancel={onCancel}
          onSubmit={() => {}}
          completionPercentage={completionPercentage}
        />
      </form>

      {showPreview && userProfile && (
        <ProfilePreview
          profile={{
            ...userProfile,
            name: formData.name,
            age: parseInt(formData.age) || userProfile.age,
            bio: formData.bio,
            photos: formData.photos,
            interests: formData.interests,
            location: formData.location,
            gender: formData.gender,
            religion: formData.religion,
            relationship_type: formData.relationship_type,
            sexual_orientation: formData.sexual_orientation,
            interested_in: formData.interested_in
          }}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
};
