import React from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Clock, Users } from "lucide-react";

interface Participant {
  id: string;
  name: string;
  avatar?: string;
  initials?: string;
  level?: string;
  status: "In-Game" | "Resting" | "Ready" | "Reserve" | "Waitlist";
  user?: {
    id: string;
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo?: string;
      skill?: {
        id: number;
        description: string;
      };
      upload?: {
        id: string;
        fileName: string;
        filePath: string;
      };
    };
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
}

interface WaitingMatchCardProps {
  court: Court;
  isFocused: boolean;
  focusedCourtId: string | null;
  onFocus: (courtId: string) => void;
}

const WaitingMatchCard: React.FC<WaitingMatchCardProps> = ({
  court,
  isFocused,
  focusedCourtId,
  onFocus
}) => {
  const totalLen = 54;
  const nvz = 7;
  const nvzPct = (nvz / totalLen) * 100;
  const midPct = 50;
  const upperNVZ = midPct - nvzPct;
  const lowerNVZ = midPct + nvzPct;
  return (
    <div 
      className={`relative w-full flex flex-col justify-center border-12 border-[#B85537] items-center shadow-2xl transition-all duration-500 ${
        isFocused ? 'scale-100 z-20 rounded-none ring-8 ring-blue-400/30 ring-opacity-50' : 'scale-90 hover:scale-95 z-10'
      } ${focusedCourtId && !isFocused ? 'opacity-30' : 'opacity-100'}`}
      style={{
        minHeight: isFocused ? '100vh' : '100%',
        width: isFocused ? '100vw' : '100%',
        maxWidth: isFocused ? '100vw' : '100%',
        height: isFocused ? '100vh' : '100%',
        margin: isFocused ? '0' : 'auto',
        backgroundColor: '#1a1a1a'
      }}
    >
      {/* Court Lines */}
      <div className="absolute inset-2 rounded-sm bg-white pointer-events-none" />
          <div
            className="absolute left-2 right-2 bg-black z-40"
            style={{ top: `${midPct}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-[#B8ADA9] z-40 pointer-events-none"
            style={{ top: `${upperNVZ}%`, height: `${nvzPct * 2}%` }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75 z-50"
            style={{ top: `${upperNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white z-50"
            style={{ top: `${lowerNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute bg-white z-50"
            style={{ left: "50%", width: 2, top: "8px", bottom: `${100 - upperNVZ}%`, transform: "translateX(-1px)" }}
          />
          <div
            className="absolute bg-white z-50"
            style={{ left: "50%", width: 2, top: `${lowerNVZ}%`, bottom: "8px", transform: "translateX(-1px)" }}
          />

          <div
            className="absolute grid place-items-center z-40 bg-black text-white px-8 py-2 text-sm font-extrabold"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            VS
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
      {isFocused && (
        <>
          <div className="absolute top-0 left-0 bottom-0 w-6 bg-[#B85537] shadow-lg"></div>
          <div className="absolute top-0 right-0 bottom-0 w-6 bg-[#B85537] shadow-lg"></div>
        </>
      )}

      {/* Court Header */}
 

      {/* Court Content - Video Display */}
      <div className="flex-1 w-full flex items-center justify-center p-0">
        <div className="w-full h-[90%] flex justify-center items-center z-40 relative">
          <div className="w-full h-[97%] relative -mt-2">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full z-50 object-cover"
              style={{ 
                filter: 'brightness(1) contrast(1.1)',
                borderRadius: isFocused ? '0' : '0.5rem'
              }}
            >
              <source src="/splash_screen.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            
            {/* Overlay with court info - reduced opacity to show video */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/30 z-40">
              <div className="text-center text-white relative z-10">
                <div className={`font-bold ${isFocused ? 'text-4xl' : 'text-2xl'} mb-4`}>
                  {court?.name}
                </div>
                <div className={`${isFocused ? 'text-xl' : 'text-lg'} mb-2 flex items-center justify-center gap-2`}>
                  <Users className="h-6 w-6" />
                  Waiting for Players
                </div>
                <div className={`${isFocused ? 'text-lg' : 'text-base'} text-white/80`}>
                  Join this court to start playing
                </div>
                {court.startTime && (
                  <div className={`${isFocused ? 'text-lg' : 'text-base'} text-white/70 mt-2 flex items-center justify-center gap-2`}>
                    <Clock className="h-5 w-5" />
                    Next session: {court.startTime}
                  </div>
                )}
              </div>
            </div>
            
            {/* Video controls overlay */}
            <div className="absolute bottom-4 right-4">
              <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 text-white text-sm flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span>LIVE VIDEO</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Court Footer */}
      {/* <div className="relative z-10 p-6">
        <div className="bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div className="text-white font-black text-2xl">
              {court.teamAName || "Team A"} vs {court.teamBName || "Team B"}
            </div>
            <div className="text-white/70 text-lg">
              Waiting for players to join
            </div>
          </div>
          {isFocused && court.endTime && (
            <div className="mt-4 text-center">
              <div className="text-lg text-white/80 font-semibold">End Time: {court.endTime}</div>
            </div>
          )}
        </div>
      </div> */}

      {/* Active Court Indicator */}
      {focusedCourtId === court.id && (
        <div className="absolute top-3 left-3">
          <div className="bg-blue-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-blue-400/30 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            WAITING
          </div>
        </div>
      )}

      {/* Court Status Badge */}
      <div className="absolute top-3 right-3 z-50">
        <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          OPEN
        </div>
      </div>

      {/* Focus Button */}
      {!isFocused && (
        <div className="absolute bottom-3 z-50 right-3">
          <Button
            onClick={() => onFocus(court.id)}
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

export default WaitingMatchCard;
