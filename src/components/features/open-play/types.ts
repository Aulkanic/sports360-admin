export type Level = "Beginner" | "Intermediate" | "Advanced";
export type ParticipantStatus = "Ready" | "Resting" | "Reserve" | "In-Game";

export type Participant = {
  id: string;
  name: string;
  level: Level;
  status: ParticipantStatus;
  avatar?: string;
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
