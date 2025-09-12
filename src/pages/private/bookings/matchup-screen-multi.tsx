/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SplashVideo from "@/components/SplashVideo";
import { AllCourtsView, FocusedCourtView } from "@/components/matchup";
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

  // Get matchup data from location state, postMessage, or create sample data
  useEffect(() => {
    // Check localStorage for active court
    const activeCourtId = localStorage.getItem('activeCourtId');
    
    if (location.state?.matchup) {
      setMatchup(location.state.matchup);
      setFocusedCourtId(location.state.matchup.focusedCourtId || activeCourtId);
    } else {
      // Sample matchup data for demonstration
      setMatchup({
        id: id || "match-1",
        sport: "Pickleball",
        courts: [
          {
            id: "court-1",
            name: "Court 1",
            capacity: 4,
            status: "In-Game",
            teamA: [
              {
                id: "p1",
                name: "Alice Johnson",
                avatar: "https://i.pravatar.cc/100?img=1",
                initials: "AJ",
                level: "Intermediate",
                status: "In-Game"
              },
              {
                id: "p2",
                name: "Bob Smith",
                avatar: "https://i.pravatar.cc/100?img=2",
                initials: "BS",
                level: "Advanced",
                status: "In-Game"
              }
            ],
            teamB: [
              {
                id: "p3",
                name: "Carol Davis",
                avatar: "https://i.pravatar.cc/100?img=3",
                initials: "CD",
                level: "Intermediate",
                status: "In-Game"
              },
              {
                id: "p4",
                name: "David Lee",
                avatar: "https://i.pravatar.cc/100?img=4",
                initials: "DL",
                level: "Advanced",
                status: "In-Game"
              }
            ],
            teamAName: "Team Alpha",
            teamBName: "Team Beta",
            startTime: "2:00 PM",
            endTime: "3:00 PM"
          },
          {
            id: "court-2",
            name: "Court 2",
            capacity: 4,
            status: "In-Game",
            teamA: [
              {
                id: "p5",
                name: "Emma Wilson",
                avatar: "https://i.pravatar.cc/100?img=5",
                initials: "EW",
                level: "Beginner",
                status: "In-Game"
              },
              {
                id: "p6",
                name: "Frank Miller",
                avatar: "https://i.pravatar.cc/100?img=6",
                initials: "FM",
                level: "Intermediate",
                status: "In-Game"
              }
            ],
            teamB: [
              {
                id: "p7",
                name: "Grace Taylor",
                avatar: "https://i.pravatar.cc/100?img=7",
                initials: "GT",
                level: "Advanced",
                status: "In-Game"
              },
              {
                id: "p8",
                name: "Henry Brown",
                avatar: "https://i.pravatar.cc/100?img=8",
                initials: "HB",
                level: "Intermediate",
                status: "In-Game"
              }
            ],
            teamAName: "Team Gamma",
            teamBName: "Team Delta",
            startTime: "2:30 PM",
            endTime: "3:30 PM"
          },
          {
            id: "court-3",
            name: "Court 3",
            capacity: 4,
            status: "Open",
            teamA: [],
            teamB: [],
            startTime: "3:00 PM",
            endTime: "4:00 PM"
          },
          {
            id: "court-4",
            name: "Court 4",
            capacity: 4,
            status: "Closed",
            teamA: [],
            teamB: [],
            startTime: "4:00 PM",
            endTime: "5:00 PM"
          }
        ]
      });
      // Set focused court from localStorage if available
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
                  <h1 className="text-3xl font-black uppercase tracking-wider text-white">
                    {matchup.sport}
                  </h1>
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
            <div className="w-full h-full">
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
