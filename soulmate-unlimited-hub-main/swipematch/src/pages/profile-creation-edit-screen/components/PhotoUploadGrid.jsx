import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PhotoUploadGrid = ({ photos, onPhotosChange, errors }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const fileInputRef = useRef(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const handlePhotoUpload = (event, slotIndex) => {
    const file = event.target.files[0];
    if (file) {
      // Simulate file upload and get URL
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhotos = [...photos];
        newPhotos[slotIndex] = {
          id: Date.now(),
          url: e.target.result,
          isPrimary: slotIndex === 0 && !photos.some(p => p?.isPrimary)
        };
        onPhotosChange(newPhotos);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoDelete = (index) => {
    const newPhotos = [...photos];
    const wasDeleted = newPhotos[index];
    newPhotos[index] = null;
    
    // If primary photo was deleted, make first available photo primary
    if (wasDeleted?.isPrimary) {
      const firstPhoto = newPhotos.find(p => p !== null);
      if (firstPhoto) {
        firstPhoto.isPrimary = true;
      }
    }
    
    onPhotosChange(newPhotos);
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      const newPhotos = [...photos];
      const draggedPhoto = newPhotos[draggedIndex];
      const dropPhoto = newPhotos[dropIndex];
      
      newPhotos[draggedIndex] = dropPhoto;
      newPhotos[dropIndex] = draggedPhoto;
      
      onPhotosChange(newPhotos);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleSetPrimary = (index) => {
    const newPhotos = photos.map((photo, i) => {
      if (photo) {
        return { ...photo, isPrimary: i === index };
      }
      return photo;
    });
    onPhotosChange(newPhotos);
  };

  const openFileDialog = (slotIndex) => {
    setSelectedSlot(slotIndex);
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-warm-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-heading font-semibold text-text-primary">
          Photos
        </h2>
        <span className="text-sm font-caption text-text-secondary">
          {photos.filter(p => p !== null).length}/6
        </span>
      </div>

      <p className="text-sm font-body text-text-secondary mb-6">
        Add at least 2 photos. Drag to reorder. First photo will be your main profile picture.
      </p>

      {/* Photo Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {photos.map((photo, index) => (
          <div
            key={index}
            className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${
              photo 
                ? 'border-transparent' :'border-dashed border-border hover:border-primary/50'
            } ${
              dragOverIndex === index ? 'border-primary scale-105' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
          >
            {photo ? (
              <>
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, index)}
                  className="w-full h-full cursor-move"
                >
                  <Image
                    src={photo.url}
                    alt={`Profile photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Primary Badge */}
                {photo.isPrimary && (
                  <div className="absolute top-2 left-2 bg-primary text-white text-xs font-caption font-medium px-2 py-1 rounded-full">
                    Main
                  </div>
                )}

                {/* Photo Actions */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {!photo.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(index)}
                      className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-smooth"
                      title="Set as main photo"
                    >
                      <Icon name="Star" size={14} />
                    </button>
                  )}
                  <button
                    onClick={() => handlePhotoDelete(index)}
                    className="p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-smooth"
                    title="Delete photo"
                  >
                    <Icon name="Trash2" size={14} />
                  </button>
                </div>

                {/* Drag Handle */}
                <div className="absolute bottom-2 right-2 p-1 bg-black/50 text-white rounded-full">
                  <Icon name="Move" size={12} />
                </div>
              </>
            ) : (
              <button
                onClick={() => openFileDialog(index)}
                className="w-full h-full flex flex-col items-center justify-center text-text-secondary hover:text-primary hover:bg-primary/5 transition-smooth"
              >
                <Icon name="Plus" size={24} className="mb-2" />
                <span className="text-xs font-caption">Add Photo</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Upload Tips */}
      <div className="bg-background rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={16} className="text-secondary mt-0.5" />
          <div className="text-sm font-body text-text-secondary">
            <p className="mb-2">Tips for great photos:</p>
            <ul className="space-y-1 text-xs">
              <li>• Use high-quality, well-lit photos</li>
              <li>• Show your face clearly in the first photo</li>
              <li>• Include variety: close-ups, full body, activities</li>
              <li>• Avoid group photos as your main picture</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handlePhotoUpload(e, selectedSlot)}
        className="hidden"
      />

      {errors && (
        <p className="text-error text-sm font-body mt-2">{errors}</p>
      )}
    </div>
  );
};

export default PhotoUploadGrid;