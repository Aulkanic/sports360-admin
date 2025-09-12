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
    } else if (hasPlayers) {
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 h-full w-full gap-4 p-4">
      {courts.map(court => renderCourtCard(court))}
    </div>
  );
};

export default AllCourtsView;
