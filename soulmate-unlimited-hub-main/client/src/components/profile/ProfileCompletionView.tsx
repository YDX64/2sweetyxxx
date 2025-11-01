import { Header } from "@/components/Header";
import { ProfileSetup } from "@/components/ProfileSetup";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "@/hooks/use-toast";
import { useProfiles } from "@/hooks/useProfiles";

export const ProfileCompletionView = () => {
  const { t } = useLanguage();
  const { refetchProfiles } = useProfiles();

  const handleProfileComplete = () => {
    toast({
      title: t('profileUpdated'),
      description: t('profileUpdateSuccess'),
      duration: 3000,
    });
    refetchProfiles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              {t('welcome')}
            </h1>
            <p className="text-gray-600 text-lg">
              {t('completeProfileToStart')}
            </p>
          </div>
          <ProfileSetup onProfileComplete={handleProfileComplete} />
        </div>
      </main>
    </div>
  );
};
