import React from 'react';
import FocusedActiveMatchCard from '@/components/match-cards/FocusedActiveMatchCard';
import { WaitingMatchCard, ClosedMatchCard } from '@/components/match-cards';

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
  score?: string;
  winner?: "A" | "B";
}

interface FocusedCourtViewProps {
  court: Court;
  focusedCourtId: string | null;
  onFocusCourt: (courtId: string) => void;
}

const FocusedCourtView: React.FC<FocusedCourtViewProps> = ({
  court,
  focusedCourtId,
  onFocusCourt
}) => {
  const hasPlayers = court?.teamA.length > 0 || court?.teamB.length > 0;
  
  // Determine which component to render based on court state
  if (court?.status === "Closed") {
    return (
      <ClosedMatchCard
        court={court}
        isFocused={true}
        focusedCourtId={focusedCourtId}
        onFocus={onFocusCourt}
      />
    );
  } else if (hasPlayers) {
    return (
      <FocusedActiveMatchCard
        court={court}
        focusedCourtId={focusedCourtId}
        onFocus={onFocusCourt}
      />
    );
  } else {
    return (
      <WaitingMatchCard
        court={court}
        isFocused={true}
        focusedCourtId={focusedCourtId}
        onFocus={onFocusCourt}
      />
    );
  }
};

export default FocusedCourtView;
