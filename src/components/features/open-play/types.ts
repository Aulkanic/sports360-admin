export type Level = "Beginner" | "Intermediate" | "Advanced";

export type ParticipantStatus = "READY" | "RESTING" | "RESERVE" | "WAITLIST" | "IN-GAME";

export type StatusObject = {
  id: number;
  description: string;
};

export type Participant = {
  playerStatus: any;
  skillLevel: any;
  id: string;
  name: string;
  level: Level;
  status: any;
  avatar?: string;
  initials?: string;
  paymentStatus: "Paid" | "Pending" | "Rejected";
  isApproved: boolean;
  waitlistReason?: string;
  // Game history for matchmaking
  gamesPlayed?: number;
  readyTime?: number;
  skillScore?: number;
  // API structure
  user?: {
    id: string;
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo: string;
    };
  };
};

export type Court = {
  id: string;
  name: string;
  capacity: number; // total across both teams
  status: "Open" | "IN-GAME" | "Closed";
};

export type Match = {
  id: string;
  courtId: string;
  courtName: string;
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  status: "Scheduled" | "Completed";
  winner?: "A" | "B";
  score?: string;
};

export type OpenPlaySession = {
  id: string;
  title: string;
  when: string;
  location: string;
  level: Level[];
  rules?: string;
  format?: string;
  participants: Participant[];
  occurrenceId?: string;
};

// Helper function to extract status string from status object or string
export const getStatusString = (status:any): string => {

  if (typeof status === 'string') {
    return status;
  }
  if (status && typeof status === 'object' && status.description) {
    return status.description;
  }
  return 'Unknown';
};
