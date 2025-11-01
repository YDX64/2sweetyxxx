import React from 'react';
import Image from '../../../components/AppImage';

const NewMatchesCarousel = ({ matches, onMatchClick }) => {
  return (
    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex space-x-4 pb-2">
        {matches.map((match) => (
          <button
            key={match.id}
            onClick={() => onMatchClick(match)}
            className="flex-shrink-0 text-center group"
          >
            <div className="relative mb-2">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-3 border-gradient-to-r from-primary to-secondary p-0.5 group-hover:scale-105 transition-smooth">
                <div className="w-full h-full rounded-full overflow-hidden bg-surface">
                  <Image
                    src={match.avatar}
                    alt={match.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              
              {/* Online Status */}
              {match.isOnline && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success border-2 border-surface rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              )}
              
              {/* New Match Badge */}
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-caption font-bold">!</span>
              </div>
            </div>
            
            <div className="w-20 md:w-24">
              <p className="font-body font-semibold text-text-primary text-sm truncate group-hover:text-primary transition-smooth">
                {match.name}
              </p>
              <p className="font-caption text-text-secondary text-xs">
                {match.age}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default NewMatchesCarousel;