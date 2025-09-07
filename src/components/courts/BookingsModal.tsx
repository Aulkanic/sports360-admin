import React from 'react';
import ResponsiveOverlay from '@/components/responsive-overlay';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, User } from 'lucide-react';
import type { Court } from '@/types/court.types';

interface BookingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  court: Court | null;
}

const BookingsModal: React.FC<BookingsModalProps> = ({ open, onOpenChange, court }) => {
  if (!court) return null;

  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title={`${court.name} - All Bookings`}
      ariaLabel="Court Bookings"
      className="max-w-4xl w-[95vw]"
      headerClassName="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
      contentClassName="bg-gradient-to-b from-background to-primary/5"
    >
      <div className="space-y-6">
        {/* Court Info Header */}
        <div className="bg-card rounded-lg p-4 border border-primary/20 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{court.name}</h3>
              <p className="text-sm text-muted-foreground">{court.location}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Capacity: {court.capacity} people</p>
              <p className="text-sm text-muted-foreground">Rate: ₱{court.hourlyRate}/hour</p>
            </div>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-foreground">Today's Bookings ({court.bookings?.length || 0})</h4>
          
          {court.bookings && court.bookings.length > 0 ? (
            <div className="space-y-3">
              {court.bookings.map((booking) => (
                <div key={booking.id} className="bg-card rounded-lg border border-primary/10 p-4 hover:shadow-md hover:border-primary/20 transition-all duration-200">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="font-medium text-foreground mb-1">{booking.title}</h5>
                      <p className="text-sm text-muted-foreground mb-2">{booking.description}</p>
                    </div>
                    <Badge 
                      className={`${
                        booking.status === "In-Progress" 
                          ? "bg-green-100 text-green-800 border-green-200"
                          : booking.status === "Approved"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : booking.status === "Pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-muted text-muted-foreground border-border"
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium text-foreground">{booking.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Time:</span>
                        <span className="font-medium text-foreground">{booking.startTime} - {booking.endTime}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Participants:</span>
                        <span className="font-medium text-foreground">{booking.participants}/{booking.maxParticipants}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Organizer:</span>
                        <span className="font-medium text-foreground">{booking.organizer.name}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-border">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Type:</span>
                      <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                        {booking.type}
                      </Badge>
                      <span className="text-muted-foreground ml-4">Contact:</span>
                      <span className="text-primary">{booking.organizer.email}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No bookings found</h3>
              <p className="text-muted-foreground">This court has no bookings for today.</p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveOverlay>
  );
};

export default BookingsModal;
