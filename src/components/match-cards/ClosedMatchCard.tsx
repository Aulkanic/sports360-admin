import React from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2, Lock, Clock } from "lucide-react";

interface Court {
  id: string;
  name: string;
  capacity: number;
  status: "Open" | "In-Game" | "Closed";
  teamA: any[];
  teamB: any[];
  teamAName?: string;
  teamBName?: string;
  startTime?: string;
  endTime?: string;
}

interface ClosedMatchCardProps {
  court: Court;
  isFocused: boolean;
  focusedCourtId: string | null;
  onFocus: (courtId: string) => void;
}

const ClosedMatchCard: React.FC<ClosedMatchCardProps> = ({
  court,
  isFocused,
  focusedCourtId,
  onFocus
}) => {
  return (
    <div 
      className={`relative w-full flex flex-col justify-center items-center shadow-2xl transition-all duration-500 ${
        isFocused ? 'scale-100 z-20 rounded-none ring-8 ring-gray-400/30 ring-opacity-50' : 'scale-90 hover:scale-95 z-10 rounded-2xl'
      } ${focusedCourtId && !isFocused ? 'opacity-30' : 'opacity-100'}`}
      style={{
        minHeight: isFocused ? '100vh' : '100%',
        width: isFocused ? '100vw' : '100%',
        maxWidth: isFocused ? '100vw' : '100%',
        height: isFocused ? '100vh' : '100%',
        margin: isFocused ? '0' : 'auto',
        backgroundImage: 'url("/card.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'multiply'
      }}
    >
      {/* Background color overlay that blends with the image */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-gray-600 via-gray-700 to-gray-800"
        style={{ mixBlendMode: 'multiply' }}
      ></div>
      {/* Court Lines - Dimmed */}
      <div className="absolute top-1/2 left-0 right-0 h-2 bg-white/30 shadow-2xl z-10"></div>
      <div className="absolute top-1/2 left-1/2 w-2 h-1/2 bg-white/20 transform -translate-x-1/2 shadow-2xl z-10"></div>
      
      {/* Additional Court Lines for realism - Dimmed */}
      <div className="absolute top-1/4 left-0 right-0 h-1 bg-white/20 shadow-lg z-10"></div>
      <div className="absolute bottom-1/4 left-0 right-0 h-1 bg-white/20 shadow-lg z-10"></div>
      
      {/* Service boxes - Dimmed */}
      <div className="absolute top-1/4 left-1/4 w-1/2 h-1/4 border-2 border-white/30 rounded-lg z-10"></div>
      <div className="absolute bottom-1/4 left-1/4 w-1/2 h-1/4 border-2 border-white/30 rounded-lg z-10"></div>
      
      {/* Court division lines for better alignment reference - Dimmed */}
      <div className="absolute top-0 left-1/2 w-0.5 h-full bg-white/15 z-5"></div>
      <div className="absolute top-1/4 left-0 right-0 h-0.5 bg-white/10 z-5"></div>
      <div className="absolute bottom-1/4 left-0 right-0 h-0.5 bg-white/10 z-5"></div>
      
      {/* Court Texture - Dimmed */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Animated particles for focused view - Dimmed */}
      {isFocused && (
        <div className="absolute inset-0 pointer-events-none z-15">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white/15 rounded-full animate-ping"></div>
          <div className="absolute top-3/4 right-1/4 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/2 left-1/6 w-1.5 h-1.5 bg-white/10 rounded-full animate-ping" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/3 right-1/6 w-1 h-1 bg-white/18 rounded-full animate-ping" style={{ animationDelay: '1.5s' }}></div>
        </div>
      )}

      {/* Orange Borders - Dimmed */}
      <div className="absolute top-0 left-0 right-0 h-6 bg-gradient-to-r from-orange-500/50 via-orange-600/50 to-orange-500/50 shadow-lg"></div>
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-r from-orange-500/50 via-orange-600/50 to-orange-500/50 shadow-lg"></div>
      
      {/* Side borders for full screen effect - Dimmed */}
      {isFocused && (
        <>
          <div className="absolute top-0 left-0 bottom-0 w-6 bg-gradient-to-b from-orange-500/50 via-orange-600/50 to-orange-500/50 shadow-lg"></div>
          <div className="absolute top-0 right-0 bottom-0 w-6 bg-gradient-to-b from-orange-500/50 via-orange-600/50 to-orange-500/50 shadow-lg"></div>
        </>
      )}


      {/* Court Content - Closed Message */}
      <div className="flex-1 w-full flex items-center justify-center p-6 relative z-10">
        <div className="text-center text-white/70 h-full flex flex-col items-center justify-center">
          {/* Lock Icon */}
          <div className={`${isFocused ? 'mb-8' : 'mb-6'}`}>
            <div className={`${isFocused ? 'w-32 h-32' : 'w-24 h-24'} bg-white/10 rounded-full flex items-center justify-center mx-auto border-2 border-white/20`}>
              <Lock className={`${isFocused ? 'w-16 h-16' : 'w-12 h-12'} text-white/60`} />
            </div>
          </div>
          
          {/* Closed Message */}
          <div className={`font-bold ${isFocused ? 'text-4xl' : 'text-2xl'} mb-4`}>
            Court Closed
          </div>
          <div className={`${isFocused ? 'text-xl' : 'text-lg'} mb-4 text-white/80`}>
            This court is currently closed
          </div>
          
          {/* Additional Info */}
          <div className={`${isFocused ? 'text-lg' : 'text-base'} text-white/60 max-w-md`}>
            The court is temporarily unavailable for maintenance or scheduled closure.
          </div>
          
          {/* Time Information */}
          {court.startTime && (
            <div className={`${isFocused ? 'text-lg' : 'text-base'} text-white/70 mt-6 flex items-center justify-center gap-2`}>
              <Clock className="h-5 w-5" />
              <span>Next available: {court.startTime}</span>
            </div>
          )}
        </div>
      </div>

      {/* Court Footer */}
      {/* <div className="relative z-10 p-6">
        <div className="bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-2xl border border-white/30">
          <div className="flex items-center justify-between">
            <div className="text-white font-black text-2xl">
              {court.teamAName || "Team A"} vs {court.teamBName || "Team B"}
            </div>
            <div className="text-white/50 text-lg flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Court Closed
            </div>
          </div>
          {isFocused && court.endTime && (
            <div className="mt-4 text-center">
              <div className="text-lg text-white/60 font-semibold">Reopens: {court.endTime}</div>
            </div>
          )}
        </div>
      </div> */}

      {/* Active Court Indicator */}
      {focusedCourtId === court.id && (
        <div className="absolute top-3 left-3">
          <div className="bg-gray-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-gray-400/30 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            CLOSED
          </div>
        </div>
      )}

      {/* Court Status Badge */}
      <div className="absolute top-3 right-3 z-50">
        <div className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          CLOSED
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

export default ClosedMatchCard;
