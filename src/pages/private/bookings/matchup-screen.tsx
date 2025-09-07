/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Trophy, 
  ArrowLeft,
  Play,
  Pause
} from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar: string;
  initials: string;
  level: string;
  status: "In-Game" | "Resting";
}

interface MatchupData {
  id: string;
  sport: string;
  courtName: string;
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  status: "Scheduled" | "In-Progress" | "Completed";
  startTime?: string;
  endTime?: string;
  score?: string;
  winner?: "A" | "B";
}

const MatchupScreen: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Ensure full screen display
  useEffect(() => {
    // Remove any body margins/padding for full screen
    const originalStyle = {
      margin: document.body.style.margin,
      padding: document.body.style.padding,
      overflow: document.body.style.overflow
    };
    
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.body.style.overflow = 'hidden';
    
    return () => {
      // Restore original styles when component unmounts
      document.body.style.margin = originalStyle.margin;
      document.body.style.padding = originalStyle.padding;
      document.body.style.overflow = originalStyle.overflow;
    };
  }, []);

  // Get matchup data from location state, postMessage, or create sample data
  useEffect(() => {
    if (location.state?.matchup) {
      setMatchup(location.state.matchup);
    } else {
      // Sample matchup data for demonstration
      setMatchup({
        id: id || "match-1",
        sport: "Pickleball",
        courtName: "Court 1",
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
        status: "In-Progress",
        startTime: "2:00 PM",
        endTime: "3:00 PM"
      });
    }
  }, [id, location.state]);

  // Listen for postMessage data from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'MATCHUP_DATA') {
        setMatchup(event.data.data);
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
    <div className="fixed inset-0 h-screen w-screen overflow-hidden relative z-50" style={{ margin: 0, padding: 0 }}>
      {/* Court Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-green-600 via-green-700 to-green-800">
        {/* Court Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/90"></div>
        <div className="absolute top-1/2 left-1/2 w-1 h-1/2 bg-white/70 transform -translate-x-1/2"></div>
        
        {/* Court Texture */}
        <div className="absolute inset-0 opacity-10">
          <div className="w-full h-full" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
      </div>
      
      {/* Orange Borders */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-r from-orange-500 to-orange-600"></div>
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-r from-orange-500 to-orange-600"></div>

      {/* Header */}
      <div className="relative z-10 mt-8">
        <div className="flex justify-center">
          <div className="bg-black rounded-2xl px-12 py-4 shadow-2xl">
            <div className="flex items-center gap-4">
              <h1 className="text-5xl font-black uppercase tracking-wider text-white">
                {matchup.sport}
              </h1>
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-8">
        <div className="w-full max-w-7xl">
          {/* VS Section */}
          <div className="flex items-center justify-center h-full">
            <div className="relative w-full flex items-center justify-between">
              {/* Team A */}
              <div className="flex flex-col gap-8">
                {matchup.teamA.map((player, index) => (
                  <div key={player.id} className="text-center">
                    <div className="relative mb-6">
                      <Avatar className="h-64 w-64 border-8 border-white shadow-2xl">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback className="text-6xl font-bold bg-white/20">
                          {player.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-black rounded-xl px-10 py-5 shadow-lg">
                      <div className="text-2xl font-black uppercase tracking-wide text-white">
                        PLAYER {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* VS Divider */}
              <div className="flex flex-col items-center justify-center">
                <div className="bg-black rounded-full p-20 shadow-2xl mb-6">
                  <div className="text-9xl font-black text-white drop-shadow-2xl">
                    VS
                  </div>
                </div>
                <div className="bg-green-600 rounded-xl px-6 py-3 shadow-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="h-6 w-6 text-white" />
                    <div>
                      <div className="text-sm text-white opacity-90">Start Time</div>
                      <div className="text-lg font-bold text-white">{matchup.startTime || "TBD"}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team B */}
              <div className="flex flex-col gap-8">
                {matchup.teamB.map((player, index) => (
                  <div key={player.id} className="text-center">
                    <div className="relative mb-6">
                      <Avatar className="h-64 w-64 border-8 border-white shadow-2xl">
                        <AvatarImage src={player.avatar} />
                        <AvatarFallback className="text-6xl font-bold bg-white/20">
                          {player.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-black rounded-xl px-10 py-5 shadow-lg">
                      <div className="text-2xl font-black uppercase tracking-wide text-white">
                        PLAYER {index + 1}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-center gap-8 mt-16">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 border border-white/20">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-white" />
                <div>
                  <div className="text-sm opacity-80 text-white">Start Time</div>
                  <div className="text-lg font-bold text-white">{matchup.startTime || "TBD"}</div>
                </div>
              </div>
            </div>
            
            {matchup.winner && (
              <div className="bg-yellow-500/20 backdrop-blur-sm rounded-2xl px-6 py-3 border border-yellow-500/30">
                <div className="flex items-center gap-3">
                  <Trophy className="h-5 w-5 text-yellow-400" />
                  <div>
                    <div className="text-sm opacity-80 text-white">Winner</div>
                    <div className="text-lg font-bold text-yellow-400">
                      {matchup.winner === "A" ? (matchup.teamAName || "Team A") : (matchup.teamBName || "Team B")}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0">
        <div className="flex justify-center">
          <div className="bg-black rounded-2xl px-12 py-4 shadow-2xl">
            <h2 className="text-5xl font-black uppercase tracking-wider text-white">
              {matchup.courtName}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="absolute top-4 right-4 flex gap-2">
        {!isFullscreen && (
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="text-white border-white/30 hover:bg-white/10 bg-black/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <Button
          onClick={toggleFullscreen}
          variant="outline"
          size="sm"
          className="text-white border-white/30 hover:bg-white/10 bg-black/50"
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
  );
};

export default MatchupScreen;
