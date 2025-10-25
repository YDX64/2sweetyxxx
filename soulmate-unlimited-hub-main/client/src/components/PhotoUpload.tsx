import { useState, useRef } from "react";
import { Upload, X, Plus, Star, Move } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/hooks/useLanguage";

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
  isEditing?: boolean;
}

export const PhotoUpload = ({ photos, onPhotosChange, maxPhotos = 6, isEditing = true }: PhotoUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useLanguage();

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !isEditing) return;
    
    const newPhotos: string[] = [];
    const remainingSlots = maxPhotos - photos.length;
    const filesToProcess = Math.min(files.length, remainingSlots);
    
    for (let i = 0; i < filesToProcess; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          newPhotos.push(result);
          if (newPhotos.length === filesToProcess) {
            onPhotosChange([...photos, ...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleDrop = (e: React.DragEvent, dropIndex?: number) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (dropIndex !== undefined && draggedIndex !== null && draggedIndex !== dropIndex) {
      movePhoto(draggedIndex, dropIndex);
      setDraggedIndex(null);
      return;
    }
    
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDragStart = (index: number) => {
    if (isEditing) {
      setDraggedIndex(index);
    }
  };

  const removePhoto = (index: number) => {
    if (!isEditing) return;
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const movePhoto = (fromIndex: number, toIndex: number) => {
    if (!isEditing) return;
    const newPhotos = [...photos];
    const [removed] = newPhotos.splice(fromIndex, 1);
    newPhotos.splice(toIndex, 0, removed);
    onPhotosChange(newPhotos);
  };

  const triggerFileSelect = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-4">
      {/* Photo Grid - Only show existing photos + add button */}
      <div className="grid grid-cols-3 gap-4">
        {photos.map((photo, index) => (
          <div 
            key={index} 
            className="relative aspect-square"
            draggable={isEditing}
            onDragStart={() => handleDragStart(index)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, index)}
          >
            <img
              src={photo}
              alt={`${t('photo')} ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                {t('mainPhoto')}
              </div>
            )}
            
            {isEditing && (
              <div className="absolute inset-0 bg-background/0 hover:bg-background/30 transition-all duration-200 flex items-center justify-center rounded-lg">
                <div className="flex gap-2 opacity-0 hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removePhoto(index)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  
                  <div className="bg-card rounded p-1">
                    <Move className="w-4 h-4 text-gray-600" />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        
        {/* Add Photo Button - Only show if editing and under limit */}
        {isEditing && photos.length < maxPhotos && (
          <div
            className={`aspect-square border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-pink-500 bg-pink-50'
                : 'border-gray-300 hover:border-pink-400 hover:bg-gray-50'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={triggerFileSelect}
          >
            <Plus className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-500 text-center">
              {t('addPhoto')}
            </span>
          </div>
        )}
      </div>

      {/* Upload Area - Only show when no photos exist */}
      {photos.length === 0 && isEditing && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-300 hover:border-pink-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={triggerFileSelect}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-foreground mb-2">
            {t('uploadPhotos')}
          </h4>
          <p className="text-gray-500 mb-4">
            {t('dragDropPhotos')}
          </p>
          <Button variant="outline">
            {t('selectPhoto')}
          </Button>
        </div>
      )}

      <label htmlFor="photo-upload" className="sr-only">{t('selectPhoto')}</label>
      <input
        id="photo-upload"
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      
      {isEditing && (
        <div className="text-xs text-gray-500 space-y-1">
          <p>• {t('firstPhotoMain')}</p>
          <p>• {t('minTwoPhotos')}</p>
          <p>• {t('dragToReorder')}</p>
          {photos.length >= 2 && <p className="text-green-600">✓ {t('photoRequirementMet')}</p>}
        </div>
      )}
    </div>
  );
};
