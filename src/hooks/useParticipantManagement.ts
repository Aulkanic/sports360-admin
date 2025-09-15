import { useCallback } from "react";
import { mapParticipantStatusToPlayerStatusId, mapStatusToPlayerStatusId, updateParticipantPlayerStatusByAdmin } from "@/services/open-play.service";

interface UseParticipantManagementProps {
  currentOccurrenceId?: string | null;
  occurrence?: any | null;
  isDummySession: boolean;
  refreshSessionData: () => Promise<void>;
  isUpdatingStatus: Set<string>;
  setIsUpdatingStatus: React.Dispatch<React.SetStateAction<Set<string>>>;
  isRemovingPlayer: boolean;
  isAddingPlayer: boolean;
  setIsAddingPlayer: React.Dispatch<React.SetStateAction<boolean>>;
  addPlayerOpen: boolean;
  setAddPlayerOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useParticipantManagement = ({
  currentOccurrenceId,
  occurrence,
  isDummySession,
  refreshSessionData,
  isUpdatingStatus,
  setIsUpdatingStatus,
  isRemovingPlayer,
  isAddingPlayer,
  setIsAddingPlayer,
  addPlayerOpen,
  setAddPlayerOpen,
}: UseParticipantManagementProps) => {

  // Update participant status
  const updateStatus = useCallback(async (participantId: string, status: any) => {
    // Get the current occurrence ID
    const occurrenceId = currentOccurrenceId || occurrence?.id;

    // Check if we have occurrence data
    if (!occurrenceId) {
      alert('No occurrence ID available. Please refresh the page and try again.');
      return;
    }

    // Set loading state
    setIsUpdatingStatus(prev => new Set(prev).add(participantId));

    try {
      // Check if this is dummy data
      if (isDummySession) {
        await refreshSessionData();
        setIsUpdatingStatus(prev => {
          const newSet = new Set(prev);
          newSet.delete(participantId);
          return newSet;
        });
        return;
      }

      // Map status to player status ID
      const playerStatusId = mapParticipantStatusToPlayerStatusId(status);
      await updateParticipantPlayerStatusByAdmin(
        participantId,
        occurrenceId,
        playerStatusId
      );

      // Refresh session data to get updated participant information from server
      await refreshSessionData();
    } catch (error) {
      console.error('Error updating participant status:', error);
      // Show error message to user
      alert('Failed to update participant status. Please try again.');
    } finally {
      // Clear loading state
      setIsUpdatingStatus(prev => {
        const newSet = new Set(prev);
        newSet.delete(participantId);
        return newSet;
      });
    }
  }, [currentOccurrenceId, occurrence, isDummySession, refreshSessionData, setIsUpdatingStatus]);

  // Remove participant from all teams
  const removeFromAllTeams = useCallback(() => {
    // This function will be called with setCourtTeams from the parent component
    // The actual implementation will be handled by the parent
  }, []);

  // Approve waitlist participant
  const approveWaitlistParticipant = useCallback(async (participantId: string, targetStatus: "READY" | "RESERVE") => {
    try {
      // Get the playerStatusId for the target status
      const playerStatusId = mapStatusToPlayerStatusId(targetStatus);
      
      // Get the current occurrence ID
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      
      if (!occurrenceId) {
        alert('No occurrence ID available. Please refresh the page and try again.');
        return;
      }
      
      // Call the API to update the player status
      await updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId);
      
      // Refresh session data to get updated participant information from server
      await refreshSessionData();
      
      console.log(`Successfully approved participant ${participantId} as ${targetStatus}`);
    } catch (error) {
      console.error('Error approving waitlist participant:', error);
      alert('Failed to approve participant. Please try again.');
    }
  }, [currentOccurrenceId, occurrence, refreshSessionData]);

  // Reject waitlist participant
  const rejectWaitlistParticipant = useCallback(async (participantId: string) => {
    try {
      // Get the playerStatusId for REJECTED status (using CANCELED as closest match)
      const playerStatusId = mapStatusToPlayerStatusId("CANCELED");
      
      // Get the current occurrence ID
      const occurrenceId = currentOccurrenceId || occurrence?.id;
      
      if (!occurrenceId) {
        alert('No occurrence ID available. Please refresh the page and try again.');
        return;
      }
      
      // Call the API to update the player status
      await updateParticipantPlayerStatusByAdmin(participantId, occurrenceId, playerStatusId);
      
      // Refresh session data to get updated participant information from server
      await refreshSessionData();
      
      console.log(`Successfully rejected participant ${participantId}`);
    } catch (error) {
      console.error('Error rejecting waitlist participant:', error);
      alert('Failed to reject participant. Please try again.');
    }
  }, [currentOccurrenceId, occurrence, refreshSessionData]);

  // Handle adding new player
  const handleAddPlayer = useCallback(async (playerData: any) => {
    setIsAddingPlayer(true);
    try {
      // Close modal first
      setAddPlayerOpen(false);
      
      // Show success message (you could add a toast notification here)
      console.log('Player added successfully:', playerData);
      
      // Show success message
      console.log('✅ Player added successfully');
    } catch (error) {
      console.error('Error adding player:', error);
    } finally {
      setIsAddingPlayer(false);
    }
  }, [setIsAddingPlayer, setAddPlayerOpen]);

  // Handle successful player addition
  const handlePlayerAddSuccess = useCallback(async () => {
    console.log('Player added successfully via API');
    // Add a small delay to ensure the API has processed the new participant
    setTimeout(async () => {
      await refreshSessionData();
    }, 1000);
  }, [refreshSessionData]);

  // Handle player addition error
  const handlePlayerAddError = useCallback((error: any) => {
    console.error('Error adding player:', error);
    // You could add a toast notification here to show the error
  }, []);

  return {
    // State
    isUpdatingStatus,
    isRemovingPlayer,
    isAddingPlayer,
    addPlayerOpen,
    setAddPlayerOpen,
    
    // Functions
    updateStatus,
    removeFromAllTeams,
    approveWaitlistParticipant,
    rejectWaitlistParticipant,
    handleAddPlayer,
    handlePlayerAddSuccess,
    handlePlayerAddError,
  };
};
