import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Court } from '@/types/court.types';
import { CalendarDays, Clock, DollarSign, Edit3, MapPin, Trash2, Users } from 'lucide-react';
import React from 'react';

interface CourtCardProps {
  court: Court;
  onEdit: (court: Court) => void;
  onDelete: (courtId: string) => void;
  onViewBookings: (court: Court) => void;
}

const CourtCard: React.FC<CourtCardProps> = ({ court, onEdit, onDelete, onViewBookings }) => {
  const getImagePreview = (image: string | File): string => {
    if (typeof image === 'string') {
      return image;
    } else {
      return URL.createObjectURL(image);
    }
  };

  return (
    <div className="group bg-card border border-primary/10 rounded-xl shadow-sm hover:shadow-xl hover:shadow-primary/20 transition-all duration-300 overflow-hidden hover:scale-[1.03] hover:border-primary/30">
      {/* Enhanced Image Section */}
      <div className="relative h-48 bg-gradient-to-br from-primary/20 to-accent/20 overflow-hidden">
          <img
            src={court.images && court.images[0] ? getImagePreview(court.images[0]) : '/logo.png'}
            alt={court.name}
            className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        
        {/* Image Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Enhanced Status Badge */}
        <div className="absolute top-3 right-3">
          <Badge
            className={`px-3 py-1 text-xs font-medium shadow-sm ${
              court.status === "Available"
                ? "bg-green-100 text-green-800 border-green-200 shadow-green-200/50"
                : court.status === "Booked"
                ? "bg-orange-100 text-orange-800 border-orange-200 shadow-orange-200/50"
                : court.status === "Fully Booked"
                ? "bg-purple-100 text-purple-800 border-purple-200 shadow-purple-200/50"
                : "bg-red-100 text-red-800 border-red-200 shadow-red-200/50"
            }`}
          >
            {court.status}
          </Badge>
        </div>
        
        {/* Enhanced Court Type Badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="secondary" className="px-3 py-1 text-xs !text-black font-medium bg-white/90 backdrop-blur-sm border-white/20 shadow-sm">
            Court
          </Badge>
        </div>
      </div>
      
      {/* Enhanced Content Section */}
      <div className="p-5 space-y-4 bg-gradient-to-b from-background to-background/95">
        {/* Header */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {court.name}
          </h3>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="h-3 w-3" />
            <span>{court.location}</span>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {typeof court.capacity === "number" && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Capacity:</span>
              <span className="font-medium">{court.capacity}</span>
            </div>
          )}
          {typeof court.hourlyRate === "number" && (
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Rate:</span>
              <span className="font-medium">₱{court.hourlyRate}/hr</span>
            </div>
          )}
          {court.openingHours && (
            <div className="flex items-center gap-2 col-span-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Hours:</span>
              <span className="font-medium">{court.openingHours}</span>
            </div>
          )}
          {typeof court.minHours === "number" && (
            <div className="flex items-center gap-2 col-span-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Min Booking:</span>
              <span className="font-medium">{court.minHours}h</span>
            </div>
          )}
        </div>
        
        {/* Availability Section */}
        {court.availability && Object.keys(court.availability).length > 0 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Availability</p>
              <Badge variant="outline" className="text-xs">
                {Object.values(court.availability).filter((day: any) => day.available).length}/7 days
              </Badge>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {Object.entries(court.availability).map(([day, dayAvailability]: [string, any]) => (
                <div key={day} className="text-center">
                  <div className={`text-xs font-medium mb-1 ${
                    dayAvailability.available ? 'text-green-600' : 'text-muted-foreground'
                  }`}>
                    {day.slice(0, 3).toUpperCase()}
                  </div>
                  <div className={`w-full h-2 rounded-sm ${
                    dayAvailability.available ? 'bg-green-500' : 'bg-muted'
                  }`} />
                  {dayAvailability.available && dayAvailability.timeSlots && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {dayAvailability.timeSlots.length} slot{dayAvailability.timeSlots.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              ))}
            </div>
         
          </div>
        )}
        
        {/* Bookings Section */}
        {court.bookings && court.bookings.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-border/50">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Today's Bookings</p>
              <Badge variant="outline" className="text-xs">
                {court.bookings.length} booking{court.bookings.length > 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {court.bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="bg-muted/30 rounded-lg p-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground truncate">{booking.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        booking.status === "In-Progress" 
                          ? "border-green-200 text-green-700 bg-green-50"
                          : booking.status === "Approved"
                          ? "border-blue-200 text-blue-700 bg-blue-50"
                          : "border-gray-200 text-gray-700 bg-gray-50"
                      }`}
                    >
                      {booking.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{booking.startTime} - {booking.endTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{booking.participants}/{booking.maxParticipants} participants</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => onEdit(court)}
            className="flex-1 h-9 border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary hover:scale-105 transition-all duration-200"
          >
            <Edit3 className="h-3 w-3 mr-1" />
            Edit
          </Button>
          {court.bookings && court.bookings.length > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onViewBookings(court)}
              className="h-9 px-3 border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-600 hover:text-blue-700 hover:scale-105 transition-all duration-200"
            >
              <CalendarDays className="h-3 w-3" />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(court.id)}
            className="h-9 px-3 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20 hover:scale-105 transition-all duration-200"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CourtCard;
