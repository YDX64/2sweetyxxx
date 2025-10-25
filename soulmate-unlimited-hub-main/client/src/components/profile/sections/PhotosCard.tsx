
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera } from "lucide-react";
import { ProfilePhotoManager } from "../ProfilePhotoManager";

interface PhotosCardProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  isEditing: boolean;
}

export const PhotosCard = ({ photos, onPhotosChange, isEditing }: PhotosCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="w-5 h-5" />
          Fotoğraflar ({photos.length}/6)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ProfilePhotoManager
          photos={photos}
          onPhotosChange={onPhotosChange}
          isEditing={isEditing}
        />
      </CardContent>
    </Card>
  );
};
