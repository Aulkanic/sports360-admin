import React, { useState } from 'react';
import ResponsiveOverlay from '@/components/responsive-overlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { OpenPlayOccurrence } from '@/services/open-play.service';

interface OccurrenceSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionTitle: string;
  occurrences: OpenPlayOccurrence[];
  onSelectOccurrence: (occurrence: OpenPlayOccurrence) => void;
}

const OccurrenceSelector: React.FC<OccurrenceSelectorProps> = ({
  open,
  onOpenChange,
  sessionTitle,
  occurrences,
  onSelectOccurrence
}) => {
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState<string | null>(null);

  const handleSelectOccurrence = () => {
    if (selectedOccurrenceId) {
      const occurrence = occurrences.find(occ => occ.id === selectedOccurrenceId);
      if (occurrence) {
        onSelectOccurrence(occurrence);
        onOpenChange(false);
        setSelectedOccurrenceId(null);
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1: // READY
        return 'bg-green-100 text-green-800 border-green-200';
      case 2: // SCHEDULED
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 3: // ACTIVE
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 4: // COMPLETED
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 5: // CANCELLED
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (statusId: number) => {
    switch (statusId) {
      case 1: return 'Ready';
      case 2: return 'Scheduled';
      case 3: return 'Active';
      case 4: return 'Completed';
      case 5: return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const sortedOccurrences = [...occurrences].sort((a, b) => {
    const dateA = new Date(`${a.occurrenceDate}T${a.startTime}`);
    const dateB = new Date(`${b.occurrenceDate}T${b.startTime}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Select Occurrence to Manage"
      ariaLabel="Occurrence Selector Modal"
      className="max-w-4xl w-[95vw]"
      headerClassName="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
      contentClassName="bg-gradient-to-b from-background to-primary/5"
      footer={
        <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <div className="text-sm text-muted-foreground">
            {occurrences.length} occurrence{occurrences.length !== 1 ? 's' : ''} available
          </div>
          <div className="flex items-center gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={handleSelectOccurrence}
              disabled={!selectedOccurrenceId}
              className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200"
            >
              <Settings className="h-4 w-4 mr-2" />
              Manage Selected
            </Button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Session Info */}
        <div className="bg-card rounded-lg p-4 border border-primary/20 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-foreground">{sessionTitle}</h3>
          </div>
          <div className="text-sm text-muted-foreground">
            Select which occurrence you want to manage from the list below
          </div>
        </div>

        {/* Occurrences List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground">Available Occurrences</h3>
          <div className="grid gap-4">
            {sortedOccurrences.map((occurrence) => (
              <div
                key={occurrence.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedOccurrenceId === occurrence.id
                    ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedOccurrenceId(occurrence.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 text-sm font-medium text-foreground">
                        <Calendar className="h-4 w-4" />
                        {formatDate(occurrence.occurrenceDate)}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {formatTime(occurrence.startTime)} - {formatTime(occurrence.endTime)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {occurrence.court && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {occurrence.court.courtName}
                          {occurrence.court.status && (
                            <span className="text-xs px-1 py-0.5 bg-gray-100 rounded">
                              {occurrence.court.status.description}
                            </span>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {occurrence.currentParticipants} participants
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Badge className={cn("text-xs", getStatusColor(occurrence.statusId))}>
                      {getStatusText(occurrence.statusId)}
                    </Badge>
                    {selectedOccurrenceId === occurrence.id && (
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {occurrences.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No occurrences available for this session</p>
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  );
};

export default OccurrenceSelector;
