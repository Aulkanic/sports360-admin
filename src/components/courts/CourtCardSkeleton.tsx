import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const CourtCardSkeleton: React.FC = () => {
  return (
    <div className="group bg-card border border-primary/10 rounded-xl shadow-sm overflow-hidden">
      {/* Image Section Skeleton */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
        <Skeleton className="absolute inset-0 h-full w-full" />
        
        {/* Status Badge Skeleton */}
        <div className="absolute top-3 right-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
        
        {/* Court Type Badge Skeleton */}
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
      </div>
      
      {/* Content Section Skeleton */}
      <div className="p-5 space-y-4 bg-gradient-to-b from-background to-background/95">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        
        {/* Details Grid Skeleton */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-8" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex items-center gap-2 col-span-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        
        {/* Availability Section Skeleton */}
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <div key={index} className="text-center">
                <Skeleton className="h-3 w-6 mx-auto mb-1" />
                <Skeleton className="w-full h-2 rounded-sm" />
                <Skeleton className="h-3 w-8 mx-auto mt-1" />
              </div>
            ))}
          </div>
        </div>
        
        {/* Bookings Section Skeleton */}
        <div className="space-y-3 pt-2 border-t border-border/50">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="bg-muted/30 rounded-lg p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex items-center gap-2 pt-2">
          <Skeleton className="flex-1 h-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
          <Skeleton className="h-9 w-9 rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default CourtCardSkeleton;
