import { Card } from '@/components/ui/card';

export const ProfileSkeleton = () => {
  return (
    <div className="relative h-[650px] md:h-[700px] w-full max-w-sm mx-auto">
      <Card className="h-full overflow-hidden bg-white dark:bg-gray-800 animate-pulse">
        {/* Image skeleton */}
        <div className="h-[450px] md:h-[500px] bg-gray-200 dark:bg-gray-700" />
        
        {/* Content skeleton */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
          
          <div className="space-y-2">
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex justify-center space-x-4 pt-4">
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
            <div className="h-16 w-16 bg-gray-200 dark:bg-gray-700 rounded-full" />
          </div>
        </div>
      </Card>
    </div>
  );
};