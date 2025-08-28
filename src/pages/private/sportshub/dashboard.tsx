const SportsHubDashboardPage = () => {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Sports Hub Dashboard</h1>
      <p className="text-muted-foreground">Welcome! Manage your hub bookings and details here.</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Today's Bookings</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Active Events</div>
          <div className="text-3xl font-bold">0</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-sm text-muted-foreground">Pending Approvals</div>
          <div className="text-3xl font-bold">0</div>
        </div>
      </div>
    </div>
  );
};

export default SportsHubDashboardPage;
