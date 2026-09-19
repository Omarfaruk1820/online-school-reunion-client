import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiGift,
  FiInfo,
  FiLoader,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import { toast } from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import axiosSecure from "../../hooks/axiosSecure";

// ============================================================
// CONSTANTS
// ============================================================

const API_EVENT_URL = "/registrations";

const PHONE_REGEX = /^01[3-9]\d{8}$/;

const CLASS_LEVELS = [
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10" },
];

const STUDENT_TYPES = [
  {
    value: "current",
    label: "Current Student",
    description: "I am currently studying at the school.",
  },
  {
    value: "alumni",
    label: "Alumni / Ex-Student",
    description: "I have completed my school education.",
  },
];

const DEPARTMENTS = [
  {
    value: "science",
    label: "Science",
  },
  {
    value: "commerce",
    label: "Commerce",
  },
  {
    value: "humanities",
    label: "Humanities",
  },
  {
    value: "vocational",
    label: "Vocational / Technical",
  },
];

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const DEFAULT_EVENT = {
  _id: "",
  title: "Grand School Reunion 2027",
  shortTitle: "Grand Reunion 2027",
  edition: "76 Years Celebration",
  eventDate: "2027-02-22",
  startTime: "09:00",
  endTime: "17:00",
  venue: "Our Beloved School Campus",
  registrationOpen: true,
  paymentRequired: false,
  description:
    "Join your classmates, friends, teachers, and alumni for a memorable school reunion.",
  packages: [],
};

// ============================================================
// HELPERS
// ============================================================

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "Date will be announced";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return new Intl.DateTimeFormat("en-BD", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
};

const normalizePackages = (event) => {
  const possiblePackages =
    event?.packages || event?.giftPackages || event?.packageOptions || [];

  if (!Array.isArray(possiblePackages)) {
    return [];
  }

  return possiblePackages.map((item) => ({
    id: item?.id || item?.packageId || item?._id || "",
    name: item?.name || item?.title || "Reunion Package",
    description: item?.description || "Official reunion registration package.",
    items: Array.isArray(item?.items) ? item.items : [],
    price:
      typeof item?.price === "number"
        ? item.price
        : typeof item?.amount === "number"
          ? item.amount
          : null,
    active: item?.active !== false,
  }));
};

const getRegistrationErrorMessage = (error) => {
  const status = error?.response?.status;
  const code = error?.response?.data?.code;
  const message = error?.response?.data?.message;

  if (status === 401 || code === "auth/token-missing") {
    return "Your login session has expired. Please sign in again.";
  }

  if (status === 403) {
    return (
      message || "You are not allowed to submit this reunion registration."
    );
  }

  if (status === 404) {
    return message || "The reunion event could not be found.";
  }

  if (status === 409) {
    return message || "You have already registered for this reunion.";
  }

  if (status === 422) {
    return message || "Please check your registration information.";
  }

  if (status >= 500) {
    return "Server error. Please try again later.";
  }

  return (
    message || error?.message || "Unable to complete reunion registration."
  );
};

// ============================================================
// COMPONENT
// ============================================================

const ReunionRegister = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  // ==========================================================
  // LOCAL STATE
  // ==========================================================

  const [event, setEvent] = useState(DEFAULT_EVENT);
  const [eventLoading, setEventLoading] = useState(true);
  const [eventError, setEventError] = useState("");

  const [submitLoading, setSubmitLoading] = useState(false);

  const [currentStep, setCurrentStep] = useState(1);

  const [registrationComplete, setRegistrationComplete] = useState(false);

  const [registrationResult, setRegistrationResult] = useState(null);

  // ==========================================================
  // FORM
  // ==========================================================

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",

    defaultValues: {
      participantName: "",
      email: "",
      phone: "",
      district: "",
      city: "",

      studentType: "",
      classLevel: "",
      batchYear: "",
      department: "",

      packageId: "",
      tshirtSize: "",

      agreeToRules: false,
    },
  });

  const studentType = watch("studentType");
  const classLevel = watch("classLevel");
  const selectedPackageId = watch("packageId");
  const tshirtSize = watch("tshirtSize");

  const requiresDepartment = classLevel === "9" || classLevel === "10";

  // ==========================================================
  // PACKAGES
  // ==========================================================

  const packages = useMemo(() => {
    const normalized = normalizePackages(event);

    return normalized.filter((item) => item.active !== false);
  }, [event]);

  const selectedPackage = useMemo(() => {
    return packages.find((item) => item.id === selectedPackageId);
  }, [packages, selectedPackageId]);

  // ==========================================================
  // AUTH USER → FORM DEFAULTS
  // ==========================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    // React Hook Form setValue is intentionally avoided here
    // so existing user-entered values are not overwritten.
  }, [user]);

  // ==========================================================
  // LOAD ACTIVE REUNION EVENT
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const loadEvent = async () => {
      setEventLoading(true);
      setEventError("");

      try {
        const response = await axiosSecure.get(API_EVENT_URL);

        if (!mounted) {
          return;
        }

        const eventData = response?.data?.data || response?.data?.event;

        if (!eventData) {
          throw new Error(
            "No active reunion event was returned by the server.",
          );
        }

        setEvent({
          ...DEFAULT_EVENT,
          ...eventData,
        });
      } catch (error) {
        console.error("Failed to load reunion event:", error);

        if (!mounted) {
          return;
        }

        const message =
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load reunion information.";

        setEventError(message);
      } finally {
        if (mounted) {
          setEventLoading(false);
        }
      }
    };

    if (!authLoading && user) {
      loadEvent();
    }

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  // ==========================================================
  // AUTH REDIRECT
  // ==========================================================

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/login", {
        replace: true,
        state: {
          from: {
            pathname: "/reunionregister",
          },
        },
      });
    }
  }, [authLoading, user, navigate]);

  // ==========================================================
  // STEP VALIDATION
  // ==========================================================

  const validateStep = async (step) => {
    if (step === 1) {
      return trigger(["participantName", "email", "phone", "district", "city"]);
    }

    if (step === 2) {
      return trigger([
        "studentType",
        "classLevel",
        "batchYear",
        ...(requiresDepartment ? ["department"] : []),
      ]);
    }

    if (step === 3) {
      return trigger(["packageId", "tshirtSize"]);
    }

    if (step === 4) {
      return trigger(["agreeToRules"]);
    }

    return true;
  };

  const handleNext = async () => {
    const valid = await validateStep(currentStep);

    if (!valid) {
      return;
    }

    setCurrentStep((previous) => Math.min(previous + 1, 4));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handlePrevious = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleRegistration = async (data) => {
    if (submitLoading) {
      return;
    }

    if (!event?._id) {
      toast.error("Reunion event information is unavailable.");
      return;
    }

    if (event.registrationOpen !== true) {
      toast.error("Reunion registration is currently closed.");
      return;
    }

    setSubmitLoading(true);

    try {
      const payload = {
        participantName: data.participantName.trim(),

        // Backend verifies this against Firebase token email.
        email:
          user?.email?.trim().toLowerCase() || data.email.trim().toLowerCase(),

        phone: data.phone.trim(),

        district: data.district.trim(),

        city: data.city.trim(),

        studentType: data.studentType,

        classLevel: data.classLevel,

        batchYear: Number(data.batchYear),

        department: requiresDepartment ? data.department : null,

        eventId: event._id,

        packageId: data.packageId,

        tshirtSize: data.tshirtSize,

        agreeToRules: Boolean(data.agreeToRules),
      };

      const response = await axiosSecure.post(
        "/registrations/register",
        payload,
      );

      const result = response?.data?.data || {};

      setRegistrationResult(result);
      setRegistrationComplete(true);

      toast.success("Your reunion registration was completed successfully!", {
        position: "top-right",
        duration: 4000,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Reunion registration error:", error);

      const message = getRegistrationErrorMessage(error);

      toast.error(message, {
        position: "top-right",
        duration: 5000,
      });

      // If already registered, the user should be able
      // to inspect their existing registration.
      if (error?.response?.status === 409) {
        setTimeout(() => {
          navigate("/dashboard/student");
        }, 1500);
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (authLoading || eventLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
            <FiLoader className="h-6 w-6 animate-spin text-blue-600" />
          </div>

          <h2 className="mt-5 text-lg font-bold text-slate-900">
            Preparing your reunion registration
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Please wait while we load the reunion information.
          </p>
        </div>
      </main>
    );
  }

  // ==========================================================
  // NOT AUTHENTICATED
  // ==========================================================

  if (!user) {
    return null;
  }

  // ==========================================================
  // EVENT ERROR
  // ==========================================================

  if (eventError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-red-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
              <FiInfo className="h-6 w-6" />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Reunion information unavailable
            </h1>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              {eventError}
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try Again
              </button>

              <Link
                to="/"
                className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // REGISTRATION COMPLETE
  // ==========================================================

  if (registrationComplete) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[80vh] max-w-2xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] sm:p-10">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <FiCheckCircle className="h-10 w-10" />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
              Registration Complete
            </p>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
              You're officially registered!
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
              Thank you for registering for the{" "}
              <span className="font-semibold text-slate-700">
                {event.title}
              </span>
              . We look forward to welcoming you back to our beloved school.
            </p>

            {registrationResult?.registrationId && (
              <div className="mx-auto mt-7 max-w-sm rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Registration ID
                </p>

                <p className="mt-2 break-all text-xl font-bold tracking-wide text-slate-900">
                  {registrationResult.registrationId}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Please keep this ID for future reference.
                </p>
              </div>
            )}

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link
                to="/dashboard/student"
                className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Go to Dashboard
                <FiArrowRight />
              </Link>

              <Link
                to="/"
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back to Home
              </Link>
            </div>

            <div className="mt-8 flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left">
              <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

              <p className="text-xs leading-5 text-slate-500">
                Your reunion registration information has been securely
                submitted to the school reunion system.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (
    <main className="min-h-screen bg-slate-50">
      {/* ======================================================
          HERO / EVENT HEADER
      ======================================================= */}

      <section className="relative overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950" />

        <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />

        <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          {/* Top navigation */}

          <div className="flex items-center justify-between">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-white"
            >
              <FiArrowLeft />
              Back to Home
            </Link>

            <div className="hidden items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-xs font-semibold text-emerald-300 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              Registration Open
            </div>
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-blue-200">
                <FiAward />
                {event.edition}
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                {event.description}
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <FiCalendar className="h-5 w-5 shrink-0 text-blue-300" />

                  <div>
                    <p className="text-xs text-slate-400">Reunion Date</p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {formatDate(event.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <FiClock className="h-5 w-5 shrink-0 text-blue-300" />

                  <div>
                    <p className="text-xs text-slate-400">Time</p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {event.startTime} – {event.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <FiMapPin className="h-5 w-5 shrink-0 text-blue-300" />

                  <div>
                    <p className="text-xs text-slate-400">Venue</p>

                    <p className="mt-1 text-sm font-semibold text-white">
                      {event.venue}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="hidden rounded-3xl border border-white/10 bg-white/[0.06] p-6 text-center backdrop-blur lg:block">
              <FiUsers className="mx-auto h-8 w-8 text-blue-300" />

              <p className="mt-3 text-sm font-semibold text-white">
                One School
              </p>

              <p className="mt-1 text-xs text-slate-400">One Family</p>
            </div>
          </div>
        </div>
      </section>

      {/* ======================================================
          MAIN REGISTRATION AREA
      ======================================================= */}

      <section className="px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* =================================================
                FORM
            ================================================== */}

            <div>
              {/* Step Indicator */}

              <div className="mb-7 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((step) => {
                    const active = currentStep === step;
                    const completed = currentStep > step;

                    return (
                      <div key={step} className="relative">
                        <div className="flex items-center">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition ${
                              completed
                                ? "bg-emerald-600 text-white"
                                : active
                                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                  : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {completed ? <FiCheck /> : step}
                          </div>

                          {step !== 4 && (
                            <div
                              className={`mx-2 h-0.5 flex-1 ${
                                currentStep > step
                                  ? "bg-emerald-500"
                                  : "bg-slate-100"
                              }`}
                            />
                          )}
                        </div>

                        <p
                          className={`mt-2 hidden text-xs font-semibold sm:block ${
                            active
                              ? "text-blue-600"
                              : completed
                                ? "text-emerald-600"
                                : "text-slate-400"
                          }`}
                        >
                          {step === 1 && "Personal"}
                          {step === 2 && "School"}
                          {step === 3 && "Package"}
                          {step === 4 && "Confirm"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              <form onSubmit={handleSubmit(handleRegistration)} noValidate>
                {/* =================================================
                    STEP 1
                ================================================== */}

                {currentStep === 1 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <FiUser className="h-6 w-6" />
                      </div>

                      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                        Personal Information
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Confirm your personal information before continuing.
                      </p>
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Name */}

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="participantName"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Full Name
                        </label>

                        <input
                          id="participantName"
                          type="text"
                          autoComplete="name"
                          placeholder="Enter your full name"
                          disabled={submitLoading}
                          defaultValue={user?.name || ""}
                          {...register("participantName", {
                            required: "Full name is required.",
                            minLength: {
                              value: 3,
                              message: "Name must be at least 3 characters.",
                            },
                            maxLength: {
                              value: 100,
                              message: "Name cannot exceed 100 characters.",
                            },
                          })}
                          className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                            errors.participantName
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />

                        {errors.participantName && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.participantName.message}
                          </p>
                        )}
                      </div>

                      {/* Email */}

                      <div>
                        <label
                          htmlFor="email"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Email Address
                        </label>

                        <input
                          id="email"
                          type="email"
                          autoComplete="email"
                          disabled
                          value={user?.email || ""}
                          readOnly
                          className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm text-slate-500 outline-none"
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Your authenticated account email.
                        </p>
                      </div>

                      {/* Phone */}

                      <div>
                        <label
                          htmlFor="phone"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          Phone Number
                        </label>

                        <input
                          id="phone"
                          type="tel"
                          inputMode="numeric"
                          autoComplete="tel"
                          maxLength={11}
                          placeholder="01712345678"
                          disabled={submitLoading}
                          defaultValue={user?.phone || ""}
                          {...register("phone", {
                            required: "Phone number is required.",
                            pattern: {
                              value: PHONE_REGEX,
                              message:
                                "Enter a valid Bangladeshi phone number.",
                            },
                            setValueAs: (value) =>
                              typeof value === "string" ? value.trim() : "",
                          })}
                          className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                            errors.phone
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />

                        {errors.phone && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.phone.message}
                          </p>
                        )}
                      </div>

                      {/* District */}

                      <div>
                        <label
                          htmlFor="district"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          District
                        </label>

                        <input
                          id="district"
                          type="text"
                          placeholder="e.g. Dhaka"
                          disabled={submitLoading}
                          {...register("district", {
                            required: "District is required.",
                            maxLength: {
                              value: 100,
                              message: "District cannot exceed 100 characters.",
                            },
                          })}
                          className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                            errors.district
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />

                        {errors.district && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.district.message}
                          </p>
                        )}
                      </div>

                      {/* City */}

                      <div>
                        <label
                          htmlFor="city"
                          className="mb-2 block text-sm font-semibold text-slate-700"
                        >
                          City / Current Location
                        </label>

                        <input
                          id="city"
                          type="text"
                          placeholder="e.g. Dhaka"
                          disabled={submitLoading}
                          {...register("city", {
                            required: "City / current location is required.",
                            maxLength: {
                              value: 100,
                              message: "City cannot exceed 100 characters.",
                            },
                          })}
                          className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                            errors.city
                              ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        />

                        {errors.city && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.city.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Continue
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    STEP 2
                ================================================== */}

                {currentStep === 2 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                        <FiUsers className="h-6 w-6" />
                      </div>

                      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                        School Information
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Tell us about your relationship with the school.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {/* Student Type */}

                      <div>
                        <label className="mb-3 block text-sm font-semibold text-slate-700">
                          Student Status
                        </label>

                        <div className="grid gap-3 sm:grid-cols-2">
                          {STUDENT_TYPES.map((item) => (
                            <label
                              key={item.value}
                              className={`relative cursor-pointer rounded-2xl border p-4 transition ${
                                studentType === item.value
                                  ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                  : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                value={item.value}
                                className="sr-only"
                                disabled={submitLoading}
                                {...register("studentType", {
                                  required:
                                    "Please select your student status.",
                                })}
                              />

                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                                    studentType === item.value
                                      ? "border-blue-600 bg-blue-600"
                                      : "border-slate-300"
                                  }`}
                                >
                                  {studentType === item.value && (
                                    <span className="h-2 w-2 rounded-full bg-white" />
                                  )}
                                </div>

                                <div>
                                  <p className="text-sm font-bold text-slate-900">
                                    {item.label}
                                  </p>

                                  <p className="mt-1 text-xs leading-5 text-slate-500">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>

                        {errors.studentType && (
                          <p className="mt-2 text-xs font-medium text-red-600">
                            {errors.studentType.message}
                          </p>
                        )}
                      </div>

                      {/* Class + Batch */}

                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <label
                            htmlFor="classLevel"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Class
                          </label>

                          <div className="relative">
                            <select
                              id="classLevel"
                              disabled={submitLoading}
                              {...register("classLevel", {
                                required: "Please select your class.",
                              })}
                              className={`w-full appearance-none rounded-xl border bg-slate-50 px-4 py-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                                errors.classLevel
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                            >
                              <option value="">Select class</option>

                              {CLASS_LEVELS.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>

                            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>

                          {errors.classLevel && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                              {errors.classLevel.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label
                            htmlFor="batchYear"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Batch / Passing Year
                          </label>

                          <input
                            id="batchYear"
                            type="number"
                            min="1950"
                            max="2100"
                            placeholder="e.g. 2020"
                            disabled={submitLoading}
                            {...register("batchYear", {
                              required: "Batch / passing year is required.",
                              valueAsNumber: true,
                              min: {
                                value: 1950,
                                message: "Enter a valid batch year.",
                              },
                              max: {
                                value: 2100,
                                message: "Enter a valid batch year.",
                              },
                            })}
                            className={`w-full rounded-xl border bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                              errors.batchYear
                                ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                            }`}
                          />

                          {errors.batchYear && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                              {errors.batchYear.message}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Department */}

                      {requiresDepartment && (
                        <div>
                          <label
                            htmlFor="department"
                            className="mb-2 block text-sm font-semibold text-slate-700"
                          >
                            Department
                          </label>

                          <div className="relative">
                            <select
                              id="department"
                              disabled={submitLoading}
                              {...register("department", {
                                required: "Please select your department.",
                              })}
                              className={`w-full appearance-none rounded-xl border bg-slate-50 px-4 py-3.5 pr-10 text-sm text-slate-900 outline-none transition focus:bg-white focus:ring-4 ${
                                errors.department
                                  ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                                  : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                              }`}
                            >
                              <option value="">Select department</option>

                              {DEPARTMENTS.map((item) => (
                                <option key={item.value} value={item.value}>
                                  {item.label}
                                </option>
                              ))}
                            </select>

                            <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>

                          <p className="mt-2 text-xs text-slate-400">
                            Department is required for Class 9 and Class 10.
                          </p>

                          {errors.department && (
                            <p className="mt-2 text-xs font-medium text-red-600">
                              {errors.department.message}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiArrowLeft />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Continue
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    STEP 3
                ================================================== */}

                {currentStep === 3 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                        <FiGift className="h-6 w-6" />
                      </div>

                      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                        Reunion Package & T-Shirt
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Choose your reunion package and T-shirt size.
                      </p>
                    </div>

                    {/* Package */}

                    <div>
                      <div className="mb-3 flex items-center justify-between">
                        <label className="block text-sm font-semibold text-slate-700">
                          Reunion Package
                        </label>

                        <span className="text-xs text-slate-400">Required</span>
                      </div>

                      {packages.length > 0 ? (
                        <div className="grid gap-4">
                          {packages.map((item) => {
                            const selected = selectedPackageId === item.id;

                            return (
                              <label
                                key={item.id}
                                className={`cursor-pointer rounded-2xl border p-5 transition ${
                                  selected
                                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                                }`}
                              >
                                <input
                                  type="radio"
                                  value={item.id}
                                  className="sr-only"
                                  disabled={submitLoading}
                                  {...register("packageId", {
                                    required:
                                      "Please select a reunion package.",
                                  })}
                                />

                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex items-start gap-4">
                                    <div
                                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                        selected
                                          ? "bg-blue-600 text-white"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      <FiGift className="h-5 w-5" />
                                    </div>

                                    <div>
                                      <h3 className="font-bold text-slate-900">
                                        {item.name}
                                      </h3>

                                      <p className="mt-1 text-sm leading-6 text-slate-500">
                                        {item.description}
                                      </p>

                                      {item.items.length > 0 && (
                                        <ul className="mt-4 space-y-2">
                                          {item.items.map((gift, index) => (
                                            <li
                                              key={`${item.id}-${index}`}
                                              className="flex items-center gap-2 text-xs text-slate-600"
                                            >
                                              <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                                              {gift}
                                            </li>
                                          ))}
                                        </ul>
                                      )}
                                    </div>
                                  </div>

                                  {selected && (
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                      <FiCheck className="h-4 w-4" />
                                    </div>
                                  )}
                                </div>

                                {item.price !== null && (
                                  <div className="mt-4 border-t border-slate-200 pt-4">
                                    <span className="text-sm font-bold text-slate-900">
                                      ৳{item.price}
                                    </span>
                                  </div>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                          <div className="flex items-start gap-3">
                            <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                            <div>
                              <p className="text-sm font-bold text-amber-800">
                                Reunion package information is not available
                                yet.
                              </p>

                              <p className="mt-1 text-xs leading-5 text-amber-700">
                                Please contact the reunion organizers before
                                submitting your registration.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {errors.packageId && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {errors.packageId.message}
                        </p>
                      )}
                    </div>

                    {/* T-shirt */}

                    <div className="mt-8">
                      <label className="mb-3 block text-sm font-semibold text-slate-700">
                        T-Shirt Size
                      </label>

                      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
                        {TSHIRT_SIZES.map((size) => {
                          const selected = tshirtSize === size;

                          return (
                            <label
                              key={size}
                              className={`cursor-pointer rounded-xl border px-2 py-3 text-center transition ${
                                selected
                                  ? "border-blue-600 bg-blue-600 text-white"
                                  : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                              }`}
                            >
                              <input
                                type="radio"
                                value={size}
                                className="sr-only"
                                disabled={submitLoading}
                                {...register("tshirtSize", {
                                  required: "Please select your T-shirt size.",
                                })}
                              />

                              <span className="text-xs font-bold">{size}</span>
                            </label>
                          );
                        })}
                      </div>

                      {errors.tshirtSize && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {errors.tshirtSize.message}
                        </p>
                      )}
                    </div>

                    {selectedPackage && (
                      <div className="mt-7 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                        <div className="flex items-start gap-3">
                          <FiGift className="mt-0.5 h-5 w-5 text-blue-600" />

                          <div>
                            <p className="text-sm font-bold text-blue-900">
                              Selected Package
                            </p>

                            <p className="mt-1 text-sm text-blue-700">
                              {selectedPackage.name}
                            </p>

                            <p className="mt-1 text-xs text-blue-600">
                              T-Shirt Size:{" "}
                              <span className="font-bold">
                                {tshirtSize || "Not selected"}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        <FiArrowLeft />
                        Back
                      </button>

                      <button
                        type="button"
                        onClick={handleNext}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
                      >
                        Review
                        <FiArrowRight />
                      </button>
                    </div>
                  </div>
                )}

                {/* =================================================
                    STEP 4
                ================================================== */}

                {currentStep === 4 && (
                  <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
                    <div className="mb-8">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                        <FiCheckCircle className="h-6 w-6" />
                      </div>

                      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
                        Review & Confirm
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Please review your information before submitting.
                      </p>
                    </div>

                    {/* Summary */}

                    <div className="space-y-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">
                            Personal Information
                          </h3>

                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-400">Name</p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {getValues("participantName")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Email</p>

                            <p className="mt-1 break-all font-semibold text-slate-800">
                              {user?.email}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Phone</p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {getValues("phone")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Location</p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {getValues("city")}, {getValues("district")}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">
                            School Information
                          </h3>

                          <button
                            type="button"
                            onClick={() => setCurrentStep(2)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-400">
                              Student Status
                            </p>

                            <p className="mt-1 font-semibold capitalize text-slate-800">
                              {getValues("studentType")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">Class</p>

                            <p className="mt-1 font-semibold text-slate-800">
                              Class {getValues("classLevel")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              Batch / Passing Year
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {getValues("batchYear")}
                            </p>
                          </div>

                          {requiresDepartment && (
                            <div>
                              <p className="text-xs text-slate-400">
                                Department
                              </p>

                              <p className="mt-1 font-semibold capitalize text-slate-800">
                                {getValues("department")}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-bold text-slate-900">
                            Reunion Package
                          </h3>

                          <button
                            type="button"
                            onClick={() => setCurrentStep(3)}
                            className="text-xs font-semibold text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                          <div>
                            <p className="text-xs text-slate-400">Package</p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {selectedPackage?.name || getValues("packageId")}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-slate-400">
                              T-Shirt Size
                            </p>

                            <p className="mt-1 font-semibold text-slate-800">
                              {getValues("tshirtSize")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Consent */}

                    <div className="mt-7">
                      <label
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                          errors.agreeToRules
                            ? "border-red-300 bg-red-50"
                            : "border-slate-200 bg-white hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          disabled={submitLoading}
                          {...register("agreeToRules", {
                            required:
                              "You must agree to the reunion rules before submitting.",
                          })}
                          className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          I confirm that the information provided above is
                          accurate and I agree to the reunion registration rules
                          and guidelines.
                        </span>
                      </label>

                      {errors.agreeToRules && (
                        <p className="mt-2 text-xs font-medium text-red-600">
                          {errors.agreeToRules.message}
                        </p>
                      )}
                    </div>

                    {/* Payment notice */}

                    <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                        <div>
                          <p className="text-sm font-bold text-emerald-800">
                            No payment required
                          </p>

                          <p className="mt-1 text-xs leading-5 text-emerald-700">
                            {event.paymentRequired
                              ? "Payment instructions will be provided after registration."
                              : "Your reunion registration does not require an online payment."}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Submit */}

                    <div className="mt-8 flex items-center justify-between gap-3">
                      <button
                        type="button"
                        onClick={handlePrevious}
                        disabled={submitLoading}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <FiArrowLeft />
                        Back
                      </button>

                      <button
                        type="submit"
                        disabled={
                          submitLoading || event.registrationOpen !== true
                        }
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {submitLoading ? (
                          <>
                            <FiLoader className="h-5 w-5 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <FiCheck />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* =================================================
                SIDEBAR
            ================================================== */}

            <aside className="space-y-5">
              {/* Event card */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiCalendar className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Reunion
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-900">
                      {event.shortTitle || event.title}
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <FiCalendar className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                    <div>
                      <p className="text-xs text-slate-400">Date</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {formatDate(event.eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiClock className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                    <div>
                      <p className="text-xs text-slate-400">Time</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {event.startTime} – {event.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />

                    <div>
                      <p className="text-xs text-slate-400">Venue</p>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {event.venue}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gifts */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <FiGift className="h-5 w-5" />
                </div>

                <h3 className="mt-4 text-lg font-bold text-slate-900">
                  Registration Gifts
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Registered students will receive the official reunion
                  commemorative items.
                </p>

                <ul className="mt-5 space-y-3">
                  {[
                    "Commemorative Reunion Bag",
                    "Reunion Mug",
                    "Souvenir Pen",
                    "School Crest",
                    "Official Reunion T-Shirt",
                    "Additional Commemorative Gifts",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Security */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <FiShield className="h-5 w-5" />
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Secure Registration
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Your account identity is verified through Firebase
                      authentication. Reunion registration is securely submitted
                      through the protected backend.
                    </p>
                  </div>
                </div>
              </div>

              {/* Help */}

              <div className="rounded-3xl bg-slate-950 p-6 text-white">
                <FiPhone className="h-5 w-5 text-blue-300" />

                <h3 className="mt-4 text-sm font-bold">Need help?</h3>

                <p className="mt-2 text-xs leading-5 text-slate-400">
                  If you have any problem with your reunion registration, please
                  contact the reunion organizers.
                </p>

                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-blue-300 hover:text-white"
                >
                  Contact Organizers
                  <FiArrowRight />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ReunionRegister;
