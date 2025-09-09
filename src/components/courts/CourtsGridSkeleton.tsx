import React from 'react';
import CourtCardSkeleton from './CourtCardSkeleton';

interface CourtsGridSkeletonProps {
  count?: number;
}

const CourtsGridSkeleton: React.FC<CourtsGridSkeletonProps> = ({ count = 8 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CourtCardSkeleton key={index} />
      ))}
    </div>
  );
};

export default CourtsGridSkeleton;
