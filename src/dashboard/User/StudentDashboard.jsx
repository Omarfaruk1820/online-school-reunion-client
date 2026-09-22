import { useEffect, useMemo } from "react";
import {
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiEdit3,
  FiGift,
  FiHome,
  FiInfo,
  FiLoader,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiStar,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import axiosSecure from "../../hooks/axiosSecure";

/* =========================================================
   API
========================================================= */

const API_REGISTRATIONS_URL = "/api/registrations";

/* =========================================================
   HELPERS
========================================================= */

const formatStudentType = (value) => {
  if (value === "alumni") return "Alumni";
  if (value === "current") return "Current Student";

  return "—";
};

const formatDepartment = (value) => {
  if (!value) return "—";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatStatus = (value) => {
  if (!value) return "—";

  return String(value)
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatEventDate = (value) => {
  if (!value) return "—";

  const rawValue = String(value);

  const date = /^\d{4}-\d{2}-\d{2}$/.test(rawValue)
    ? new Date(`${rawValue}T00:00:00`)
    : new Date(rawValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (value) => {
  if (!value) return "—";

  const [hourString, minuteString] = String(value).split(":");

  const hour = Number(hourString);
  const minute = Number(minuteString);

  if (
    Number.isNaN(hour) ||
    Number.isNaN(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return String(value);
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const getInitials = (name) => {
  if (!name) return "SR";

  const parts = String(name).trim().split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const formatVenue = (venue) => {
  if (!venue) {
    return "School Campus";
  }

  if (typeof venue === "string") {
    return venue;
  }

  return (
    [venue.name, venue.address, venue.city, venue.country]
      .filter(Boolean)
      .join(", ") || "School Campus"
  );
};

const getAttendanceLabel = (status) => {
  if (status === "checked-in") {
    return "Checked In";
  }

  if (status === "not-checked-in") {
    return "Pending";
  }

  return formatStatus(status);
};

const getAttendanceColor = (status) => {
  if (status === "checked-in") {
    return "emerald";
  }

  if (status === "not-checked-in") {
    return "amber";
  }

  return "slate";
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "—"}
        </p>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const normalized = String(status || "").toLowerCase();

  let classes = "bg-slate-100 text-slate-600";
  let Icon = FiInfo;

  if (
    normalized === "confirmed" ||
    normalized === "checked-in" ||
    normalized === "active" ||
    normalized === "not-required"
  ) {
    classes = "bg-emerald-50 text-emerald-700";
    Icon = FiCheckCircle;
  }

  if (
    normalized === "pending" ||
    normalized === "pending-payment" ||
    normalized === "not-checked-in"
  ) {
    classes = "bg-amber-50 text-amber-700";
    Icon = FiClock;
  }

  if (
    normalized === "cancelled" ||
    normalized === "canceled" ||
    normalized === "rejected"
  ) {
    classes = "bg-red-50 text-red-700";
    Icon = FiXCircle;
  }

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {formatStatus(status)}
    </span>
  );
};

const QuickAction = ({ to, icon: Icon, title, description }) => {
  return (
    <Link
      to={to}
      className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>

        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
      </div>

      <FiChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-600" />
    </Link>
  );
};

/* =========================================================
   LOADING COMPONENT
========================================================= */

const DashboardLoading = () => {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
      <div className="flex flex-col items-center gap-3">
        <FiLoader className="h-8 w-8 animate-spin text-slate-700" />

        <p className="text-sm font-medium text-slate-500">
          Loading your dashboard...
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const StudentDashboard = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  /* =======================================================
     AUTH REDIRECT
  ======================================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      toast.error("Please login to access your dashboard.");

      navigate("/login", {
        replace: true,
        state: {
          from: "/dashboard/student",
        },
      });
    }
  }, [authLoading, user, navigate]);

  /* =======================================================
     MY REGISTRATION
  ======================================================= */

  const {
    data: registrationResponse,
    isLoading: registrationLoading,
    isError: registrationError,
    error: registrationQueryError,
    refetch: refetchRegistration,
  } = useQuery({
    queryKey: ["my-reunion-registration", user?.uid],

    queryFn: async () => {
      const response = await axiosSecure.get(
        `${API_REGISTRATIONS_URL}/my-registration`,
      );

      return response.data;
    },

    enabled: !authLoading && Boolean(user),

    retry: false,

    staleTime: 30 * 1000,
  });

  /* =======================================================
     EVENT
  ======================================================= */

  const {
    data: eventResponse,
    isLoading: eventLoading,
    isError: eventError,
    error: eventQueryError,
    refetch: refetchEvent,
  } = useQuery({
    queryKey: ["reunion-registration-event"],

    queryFn: async () => {
      const response = await axiosSecure.get(API_REGISTRATIONS_URL);

      return response.data;
    },

    enabled: !authLoading && Boolean(user),

    retry: 1,

    staleTime: 60 * 1000,
  });

  /* =======================================================
     API DATA
  ======================================================= */

  const registration = registrationResponse?.data || null;

  const event = registrationResponse?.event || eventResponse?.data || null;

  const giftPackage = registrationResponse?.giftPackage || null;

  const registrationNotFound =
    registrationError && registrationQueryError?.response?.status === 404;

  /* =======================================================
     EVENT LOADING / ERROR
  ======================================================= */

  const eventRequestFailed =
    eventError && eventQueryError?.response?.status !== 404;

  /* =======================================================
     DERIVED DATA
  ======================================================= */

  const participant = registration?.participant || {};

  const schoolInfo = registration?.schoolInfo || {};

  const reunionInfo = registration?.reunion || {};

  const attendance = registration?.attendance || {};

  const qrCode = registration?.qrCode || {};

  const displayName = participant.name || user?.displayName || "Student";

  const email = participant.email || user?.email || "—";

  const photoURL = user?.photoURL || "";

  const eventTitle =
    event?.title || reunionInfo.eventTitle || "Grand School Reunion 2027";

  const eventDate = event?.eventDate || reunionInfo.eventDate || null;

  const eventWeekday = event?.weekday || reunionInfo.weekday || null;

  const eventStartTime = event?.startTime || reunionInfo.startTime || "09:00";

  const eventEndTime = event?.endTime || reunionInfo.endTime || "17:00";

  const eventVenue = formatVenue(event?.venue || reunionInfo.venue);

  /* =======================================================
     PROFILE COMPLETION
  ======================================================= */

  const profileCompletion = useMemo(() => {
    if (!registration) {
      return 0;
    }

    const requiresDepartment = ["9", "10"].includes(
      String(schoolInfo.classLevel || ""),
    );

    const fields = [
      participant.name,
      participant.email,
      participant.phone,
      participant.district,
      participant.city,
      schoolInfo.studentType,
      schoolInfo.classLevel,
      schoolInfo.batchYear,
      requiresDepartment ? schoolInfo.department : true,
    ];

    const completed = fields.filter(
      (value) => value !== null && value !== undefined && value !== "",
    ).length;

    return Math.round((completed / fields.length) * 100);
  }, [
    registration,
    participant.name,
    participant.email,
    participant.phone,
    participant.district,
    participant.city,
    schoolInfo.studentType,
    schoolInfo.classLevel,
    schoolInfo.batchYear,
    schoolInfo.department,
  ]);

  /* =======================================================
     GIFT ITEMS
  ======================================================= */

  const giftItems = useMemo(() => {
    if (Array.isArray(giftPackage?.items) && giftPackage.items.length > 0) {
      return giftPackage.items;
    }

    if (Array.isArray(giftPackage?.gifts) && giftPackage.gifts.length > 0) {
      return giftPackage.gifts;
    }

    if (Array.isArray(event?.gifts?.items) && event.gifts.items.length > 0) {
      return event.gifts.items;
    }

    return [];
  }, [giftPackage, event]);

  /* =======================================================
     SCHEDULE
  ======================================================= */

  const scheduleItems = Array.isArray(event?.schedule) ? event.schedule : [];

  /* =======================================================
     AUTH LOADING
  ======================================================= */

  if (authLoading) {
    return <DashboardLoading />;
  }

  /* =======================================================
     NOT AUTHENTICATED
  ======================================================= */

  if (!user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <FiLoader className="mx-auto h-7 w-7 animate-spin text-slate-700" />

          <p className="mt-3 text-sm text-slate-500">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     REGISTRATION LOADING
  ======================================================= */

  if (registrationLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 w-64 rounded-lg bg-slate-200" />

            <div className="mt-3 h-4 w-96 max-w-full rounded bg-slate-200" />

            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="h-64 rounded-3xl bg-slate-200 lg:col-span-2" />

              <div className="h-64 rounded-3xl bg-slate-200" />
            </div>

            <div className="mt-6 h-72 rounded-3xl bg-slate-200" />
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     REGISTRATION NOT FOUND
  ======================================================= */

  if (registrationNotFound || !registration) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 bg-slate-900 px-6 py-10 text-white sm:px-10">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                <FiCalendar className="h-7 w-7" />
              </div>

              <p className="mt-6 text-sm font-semibold text-slate-300">
                Student Dashboard
              </p>

              <h1 className="mt-2 text-2xl font-black sm:text-3xl">
                Welcome, {displayName}
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">
                Your account is ready, but we could not find a reunion
                registration associated with this account.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <FiInfo className="h-5 w-5" />
                  </div>

                  <div>
                    <h2 className="font-bold text-amber-900">
                      You are not registered yet
                    </h2>

                    <p className="mt-1 text-sm leading-6 text-amber-800">
                      Register for the reunion to receive your participant
                      information, gift package and attendance status here.
                    </p>
                  </div>
                </div>
              </div>

              {event && (
                <div className="mt-6 grid gap-5 sm:grid-cols-2">
                  <InfoItem
                    icon={FiCalendar}
                    label="Event"
                    value={eventTitle}
                  />

                  <InfoItem
                    icon={FiClock}
                    label="Date & Time"
                    value={`${formatEventDate(eventDate)} • ${formatTime(
                      eventStartTime,
                    )} – ${formatTime(eventEndTime)}`}
                  />

                  <InfoItem icon={FiMapPin} label="Venue" value={eventVenue} />

                  <InfoItem
                    icon={FiUsers}
                    label="Edition"
                    value={event?.edition || "76 Years Celebration"}
                  />
                </div>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/reunion-register"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Register for Reunion
                  <FiArrowRight className="h-4 w-4" />
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    refetchRegistration();
                    refetchEvent();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Check Again
                </button>
              </div>

              {eventRequestFailed && (
                <p className="mt-5 text-xs text-slate-400">
                  Event information could not be loaded at this time.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     REGISTRATION API ERROR
  ======================================================= */

  if (registrationError && !registrationNotFound) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FiXCircle className="h-7 w-7" />
            </div>

            <h1 className="mt-5 text-xl font-black text-slate-900">
              Unable to load your dashboard
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              Something went wrong while loading your reunion registration.
              Please try again.
            </p>

            <button
              type="button"
              onClick={() => refetchRegistration()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Try Again
              <FiArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     DASHBOARD DATA
  ======================================================= */

  const attendanceStatus = attendance.status || "not-checked-in";

  const attendanceColor = getAttendanceColor(attendanceStatus);

  const paymentStatus = registration.paymentStatus || "not-required";

  const registrationStatus = registration.status || "confirmed";

  /* =======================================================
     MAIN DASHBOARD
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName}
                  className="h-14 w-14 shrink-0 rounded-2xl object-cover ring-4 ring-slate-100"
                />
              ) : (
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-base font-black text-white ring-4 ring-slate-100">
                  {getInitials(displayName)}
                </div>
              )}

              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                  Student Dashboard
                </p>

                <h1 className="mt-1 truncate text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                  Welcome, {displayName}
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Manage your reunion registration and participant information.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={registrationStatus} />

              <Link
                to="/dashboard/student/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <FiEdit3 className="h-4 w-4" />
                Edit Profile
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        {/* =================================================
            EVENT HERO
        ================================================= */}

        <section className="overflow-hidden rounded-3xl bg-slate-900 shadow-xl">
          <div className="relative">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/5 blur-2xl" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

            <div className="relative grid gap-8 p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:p-10">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200">
                  <FiStar className="h-3.5 w-3.5" />

                  {event?.edition || "76 Years Celebration"}
                </div>

                <h2 className="mt-5 max-w-3xl break-words text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {eventTitle}
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Your reunion registration is confirmed. Keep your registration
                  ID safe and bring your attendance QR code on reunion day.
                </p>

                <div className="mt-7 flex flex-wrap gap-3">
                  <div className="min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Registration ID
                    </p>

                    <p className="mt-1 break-all font-mono text-sm font-bold text-white">
                      {registration.registrationId || "—"}
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Status
                    </p>

                    <p className="mt-1 text-sm font-bold text-emerald-300">
                      {formatStatus(registrationStatus)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-end lg:justify-end">
                <div className="w-full rounded-2xl border border-white/10 bg-white/5 p-5 lg:w-72">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <FiCalendar className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400">
                        Reunion Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {formatEventDate(eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <FiClock className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400">
                        Event Time
                      </p>

                      <p className="mt-1 text-sm font-bold text-white">
                        {eventWeekday ? `${eventWeekday}, ` : ""}
                        {formatTime(eventStartTime)} –{" "}
                        {formatTime(eventEndTime)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white">
                      <FiMapPin className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-400">
                        Venue
                      </p>

                      <p className="mt-1 break-words text-sm font-bold text-white">
                        {eventVenue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            STATUS CARDS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Registration */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle className="h-5 w-5" />
              </div>

              <StatusBadge status={registrationStatus} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Registration
            </p>

            <p className="mt-1 text-xl font-black text-slate-900">
              {formatStatus(registrationStatus)}
            </p>
          </div>

          {/* Attendance */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                  attendanceColor === "emerald"
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                <FiShield className="h-5 w-5" />
              </div>

              <StatusBadge status={attendanceStatus} />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Attendance
            </p>

            <p className="mt-1 text-xl font-black text-slate-900">
              {getAttendanceLabel(attendanceStatus)}
            </p>
          </div>

          {/* Gift */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiGift className="h-5 w-5" />
              </div>

              <span className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">
                Included
              </span>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Gift Package
            </p>

            <p className="mt-1 truncate text-xl font-black text-slate-900">
              {reunionInfo.packageName ||
                giftPackage?.name ||
                "General Reunion Package"}
            </p>
          </div>

          {/* Profile */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiUser className="h-5 w-5" />
              </div>

              <span className="text-sm font-black text-slate-900">
                {profileCompletion}%
              </span>
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-slate-400">
              Profile
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-slate-900 transition-all"
                style={{
                  width: `${profileCompletion}%`,
                }}
              />
            </div>

            <p className="mt-2 text-xs text-slate-500">
              Registration information completed
            </p>
          </div>
        </section>

        {/* =================================================
            PARTICIPANT + REGISTRATION
        ================================================= */}

        <section className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
          {/* Participant Information */}

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Participant
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Registration Information
                </h3>
              </div>

              <Link
                to="/dashboard/student/profile"
                className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:self-auto"
              >
                <FiEdit3 className="h-4 w-4" />
                Edit
              </Link>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-2">
              <InfoItem
                icon={FiUser}
                label="Full Name"
                value={participant.name}
              />

              <InfoItem
                icon={FiUsers}
                label="Student Type"
                value={formatStudentType(schoolInfo.studentType)}
              />

              <InfoItem
                icon={FiUser}
                label="Class"
                value={
                  schoolInfo.classLevel ? `Class ${schoolInfo.classLevel}` : "—"
                }
              />

              <InfoItem
                icon={FiCalendar}
                label="Batch Year"
                value={
                  schoolInfo.batchYear ? `SSC ${schoolInfo.batchYear}` : "—"
                }
              />

              <InfoItem
                icon={FiStar}
                label="Department"
                value={formatDepartment(schoolInfo.department)}
              />

              <InfoItem
                icon={FiPhone}
                label="Phone"
                value={participant.phone}
              />

              <InfoItem
                icon={FiMapPin}
                label="District"
                value={participant.district}
              />

              <InfoItem icon={FiHome} label="City" value={participant.city} />

              <div className="sm:col-span-2">
                <InfoItem icon={FiUser} label="Email" value={email} />
              </div>
            </div>
          </div>

          {/* Registration Summary */}

          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reunion
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Registration Summary
              </h3>
            </div>

            <div className="space-y-5 p-6">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Registration ID
                </p>

                <p className="mt-2 break-all font-mono text-sm font-black text-slate-900">
                  {registration.registrationId || "—"}
                </p>
              </div>

              <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div className="min-w-0">
                  <p className="text-xs text-slate-400">Registered On</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatDateTime(registration.createdAt)}
                  </p>
                </div>

                <FiCalendar className="h-5 w-5 shrink-0 text-slate-300" />
              </div>

              <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs text-slate-400">Payment</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {formatStatus(paymentStatus)}
                  </p>
                </div>

                <StatusBadge status={paymentStatus} />
              </div>

              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">T-Shirt Size</p>

                  <p className="mt-1 text-sm font-bold text-slate-800">
                    {reunionInfo.tShirt?.size || "—"}
                  </p>
                </div>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-700">
                  {reunionInfo.tShirt?.size || "—"}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            GIFT PACKAGE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Reunion Benefits
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Your Gift Package
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                {reunionInfo.packageName ||
                  giftPackage?.name ||
                  "General Reunion Package"}
              </p>
            </div>

            <Link
              to="/dashboard/student/gifts"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
            >
              View Gift Details
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6">
            {giftItems.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {giftItems.map((item, index) => {
                  const itemName =
                    typeof item === "string"
                      ? item
                      : item?.name || item?.title || "Gift Item";

                  return (
                    <div
                      key={`gift-${index}-${itemName}`}
                      className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-violet-600 shadow-sm">
                        <FiPackage className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="break-words text-sm font-bold text-slate-800">
                          {itemName}
                        </p>

                        <p className="mt-0.5 text-xs text-emerald-600">
                          Included
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-center">
                <FiGift className="mx-auto h-7 w-7 text-slate-300" />

                <p className="mt-3 text-sm font-bold text-slate-700">
                  Gift package information
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Your gift package details will appear here.
                </p>
              </div>
            )}

            {reunionInfo.tShirt?.size && (
              <div className="mt-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <FiPackage className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Official Reunion T-Shirt
                    </p>

                    <p className="mt-1 text-sm font-black text-slate-800">
                      Size {reunionInfo.tShirt.size}
                    </p>
                  </div>
                </div>

                <span className="self-start rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 sm:self-auto">
                  Selected
                </span>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            ATTENDANCE + EVENT
        ================================================= */}

        <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.4fr]">
          {/* QR */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Attendance
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Attendance QR
                </h3>
              </div>

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <FiShield className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm">
                  {qrCode.enabled !== false && qrCode.status === "active" ? (
                    <FiCheckCircle className="h-7 w-7 text-emerald-600" />
                  ) : (
                    <FiXCircle className="h-7 w-7 text-slate-400" />
                  )}
                </div>

                <div>
                  <p className="text-sm font-black text-slate-900">
                    {qrCode.enabled !== false && qrCode.status === "active"
                      ? "QR Code Ready"
                      : "QR Code Unavailable"}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your attendance QR is securely generated for reunion
                    check-in.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-slate-900 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-400">Current Attendance</p>

                  <p className="mt-1 text-lg font-black">
                    {getAttendanceLabel(attendanceStatus)}
                  </p>
                </div>

                <FiShield className="h-6 w-6 shrink-0 text-slate-400" />
              </div>
            </div>

            <p className="mt-4 text-xs leading-5 text-slate-400">
              For security, the QR token itself is not displayed in your
              dashboard.
            </p>
          </div>

          {/* Event Information */}

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Event Information
                </p>

                <h3 className="mt-1 text-xl font-black text-slate-900">
                  Reunion Day
                </h3>
              </div>

              <FiCalendar className="h-6 w-6 shrink-0 text-slate-300" />
            </div>

            {eventLoading ? (
              <div className="mt-6 flex items-center gap-3 rounded-2xl bg-slate-50 p-5">
                <FiLoader className="h-5 w-5 animate-spin text-slate-500" />

                <p className="text-sm text-slate-500">
                  Loading event information...
                </p>
              </div>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <InfoItem
                  icon={FiCalendar}
                  label="Date"
                  value={formatEventDate(eventDate)}
                />

                <InfoItem
                  icon={FiClock}
                  label="Time"
                  value={`${formatTime(
                    eventStartTime,
                  )} – ${formatTime(eventEndTime)}`}
                />

                <InfoItem icon={FiMapPin} label="Venue" value={eventVenue} />

                <InfoItem
                  icon={FiUsers}
                  label="Edition"
                  value={event?.edition || "76 Years Celebration"}
                />
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                  <FiInfo className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Please arrive on time
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Keep your registration information and attendance QR ready
                    when you arrive at the school campus.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="mt-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Dashboard
            </p>

            <h3 className="mt-1 text-xl font-black text-slate-900">
              Quick Actions
            </h3>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction
              to="/dashboard/student/profile"
              icon={FiUser}
              title="My Profile"
              description="View and manage your participant information."
            />

            <QuickAction
              to="/dashboard/student/registration"
              icon={FiCheckCircle}
              title="Registration"
              description="View your reunion registration details."
            />

            <QuickAction
              to="/dashboard/student/gifts"
              icon={FiGift}
              title="My Gifts"
              description="Check your included reunion gift package."
            />

            <QuickAction
              to="/dashboard/student/schedule"
              icon={FiCalendar}
              title="Event Schedule"
              description="View the latest reunion program and schedule."
            />
          </div>
        </section>

        {/* =================================================
            SCHEDULE
        ================================================= */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Program
              </p>

              <h3 className="mt-1 text-xl font-black text-slate-900">
                Event Schedule
              </h3>
            </div>

            <Link
              to="/dashboard/student/schedule"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 sm:self-auto"
            >
              View Full Schedule
              <FiArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="p-6">
            {scheduleItems.length > 0 ? (
              <div className="space-y-3">
                {scheduleItems.slice(0, 5).map((item, index) => (
                  <div
                    key={item?._id || item?.id || index}
                    className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:flex-row sm:gap-4"
                  >
                    <div className="shrink-0 text-sm font-black text-slate-700 sm:min-w-20">
                      {item?.startTime || item?.time || "—"}
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800">
                        {item?.title || item?.name || "Program"}
                      </p>

                      {item?.description && (
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 p-7 text-center">
                <FiCalendar className="mx-auto h-8 w-8 text-slate-300" />

                <h4 className="mt-3 text-sm font-black text-slate-700">
                  Schedule will be published here
                </h4>

                <p className="mx-auto mt-1 max-w-md text-xs leading-5 text-slate-500">
                  The reunion schedule is not included in the event response
                  yet. Check the schedule page for the latest published program.
                </p>

                <Link
                  to="/dashboard/student/schedule"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-800 hover:underline"
                >
                  Open Schedule
                  <FiArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* =================================================
            FOOTER NOTE
        ================================================= */}

        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FiShield className="h-4 w-4" />
            </div>

            <p className="text-xs leading-5 text-slate-500">
              Your registration information is protected and associated with
              your authenticated account.
            </p>
          </div>

          <Link
            to="/contact"
            className="inline-flex items-center gap-1 text-xs font-bold text-slate-800 hover:underline"
          >
            Need Help?
            <FiArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
