import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FiAlertCircle,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiGift,
  FiHash,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

import useAxiosSecure from "../../hooks/axiosSecure";
import useAuth from "../../hooks/useAuth";

const MY_REGISTRATION_URL = "/registrations/my-registration";

const MyRegistrations = () => {
  const axiosSecure = useAxiosSecure();
  const { user } = useAuth();
  const navigate = useNavigate();

  // =========================================================
  // FETCH MY REGISTRATION
  // =========================================================

  const {
    data: responseData = {},
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["my-reunion-registration", user?.uid],

    queryFn: async () => {
      const response = await axiosSecure.get(MY_REGISTRATION_URL);

      return response.data;
    },

    enabled: Boolean(user?.uid),

    staleTime: 30 * 1000,

    retry: 1,
  });

  // =========================================================
  // NORMALIZE RESPONSE
  //
  // Server:
  //
  // {
  //   success: true,
  //   data: registration,
  //   event: event,
  //   giftPackage: giftPackage
  // }
  // =========================================================

  const registration = responseData?.data || null;
  const event = responseData?.event || null;
  const giftPackage = responseData?.giftPackage || null;

  // =========================================================
  // DERIVED DATA
  // =========================================================

  const participant = registration?.participant || {};
  const schoolInfo = registration?.schoolInfo || {};
  const reunion = registration?.reunion || {};
  const tShirt = reunion?.tShirt || {};
  const consent = registration?.consent || {};
  const payment = registration?.payment || {};
  const qrCode = registration?.qrCode || {};
  const attendance = registration?.attendance || {};

  const participantName =
    participant?.name || user?.displayName || "Reunion Participant";

  const registrationId = registration?.registrationId || "N/A";

  const currentStatus = String(registration?.status || "pending").toLowerCase();

  const paymentStatus = String(
    registration?.paymentStatus || "not-required",
  ).toLowerCase();

  const attendanceStatus = String(
    attendance?.status || "not-checked-in",
  ).toLowerCase();

  const eventTitle =
    event?.title ||
    event?.name ||
    reunion?.eventTitle ||
    "Grand School Reunion 2027";

  const eventDate = event?.eventDate || event?.date;

  const eventStartTime =
    event?.startTime || event?.time?.start || event?.start || "09:00";

  const eventEndTime =
    event?.endTime || event?.time?.end || event?.end || "17:00";

  const venueName =
    event?.venue?.name ||
    event?.venueName ||
    event?.location ||
    "School Campus";

  const venueAddress =
    event?.venue?.address ||
    event?.venueAddress ||
    event?.address ||
    "Our Beloved School Campus";

  const packageName =
    giftPackage?.name || reunion?.packageName || "General Reunion Package";

  const packageItems = useMemo(() => {
    const items =
      giftPackage?.items ||
      giftPackage?.gifts ||
      giftPackage?.includedItems ||
      [];

    if (!Array.isArray(items)) {
      return [];
    }

    return items;
  }, [giftPackage]);

  // =========================================================
  // LOADING
  // =========================================================

  if (isLoading) {
    return <MyRegistrationSkeleton />;
  }

  // =========================================================
  // ERROR
  // =========================================================

  if (isError) {
    return (
      <MyRegistrationError
        error={error}
        onRetry={() => refetch()}
        onRegister={() => navigate("/reunion-register")}
      />
    );
  }

  // =========================================================
  // NO REGISTRATION
  // =========================================================

  if (!registration) {
    return (
      <NoRegistration
        onRegister={() => navigate("/reunion-register")}
        onRetry={() => refetch()}
      />
    );
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <div className="min-h-full space-y-6 pb-10">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <header className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-primary">
            <FiCheckCircle aria-hidden="true" />

            <span>Reunion Registration</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-base-content sm:text-3xl">
            My Registration
          </h1>

          <p className="mt-1 max-w-2xl text-sm leading-6 text-base-content/60 sm:text-base">
            View your registration information for {eventTitle}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn btn-outline btn-primary w-full sm:w-auto"
        >
          {isFetching ? (
            <FiLoader className="animate-spin" aria-hidden="true" />
          ) : (
            <FiRefreshCw aria-hidden="true" />
          )}

          <span>{isFetching ? "Refreshing..." : "Refresh"}</span>
        </button>
      </header>

      {/* =====================================================
          REGISTRATION HERO / STATUS
      ====================================================== */}

      <section className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="bg-primary/5 p-5 sm:p-6 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <ParticipantAvatar
                name={participantName}
                photo={
                  participant?.photo ||
                  participant?.photoURL ||
                  participant?.image
                }
                size="large"
              />

              <div className="min-w-0">
                <p className="text-sm font-medium text-primary">
                  Registered Participant
                </p>

                <h2 className="mt-1 truncate text-xl font-bold text-base-content sm:text-2xl">
                  {participantName}
                </h2>

                <p className="mt-1 break-all text-sm text-base-content/60">
                  {participant?.email || user?.email || "No email"}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center lg:flex-col lg:items-end">
              <StatusBadge status={currentStatus} />

              <div className="rounded-xl bg-base-100 px-4 py-2 text-center shadow-sm sm:text-left lg:text-right">
                <p className="text-[11px] uppercase tracking-wider text-base-content/45">
                  Registration ID
                </p>

                <p className="mt-0.5 break-all font-mono text-sm font-bold text-base-content">
                  #{registrationId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick information */}

        <div className="grid grid-cols-1 divide-y divide-base-300 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
          <QuickInfo
            icon={<FiCalendar />}
            label="Registered"
            value={formatDate(registration?.createdAt)}
          />

          <QuickInfo
            icon={<FiBookOpen />}
            label="Class"
            value={
              schoolInfo?.classLevel ? `Class ${schoolInfo.classLevel}` : "N/A"
            }
          />

          <QuickInfo
            icon={<FiUsers />}
            label="Participant Type"
            value={formatStudentType(schoolInfo?.studentType)}
          />

          <QuickInfo
            icon={<FiCreditCard />}
            label="Payment"
            value={formatPaymentStatus(paymentStatus)}
          />
        </div>
      </section>

      {/* =====================================================
          EVENT INFORMATION
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiCalendar />}
          title="Reunion Event"
          description="Information about the reunion event you registered for."
        />

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <InfoCard icon={<FiCalendar />} label="Event" value={eventTitle} />

          <InfoCard
            icon={<FiCalendar />}
            label="Date"
            value={formatDate(eventDate)}
          />

          <InfoCard
            icon={<FiClock />}
            label="Time"
            value={`${formatTime(eventStartTime)} - ${formatTime(
              eventEndTime,
            )}`}
          />

          <InfoCard
            icon={<FiMapPin />}
            label="Venue"
            value={venueName}
            description={venueAddress}
          />
        </div>
      </section>

      {/* =====================================================
          PARTICIPANT INFORMATION
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiUser />}
          title="Personal Information"
          description="Your personal information used for the reunion registration."
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            icon={<FiUser />}
            label="Full Name"
            value={participant?.name || "N/A"}
          />

          <DetailItem
            icon={<FiMail />}
            label="Email"
            value={participant?.email || user?.email || "N/A"}
          />

          <DetailItem
            icon={<FiPhone />}
            label="Phone"
            value={participant?.phone || "N/A"}
          />

          <DetailItem
            icon={<FiMapPin />}
            label="District"
            value={participant?.district || "N/A"}
          />

          <DetailItem
            icon={<FiMapPin />}
            label="City"
            value={participant?.city || "N/A"}
          />

          <DetailItem
            icon={<FiShield />}
            label="Firebase UID"
            value={registration?.uid || "N/A"}
            mono
          />
        </div>
      </section>

      {/* =====================================================
          SCHOOL INFORMATION
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiBookOpen />}
          title="School Information"
          description="Your school class, batch and department information."
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DetailItem
            icon={<FiUsers />}
            label="Participant Type"
            value={formatStudentType(schoolInfo?.studentType)}
          />

          <DetailItem
            icon={<FiBookOpen />}
            label="Class"
            value={
              schoolInfo?.classLevel ? `Class ${schoolInfo.classLevel}` : "N/A"
            }
          />

          <DetailItem
            icon={<FiCalendar />}
            label="Batch Year"
            value={schoolInfo?.batchYear ?? "N/A"}
          />

          <DetailItem
            icon={<FiBookOpen />}
            label="Department"
            value={
              schoolInfo?.department
                ? formatDepartment(schoolInfo.department)
                : "General"
            }
          />
        </div>
      </section>

      {/* =====================================================
          REUNION PACKAGE
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiGift />}
          title="Reunion Package"
          description="Your selected reunion package and included gifts."
        />

        <div className="mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-5">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Selected Package
              </p>

              <h3 className="mt-1 text-xl font-bold text-base-content">
                {packageName}
              </h3>

              {giftPackage?.description && (
                <p className="mt-2 text-sm leading-6 text-base-content/60">
                  {giftPackage.description}
                </p>
              )}
            </div>

            <div className="shrink-0 rounded-xl bg-base-100 px-4 py-3 shadow-sm">
              <p className="text-[11px] uppercase tracking-wider text-base-content/45">
                Package ID
              </p>

              <p className="mt-1 break-all font-mono text-sm font-semibold">
                {reunion?.packageId || giftPackage?.id || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* T-Shirt */}

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InfoCard
            icon={<FiGift />}
            label="T-Shirt Size"
            value={tShirt?.size || "N/A"}
          />

          <InfoCard icon={<FiGift />} label="Package" value={packageName} />
        </div>

        {/* Package items */}

        {packageItems.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-base-content/50">
              Included Gifts
            </h3>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {packageItems.map((item, index) => (
                <GiftItem key={`gift-${index}`} item={item} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* =====================================================
          PAYMENT & REGISTRATION STATUS
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiCreditCard />}
          title="Registration & Payment"
          description="Current registration and payment status."
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <StatusInfoCard
            title="Registration Status"
            value={formatStatus(currentStatus)}
            status={currentStatus}
          />

          <StatusInfoCard
            title="Payment Status"
            value={formatPaymentStatus(paymentStatus)}
            status={paymentStatus}
          />
        </div>

        {registration?.paymentRequired !== undefined && (
          <div className="mt-4 rounded-xl bg-base-200/60 p-4">
            <p className="text-sm text-base-content/60">Payment Required</p>

            <p className="mt-1 font-semibold">
              {registration.paymentRequired ? "Yes" : "No"}
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          CONSENT
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiShield />}
          title="Registration Consent"
          description="Your agreement to the reunion registration rules."
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem
            icon={<FiCheckCircle />}
            label="Agreed to Reunion Rules"
            value={consent?.agreedToRules ? "Yes" : "No"}
          />

          <DetailItem
            icon={<FiCalendar />}
            label="Agreed At"
            value={consent?.agreedAt ? formatDateTime(consent.agreedAt) : "N/A"}
          />
        </div>
      </section>

      {/* =====================================================
          ATTENDANCE
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiCheckCircle />}
          title="Attendance"
          description="Your reunion event attendance information."
        />

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatusInfoCard
            title="Attendance Status"
            value={formatAttendanceStatus(attendanceStatus)}
            status={attendanceStatus}
          />

          <DetailItem
            label="Checked In At"
            value={
              attendance?.checkedInAt
                ? formatDateTime(attendance.checkedInAt)
                : "Not checked in"
            }
          />

          <DetailItem
            label="Checked In By"
            value={attendance?.checkedInBy || "N/A"}
          />
        </div>
      </section>

      {/* =====================================================
          QR CODE INFORMATION
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiShield />}
          title="Attendance QR Code"
          description="Your QR code information for reunion attendance."
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem
            label="QR Enabled"
            value={qrCode?.enabled ? "Yes" : "No"}
          />

          <DetailItem label="Purpose" value={qrCode?.purpose || "N/A"} />

          <DetailItem label="QR Status" value={qrCode?.status || "N/A"} />

          <DetailItem label="QR Version" value={qrCode?.version ?? "N/A"} />

          <DetailItem
            label="Generated At"
            value={
              qrCode?.generatedAt ? formatDateTime(qrCode.generatedAt) : "N/A"
            }
          />

          <DetailItem label="Security Token" value="Hidden for security" mono />
        </div>
      </section>

      {/* =====================================================
          SYSTEM INFORMATION
      ====================================================== */}

      <section className="rounded-3xl border border-base-300 bg-base-100 p-5 shadow-sm sm:p-6 lg:p-7">
        <SectionHeading
          icon={<FiHash />}
          title="Registration Information"
          description="System information related to your registration."
        />

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <DetailItem label="Registration ID" value={registrationId} mono />

          <DetailItem
            label="Created At"
            value={
              registration?.createdAt
                ? formatDateTime(registration.createdAt)
                : "N/A"
            }
          />

          <DetailItem
            label="Updated At"
            value={
              registration?.updatedAt
                ? formatDateTime(registration.updatedAt)
                : "N/A"
            }
          />

          <DetailItem
            label="Database ID"
            value={getDatabaseId(registration) || "N/A"}
            mono
          />
        </div>
      </section>

      {/* =====================================================
          FOOTER NOTE
      ====================================================== */}

      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <FiShield className="mt-0.5 shrink-0 text-primary" />

          <div>
            <h3 className="font-semibold text-base-content">
              Registration Security
            </h3>

            <p className="mt-1 text-sm leading-6 text-base-content/60">
              This page only displays the reunion registration associated with
              your currently authenticated account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// PAGE LOADING SKELETON
// =============================================================

const MyRegistrationSkeleton = () => {
  return (
    <div className="space-y-6 pb-10">
      {/* Header */}

      <div className="space-y-3">
        <div className="h-5 w-48 animate-pulse rounded bg-base-300" />

        <div className="h-10 w-72 animate-pulse rounded-lg bg-base-300" />

        <div className="h-5 w-full max-w-2xl animate-pulse rounded bg-base-300" />
      </div>

      {/* Hero */}

      <div className="overflow-hidden rounded-3xl border border-base-300">
        <div className="h-44 animate-pulse bg-base-300" />

        <div className="grid grid-cols-1 gap-px bg-base-300 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((item) => (
            <div key={item} className="h-20 animate-pulse bg-base-100" />
          ))}
        </div>
      </div>

      {/* Sections */}

      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="rounded-3xl border border-base-300 bg-base-100 p-6"
        >
          <div className="h-6 w-48 animate-pulse rounded bg-base-300" />

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((field) => (
              <div
                key={field}
                className="h-20 animate-pulse rounded-xl bg-base-300"
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// =============================================================
// ERROR STATE
// =============================================================

const MyRegistrationError = ({ error, onRetry, onRegister }) => {
  const status = error?.response?.status;

  const errorCode = error?.response?.data?.code;

  const serverMessage =
    error?.response?.data?.message || error?.response?.data?.error || "";

  let title = "Unable to load registration";

  let message =
    serverMessage ||
    "Something went wrong while loading your reunion registration.";

  if (status === 401 || errorCode === "auth/unauthorized") {
    title = "Authentication required";

    message = "Your login session is missing or expired. Please sign in again.";
  }

  if (status === 404 || errorCode === "registration/not-found") {
    title = "No registration found";

    message =
      "We could not find a reunion registration associated with your account.";
  }

  if (status === 500) {
    title = "Server error";

    message =
      serverMessage ||
      "The server could not load your reunion registration. Please try again.";
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-error/10 text-3xl text-error">
          {status === 404 ? (
            <FiUsers aria-hidden="true" />
          ) : (
            <FiAlertCircle aria-hidden="true" />
          )}
        </div>

        <h2 className="mt-5 text-xl font-bold text-base-content sm:text-2xl">
          {title}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/60">
          {message}
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button type="button" onClick={onRetry} className="btn btn-primary">
            <FiRefreshCw />
            Try Again
          </button>

          {(status === 404 || errorCode === "registration/not-found") && (
            <button
              type="button"
              onClick={onRegister}
              className="btn btn-outline"
            >
              Register for Reunion
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================
// NO REGISTRATION
// =============================================================

const NoRegistration = ({ onRegister, onRetry }) => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-3xl border border-base-300 bg-base-100 p-6 text-center shadow-sm sm:p-10">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-4xl text-primary">
          <FiUsers aria-hidden="true" />
        </div>

        <h2 className="mt-6 text-2xl font-bold text-base-content">
          No Reunion Registration Found
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-base-content/60">
          You do not have an active reunion registration associated with your
          account yet.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRegister}
            className="btn btn-primary"
          >
            Register for Reunion
          </button>

          <button type="button" onClick={onRetry} className="btn btn-outline">
            <FiRefreshCw />
            Check Again
          </button>
        </div>
      </div>
    </div>
  );
};

// =============================================================
// PARTICIPANT AVATAR
// =============================================================

const ParticipantAvatar = ({ name, photo, size = "normal" }) => {
  const sizeClass =
    size === "large"
      ? "h-16 w-16 text-xl sm:h-20 sm:w-20 sm:text-2xl"
      : "h-11 w-11 text-base";

  if (photo) {
    return (
      <div className="avatar shrink-0">
        <div
          className={`${sizeClass} overflow-hidden rounded-full bg-base-200`}
        >
          <img
            src={photo}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>
    );
  }

  const firstLetter =
    String(name || "U")
      .trim()
      .charAt(0)
      .toUpperCase() || "U";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary ${sizeClass}`}
      aria-hidden="true"
    >
      {firstLetter}
    </div>
  );
};

// =============================================================
// QUICK INFO
// =============================================================

const QuickInfo = ({ icon, label, value }) => {
  return (
    <div className="flex items-center gap-3 p-4 sm:p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-base-content/45">{label}</p>

        <p className="mt-0.5 truncate text-sm font-semibold text-base-content">
          {value}
        </p>
      </div>
    </div>
  );
};

// =============================================================
// SECTION HEADING
// =============================================================

const SectionHeading = ({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>

      <div className="min-w-0">
        <h2 className="text-lg font-bold text-base-content sm:text-xl">
          {title}
        </h2>

        {description && (
          <p className="mt-0.5 text-sm leading-6 text-base-content/55">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

// =============================================================
// INFO CARD
// =============================================================

const InfoCard = ({ icon, label, value, description }) => {
  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2 text-xs text-base-content/45">
        <span className="text-primary">{icon}</span>

        <span>{label}</span>
      </div>

      <p className="mt-2 break-words text-sm font-semibold text-base-content">
        {value}
      </p>

      {description && (
        <p className="mt-1 break-words text-xs leading-5 text-base-content/50">
          {description}
        </p>
      )}
    </div>
  );
};

// =============================================================
// DETAIL ITEM
// =============================================================

const DetailItem = ({ icon, label, value, mono = false }) => {
  return (
    <div className="min-w-0 rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="flex items-center gap-2 text-xs text-base-content/45">
        {icon && (
          <span className="text-primary" aria-hidden="true">
            {icon}
          </span>
        )}

        <span>{label}</span>
      </div>

      <p
        className={`mt-2 break-words text-sm font-medium text-base-content ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
};

// =============================================================
// STATUS INFO CARD
// =============================================================

const StatusInfoCard = ({ title, value, status }) => {
  const normalized = String(status || "").toLowerCase();

  let wrapperClass = "border-warning/20 bg-warning/5";

  let valueClass = "text-warning";

  let icon = <FiClock />;

  if (
    normalized === "confirmed" ||
    normalized === "paid" ||
    normalized === "checked-in"
  ) {
    wrapperClass = "border-success/20 bg-success/5";
    valueClass = "text-success";
    icon = <FiCheckCircle />;
  }

  if (normalized === "cancelled" || normalized === "failed") {
    wrapperClass = "border-error/20 bg-error/5";
    valueClass = "text-error";
    icon = <FiXCircle />;
  }

  if (normalized === "not-required" || normalized === "not-checked-in") {
    wrapperClass = "border-base-300 bg-base-200/50";
    valueClass = "text-base-content";
    icon = <FiShield />;
  }

  return (
    <div className={`rounded-2xl border p-5 ${wrapperClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-base-content/50">
            {title}
          </p>

          <p className={`mt-2 text-lg font-bold ${valueClass}`}>{value}</p>
        </div>

        <div className={`text-2xl ${valueClass}`}>{icon}</div>
      </div>
    </div>
  );
};

// =============================================================
// GIFT ITEM
// =============================================================

const GiftItem = ({ item }) => {
  let label = item;

  if (typeof item === "object" && item !== null) {
    label =
      item?.name ||
      item?.title ||
      item?.label ||
      item?.giftName ||
      "Commemorative Gift";
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-base-300 bg-base-100 p-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-success/10 text-success">
        <FiGift />
      </div>

      <p className="text-sm font-medium text-base-content">{String(label)}</p>
    </div>
  );
};

// =============================================================
// STATUS BADGE
// =============================================================

const StatusBadge = ({ status }) => {
  const normalized = String(status || "pending").toLowerCase();

  if (normalized === "confirmed") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-semibold text-success">
        <FiCheckCircle aria-hidden="true" />
        Confirmed
      </span>
    );
  }

  if (normalized === "cancelled") {
    return (
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-error/10 px-3 py-1.5 text-xs font-semibold text-error">
        <FiXCircle aria-hidden="true" />
        Cancelled
      </span>
    );
  }

  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-warning/10 px-3 py-1.5 text-xs font-semibold text-warning">
      <FiClock aria-hidden="true" />
      Pending
    </span>
  );
};

// =============================================================
// HELPERS
// =============================================================

const getDatabaseId = (registration) => {
  if (!registration) {
    return "";
  }

  if (registration?._id) {
    if (typeof registration._id === "string") {
      return registration._id;
    }

    if (registration._id?.$oid) {
      return String(registration._id.$oid);
    }
  }

  if (registration?.id) {
    return String(registration.id);
  }

  return "";
};

const formatDate = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleDateString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return date.toLocaleString("en-BD", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatTime = (value) => {
  if (!value) {
    return "N/A";
  }

  const stringValue = String(value);

  // Already something like 09:00 AM
  if (/[a-z]/i.test(stringValue)) {
    return stringValue;
  }

  const parts = stringValue.split(":");

  if (parts.length < 2) {
    return stringValue;
  }

  const hour = Number(parts[0]);
  const minute = Number(parts[1]);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return stringValue;
  }

  const date = new Date();

  date.setHours(hour, minute, 0, 0);

  return date.toLocaleTimeString("en-BD", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatStudentType = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "current") {
    return "Current Student";
  }

  if (normalized === "alumni") {
    return "Alumni";
  }

  return "N/A";
};

const formatDepartment = (value) => {
  const normalized = String(value || "").toLowerCase();

  const labels = {
    science: "Science",
    commerce: "Commerce",
    humanities: "Humanities",
    vocational: "Vocational",
    technical: "Vocational",
  };

  return labels[normalized] || String(value || "General");
};

const formatStatus = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "confirmed") {
    return "Confirmed";
  }

  if (normalized === "cancelled") {
    return "Cancelled";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  return value || "N/A";
};

const formatPaymentStatus = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "not-required") {
    return "Not Required";
  }

  if (normalized === "paid") {
    return "Paid";
  }

  if (normalized === "pending") {
    return "Pending";
  }

  if (normalized === "failed") {
    return "Failed";
  }

  return value || "N/A";
};

const formatAttendanceStatus = (value) => {
  const normalized = String(value || "").toLowerCase();

  if (normalized === "not-checked-in") {
    return "Not Checked In";
  }

  if (normalized === "checked-in") {
    return "Checked In";
  }

  if (normalized === "cancelled") {
    return "Cancelled";
  }

  return value || "N/A";
};

export default MyRegistrations;
