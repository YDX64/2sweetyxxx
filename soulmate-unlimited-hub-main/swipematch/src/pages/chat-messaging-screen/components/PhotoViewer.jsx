import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const PhotoViewer = ({ photo, onClose }) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleZoomToggle = () => {
    if (isZoomed) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsZoomed(false);
    } else {
      setScale(2);
      setIsZoomed(true);
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = photo;
    link.download = `photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Header Controls */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-smooth"
          aria-label="Close photo viewer"
        >
          <Icon name="X" size={24} />
        </button>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleZoomToggle}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-smooth"
            aria-label={isZoomed ? "Zoom out" : "Zoom in"}
          >
            <Icon name={isZoomed ? "ZoomOut" : "ZoomIn"} size={20} />
          </button>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-smooth"
            aria-label="Download photo"
          >
            <Icon name="Download" size={20} />
          </button>
        </div>
      </div>

      {/* Photo Container */}
      <div className="relative max-w-full max-h-full overflow-hidden">
        <div
          className="transition-transform duration-300 ease-out cursor-pointer"
          style={{
            transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
          }}
          onClick={handleZoomToggle}
        >
          <Image
            src={photo}
            alt="Full size photo"
            className="max-w-full max-h-[80vh] object-contain"
          />
        </div>
      </div>

      {/* Zoom Instructions */}
      {!isZoomed && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full text-sm font-caption">
            Tap to zoom
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoViewer;