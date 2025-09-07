import React from 'react';
import ResponsiveOverlay from '@/components/responsive-overlay';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { BookingConflict } from '@/services/court.service';

interface ConflictsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: BookingConflict[];
  onResolveConflict: (conflictId: string, resolution: string, notes?: string) => void;
}

const ConflictsModal: React.FC<ConflictsModalProps> = ({ 
  open, 
  onOpenChange, 
  conflicts, 
  onResolveConflict 
}) => {
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Booking Conflicts"
      ariaLabel="Booking Conflicts"
      className="max-w-4xl w-[95vw]"
    >
      <div className="space-y-4">
        {conflicts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="h-8 w-8 bg-green-500 rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No pending conflicts</h3>
            <p className="text-muted-foreground">All bookings are properly scheduled without conflicts.</p>
          </div>
        ) : (
          conflicts.map((conflict) => (
            <div key={conflict.id} className="border border-orange-200 rounded-lg p-4 bg-orange-50/50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium text-foreground">{conflict.court?.courtName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {conflict.conflictDate} {conflict.conflictStart} - {conflict.conflictEnd}
                  </p>
                </div>
                <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                  {conflict.resolutionStatus}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="text-sm">
                  <span className="font-medium">Booking 1:</span> {conflict.booking1?.user.firstName} {conflict.booking1?.user.lastName}
                </div>
                <div className="text-sm">
                  <span className="font-medium">Booking 2:</span> {conflict.booking2?.user.firstName} {conflict.booking2?.user.lastName}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => onResolveConflict(conflict.id, 'resolved', 'Resolved by admin')}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Resolve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onResolveConflict(conflict.id, 'overridden', 'Overridden by admin')}
                  className="border-orange-200 text-orange-700 hover:bg-orange-50"
                >
                  Override
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </ResponsiveOverlay>
  );
};

export default ConflictsModal;
