/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SplashVideo from "@/components/SplashVideo";
import { AllCourtsView, FocusedCourtView } from "@/components/matchup";
import { getGameMatchesByOccurrenceId } from "@/services/game-match.service";
import { getOpenPlaySessionById } from "@/services/open-play.service";
import { getAllCourts } from "@/services/court.service";
import { 
  ArrowLeft,
  Play,
  Pause,
  Grid3X3
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  level: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
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
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [focusedCourtId, setFocusedCourtId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setCurrentTime] = useState(new Date());
  const [showSplashVideo, setShowSplashVideo] = useState(false);
  const [pendingCourtId, setPendingCourtId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Fetching matchup data for occurrence:', occurrenceId);
      
      // First, get session info to get the hub ID
      let sessionInfo = null;
      let hubId = null;
      
      try {
        // Try to get session info from the occurrence
        const gameMatches = await getGameMatchesByOccurrenceId(occurrenceId);
        if (gameMatches.length > 0 && gameMatches[0]?.occurrence?.sessionId) {
          sessionInfo = await getOpenPlaySessionById(gameMatches[0].occurrence.sessionId);
          hubId = (sessionInfo as any)?.hubId;
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
      
      // Fetch game matches for the occurrence
      const gameMatches = await getGameMatchesByOccurrenceId(occurrenceId);
      console.log('Fetched game matches:', gameMatches);
      
      // Create a map of courtId to match for quick lookup
      const courtToMatchMap = new Map();
      gameMatches.forEach((match: any) => {
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
            match.participants.forEach((participant: any, index: number) => {
              const player: Participant = {
                id: participant.id?.toString() || `p${index}`,
                name: participant.user?.personalInfo ? 
                  `${participant.user.personalInfo.firstName} ${participant.user.personalInfo.lastName}`.trim() :
                  participant.user?.userName || 'Unknown Player',
                avatar: '', // No avatar in API response
                initials: participant.user?.personalInfo ? 
                  `${participant.user.personalInfo.firstName?.[0] || ''}${participant.user.personalInfo.lastName?.[0] || ''}` :
                  participant.user?.userName?.[0] || 'U',
                level: (participant.skillLevel || 'Intermediate') as 'Beginner' | 'Intermediate' | 'Advanced',
                status: match.gameStatus === 'in_progress' ? 'In-Game' : 'Ready' as any
              };
              
              // Distribute players between teams (simple alternating)
              if (index % 2 === 0) {
                teamA.push(player);
              } else {
                teamB.push(player);
              }
            });
          }
          
          return {
            id: court.id,
            name: court.courtName || `Court ${court.id}`,
            capacity: court.capacity || 4,
            status: match.gameStatus === 'in_progress' ? 'In-Game' : 
                    match.gameStatus === 'completed' ? 'Closed' : 'Open',
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
    
    if (location.state?.matchup) {
      // Use data passed from parent window
      setMatchup(location.state.matchup);
      setFocusedCourtId(location.state.matchup.focusedCourtId || activeCourtId);
    } else if (activeOccurrenceId) {
      // Fetch real data based on occurrence ID
      console.log('Fetching real data for occurrence:', activeOccurrenceId);
      fetchMatchupData(activeOccurrenceId);
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
  }, [id, location.state]);

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
        <div className="fixed inset-0 h-screen w-screen overflow-hidden relative z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{ margin: 0, padding: 0 }}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
          </div> 
          
          {/* Header */}
          <div className="relative z-10 p-2">
            <div className="flex justify-between items-center px-6">
              {/* Sport Title - Left aligned */}
              <div className="bg-black/80 backdrop-blur-sm rounded-xl px-6 py-3 shadow-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <div>
                    <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                      {matchup.sport}
                    </h1>
                    {matchup.hubName && (
                      <p className="text-sm text-white/80 mt-1">
                        {matchup.hubName}
                      </p>
                    )}
                    {matchup.occurrenceDate && matchup.occurrenceStartTime && matchup.occurrenceEndTime && (
                      <p className="text-xs text-white/60 mt-1">
                        {new Date(matchup.occurrenceDate).toLocaleDateString()} • {matchup.occurrenceStartTime} - {matchup.occurrenceEndTime}
                      </p>
                    )}
                  </div>
                  <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-black rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content - Grid view */}
          <div className="flex-1 flex items-center justify-center px-2 py-2 w-full h-[calc(100vh-120px)]">
            <div className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 hover:scrollbar-thumb-gray-500 scroll-smooth">
              <AllCourtsView
                courts={matchup.courts}
                focusedCourtId={focusedCourtId}
                onFocusCourt={focusCourt}
              />
            </div>
          </div>
          
          {/* Controls - Bottom right corner */}
          <div className="absolute bottom-4 right-4 flex gap-2">
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
