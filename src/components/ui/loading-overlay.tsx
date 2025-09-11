import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message = "Loading...",
  className = ""
}) => {
  if (!isLoading) return null;

  return (
    <div className={`fixed inset-0 bg-black/50 z-50 flex items-center justify-center ${className}`}>
      <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm w-full mx-4">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <Loader2 className="h-8 w-8 animate-spin text-[#F2851E]" />
            <div className="absolute inset-0 h-8 w-8 border-2 border-gray-200 rounded-full"></div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-900">{message}</p>
            <p className="text-xs text-gray-500 mt-1">Please wait while we process your request...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingOverlay;
