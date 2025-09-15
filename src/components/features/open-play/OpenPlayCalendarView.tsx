import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { Views, type SlotInfo, type Event as RBCEvent } from 'react-big-calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ClubCalendar from '@/components/club-calendar';
import { type PlayerItem } from '@/components/player-status-panel';

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
  occurrenceId?: string;
  occurrences?: any[]; // OpenPlayOccurrence[] - occurrences for recurring sessions
  maxParticipants?: number;
  pricePerPlayer?: number;
  sessionType?: string;
  isActive?: boolean;
  createdAt?: string;
  hub?: any;
  sport?: any;
  totalOccurrences?: number;
  isDummy?: boolean; // Flag to indicate dummy data
};

interface OpenPlayCalendarViewProps {
  // Calendar state
  calDate: Date;
  setCalDate: (date: Date) => void;
  calView: string;
  setCalView: (view: string) => void;
  
  // Calendar data
  localizer: any;
  rbcEvents: RBCEvent[];
  
  // Sessions data
  sessions: OpenPlaySession[];
  
  // Event handlers
  onSelectSlot: (slot: SlotInfo) => void;
  onSelectEvent: (event: RBCEvent) => void;
  onDeleteSession: (sessionId: string) => void;
  
  // Event styling
  getEventTypeColor: (eventType?: string) => string;
  
  // Event content component
  EventContent: React.FC<{ event: RBCEvent }>;
}

const OpenPlayCalendarView: React.FC<OpenPlayCalendarViewProps> = ({
  calDate,
  setCalDate,
  calView,
  setCalView,
  localizer,
  rbcEvents,
  sessions,
  onSelectSlot,
  onSelectEvent,
  onDeleteSession,
  getEventTypeColor,
  EventContent
}) => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border bg-card">
        {/* Calendar toolbar */}
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setCalDate(new Date())}>
              Today
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => setCalDate(addDays(calDate, calView === Views.MONTH ? -30 : calView === Views.WEEK ? -7 : -1))}
            >
              {"<"}
            </Button>
            <Button 
              size="icon" 
              variant="outline" 
              onClick={() => setCalDate(addDays(calDate, calView === Views.MONTH ? 30 : calView === Views.WEEK ? 7 : 1))}
            >
              {">"}
            </Button>
            <span className="text-sm font-medium">
              {format(calDate, calView === Views.MONTH ? "LLLL yyyy" : "PP")}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-md border overflow-hidden">
              {[Views.MONTH, Views.WEEK, Views.DAY].map((v) => (
                <button 
                  key={v} 
                  onClick={() => setCalView(v)} 
                  className={`h-8 px-3 text-sm ${calView === v ? "bg-primary text-primary-foreground" : "bg-background hover:bg-muted"}`}
                >
                  {v[0] + v.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <input 
              type="date" 
              className="h-8 w-[160px] rounded-md border bg-background px-2 text-sm" 
              value={format(calDate, "yyyy-MM-dd")} 
              onChange={(e) => setCalDate(new Date(e.target.value))} 
            />
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
          onSelectSlot={onSelectSlot}
          onSelectEvent={onSelectEvent}
          views={[Views.MONTH, Views.WEEK, Views.DAY]}
          date={calDate}
          view={calView as any}
          onNavigate={(d: any) => setCalDate(d)}
          onView={(v: any) => setCalView(v)}
          eventPropGetter={(event: RBCEvent) => {
            const data = (event as any).resource as OpenPlaySession;
            const bg = getEventTypeColor(data.eventType);
            return { 
              style: { 
                backgroundColor: `${bg}22`, 
                border: `1px solid ${bg}66`, 
                color: "inherit", 
                borderRadius: 8 
              } 
            };
          }}
        />
      </div>
      
      <div className="space-y-2">
        {sessions.map((session) => (
          <div 
            key={session.id} 
            className={`rounded-lg border bg-card p-3 flex flex-col gap-2 ${session.isDummy ? 'border-dashed border-orange-300 bg-orange-50/30' : ''}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold">{session.title}</h3>
                  {session.isDummy && (
                    <Badge variant="outline" className="text-xs bg-orange-100 text-orange-700 border-orange-300">
                      DUMMY
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{session.description}</p>
              </div>
              <Badge 
                variant={session.eventType === 'tournament' ? 'success' : session.eventType === 'recurring' ? 'warning' : 'muted'}
              >
                {session.eventType}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {session.when} • Court TBD • {session.eventType}
            </p>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                onClick={() => {
                  const firstOccurrenceId = (session as any).occurrences?.[0]?.id || session.id;
                  navigate(`/open-play/${session.id}?occurrenceId=${firstOccurrenceId}`, { state: { session } });
                }}
              >
                View
              </Button>
              <Button 
                size="sm" 
                variant="destructive" 
                onClick={() => onDeleteSession(session.id)}
              >
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpenPlayCalendarView;
