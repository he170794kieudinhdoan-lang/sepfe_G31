import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

export const JobDetailSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-2 space-y-8">
        {/* Header Skeleton */}
        <Card className="p-8 border-0 shadow-sm rounded-xl space-y-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4 flex-1">
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <div className="flex gap-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-32" />
              </div>
            </div>
            <Skeleton className="h-14 w-14 rounded-xl" />
          </div>
          <div className="flex gap-3 pt-2">
            <Skeleton className="h-11 w-32 rounded-xl" />
            <Skeleton className="h-11 w-32 rounded-xl" />
          </div>
        </Card>

        {/* Content Skeleton */}
        <Card className="p-8 border-0 shadow-sm rounded-xl space-y-8">
          <div className="space-y-4">
            <Skeleton className="h-7 w-48" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>

          <div className="space-y-4">
            <Skeleton className="h-7 w-64" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <Skeleton className="h-7 w-40" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-4 border rounded-xl">
                  <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-1/2" />
                    <Skeleton className="h-4 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Skeleton */}
      <div className="lg:col-span-1">
        <Card className="p-6 border-0 shadow-sm rounded-xl space-y-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <Skeleton className="h-24 w-24 rounded-2xl" />
            <div className="space-y-2 w-full flex flex-col items-center">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))}
          </div>

          <Skeleton className="h-11 w-full rounded-xl mt-4" />
        </Card>
      </div>
    </div>
  );
};
