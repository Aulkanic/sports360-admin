export type Level = "Beginner" | "Intermediate" | "Advanced";
export type ParticipantStatus = "Ready" | "Resting" | "Reserve" | "In-Game" | "Waitlist";

export type Participant = {
  id: string;
  name: string;
  level: Level;
  status: ParticipantStatus;
  avatar?: string;
  paymentStatus: "Paid" | "Pending" | "Rejected";
  isApproved: boolean;
  waitlistReason?: string;
  // Game history for matchmaking
  gamesPlayed?: number;
  readyTime?: number;
  skillScore?: number;
};

export type Court = {
  id: string;
  name: string;
  capacity: number; // total across both teams
  status: "Open" | "In-Game" | "Closed";
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
};
