/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SplashVideo from "@/components/SplashVideo";
import { AllCourtsView, FocusedCourtView } from "@/components/matchup";
import { getGameMatchesByOccurrenceId } from "@/services/game-match.service";
import { getOpenPlaySessionById } from "@/services/open-play.service";
import { getAllCourts } from "@/services/court.service";
import { getUserProfileImageUrl } from "@/utils/image.utils";
import { API_CONFIG } from "@/config/api";
import { 
  ArrowLeft,
  Play,
  Pause,
  Grid3X3
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  level?: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
  // API fields
  playerStatusId?: number;
  registeredAt?: string;
  notes?: string | null;
  statusId?: number;
  paymentAmount?: string | null;
  apiPaymentStatus?: string | null;
  updatedPlayerStatusAt?: string | null;
  user?: {
    id: string;
    userName: string;
    email: string;
    upload?: {
      id: string;
      fileName: string;
      filePath: string;
      fileType?: string;
      fileSize?: string;
    } | null;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo?: string;
      skillId?: number;
      upload?: {
        id: string;
        fileName: string;
        filePath: string;
      };
      skill?: {
        id: number;
        description: string;
      };
    };
  };
  apiStatus?: {
    id: number;
    description: string;
  };
  playerStatus?: {
    id: number;
    description: string;
  };
  email?: string;
  contactNo?: string;
  paymentStatus?: 'Paid' | 'Pending' | 'Rejected';
  skillLevel?: string;
  matchCount?: number;
}

interface Court {
  id: string;
  name: string;
  capacity: number;
  status: "Open" | "In-Game" | "Closed";
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  startTime?: string;
  endTime?: string;
  score?: string;
  winner?: "A" | "B";
}

interface MatchupData {
  id: string;
  sport: string;
  hubName?: string;
  occurrenceId?: string;
  occurrenceDate?: string;
  occurrenceStartTime?: string;
  occurrenceEndTime?: string;
  courts: Court[];
  focusedCourtId?: string;
}

const MatchupScreenMulti: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  
  // Helper function to get avatar URL from user data (same as useOpenPlaySession hook)
  const getUserAvatarUrl = (user: any): string => {
    console.log('getUserAvatarUrl: Processing user:', user);
    if (!user) {
      console.log('getUserAvatarUrl: No user provided');
      return '/default_avatar.png';
    }
    
    // For registered users: check user.upload first
    if (user.upload?.filePath) {
      console.log('getUserAvatarUrl: Found user.upload.filePath:', user.upload.filePath);
      // If upload.filePath is a full URL, use it directly
      if (user.upload.filePath.startsWith('http')) {
        console.log('getUserAvatarUrl: Using full URL from user.upload.filePath');
        return user.upload.filePath;
      }
      // If it's a relative path, construct URL with API_CONFIG.IMG_URL
      console.log('getUserAvatarUrl: Constructing URL with API_CONFIG.IMG_URL');
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.filePath}`;
    }
    
    // For registered users: if upload.fileName exists, construct URL with API_CONFIG.IMG_URL
    if (user.upload?.fileName) {
      console.log('getUserAvatarUrl: Found user.upload.fileName:', user.upload.fileName);
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.fileName}`;
    }
    
    // For guest users: check user.personalInfo.upload
    if (user.personalInfo?.upload?.filePath) {
      console.log('getUserAvatarUrl: Found user.personalInfo.upload.filePath:', user.personalInfo.upload.filePath);
      // If upload.filePath is a full URL, use it directly
      if (user.personalInfo.upload.filePath.startsWith('http')) {
        console.log('getUserAvatarUrl: Using full URL from user.personalInfo.upload.filePath');
        return user.personalInfo.upload.filePath;
      }
      // If it's a relative path, construct URL with API_CONFIG.IMG_URL
      console.log('getUserAvatarUrl: Constructing URL with API_CONFIG.IMG_URL for personalInfo');
      return `${API_CONFIG.IMG_URL}/uploads/${user.personalInfo.upload.filePath}`;
    }
    
    // For guest users: if personalInfo.upload.fileName exists, construct URL with API_CONFIG.IMG_URL
    if (user.personalInfo?.upload?.fileName) {
      console.log('getUserAvatarUrl: Found user.personalInfo.upload.fileName:', user.personalInfo.upload.fileName);
      return `${API_CONFIG.IMG_URL}/uploads/${user.personalInfo.upload.fileName}`;
    }
    
    // If personalInfo.photoUrl exists, use it
    if (user.personalInfo?.photoUrl) {
      console.log('getUserAvatarUrl: Found user.personalInfo.photoUrl:', user.personalInfo.photoUrl);
      return user.personalInfo.photoUrl;
    }
    
    // Fallback to getUserProfileImageUrl utility
    console.log('getUserAvatarUrl: Using fallback getUserProfileImageUrl');
    return getUserProfileImageUrl(user);
  };
  
  // Get occurrence ID from URL params
  const urlParams = new URLSearchParams(location.search);
  const occurrenceId = urlParams.get('occurrenceId');
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [focusedCourtId, setFocusedCourtId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setCurrentTime] = useState(new Date());
  const [showSplashVideo, setShowSplashVideo] = useState(false);
  const [pendingCourtId, setPendingCourtId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  // Debug session data changes
  useEffect(() => {
    console.log('🔍 SESSION DATA CHANGED:', sessionData);
    if (sessionData?.occurrences) {
      console.log('📊 SESSION DATA OCCURRENCES:', sessionData.occurrences);
      sessionData.occurrences.forEach((occ: any, index: number) => {
        console.log(`🏟️ OCCURRENCE ${index}:`, {
          id: occ.id,
          participantsCount: occ.participants?.length,
          participants: occ.participants?.map((p: any) => ({
            id: p.id,
            participantId: p.id,
            name: p.user?.personalInfo?.firstName,
            email: p.user?.email,
            userId: p.user?.id
          }))
        });
      });
    } else {
      console.log('❌ NO SESSION DATA OCCURRENCES FOUND');
    }
  }, [sessionData]);

  // Get full participant information by matching participant ID
  const getFullParticipantInfo = (participantId: string) => {
    
    // First check if we have session data with occurrence participants
    if (sessionData?.occurrences) {
      console.log('✅ SESSION DATA HAS OCCURRENCES, SEARCHING...');
      for (const occurrence of sessionData.occurrences) {
        console.log(`🏟️ CHECKING OCCURRENCE ${occurrence.id}:`, {
          id: occurrence.id,
          participantsCount: occurrence.participants?.length,
          participants: occurrence.participants?.map((p: any) => ({
            id: p.id,
            idType: typeof p.id,
            name: p.user?.personalInfo?.firstName
          }))
        });
        
        if (occurrence.participants) {
          console.log('👥 OCCURRENCE PARTICIPANTS:', occurrence.participants.map((p: any) => ({ 
            id: p.id, 
            idString: p.id.toString(),
            name: p.user?.personalInfo?.firstName 
          })));
          
          const fullParticipant = occurrence.participants.find((p: any) => {
            const match = p.id.toString() === participantId;
            console.log(`🔍 COMPARING: ${p.id} (${typeof p.id}) === ${participantId} (${typeof participantId}) = ${match}`);
            return match;
          });
          
          if (fullParticipant) {
            console.log('✅ FOUND FULL PARTICIPANT:', {
              id: fullParticipant.id,
              name: fullParticipant.user?.personalInfo?.firstName,
              email: fullParticipant.user?.email,
              user: fullParticipant.user
            });
            
            const enrichedParticipant = {
              id: fullParticipant.id.toString(),
              name: fullParticipant.user?.personalInfo ? 
                `${fullParticipant.user.personalInfo.firstName} ${fullParticipant.user.personalInfo.lastName}`.trim() :
                fullParticipant.user?.userName || 'Unknown Player',
              avatar: fullParticipant.user ? getUserAvatarUrl(fullParticipant.user) : '',
              initials: fullParticipant.user?.personalInfo ? 
                `${fullParticipant.user.personalInfo.firstName?.[0]}${fullParticipant.user.personalInfo.lastName?.[0]}` :
                fullParticipant.user?.userName?.[0] || '?',
              level: (fullParticipant.user?.personalInfo?.skill?.description || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
              status: (fullParticipant.playerStatus?.description === 'READY' ? 'Ready' : 
                      fullParticipant.playerStatus?.description === 'IN-GAME' ? 'In-Game' :
                      fullParticipant.playerStatus?.description === 'RESTING' ? 'Resting' :
                      fullParticipant.playerStatus?.description === 'RESERVE' ? 'Reserve' :
                      fullParticipant.playerStatus?.description === 'WAITLIST' ? 'Waitlist' : 'Ready') as any,
              // API fields
              playerStatusId: fullParticipant.playerStatusId,
              registeredAt: fullParticipant.registeredAt,
              notes: fullParticipant.notes,
              statusId: fullParticipant.statusId,
              paymentAmount: fullParticipant.paymentAmount,
              apiPaymentStatus: fullParticipant.paymentStatus,
              updatedPlayerStatusAt: fullParticipant.updatedPlayerStatusAt,
              user: fullParticipant.user ? {
                ...fullParticipant.user,
                personalInfo: fullParticipant.user.personalInfo ? {
                  ...fullParticipant.user.personalInfo,
                  upload: fullParticipant.user.personalInfo.upload || undefined
                } : undefined
              } : undefined,
              apiStatus: fullParticipant.status,
              playerStatus: fullParticipant.playerStatus,
              email: fullParticipant.user?.email,
              contactNo: fullParticipant.user?.personalInfo?.contactNo || undefined,
              paymentStatus: (fullParticipant.paymentStatus === 'Paid' ? 'Paid' : 
                             fullParticipant.paymentStatus === 'Pending' ? 'Pending' : 
                             fullParticipant.paymentStatus === 'Rejected' ? 'Rejected' : 'Paid') as 'Paid' | 'Pending' | 'Rejected',
              skillLevel: fullParticipant.user?.personalInfo?.skill?.description || 'Intermediate',
              matchCount: fullParticipant.matchCount || 0
            };
            
            console.log('🎯 RETURNING ENRICHED PARTICIPANT:', enrichedParticipant);
            return enrichedParticipant;
          }
        }
      }
    } else {
      console.log('❌ NO SESSION DATA OCCURRENCES AVAILABLE');
    }
    
    console.log('❌ NO FULL PARTICIPANT FOUND FOR ID:', participantId);
    console.log('📊 AVAILABLE SESSION DATA:', sessionData);
    return null;
  };

  // Log state changes (reduced logging)
  useEffect(() => {
    if (showSplashVideo) {
      console.log('🔄 SPLASH VIDEO STATE - showSplashVideo:', showSplashVideo, 'pendingCourtId:', pendingCourtId);
    }
  }, [showSplashVideo, pendingCourtId]);

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real data based on occurrence ID
  const fetchMatchupData = async (occurrenceId: string) => {
    console.log('🚀 FETCHING MATCHUP DATA FOR OCCURRENCE:', occurrenceId);
    setIsLoading(true);
    setError(null);
    
    try {
      // First, get session info to get the hub ID
      let sessionInfo = null;
      let hubId = null;
      
      let gameMatches: any[] = [];
      
      try {
        // First fetch game matches to get session ID
        console.log('📡 CALLING getGameMatchesByOccurrenceId...');
        gameMatches = await getGameMatchesByOccurrenceId(occurrenceId);
        console.log('📊 FETCHED GAME MATCHES:', {
          occurrenceId,
          matchesCount: gameMatches.length,
          matches: gameMatches.map((match, index) => ({
            index,
            id: match.id,
            occurrenceId: match.occurrenceId,
            courtId: match.courtId,
            participantsCount: match.participants?.length,
            participants: match.participants?.map((p: any) => ({
              id: p.id,
              participantId: p.participantId,
              teamNumber: p.teamNumber,
              hasUser: !!p.user
            }))
          }))
        });
        
        if (gameMatches.length > 0 && gameMatches[0]?.occurrence?.sessionId) {
          const sessionId = gameMatches[0].occurrence.sessionId;
          console.log('📡 CALLING getOpenPlaySessionById with sessionId:', sessionId);
          // Fetch session info using the session ID from the occurrence
          sessionInfo = await getOpenPlaySessionById(sessionId);
          hubId = (sessionInfo as any)?.hubId;
          // Store session data for participant matching
          setSessionData(sessionInfo);
          console.log('✅ FETCHED SESSION INFO:', {
            sessionId,
            hubId,
            occurrencesCount: sessionInfo?.occurrences?.length,
            firstOccurrenceParticipants: sessionInfo?.occurrences?.[0]?.participants?.length,
            participants: sessionInfo?.occurrences?.[0]?.participants?.map((p: any) => ({
              id: p.id,
              name: p.user?.personalInfo?.firstName,
              email: p.user?.email,
              userId: p.user?.id
            }))
          });
        } else {
          console.warn('❌ NO SESSION ID FOUND IN GAME MATCHES');
        }
      } catch (sessionError) {
        console.warn('Could not fetch session info:', sessionError);
      }
      
      // If we don't have hubId from session, try to get it from localStorage or use a default
      if (!hubId) {
        // You might want to store hubId in localStorage when opening the matchup
        hubId = localStorage.getItem('activeHubId') || '1'; // Default fallback
      }
      
      // Fetch all courts from the hub using the correct API
      console.log('Fetching courts for hubId:', hubId);
      const allCourts = await getAllCourts({ hubId: hubId });
      console.log('Fetched all courts from /courts/get-all-courts:', allCourts);
      
      // Filter to show only active matches (matchStatusId <= 10)
      const activeGameMatches = gameMatches.filter((match: any) => {
        const statusId = match.matchStatusId;
        const isActive = statusId && Number(statusId) <= 10;
        console.log(`🔍 Filtering matchup match ${match.id}:`, { matchStatusId: statusId, type: typeof statusId, isActive });
        return isActive;
      });
      
      console.log('Using active game matches only:', {
        totalMatches: gameMatches.length,
        activeMatches: activeGameMatches.length,
        activeMatchIds: activeGameMatches.map(m => ({ id: m.id, matchStatusId: m.matchStatusId }))
      });
      
      // Create a map of courtId to match for quick lookup (only active matches)
      const courtToMatchMap = new Map();
      activeGameMatches.forEach((match: any) => {
        if (match.courtId) {
          courtToMatchMap.set(match.courtId, match);
        }
      });
      
      // Convert all courts to the expected format
      const courts: Court[] = allCourts.map((court: any) => {
        const match = courtToMatchMap.get(court.id);
        
        if (match) {
          // This court has a match - show match details
          const teamA: Participant[] = [];
          const teamB: Participant[] = [];
          
          if (match.participants && match.participants.length > 0) {
            console.log(`🎮 PROCESSING MATCH ${match.id} PARTICIPANTS:`, match.participants.length);
            match.participants.forEach((participant: any, index: number) => {
              // Use participantId instead of id for matching
              const participantId = (participant as any).participantId?.toString() || participant.id?.toString() || `p${index}`;
              console.log(`👤 PROCESSING PARTICIPANT ${index}:`, {
                participantId,
                teamNumber: participant.teamNumber,
                hasUser: !!participant.user,
                user: participant.user
              });
              
              // Try to get full participant info from session data
              console.log(`🔍 CALLING getFullParticipantInfo for participantId: ${participantId}`);
              const fullParticipantInfo = getFullParticipantInfo(participantId);
              console.log(`📊 getFullParticipantInfo result:`, fullParticipantInfo);
              
              const player: Participant = fullParticipantInfo || {
                id: participantId,
                name: participant.user?.personalInfo ? 
                  `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}`.trim() :
                  participant.user?.userName || 'Unknown Player',
                avatar: participant.user ? getUserAvatarUrl(participant.user) : '',
                initials: participant.user?.personalInfo ? 
                  `${participant.user.personalInfo.firstName?.[0] || ''}${participant.user.personalInfo.lastName?.[0] || ''}` :
                  participant.user?.userName?.[0] || 'U',
                level: (participant.user?.personalInfo?.skill?.description || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
                status: (match.gameStatus === 5 || match.gameStatus === '5' || 
                    match.gameStatus?.toLowerCase() === 'ingame' || 
                    match.gameStatus?.toLowerCase() === 'in_progress') ? 'In-Game' : 'Ready' as any,
                // API fields
                playerStatusId: participant.playerStatusId,
                registeredAt: participant.registeredAt,
                notes: participant.notes,
                statusId: participant.statusId,
                paymentAmount: participant.paymentAmount,
                apiPaymentStatus: participant.paymentStatus,
                updatedPlayerStatusAt: participant.updatedPlayerStatusAt,
                user: participant.user ? {
                  ...participant.user,
                  personalInfo: participant.user.personalInfo ? {
                    ...participant.user.personalInfo,
                    upload: participant.user.personalInfo.upload || undefined
                  } : undefined
                } : undefined,
                apiStatus: participant.status,
                playerStatus: participant.playerStatus,
                email: participant.user?.email,
                contactNo: participant.user?.personalInfo?.contactNo || undefined,
                paymentStatus: (participant.paymentStatus === 'Paid' ? 'Paid' : 
                               participant.paymentStatus === 'Pending' ? 'Pending' : 
                               participant.paymentStatus === 'Rejected' ? 'Rejected' : 'Paid') as 'Paid' | 'Pending' | 'Rejected',
                skillLevel: participant.user?.personalInfo?.skill?.description || 'Intermediate',
                matchCount: participant.matchCount || 0
              };
              
              console.log(`🎯 CREATED PLAYER OBJECT:`, {
                id: player.id,
                name: player.name,
                teamNumber: participant.teamNumber,
                hasUser: !!player.user
              });
              
              // Distribute players between teams based on teamNumber (1 = Team A, 2 = Team B)
              if ((participant as any).teamNumber === 1) {
                teamA.push(player);
                console.log(`✅ ADDED TO TEAM A:`, player.name);
              } else if ((participant as any).teamNumber === 2) {
                teamB.push(player);
                console.log(`✅ ADDED TO TEAM B:`, player.name);
              } else {
                // Fallback to alternating if no teamNumber
                if (index % 2 === 0) {
                  teamA.push(player);
                  console.log(`✅ ADDED TO TEAM A (fallback):`, player.name);
                } else {
                  teamB.push(player);
                  console.log(`✅ ADDED TO TEAM B (fallback):`, player.name);
                }
              }
            });
          }
          
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: (match.gameStatus === 5 || match.gameStatus === '5' || 
                    match.gameStatus?.toLowerCase() === 'ingame' || 
                    match.gameStatus?.toLowerCase() === 'in_progress') ? 'In-Game' : 
                    (match.gameStatus === 6 || match.gameStatus === '6' || 
                    match.gameStatus?.toLowerCase() === 'ended' || 
                    match.gameStatus?.toLowerCase() === 'completed') ? 'Closed' : 'Open',
            teamA,
            teamB,
            teamAName: match.team1Name,
            teamBName: match.team2Name,
            startTime: match.startTime,
            endTime: match.endTime,
            score: match.team1Score && match.team2Score ? `${match.team1Score}-${match.team2Score}` : undefined,
            winner: match.winner as "A" | "B" | undefined
          };
        } else {
          // This court has no match - show waiting card
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: 'Open' as const,
            teamA: [],
            teamB: [],
            teamAName: undefined,
            teamBName: undefined,
            startTime: undefined,
            endTime: undefined,
            score: undefined,
            winner: undefined
          };
        }
      });
      
      // Create matchup data
      const matchupData: MatchupData = {
        id: `matchup-${occurrenceId}`,
        sport: (sessionInfo as any)?.sport?.name || 'Pickleball',
        hubName: (sessionInfo as any)?.hub?.sportsHubName,
        occurrenceId: occurrenceId,
        occurrenceDate: gameMatches[0]?.occurrence?.occurrenceDate,
        occurrenceStartTime: gameMatches[0]?.occurrence?.startTime,
        occurrenceEndTime: gameMatches[0]?.occurrence?.endTime,
        courts: courts,
        focusedCourtId: localStorage.getItem('activeCourtId') || undefined
      };
      
      setMatchup(matchupData);
      setFocusedCourtId(matchupData.focusedCourtId || null);
      
    } catch (error) {
      console.error('Error fetching matchup data:', error);
      setError('Failed to load matchup data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure full screen display
  useEffect(() => {
    const originalStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow
    };
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.margin = originalStyle.margin;
      document.body.style.padding = originalStyle.padding;
      document.body.style.overflow = originalStyle.overflow;
    };
  }, []);

  // Cleanup localStorage when component unmounts (window closes)
  useEffect(() => {
    const handleBeforeUnload = () => {
      localStorage.removeItem('activeCourtId');
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      localStorage.removeItem('activeCourtId');
    };
  }, []);

  // Get matchup data from location state, postMessage, or fetch from API
  useEffect(() => {
    // Check localStorage for active court and occurrence
    const activeCourtId = localStorage.getItem('activeCourtId');
    const activeOccurrenceId = localStorage.getItem('activeOccurrenceId');
    
    // Prioritize occurrence ID from URL params
    const finalOccurrenceId = occurrenceId || activeOccurrenceId;
    
    if (location.state?.matchup) {
      // Use data passed from parent window
      setMatchup(location.state.matchup);
      setFocusedCourtId(location.state.matchup.focusedCourtId || activeCourtId);
    } else if (finalOccurrenceId) {
      // Fetch real data based on occurrence ID (from URL params or localStorage)
      console.log('Fetching real data for occurrence:', finalOccurrenceId);
      fetchMatchupData(finalOccurrenceId);
    } else {
      // Fallback to sample data if no occurrence ID available
      console.log('No occurrence ID found, using sample data');
      setMatchup({
        id: id || "match-1",
        sport: "Pickleball",
        courts: []
      });
      if (activeCourtId) {
        setFocusedCourtId(activeCourtId);
      }
    }
  }, [id, location.state, occurrenceId]);

  // Listen for postMessage data from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'MATCHUP_DATA') {
        setMatchup(event.data.data);
        const courtId = event.data.data.focusedCourtId || null;
        setFocusedCourtId(courtId);
        // Update localStorage with the new active court
        if (courtId) {
          localStorage.setItem('activeCourtId', courtId);
        } else {
          localStorage.removeItem('activeCourtId');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const focusCourt = (courtId: string) => {
    console.log('🎯 FOCUS COURT:', courtId);
    setPendingCourtId(courtId);
    setShowSplashVideo(true);
  };
  

  const handleSplashVideoEnd = () => {
    console.log('🎬 VIDEO ENDED - transitioning to match card');
    if (pendingCourtId) {
      setFocusedCourtId(pendingCourtId);
      localStorage.setItem('activeCourtId', pendingCourtId);
      setPendingCourtId(null);
    }
    setShowSplashVideo(false);
  };
  

  const showAllCourts = () => {
    setFocusedCourtId(null);
    // Clear from localStorage
    localStorage.removeItem('activeCourtId');
  };



  // Show loading state
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 mx-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <h1 className="text-4xl font-bold mb-4">Loading Matchup</h1>
          <p className="text-xl mb-8">Fetching courts and players...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error Loading Matchup</h1>
          <p className="text-xl mb-8">{error}</p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => window.location.reload()} className="bg-primary hover:bg-primary/90">
              Try Again
            </Button>
            <Button onClick={() => navigate(-1)} variant="outline" className="border-white text-white hover:bg-white/10">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!matchup) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Match Not Found</h1>
          <p className="text-xl mb-8">The matchup you're looking for doesn't exist.</p>
          <Button onClick={() => navigate(-1)} className="bg-primary hover:bg-primary/90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <SplashVideo
        key="splash-video"
        src="/splash_screen.mp4"
        show={showSplashVideo}
        onEnd={handleSplashVideoEnd}
        onPlay={() => console.log("🎥 Video playing")}
        onError={() => console.error("🎥 Video error")}
        loadingText="Loading Match..."
        playButtonText="Click to Play Video"
        timeoutMs={7500}
      />
      
      {focusedCourtId ? (
        // Focused Court Page - Full screen dedicated view
        <div className="fixed inset-0 h-screen w-screen overflow-hidden relative z-50" style={{ margin: 0, padding: 0 }}>
          {/* Focused Court Content - Takes full screen */}
          <div className="w-full h-full">
            <FocusedCourtView
              court={matchup.courts.find(c => c.id === focusedCourtId)!}
              focusedCourtId={focusedCourtId}
              onFocusCourt={focusCourt}
            />
          </div>
          
          {/* Minimal Controls Overlay - Top right corner */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            <Button
              onClick={showAllCourts}
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10 bg-black/70 backdrop-blur-sm"
            >
              <Grid3X3 className="h-4 w-4 mr-2" />
              All Courts
            </Button>
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10 bg-black/70 backdrop-blur-sm"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </div>
      ) : (
        // All Courts Page - Grid view with header and controls
        <div className="h-screen w-screen overflow-y-auto relative z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{ margin: 0, padding: 0 }}>
     
          {/* Main Content - Grid view */}
          <div className=" flex items-center justify-center px-2 py-2 w-full overflow-y-auto">
              <AllCourtsView
                courts={matchup.courts}
                focusedCourtId={focusedCourtId}
                onFocusCourt={focusCourt}
              />
         
          </div>
          
          {/* Controls - Bottom right corner */}
          <div className="absolute top-4 right-4 flex gap-2 z-50">
            {!isFullscreen && (
              <Button
                onClick={() => navigate(-1)}
                variant="outline"
                size="sm"
                className="text-white border-white/30 hover:bg-white/10 bg-black/70 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={toggleFullscreen}
              variant="outline"
              size="sm"
              className="text-white border-white/30 hover:bg-white/10 bg-black/70 backdrop-blur-sm"
            >
              {isFullscreen ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Exit
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default MatchupScreenMulti;


