import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiGift,
  FiLoader,
  FiMapPin,
  FiPackage,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

import axiosSecure from "../../hooks/axiosSecure";

/* =========================================================
   HELPERS
========================================================= */

const cleanString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
};

const getRegistrationId = (registration) => {
  return (
    registration?.registrationId || registration?._id || registration?.id || ""
  );
};

const getEventId = (event, registration) => {
  return event?._id || event?.id || registration?.reunion?.eventId || "";
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Date not available";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return cleanString(dateValue) || "Date not available";
  }

  return new Intl.DateTimeFormat("en-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const formatTime = (timeValue) => {
  const value = cleanString(timeValue);

  if (!value) {
    return "";
  }

  /*
    Convert HH:mm to 12-hour format.
  */

  const match = value.match(/^(\d{1,2}):(\d{2})$/);

  if (!match) {
    return value;
  }

  const hour = Number(match[1]);

  const minute = match[2];

  if (hour < 0 || hour > 23) {
    return value;
  }

  const suffix = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${minute} ${suffix}`;
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-BD", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getStatusLabel = (status) => {
  const normalized = cleanString(status).toLowerCase();

  const labels = {
    confirmed: "Confirmed",
    pending: "Pending",
    cancelled: "Cancelled",
    completed: "Completed",
    active: "Active",
    paid: "Paid",
    failed: "Failed",
  };

  return (
    labels[normalized] ||
    (normalized
      ? normalized
          .replace(/[-_]/g, " ")
          .replace(/\b\w/g, (letter) => letter.toUpperCase())
      : "Unknown")
  );
};

const getStatusClass = (status) => {
  const normalized = cleanString(status).toLowerCase();

  if (
    normalized === "confirmed" ||
    normalized === "completed" ||
    normalized === "active"
  ) {
    return "my-events-status my-events-status-success";
  }

  if (normalized === "pending") {
    return "my-events-status my-events-status-warning";
  }

  if (normalized === "cancelled" || normalized === "failed") {
    return "my-events-status my-events-status-danger";
  }

  return "my-events-status my-events-status-neutral";
};

const getLocationText = (event) => {
  const venue = event?.venue;

  if (!venue) {
    return "Venue not available";
  }

  if (typeof venue === "string") {
    return venue;
  }

  const parts = [venue.name, venue.address, venue.city, venue.country]
    .map(cleanString)
    .filter(Boolean);

  return parts.join(", ") || "Venue not available";
};

const getEventSchedule = (event) => {
  if (!event) {
    return "Schedule not available";
  }

  const startTime = formatTime(event.startTime);

  const endTime = formatTime(event.endTime);

  if (startTime && endTime) {
    return `${startTime} – ${endTime}`;
  }

  return startTime || endTime || "Schedule not available";
};

const getGiftItems = (giftPackage, registration) => {
  /*
    Preferred source:
    giftPackage.items

    Fallback:
    registration.reunion.gifts
  */

  if (Array.isArray(giftPackage?.items)) {
    return giftPackage.items;
  }

  if (Array.isArray(registration?.reunion?.gifts)) {
    return registration.reunion.gifts;
  }

  return [];
};

const getGiftItemName = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    return cleanString(item.name) || cleanString(item.title) || "";
  }

  return "";
};

const getGiftItemQuantity = (item) => {
  if (item && typeof item === "object") {
    const quantity = Number(item.quantity);

    if (Number.isFinite(quantity) && quantity > 0) {
      return quantity;
    }
  }

  return 1;
};

const getStudentTypeLabel = (value) => {
  const normalized = cleanString(value).toLowerCase();

  if (normalized === "alumni") {
    return "Alumni";
  }

  if (normalized === "current") {
    return "Current Student";
  }

  return value || "Student";
};

const getDepartmentLabel = (value) => {
  const normalized = cleanString(value).toLowerCase();

  const labels = {
    science: "Science",
    commerce: "Commerce",
    humanities: "Humanities",
    vocational: "Vocational",
  };

  return labels[normalized] || value || "";
};

const getClassLabel = (classLevel) => {
  const value = cleanString(classLevel);

  if (!value) {
    return "";
  }

  return `Class ${value}`;
};

const getPaymentLabel = (paymentStatus) => {
  const normalized = cleanString(paymentStatus).toLowerCase();

  if (normalized === "not-required") {
    return "No payment required";
  }

  if (normalized === "paid") {
    return "Paid";
  }

  if (normalized === "pending") {
    return "Payment pending";
  }

  if (normalized === "failed") {
    return "Payment failed";
  }

  if (normalized === "refunded") {
    return "Refunded";
  }

  return paymentStatus || "Payment information unavailable";
};

/* =========================================================
   COMPONENT
========================================================= */

const MyEvents = () => {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const [errorCode, setErrorCode] = useState("");

  /* =======================================================
     FETCH MY EVENTS
  ======================================================= */

  const fetchMyEvents = useCallback(async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");
      setErrorCode("");

      console.log("Fetching:", "/api/registrations/my-events");

      const response = await axiosSecure.get("/api/registrations/my-events");

      console.log("My events response:", response.data);

      const responseData = response?.data;

      if (responseData?.success === false) {
        throw new Error(
          responseData.message || "Failed to load your reunion events.",
        );
      }

      const receivedData = Array.isArray(responseData?.data)
        ? responseData.data
        : [];

      setEvents(receivedData);
    } catch (requestError) {
      console.error("MyEvents fetch error:", requestError);

      const status = requestError?.response?.status;

      const serverData = requestError?.response?.data;

      const serverMessage = serverData?.message;

      const serverCode = serverData?.code;

      setErrorCode(serverCode || "");

      if (status === 401) {
        setError("Your session has expired. Please log in again.");
      } else if (status === 403) {
        setError(
          serverMessage ||
            "You do not have permission to view your reunion events.",
        );
      } else if (status === 404) {
        setError(
          serverMessage || "The reunion events endpoint could not be found.",
        );
      } else if (status >= 500) {
        setError(
          serverMessage ||
            "The server could not load your reunion events. Please try again.",
        );
      } else if (requestError?.code === "ECONNABORTED") {
        setError(
          "The request timed out. Please check your connection and try again.",
        );
      } else if (requestError?.message) {
        setError(requestError.message);
      } else {
        setError("Failed to load your reunion events. Please try again.");
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
     DERIVED DATA
  ======================================================= */

  const summary = useMemo(() => {
    const total = events.length;

    const confirmed = events.filter(
      (item) =>
        cleanString(item?.registration?.status).toLowerCase() === "confirmed",
    ).length;

    const pending = events.filter(
      (item) =>
        cleanString(item?.registration?.status).toLowerCase() === "pending",
    ).length;

    const cancelled = events.filter(
      (item) =>
        cleanString(item?.registration?.status).toLowerCase() === "cancelled",
    ).length;

    return {
      total,
      confirmed,
      pending,
      cancelled,
    };
  }, [events]);

  /* =======================================================
     NAVIGATION
  ======================================================= */

  const handleViewRegistration = (registrationId) => {
    if (!registrationId) {
      return;
    }

    navigate(`/dashboard/registrations/${encodeURIComponent(registrationId)}`);
  };

  /* =======================================================
     LOADING STATE
  ======================================================= */

  if (loading) {
    return (
      <>
        <style>{`
          .my-events-page {
            min-height: 100vh;
            background: #f8fafc;
            padding: 32px 16px 60px;
          }

          .my-events-container {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
          }

          .my-events-loading {
            min-height: 420px;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 14px;
            color: #475569;
          }

          .my-events-loading-icon {
            font-size: 32px;
            animation: myEventsSpin 1s linear infinite;
          }

          @keyframes myEventsSpin {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }

          .my-events-loading-text {
            font-size: 15px;
            font-weight: 600;
          }
        `}</style>

        <main className="my-events-page">
          <div className="my-events-container">
            <div className="my-events-loading">
              <FiLoader className="my-events-loading-icon" />

              <span className="my-events-loading-text">
                Loading your reunion events...
              </span>
            </div>
          </div>
        </main>
      </>
    );
  }

  /* =======================================================
     ERROR STATE
  ======================================================= */

  if (error && events.length === 0) {
    return (
      <>
        <style>{`
          .my-events-page {
            min-height: 100vh;
            background: #f8fafc;
            padding: 32px 16px 60px;
          }

          .my-events-container {
            width: 100%;
            max-width: 1180px;
            margin: 0 auto;
          }

          .my-events-error {
            max-width: 620px;
            margin: 70px auto 0;
            background: #ffffff;
            border: 1px solid #fecaca;
            border-radius: 18px;
            padding: 32px 24px;
            text-align: center;
            box-shadow: 0 12px 35px rgba(15, 23, 42, 0.06);
          }

          .my-events-error-icon {
            width: 58px;
            height: 58px;
            margin: 0 auto 16px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fef2f2;
            color: #dc2626;
            font-size: 26px;
          }

          .my-events-error h2 {
            margin: 0 0 10px;
            color: #0f172a;
            font-size: 22px;
            line-height: 1.3;
          }

          .my-events-error p {
            margin: 0 auto 20px;
            max-width: 520px;
            color: #64748b;
            font-size: 14px;
            line-height: 1.7;
          }

          .my-events-error-code {
            margin: -8px 0 20px;
            color: #94a3b8;
            font-size: 12px;
          }

          .my-events-retry {
            border: 0;
            border-radius: 10px;
            padding: 11px 18px;
            background: #0f172a;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: transform 0.2s ease, opacity 0.2s ease;
          }

          .my-events-retry:hover {
            transform: translateY(-1px);
            opacity: 0.92;
          }

          @media (max-width: 640px) {
            .my-events-page {
              padding: 20px 12px 40px;
            }

            .my-events-error {
              margin-top: 35px;
              padding: 26px 18px;
            }
          }
        `}</style>

        <main className="my-events-page">
          <div className="my-events-container">
            <section className="my-events-error">
              <div className="my-events-error-icon">
                <FiAlertCircle />
              </div>

              <h2>Unable to load your events</h2>

              <p>{error}</p>

              {errorCode && (
                <div className="my-events-error-code">
                  Error code: {errorCode}
                </div>
              )}

              <button
                type="button"
                className="my-events-retry"
                onClick={() => fetchMyEvents(true)}
                disabled={refreshing}
              >
                {refreshing ? (
                  <FiLoader className="my-events-loading-icon" />
                ) : (
                  <FiRefreshCw />
                )}
                Try Again
              </button>
            </section>
          </div>
        </main>
      </>
    );
  }

  /* =======================================================
     MAIN RENDER
  ======================================================= */

  return (
    <>
      <style>{`
        .my-events-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 30px 16px 70px;
        }

        .my-events-container {
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
        }

        /* -------------------------------------------------
           HEADER
        ------------------------------------------------- */

        .my-events-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .my-events-header-left {
          min-width: 0;
        }

        .my-events-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 8px;
          color: #2563eb;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .my-events-title {
          margin: 0;
          color: #0f172a;
          font-size: clamp(27px, 4vw, 38px);
          line-height: 1.15;
          font-weight: 800;
          letter-spacing: -0.025em;
        }

        .my-events-subtitle {
          max-width: 680px;
          margin: 10px 0 0;
          color: #64748b;
          font-size: 15px;
          line-height: 1.7;
        }

        .my-events-refresh-button {
          flex-shrink: 0;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #334155;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 3px 12px rgba(15, 23, 42, 0.04);
          transition:
            background 0.2s ease,
            border-color 0.2s ease,
            transform 0.2s ease;
        }

        .my-events-refresh-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-1px);
        }

        .my-events-refresh-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .my-events-refresh-spin {
          animation: myEventsSpin 1s linear infinite;
        }

        /* -------------------------------------------------
           SUMMARY
        ------------------------------------------------- */

        .my-events-summary {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 28px;
        }

        .my-events-summary-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          padding: 18px;
          display: flex;
          align-items: center;
          gap: 13px;
          min-width: 0;
        }

        .my-events-summary-icon {
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #334155;
          font-size: 19px;
        }

        .my-events-summary-content {
          min-width: 0;
        }

        .my-events-summary-number {
          display: block;
          color: #0f172a;
          font-size: 22px;
          line-height: 1;
          font-weight: 800;
        }

        .my-events-summary-label {
          display: block;
          margin-top: 5px;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        /* -------------------------------------------------
           INLINE ERROR
        ------------------------------------------------- */

        .my-events-inline-error {
          margin-bottom: 20px;
          border: 1px solid #fed7aa;
          background: #fff7ed;
          color: #9a3412;
          border-radius: 12px;
          padding: 12px 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          line-height: 1.5;
        }

        .my-events-inline-error svg {
          flex-shrink: 0;
        }

        /* -------------------------------------------------
           EMPTY
        ------------------------------------------------- */

        .my-events-empty {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          padding: 55px 22px;
          text-align: center;
        }

        .my-events-empty-icon {
          width: 68px;
          height: 68px;
          margin: 0 auto 18px;
          border-radius: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f1f5f9;
          color: #475569;
          font-size: 30px;
        }

        .my-events-empty h2 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 22px;
        }

        .my-events-empty p {
          max-width: 520px;
          margin: 0 auto 22px;
          color: #64748b;
          font-size: 14px;
          line-height: 1.7;
        }

        .my-events-register-button {
          border: 0;
          border-radius: 10px;
          padding: 11px 18px;
          background: #0f172a;
          color: #ffffff;
          cursor: pointer;
          font-size: 14px;
          font-weight: 700;
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        /* -------------------------------------------------
           EVENT LIST
        ------------------------------------------------- */

        .my-events-list {
          display: grid;
          gap: 20px;
        }

        .my-event-card {
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 18px;
          box-shadow: 0 8px 28px rgba(15, 23, 42, 0.045);
        }

        .my-event-card-top {
          padding: 20px 20px 18px;
          border-bottom: 1px solid #eef2f7;
        }

        .my-event-card-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .my-event-card-title-area {
          min-width: 0;
        }

        .my-event-edition {
          margin-bottom: 7px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .my-event-card-title {
          margin: 0;
          color: #0f172a;
          font-size: clamp(20px, 3vw, 25px);
          line-height: 1.25;
          font-weight: 800;
        }

        .my-event-card-id {
          margin-top: 8px;
          color: #94a3b8;
          font-size: 12px;
          word-break: break-all;
        }

        .my-events-status {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .my-events-status-success {
          background: #ecfdf5;
          color: #047857;
        }

        .my-events-status-warning {
          background: #fffbeb;
          color: #b45309;
        }

        .my-events-status-danger {
          background: #fef2f2;
          color: #b91c1c;
        }

        .my-events-status-neutral {
          background: #f1f5f9;
          color: #475569;
        }

        /* -------------------------------------------------
           EVENT DETAILS
        ------------------------------------------------- */

        .my-event-details {
          padding: 20px;
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.85fr);
          gap: 18px;
        }

        .my-event-info-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .my-event-info-item {
          min-width: 0;
          border: 1px solid #edf2f7;
          border-radius: 12px;
          padding: 13px;
          background: #fafcff;
        }

        .my-event-info-label {
          display: flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 6px;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }

        .my-event-info-label svg {
          font-size: 14px;
        }

        .my-event-info-value {
          color: #334155;
          font-size: 13px;
          line-height: 1.55;
          font-weight: 700;
          word-break: break-word;
        }

        /* -------------------------------------------------
           PARTICIPANT
        ------------------------------------------------- */

        .my-event-participant {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
        }

        .my-event-section-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 13px;
          color: #0f172a;
          font-size: 14px;
          font-weight: 800;
        }

        .my-event-section-title svg {
          color: #475569;
        }

        .my-event-participant-name {
          color: #0f172a;
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .my-event-participant-email {
          color: #64748b;
          font-size: 12px;
          word-break: break-word;
        }

        .my-event-participant-meta {
          margin-top: 13px;
          display: grid;
          gap: 8px;
        }

        .my-event-meta-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          font-size: 12px;
        }

        .my-event-meta-label {
          color: #94a3b8;
          font-weight: 600;
        }

        .my-event-meta-value {
          color: #334155;
          font-weight: 700;
          text-align: right;
          word-break: break-word;
        }

        /* -------------------------------------------------
           PACKAGE
        ------------------------------------------------- */

        .my-event-package {
          grid-column: 1 / -1;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 17px;
        }

        .my-event-package-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 14px;
        }

        .my-event-package-title {
          margin: 0;
          color: #0f172a;
          font-size: 15px;
          font-weight: 800;
        }

        .my-event-package-name {
          margin-top: 4px;
          color: #64748b;
          font-size: 12px;
        }

        .my-event-tshirt {
          flex-shrink: 0;
          border-radius: 9px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 8px 10px;
          color: #334155;
          font-size: 12px;
          font-weight: 700;
        }

        .my-event-gifts {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .my-event-gift-item {
          min-width: 0;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px;
          border-radius: 10px;
          background: #f8fafc;
          color: #475569;
          font-size: 12px;
          line-height: 1.45;
        }

        .my-event-gift-icon {
          flex-shrink: 0;
          color: #475569;
          margin-top: 1px;
        }

        .my-event-gift-name {
          min-width: 0;
          word-break: break-word;
        }

        .my-event-gift-quantity {
          margin-left: 4px;
          color: #94a3b8;
          font-weight: 700;
        }

        .my-event-no-gifts {
          color: #94a3b8;
          font-size: 12px;
          padding: 6px 0;
        }

        /* -------------------------------------------------
           FOOTER
        ------------------------------------------------- */

        .my-event-card-footer {
          padding: 15px 20px;
          background: #fafafa;
          border-top: 1px solid #eef2f7;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
        }

        .my-event-footer-info {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 12px;
        }

        .my-event-footer-info svg {
          flex-shrink: 0;
        }

        .my-event-view-button {
          flex-shrink: 0;
          border: 0;
          border-radius: 10px;
          background: #0f172a;
          color: #ffffff;
          padding: 10px 14px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 800;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition:
            transform 0.2s ease,
            opacity 0.2s ease;
        }

        .my-event-view-button:hover {
          transform: translateY(-1px);
          opacity: 0.92;
        }

        /* -------------------------------------------------
           SECURITY NOTE
        ------------------------------------------------- */

        .my-events-security-note {
          margin-top: 18px;
          display: flex;
          align-items: flex-start;
          gap: 9px;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .my-events-security-note svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        /* -------------------------------------------------
           RESPONSIVE
        ------------------------------------------------- */

        @media (max-width: 900px) {
          .my-events-summary {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .my-event-details {
            grid-template-columns: 1fr;
          }

          .my-event-gifts {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .my-events-page {
            padding: 20px 12px 45px;
          }

          .my-events-header {
            flex-direction: column;
            gap: 15px;
          }

          .my-events-refresh-button {
            width: 100%;
            justify-content: center;
          }

          .my-events-summary {
            grid-template-columns: 1fr 1fr;
            gap: 9px;
          }

          .my-events-summary-card {
            padding: 13px;
            gap: 9px;
          }

          .my-events-summary-icon {
            width: 36px;
            height: 36px;
            font-size: 16px;
          }

          .my-events-summary-number {
            font-size: 19px;
          }

          .my-events-summary-label {
            font-size: 10px;
          }

          .my-event-card-heading {
            flex-direction: column;
            gap: 12px;
          }

          .my-events-status {
            align-self: flex-start;
          }

          .my-event-card-top {
            padding: 17px 15px;
          }

          .my-event-details {
            padding: 15px;
            gap: 13px;
          }

          .my-event-info-grid {
            grid-template-columns: 1fr;
          }

          .my-event-gifts {
            grid-template-columns: 1fr;
          }

          .my-event-package-header {
            flex-direction: column;
          }

          .my-event-card-footer {
            padding: 13px 15px;
            align-items: stretch;
            flex-direction: column;
          }

          .my-event-view-button {
            width: 100%;
            justify-content: center;
          }

          .my-event-footer-info {
            align-items: flex-start;
          }
        }
      `}</style>

      <main className="my-events-page">
        <div className="my-events-container">
          {/* =================================================
              HEADER
          ================================================= */}

          <header className="my-events-header">
            <div className="my-events-header-left">
              <div className="my-events-eyebrow">
                <FiUsers />
                My Reunion Events
              </div>

              <h1 className="my-events-title">Your Reunion Events</h1>

              <p className="my-events-subtitle">
                View your reunion registrations, event details, participant
                information, package details, gifts, and registration status in
                one place.
              </p>
            </div>

            <button
              type="button"
              className="my-events-refresh-button"
              onClick={() => fetchMyEvents(true)}
              disabled={refreshing}
            >
              {refreshing ? (
                <FiLoader className="my-events-refresh-spin" />
              ) : (
                <FiRefreshCw />
              )}
              Refresh
            </button>
          </header>

          {/* =================================================
              SUMMARY
          ================================================= */}

          <section
            className="my-events-summary"
            aria-label="Registration summary"
          >
            <div className="my-events-summary-card">
              <div className="my-events-summary-icon">
                <FiCalendar />
              </div>

              <div className="my-events-summary-content">
                <span className="my-events-summary-number">
                  {summary.total}
                </span>

                <span className="my-events-summary-label">Total Events</span>
              </div>
            </div>

            <div className="my-events-summary-card">
              <div className="my-events-summary-icon">
                <FiCheckCircle />
              </div>

              <div className="my-events-summary-content">
                <span className="my-events-summary-number">
                  {summary.confirmed}
                </span>

                <span className="my-events-summary-label">Confirmed</span>
              </div>
            </div>

            <div className="my-events-summary-card">
              <div className="my-events-summary-icon">
                <FiClock />
              </div>

              <div className="my-events-summary-content">
                <span className="my-events-summary-number">
                  {summary.pending}
                </span>

                <span className="my-events-summary-label">Pending</span>
              </div>
            </div>

            <div className="my-events-summary-card">
              <div className="my-events-summary-icon">
                <FiXCircle />
              </div>

              <div className="my-events-summary-content">
                <span className="my-events-summary-number">
                  {summary.cancelled}
                </span>

                <span className="my-events-summary-label">Cancelled</span>
              </div>
            </div>
          </section>

          {/* =================================================
              INLINE ERROR
          ================================================= */}

          {error && (
            <div className="my-events-inline-error">
              <FiAlertCircle />

              <span>{error}</span>
            </div>
          )}

          {/* =================================================
              EMPTY STATE
          ================================================= */}

          {events.length === 0 ? (
            <section className="my-events-empty">
              <div className="my-events-empty-icon">
                <FiCalendar />
              </div>

              <h2>No reunion registrations yet</h2>

              <p>
                You have not registered for any reunion event yet. Once you
                complete a registration, your reunion event will appear here.
              </p>

              <button
                type="button"
                className="my-events-register-button"
                onClick={() => navigate("/reunion-register")}
              >
                Register for Reunion
                <FiArrowRight />
              </button>
            </section>
          ) : (
            /* ===============================================
               EVENT LIST
            =============================================== */

            <section
              className="my-events-list"
              aria-label="Your reunion events"
            >
              {events.map((item, index) => {
                const registration = item?.registration || {};

                const event = item?.event || null;

                const giftPackage = item?.giftPackage || null;

                const registrationId = getRegistrationId(registration);

                const eventId = getEventId(event, registration);

                const status =
                  cleanString(registration.status).toLowerCase() || "unknown";

                const participant = registration.participant || {};

                const schoolInfo = registration.schoolInfo || {};

                const reunion = registration.reunion || {};

                const giftItems = getGiftItems(giftPackage, registration);

                const packageName =
                  cleanString(
                    giftPackage?.name ||
                      giftPackage?.title ||
                      reunion.packageName,
                  ) || "General Reunion Package";

                const tshirtSize = cleanString(
                  reunion.tShirt || reunion.tshirtSize || reunion.tShirtSize,
                );

                const paymentStatus = cleanString(registration.paymentStatus);

                const eventTitle =
                  cleanString(event?.title || reunion.eventTitle) ||
                  "Grand School Reunion 2027";

                const eventDate = event?.eventDate;

                const location = getLocationText(event);

                const schedule = getEventSchedule(event);

                const eventEdition = cleanString(event?.edition);

                return (
                  <article
                    key={registrationId || eventId || index}
                    className="my-event-card"
                  >
                    {/* =====================================
                          CARD TOP
                      ===================================== */}

                    <div className="my-event-card-top">
                      <div className="my-event-card-heading">
                        <div className="my-event-card-title-area">
                          {eventEdition && (
                            <div className="my-event-edition">
                              {eventEdition}
                            </div>
                          )}

                          <h2 className="my-event-card-title">{eventTitle}</h2>

                          {registrationId && (
                            <div className="my-event-card-id">
                              Registration ID: <strong>{registrationId}</strong>
                            </div>
                          )}
                        </div>

                        <div className={getStatusClass(status)}>
                          {status === "confirmed" ? (
                            <FiCheckCircle />
                          ) : status === "cancelled" ? (
                            <FiXCircle />
                          ) : (
                            <FiClock />
                          )}

                          {getStatusLabel(status)}
                        </div>
                      </div>
                    </div>

                    {/* =====================================
                          EVENT DETAILS
                      ===================================== */}

                    <div className="my-event-details">
                      <div className="my-event-info-grid">
                        {/* Date */}

                        <div className="my-event-info-item">
                          <div className="my-event-info-label">
                            <FiCalendar />
                            Event Date
                          </div>

                          <div className="my-event-info-value">
                            {formatDate(eventDate)}
                          </div>
                        </div>

                        {/* Time */}

                        <div className="my-event-info-item">
                          <div className="my-event-info-label">
                            <FiClock />
                            Event Time
                          </div>

                          <div className="my-event-info-value">{schedule}</div>
                        </div>

                        {/* Venue */}

                        <div className="my-event-info-item">
                          <div className="my-event-info-label">
                            <FiMapPin />
                            Venue
                          </div>

                          <div className="my-event-info-value">{location}</div>
                        </div>

                        {/* Payment */}

                        <div className="my-event-info-item">
                          <div className="my-event-info-label">
                            <FiCheckCircle />
                            Payment
                          </div>

                          <div className="my-event-info-value">
                            {getPaymentLabel(paymentStatus)}
                          </div>
                        </div>
                      </div>

                      {/* =================================
                            PARTICIPANT
                        ================================= */}

                      <div className="my-event-participant">
                        <h3 className="my-event-section-title">
                          <FiUser />
                          Participant
                        </h3>

                        <div className="my-event-participant-name">
                          {participant.name || "Name not available"}
                        </div>

                        <div className="my-event-participant-email">
                          {participant.email || "Email not available"}
                        </div>

                        <div className="my-event-participant-meta">
                          {participant.phone && (
                            <div className="my-event-meta-row">
                              <span className="my-event-meta-label">Phone</span>

                              <span className="my-event-meta-value">
                                {participant.phone}
                              </span>
                            </div>
                          )}

                          {schoolInfo.studentType && (
                            <div className="my-event-meta-row">
                              <span className="my-event-meta-label">Type</span>

                              <span className="my-event-meta-value">
                                {getStudentTypeLabel(schoolInfo.studentType)}
                              </span>
                            </div>
                          )}

                          {schoolInfo.classLevel && (
                            <div className="my-event-meta-row">
                              <span className="my-event-meta-label">Class</span>

                              <span className="my-event-meta-value">
                                {getClassLabel(schoolInfo.classLevel)}
                              </span>
                            </div>
                          )}

                          {schoolInfo.batchYear && (
                            <div className="my-event-meta-row">
                              <span className="my-event-meta-label">Batch</span>

                              <span className="my-event-meta-value">
                                {schoolInfo.batchYear}
                              </span>
                            </div>
                          )}

                          {schoolInfo.department && (
                            <div className="my-event-meta-row">
                              <span className="my-event-meta-label">
                                Department
                              </span>

                              <span className="my-event-meta-value">
                                {getDepartmentLabel(schoolInfo.department)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* =================================
                            PACKAGE + GIFTS
                        ================================= */}

                      <div className="my-event-package">
                        <div className="my-event-package-header">
                          <div>
                            <h3 className="my-event-package-title">
                              <FiPackage
                                style={{
                                  marginRight: "7px",
                                  verticalAlign: "middle",
                                }}
                              />
                              Reunion Package
                            </h3>

                            <div className="my-event-package-name">
                              {packageName}
                            </div>
                          </div>

                          {tshirtSize && (
                            <div className="my-event-tshirt">
                              T-Shirt: {tshirtSize}
                            </div>
                          )}
                        </div>

                        {giftItems.length > 0 ? (
                          <div className="my-event-gifts">
                            {giftItems.map((gift, giftIndex) => {
                              const giftName = getGiftItemName(gift);

                              if (!giftName) {
                                return null;
                              }

                              const quantity = getGiftItemQuantity(gift);

                              return (
                                <div
                                  key={`${giftName}-${giftIndex}`}
                                  className="my-event-gift-item"
                                >
                                  <FiGift className="my-event-gift-icon" />

                                  <span className="my-event-gift-name">
                                    {giftName}

                                    {quantity > 1 && (
                                      <span className="my-event-gift-quantity">
                                        × {quantity}
                                      </span>
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="my-event-no-gifts">
                            No gift package information is currently available.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* =====================================
                          CARD FOOTER
                      ===================================== */}

                    <div className="my-event-card-footer">
                      <div className="my-event-footer-info">
                        <FiCheckCircle />

                        <span>
                          Registered{" "}
                          {formatDateTime(registration.createdAt) ||
                            "date not available"}
                        </span>
                      </div>

                      {registrationId && (
                        <button
                          type="button"
                          className="my-event-view-button"
                          onClick={() => handleViewRegistration(registrationId)}
                        >
                          View Registration
                          <FiArrowRight />
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </section>
          )}

          {/* =================================================
              SECURITY NOTE
          ================================================= */}

          {events.length > 0 && (
            <div className="my-events-security-note">
              <FiShield />

              <span>
                Your registration information is available only to your
                authenticated account. Sensitive QR verification tokens are not
                displayed on this page.
              </span>
            </div>
          )}
        </div>
      </main>
    </>
  );
};

export default MyEvents;
