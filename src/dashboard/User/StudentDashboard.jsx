import React from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiGift,
  FiHome,
  FiInfo,
  FiMapPin,
  FiMessageCircle,
  FiPackage,
  FiPhone,
  FiStar,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { Link } from "react-router-dom";

// If you already have useAuth, uncomment this:
// import useAuth from "../../hooks/useAuth";

const StudentDashboard = () => {
  // ----------------------------------------------------------
  // AUTH USER
  // ----------------------------------------------------------
  // Later connect this with your actual useAuth() hook.
  //
  // const { user } = useAuth();

  const user = {
    name: "Omar Faruk",
    email: "omar@example.com",
    photoURL: "",
  };

  // ----------------------------------------------------------
  // TEMPORARY DASHBOARD DATA
  // ----------------------------------------------------------
  // These values should later come from your MongoDB API.

  const registration = {
    registered: true,
    status: "Confirmed",
    registrationId: "SR-2027-00125",
    batch: "SSC 2012",
    department: "Science",
    phone: "+880 1XXXXXXXXX",
    registeredAt: "12 January 2027",
  };

  const event = {
    title: "School Reunion 2027",
    date: "22 February 2027",
    day: "Friday",
    time: "10:00 AM – 5:00 PM",
    venue: "School Campus",
    location: "Your School Campus, Bangladesh",
  };

  const profile = {
    completed: 82,
  };

  const giftPackage = {
    name: "Reunion Premium Gift Package",
    items: 5,
    status: "Ready for Collection",
  };

  const announcements = [
    {
      id: 1,
      title: "Reunion registration has been confirmed",
      date: "10 February 2027",
      type: "Registration",
    },
    {
      id: 2,
      title: "Please bring your registration confirmation",
      date: "08 February 2027",
      type: "Important",
    },
    {
      id: 3,
      title: "Reunion schedule has been updated",
      date: "05 February 2027",
      type: "Schedule",
    },
  ];

  const schedule = [
    {
      time: "10:00 AM",
      title: "Registration & Welcome",
      description: "Guest registration and reunion welcome.",
    },
    {
      time: "11:00 AM",
      title: "Opening Ceremony",
      description: "Welcome speech and school memories.",
    },
    {
      time: "12:30 PM",
      title: "Lunch & Networking",
      description: "Lunch with classmates and alumni.",
    },
    {
      time: "02:30 PM",
      title: "Cultural Program",
      description: "Music, performances and memories.",
    },
    {
      time: "04:00 PM",
      title: "Gift Distribution",
      description: "Distribution of reunion gifts.",
    },
  ];

  // ----------------------------------------------------------
  // HELPERS
  // ----------------------------------------------------------

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase())
      .join("");
  };

  // ----------------------------------------------------------
  // QUICK ACTIONS
  // ----------------------------------------------------------

  const quickActions = [
    {
      title: "My Profile",
      description: "Update your personal information",
      icon: FiUser,
      link: "/dashboard/student/profile",
    },
    {
      title: "Registration",
      description: "View your reunion registration",
      icon: FiCheckCircle,
      link: "/dashboard/student/registration",
    },
    {
      title: "My Gifts",
      description: "Check your reunion gift package",
      icon: FiGift,
      link: "/dashboard/student/gifts",
    },
    {
      title: "Event Schedule",
      description: "See the complete reunion schedule",
      icon: FiCalendar,
      link: "/dashboard/student/schedule",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ======================================================
          PAGE CONTAINER
      ======================================================= */}
      <main className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
        {/* ====================================================
            WELCOME HERO
        ===================================================== */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-5 text-white shadow-xl sm:p-7 lg:p-9">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-violet-400/20 blur-3xl" />

          <div className="relative z-10 flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
            {/* User */}
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-white/15 text-xl font-bold shadow-lg backdrop-blur sm:h-20 sm:w-20 sm:text-2xl">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(user.name)
                )}
              </div>

              <div>
                <p className="mb-1 text-sm font-medium text-indigo-100">
                  Welcome back 👋
                </p>

                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {user.name}
                </h1>

                <p className="mt-1 text-sm text-indigo-100">
                  {registration.batch} • {registration.department}
                </p>
              </div>
            </div>

            {/* Event */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:p-5 lg:min-w-[340px]">
              <div className="mb-3 flex items-center gap-2">
                <FiStar className="text-amber-300" />
                <span className="text-sm font-semibold text-indigo-50">
                  School Reunion 2027
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FiCalendar />
                  <span>{event.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <FiClock />
                  <span>{event.time}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            STATS
        ===================================================== */}
        <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {/* Registration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Registration
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                  {registration.status}
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              ID: {registration.registrationId}
            </p>
          </div>

          {/* Profile */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Profile
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                  {profile.completed}%
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiUser size={20} />
              </div>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${profile.completed}%` }}
              />
            </div>
          </div>

          {/* Gift */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Gift Package
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                  {giftPackage.items} Items
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <FiGift size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-emerald-600">
              {giftPackage.status}
            </p>
          </div>

          {/* Attendance */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 sm:text-sm">
                  Attendance
                </p>

                <p className="mt-2 text-lg font-bold text-slate-900 sm:text-xl">
                  Pending
                </p>
              </div>

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiUsers size={20} />
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Check-in available on event day
            </p>
          </div>
        </section>

        {/* ====================================================
            MAIN GRID
        ===================================================== */}
        <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
          {/* ==================================================
              LEFT CONTENT
          =================================================== */}
          <div className="space-y-6">
            {/* -----------------------------------------------
                REGISTRATION CARD
            ------------------------------------------------ */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
                    My Reunion Registration
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your registration information for the reunion.
                  </p>
                </div>

                <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  {registration.status}
                </span>
              </div>

              <div className="grid gap-0 sm:grid-cols-2">
                <InfoItem icon={FiUser} label="Participant" value={user.name} />

                <InfoItem
                  icon={FiUsers}
                  label="Batch"
                  value={registration.batch}
                />

                <InfoItem
                  icon={FiStar}
                  label="Department"
                  value={registration.department}
                />

                <InfoItem
                  icon={FiPhone}
                  label="Phone"
                  value={registration.phone}
                />

                <InfoItem
                  icon={FiCheckCircle}
                  label="Registration ID"
                  value={registration.registrationId}
                />

                <InfoItem
                  icon={FiCalendar}
                  label="Registered On"
                  value={registration.registeredAt}
                />
              </div>

              <div className="flex flex-col gap-3 border-t border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-end sm:p-6">
                <Link
                  to="/dashboard/student/registration"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  View Registration
                  <FiArrowRight />
                </Link>

                <Link
                  to="/dashboard/student/profile"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
                >
                  <FiEdit3 />
                  Edit Profile
                </Link>
              </div>
            </div>

            {/* -----------------------------------------------
                EVENT INFORMATION
            ------------------------------------------------ */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FiCalendar size={20} />
                    </span>

                    <div>
                      <h2 className="text-lg font-bold text-slate-900">
                        Reunion Information
                      </h2>

                      <p className="text-sm text-slate-500">
                        Important event details
                      </p>
                    </div>
                  </div>
                </div>

                <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                  {event.day}
                </span>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <EventInfo icon={FiCalendar} title="Date" value={event.date} />

                <EventInfo icon={FiClock} title="Time" value={event.time} />

                <EventInfo icon={FiMapPin} title="Venue" value={event.venue} />
              </div>

              <div className="mt-5 rounded-xl bg-slate-50 p-4">
                <div className="flex gap-3">
                  <FiInfo className="mt-0.5 shrink-0 text-indigo-600" />

                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      Important reminder
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      Please arrive at least 30 minutes before the program
                      starts and keep your registration ID available for
                      check-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* -----------------------------------------------
                EVENT SCHEDULE
            ------------------------------------------------ */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Event Schedule
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    A quick look at reunion activities.
                  </p>
                </div>

                <Link
                  to="/dashboard/student/schedule"
                  className="hidden items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700 sm:flex"
                >
                  View all
                  <FiChevronRight />
                </Link>
              </div>

              <div className="mt-6 space-y-0">
                {schedule.map((item, index) => (
                  <div
                    key={`${item.time}-${index}`}
                    className="relative flex gap-4 pb-6 last:pb-0"
                  >
                    {/* Timeline */}
                    <div className="flex w-20 shrink-0 flex-col items-center">
                      <span className="text-xs font-bold text-indigo-600 sm:text-sm">
                        {item.time}
                      </span>

                      {index !== schedule.length - 1 && (
                        <span className="mt-2 h-full w-px bg-slate-200" />
                      )}
                    </div>

                    {/* Dot */}
                    <div className="absolute left-[79px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-indigo-600 shadow sm:left-[80px]" />

                    {/* Content */}
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3.5 sm:p-4">
                      <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                        {item.title}
                      </h3>

                      <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Link
                to="/dashboard/student/schedule"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:hidden"
              >
                View Complete Schedule
                <FiArrowRight />
              </Link>
            </div>
          </div>

          {/* ==================================================
              RIGHT SIDEBAR
          =================================================== */}
          <aside className="space-y-6">
            {/* -----------------------------------------------
                PROFILE COMPLETION
            ------------------------------------------------ */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    Profile Completion
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Complete your profile
                  </p>
                </div>

                <span className="text-lg font-bold text-indigo-600">
                  {profile.completed}%
                </span>
              </div>

              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{
                    width: `${profile.completed}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-xs leading-5 text-slate-500">
                Add your remaining information so your classmates can recognize
                you easily.
              </p>

              <Link
                to="/dashboard/student/profile"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Complete Profile
                <FiArrowRight />
              </Link>
            </div>

            {/* -----------------------------------------------
                GIFT PACKAGE
            ------------------------------------------------ */}
            <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-5 shadow-sm ring-1 ring-amber-100 sm:p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <FiGift size={22} />
              </div>

              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Your Reunion Gift
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                Your registration includes a special reunion gift package
                prepared by the reunion committee.
              </p>

              <div className="mt-4 rounded-xl bg-white/80 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-medium text-slate-600">
                    Package
                  </span>

                  <span className="text-right text-sm font-bold text-slate-900">
                    {giftPackage.name}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-slate-500">Items</span>

                  <span className="text-sm font-bold text-slate-900">
                    {giftPackage.items}
                  </span>
                </div>
              </div>

              <Link
                to="/dashboard/student/gifts"
                className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiPackage />
                View Gift Package
              </Link>
            </div>

            {/* -----------------------------------------------
                ANNOUNCEMENTS
            ------------------------------------------------ */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">Announcements</h2>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest reunion updates
                  </p>
                </div>

                <FiMessageCircle className="text-indigo-600" />
              </div>

              <div className="mt-5 space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="border-b border-slate-100 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FiInfo size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-5 text-slate-800">
                          {announcement.title}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-[11px] text-slate-400">
                            {announcement.date}
                          </span>

                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            {announcement.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </section>

        {/* ====================================================
            QUICK ACTIONS
        ===================================================== */}
        <section className="mt-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quickly access your reunion activities.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  to={action.link}
                  className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md sm:p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white">
                      <Icon size={21} />
                    </div>

                    <FiArrowRight className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
                  </div>

                  <h3 className="mt-4 font-bold text-slate-900">
                    {action.title}
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            FOOTER NOTE
        ===================================================== */}
        <section className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm">
                <FiHome />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 sm:text-base">
                  Keep the memories alive
                </h3>

                <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                  Stay connected with your school friends and alumni community.
                </p>
              </div>
            </div>

            <Link
              to="/gallery"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 shadow-sm transition hover:bg-indigo-600 hover:text-white"
            >
              <FiCamera />
              Reunion Gallery
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

// ============================================================
// REUSABLE COMPONENTS
// ============================================================

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex items-start gap-3 border-b border-slate-100 p-5 last:border-b-0 sm:p-6">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
        <Icon size={17} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-400">{label}</p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
};

const EventInfo = ({ icon: Icon, title, value }) => {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-indigo-600">
        <Icon size={17} />

        <span className="text-xs font-semibold">{title}</span>
      </div>

      <p className="mt-2 text-sm font-bold leading-5 text-slate-800">{value}</p>
    </div>
  );
};

export default StudentDashboard;
