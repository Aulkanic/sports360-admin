import React from 'react';
import OpenPlaySessionSkeleton from './OpenPlaySessionSkeleton';

interface OpenPlayGridSkeletonProps {
  count?: number;
}

const OpenPlayGridSkeleton: React.FC<OpenPlayGridSkeletonProps> = ({ count = 6 }) => {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }, (_, index) => (
        <OpenPlaySessionSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
};

export default OpenPlayGridSkeleton;
