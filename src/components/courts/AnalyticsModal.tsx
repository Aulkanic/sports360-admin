import React from 'react';
import ResponsiveOverlay from '@/components/responsive-overlay';

interface AnalyticsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analytics: any;
}

const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ open, onOpenChange, analytics }) => {
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Court Analytics"
      ariaLabel="Court Analytics"
      className="max-w-4xl w-[95vw]"
    >
      <div className="space-y-4">
        {analytics ? (
          <div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">{analytics.summary.totalCourts}</div>
                <div className="text-sm text-blue-600">Total Courts</div>
              </div>
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                <div className="text-2xl font-bold text-green-600">${analytics.summary.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-green-600">Total Revenue</div>
              </div>
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                <div className="text-2xl font-bold text-purple-600">{analytics.summary.totalBookings}</div>
                <div className="text-sm text-purple-600">Total Bookings</div>
              </div>
              <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">{analytics.summary.averageUtilization}%</div>
                <div className="text-sm text-orange-600">Avg Utilization</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium text-foreground">Court Performance</h4>
              {analytics.courts.map((court: any) => (
                <div key={court.id} className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border">
                  <span className="font-medium text-foreground">{court.courtName}</span>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{court._count?.bookings || 0} bookings</span>
                    <span>{court._count?.conflicts || 0} conflicts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="h-16 w-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="h-8 w-8 bg-muted rounded-full"></div>
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No analytics data available</h3>
            <p className="text-muted-foreground">Analytics data will appear here once courts are created and bookings are made.</p>
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  );
};

export default AnalyticsModal;
