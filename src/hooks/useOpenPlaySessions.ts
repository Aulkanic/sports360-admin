import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpenPlay, type OpenPlaySessionUI } from './useOpenPlay';
import type { OpenPlayOccurrence } from '@/services/open-play.service';

export const useOpenPlaySessions = () => {
  const navigate = useNavigate();
  const { sessions, deleteSession, isDeleting } = useOpenPlay();
  
  // Session selection state
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  
  // Participants panel state
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantsSessionId, setParticipantsSessionId] = useState<string | null>(null);
  
  // Occurrence selector state
  const [showOccurrenceSelector, setShowOccurrenceSelector] = useState(false);
  const [selectedSessionForOccurrence, setSelectedSessionForOccurrence] = useState<OpenPlaySessionUI | null>(null);
  
  // Delete confirmation state
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Open participants panel
  const openParticipants = useCallback((sessionId: string) => {
    setParticipantsSessionId(sessionId);
    setParticipantsOpen(true);
  }, []);

  // Handle session management navigation
  const handleManageSession = useCallback((session: OpenPlaySessionUI) => {
    // Check if this is a recurring session with multiple occurrences
    if (session.eventType === 'recurring' && (session as any).occurrences && (session as any).occurrences.length > 1) {
      setSelectedSessionForOccurrence(session);
      setShowOccurrenceSelector(true);
    } else {
      // For single sessions or recurring sessions with only one occurrence, go directly to management
      // Use first occurrence ID for one-time sessions
      const firstOccurrenceId = (session as any).occurrences?.[0]?.id || session.id;
      navigate(`/open-play/${session.id}?occurrenceId=${firstOccurrenceId}`, { state: { session } });
    }
  }, [navigate]);

  // Handle occurrence selection
  const handleSelectOccurrence = useCallback((occurrence: OpenPlayOccurrence) => {
    if (selectedSessionForOccurrence) {
      // Create a session object with the selected occurrence
      const sessionWithOccurrence = {
        ...selectedSessionForOccurrence,
        // Override session data with occurrence-specific data
        when: `${occurrence.occurrenceDate} • ${occurrence.startTime}–${occurrence.endTime}`,
        location: occurrence.court?.courtName || selectedSessionForOccurrence.location,
        participants: occurrence.participants || selectedSessionForOccurrence.participants,
        occurrenceId: occurrence.id
      };
      
      navigate(`/open-play/${selectedSessionForOccurrence.id}?occurrenceId=${occurrence.id}`, { 
        state: { 
          session: sessionWithOccurrence,
          occurrence: occurrence
        } 
      });
    }
  }, [selectedSessionForOccurrence, navigate]);

  // Handle session deletion
  const handleDeleteSession = useCallback(async (sessionId: string) => {
    try {
      // Check if it's dummy data
      const sessionToDelete = sessions.find(s => s.id === sessionId);
      if (sessionToDelete?.isDummy) {
        // For dummy data, just update state without API call
        console.log('Deleting dummy session:', sessionId);
        // Note: This would need to be handled by the parent component
        // since we can't directly update the sessions state here
        setDeleteId(null);
        return;
      }
      
      // For real data, call API
      await deleteSession(sessionId);
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      // For delete errors, we'll still use a simple alert since it's less critical
      // and the delete modal is already a confirmation dialog
      alert('Failed to delete session. Please try again.');
    }
  }, [sessions, deleteSession]);

  // Update participant status in local state
  const updateParticipantStatus = useCallback((playerId: string, to: string) => {
    if (!participantsSessionId) return;
    // This would need to be handled by the parent component
    // since we can't directly update the sessions state here
    console.log('Update participant status:', { playerId, to, participantsSessionId });
  }, [participantsSessionId]);

  // Get selected session
  const selectedSession = sessions.find(s => s.id === selectedSessionId);
  
  // Get participants for the selected session
  const participants = selectedSession?.participants ?? [];

  return {
    // Session data
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    selectedSession,
    participants,
    
    // Participants panel
    participantsOpen,
    setParticipantsOpen,
    participantsSessionId,
    openParticipants,
    updateParticipantStatus,
    
    // Occurrence selector
    showOccurrenceSelector,
    setShowOccurrenceSelector,
    selectedSessionForOccurrence,
    setSelectedSessionForOccurrence,
    handleSelectOccurrence,
    
    // Session management
    handleManageSession,
    handleDeleteSession,
    
    // Delete confirmation
    deleteId,
    setDeleteId,
    
    // Loading states
    isDeleting,
  };
};
