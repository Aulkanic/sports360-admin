import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const OpenPlaySessionSkeleton: React.FC = () => {
  return (
    <div className="group relative overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Enhanced gradient accent skeleton */}
      <div className="pointer-events-none absolute inset-x-0 -top-20 h-36 translate-y-0 bg-gradient-to-b from-primary/15 to-transparent" />
      
      {/* Status indicator skeleton */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>

      <div className="p-5 space-y-4">
        {/* Header skeleton */}
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <Skeleton className="h-6 w-3/4" />
            <div className="flex items-center gap-1">
              <Skeleton className="h-3 w-3" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />

          {/* Event Type & Level Badges skeleton */}
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>

          {/* Session Details Grid skeleton */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Hub Information skeleton */}
          <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
            <div className="flex items-center gap-2">
              <Skeleton className="w-2 h-2 rounded-full" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>

          {/* Additional Info skeleton */}
          <div className="flex items-center justify-between bg-muted/30 rounded-lg p-2">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-12" />
              </div>
              <div className="flex items-center gap-1">
                <Skeleton className="h-3 w-3" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
            <Skeleton className="h-3 w-20" />
          </div>
        </div>

        {/* Participants Section skeleton */}
        <div className="space-y-3 border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatars strip skeleton */}
              <div className="flex -space-x-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="w-8 h-8 rounded-full ring-2 ring-white" />
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-6" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
          
          {/* Level badges skeleton */}
          <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>

        {/* Progress bar skeleton */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="w-full h-2.5 rounded-full" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>

      {/* Action Buttons skeleton */}
      <div className="flex items-center gap-2 pt-3 border-t px-5 pb-5">
        <Skeleton className="flex-1 h-10 rounded-md" />
        <Skeleton className="flex-1 h-10 rounded-md" />
      </div>
    </div>
  );
};

export default OpenPlaySessionSkeleton;