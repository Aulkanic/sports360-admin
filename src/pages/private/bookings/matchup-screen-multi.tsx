/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SplashVideo from "@/components/SplashVideo";
import { 
  Clock, 
  Trophy, 
  ArrowLeft,
  Play,
  Pause,
  Grid3X3,
  Maximize2
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

  const getCourtStatusColor = (status: string) => {
    switch (status) {
      case "In-Game":
        return "bg-green-500";
      case "Open":
        return "bg-blue-500";
      case "Closed":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  const renderCourtCard = (court: Court, isFocused: boolean = false) => {
    const hasPlayers = court.teamA.length > 0 || court.teamB.length > 0;
    
    return (
      <div 
        key={court.id}
        className={`relative w-full bg-gradient-to-b from-green-600 via-green-700 to-green-800 flex flex-col justify-center items-center overflow-hidden shadow-2xl transition-all duration-500 ${
          isFocused ? 'scale-100 z-20 rounded-none ring-8 ring-green-400/30 ring-opacity-50' : 'scale-90 hover:scale-95 z-10 rounded-2xl'
        } ${focusedCourtId && !isFocused ? 'opacity-30' : 'opacity-100'}`}
        style={{
          minHeight: isFocused ? '100vh' : '100%',
          width: isFocused ? '100vw' : '100%',
          maxWidth: isFocused ? '100vw' : '100%',
          height: isFocused ? '100vh' : '100%',
          margin: isFocused ? '0' : 'auto'
        }}
      >
        {/* Court Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/95 shadow-2xl z-10"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-1/2 bg-white/80 transform -translate-x-1/2 shadow-2xl z-10"></div>
        
        {/* Additional Court Lines for realism */}
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-white/70 shadow-lg z-10"></div>
        <div className="absolute bottom-1/4 left-0 right-0 h-1 bg-white/70 shadow-lg z-10"></div>
        
        {/* Service boxes */}
        <div className="absolute top-1/4 left-1/4 w-1/2 h-1/4 border-2 border-white/60 rounded-lg z-10"></div>
        <div className="absolute bottom-1/4 left-1/4 w-1/2 h-1/4 border-2 border-white/60 rounded-lg z-10"></div>
        
        {/* Court division lines for better alignment reference */}
        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/30 z-5"></div>
        <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/20 z-5"></div>
        <div className="absolute bottom-1/4 left-0 right-0 h-0.5 bg-white/20 z-5"></div>
        
        {/* Court Texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Animated particles for focused view */}
        {isFocused && (
          <div className="absolute inset-0 pointer-events-none z-15">
            <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/40 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
            <div className="absolute top-1/3 right-1/6 w-1 h-1 bg-white/35 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
          </div>
        )}

        {/* Orange Borders */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-lg"></div>
        <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500 shadow-lg"></div>
        
        {/* Side borders for full screen effect */}
        {isFocused && (
          <>
            <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-500 shadow-lg"></div>
            <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-b from-orange-500 via-orange-600 to-orange-500 shadow-lg"></div>
          </>
        )}

        {/* Court Header */}
        <div className="relative z-10 p-6">
          <div className="flex items-center justify-between">
            <div className="bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-2xl border border-white/30">
              <h3 className="text-4xl font-black uppercase tracking-wider text-white">
                {court.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Court Content */}
        <div className="flex-1 w-full flex items-center justify-center p-6">
          {hasPlayers ? (
            <div className="w-[80%] flex flex-nowrap items-center justify-between items-center overflow-hidden h-full relative">
              {/* Team A */}
              <div className="flex flex-1 flex-col gap-6 h-full justify-center z-50 items-center">
                {court.teamA.map((player, index) => (
                  <div key={player.id} className={`text-center relative  ${isFocused ? 'w-full h-80' : 'w-72 h-40'}`}>
                    <Avatar className={`border-4 border-white shadow-2xl ${isFocused ? 'h-64 w-64' : 'h-32 w-48'}`}>
                      <AvatarImage src={player.avatar} />
                      {isFocused && <AvatarFallback className={`font-bold bg-white/20 ${isFocused ? 'text-4xl' : 'text-sm'}`}>
                        {player.initials}
                      </AvatarFallback>}
                    </Avatar>
                    
                      <div className={`bg-black/95 absolute bottom-0 w-max min-w-72 inset-x-0 mx-auto ${isFocused ? 'left-0 right-0' : 'bottom-0 left-0 h-12 right-0 flex items-center justify-between gap-4'} backdrop-blur-sm rounded-lg px-4 py-3 mt-3 border border-white/40 shadow-xl z-40`}>
                        {isFocused && <div className={`font-black uppercase tracking-wide text-white ${isFocused ? 'text-2xl' : 'text-lg'}`}>
                          PLAYER {index + 1}
                        </div>}
                        <div className={`text-white/90 mt-1 font-semibold ${isFocused ? 'text-lg' : 'text-sm'}`}>
                          {player.name}
                        </div>
                        <div className={`text-white/70 mt-1 ${isFocused ? 'text-base' : 'text-xs'}`}>
                          {player.level}
                        </div>
                      </div>
                  
                  </div>
                ))}
              </div>

              {/* VS Divider */}
              <div className="flex flex-col w-[20%] items-center justify-center h-full z-20">
                <div className={`bg-gradient-to-br from-black via-gray-900 to-black backdrop-blur-sm rounded-full shadow-2xl border-2 border-white/30 ${isFocused ? 'p-16' : 'p-6'} animate-pulse relative`}>
                  <div className={`font-black text-white drop-shadow-2xl ${isFocused ? 'text-7xl' : 'text-2xl'} animate-bounce`}>
                    VS
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-yellow-400/20 via-white/10 to-yellow-400/20 animate-ping"></div>
                </div>
                {isFocused && court.startTime && (
                  <div className="bg-gradient-to-r from-green-600/90 to-blue-600/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-xl mt-8 border border-white/30">
                    <div className="flex items-center gap-4">
                      <Clock className="h-6 w-6 text-white" />
                      <div>
                        <div className="text-lg text-white opacity-90 font-semibold">Start Time</div>
                        <div className="text-2xl font-bold text-white">{court.startTime}</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Team B */}
              <div className="flex flex-1 flex-col gap-6 h-full justify-center z-50 items-center">
                {court.teamB.map((player, index) => (
                  <div key={player.id} className={`text-center relative  ${isFocused ? 'w-full h-80' : 'w-72 h-40'}`}>
                    <Avatar className={`border-4 border-white shadow-2xl ${isFocused ? 'h-64 w-64' : 'h-32 w-48'}`}>
                      <AvatarImage src={player.avatar} />
                      {isFocused && <AvatarFallback className={`font-bold bg-white/20 ${isFocused ? 'text-4xl' : 'text-sm'}`}>
                        {player.initials}
                      </AvatarFallback>}
                    </Avatar>
                    
                      <div className={`bg-black/95 absolute bottom-0 w-max min-w-72 inset-x-0 mx-auto ${isFocused ? 'left-0 right-0' : 'bottom-0 left-0 h-12 right-0 flex items-center justify-between gap-4'} backdrop-blur-sm rounded-lg px-4 py-3 mt-3 border border-white/40 shadow-xl z-40`}>
                        {isFocused && <div className={`font-black uppercase tracking-wide text-white ${isFocused ? 'text-2xl' : 'text-lg'}`}>
                          PLAYER {index + 1}
                        </div>}
                        <div className={`text-white/90 mt-1 font-semibold ${isFocused ? 'text-lg' : 'text-sm'}`}>
                          {player.name}
                        </div>
                        <div className={`text-white/70 mt-1 ${isFocused ? 'text-base' : 'text-xs'}`}>
                          {player.level}
                        </div>
                      </div>
                  
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center text-white/70 h-full flex flex-col items-center justify-center">
              <div className={`font-bold ${isFocused ? 'text-4xl' : 'text-2xl'}`}>
                {court.status === "Closed" ? "Court Closed" : "No Players"}
              </div>
              <div className={`${isFocused ? 'text-xl' : 'text-lg'} mt-4`}>
                {court.status === "Closed" ? "This court is currently closed" : "Waiting for players to join"}
              </div>
            </div>
          )}
        </div>

        {/* Court Footer */}
        <div className="relative z-10 p-6">
          <div className="bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-2xl border border-white/30">
            <div className="flex items-center justify-between">
              <div className="text-white font-black text-2xl">
                {court.teamAName || "Team A"} vs {court.teamBName || "Team B"}
              </div>
              {court.winner && (
                <div className="flex items-center gap-4 text-yellow-400">
                  <Trophy className="h-8 w-8" />
                  <span className="font-black text-2xl">
                    {court.winner === "A" ? (court.teamAName || "Team A") : (court.teamBName || "Team B")}
                  </span>
                </div>
              )}
            </div>
            {isFocused && court.endTime && (
              <div className="mt-4 text-center">
                <div className="text-lg text-white/80 font-semibold">End Time: {court.endTime}</div>
              </div>
            )}
          </div>
        </div>

        {/* Active Court Indicator */}
        {focusedCourtId === court.id && (
          <div className="absolute top-3 left-3">
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-green-400/30 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              LIVE
            </div>
          </div>
        )}

        {/* Court Status Badge */}
        <div className="absolute top-3 right-3">
          <div className={`${getCourtStatusColor(court.status)} text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
            <div className="w-2 h-2 bg-white rounded-full"></div>
            {court.status.toUpperCase()}
          </div>
        </div>

        {/* Focus Button */}
        {!isFocused && hasPlayers && (
          <div className="absolute bottom-3 right-3">
            <Button
              onClick={() => focusCourt(court.id)}
              size="sm"
              className="bg-black/70 hover:bg-black/90 text-white border-white/30 backdrop-blur-sm shadow-lg"
            >
              <Maximize2 className="h-4 w-4 mr-1" />
              Focus
            </Button>
          </div>
        )}
      </div>
    );
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
      <div className="fixed inset-0 h-screen w-screen overflow-hidden relative z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-black" style={{ margin: 0, padding: 0 }}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      {/* Header - More compact and full-width */}
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
          
          {/* Active Court Status - Right aligned */}
          {focusedCourtId && (
            <div className="bg-green-600/90 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg border border-green-400/30">
              <div className="flex items-center gap-3 text-white">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                <span className="font-bold text-lg">
                  LIVE: {matchup.courts.find(c => c.id === focusedCourtId)?.name || 'Unknown'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Full screen utilization */}
      <div className="flex-1 flex items-center justify-center px-2 py-2 h-[calc(100vh-120px)]">
        <div className="w-full h-full">
          {focusedCourtId ? (
            // Focused view - show only the selected court with full screen
            <div className="flex justify-center items-center h-full">
              {renderCourtCard(
                matchup.courts.find(c => c.id === focusedCourtId)!, 
                true
              )}
            </div>
          ) : (
            // Grid view - show all courts with better spacing
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 h-full overflow-y-auto py-4">
              {matchup.courts.map(court => renderCourtCard(court))}
            </div>
          )}
        </div>
      </div>
      
      {/* Controls - Bottom right corner */}
      <div className="absolute bottom-4 right-4 flex gap-2">
        {focusedCourtId && (
          <Button
            onClick={showAllCourts}
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10 bg-black/70 backdrop-blur-sm"
          >
            <Grid3X3 className="h-4 w-4 mr-2" />
            All Courts
          </Button>
        )}
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
    </>
  );
};

export default MatchupScreenMulti;
