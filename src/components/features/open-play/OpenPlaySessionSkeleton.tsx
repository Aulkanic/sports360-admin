import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const OpenPlaySessionSkeleton: React.FC = () => {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Simplified gradient accent */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary/20 to-primary/5" />
      
      {/* Status indicator - simplified */}
      <div className="absolute top-3 right-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>

      <div className="p-5 space-y-4">
        {/* Header - simplified */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-12" />
          </div>
          
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Event Type & Level Badges - reduced */}
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Session Details - simplified grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-20" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>

          {/* Hub Information - simplified */}
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>

        {/* Participants Section - simplified */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center gap-3">
            {/* Avatars strip - reduced count */}
            <div className="flex -space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-8 h-8 rounded-full ring-2 ring-white" />
              ))}
            </div>
            <div className="space-y-1">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>

        {/* Progress bar - simplified */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="w-full h-2 rounded-full" />
        </div>
      </div>

      {/* Action Buttons - simplified */}
      <div className="flex items-center gap-2 pt-3 border-t px-5 pb-5">
        <Skeleton className="flex-1 h-9 rounded-md" />
        <Skeleton className="flex-1 h-9 rounded-md" />
      </div>
    </div>
  );
};

export default OpenPlaySessionSkeleton;