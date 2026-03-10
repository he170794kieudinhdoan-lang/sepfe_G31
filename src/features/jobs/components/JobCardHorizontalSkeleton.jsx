import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const JobCardHorizontalSkeleton = () => {
  return (
    <Card className="p-4 rounded-xl shadow-sm border-0 flex gap-4 animate-pulse">
      {/* Left: Image Placeholder */}
      <Skeleton className="h-24 w-24 rounded-lg shrink-0" />

      {/* Right: Content */}
      <div className="flex-1 flex flex-col justify-between py-0.5">
        <div className="flex justify-between items-start gap-2">
          <Skeleton className="h-6 w-20 rounded-lg" />
          <Skeleton className="h-5 w-24" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-6 w-[80%]" />
          <Skeleton className="h-4 w-32" />
        </div>

        <div className="flex justify-between items-center">
          <Skeleton className="h-5 w-16 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </Card>
  );
};
