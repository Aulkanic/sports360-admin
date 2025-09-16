/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useOpenPlay } from './useOpenPlay';
import { useCreateSessionForm } from './useCreateSessionForm';
import type { CreateSessionFormData } from '@/components/features/open-play/CreateSessionForm';
import type { ApiError } from '@/components/ui/error-display';

type LevelTag = "Beginner" | "Intermediate" | "Advanced";

export const useOpenPlayForm = (sportshubId?: string) => {
  const { createSession, isCreating } = useOpenPlay();
  const { form, setForm, isOpen, openForm, closeForm } = useCreateSessionForm();
  
  // Error state
  const [createError, setCreateError] = useState<ApiError | null>(null);
  const [errorModalOpen, setErrorModalOpen] = useState(false);

  // Generate recurring occurrences
  const generateRecurringOccurrences = useCallback((
    startDate: string,
    endDate: string,
    frequency: "daily" | "weekly" | "monthly",
    startTime: string,
    endTime: string,
    capacity: number
  ) => {
    const occurrences: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);

    while (current <= end) {
      occurrences.push({
        date: current.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: startTime,
        endTime: endTime,
        capacity: capacity
      });
      switch (frequency) {
        case "daily":
          current.setDate(current.getDate() + 1);
          break;
        case "weekly":
          current.setDate(current.getDate() + 7);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    return occurrences;
  }, []);

  // Form validation
  const validateForm = useCallback((formData: CreateSessionFormData): ApiError | null => {
    const levels = Object.entries(formData.levels)
      .filter(([, v]) => v)
      .map(([k]) => k as LevelTag);

    // Basic validation
    if (!formData.title.trim() || !formData.date || !formData.startTime || !formData.endTime || !formData.courtId || levels.length === 0) {
      return {
        success: false,
        message: "Validation Error",
        error: "Please fill in all required fields",
        conflicts: [],
        suggestions: {
          message: "Please complete all required fields before creating the session",
          availableAlternatives: [
            "Check that all required fields are filled",
            "Ensure at least one skill level is selected",
            "Verify the date and time are properly set",
            "Select a court for the session"
          ],
          conflictDetails: ""
        }
      };
    }

    // Time range validation
    if (formData.startTime >= formData.endTime) {
      return {
        success: false,
        message: "Invalid Time Range",
        error: "End time must be after start time",
        conflicts: [],
        suggestions: {
          message: "Please adjust the time range for your session",
          availableAlternatives: [
            "Set an end time that is after the start time",
            "Use the quick presets for common durations",
            "Check that both times are in the correct format"
          ],
          conflictDetails: ""
        }
      };
    }

    // Recurring event validation
    if (formData.eventType === "recurring" && !formData.endDate) {
      return {
        success: false,
        message: "Recurring Event Error",
        error: "Please select an end date for recurring events",
        conflicts: [],
        suggestions: {
          message: "Recurring events require an end date to be specified",
          availableAlternatives: [
            "Select an end date for the recurring series",
            "Choose a different event type if you want a one-time event",
            "Consider the total number of sessions you want to create"
          ],
          conflictDetails: ""
        }
      };
    }

    // Tournament validation
    if (formData.eventType === "tournament" && !formData.registrationDeadline) {
      return {
        success: false,
        message: "Tournament Error",
        error: "Please set a registration deadline for tournaments",
        conflicts: [],
        suggestions: {
          message: "Tournaments require a registration deadline to be set",
          availableAlternatives: [
            "Set a registration deadline for the tournament",
            "Choose a different event type if you want a regular session",
            "Consider when participants should register by"
          ],
          conflictDetails: ""
        }
      };
    }

    return null;
  }, []);

  // Handle form submission
  const handleCreateSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null); // Clear any previous errors
    
    try {
      const levels = Object.entries(form.levels)
        .filter(([, v]) => v)
        .map(([k]) => k as LevelTag);
        
      // Validate form
      const validationError = validateForm(form);
      if (validationError) {
        setCreateError(validationError);
        return;
      }

      // Generate occurrences based on event type
      let occurrences: any[] = [];
      
      if (form.eventType === "recurring") {
        // Generate recurring occurrences
        occurrences = generateRecurringOccurrences(
          form.date,
          form.endDate,
          form.frequency,
          form.startTime,
          form.endTime,
          form.maxPlayers || 10
        );
        
        // Check for large number of occurrences
        if (occurrences.length > 50) {
          const confirm = window.confirm(`You're about to create ${occurrences.length} sessions. This may take a moment. Do you want to continue?`);
          if (!confirm) {
            return;
          }
        }
      } else {
        // Single occurrence for one-time events and tournaments
        occurrences = [{
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          capacity: form.maxPlayers || 10
        }];
      }

      // Create session data for API
      const sessionData = {
        sessionTitle: form.title.trim(),
        eventType: (form.eventType === 'recurring' ? 'recurring' : 'single') as 'recurring' | 'single',
        date: form.date,
        startTime: form.startTime,
        endTime: form.endTime,
        description: form.description.trim(),
        maxPlayers: form.maxPlayers || 10,
        pricePerPlayer: form.isFreeJoin ? 0 : (form.price || 0),
        isFreeJoin: form.isFreeJoin,
        skillLevels: levels.map(level => level.toLowerCase()),
        courtId: form.courtId,
        hubId: sportshubId?.toString() || '', 
        sportsId: "1", // TODO: Get from user context or selection
        recurringSettings: form.eventType === 'recurring' ? {
          frequency: form.frequency,
          endDate: form.endDate
        } : undefined
      };

      // Create session via API and handle promise
      try {
        await createSession(sessionData);
        // Show success message
        alert('Session created successfully!');
      } catch (error) {
        // Handle error if needed (could log or show a message)
        console.error('Failed to create session:', error);
        throw error; // rethrow to be caught by outer catch
      }
      // Close form and reset
      closeForm();
      setCreateError(null); // Clear any errors
      
    } catch (error: any) {
      console.error('Error creating session:', error);
      
      // Check if it's a structured API error (thrown from service)
      if (error && typeof error === 'object' && error.success === false) {
        setCreateError(error as ApiError);
        closeForm(); // Close the form modal
        setErrorModalOpen(true); // Open the error modal
      } else {
        // Fallback for unexpected errors
        setCreateError({
          success: false,
          message: 'Failed to create session',
          error: error?.message || 'An unexpected error occurred',
          conflicts: [],
          suggestions: {
            message: 'Please try again with different parameters',
            availableAlternatives: [
              'Try booking at a different time',
              'Use a different court if available',
              'Check availability for a different date'
            ],
            conflictDetails: ''
          }
        });
        closeForm(); // Close the form modal
        setErrorModalOpen(true); // Open the error modal
      }
    }
  }, [form, validateForm, generateRecurringOccurrences, createSession, closeForm, sportshubId]);

  // Open form with error clearing
  const openFormWithErrorClear = useCallback(() => {
    setCreateError(null);
    openForm();
  }, [openForm]);

  // Close form with error clearing
  const closeFormWithErrorClear = useCallback(() => {
    closeForm();
    setCreateError(null);
  }, [closeForm]);

  // Close error modal
  const closeErrorModal = useCallback(() => {
    setErrorModalOpen(false);
    setCreateError(null);
  }, []);

  return {
    // Form state
    form,
    setForm,
    isOpen,
    openForm: openFormWithErrorClear,
    closeForm: closeFormWithErrorClear,
    
    // Error state
    createError,
    setCreateError,
    errorModalOpen,
    setErrorModalOpen,
    closeErrorModal,
    
    // Form submission
    handleCreateSubmit,
    
    // Loading state
    isCreating,
    
    // Utility functions
    generateRecurringOccurrences,
    validateForm,
  };
};
