import type { DayAvailability } from "@/components/TimeSlotManager";

export interface Booking {
  id: string;
  title: string;
  type: "One-time" | "Tournament" | "Recurring" | "Open Play" | "Court Rental";
  startTime: string;
  endTime: string;
  date: string;
  participants: number;
  maxParticipants: number;
  status: "Pending" | "Approved" | "In-Progress" | "Completed";
  organizer: {
    name: string;
    email: string;
  };
  description?: string;
}

export interface Court {
  id: string;
  name: string;
  location: string;
  status: "Available" | "Maintenance" | "Booked" | "Fully Booked";
  images?: (string | File)[]; // Can be URLs (from API) or File objects (for upload)
  capacity?: number;
  openingHours?: string;
  reservations?: number;
  description?: string;
  hourlyRate?: number;
  minHours?: number;
  bookings?: Booking[];
  availability?: {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
  };
  // API fields
  hubId?: string;
  rentalId?: string;
  courtName?: string;
  courtNumber?: string;
  isActive?: boolean;
  hub?: {
    id: string;
    sportsHubName: string;
    address: string;
  };
  rental?: {
    id: string;
    rentalName: string;
    hourlyRate: number;
    currency: string;
    sport: {
      id: string;
      name: string;
    };
  };
  _count?: {
    bookings: number;
    openPlaySessions: number;
    conflicts: number;
  };
}

export interface CourtFormData {
  name: string;
  location: string;
  status: "Available" | "Maintenance" | "Booked" | "Fully Booked";
  images: (string | File)[];
  capacity: number;
  openingHours: string;
  reservations: number;
  description: string;
  hourlyRate: number;
  minHours: number;
  hubId: string;
  rentalId: string;
  courtNumber: string;
  isActive: boolean;
  availability: {
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
    sunday: DayAvailability;
  };
}
