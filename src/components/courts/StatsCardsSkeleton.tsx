import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const StatsCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Total Courts Skeleton */}
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-12" />
            <Skeleton className="h-3 w-20" />
          </div>
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Skeleton className="h-5 w-5 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Available Courts Skeleton */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Booked Courts Skeleton */}
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-3 w-12" />
          </div>
          <div className="h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center">
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Fully Booked Courts Skeleton */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-10" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Maintenance Courts Skeleton */}
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center">
            <Skeleton className="h-3 w-3 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCardsSkeleton;