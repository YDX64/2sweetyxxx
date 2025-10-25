
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface CompletionProgressCardProps {
  completionPercentage: number;
}

export const CompletionProgressCard = ({ completionPercentage }: CompletionProgressCardProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Profil Tamamlanma</span>
          <span className="text-sm text-gray-600">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
        <p className="text-xs text-gray-500 mt-1">
          Daha fazla bilgi ekleyerek daha çok eşleşme al!
        </p>
      </CardContent>
    </Card>
  );
};
