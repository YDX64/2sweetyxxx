import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { PhotoUpload } from "@/components/PhotoUpload";
import { useLanguage } from "@/hooks/useLanguage";

interface PhotosSectionProps {
  photos: string[];
  isEditing: boolean;
  onPhotosChange: (photos: string[]) => void;
}

export const PhotosSection = ({ photos, isEditing, onPhotosChange }: PhotosSectionProps) => {
  const { t } = useLanguage();
  return (
    <Card className="dark:bg-gray-800/80 dark:border-gray-600/50 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 dark:text-gray-100">
          <Camera className="w-5 h-5 text-pink-500" />
          {t("photosTitle")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <PhotoUpload
          photos={photos}
          onPhotosChange={onPhotosChange}
          maxPhotos={6}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  );
};
