/* eslint-disable @typescript-eslint/no-explicit-any */
import { format, getDay, parse, startOfWeek } from 'date-fns';
import { useCallback, useState } from 'react';
import { dateFnsLocalizer, Views, type Event as RBCEvent, type SlotInfo } from 'react-big-calendar';
import type { OpenPlaySessionUI } from './useOpenPlay';

// Color coding for event types
const colorForType: Record<string, string> = {
  'one-time': '#3b82f6', // blue-500
  'tournament': '#22c55e', // green-500
  'recurring': '#f59e0b', // amber-500
};

export const useOpenPlayCalendar = () => {
  const [calDate, setCalDate] = useState<Date>(new Date());
  const [calView, setCalView] = useState<string>(Views.MONTH);

  // React Big Calendar localizer
  const locales = {} as any;
  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
  });

  const getEventTypeColor = useCallback((eventType?: string) => {
    return colorForType[eventType || 'one-time'] || '#6b7280';
  }, []);

  // Convert sessions to calendar events
  const convertSessionsToEvents = useCallback((
    originalApiData: any[],
    sessions: OpenPlaySessionUI[]
  ): RBCEvent[] => {
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
  }, []);

  // Event content component factory - returns a simple function
  const createEventContent = useCallback(() => {
    return ({ event }: { event: RBCEvent }) => {
      const data = (event as any).resource as OpenPlaySessionUI;
      const bg = getEventTypeColor(data.eventType);
      // Return a simple object that can be used by the calendar
      return {
        type: 'div',
        className: "flex items-center gap-2 px-1 py-0.5",
        children: [
          {
            type: 'span',
            className: "inline-block h-2 w-2 rounded-full",
            style: { backgroundColor: bg }
          },
          {
            type: 'span',
            className: "text-xs font-medium",
            children: data.title
          }
        ]
      };
    };
  }, [getEventTypeColor]);

  // Handle slot selection for creating new sessions
  const handleSlotSelect = useCallback((
    slot: SlotInfo,
    onFormOpen: () => void,
    onFormUpdate: (updates: any) => void
  ) => {
    // Pre-fill form with selected date/time range
    onFormUpdate({
      date: format(slot.start, 'yyyy-MM-dd'),
      startTime: format(slot.start, 'HH:mm'),
      endTime: format(slot.end, 'HH:mm'),
    });
    onFormOpen();
  }, []);

  // Handle event selection for managing sessions
  const handleEventSelect = useCallback((
    event: RBCEvent,
    onManageSession: (session: OpenPlaySessionUI) => void,
    onNavigate: (path: string, state?: any) => void
  ) => {
    const session = (event as any).resource as OpenPlaySessionUI;
    // For recurring sessions, use the handleManageSession function to show occurrence selector
    if (session.eventType === 'recurring' && (session as any).occurrences && (session as any).occurrences.length > 1) {
      onManageSession(session);
    } else {
      // For single sessions or recurring sessions with only one occurrence, go directly
      const firstOccurrenceId = (session as any).occurrences?.[0]?.id || session.id;
      onNavigate(`/open-play/${session.id}?occurrenceId=${firstOccurrenceId}`, { state: { session } });
    }
  }, []);

  return {
    // Calendar state
    calDate,
    setCalDate,
    calView,
    setCalView,
    
    // Calendar configuration
    localizer,
    colorForType,
    getEventTypeColor,
    
    // Event conversion
    convertSessionsToEvents,
    createEventContent,
    
    // Event handlers
    handleSlotSelect,
    handleEventSelect,
  };
};
