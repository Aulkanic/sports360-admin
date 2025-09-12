import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Clock, Maximize2 } from "lucide-react";

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

interface ActiveMatchCardProps {
  court: Court;
  isFocused: boolean;
  focusedCourtId: string | null;
  onFocus: (courtId: string) => void;
}

const ActiveMatchCard: React.FC<ActiveMatchCardProps> = ({
  court,
  isFocused,
  focusedCourtId,
  onFocus
}) => {
  return (
    <div 
      className={`relative w-full h-full bg-gradient-to-b from-green-600 via-green-700 to-green-800 flex flex-col justify-center items-center shadow-2xl transition-all duration-500 ${
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
            {/* Court Header */}
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 z-10 p-6">
        <div className="flex items-center justify-between">
          <div className="bg-gradient-to-r from-black/90 to-gray-900/90 backdrop-blur-sm rounded-xl px-8 py-4 shadow-2xl border border-white/30">
            <h3 className="text-4xl font-black uppercase tracking-wider text-white">
              {court.name}
            </h3>
          </div>
        </div>
      </div>
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



      {/* Court Content - Players Match */}
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <div className="w-[80%] flex flex-nowrap items-center justify-between items-center overflow-hidden h-full relative">
          {/* Team A */}
          <div className="flex flex-1 flex-col gap-6 h-full justify-center z-50 items-center">
            {court.teamA.map((player, index) => (
              <div key={player.id} className={`text-center relative ${isFocused ? 'w-full h-80' : 'w-72 h-40'}`}>
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
              <div key={player.id} className={`text-center relative ${isFocused ? 'w-full h-80' : 'w-72 h-40'}`}>
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
      </div>

      
      {/* <div className="relative z-10 p-6">
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
      </div> */}

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
      <div className="absolute top-3 right-3 z-50">
        <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
          <div className="w-2 h-2 bg-white rounded-full"></div>
          IN-GAME
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

export default ActiveMatchCard;
