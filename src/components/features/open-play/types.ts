export type Level = "Beginner" | "Intermediate" | "Advanced";

export type ParticipantStatus = "READY" | "RESTING" | "RESERVE" | "WAITLIST" | "IN-GAME";

export type StatusObject = {
  id: number;
  description: string;
};

export type Participant = {
  playerStatus: any;
  skillLevel: any; // Legacy field for backward compatibility
  id: string;
  name: string;
  level: Level; // Legacy field for backward compatibility
  status: any;
  avatar?: string;
  initials?: string;
  paymentStatus?: "Paid" | "Pending" | "Rejected"; // Made optional since we're removing display
  isApproved: boolean;
  waitlistReason?: string;
  // Game history for matchmaking
  gamesPlayed?: number;
  readyTime?: number;
  skillScore?: number;
  skill?: any;
  // Additional enriched fields
  skillId?: number;
  profileUpload?: any;
  profilePhoto?: string;
  // Priority queuing
  updatedPlayerStatusAt?: string | null; // ISO timestamp when player status was last updated
  // API structure
  user?: {
    id: string;
    userName: string;
    email: string;
    personalInfo?: {
      firstName: string;
      lastName: string;
      contactNo: string;
      skillId?: number;
      upload?: any;
      skill?: {
        id: number;
        description: string;
      };
    };
  };
};

export type Court = {
  id: string;
  name: string;
  capacity: number; // total across both teams
  status: "Open" | "IN-GAME" | "Closed";
  location?: string;
  hourlyRate?: number;
  images?: string[];
};

export type Match = {
  id: string;
  courtId: string;
  courtName: string;
  teamA: Participant[];
  teamB: Participant[];
  teamAName?: string;
  teamBName?: string;
  status: "Scheduled" | "IN-GAME" | "Completed";
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

// Helper function to extract skill level from participant
export const getSkillLevel = (participant: Participant): string => {
  // Try new structure first: user.personalInfo.skill.description
  if (participant.user?.personalInfo?.skill?.description) {
    return participant.user.personalInfo.skill.description;
  }
  
  // Fallback to legacy fields
  if (participant.skillLevel) {
    if (typeof participant.skillLevel === 'string') {
      return participant.skillLevel;
    }
    if (typeof participant.skillLevel === 'object' && participant.skillLevel.description) {
      return participant.skillLevel.description;
    }
  }
  
  if (participant.level) {
    return participant.level;
  }
  
  return 'Unknown';
};

// Helper function to get skill level as Level type
export const getSkillLevelAsLevel = (participant: Participant): Level => {
  const skillLevel = getSkillLevel(participant).toUpperCase();
  
  if (skillLevel === 'BEGINNER') return 'Beginner';
  if (skillLevel === 'INTERMEDIATE') return 'Intermediate';
  if (skillLevel === 'ADVANCED') return 'Advanced';
  
  return 'Intermediate'; // Default fallback
};
