/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SplashVideo from "@/components/SplashVideo";
import { AllCourtsView, FocusedCourtView } from "@/components/matchup";
import { getGameMatchesByOccurrenceId } from "@/services/game-match.service";
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
    if (!user) {
      return '/default_avatar.png';
    }
    
    // For registered users: check user.upload first
    if (user.upload?.filePath) {
      if (user.upload.filePath.startsWith('http')) {
        return user.upload.filePath;
      }
      // If it's a relative path, construct URL with API_CONFIG.IMG_URL
      return `${API_CONFIG.IMG_URL}${user.upload.filePath}`;
    }
    
    if (user.upload?.fileName) {
      return `${API_CONFIG.IMG_URL}/uploads/${user.upload.fileName}`;
    }
    
    // For guest users: check user.personalInfo.upload
    if (user.personalInfo?.upload?.filePath) {
      // If upload.filePath is a full URL, use it directly
      if (user.personalInfo.upload.filePath.startsWith('http')) {
        return user.personalInfo.upload.filePath;
      }
      // If it's a relative path, construct URL with API_CONFIG.IMG_URL
      return `${API_CONFIG.IMG_URL}${user.personalInfo.upload.filePath}`;
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

  // Convert game match participant to our Participant interface
  const convertGameMatchParticipant = (participant: any): Participant => {
    return {
      id: participant.id.toString(),
      name: participant.user?.personalInfo ? 
        `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}`.trim() :
        participant.user?.userName || 'Unknown Player',
      avatar: participant.user ? getUserAvatarUrl(participant.user) : '',
      initials: participant.user?.personalInfo ? 
        `${participant.user.personalInfo.firstName?.[0]}${participant.user.personalInfo.lastName?.[0]}` :
        participant.user?.userName?.[0] || 'U',
      level: (participant.user?.personalInfo?.skill?.description || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
      status: 'Ready' as any, // Default status for game match participants
      // API fields
      playerStatusId: participant.playerStatusId,
      registeredAt: participant.joinedAt,
      notes: null,
      statusId: participant.playerStatusId,
      paymentAmount: null,
      apiPaymentStatus: null,
      updatedPlayerStatusAt: participant.updatedAt,
      user: participant.user ? {
        ...participant.user,
        personalInfo: participant.user.personalInfo ? {
          ...participant.user.personalInfo,
          upload: participant.user.personalInfo.upload || undefined
        } : undefined
      } : undefined,
      apiStatus: undefined,
      playerStatus: undefined,
      email: participant.user?.email,
      contactNo: participant.user?.personalInfo?.contactNo || undefined,
      paymentStatus: 'Paid' as 'Paid' | 'Pending' | 'Rejected',
      skillLevel: participant.user?.personalInfo?.skill?.description || 'Intermediate',
      matchCount: participant.matchCount || 0
    };
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real data based on occurrence ID using only two APIs
  const fetchMatchupData = async (occurrenceId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get hubId from localStorage or use default
      const hubId = localStorage.getItem('activeHubId') || '1';
      
      // Fetch game matches and courts in parallel
      const [gameMatches, allCourts] = await Promise.all([
        getGameMatchesByOccurrenceId(occurrenceId),
        getAllCourts({ hubId: hubId })
      ]);
      const activeGameMatches = gameMatches.filter((match: any) => {
        const statusId = match.matchStatusId;
        const isActive = statusId && Number(statusId) <= 10;
        return isActive;
      });
      
      
      // Create a map of courtId to match for quick lookup
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
            match.participants.forEach((participant: any) => {
              const player = convertGameMatchParticipant(participant);
              
              // Distribute players between teams based on teamNumber (1 = Team A, 2 = Team B)
              if (participant.teamNumber === 1) {
                teamA.push(player);
              } else if (participant.teamNumber === 2) {
                teamB.push(player);
              }
            });
          }
          
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: (match.matchStatusId === 5) ? 'In-Game' : 
                    (match.matchStatusId === 6) ? 'Closed' : 'Open',
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
        sport: gameMatches[0]?.occurrence?.session?.sport?.name || 'Pickleball',
        hubName: gameMatches[0]?.occurrence?.session?.hub?.sportsHubName,
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
      fetchMatchupData(finalOccurrenceId);
    } else {
      // Fallback to sample data if no occurrence ID available
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
    setPendingCourtId(courtId);
    setShowSplashVideo(true);
  };
  

  const handleSplashVideoEnd = () => {
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
        onPlay={() => console.log("Video playing")}
        onError={() => console.error("Video error")}
        loadingText="Loading Match..."
        playButtonText="Click to Play Video"
        timeoutMs={7500}
      />
      
      {focusedCourtId ? (
        // Focused Court Page - Full screen dedicated view
        <div className="inset-0 h-screen w-screen overflow-hidden relative z-50" style={{ margin: 0, padding: 0 }}>
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


