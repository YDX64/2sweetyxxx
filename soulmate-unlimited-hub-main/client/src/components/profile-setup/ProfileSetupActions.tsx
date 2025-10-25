
import { Button } from "@/components/ui/button";

interface ProfileSetupActionsProps {
  onCancel?: () => void;
  onSubmit: () => void;
  completionPercentage: number;
}

export const ProfileSetupActions = ({ onCancel, onSubmit, completionPercentage }: ProfileSetupActionsProps) => {
  return (
    <div className="flex space-x-4 pt-4">
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
          İptal
        </Button>
      )}
      <Button 
        type="submit" 
        className="flex-1 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white"
        disabled={completionPercentage < 60}
        onClick={onSubmit}
      >
        Profili Tamamla {completionPercentage < 60 && `(${completionPercentage}%)`}
      </Button>
    </div>
  );
};
