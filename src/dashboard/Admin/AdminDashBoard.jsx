const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin Dashboard</h1>

        <p className="mt-1 text-sm text-base-content/60">
          Manage your school reunion platform from here.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Total Users</p>
          <h2 className="mt-2 text-3xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Active Users</p>
          <h2 className="mt-2 text-3xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Total Events</p>
          <h2 className="mt-2 text-3xl font-bold">0</h2>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <p className="text-sm text-base-content/60">Sponsors</p>
          <h2 className="mt-2 text-3xl font-bold">0</h2>
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold">Welcome to Admin Panel</h2>

        <p className="mt-2 text-sm leading-6 text-base-content/60">
          From this dashboard you will be able to manage users, students,
          alumni, reunion events, registrations, attendance, sponsors,
          announcements, gallery, gifts and other reunion activities.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
