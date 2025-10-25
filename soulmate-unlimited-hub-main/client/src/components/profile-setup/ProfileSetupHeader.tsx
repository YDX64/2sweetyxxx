
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface ProfileSetupHeaderProps {
  showPreview: boolean;
  onShowPreview: () => void;
  hasRequiredData: boolean;
}

export const ProfileSetupHeader = ({ showPreview, onShowPreview, hasRequiredData }: ProfileSetupHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
        Profilini Oluştur
      </h2>
      
      {hasRequiredData && (
        <Button 
          variant="outline" 
          onClick={onShowPreview}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Önizleme
        </Button>
      )}
    </div>
  );
};
