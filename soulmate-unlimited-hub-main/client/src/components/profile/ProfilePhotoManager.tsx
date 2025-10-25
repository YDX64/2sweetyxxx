
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Move, Star } from "lucide-react";
import { usePhotoUpload } from "@/hooks/usePhotoUpload";

interface ProfilePhotoManagerProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  isEditing: boolean;
}

export const ProfilePhotoManager = ({ photos, onPhotosChange, isEditing }: ProfilePhotoManagerProps) => {
  const { uploading, uploadPhoto } = usePhotoUpload();
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const url = await uploadPhoto(file);
    if (url) {
      onPhotosChange([...photos, url]);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, removed);
    onPhotosChange(newPhotos);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      movePhoto(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const PhotoSlot = ({ index, photo }: { index: number; photo?: string }) => (
    <Card 
      className={`relative aspect-[3/4] overflow-hidden transition-all duration-200 ${
        isEditing ? 'cursor-pointer hover:shadow-lg' : ''
      } ${index === 0 ? 'ring-2 ring-pink-500 ring-offset-2' : ''}`}
      draggable={isEditing && !!photo}
      onDragStart={() => photo && handleDragStart(index)}
      onDragOver={handleDragOver}
      onDrop={(e) => handleDrop(e, index)}
    >
      {photo ? (
        <>
          <img 
            src={photo} 
            alt={`Profil fotoğrafı ${index + 1}`} 
            className="w-full h-full object-cover" 
          />
          
          {index === 0 && (
            <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <Star className="w-3 h-3 fill-current" />
              Ana
            </div>
          )}
          
          {isEditing && (
            <div className="absolute inset-0 bg-background/0 hover:bg-background/30 transition-all duration-200 flex items-center justify-center">
              <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => removePhoto(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
                
                <div className="bg-white rounded p-1">
                  <Move className="w-4 h-4 text-gray-600" />
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="w-full h-full bg-gray-100 border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-500">
          {isEditing && photos.length < 6 ? (
            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full hover:bg-gray-50 transition-colors">
              <Plus className="w-8 h-8 mb-2" />
              <span className="text-xs text-center px-2">
                {index === 0 && photos.length === 0 ? "Ana fotoğraf ekle" : "Fotoğraf ekle"}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-gray-200 rounded-full mb-2" />
              <span className="text-xs">Boş</span>
            </div>
          )}
        </div>
      )}
      
      {uploading && index === photos.length && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
          <div className="text-xs text-gray-600">Yükleniyor...</div>
        </div>
      )}
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <PhotoSlot 
            key={index} 
            index={index} 
            photo={photos[index]} 
          />
        ))}
      </div>
      
      <div className="text-xs text-gray-500 space-y-1">
        <p>• İlk fotoğraf ana profil fotoğrafın olacak</p>
        <p>• En az 2 fotoğraf eklemelisin</p>
        <p>• Fotoğrafları sürükleyerek sıralayabilirsin</p>
        {photos.length >= 2 && <p className="text-green-600">✓ Fotoğraf gereksinimi karşılandı</p>}
      </div>
    </div>
  );
};
