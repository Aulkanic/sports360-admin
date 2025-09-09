import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ResponsiveOverlay from "@/components/responsive-overlay";
import { Calendar, Plus, Search, Trash2 } from "lucide-react";

// Import components
import { 
  StatsCards, 
  CourtCard, 
  CourtForm, 
  BookingsModal, 
  ConflictsModal, 
  AnalyticsModal,
  StatsCardsSkeleton,
  CourtsGridSkeleton
} from "@/components/courts";

// Import hooks
import { 
  useCourts, 
  useConflicts, 
  useAnalytics, 
  useCourtForm, 
  useCourtModals, 
  useCourtSearch 
} from "@/hooks";

const CourtsPage: React.FC = () => {
  // Custom hooks for business logic
  const { items, apiCourts, isLoading, createCourt, updateCourt, deleteCourt } = useCourts();
  const { conflicts, resolveConflict } = useConflicts();
  const { analytics } = useAnalytics(apiCourts);
  const { form, setForm, editing, open, openCreate, openEdit, closeForm } = useCourtForm();
  const { 
    selectedCourt, 
    showBookingsModal, 
    showConflictsModal, 
    showAnalyticsModal, 
    confirmId,
    openBookingsModal, 
    closeBookingsModal, 
    openConflictsModal, 
    closeConflictsModal, 
    openAnalyticsModal, 
    closeAnalyticsModal, 
    openDeleteConfirm, 
    closeDeleteConfirm 
  } = useCourtModals();
  const { query, setQuery, filteredCourts, clearSearch } = useCourtSearch(items);

  // Event handlers
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = editing 
      ? await updateCourt(editing.id, form)
      : await createCourt(form);
    
    if (success) {
      closeForm();
    }
  };

  const handleDelete = async () => {
    if (confirmId) {
      const success = await deleteCourt(confirmId);
      if (success) {
        closeDeleteConfirm();
      }
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string, notes?: string) => {
    await resolveConflict(conflictId, resolution, notes);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-foreground">Court Management</h1>
          <p className="text-muted-foreground">Manage and monitor your sports courts with advanced analytics</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10 h-11 border-primary/20 focus:border-primary/50 focus:ring-primary/20"
              placeholder="Search courts, status, location..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Button
            onClick={openAnalyticsModal}
            variant="outline"
            className="h-11 px-4 border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Analytics
          </Button>
          <Button
            onClick={openConflictsModal}
            variant="outline"
            className={`h-11 px-4 border-orange-200 hover:bg-orange-50 hover:border-orange-300 text-orange-600 hover:text-orange-700 ${conflicts.length > 0 ? 'animate-pulse' : ''}`}
          >
            <Calendar className="mr-2 h-4 w-4" />
            Conflicts ({conflicts.length})
          </Button>
          <Button 
            onClick={openCreate} 
            className="h-11 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200 hover:scale-105"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Court
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <StatsCardsSkeleton />
      ) : (
        <StatsCards courts={items} />
      )}

      {/* Fully Booked Courts Alert */}
      {!isLoading && items.filter(c => c.status === 'Fully Booked').length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 shadow-lg shadow-purple-200/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-purple-900">Fully Booked Courts</h3>
              <p className="text-sm text-purple-700">These courts have reached maximum capacity for today</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.filter(c => c.status === 'Fully Booked').map((court) => (
              <div key={court.id} className="bg-white rounded-lg p-4 border border-purple-200 hover:shadow-md hover:border-purple-300 transition-all duration-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-purple-900">{court.name}</h4>
                  <span className="bg-purple-100 text-purple-800 border-purple-200 shadow-sm px-2 py-1 rounded text-xs font-medium">
                    {court.bookings?.length || 0} bookings
                  </span>
                </div>
                <div className="space-y-2">
                  {court.bookings?.slice(0, 2).map((booking) => (
                    <div key={booking.id} className="text-sm">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-gray-900 truncate">{booking.title}</span>
                        <span className="text-xs text-gray-500">{booking.startTime} - {booking.endTime}</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {booking.participants}/{booking.maxParticipants} participants • {booking.organizer.name}
                      </div>
                    </div>
                  ))}
                  {court.bookings && court.bookings.length > 2 && (
                    <div className="text-xs text-purple-600 font-medium">
                      +{court.bookings.length - 2} more booking{court.bookings.length - 2 > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courts Grid */}
      {isLoading ? (
        <CourtsGridSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourts.map((court) => (
            <CourtCard
              key={court.id}
              court={court}
              onEdit={openEdit}
              onDelete={openDeleteConfirm}
              onViewBookings={openBookingsModal}
            />
          ))}
        </div>
      )}
      
      {/* Enhanced Empty State */}
      {!isLoading && filteredCourts.length === 0 && (
        <div className="text-center py-16">
          <div className="relative">
            <div className="h-20 w-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-primary" />
            </div>
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-primary/20 rounded-full animate-pulse"></div>
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No courts found</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            {query ? "Try adjusting your search criteria or clear the search to see all courts" : "Get started by adding your first court to begin managing your sports facilities"}
          </p>
          {!query && (
            <Button 
              onClick={openCreate} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Court
            </Button>
          )}
          {query && (
            <Button 
              onClick={clearSearch} 
              variant="outline" 
              className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 text-primary hover:text-primary"
            >
              Clear Search
            </Button>
          )}
        </div>
      )}

      {/* Court Form Modal */}
      <ResponsiveOverlay
        open={open}
        onOpenChange={closeForm}
        title={`${editing ? "Edit" : "Add"} Court`}
        ariaLabel="Court Form"
        className="max-w-4xl w-[95vw]"
        headerClassName="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20"
        contentClassName="bg-gradient-to-b from-background to-primary/5"
        footer={
          <div className="flex items-center justify-between bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <div className="text-sm text-muted-foreground">
              {editing ? "Update court information" : "Fill in the details to add a new court"}
            </div>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                className="h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                form="court-form" 
                className="h-10 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/25 transition-all duration-200" 
                disabled={isLoading}
                onClick={handleSave}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {editing ? "Updating..." : "Adding..."}
                  </>
                ) : (
                  editing ? "Update Court" : "Add Court"
                )}
              </Button>
            </div>
          </div>
        }
      >
        <CourtForm form={form} setForm={setForm} editing={!!editing} isLoading={isLoading} />
      </ResponsiveOverlay>

      {/* Delete Confirmation Modal */}
      {confirmId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-xl border border-destructive/20 shadow-lg shadow-destructive/10 w-full max-w-md p-6 space-y-4 animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-destructive/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Delete Court</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this court? All associated bookings and data will be permanently removed.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                variant="outline" 
                onClick={closeDeleteConfirm}
                className="h-10 border-primary/20 hover:bg-primary/10 hover:border-primary/30"
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDelete}
                className="h-10 bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg hover:shadow-destructive/25"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Court
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <BookingsModal
        open={showBookingsModal}
        onOpenChange={closeBookingsModal}
        court={selectedCourt}
      />

      <ConflictsModal
        open={showConflictsModal}
        onOpenChange={closeConflictsModal}
        conflicts={conflicts}
        onResolveConflict={handleResolveConflict}
      />

      <AnalyticsModal
        open={showAnalyticsModal}
        onOpenChange={closeAnalyticsModal}
        analytics={analytics}
      />
    </div>
  );
};

export default CourtsPage;