
import { memo, useCallback, lazy, Suspense } from "react";
import { ProfileEditorHeader } from "./sections/ProfileEditorHeader";
import { CompletionProgressCard } from "./sections/CompletionProgressCard";
import { useProfileEditorLogic } from "@/hooks/useProfileEditorLogic";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy load profile sections for better performance
const PhotosCard = lazy(() => import("./sections/PhotosCard").then(m => ({ default: m.PhotosCard })));
const BasicInfoCard = lazy(() => import("./sections/BasicInfoCard").then(m => ({ default: m.BasicInfoCard })));
const BioCard = lazy(() => import("./sections/BioCard").then(m => ({ default: m.BioCard })));
const InterestsCard = lazy(() => import("./sections/InterestsCard").then(m => ({ default: m.InterestsCard })));
const PersonalDetailsCard = lazy(() => import("./sections/PersonalDetailsCard").then(m => ({ default: m.PersonalDetailsCard })));

// Loading skeleton for profile sections
const SectionLoader = memo(() => (
  <div className="space-y-4">
    <Skeleton className="h-48 w-full rounded-lg" />
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
  </div>
));

interface ProfileEditorProps {
  onClose?: () => void;
  onSave?: () => void;
}

export const ProfileEditor = memo(({ onClose, onSave }: ProfileEditorProps) => {
  const {
    formData,
    isEditing,
    isSaving,
    completionPercentage,
    setIsEditing,
    toggleInterest,
    handleInputChange,
    handleSave,
    setFormData,
    userProfile
  } = useProfileEditorLogic();

  const handleSaveAndCallback = useCallback(async () => {
    await handleSave();
    onSave?.();
  }, [handleSave, onSave]);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <ProfileEditorHeader
        isEditing={isEditing}
        isSaving={isSaving}
        onEdit={() => setIsEditing(true)}
        onCancel={() => setIsEditing(false)}
        onSave={handleSaveAndCallback}
        onClose={onClose}
      />

      <CompletionProgressCard completionPercentage={completionPercentage} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<SectionLoader />}>
          <PhotosCard
            photos={formData.photos}
            onPhotosChange={(photos) => setFormData(prev => ({ ...prev, photos }))}
            isEditing={isEditing}
          />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BasicInfoCard
            formData={{
              name: formData.name,
              age: formData.age,
              location: formData.location,
              gender: formData.gender
            }}
            isEditing={isEditing}
            onInputChange={handleInputChange}
            genderLocked={false}
            birthDateLocked={false}
          />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BioCard
            bio={formData.bio}
            isEditing={isEditing}
            onBioChange={(bio) => setFormData(prev => ({ ...prev, bio }))}
          />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <InterestsCard
            interests={formData.interests}
            isEditing={isEditing}
            onToggleInterest={toggleInterest}
          />
        </Suspense>
      </div>

      <Suspense fallback={<SectionLoader />}>
        <PersonalDetailsCard
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
      </Suspense>
    </div>
  );
});
