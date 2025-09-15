/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import ResponsiveOverlay from "@/components/responsive-overlay";
import PlayerStatusPanel from "@/components/player-status-panel";
import { Button } from "@/components/ui/button";
import ErrorDisplay from "@/components/ui/error-display";
import OpenPlayGridSkeleton from "@/components/features/open-play/OpenPlayGridSkeleton";
import { Calendar, Users, Plus, Play, TrendingUp, Grid3X3, CalendarDays } from "lucide-react";
import { type SlotInfo, type Event as RBCEvent } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
  getAllOpenPlaySessions,
} from "@/services/open-play.service";
import OccurrenceSelector from "@/components/features/open-play/OccurrenceSelector";
import CreateSessionForm from "@/components/features/open-play/CreateSessionForm";
import SessionCard from "@/components/features/open-play/SessionCard";
import OpenPlayCalendarView from "@/components/features/open-play/OpenPlayCalendarView";
import { 
  useCourts, 
  useOpenPlay
} from "@/hooks";
import { useOpenPlayCalendar } from "@/hooks/useOpenPlayCalendar";
import { useOpenPlaySessions } from "@/hooks/useOpenPlaySessions";
import { useOpenPlayStats } from "@/hooks/useOpenPlayStats";
import { useOpenPlayForm } from "@/hooks/useOpenPlayForm";
import { useAuth } from "@/context/AuthContext";
import type { OpenPlaySessionUI } from "@/hooks/useOpenPlay";



const OpenPlayPage: React.FC = () => {
  const { user } = useAuth();
  const sportshubId = user?.userTypeRef.id;
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [originalApiData, setOriginalApiData] = useState<any[]>([]); // Store original API data for calendar
  
  // Get courts data for court selection
  const { items: courts, isLoading: courtsLoading } = useCourts();

  // Use the new hooks
  const { sessions, isLoading } = useOpenPlay();
  const calendarHook = useOpenPlayCalendar();
  const {
    selectedSessionId,
    setSelectedSessionId,
    participantsOpen,
    setParticipantsOpen,
    participantsSessionId,
    openParticipants,
    updateParticipantStatus,
    showOccurrenceSelector,
    setShowOccurrenceSelector,
    selectedSessionForOccurrence,
    handleSelectOccurrence,
    handleManageSession,
    handleDeleteSession,
    deleteId,
    setDeleteId,
    isDeleting,
  } = useOpenPlaySessions();
  const statsHook = useOpenPlayStats(originalApiData);
  const {
    form: createForm,
    setForm: setCreateForm,
    isOpen: createOpen,
    openForm,
    closeForm: closeCreateForm,
    handleCreateSubmit,
    createError,
    errorModalOpen,
    closeErrorModal,
    isCreating: isOperationLoading,
  } = useOpenPlayForm(sportshubId?.toString());
  
  // Load original API data for calendar view
  useEffect(() => {
    const loadOriginalData = async () => {
      try {
        const sessionsData = await getAllOpenPlaySessions();
      const safeSessionsData = Array.isArray(sessionsData) ? sessionsData : [];
        setOriginalApiData(safeSessionsData);
      } catch (error) {
        console.error('Failed to fetch original API data:', error);
        setOriginalApiData([]);
      }
    };
    
    loadOriginalData();
  }, []);

  // Set first session as selected if none selected
  useEffect(() => {
    if (!selectedSessionId && sessions.length > 0) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId, setSelectedSessionId]);

  // Convert sessions to calendar events using hook
  const rbcEvents: RBCEvent[] = calendarHook.convertSessionsToEvents(originalApiData, sessions);
  
  // Event content component
  const EventContent: React.FC<{ event: RBCEvent }> = ({ event }) => {
    const data = (event as any).resource as OpenPlaySessionUI;
    const bg = calendarHook.getEventTypeColor(data.eventType);
    return (
      <div className="flex items-center gap-2 px-1 py-0.5">
        <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: bg }} />
        <span className="text-xs font-medium">{data.title}</span>
      </div>
    );
  };

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
              openForm();
            }} 
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Button>
          
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-primary/10 rounded-lg p-4 hover:shadow-lg hover:shadow-primary/10 transition-all duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
              <p className="text-2xl font-bold text-primary">{statsHook.stats?.totalOccurrences || 0}</p>
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
              <p className="text-2xl font-bold text-green-600">{statsHook.stats?.activePrograms || 0}</p>
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
              <p className="text-2xl font-bold text-blue-600">{statsHook.stats?.totalParticipants || 0}</p>
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
                {statsHook.stats?.upcomingOccurrences || 0}
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
          {(Object.keys(calendarHook.colorForType) as Array<keyof typeof calendarHook.colorForType>).map((k) => (
            <span key={String(k)} className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: calendarHook.colorForType[k] }} />
              <span className="text-muted-foreground">{String(k)}</span>
            </span>
          ))}
        </div>
      )}

      {/* Sessions Grid View */}
      {viewMode === "grid" && (
        isLoading ? (
          <OpenPlayGridSkeleton count={6} />
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                selectedSessionId={selectedSessionId}
                onManageSession={(session: any) => handleManageSession(session as OpenPlaySessionUI)}
                onOpenParticipants={openParticipants}
              />
            ))}
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
              openForm();
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
        onOpenChange={(open) => open ? openForm() : closeCreateForm()}
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
                  closeCreateForm();
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
        <CreateSessionForm
          form={createForm}
          setForm={setCreateForm}
          courts={courts}
          courtsLoading={courtsLoading}
          onSubmit={handleCreateSubmit}
        />
      </ResponsiveOverlay>

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <OpenPlayCalendarView
          calDate={calendarHook.calDate}
          setCalDate={calendarHook.setCalDate}
          calView={calendarHook.calView}
          setCalView={calendarHook.setCalView}
          localizer={calendarHook.localizer}
          rbcEvents={rbcEvents}
          sessions={sessions}
          onSelectSlot={(slot: SlotInfo) => {
            calendarHook.handleSlotSelect(slot, openForm, setCreateForm);
          }}
          onSelectEvent={(event: RBCEvent) => {
            const session = (event as any).resource as OpenPlaySessionUI;
            // For recurring sessions, use the handleManageSession function to show occurrence selector
            if (session.eventType === 'recurring' && (session as any).occurrences && (session as any).occurrences.length > 1) {
              handleManageSession(session);
            } else {
              // For single sessions or recurring sessions with only one occurrence, go directly
              const firstOccurrenceId = (session as any).occurrences?.[0]?.id || session.id;
              window.location.href = `/open-play/${session.id}?occurrenceId=${firstOccurrenceId}`;
            }
          }}
          onDeleteSession={setDeleteId}
          getEventTypeColor={calendarHook.getEventTypeColor}
          EventContent={EventContent}
        />
      )}

      {/* Participants overlay */}
      <PlayerStatusPanel
        open={participantsOpen}
        onOpenChange={setParticipantsOpen}
        title={`Participants - ${sessions.find((s) => s.id === participantsSessionId)?.title || 'Session'}`}
        players={sessions.find((s) => s.id === participantsSessionId)?.participants ?? []}
        adminMode
        onToggleStatus={updateParticipantStatus}
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
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
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
              onClose={closeErrorModal}
              className="border-0 rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Occurrence Selector Modal */}
      {selectedSessionForOccurrence && (
        <OccurrenceSelector
          open={showOccurrenceSelector}
          onOpenChange={setShowOccurrenceSelector}
          sessionTitle={selectedSessionForOccurrence.title}
          occurrences={(selectedSessionForOccurrence as any).occurrences || []}
          onSelectOccurrence={handleSelectOccurrence}
        />
      )}
    </div>
  );
};

export default OpenPlayPage;
