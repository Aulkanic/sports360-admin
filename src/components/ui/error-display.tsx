import React from 'react';
import { AlertTriangle, Clock, MapPin, Users, Calendar, X } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';

export interface ApiError {
  success: false;
  message: string;
  error: string;
  conflicts?: Array<{
    occurrenceId: string;
    sessionTitle: string;
    startTime: string;
    endTime: string;
  }>;
  suggestions?: {
    message: string;
    availableAlternatives: string[];
    conflictDetails: string;
  };
}

interface ErrorDisplayProps {
  error: ApiError | null;
  onClose?: () => void;
  className?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ 
  error, 
  onClose, 
  className = "" 
}) => {
  if (!error) return null;

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Session Creation Failed</h3>
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Main Error Message */}
      <div className="bg-red-100 border border-red-200 rounded-md p-3">
        <p className="text-sm font-medium text-red-800">{error.error}</p>
      </div>

      {/* Conflicts Section */}
      {error.conflicts && error.conflicts.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Conflicting Sessions
          </h4>
          <div className="space-y-2">
            {error.conflicts.map((conflict, index) => (
              <div key={index} className="bg-white border border-red-200 rounded-md p-3">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="text-sm font-medium text-gray-900">{conflict.sessionTitle}</h5>
                  <Badge variant="destructive" className="text-xs">
                    ID: {conflict.occurrenceId}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{conflict.startTime} - {conflict.endTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions Section */}
      {error.suggestions && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-red-800 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Suggestions
          </h4>
          <div className="bg-white border border-red-200 rounded-md p-3">
            <p className="text-sm text-gray-700 mb-3">{error.suggestions.message}</p>
            <div className="space-y-2">
              <h5 className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Available Alternatives:
              </h5>
              <ul className="space-y-1">
                {error.suggestions.availableAlternatives.map((suggestion, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-red-500 mt-1">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
            {error.suggestions.conflictDetails && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <strong>Conflict Details:</strong> {error.suggestions.conflictDetails}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 pt-2 border-t border-red-200">
        <Button
          variant="outline"
          size="sm"
          onClick={onClose}
          className="text-red-700 border-red-300 hover:bg-red-50 hover:border-red-400"
        >
          Close
        </Button>
        <Button
          size="sm"
          onClick={() => {
            // This could trigger a retry or open a different form
            onClose?.();
          }}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          Try Different Time
        </Button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
