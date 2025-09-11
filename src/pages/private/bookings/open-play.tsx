/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ResponsiveOverlay from "@/components/responsive-overlay";
import PlayerStatusPanel, { type PlayerItem } from "@/components/player-status-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import ErrorDisplay, { type ApiError } from "@/components/ui/error-display";
import OpenPlayGridSkeleton from "@/components/features/open-play/OpenPlayGridSkeleton";
import { cn } from "@/lib/utils";
import { Calendar, Clock, MapPin, Users, Plus, Play, Settings, UserCheck, Star, TrendingUp, Grid3X3, CalendarDays } from "lucide-react";
import { dateFnsLocalizer, Views, type SlotInfo, type Event as RBCEvent } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import ClubCalendar from "@/components/club-calendar";
import {
  getAllOpenPlaySessions,
  createOpenPlaySession,
  deleteOpenPlaySession,
  getOpenPlayStats,
  getOpenPlayLookup,
  type CreateOpenPlaySessionData,
  type OpenPlayStats,
  // type OpenPlayLookup
} from "@/services/open-play.service";

type LevelTag = "Beginner" | "Intermediate" | "Advanced";

type OpenPlaySession = {
  id: string;
  title: string;
  description?: string;
  when: string;
  location: string;
  eventType?: "one-time" | "recurring" | "tournament";
  level: LevelTag[];
  participants: (PlayerItem & {
    avatar?: string;
    initials?: string;
    level?: LevelTag;
  })[];
};

// Removed dummy participant data - now using real API data

// Removed dummy data - now using real API data

const levelColor: Record<LevelTag, string> = {
  Beginner: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Intermediate: "bg-amber-100 text-amber-800 border-amber-200",
  Advanced: "bg-indigo-100 text-indigo-800 border-indigo-200",
};

function AvatarsStrip({
  people,
  max = 3,
  size = 28,
}: {
  people: { avatar?: string; initials?: string; name: string }[];
  max?: number;
  size?: number;
}) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  return (
    <div className="flex -space-x-2">
      {visible.map((p, i) => (
        <Avatar
          key={i}
          className="ring-2 ring-white shadow-sm"
          style={{ width: size, height: size }}
        >
          <AvatarImage src={p.avatar} alt={p.name} />
          <AvatarFallback className="text-[10px]">{p.initials ?? "?"}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <div
          className="grid place-items-center rounded-full bg-muted text-muted-foreground ring-2 ring-white shadow-sm text-[10px] font-medium"
          style={{ width: size, height: size }}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

const OpenPlayPage: React.FC = () => {
  const [sessions, setSessions] = useState<OpenPlaySession[]>([]);
  const [originalApiData, setOriginalApiData] = useState<any[]>([]); // Store original API data for calendar
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOperationLoading, setIsOperationLoading] = useState(false); // For operations like create/delete
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [calDate, setCalDate] = useState<Date>(new Date());
  const [calView, setCalView] = useState<string>(Views.MONTH);
  const [stats, setStats] = useState<OpenPlayStats | null>(null);
  // const [lookup, setLookup] = useState<OpenPlayLookup | null>(null);
  const navigate = useNavigate();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    maxPlayers: 10,
    price: 0,
    isFreeJoin: false,
    eventType: "one-time" as "one-time" | "recurring" | "tournament",
    // Recurring fields
    frequency: "weekly" as "daily" | "weekly" | "monthly",
    endDate: "",
    // Tournament fields
    tournamentFormat: "single-elimination" as "single-elimination" | "double-elimination" | "round-robin",
    prize: "",
    registrationDeadline: "",
    levels: { Beginner: true, Intermediate: false, Advanced: false },
  });

  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [participantsSessionId, setParticipantsSessionId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null); // Delete confirmation state
  const [createError, setCreateError] = useState<ApiError | null>(null); // Error state for session creation
  const [errorModalOpen, setErrorModalOpen] = useState(false); // State for error modal
  
  // Debug: Log error state changes
  useEffect(() => {
    if (createError) {
      console.log('Error state updated:', createError);
    }
  }, [createError]);

  // Load data from API
  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      console.log('Loading open play sessions...');
      
      const [sessionsData, statsData, lookupData] = await Promise.all([
        getAllOpenPlaySessions().catch(err => {
          console.error('Failed to fetch sessions:', err);
          return []; // Return empty array on error
        }),
        getOpenPlayStats().catch(err => {
          console.error('Failed to fetch stats:', err);
          return null; // Return null on error
        }),
        getOpenPlayLookup().catch(err => {
          console.error('Failed to fetch lookup:', err);
          return null; // Return null on error
        })
      ]);
      
      console.log('API Response - Sessions:', sessionsData);
      console.log('API Response - Stats:', statsData);
      console.log('API Response - Lookup:', lookupData);
      
      // Ensure sessionsData is an array
      const safeSessionsData = Array.isArray(sessionsData) ? sessionsData : [];
      console.log('Safe sessions data:', safeSessionsData);
      
      setStats(statsData);
      // setLookup(lookupData); // Commented out since lookup is not used
      setOriginalApiData(safeSessionsData); // Store original API data
      
      // Convert API sessions to frontend format
      const convertedSessions: OpenPlaySession[] = safeSessionsData.map((apiSession: any) => {
        const firstOccurrence = apiSession.occurrences?.[0];
        
        // Format the time display
        let whenDisplay = 'TBD';
        if (firstOccurrence) {
          const date = new Date(firstOccurrence.occurrenceDate);
          const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const dayName = dayNames[date.getDay()];
          
          const start = new Date(`2000-01-01T${firstOccurrence.startTime}:00`);
          const end = new Date(`2000-01-01T${firstOccurrence.endTime}:00`);
          
          const startFormatted = start.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
          });
          const endFormatted = end.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: false 
          });
          
          whenDisplay = `${dayName} • ${startFormatted}–${endFormatted}`;
        }
        
        return {
          id: apiSession.id.toString(),
          title: apiSession.sessionName, // Map sessionName to title for frontend
          description: apiSession.description,
          when: whenDisplay,
          location: firstOccurrence?.court?.courtName || 'TBD',
          eventType: apiSession.occurrences?.length > 1 ? 'recurring' : 'one-time', // Map based on occurrences count
          level: ['Beginner', 'Intermediate', 'Advanced'], // Default levels
          participants: firstOccurrence?.participants?.map((p: any) => ({
            id: p.id.toString(),
            name: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName} ${p.user.personalInfo.lastName}` :
              p.user?.userName || 'Unknown',
            status: p.status === 'confirmed' ? 'In-Game' : 'Resting', // Map to PlayerItem status
            avatar: undefined,
            initials: p.user?.personalInfo ? 
              `${p.user.personalInfo.firstName?.[0]}${p.user.personalInfo.lastName?.[0]}` :
              p.user?.userName?.[0] || '?',
            level: 'Intermediate' as LevelTag // Default level
          })) || [],
          // Add additional data for more informative cards
          maxParticipants: apiSession.maxParticipants || 10,
          pricePerPlayer: apiSession.pricePerPlayer || 150,
          sessionType: apiSession.sessionType || 'regular',
          isActive: apiSession.isActive,
          createdAt: apiSession.createdAt,
          hub: apiSession.hub,
          sport: apiSession.sport,
          totalOccurrences: apiSession.occurrences?.length || 0
        };
      });
      
      console.log('Converted sessions:', convertedSessions);
      setSessions(convertedSessions);
      
      // Set first session as selected if none selected
      if (!selectedSessionId && convertedSessions.length > 0) {
        setSelectedSessionId(convertedSessions[0].id);
      }
    } catch (error) {
      console.error('Error loading open-play sessions:', error);
      console.error('Error details:', error);
      // Show empty state on error instead of fallback data
      setSessions([]);
      setOriginalApiData([]);
      setSelectedSessionId(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load data on component mount
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Test API endpoint directly
  const testAPI = async () => {
    try {
      console.log('Testing API endpoint directly...');
      const response = await fetch('http://localhost:5000/api/openplay/sessions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Direct API test result:', data);
    } catch (error) {
      console.error('Direct API test error:', error);
    }
  };

  // Add test button for debugging
  useEffect(() => {
    // Add test function to window for debugging
    (window as any).testOpenPlayAPI = testAPI;
    console.log('Test function available at window.testOpenPlayAPI()');
  }, []);

  // React Big Calendar localizer
  const locales = {} as any;
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  // Color coding for event types (matching events page)
  const colorForType: Record<string, string> = {
    'one-time': '#3b82f6', // blue-500
    'tournament': '#22c55e', // green-500
    'recurring': '#f59e0b', // amber-500
  };

  const getEventTypeColor = (eventType?: string) => {
    return colorForType[eventType || 'one-time'] || '#6b7280';
  };

  // Convert sessions to calendar events using real API data
  const rbcEvents: RBCEvent[] = useMemo(() => {
    const events: RBCEvent[] = [];
    
    // Use original API data to create events for all occurrences
    originalApiData.forEach((apiSession) => {
      if (apiSession.occurrences && apiSession.occurrences.length > 0) {
        apiSession.occurrences.forEach((occurrence: any) => {
          const occurrenceDate = new Date(occurrence.occurrenceDate);
          const startDateTime = new Date(occurrenceDate);
          const endDateTime = new Date(occurrenceDate);
          
          // Parse time strings (e.g., "18:00", "21:00")
          const [startHour, startMinute] = occurrence.startTime.split(':').map(Number);
          const [endHour, endMinute] = occurrence.endTime.split(':').map(Number);
          
          startDateTime.setHours(startHour, startMinute, 0, 0);
          endDateTime.setHours(endHour, endMinute, 0, 0);
          
          // Find the corresponding converted session for the resource
          const convertedSession = sessions.find(s => s.id === apiSession.id.toString());
          
          events.push({
            id: `${apiSession.id}-${occurrence.id}`,
            title: apiSession.sessionName,
        start: startDateTime,
        end: endDateTime,
            resource: convertedSession || {
              id: apiSession.id.toString(),
              title: apiSession.sessionName,
              eventType: apiSession.occurrences.length > 1 ? 'recurring' : 'one-time',
              participants: [],
              level: ['Beginner', 'Intermediate', 'Advanced'],
              when: '',
              location: occurrence.court?.courtName || 'TBD',
              description: apiSession.description
            },
          });
        });
      }
    });
    
    return events;
  }, [originalApiData, sessions]);

  // Event content component (matching events page)
  const EventContent: React.FC<{ event: RBCEvent }> = ({ event }) => {
    const data = (event as any).resource as OpenPlaySession;
    const bg = getEventTypeColor(data.eventType);
    return (
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: bg }} />
        <span className="text-xs font-medium">{data.title}</span>
      </div>
    );
  };

  function openParticipants(sessionId: string) {
    setParticipantsSessionId(sessionId);
    setParticipantsOpen(true);
  }

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setIsOperationLoading(true);
      await deleteOpenPlaySession(sessionId);
      // Update sessions state directly instead of calling loadSessions to prevent double loading
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      setOriginalApiData(prev => prev.filter(s => s.id.toString() !== sessionId));
      setDeleteId(null);
    } catch (error) {
      console.error('Error deleting session:', error);
      // For delete errors, we'll still use a simple alert since it's less critical
      // and the delete modal is already a confirmation dialog
      alert('Failed to delete session. Please try again.');
    } finally {
      setIsOperationLoading(false);
    }
  };

  // Helper function to generate recurring occurrences
  const generateRecurringOccurrences = (
    startDate: string,
    endDate: string,
    frequency: "daily" | "weekly" | "monthly",
    startTime: string,
    endTime: string,
    capacity: number
  ) => {
    const occurrences: any[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    let count = 0;
    const maxOccurrences = 100; // Limit to prevent performance issues

    while (current <= end && count < maxOccurrences) {
      occurrences.push({
        date: current.toISOString().split('T')[0], // Format as YYYY-MM-DD
        startTime: startTime,
        endTime: endTime,
        capacity: capacity
      });

      count++;

      // Increment based on frequency
      switch (frequency) {
        case "daily":
          current.setDate(current.getDate() + 1);
          break;
        case "weekly":
          current.setDate(current.getDate() + 7);
          break;
        case "monthly":
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    if (count >= maxOccurrences) {
      console.warn(`Generated maximum ${maxOccurrences} occurrences. Consider reducing the date range.`);
    }

    return occurrences;
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOperationLoading(true);
    setCreateError(null); // Clear any previous errors
    
    try {
      const levels = Object.entries(createForm.levels)
        .filter(([, v]) => v)
        .map(([k]) => k as LevelTag);
        
      // Basic validation
      if (!createForm.title.trim() || !createForm.date || !createForm.startTime || !createForm.endTime || levels.length === 0) {
        setCreateError({
          success: false,
          message: "Validation Error",
          error: "Please fill in all required fields",
          conflicts: [],
          suggestions: {
            message: "Please complete all required fields before creating the session",
            availableAlternatives: [
              "Check that all required fields are filled",
              "Ensure at least one skill level is selected",
              "Verify the date and time are properly set"
            ],
            conflictDetails: ""
          }
        });
        setIsOperationLoading(false);
        return;
      }

      // Time range validation
      if (createForm.startTime >= createForm.endTime) {
        setCreateError({
          success: false,
          message: "Invalid Time Range",
          error: "End time must be after start time",
          conflicts: [],
          suggestions: {
            message: "Please adjust the time range for your session",
            availableAlternatives: [
              "Set an end time that is after the start time",
              "Use the quick presets for common durations",
              "Check that both times are in the correct format"
            ],
            conflictDetails: ""
          }
        });
        setIsOperationLoading(false);
        return;
      }

      // Recurring event validation
      if (createForm.eventType === "recurring" && !createForm.endDate) {
        setCreateError({
          success: false,
          message: "Recurring Event Error",
          error: "Please select an end date for recurring events",
          conflicts: [],
          suggestions: {
            message: "Recurring events require an end date to be specified",
            availableAlternatives: [
              "Select an end date for the recurring series",
              "Choose a different event type if you want a one-time event",
              "Consider the total number of sessions you want to create"
            ],
            conflictDetails: ""
          }
        });
        setIsOperationLoading(false);
        return;
      }

      // Tournament validation
      if (createForm.eventType === "tournament" && !createForm.registrationDeadline) {
        setCreateError({
          success: false,
          message: "Tournament Error",
          error: "Please set a registration deadline for tournaments",
          conflicts: [],
          suggestions: {
            message: "Tournaments require a registration deadline to be set",
            availableAlternatives: [
              "Set a registration deadline for the tournament",
              "Choose a different event type if you want a regular session",
              "Consider when participants should register by"
            ],
            conflictDetails: ""
          }
        });
        setIsOperationLoading(false);
        return;
      }

      // Map levels to level IDs (assuming lookup data is available)
      // const levelIds = levels.map(level => {
      //   const levelRef = lookup?.levels.find(l => l.description === level);
      //   return levelRef?.id || 1; // Default to first level if not found
      // });

      // Generate occurrences based on event type
      let occurrences: any[] = [];
      
      if (createForm.eventType === "recurring") {
        // Generate recurring occurrences
        occurrences = generateRecurringOccurrences(
          createForm.date,
          createForm.endDate,
          createForm.frequency,
          createForm.startTime,
          createForm.endTime,
          createForm.maxPlayers || 10
        );
        
        // Validate number of occurrences
        if (occurrences.length > 100) {
          alert(`Too many sessions! You're trying to create ${occurrences.length} sessions. Please reduce the date range or frequency. Maximum allowed is 100 sessions.`);
          setIsLoading(false);
          return;
        }
        
        if (occurrences.length > 50) {
          const confirm = window.confirm(`You're about to create ${occurrences.length} sessions. This may take a moment. Do you want to continue?`);
          if (!confirm) {
            setIsLoading(false);
            return;
          }
        }
      } else {
        // Single occurrence for one-time events and tournaments
        occurrences = [{
          date: createForm.date,
          startTime: createForm.startTime,
          endTime: createForm.endTime,
          capacity: createForm.maxPlayers || 10
        }];
      }

      // Create session data for API
      const sessionData: CreateOpenPlaySessionData = {
        sessionTitle: createForm.title.trim(),
        eventType: createForm.eventType === 'one-time' ? 'single' : createForm.eventType === 'recurring' ? 'recurring' : 'single', // Map tournament to single for now
        date: createForm.date,
        startTime: createForm.startTime,
        endTime: createForm.endTime,
        description: createForm.description.trim(),
        maxPlayers: createForm.maxPlayers || 10,
        pricePerPlayer: createForm.isFreeJoin ? 0 : (createForm.price || 0),
        isFreeJoin: createForm.isFreeJoin,
        skillLevels: levels.map(level => level.toLowerCase()), // Convert to lowercase for API
        courtId: "1", // TODO: Get from user context or selection
        hubId: "1", // TODO: Get from user context or selection
        sportsId: "1", // TODO: Get from user context or selection
        recurringSettings: createForm.eventType === 'recurring' ? {
          frequency: createForm.frequency,
          endDate: createForm.endDate
        } : undefined
      };

      // Create session via API
      await createOpenPlaySession(sessionData);
      
      // Close form and reset (data will be refreshed on next page load)
      setCreateOpen(false);
      setCreateError(null); // Clear any errors
      setCreateForm({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        maxPlayers: 10,
        price: 0,
        isFreeJoin: false,
        eventType: "one-time",
        frequency: "weekly",
        endDate: "",
        tournamentFormat: "single-elimination",
        prize: "",
        registrationDeadline: "",
        levels: { Beginner: true, Intermediate: false, Advanced: false },
      });
      
    } catch (error: any) {
      console.error('Error creating session:', error);
      
      // Check if it's a structured API error (thrown from service)
      if (error && typeof error === 'object' && error.success === false) {
        console.log('Setting structured error:', error);
        setCreateError(error as ApiError);
        setCreateOpen(false); // Close the form modal
        setErrorModalOpen(true); // Open the error modal
      } else {
        // Fallback for unexpected errors
        console.log('Setting fallback error for:', error);
        setCreateError({
          success: false,
          message: 'Failed to create session',
          error: error?.message || 'An unexpected error occurred',
          conflicts: [],
          suggestions: {
            message: 'Please try again with different parameters',
            availableAlternatives: [
              'Try booking at a different time',
              'Use a different court if available',
              'Check availability for a different date'
            ],
            conflictDetails: ''
          }
        });
        setCreateOpen(false); // Close the form modal
        setErrorModalOpen(true); // Open the error modal
      }
    } finally {
      setIsOperationLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-6">

      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Open Play Sessions</h1>
          <p className="text-muted-foreground">Create and manage open play sessions for your sports community</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Grid
            </Button>
            <Button
              variant={viewMode === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("calendar")}
              className="h-8 px-3"
            >
              <CalendarDays className="h-4 w-4 mr-1" />
              Calendar
            </Button>
          </div>
          <Button 
            onClick={() => {
              setCreateOpen(true);
              setCreateError(null); // Clear any previous errors when opening form
            }} 
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
          
          {/* Debug: Test error display */}
          {process.env.NODE_ENV === 'development' && (
            <Button 
              onClick={() => {
                setCreateError({
                  success: false,
                  message: "Test Error",
                  error: "This is a test error to verify the display works",
                  conflicts: [{
                    occurrenceId: "test",
                    sessionTitle: "Test Session",
                    startTime: "09:00",
                    endTime: "11:00"
                  }],
                  suggestions: {
                    message: "Test suggestion",
                    availableAlternatives: ["Try again", "Use different time"],
                    conflictDetails: "Test conflict"
                  }
                });
                setErrorModalOpen(true);
              }}
              variant="outline"
              size="sm"
            >
              Test Error
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-primary/10 rounded-lg p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-primary">{stats?.totalOccurrences || originalApiData.reduce((total, session) => total + (session.occurrences?.length || 0), 0)}</p>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-green-200/50 rounded-lg p-4 hover:shadow-lg hover:shadow-green-100/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Programs</p>
              <p className="text-2xl font-bold text-green-600">{stats?.activePrograms || originalApiData.filter(session => session.isActive).length}</p>
            </div>
            <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
              <Play className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-blue-200/50 rounded-lg p-4 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Participants</p>
              <p className="text-2xl font-bold text-blue-600">{stats?.totalParticipants || originalApiData.reduce((total, session) => total + (session.occurrences?.reduce((occTotal: number, occ: any) => occTotal + (occ.participants?.length || 0), 0) || 0), 0)}</p>
            </div>
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-card border border-purple-200/50 rounded-lg p-4 hover:shadow-lg hover:shadow-purple-100/50 transition-all duration-200">
          <div className="flex items-center justify-between">
        <div>
              <p className="text-sm font-medium text-muted-foreground">Upcoming Sessions</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats?.upcomingOccurrences || originalApiData.reduce((total, session) => total + (session.occurrences?.filter((occ: any) => new Date(occ.occurrenceDate) > new Date()).length || 0), 0)}
          </p>
        </div>
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Type Legend */}
      {viewMode === "calendar" && (
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {(Object.keys(colorForType) as Array<keyof typeof colorForType>).map((k) => (
            <span key={String(k)} className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: colorForType[k] }} />
              <span className="text-muted-foreground">{k}</span>
            </span>
          ))}
        </div>
      )}

      {/* Sessions Grid View */}
      {viewMode === "grid" && (
        isLoading ? (
          <OpenPlayGridSkeleton count={8} />
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {sessions.map((s) => {
          const topLevels = Array.from(new Set(s.participants.map((p) => p.level).filter(Boolean))) as LevelTag[];
          const isActive = s.participants.length > 0;
          return (
            <div
              key={s.id}
              className={cn(
                "group relative overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-300",
                "hover:shadow-xl hover:shadow-primary/15 hover:scale-[1.02] hover:border-primary/40",
                "hover:-translate-y-1",
                selectedSessionId === s.id ? "ring-2 ring-primary/70 shadow-xl shadow-primary/25 scale-[1.02]" : "",
                isActive ? "border-green-200/50 bg-green-50/30" : "border-primary/10"
              )}
              onClick={() => navigate(`/open-play/${s.id}`, { state: { session: s } })}
              role="button"
            >
              {/* Enhanced gradient accent */}
              <div className="pointer-events-none absolute inset-x-0 -top-20 h-36 translate-y-0 bg-gradient-to-b from-primary/15 to-transparent" />
              
              {/* Status indicator */}
              <div className="absolute top-3 right-3 flex flex-col gap-1">
                <Badge 
                  className={`px-3 py-1 text-xs font-medium ${
                    isActive 
                      ? "bg-green-100 text-green-800 border-green-200" 
                      : "bg-muted text-muted-foreground border-border"
                  }`}
                >
                  {isActive ? "🟢 Active" : "🔵 Open"}
                </Badge>
                {(s as any).isFreeJoin || (s as any).pricePerPlayer === 0 ? (
                  <Badge className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 border-green-200">
                    🆓 Free
                  </Badge>
                ) : null}
                {s.participants.length >= 8 && (
                  <Badge className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 border-orange-200">
                    🔥 Popular
                  </Badge>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {s.title}
                  </h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      <Calendar className="h-3 w-3" />
                      <span>ID: {s.id}</span>
                    </div>
                  </div>
                  
                  {s.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {s.description}
                    </p>
                  )}

                  {/* Event Type & Level Badges */}
                  <div className="flex flex-wrap gap-2">
                    {s.eventType && (
                      <Badge
                        variant="outline"
                        className={`text-xs px-3 py-1 font-medium ${
                          s.eventType === 'tournament' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                          s.eventType === 'recurring' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          'bg-gray-100 text-gray-800 border-gray-200'
                        }`}
                      >
                        {s.eventType === 'tournament' ? '🏆 Tournament' :
                         s.eventType === 'recurring' ? '🔄 Recurring' :
                         '📅 One-time'}
                      </Badge>
                    )}
                    {s.level.map((lvl) => (
                      <Badge
                        key={lvl}
                        variant="outline"
                        className={`text-xs px-3 py-1 font-medium ${levelColor[lvl]}`}
                      >
                        {lvl}
                      </Badge>
                    ))}
                    </div>

                  {/* Session Details Grid */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <div>
                        <div className="font-medium text-foreground">Schedule</div>
                        <div className="text-xs">{s.when}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <div>
                        <div className="font-medium text-foreground">Location</div>
                        <div className="text-xs">{s.location}</div>
                      </div>
                    </div>
                  </div>

                  {/* Hub Information */}
                  {(s as any).hub && (
                    <div className="bg-blue-50/50 rounded-lg p-3 border border-blue-200/30">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="font-medium text-blue-900">{(s as any).hub.sportsHubName}</div>
                          <div className="text-xs text-blue-700">
                            {(s as any).hub.city}, {(s as any).hub.stateProvince}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Info */}
                  <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-lg p-2">
                    <div className="flex items-center gap-4">
                    {s.eventType === 'recurring' && (
                        <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>Weekly</span>
                      </div>
                    )}
                    {s.eventType === 'tournament' && (
                        <div className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        <span>Single Elimination</span>
                      </div>
                    )}
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>Max {(s as any).maxParticipants || 10} players</span>
                  </div>
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {(s as any).isFreeJoin || (s as any).pricePerPlayer === 0 ? (
                        <span className="text-green-600 font-semibold">🆓 Free to Join</span>
                      ) : (
                        `₱${(s as any).pricePerPlayer || 150} per player`
                      )}
                    </div>
                  </div>
              </div>

                {/* Participants Section */}
                <div className="space-y-3 border-t pt-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                  <AvatarsStrip
                    people={s.participants.map((p) => ({ avatar: (p as any).avatar, initials: (p as any).initials, name: p.name }))}
                        max={4}
                        size={32}
                      />
                      <div className="text-sm">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground text-lg">{s.participants.length}</span>
                          <span className="text-muted-foreground">/ {(s as any).maxParticipants || 10} players</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {s.participants.length === 0 ? 'No participants yet' : 
                           s.participants.length === 1 ? '1 participant' : 
                           `${s.participants.length} participants`}
                        </div>
                  </div>
                </div>
                {topLevels.length > 0 && (
                      <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-md">
                        <Star className="h-3 w-3 text-amber-600" />
                        <span className="text-xs font-medium text-amber-800">
                          {topLevels.slice(0, 2).join(", ")}
                      </span>
                  </div>
                )}
              </div>

                  {/* Enhanced Progress bar with percentage */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Registration Progress</span>
                      <span className="font-medium text-foreground">
                        {Math.round((s.participants.length / ((s as any).maxParticipants || 10)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2.5">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-500 ${
                          s.participants.length >= 8 ? 'bg-green-500' :
                          s.participants.length >= 5 ? 'bg-yellow-500' :
                          s.participants.length >= 2 ? 'bg-blue-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${(s.participants.length / ((s as any).maxParticipants || 10)) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {s.participants.length < 2 ? 'Need at least 2 players' :
                       s.participants.length < 5 ? 'Good start!' :
                       s.participants.length < 8 ? 'Almost full!' :
                       'Session is full!'}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                    className="flex-1 h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    openParticipants(s.id);
                  }}
                >
                    <UserCheck className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Players</div>
                      <div className="text-xs opacity-75">View & Manage</div>
                    </div>
                </Button>
                <Button
                  size="sm"
                    className="flex-1 h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/open-play/${s.id}`, { state: { session: s } });
                  }}
                >
                    <Settings className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="text-sm font-medium">Manage</div>
                      <div className="text-xs opacity-75">Edit Session</div>
                    </div>
                </Button>
                </div>

                {/* Quick Stats Footer */}
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${(s as any).isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                      <span>{(s as any).isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{(s as any).totalOccurrences || 0} sessions</span>
                    </div>
                    {(s as any).sport && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>{(s as any).sport.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    {s.eventType === 'recurring' ? 'Ongoing' : 'Scheduled'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
          </div>
        )
      )}
      
      {/* Empty State */}
      {!isLoading && sessions.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No open play sessions</h3>
          <p className="text-muted-foreground mb-4">
            Create your first open play session to get started
          </p>
          <Button 
            onClick={() => {
              setCreateOpen(true);
              setCreateError(null); // Clear any previous errors when opening form
            }} 
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
        </div>
      )}

      {/* Create Open Play overlay */}
      <ResponsiveOverlay
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create Open Play Session"
        ariaLabel="Create Open Play Session"
        className="max-w-2xl w-[95vw]"
        headerClassName="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
        contentClassName="bg-gradient-to-b from-background to-primary/5"
        footer={
          <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="text-sm text-muted-foreground">
              Fill in the details to create a new open play session
            </div>
            <div className="flex items-center gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setCreateOpen(false);
                  setCreateError(null); // Clear errors when canceling
                }}
                className="h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
              >
              Cancel
            </Button>
              <Button 
                type="submit" 
                form="open-play-create-form"
                className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
                disabled={isOperationLoading}
              >
                {isOperationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </>
                )}
              </Button>
            </div>
          </div>
        }
      >
        <form id="open-play-create-form" onSubmit={handleCreateSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Session Details</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Set the date and time range for your session. The end time must be after the start time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Session Title *</label>
            <Input
              value={createForm.title}
              onChange={(e) => setCreateForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="e.g., Pickleball Open Play"
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Event Type *</label>
                <select
                  className="w-full h-11 rounded-md border bg-background px-3 text-sm"
                  value={createForm.eventType}
                  onChange={(e) => setCreateForm((p) => ({ ...p, eventType: e.target.value as "one-time" | "recurring" | "tournament" }))}
                  required
                >
                  <option value="one-time">One-time Event</option>
                  <option value="recurring">Recurring Event</option>
                  <option value="tournament">Tournament</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Date *</label>
              <Input
                type="date"
                value={createForm.date}
                onChange={(e) => setCreateForm((p) => ({ ...p, date: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Start Time *</label>
              <Input
                type="time"
                value={createForm.startTime}
                onChange={(e) => setCreateForm((p) => ({ ...p, startTime: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">End Time *</label>
              <Input
                type="time"
                value={createForm.endTime}
                onChange={(e) => setCreateForm((p) => ({ ...p, endTime: e.target.value }))}
                  className="h-11"
                  required
                />
              </div>
              {/* Quick Time Presets */}
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Quick Presets</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "1 Hour", start: "09:00", end: "10:00" },
                    { label: "1.5 Hours", start: "09:00", end: "10:30" },
                    { label: "2 Hours", start: "09:00", end: "11:00" },
                    { label: "3 Hours", start: "09:00", end: "12:00" },
                  ].map((preset) => (
                    <Button
                      key={preset.label}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setCreateForm(prev => ({
                        ...prev,
                        startTime: preset.start,
                        endTime: preset.end,
                      }))}
                      className="h-8 px-3 text-xs border-primary/20 hover:bg-primary/10 hover:border-primary/30"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Duration Display */}
              {createForm.startTime && createForm.endTime && (
                <div className="col-span-2 space-y-2">
                  <div className={`flex items-center gap-2 p-3 border rounded-lg ${
                    createForm.startTime >= createForm.endTime 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-primary/5 border-primary/20'
                  }`}>
                    <Clock className={`h-4 w-4 ${
                      createForm.startTime >= createForm.endTime ? 'text-red-500' : 'text-primary'
                    }`} />
                    <span className={`text-sm font-medium ${
                      createForm.startTime >= createForm.endTime ? 'text-red-600' : 'text-primary'
                    }`}>
                      Session Duration: {(() => {
                        if (createForm.startTime >= createForm.endTime) {
                          return "Invalid time range";
                        }
                        const start = new Date(`2000-01-01T${createForm.startTime}:00`);
                        const end = new Date(`2000-01-01T${createForm.endTime}:00`);
                        const diffMs = end.getTime() - start.getTime();
                        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                        if (diffHours > 0) {
                          return `${diffHours}h ${diffMinutes}m`;
                        }
                        return `${diffMinutes}m`;
                      })()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Description</label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Describe your event, rules, special instructions, or any additional information participants should know..."
                className="w-full min-h-24 rounded-md border bg-background px-3 py-2 text-sm resize-none"
                rows={4}
              />
            </div>
          </div>

          {/* Recurring Event Settings */}
          {createForm.eventType === "recurring" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Recurring Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Frequency *</label>
                  <select
                    className="w-full h-11 rounded-md border bg-background px-3 text-sm"
                    value={createForm.frequency}
                    onChange={(e) => setCreateForm((p) => ({ ...p, frequency: e.target.value as "daily" | "weekly" | "monthly" }))}
                    required
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">End Date *</label>
                  <Input
                    type="date"
                    value={createForm.endDate}
                    onChange={(e) => setCreateForm((p) => ({ ...p, endDate: e.target.value }))}
                    className="h-11"
                    required
                  />
                </div>
              </div>
              
              {/* Recurring Preview */}
              {createForm.date && createForm.endDate && createForm.frequency && (
                <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Recurring Preview</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This will create {(() => {
                      const occurrences = generateRecurringOccurrences(
                        createForm.date,
                        createForm.endDate,
                        createForm.frequency,
                        createForm.startTime || "09:00",
                        createForm.endTime || "11:00",
                        10
                      );
                      return occurrences.length;
                    })()} session{(() => {
                      const occurrences = generateRecurringOccurrences(
                        createForm.date,
                        createForm.endDate,
                        createForm.frequency,
                        createForm.startTime || "09:00",
                        createForm.endTime || "11:00",
                        10
                      );
                      return occurrences.length !== 1 ? 's' : '';
                    })()} from {new Date(createForm.date).toLocaleDateString()} to {new Date(createForm.endDate).toLocaleDateString()}
                  </p>
                  {(() => {
                    const occurrences = generateRecurringOccurrences(
                      createForm.date,
                      createForm.endDate,
                      createForm.frequency,
                      createForm.startTime || "09:00",
                      createForm.endTime || "11:00",
                      10
                    );
                    if (occurrences.length >= 50) {
                      return (
                        <p className="text-sm text-amber-600 mt-2">
                          ⚠️ Warning: Creating {occurrences.length} sessions may take a moment. Consider reducing the date range.
                        </p>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>
          )}

          {/* Tournament Settings */}
          {createForm.eventType === "tournament" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Tournament Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Tournament Format *</label>
                  <select
                    className="w-full h-11 rounded-md border bg-background px-3 text-sm"
                    value={createForm.tournamentFormat}
                    onChange={(e) => setCreateForm((p) => ({ ...p, tournamentFormat: e.target.value as "single-elimination" | "double-elimination" | "round-robin" }))}
                    required
                  >
                    <option value="single-elimination">Single Elimination</option>
                    <option value="double-elimination">Double Elimination</option>
                    <option value="round-robin">Round Robin</option>
                  </select>
          </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Registration Deadline *</label>
            <Input
                    type="datetime-local"
                    value={createForm.registrationDeadline}
                    onChange={(e) => setCreateForm((p) => ({ ...p, registrationDeadline: e.target.value }))}
                    className="h-11"
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground">Prize/Prize Pool</label>
            <Input
                    value={createForm.prize}
                    onChange={(e) => setCreateForm((p) => ({ ...p, prize: e.target.value }))}
                    placeholder="e.g., ₱5,000 cash prize or Trophy + Certificate"
                    className="h-11"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Session Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Session Settings</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Players</label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={createForm.maxPlayers}
                  onChange={(e) => setCreateForm((p) => ({ ...p, maxPlayers: Number(e.target.value) }))}
                  className="h-11"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Price per Player (₱)</label>
            <Input
                  type="number"
                  min={0}
                  step="0.01"
                  value={createForm.price}
                  onChange={(e) => setCreateForm((p) => ({ ...p, price: Number(e.target.value) }))}
                  placeholder="0.00"
                  className="h-11"
                  disabled={createForm.isFreeJoin}
                />
              </div>
            </div>
            
            {/* Free Join Checkbox */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-4 border rounded-lg bg-gradient-to-r from-green-50/50 to-emerald-50/50 border-green-200/50">
                <input
                  type="checkbox"
                  id="isFreeJoin"
                  checked={createForm.isFreeJoin}
                  onChange={(e) => {
                    setCreateForm((p) => ({ 
                      ...p, 
                      isFreeJoin: e.target.checked,
                      price: e.target.checked ? 0 : p.price // Reset price to 0 when free join is checked
                    }));
                  }}
                  className="h-4 w-4 text-green-600 rounded border-green-300 focus:ring-green-200"
                />
                <div className="flex-1">
                  <label htmlFor="isFreeJoin" className="text-sm font-medium text-green-800 cursor-pointer">
                    🆓 Free to Join
                  </label>
                  <p className="text-xs text-green-700 mt-1">
                    Players can join this session without any payment. When enabled, the price per player will be set to ₱0.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Skill Levels */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <Star className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Skill Levels</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {(["Beginner", "Intermediate", "Advanced"] as LevelTag[]).map((lvl) => (
                <div key={lvl} className={`space-y-2 p-3 border rounded-lg transition-all ${
                  (createForm.levels as any)[lvl] ? 'border-primary/30 bg-primary/10' : 'border-border bg-muted/30'
                }`}>
                  <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={(createForm.levels as any)[lvl]}
                    onChange={(e) =>
                      setCreateForm((p) => ({
                        ...p,
                        levels: { ...p.levels, [lvl]: e.target.checked },
                      }))
                    }
                      className="h-4 w-4 text-primary rounded border-primary/30 focus:ring-primary/20"
                    />
                    <span className="text-sm font-medium capitalize text-foreground">{lvl}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {lvl === 'Beginner' && 'New to the sport or learning basics'}
                    {lvl === 'Intermediate' && 'Some experience, comfortable with rules'}
                    {lvl === 'Advanced' && 'Experienced players, competitive level'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </form>
      </ResponsiveOverlay>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-xl border bg-card">
            {/* Calendar toolbar */}
            <div className="flex items-center justify-between p-2 border-b">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setCalDate(new Date())}>Today</Button>
                <Button size="icon" variant="outline" onClick={() => setCalDate(addDays(calDate, calView === Views.MONTH ? -30 : calView === Views.WEEK ? -7 : -1))}>{"<"}</Button>
                <Button size="icon" variant="outline" onClick={() => setCalDate(addDays(calDate, calView === Views.MONTH ? 30 : calView === Views.WEEK ? 7 : 1))}>{">"}</Button>
                <span className="text-sm font-medium">{format(calDate, calView === Views.MONTH ? "LLLL yyyy" : "PP")}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border overflow-hidden">
                  {[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
                    <button key={v} onClick={() => setCalView(v)} className={`h-8 px-3 text-sm ${calView === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}>{v[0] + v.slice(1).toLowerCase()}</button>
                  ))}
                </div>
                <input type="date" className="h-8 w-[160px] rounded-md border bg-background px-2 text-sm" value={format(calDate, "yyyy-MM-dd")} onChange={(e) => setCalDate(new Date(e.target.value))} />
              </div>
            </div>
            <ClubCalendar
              localizer={localizer}
              events={rbcEvents}
              startAccessor="start"
              endAccessor="end"
              selectable
              popup
              components={{ event: EventContent }}
              onSelectSlot={(slot: SlotInfo) => {
                // Pre-fill form with selected date/time range
                setCreateForm(prev => ({
                  ...prev,
                  date: format(slot.start, 'yyyy-MM-dd'),
                  startTime: format(slot.start, 'HH:mm'),
                  endTime: format(slot.end, 'HH:mm'),
                }));
                setCreateOpen(true);
                setCreateError(null); // Clear any previous errors when opening form
              }}
              onSelectEvent={(event: RBCEvent) => {
                const session = (event as any).resource as OpenPlaySession;
                navigate(`/open-play/${session.id}`, { state: { session } });
              }}
              views={[Views.MONTH, Views.WEEK, Views.DAY]}
              date={calDate}
              view={calView as any}
              onNavigate={(d: any) => setCalDate(d)}
              onView={(v: any) => setCalView(v)}
              eventPropGetter={(event: RBCEvent) => {
                const data = (event as any).resource as OpenPlaySession;
                const bg = getEventTypeColor(data.eventType);
                return { style: { backgroundColor: `${bg}22`, border: `1px solid ${bg}66`, color: "inherit", borderRadius: 8 } };
              }}
            />
          </div>
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-lg border bg-card p-3 flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">{session.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>
                  </div>
                  <Badge variant={session.eventType === 'tournament' ? 'success' : session.eventType === 'recurring' ? 'warning' : 'muted'}>{session.eventType}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{session.when} • Court TBD • {session.eventType}</p>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => navigate(`/open-play/${session.id}`, { state: { session } })}>View</Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteId(session.id)}>Delete</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Participants overlay */}
      <PlayerStatusPanel
        open={participantsOpen}
        onOpenChange={setParticipantsOpen}
        title={`Participants - ${sessions.find((s) => s.id === participantsSessionId)?.title || 'Session'}`}
        players={sessions.find((s) => s.id === participantsSessionId)?.participants ?? []}
        adminMode
        onToggleStatus={(playerId, to) => {
          if (!participantsSessionId) return;
          setSessions((prev) =>
            prev.map((s) =>
              s.id === participantsSessionId
                ? {
                    ...s,
                    participants: s.participants.map((p) =>
                      p.id === playerId ? { ...p, status: to } : p
                    ),
                  }
                : s
            )
          );
        }}
        notice="Manage player statuses and view session participants. Players can be moved between playing, resting, and waiting states."
      />

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border w-full max-w-sm p-4 space-y-3">
            <h3 className="text-base font-semibold">Delete Session</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this open-play session? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteId && handleDeleteSession(deleteId)}
                disabled={isOperationLoading}
              >
                {isOperationLoading ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {errorModalOpen && createError && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <ErrorDisplay 
              error={createError} 
              onClose={() => {
                setErrorModalOpen(false);
                setCreateError(null);
              }}
              className="border-0 rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default OpenPlayPage;
