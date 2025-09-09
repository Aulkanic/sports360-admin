import React, { useState } from 'react';
import ErrorDisplay, { type ApiError } from '@/components/ui/error-display';
import { Button } from '@/components/ui/button';

/**
 * Demo component to showcase the error display functionality
 * This can be used for testing the error display component
 */
export const ErrorDisplayDemo: React.FC = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const simulateCourtConflictError = () => {
    setError({
      success: false,
      message: "Court availability conflict",
      error: "Court 1 is not available at 09:00-12:00 on 2025-09-12",
      conflicts: [
        {
          occurrenceId: "11",
          sessionTitle: "Morning Grind Pa More",
          startTime: "09:00",
          endTime: "11:00"
        }
      ],
      suggestions: {
        message: "Please choose a different time slot or court",
        availableAlternatives: [
          "Try booking 2 hours before or after the requested time",
          "Use a different court if available",
          "Check availability for a different date"
        ],
        conflictDetails: "Morning Grind Pa More (09:00-11:00)"
      }
    });
  };

  const simulateValidationError = () => {
    setError({
      success: false,
      message: "Validation Error",
      error: "Please fill in all required fields",
      conflicts: [],
      suggestions: {
        message: "Please complete all required fields before creating the session",
        availableAlternatives: [
          "Check that all required fields are filled",
          "Ensure at least one skill level is selected",
          "Verify the date and time are properly set"
        ],
        conflictDetails: ""
      }
    });
  };

  const simulateGenericError = () => {
    setError({
      success: false,
      message: "Failed to create session",
      error: "An unexpected error occurred while processing your request",
      conflicts: [],
      suggestions: {
        message: "Please try again with different parameters",
        availableAlternatives: [
          "Try booking at a different time",
          "Use a different court if available",
          "Check availability for a different date"
        ],
        conflictDetails: ""
      }
    });
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Error Display Demo</h2>
      <p className="text-muted-foreground">
        Click the buttons below to see different types of error displays:
      </p>
      
      <div className="flex gap-2 flex-wrap">
        <Button onClick={simulateCourtConflictError} variant="outline">
          Court Conflict Error
        </Button>
        <Button onClick={simulateValidationError} variant="outline">
          Validation Error
        </Button>
        <Button onClick={simulateGenericError} variant="outline">
          Generic Error
        </Button>
        <Button onClick={() => setError(null)} variant="outline">
          Clear Error
        </Button>
      </div>

      {error && (
        <ErrorDisplay 
          error={error} 
          onClose={() => setError(null)}
        />
      )}
    </div>
  );
};

export default ErrorDisplayDemo;
