import React from 'react';
import { ActiveMatchCard, WaitingMatchCard, ClosedMatchCard } from '@/components/match-cards';

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

interface AllCourtsViewProps {
  courts: Court[];
  focusedCourtId: string | null;
  onFocusCourt: (courtId: string) => void;
}

const AllCourtsView: React.FC<AllCourtsViewProps> = ({
  courts,
  focusedCourtId,
  onFocusCourt
}) => {
  const renderCourtCard = (court: Court) => {
    const hasPlayers = court.teamA.length > 0 || court.teamB.length > 0;
    
    // Determine which component to render based on court state
    if (court.status === "Closed") {
      return (
        <ClosedMatchCard
          key={court.id}
          court={court}
          isFocused={false}
          focusedCourtId={focusedCourtId}
          onFocus={onFocusCourt}
        />
      );
    } else if (!hasPlayers) {
      return (
        <ActiveMatchCard
          key={court.id}
          court={court}
          isFocused={false}
          focusedCourtId={focusedCourtId}
          onFocus={onFocusCourt}
        />
      );
    } else {
      return (
        <WaitingMatchCard
          key={court.id}
          court={court}
          isFocused={false}
          focusedCourtId={focusedCourtId}
          onFocus={onFocusCourt}
        />
      );
    }
  };

  return (
    <div 
      className="w-full min-h-full p-6 relative"
      style={{
        backgroundImage: 'url("/matchupbg.jpg")',
        backgroundSize: 'contain',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundBlendMode: 'multiply'
      }}
    >
      {/* Background color overlay that blends with the image */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-800/70 to-gray-900/80"
        style={{ mixBlendMode: 'multiply' }}
      ></div>
      
      {/* Top fade indicator */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-gray-900 to-transparent z-10 pointer-events-none"></div>
      
      {/* Courts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 relative z-20">
        {courts.map(court => renderCourtCard(court))}
      </div>
      
      {/* Bottom fade indicator */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-gray-900 to-transparent z-10 pointer-events-none"></div>
    </div>
  );
};

export default AllCourtsView;
