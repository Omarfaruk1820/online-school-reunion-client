import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FiAlertCircle,
  FiAward,
  FiCalendar,
  FiCheckCircle,
  FiChevronRight,
  FiClock,
  FiGift,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiSmartphone,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import axiosSecure from "../../hooks/axiosSecure";

/* =========================================================
   HELPERS
========================================================= */

const normalizeString = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
};

const getRegistrationId = (registration) => {
  return (
    normalizeString(registration?.registrationId) ||
    normalizeString(registration?._id) ||
    "Registration"
  );
};

const getGiftItemName = (item) => {
  if (!item) {
    return "";
  }

  if (typeof item === "string") {
    return item;
  }

  if (typeof item === "object") {
    return normalizeString(item.name) || normalizeString(item.title) || "";
  }

  return "";
};

const getEventDateParts = (dateValue) => {
  const dateString = normalizeString(dateValue).slice(0, 10);

  const parts = dateString.split("-");

  if (parts.length !== 3) {
    return null;
  }

  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const day = Number(parts[2]);

  if (!year || !month || !day) {
    return null;
  }

  return {
    year,
    month,
    day,
  };
};

const formatEventDate = (dateValue, timezone = "Asia/Dhaka") => {
  const parts = getEventDateParts(dateValue);

  if (!parts) {
    return "Date unavailable";
  }

  /*
   * Noon UTC prevents the date from moving to
   * the previous/next day because of timezone conversion.
   */
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, 12));

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: timezone,
  }).format(date);
};

const getEventStatus = (event, registration) => {
  const registrationStatus = normalizeString(
    registration?.status,
  ).toLowerCase();

  if (registrationStatus === "cancelled") {
    return {
      label: "Cancelled",
      className: "bg-red-50 text-red-700 border-red-200",
    };
  }

  if (registrationStatus === "confirmed" || registrationStatus === "approved") {
    return {
      label: "Confirmed",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (registrationStatus === "pending") {
    return {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
    };
  }

  if (event?.registrationOpen === true) {
    return {
      label: "Registered",
      className: "bg-blue-50 text-blue-700 border-blue-200",
    };
  }

  return {
    label: "Registered",
    className: "bg-slate-50 text-slate-700 border-slate-200",
  };
};

const getAttendanceStatus = (attendance) => {
  const status = normalizeString(attendance?.status).toLowerCase();

  if (status === "checked-in" || status === "present") {
    return {
      label: "Checked in",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: FiCheckCircle,
    };
  }

  return {
    label: "Not checked in",
    className: "bg-slate-50 text-slate-600 border-slate-200",
    icon: FiClock,
  };
};

const getPaymentStatus = (registration) => {
  const status = normalizeString(registration?.paymentStatus).toLowerCase();

  if (status === "not-required") {
    return {
      label: "No payment required",
      className: "text-emerald-700",
    };
  }

  if (status === "paid" || status === "completed") {
    return {
      label: "Paid",
      className: "text-emerald-700",
    };
  }

  if (status === "pending") {
    return {
      label: "Payment pending",
      className: "text-amber-700",
    };
  }

  return {
    label: status || "Not available",
    className: "text-slate-600",
  };
};

const isUpcomingEvent = (eventDate) => {
  const parts = getEventDateParts(eventDate);

  if (!parts) {
    return false;
  }

  const eventDateObject = new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    23,
    59,
    59,
  );

  return eventDateObject >= new Date();
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const StatusBadge = ({ children, className = "" }) => {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
};

const InfoItem = ({ icon: Icon, label, value }) => {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold text-slate-800">
          {value || "Not available"}
        </p>
      </div>
    </div>
  );
};

/* =========================================================
   MAIN COMPONENT
========================================================= */

const MyEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  /* =======================================================
     FETCH MY EVENTS
  ======================================================= */

  const fetchMyEvents = useCallback(async (showRefreshState = false) => {
    try {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      /*
       * Base URL:
       * https://online-school-reunion-server.vercel.app
       *
       * Final URL:
       * https://online-school-reunion-server.vercel.app
       * /api/registrations/my-events
       */

      const response = await axiosSecure.get("/api/registrations/my-events");

      const data = response?.data?.data;

      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (err) {
      console.error("MyEvents fetch error:", err);

      const status = err?.response?.status;

      const serverMessage = err?.response?.data?.message;

      if (status === 401) {
        setError("Your session has expired. Please sign in again.");

        toast.error("Please sign in again.");

        return;
      }

      if (status === 404) {
        setEvents([]);
        setError("");
        return;
      }

      const message = serverMessage || "Unable to load your reunion events.";

      setError(message);

      if (showRefreshState) {
        toast.error(message);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    fetchMyEvents();
  }, [fetchMyEvents]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary = useMemo(() => {
    const total = events.length;

    const confirmed = events.filter(({ registration }) =>
      ["confirmed", "approved"].includes(
        normalizeString(registration?.status).toLowerCase(),
      ),
    ).length;

    const upcoming = events.filter(({ event }) =>
      isUpcomingEvent(event?.eventDate),
    ).length;

    const checkedIn = events.filter(({ registration }) =>
      ["checked-in", "present"].includes(
        normalizeString(registration?.attendance?.status).toLowerCase(),
      ),
    ).length;

    return {
      total,
      confirmed,
      upcoming,
      checkedIn,
    };
  }, [events]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-10 w-64 rounded-lg bg-slate-200" />

            <div className="mt-3 h-5 w-96 max-w-full rounded bg-slate-200" />

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-28 rounded-2xl bg-white shadow-sm"
                />
              ))}
            </div>

            <div className="mt-8 space-y-6">
              {[1, 2].map((item) => (
                <div
                  key={item}
                  className="h-96 rounded-3xl bg-white shadow-sm"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center px-4 py-12">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-6 text-center shadow-sm sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FiAlertCircle className="h-8 w-8" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Unable to load your events
            </h1>

            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-600">
              {error}
            </p>

            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchMyEvents(true)}
                disabled={refreshing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiRefreshCw
                  className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                />
                Try again
              </button>

              <button
                type="button"
                onClick={() => navigate("/reunion-register")}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Register for Reunion
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (events.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-sm sm:p-8">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <FiAward className="h-4 w-4" />
                76 Years Celebration
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                My Reunion Events
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Your registered school reunion events, registration information,
                gifts and attendance details will appear here.
              </p>
            </div>
          </div>

          {/* Empty */}
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm sm:px-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              <FiCalendar className="h-9 w-9" />
            </div>

            <h2 className="mt-6 text-2xl font-bold text-slate-900">
              No reunion events yet
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">
              You have not registered for any reunion event yet. Join the Grand
              School Reunion 2027 and celebrate this special milestone with your
              school community.
            </p>

            <button
              type="button"
              onClick={() => navigate("/reunion-register")}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Register for Reunion
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     MAIN UI
  ======================================================= */

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="relative overflow-hidden rounded-3xl bg-slate-900 px-5 py-7 text-white shadow-sm sm:px-8 sm:py-9">
          <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-white/5" />

          <div className="absolute -bottom-28 right-20 h-64 w-64 rounded-full bg-white/5" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">
                <FiAward className="h-4 w-4" />
                76 Years Celebration
              </div>

              <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
                My Reunion Events
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Keep track of your reunion registrations, event details, reunion
                gifts and attendance status in one place.
              </p>
            </div>

            <button
              type="button"
              onClick={() => fetchMyEvents(true)}
              disabled={refreshing}
              className="relative inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiRefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />

              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </section>

        {/* =================================================
            SUMMARY CARDS
        ================================================= */}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Events
                </p>

                <p className="mt-2 text-3xl font-bold text-slate-900">
                  {summary.total}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <FiCalendar className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Confirmed</p>

                <p className="mt-2 text-3xl font-bold text-emerald-600">
                  {summary.confirmed}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <FiCheckCircle className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Upcoming</p>

                <p className="mt-2 text-3xl font-bold text-blue-600">
                  {summary.upcoming}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <FiClock className="h-5 w-5" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Checked In</p>

                <p className="mt-2 text-3xl font-bold text-violet-600">
                  {summary.checkedIn}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <FiUsers className="h-5 w-5" />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            EVENT CARDS
        ================================================= */}

        <section className="mt-8 space-y-6">
          {events.map(({ registration, event, giftPackage }, index) => {
            const eventStatus = getEventStatus(event, registration);

            const attendanceStatus = getAttendanceStatus(
              registration?.attendance,
            );

            const paymentStatus = getPaymentStatus(registration);

            const AttendanceIcon = attendanceStatus.icon;

            const packageItems = Array.isArray(giftPackage?.items)
              ? giftPackage.items
              : [];

            const eventTitle =
              normalizeString(event?.title) ||
              normalizeString(registration?.reunion?.eventTitle) ||
              "Grand School Reunion 2027";

            const eventDate = event?.eventDate || null;

            const timezone = normalizeString(event?.timezone) || "Asia/Dhaka";

            const venueName =
              normalizeString(event?.venue?.name) || "School Campus";

            const venueAddress = normalizeString(event?.venue?.address);

            const venueCity = normalizeString(event?.venue?.city);

            const studentName = normalizeString(
              registration?.participant?.name,
            );

            const studentType = normalizeString(
              registration?.schoolInfo?.studentType,
            );

            const classLevel = normalizeString(
              registration?.schoolInfo?.classLevel,
            );

            const department = normalizeString(
              registration?.schoolInfo?.department,
            );

            const batchYear = registration?.schoolInfo?.batchYear;

            const tshirtSize = normalizeString(
              registration?.reunion?.tShirt?.size,
            );

            const registrationId = getRegistrationId(registration);

            return (
              <article
                key={registration?._id || registrationId || index}
                className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
              >
                {/* ---------------------------------------
                      EVENT CARD HEADER
                  --------------------------------------- */}

                <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div className="flex min-w-0 gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-sm">
                        <FiAward className="h-6 w-6" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge className={eventStatus.className}>
                            {eventStatus.label}
                          </StatusBadge>

                          {event?.edition && (
                            <span className="text-xs font-medium text-slate-400">
                              {event.edition}
                            </span>
                          )}
                        </div>

                        <h2 className="mt-2 break-words text-xl font-bold text-slate-900 sm:text-2xl">
                          {eventTitle}
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                          Registration ID:{" "}
                          <span className="font-semibold text-slate-700">
                            {registrationId}
                          </span>
                        </p>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Registration Status
                        </p>

                        <div className="mt-1 flex items-center gap-2">
                          <FiCheckCircle className="h-4 w-4 text-emerald-600" />

                          <span className="text-sm font-bold text-slate-800">
                            {eventStatus.label}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------
                      EVENT INFORMATION
                  --------------------------------------- */}

                <div className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                  <InfoItem
                    icon={FiCalendar}
                    label="Event Date"
                    value={formatEventDate(eventDate, timezone)}
                  />

                  <InfoItem
                    icon={FiClock}
                    label="Event Time"
                    value={
                      event?.startTime && event?.endTime
                        ? `${event.startTime} – ${event.endTime}`
                        : "Time unavailable"
                    }
                  />

                  <InfoItem
                    icon={FiMapPin}
                    label="Venue"
                    value={[venueName, venueCity].filter(Boolean).join(", ")}
                  />

                  <InfoItem
                    icon={FiSmartphone}
                    label="Phone"
                    value={registration?.participant?.phone}
                  />
                </div>

                {/* ---------------------------------------
                      VENUE ADDRESS
                  --------------------------------------- */}

                {venueAddress && (
                  <div className="mx-5 mb-5 flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 sm:mx-6 sm:mb-6">
                    <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Venue Address
                      </p>

                      <p className="mt-1 text-sm font-medium leading-6 text-slate-700">
                        {venueAddress}
                      </p>
                    </div>
                  </div>
                )}

                {/* ---------------------------------------
                      PARTICIPANT + SCHOOL INFO
                  --------------------------------------- */}

                <div className="grid gap-6 border-t border-slate-100 p-5 sm:p-6 lg:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FiUser className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          Participant
                        </h3>

                        <p className="text-xs text-slate-400">
                          Registered attendee
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <InfoItem
                        icon={FiUser}
                        label="Name"
                        value={studentName}
                      />

                      <InfoItem
                        icon={FiSmartphone}
                        label="Phone"
                        value={registration?.participant?.phone}
                      />

                      <InfoItem
                        icon={FiMapPin}
                        label="District"
                        value={registration?.participant?.district}
                      />

                      <InfoItem
                        icon={FiMapPin}
                        label="City"
                        value={registration?.participant?.city}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FiUsers className="h-4 w-4" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          School Information
                        </h3>

                        <p className="text-xs text-slate-400">
                          Reunion participant profile
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <InfoItem
                        icon={FiUsers}
                        label="Student Type"
                        value={
                          studentType
                            ? studentType.charAt(0).toUpperCase() +
                              studentType.slice(1)
                            : ""
                        }
                      />

                      <InfoItem
                        icon={FiAward}
                        label="Class"
                        value={classLevel ? `Class ${classLevel}` : ""}
                      />

                      <InfoItem
                        icon={FiCalendar}
                        label="Batch"
                        value={batchYear ? String(batchYear) : ""}
                      />

                      <InfoItem
                        icon={FiUsers}
                        label="Department"
                        value={
                          department
                            ? department.charAt(0).toUpperCase() +
                              department.slice(1)
                            : "Not applicable"
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* ---------------------------------------
                      PACKAGE
                  --------------------------------------- */}

                <div className="border-t border-slate-100 bg-slate-50/60 p-5 sm:p-6">
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow-sm">
                          <FiGift className="h-4 w-4" />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            Reunion Gift Package
                          </h3>

                          <p className="text-xs text-slate-400">
                            Gifts included with your registration
                          </p>
                        </div>
                      </div>

                      <h4 className="mt-4 text-lg font-bold text-slate-800">
                        {normalizeString(
                          giftPackage?.name ||
                            giftPackage?.title ||
                            registration?.reunion?.packageName,
                        ) || "General Reunion Package"}
                      </h4>
                    </div>

                    {tshirtSize && (
                      <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          T-Shirt Size
                        </p>

                        <p className="mt-1 text-lg font-bold text-slate-900">
                          {tshirtSize}
                        </p>
                      </div>
                    )}
                  </div>

                  {packageItems.length > 0 ? (
                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {packageItems.map((item, itemIndex) => {
                        const itemName = getGiftItemName(item);

                        if (!itemName) {
                          return null;
                        }

                        return (
                          <div
                            key={item?.id || itemName || itemIndex}
                            className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                              <FiCheckCircle className="h-4 w-4" />
                            </div>

                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-800">
                                {itemName}
                              </p>

                              {typeof item === "object" &&
                                item?.description && (
                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.description}
                                  </p>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-3">
                        <FiPackage className="h-5 w-5 text-slate-500" />

                        <p className="text-sm text-slate-600">
                          Gift package details are not available yet.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* ---------------------------------------
                      ATTENDANCE + PAYMENT + QR
                  --------------------------------------- */}

                <div className="grid gap-4 border-t border-slate-100 p-5 sm:p-6 md:grid-cols-3">
                  {/* Attendance */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <AttendanceIcon className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Attendance
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {attendanceStatus.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FiShield className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Payment
                        </p>

                        <p
                          className={`mt-1 text-sm font-bold ${paymentStatus.className}`}
                        >
                          {paymentStatus.label}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* QR */}

                  <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                        <FiSmartphone className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                          Attendance QR
                        </p>

                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {registration?.qrCode?.enabled
                            ? "Ready"
                            : "Not available"}
                        </p>
                      </div>
                    </div>

                    {registration?.qrCode?.enabled && (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        Your attendance QR is generated and ready for reunion
                        check-in.
                      </p>
                    )}
                  </div>
                </div>

                {/* ---------------------------------------
                      FOOTER
                  --------------------------------------- */}

                <div className="flex flex-col gap-3 border-t border-slate-100 bg-white p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div>
                    <p className="text-xs text-slate-400">Registered on</p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {registration?.createdAt
                        ? new Date(registration.createdAt).toLocaleDateString(
                            "en-BD",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )
                        : "Date unavailable"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/dashboard/registrations/${registrationId}`)
                    }
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    View Registration
                    <FiChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        {/* =================================================
            BOTTOM NOTE
        ================================================= */}

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <FiShield className="h-5 w-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Your registration information
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                Your reunion registration and attendance information is linked
                to your authenticated account. Keep your registration details
                available when attending the reunion.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default MyEvents;
