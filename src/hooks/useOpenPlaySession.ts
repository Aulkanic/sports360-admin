/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { getOpenPlaySessionById } from '../services/open-play.service';
import { API_CONFIG } from '../config/api';
import { getUserProfileImageUrl } from '@/utils/image.utils';

interface UseOpenPlaySessionReturn {
  // Session data
  rawSessionData: any;
  setRawSessionData: (data: any) => void;
  
  // Occurrence data
  currentOccurrenceId: string | null;
  setCurrentOccurrenceId: (id: string | null) => void;
  currentOccurrence: any;
  
  // Participants data
  participants: any[];
  setParticipants: React.Dispatch<React.SetStateAction<any[]>>;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Error handling
  error: string | null;
  setError: (error: string | null) => void;
  
  // Actions
  refreshSessionData: () => Promise<void>;
  getUserAvatarUrl: (user: any) => string;
}

export const useOpenPlaySession = (): UseOpenPlaySessionReturn => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  
  // Get occurrenceId from URL parameters
  const occurrenceIdFromUrl = searchParams.get('occurrenceId');
  
  // State management
  const [rawSessionData, setRawSessionData] = useState<any>(null);
  const [currentOccurrenceId, setCurrentOccurrenceId] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Get current occurrence from session data
  const currentOccurrence = rawSessionData?.occurrences?.find(
    (occ: any) => occ.id === currentOccurrenceId
  );
  
  // Helper function to get avatar URL from user data
  const getUserAvatarUrl = useCallback((user: any): string => {

    if (!user) {
      return '/default_avatar.png';
    }
    
    // For registered users: check user.upload first
    if (user.upload?.filePath) {
      // If upload.filePath is a full URL, use it directly
      if (user.upload.filePath.startsWith('http')) {
        return user.upload.filePath;
      }
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.filePath}`;
    }
    
    // For registered users: if upload.fileName exists, construct URL with API_CONFIG.IMG_URL
    if (user.upload?.fileName) {
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.fileName}`;
    }
    
    // For guest users: check user.personalInfo.upload
    if (user.personalInfo?.upload?.filePath) {
      // If upload.filePath is a full URL, use it directly
      if (user.personalInfo.upload.filePath.startsWith('http')) {
        return user.personalInfo.upload.filePath;
      }
      return `${API_CONFIG.IMG_URL}/uploads/${user.personalInfo.upload.filePath}`;
    }
    
    // For guest users: if personalInfo.upload.fileName exists, construct URL with API_CONFIG.IMG_URL
    if (user.personalInfo?.upload?.fileName) {
      return `${API_CONFIG.IMG_URL}/uploads/${user.personalInfo.upload.fileName}`;
    }
    
    // If personalInfo.photoUrl exists, use it
    if (user.personalInfo?.photoUrl) {
      return user.personalInfo.photoUrl;
    }
  
    return getUserProfileImageUrl(user);
  }, []);
  
  // Refresh session data function
  const refreshSessionData = useCallback(async () => {
    if (!id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getOpenPlaySessionById(id);
      
      if (response) {
        setRawSessionData(response);
        
        // Process participants if we have occurrence-specific data
        if (currentOccurrenceId && response.occurrences) {
          const matchingOccurrence = response.occurrences.find(
            (occ: any) => occ.id === currentOccurrenceId
          );
          
          if (matchingOccurrence?.participants) {
            
            // Use raw participants data without conversion
            const freshParticipants = matchingOccurrence.participants.map((p: any) => ({
              id: p.id.toString(),
              userId: p.user?.id?.toString(),
              userName: p.user?.userName || 'Unknown User',
              firstName: p.user?.personalInfo?.firstName || '',
              lastName: p.user?.personalInfo?.lastName || '',
              email: p.user?.email || '',
              contactNo: p.user?.personalInfo?.contactNo || '',
              skillLevel: p.user?.personalInfo?.skill?.description || 'Unknown',
              skillId: p.user?.personalInfo?.skillId || null,
              avatar: getUserAvatarUrl(p.user),
              status: p.playerStatus?.description || 'READY',
              statusId: p.playerStatusId,
              playerStatus: p.playerStatus?.description || 'READY',
              playerStatusId: p.playerStatusId,
              registeredAt: p.registeredAt,
              notes: p.notes,
              paymentAmount: p.paymentAmount,
              paymentStatus: p.paymentStatus,
              updatedPlayerStatusAt: p.updatedPlayerStatusAt,
            }));
            
            setParticipants(freshParticipants);
          }
        } else if (response.participants) {
          
          // Use raw participants data without conversion
          const freshParticipants = response.participants.map((p: any) => ({
            id: p.id.toString(),
            userId: p.user?.id?.toString(),
            userName: p.user?.userName || 'Unknown User',
            firstName: p.user?.personalInfo?.firstName || '',
            lastName: p.user?.personalInfo?.lastName || '',
            email: p.user?.email || '',
            contactNo: p.user?.personalInfo?.contactNo || '',
            skillLevel: p.user?.personalInfo?.skill?.description || 'Unknown',
            skillId: p.user?.personalInfo?.skillId || null,
            avatar: getUserAvatarUrl(p.user),
            status: p.playerStatus?.description || 'READY',
            statusId: p.playerStatusId,
            playerStatus: p.playerStatus?.description || 'READY',
            playerStatusId: p.playerStatusId,
            registeredAt: p.registeredAt,
            notes: p.notes,
            paymentAmount: p.paymentAmount,
            paymentStatus: p.paymentStatus,
            updatedPlayerStatusAt: p.updatedPlayerStatusAt,
          }));
          
          setParticipants(freshParticipants);
        }
      }
    } catch (error) {
      console.error('Error refreshing session data:', error);
      setError('Failed to refresh session data');
    } finally {
      setIsLoading(false);
    }
  }, [id, currentOccurrenceId, getUserAvatarUrl]);
  
  // Set initial occurrence ID from URL parameters or session data
  useEffect(() => {
    if (occurrenceIdFromUrl) {
      setCurrentOccurrenceId(occurrenceIdFromUrl);
    } else if (rawSessionData?.occurrences?.[0]?.id) {
      setCurrentOccurrenceId(rawSessionData.occurrences[0].id);
    }
  }, [occurrenceIdFromUrl, rawSessionData]);
  
  // Initial data fetch
  useEffect(() => {
    if (id && !rawSessionData) {
      refreshSessionData();
    }
  }, [id, rawSessionData, refreshSessionData]);
  
  return {
    rawSessionData,
    setRawSessionData,
    currentOccurrenceId,
    setCurrentOccurrenceId,
    currentOccurrence,
    participants,
    setParticipants,
    isLoading,
    setIsLoading,
    error,
    setError,
    refreshSessionData,
    getUserAvatarUrl,
  };
};
