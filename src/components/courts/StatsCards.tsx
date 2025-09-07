import React from 'react';
import { Calendar } from 'lucide-react';
import type { Court } from '@/types/court.types';

interface StatsCardsProps {
  courts: Court[];
}

const StatsCards: React.FC<StatsCardsProps> = ({ courts }) => {
  const stats = {
    total: courts.length,
    available: courts.filter(c => c.status === 'Available').length,
    booked: courts.filter(c => c.status === 'Booked').length,
    fullyBooked: courts.filter(c => c.status === 'Fully Booked').length,
    maintenance: courts.filter(c => c.status === 'Maintenance').length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
      <div className="bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20 rounded-xl p-4 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total Courts</p>
            <p className="text-2xl font-bold text-primary">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">Active facilities</p>
          </div>
          <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4 hover:shadow-lg hover:shadow-green-200/50 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Available</p>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            <p className="text-xs text-green-600 mt-1">Ready for booking</p>
          </div>
          <div className="h-10 w-10 bg-green-200 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-green-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl p-4 hover:shadow-lg hover:shadow-orange-200/50 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Booked</p>
            <p className="text-2xl font-bold text-orange-600">{stats.booked}</p>
            <p className="text-xs text-orange-600 mt-1">In use</p>
          </div>
          <div className="h-10 w-10 bg-orange-200 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-orange-600 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:shadow-lg hover:shadow-purple-200/50 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Fully Booked</p>
            <p className="text-2xl font-bold text-purple-600">{stats.fullyBooked}</p>
            <p className="text-xs text-purple-600 mt-1">At capacity</p>
          </div>
          <div className="h-10 w-10 bg-purple-200 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-purple-600 rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-4 hover:shadow-lg hover:shadow-red-200/50 transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Maintenance</p>
            <p className="text-2xl font-bold text-red-600">{stats.maintenance}</p>
            <p className="text-xs text-red-600 mt-1">Under repair</p>
          </div>
          <div className="h-10 w-10 bg-red-200 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-red-600 rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsCards;
