
import { MapPin } from "lucide-react";

interface ProfileInfoProps {
  name?: string;
  age?: number;
  location?: string;
  distance?: number;
  bio?: string;
  interests?: string[];
}

export const ProfileInfo = ({ name, age, location, bio }: ProfileInfoProps) => {
  return (
    <div className="p-4 h-full flex flex-col justify-center bg-white">
      {/* Name and age */}
      <div className="mb-2">
        <h3 className="text-xl font-bold text-gray-900 truncate">
          {name || 'Unknown'}, {age || '?'}
        </h3>
        {location && (
          <div className="flex items-center text-sm text-gray-600 mt-1">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>

      {/* Bio */}
      {bio && (
        <p className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
          {bio}
        </p>
      )}
    </div>
  );
};
