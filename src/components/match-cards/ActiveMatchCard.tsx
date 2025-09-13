import React from 'react';
import { Button } from "@/components/ui/button";
import { Maximize2 } from "lucide-react";

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

const statusStyles = (status?: Court["status"]) => {
  const s = status ?? "Open";
  switch (s) {
    case "In-Game":
      return { text: "IN-GAME", cls: "bg-green-500 text-white" };
    case "Closed":
      return { text: "CLOSED", cls: "bg-gray-500 text-white" };
    case "Open":
    default:
      return { text: "OPEN", cls: "bg-blue-500 text-white" };
  }
};

const ActiveMatchCard: React.FC<ActiveMatchCardProps> = ({
  court,
  isFocused,
  focusedCourtId,
  onFocus
}) => {
  // Safe fallbacks
  const courtId = court?.id ?? "unknown-court";
  const teamA: Participant[] = court?.teamA ?? [];
  const teamB: Participant[] = court?.teamB ?? [];

  const badge = statusStyles(court?.status);
  const totalLen = 40;
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
      backgroundImage: 'url("/card.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundBlendMode: 'multiply'
    }}
    >
      {/* Background color overlay that blends with the image */}
      <div 
        className="absolute inset-0 bg-[#645A57]"
        style={{ mixBlendMode: 'multiply' }}
      ></div>
         <h3 className="absolute -top-12 bg-primary px-7 rounded-lg shadow-lg py-2 z-50 text-3xl text-center font-black uppercase tracking-wider text-white">
              {court.name}
            </h3>
          <div className="absolute inset-2 rounded-sm bg-white pointer-events-none" />
          <div
            className="absolute left-2 right-2 bg-black z-4"
            style={{ top: `${midPct}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-[#B8ADA9] pointer-events-none"
            style={{ top: `${upperNVZ}%`, height: `${nvzPct * 2}%` }}
          />
          <div
            className="absolute left-2 right-2 bg-white/75"
            style={{ top: `${upperNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute left-2 right-2 bg-white"
            style={{ top: `${lowerNVZ}%`, height: 2, transform: "translateY(-1px)" }}
          />
          <div
            className="absolute bg-white z-8"
            style={{ left: "50%", width: 2, top: "8px", bottom: `${100 - upperNVZ}%`, transform: "translateX(-1px)" }}
          />
          <div
            className="absolute bg-white z-8"
            style={{ left: "50%", width: 2, top: `${lowerNVZ}%`, bottom: "8px", transform: "translateX(-1px)" }}
          />

          <div
            className="absolute grid place-items-center z-50 bg-black text-white px-8 py-2 text-sm font-extrabold"
            style={{ left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
          >
            VS
          </div>

      {/* Court Content - Players Match */}
      <div className="flex-1 border w-full p-6">
        <div className="w-full flex items-center gap-4 h-full relative">

          {/* Team A */}
          <div className="flex flex-1 flex-col gap-4 h-full justify-center z-40 items-center min-w-0">
            {(teamA.length ? teamA : Array.from({ length: 2 }).map((_, i) => ({
              id: `A-${i}`,
              name: "Unknown Player",
              avatar: "/default_avatar.png",
              initials: "NA",
              level: "N/A",
              status: "Ready" as const
            }))).map((player, index) => (
              <div key={player?.id ?? `A-${index}`} className={`w-full flex text-center relative ${isFocused ? 'h-80' : 'h-40'}`} style={{
                backgroundImage: 'url("/card.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundBlendMode: 'multiply'
              }}>
                {/* Background color overlay for player container */}
                <div 
                  className="absolute inset-0 bg-[#645A57]"
                ></div>
                <img src={player?.avatar ?? '/default_avatar.png'} alt="" className="w-72 h-full relative z-10" />

                <div className={`h-full w-full bottom-0 inset-x-0 mx-auto rounded-lg px-2 py-3 z-40 relative`}>
                  {isFocused && (
                    <div className={`font-black uppercase tracking-wide text-white ${isFocused ? 'text-2xl' : 'text-lg'}`}>
                      PLAYER {index + 1}
                    </div>
                  )}
                  <div className={`text-white/90 mt-1 font-semibold ${isFocused ? 'text-lg' : 'text-sm'} truncate`}>
                    {player?.name ?? "Unknown Player"}
                  </div>
                  <div className={`text-white/70 mt-1 ${isFocused ? 'text-base' : 'text-xs'}`}>
                    {player?.level ?? "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team B */}
          <div className="flex flex-1 flex-col gap-4 h-full justify-center z-40 items-center min-w-0">
            {(teamB.length ? teamB : Array.from({ length: 2 }).map((_, i) => ({
              id: `B-${i}`,
              name: "Unknown Player",
              avatar: "/default_avatar.png",
              initials: "NA",
              level: "N/A",
              status: "Ready" as const
            }))).map((player, index) => (
              <div key={player?.id ?? `B-${index}`} className={`flex w-full text-center relative h-40`} style={{
                backgroundImage: 'url("/card.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundBlendMode: 'multiply'
              }}>
                {/* Background color overlay for player container */}
                <div 
                  className="absolute inset-0 bg-[#645A57]"
                
                ></div>
            <img src={player?.avatar ?? '/default_avatar.png'} alt="" className="w-72 h-full relative z-10" />

                <div className={`h-full w-full bottom-0 inset-x-0 mx-auto rounded-lg px-2 py-3 z-40 relative`}>
                  {isFocused && (
                    <div className={`font-black uppercase tracking-wide text-white ${isFocused ? 'text-2xl' : 'text-lg'}`}>
                      PLAYER {index + 1}
                    </div>
                  )}
                  <div className={`text-white/90 mt-1 font-semibold ${isFocused ? 'text-lg' : 'text-sm'} truncate`}>
                    {player?.name ?? "Unknown Player"}
                  </div>
                  <div className={`text-white/70 mt-1 ${isFocused ? 'text-base' : 'text-xs'}`}>
                    {player?.level ?? "N/A"}
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Live indicator */}
      {focusedCourtId === courtId && (
        <div className="absolute top-3 left-3">
          <div className="bg-green-500/90 backdrop-blur-sm text-white px-3 py-2 rounded-full text-sm font-bold flex items-center gap-2 border border-green-400/30 shadow-lg">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* Court Status Badge */}
      <div className="absolute top-3 right-3 z-50">
        <div className={`${badge.cls} px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg`}>
          <div className="w-2 h-2 bg-white rounded-full" />
          {badge.text}
        </div>
      </div>

      {/* Focus Button */}
      {!isFocused && (
        <div className="absolute bottom-3 z-50 right-3">
          <Button
            onClick={() => onFocus(courtId)}
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
