import { PhotoUpload } from "@/components/PhotoUpload";
import { Plus } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";

interface PhotoStepProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

export const PhotoStep = ({ photos, onChange }: PhotoStepProps) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {t('onboarding.photos.question')}
        </h1>
      </div>
      
      <div className="space-y-4">
        <PhotoUpload
          photos={photos}
          onPhotosChange={onChange}
        />
        
        {photos.length === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center">
            <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-2">
              {t('onboarding.photos.addFirst')}
            </p>
            <p className="text-gray-400 text-sm">
              {t('onboarding.photos.required')}
            </p>
          </div>
        )}
        
        {photos.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-700 dark:text-green-300 font-medium text-center">
              {t('onboarding.photos.added', { count: photos.length })}
            </p>
          </div>
        )}
        
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
          {t('onboarding.photos.recommendation')}
        </p>
      </div>
    </div>
  );
};