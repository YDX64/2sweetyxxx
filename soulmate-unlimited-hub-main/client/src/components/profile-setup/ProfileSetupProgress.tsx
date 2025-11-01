
import { Progress } from "@/components/ui/progress";

interface ProfileSetupProgressProps {
  completionPercentage: number;
}

export const ProfileSetupProgress = ({ completionPercentage }: ProfileSetupProgressProps) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Profil Tamamlanma</span>
        <span className="text-sm text-gray-600">{completionPercentage}%</span>
      </div>
      <Progress value={completionPercentage} className="h-2" />
      <p className="text-xs text-gray-500 mt-1">
        {completionPercentage < 100 
          ? `${100 - completionPercentage}% daha tamamla` 
          : "Profilin hazır! 🎉"
        }
      </p>
    </div>
  );
};
