import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiGift,
  FiHome,
  FiLoader,
  FiMail,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import axiosSecure from "../../hooks/axiosSecure";

/* =========================================================
   API
========================================================= */

const API_EVENT_URL = "/registrations";

/* =========================================================
   DEFAULT DATA
========================================================= */

const DEFAULT_GIFT_ITEMS = [
  "Commemorative Reunion Bag",
  "Reunion Mug",
  "Souvenir Pen",
  "School Crest",
  "Official Reunion T-Shirt",
  "Additional Commemorative Gifts",
];

const DEFAULT_TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "2XL", "3XL"];

const DEFAULT_CLASS_LEVELS = ["6", "7", "8", "9", "10"];

const DEFAULT_PACKAGES = [
  {
    id: "general",
    packageId: "general",
    name: "General Reunion Package",
    title: "General Reunion Package",
    description:
      "A commemorative reunion package prepared for every registered participant.",
    items: DEFAULT_GIFT_ITEMS,
    pricing: {
      required: false,
      amount: 0,
      currency: "BDT",
    },
    tshirt: {
      included: true,
      required: true,
      sizes: DEFAULT_TSHIRT_SIZES,
    },
    active: true,
  },
];

const DEFAULT_EVENT = {
  _id: "default-reunion-event",

  title: "Grand School Reunion 2027",
  shortTitle: "Grand Reunion 2027",
  edition: "76 Years Celebration",

  eventType: "school-reunion",
  status: "published",

  eventDate: "2027-02-22",
  weekday: "Monday",
  startTime: "09:00",
  endTime: "17:00",
  timezone: "Asia/Dhaka",

  venue: {
    name: "School Campus",
    address: "Our Beloved School Campus",
    city: "Khulna",
    country: "Bangladesh",
  },

  registrationOpen: true,
  registrationDeadline: null,

  paymentRequired: false,

  registration: {
    open: true,
    requiresAuthentication: true,
    requiresPhone: true,
    requiresConsent: true,
    allowMultipleRegistrations: false,
  },

  qrCode: {
    enabled: true,
    purpose: "attendance",
    version: 1,
  },

  capacity: {
    enabled: false,
    maximum: null,
    reserved: 0,
  },

  payment: {
    required: false,
    currency: "BDT",
    amount: 0,
    status: "not-required",
  },

  gifts: {
    included: true,
    items: DEFAULT_GIFT_ITEMS,
  },

  eligibility: {
    studentTypes: ["current", "alumni"],
    classLevels: DEFAULT_CLASS_LEVELS,
    departments: ["science", "commerce", "humanities", "vocational"],
  },

  features: {
    registration: true,
    giftDistribution: true,
    attendanceTracking: true,
    schedule: true,
    gallery: true,
    announcements: true,
    sponsors: true,
  },
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object") {
    if (value.$oid) {
      return String(value.$oid);
    }

    if (value._id) {
      return normalizeId(value._id);
    }

    if (value.id) {
      return normalizeId(value.id);
    }
  }

  return String(value);
};

const normalizeVenue = (venue) => {
  if (!venue) {
    return DEFAULT_EVENT.venue;
  }

  if (typeof venue === "string") {
    return {
      name: venue,
      address: venue,
      city: "",
      country: "",
    };
  }

  return {
    name: venue.name || "School Campus",
    address: venue.address || "",
    city: venue.city || "",
    country: venue.country || "",
  };
};

const formatVenue = (venue) => {
  const normalized = normalizeVenue(venue);

  return [
    normalized.name,
    normalized.address,
    normalized.city,
    normalized.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const normalizeGiftItem = (item) => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    return item.name || item.title || item.label || item.item || "";
  }

  return "";
};

const normalizePackages = (packages) => {
  if (!Array.isArray(packages) || packages.length === 0) {
    return DEFAULT_PACKAGES;
  }

  const normalized = packages
    .map((pkg) => {
      if (!pkg || typeof pkg !== "object") {
        return null;
      }

      const packageId = pkg.packageId || pkg.id || normalizeId(pkg._id);

      if (!packageId) {
        return null;
      }

      const sizes =
        Array.isArray(pkg.tshirt?.sizes) && pkg.tshirt.sizes.length > 0
          ? pkg.tshirt.sizes.map(String)
          : DEFAULT_TSHIRT_SIZES;

      return {
        ...pkg,

        id: String(packageId),
        packageId: String(packageId),

        name: pkg.name || pkg.title || "General Reunion Package",

        title: pkg.title || pkg.name || "General Reunion Package",

        description: pkg.description || "Commemorative reunion package.",

        items:
          Array.isArray(pkg.items) && pkg.items.length > 0
            ? pkg.items.map(normalizeGiftItem).filter(Boolean)
            : DEFAULT_GIFT_ITEMS,

        pricing: {
          required: Boolean(pkg.pricing?.required),
          amount: Number(pkg.pricing?.amount || 0),
          currency: pkg.pricing?.currency || "BDT",
        },

        tshirt: {
          included: pkg.tshirt?.included !== false,

          required: pkg.tshirt?.required !== false,

          sizes,
        },

        active: pkg.active !== false,
      };
    })
    .filter(Boolean)
    .filter((pkg) => pkg.active !== false);

  return normalized.length > 0 ? normalized : DEFAULT_PACKAGES;
};

const normalizeEvent = (event) => {
  if (!event || typeof event !== "object") {
    return DEFAULT_EVENT;
  }

  return {
    ...DEFAULT_EVENT,
    ...event,

    _id: event._id || event.id || DEFAULT_EVENT._id,

    venue: normalizeVenue(event.venue),

    registration: {
      ...DEFAULT_EVENT.registration,
      ...(event.registration || {}),
    },

    payment: {
      ...DEFAULT_EVENT.payment,
      ...(event.payment || {}),
    },

    gifts: {
      ...DEFAULT_EVENT.gifts,
      ...(event.gifts || {}),

      items:
        Array.isArray(event.gifts?.items) && event.gifts.items.length > 0
          ? event.gifts.items.map(normalizeGiftItem).filter(Boolean)
          : DEFAULT_GIFT_ITEMS,
    },

    eligibility: {
      ...DEFAULT_EVENT.eligibility,
      ...(event.eligibility || {}),
    },

    capacity: {
      ...DEFAULT_EVENT.capacity,
      ...(event.capacity || {}),
    },

    features: {
      ...DEFAULT_EVENT.features,
      ...(event.features || {}),
    },
  };
};

const formatEventDate = (dateString) => {
  if (!dateString) {
    return "22 February 2027";
  }

  try {
    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }).format(new Date(`${dateString}T00:00:00`));
  } catch {
    return dateString;
  }
};

const formatPrice = (pricing) => {
  if (!pricing || !pricing.required) {
    return "Free";
  }

  const amount = Number(pricing.amount || 0);

  const currency = pricing.currency || "BDT";

  return `${currency} ${amount.toLocaleString()}`;
};

const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const extractEventFromResponse = (responseData) => {
  if (!responseData) {
    return null;
  }

  return (
    responseData.event ||
    responseData.data?.event ||
    responseData.data ||
    responseData
  );
};

const extractPackagesFromResponse = (responseData) => {
  if (!responseData) {
    return [];
  }

  return (
    responseData.packages ||
    responseData.data?.packages ||
    responseData.giftPackages ||
    responseData.data?.giftPackages ||
    []
  );
};

const extractRegistrationFromResponse = (responseData) => {
  if (!responseData) {
    return null;
  }

  return (
    responseData.registration ||
    responseData.data?.registration ||
    responseData.data ||
    responseData
  );
};

/* =========================================================
   COMPONENT
========================================================= */

const ReunionRegister = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);
  const [submittedRegistration, setSubmittedRegistration] = useState(null);

  /* =======================================================
     FORM
  ======================================================= */

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",

    defaultValues: {
      studentType: "alumni",

      name: "",
      email: "",
      phone: "",

      classLevel: "",
      batchYear: "",
      department: "",

      district: "",
      city: "",

      tShirtSize: "L",

      packageId: "general",

      agreeToRules: false,
    },
  });

  const studentType = watch("studentType");

  const classLevel = watch("classLevel");

  const selectedPackageId = watch("packageId");

  const tShirtSize = watch("tShirtSize");

  const agreeToRules = watch("agreeToRules");

  const isSeniorClass = classLevel === "9" || classLevel === "10";

  /* =======================================================
     EVENT QUERY
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
      const response = await axiosSecure.get(API_EVENT_URL);

      return response.data;
    },

    enabled: !authLoading && Boolean(user),

    retry: 1,
  });

  /* =======================================================
     NORMALIZED EVENT
  ======================================================= */

  const event = useMemo(() => {
    const serverEvent = extractEventFromResponse(eventResponse);

    return normalizeEvent(serverEvent);
  }, [eventResponse]);

  /* =======================================================
     EVENT ID
  ======================================================= */

  const eventId = useMemo(() => {
    return normalizeId(event?._id || event?.id);
  }, [event]);

  /* =======================================================
     EVENT GIFT ITEMS
  ======================================================= */

  const eventGiftItems = useMemo(() => {
    if (Array.isArray(event?.gifts?.items) && event.gifts.items.length > 0) {
      return event.gifts.items.map(normalizeGiftItem).filter(Boolean);
    }

    return DEFAULT_GIFT_ITEMS;
  }, [event]);

  /* =======================================================
     PACKAGES
  ======================================================= */

  const packages = useMemo(() => {
    return normalizePackages(extractPackagesFromResponse(eventResponse));
  }, [eventResponse]);

  /* =======================================================
     SELECTED PACKAGE
  ======================================================= */

  const selectedPackage = useMemo(() => {
    return (
      packages.find(
        (pkg) =>
          pkg.packageId === selectedPackageId || pkg.id === selectedPackageId,
      ) ||
      packages[0] ||
      DEFAULT_PACKAGES[0]
    );
  }, [packages, selectedPackageId]);

  /* =======================================================
     SELECTED PACKAGE SIZES
  ======================================================= */

  const selectedTshirtSizes = useMemo(() => {
    if (
      Array.isArray(selectedPackage?.tshirt?.sizes) &&
      selectedPackage.tshirt.sizes.length > 0
    ) {
      return selectedPackage.tshirt.sizes;
    }

    return DEFAULT_TSHIRT_SIZES;
  }, [selectedPackage]);

  /* =======================================================
     KEEP T-SHIRT SIZE VALID
  ======================================================= */

  useEffect(() => {
    if (!selectedTshirtSizes.includes(tShirtSize)) {
      setValue("tShirtSize", selectedTshirtSizes[0] || "L", {
        shouldValidate: true,
      });
    }
  }, [selectedTshirtSizes, tShirtSize, setValue]);

  /* =======================================================
     REGISTRATION STATUS
  ======================================================= */

  const registrationDeadlinePassed = Boolean(
    event.registrationDeadline &&
    new Date(`${event.registrationDeadline}T23:59:59`).getTime() < Date.now(),
  );

  const isRegistrationOpen =
    event.registrationOpen !== false &&
    event.registration?.open !== false &&
    event.status !== "cancelled" &&
    event.status !== "archived" &&
    !registrationDeadlinePassed;

  /* =======================================================
     USER DATA -> FORM
  ======================================================= */

  useEffect(() => {
    if (!user) {
      return;
    }

    const currentValues = getValues();

    if (!currentValues.name && (user.displayName || user.name)) {
      setValue("name", user.displayName || user.name || "", {
        shouldValidate: true,
      });
    }

    if (!currentValues.email && user.email) {
      setValue("email", user.email, {
        shouldValidate: true,
      });
    }

    if (!currentValues.phone && (user.phoneNumber || user.phone)) {
      setValue("phone", user.phoneNumber || user.phone || "", {
        shouldValidate: true,
      });
    }
  }, [user, getValues, setValue]);

  /* =======================================================
     AUTH REDIRECT
  ======================================================= */

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      toast.error("Please login before registering for the reunion.");

      navigate("/login", {
        replace: true,
        state: {
          from: "/reunion-register",
        },
      });
    }
  }, [user, authLoading, navigate]);

  /* =======================================================
     SUBMIT MUTATION
  ======================================================= */

  const registrationMutation = useMutation({
    mutationFn: async (formData) => {
      if (!eventId) {
        throw new Error("Reunion event ID is missing.");
      }

      if (!user?.email) {
        throw new Error("Authenticated user email is missing.");
      }

      if (
        formData.email.trim().toLowerCase() !== user.email.trim().toLowerCase()
      ) {
        throw new Error(
          "Registration email must match your logged-in account.",
        );
      }

      if (!selectedPackage?.packageId) {
        throw new Error("Please select a valid reunion package.");
      }

      if (!selectedTshirtSizes.includes(formData.tShirtSize)) {
        throw new Error("Please select a valid T-shirt size.");
      }

      /* =================================================
           IMPORTANT SERVER CONTRACT

           Backend expects:

           reunion: {
             eventId,
             packageId,
             tShirt: {
               size
             }
           }

           NOT:

           reunion: {
             eventId,
             packageId,
             tShirtSize
           }
        ================================================= */

      const payload = {
        participant: {
          studentType: formData.studentType,

          name: formData.name.trim(),

          email: formData.email.trim().toLowerCase(),

          phone: formData.phone.trim(),
        },

        schoolInfo: {
          classLevel: formData.classLevel,

          batchYear: Number(formData.batchYear),

          department: isSeniorClass ? formData.department : null,

          district: formData.district.trim(),

          city: formData.city.trim(),
        },

        reunion: {
          eventId,

          packageId: formData.packageId,

          tShirt: {
            size: formData.tShirtSize,
          },
        },

        consent: {
          agreedToRules: Boolean(formData.agreeToRules),

          agreedAt: new Date().toISOString(),
        },
      };

      const response = await axiosSecure.post(
        `${API_EVENT_URL}/register`,
        payload,
      );

      return response.data;
    },

    onSuccess: (data) => {
      const registration = extractRegistrationFromResponse(data);

      setSubmittedRegistration(registration);

      toast.success("Your reunion registration was completed successfully!");

      setStep(4);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    onError: (error) => {
      const status = error?.response?.status;

      const code = error?.response?.data?.code;

      if (status === 401) {
        toast.error("Your login session has expired. Please login again.");

        navigate("/login", {
          replace: true,
          state: {
            from: "/reunion-register",
          },
        });

        return;
      }

      if (status === 409 || code === "reunion/already-registered") {
        toast.error("You are already registered for this reunion.");

        return;
      }

      if (status === 403 || code === "reunion/registration-closed") {
        toast.error("Reunion registration is currently closed.");

        return;
      }

      if (status === 400) {
        toast.error(getApiErrorMessage(error));

        return;
      }

      toast.error(getApiErrorMessage(error));
    },
  });

  /* =======================================================
     NEXT STEP
  ======================================================= */

  const handleNextStep = async () => {
    if (step === 1) {
      const valid = await trigger(["studentType", "name", "email", "phone"]);

      if (!valid) {
        toast.error("Please complete your personal information.");

        return;
      }

      const currentEmail = getValues("email")?.trim().toLowerCase();

      const authenticatedEmail = user?.email?.trim().toLowerCase();

      if (authenticatedEmail && currentEmail !== authenticatedEmail) {
        setValue("email", user.email, {
          shouldValidate: true,
        });

        toast.error("Email must match your logged-in account.");

        return;
      }

      setStep(2);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 2) {
      const fields = ["classLevel", "batchYear", "district", "city"];

      if (isSeniorClass) {
        fields.push("department");
      }

      const valid = await trigger(fields);

      if (!valid) {
        toast.error("Please complete your school information.");

        return;
      }

      setStep(3);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     PREVIOUS STEP
  ======================================================= */

  const handlePreviousStep = () => {
    if (step > 1) {
      setStep((current) => current - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /* =======================================================
     FINAL SUBMIT
  ======================================================= */

  const onSubmit = async (data) => {
    if (step !== 3) {
      return;
    }

    const valid = await trigger(["packageId", "tShirtSize", "agreeToRules"]);

    if (!valid) {
      toast.error("Please complete the reunion package and consent section.");

      return;
    }

    if (!data.agreeToRules) {
      toast.error("Please agree to the reunion rules and confirmation.");

      return;
    }

    if (!eventId) {
      toast.error(
        "Reunion event information is missing. Please reload the page.",
      );

      return;
    }

    if (!isRegistrationOpen) {
      toast.error("Reunion registration is currently closed.");

      return;
    }

    registrationMutation.mutate(data);
  };

  /* =======================================================
     LOADING
  ======================================================= */

  if (authLoading || (eventLoading && user)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
            <FiLoader className="h-7 w-7 animate-spin text-blue-600" />
          </div>

          <h2 className="text-xl font-bold text-slate-800">
            Loading Reunion Registration
          </h2>

          <p className="mt-2 text-sm text-slate-500">Please wait a moment...</p>
        </div>
      </div>
    );
  }

  /* =======================================================
     EVENT ERROR
  ======================================================= */

  if (eventError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 text-center shadow-sm border border-slate-200">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <FiCalendar className="h-8 w-8 text-red-600" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Unable to Load Reunion
          </h2>

          <p className="mt-3 text-slate-600">
            {getApiErrorMessage(eventQueryError)}
          </p>

          <button
            type="button"
            onClick={() => refetchEvent()}
            className="mt-6 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     REGISTRATION CLOSED
  ======================================================= */

  if (!isRegistrationOpen) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl bg-white p-8 text-center shadow-sm border border-slate-200 md:p-12">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100">
              <FiCalendar className="h-10 w-10 text-amber-600" />
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900">
              Registration Is Closed
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-slate-600">
              Registration for <strong>{event.title}</strong> is currently
              closed.
            </p>

            {event.registrationDeadline && (
              <p className="mt-3 text-sm text-slate-500">
                Registration deadline:{" "}
                {formatEventDate(event.registrationDeadline)}
              </p>
            )}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-8 rounded-xl bg-blue-600 px-7 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* =======================================================
     SUCCESS SCREEN
  ======================================================= */

  if (step === 4) {
    const registrationId =
      submittedRegistration?.registrationId ||
      submittedRegistration?.id ||
      normalizeId(submittedRegistration?._id) ||
      "";

    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-200">
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 px-6 py-10 text-center text-white md:px-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/20">
                <FiCheckCircle className="h-12 w-12" />
              </div>

              <h1 className="text-3xl font-extrabold md:text-4xl">
                Registration Successful!
              </h1>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-emerald-50 md:text-base">
                Thank you for registering for the {event.title}.
              </p>
            </div>

            <div className="p-6 md:p-10">
              {registrationId && (
                <div className="mb-8 rounded-2xl border border-blue-100 bg-blue-50 p-5 text-center">
                  <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                    Registration ID
                  </p>

                  <p className="mt-2 break-all text-xl font-extrabold text-blue-900">
                    {registrationId}
                  </p>
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 p-5">
                  <FiCalendar className="mb-3 h-6 w-6 text-blue-600" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event Date
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatEventDate(event.eventDate)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <FiClock className="mb-3 h-6 w-6 text-blue-600" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event Time
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {event.startTime} - {event.endTime}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <FiMapPin className="mb-3 h-6 w-6 text-blue-600" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Venue
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {formatVenue(event.venue)}
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200 p-5">
                  <FiGift className="mb-3 h-6 w-6 text-blue-600" />

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Reunion Package
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {selectedPackage.name}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl bg-slate-50 p-5">
                <div className="flex items-start gap-3">
                  <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                  <div>
                    <h3 className="font-bold text-slate-900">What's next?</h3>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Please keep your registration ID safe. Your registration
                      will be used for reunion attendance and gift distribution.
                      If QR attendance is enabled, your QR code will be
                      associated with your registration.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/student")}
                  className="flex-1 rounded-xl bg-blue-600 px-6 py-3.5 font-semibold text-white transition hover:bg-blue-700"
                >
                  Go to Dashboard
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="flex-1 rounded-xl border border-slate-300 bg-white px-6 py-3.5 font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Back to Home
                </button>
              </div>
            </div>
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
      {/* ===================================================
          HEADER
      =================================================== */}

      <section className="relative overflow-hidden bg-slate-950 px-4 py-12 text-white md:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.35),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.2),transparent_35%)]" />

        <div className="relative mx-auto max-w-7xl">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-7 inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
          >
            <FiArrowLeft />
            Back
          </button>

          <div className="max-w-3xl">
            <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-300">
              {event.edition}
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">
              {event.title}
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Register now and become part of our special school reunion
              celebration.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <FiCalendar className="text-blue-300" />
                {formatEventDate(event.eventDate)}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <FiClock className="text-blue-300" />
                {event.startTime} - {event.endTime}
              </div>

              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-slate-200">
                <FiMapPin className="text-blue-300" />
                {event.venue?.name || "School Campus"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          CONTENT
      =================================================== */}

      <main className="mx-auto max-w-7xl px-4 py-8 md:py-12">
        {/* =================================================
            STEPPER
        ================================================= */}

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-6">
          <div className="grid grid-cols-3 gap-2 md:gap-6">
            {[
              {
                number: 1,
                label: "Personal",
              },
              {
                number: 2,
                label: "School",
              },
              {
                number: 3,
                label: "Confirmation",
              },
            ].map((item) => {
              const active = step === item.number;

              const completed = step > item.number;

              return (
                <div
                  key={item.number}
                  className="flex items-center gap-2 md:gap-3"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      completed
                        ? "bg-emerald-600 text-white"
                        : active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {completed ? <FiCheck /> : item.number}
                  </div>

                  <div className="hidden sm:block">
                    <p
                      className={`text-sm font-bold ${
                        active || completed
                          ? "text-slate-900"
                          : "text-slate-400"
                      }`}
                    >
                      {item.label}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* =================================================
              FORM
          ================================================= */}

          <form onSubmit={handleSubmit(onSubmit)} className="min-w-0">
            {/* =============================================
                STEP 1
            ============================================= */}

            {step === 1 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                      <FiUser className="h-6 w-6 text-blue-600" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Personal Information
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Tell us a little about yourself.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6 md:p-8">
                  {/* Student Type */}

                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700">
                      You are registering as
                    </label>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <label
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          studentType === "current"
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value="current"
                          {...register("studentType", {
                            required: "Please select your student type.",
                          })}
                          className="sr-only"
                        />

                        <div className="flex items-center gap-3">
                          <FiUsers className="h-5 w-5 text-blue-600" />

                          <div>
                            <p className="font-bold text-slate-900">
                              Current Student
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              Currently studying at the school
                            </p>
                          </div>
                        </div>
                      </label>

                      <label
                        className={`cursor-pointer rounded-2xl border p-4 transition ${
                          studentType === "alumni"
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                            : "border-slate-200 hover:border-blue-300"
                        }`}
                      >
                        <input
                          type="radio"
                          value="alumni"
                          {...register("studentType", {
                            required: "Please select your student type.",
                          })}
                          className="sr-only"
                        />

                        <div className="flex items-center gap-3">
                          <FiUsers className="h-5 w-5 text-blue-600" />

                          <div>
                            <p className="font-bold text-slate-900">Alumni</p>

                            <p className="mt-1 text-xs text-slate-500">
                              Former student of the school
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>

                    {errors.studentType && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.studentType.message}
                      </p>
                    )}
                  </div>

                  {/* Name */}

                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Full Name
                    </label>

                    <div className="relative">
                      <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        id="name"
                        type="text"
                        {...register("name", {
                          required: "Full name is required.",
                          minLength: {
                            value: 2,
                            message: "Name must contain at least 2 characters.",
                          },
                        })}
                        placeholder="Enter your full name"
                        className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 outline-none transition focus:ring-2 ${
                          errors.name
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                    </div>

                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Email Address
                    </label>

                    <div className="relative">
                      <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        id="email"
                        type="email"
                        {...register("email", {
                          required: "Email address is required.",

                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address.",
                          },
                        })}
                        placeholder="you@example.com"
                        className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 outline-none transition focus:ring-2 ${
                          errors.email
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.email.message}
                      </p>
                    )}

                    {user?.email && (
                      <p className="mt-2 text-xs text-slate-500">
                        Registration email: {user.email}
                      </p>
                    )}
                  </div>

                  {/* Phone */}

                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Phone Number
                    </label>

                    <div className="relative">
                      <FiPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

                      <input
                        id="phone"
                        type="tel"
                        {...register("phone", {
                          required: "Phone number is required.",

                          pattern: {
                            value: /^01[3-9]\d{8}$/,
                            message:
                              "Enter a valid Bangladesh mobile number, e.g. 01712345678.",
                          },
                        })}
                        placeholder="01712345678"
                        inputMode="numeric"
                        maxLength={11}
                        className={`w-full rounded-xl border bg-white py-3.5 pl-11 pr-4 outline-none transition focus:ring-2 ${
                          errors.phone
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />
                    </div>

                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.phone.message}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                      Use your active Bangladesh mobile number.
                    </p>
                  </div>
                </div>

                <div className="flex justify-end border-t border-slate-200 bg-slate-50 p-5 md:p-6">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
                  >
                    Continue
                    <FiArrowRight />
                  </button>
                </div>
              </section>
            )}

            {/* =============================================
                STEP 2
            ============================================= */}

            {step === 2 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                      <FiHome className="h-6 w-6 text-indigo-600" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        School Information
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Provide your school class and batch information.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 p-6 md:p-8">
                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Class */}

                    <div>
                      <label
                        htmlFor="classLevel"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Class
                      </label>

                      <div className="relative">
                        <select
                          id="classLevel"
                          {...register("classLevel", {
                            required: "Please select your class.",
                          })}
                          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 outline-none transition focus:ring-2 ${
                            errors.classLevel
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        >
                          <option value="">Select class</option>

                          {(event.eligibility?.classLevels?.length
                            ? event.eligibility.classLevels
                            : DEFAULT_CLASS_LEVELS
                          ).map((level) => (
                            <option key={level} value={String(level)}>
                              Class {level}
                            </option>
                          ))}
                        </select>

                        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>

                      {errors.classLevel && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.classLevel.message}
                        </p>
                      )}
                    </div>

                    {/* Batch */}

                    <div>
                      <label
                        htmlFor="batchYear"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Batch / Passing Year
                      </label>

                      <input
                        id="batchYear"
                        type="number"
                        {...register("batchYear", {
                          required: "Batch year is required.",

                          min: {
                            value: 1950,
                            message: "Please enter a valid batch year.",
                          },

                          max: {
                            value: 2100,
                            message: "Please enter a valid batch year.",
                          },
                        })}
                        placeholder="e.g. 2015"
                        className={`w-full rounded-xl border bg-white px-4 py-3.5 outline-none transition focus:ring-2 ${
                          errors.batchYear
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />

                      {errors.batchYear && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.batchYear.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Department */}

                  {isSeniorClass && (
                    <div>
                      <label
                        htmlFor="department"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Department
                        <span className="ml-1 text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <select
                          id="department"
                          {...register("department", {
                            required:
                              "Department is required for Class 9 and 10.",
                          })}
                          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 outline-none transition focus:ring-2 ${
                            errors.department
                              ? "border-red-400 focus:ring-red-100"
                              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                          }`}
                        >
                          <option value="">Select department</option>

                          <option value="science">Science</option>

                          <option value="commerce">Commerce</option>

                          <option value="humanities">Humanities</option>

                          <option value="vocational">
                            Vocational / Technical
                          </option>
                        </select>

                        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      </div>

                      {errors.department && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.department.message}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Location */}

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label
                        htmlFor="district"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        District
                      </label>

                      <input
                        id="district"
                        type="text"
                        {...register("district", {
                          required: "District is required.",
                        })}
                        placeholder="e.g. Khulna"
                        className={`w-full rounded-xl border bg-white px-4 py-3.5 outline-none transition focus:ring-2 ${
                          errors.district
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />

                      {errors.district && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.district.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        City / Area
                      </label>

                      <input
                        id="city"
                        type="text"
                        {...register("city", {
                          required: "City or area is required.",
                        })}
                        placeholder="e.g. Khulna City"
                        className={`w-full rounded-xl border bg-white px-4 py-3.5 outline-none transition focus:ring-2 ${
                          errors.city
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      />

                      {errors.city && (
                        <p className="mt-2 text-sm text-red-600">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5 md:p-6">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiArrowLeft />
                    Back
                  </button>

                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white transition hover:bg-blue-700"
                  >
                    Continue
                    <FiArrowRight />
                  </button>
                </div>
              </section>
            )}

            {/* =============================================
                STEP 3
            ============================================= */}

            {step === 3 && (
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-6 md:p-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                      <FiGift className="h-6 w-6 text-emerald-600" />
                    </div>

                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Reunion Package & Confirmation
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Choose your T-shirt size and confirm your registration.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-7 p-6 md:p-8">
                  {/* Package */}

                  <div>
                    <label className="mb-3 block text-sm font-bold text-slate-700">
                      Reunion Package
                    </label>

                    <div className="grid gap-4">
                      {packages.map((pkg) => {
                        const packageId = pkg.packageId || pkg.id;

                        const selected = selectedPackageId === packageId;

                        return (
                          <label
                            key={packageId}
                            className={`cursor-pointer rounded-2xl border p-5 transition ${
                              selected
                                ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                                : "border-slate-200 hover:border-blue-300"
                            }`}
                          >
                            <input
                              type="radio"
                              value={packageId}
                              {...register("packageId", {
                                required: "Please select a reunion package.",
                              })}
                              className="sr-only"
                            />

                            <div className="flex items-start justify-between gap-4">
                              <div className="flex min-w-0 items-start gap-4">
                                <div
                                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                    selected
                                      ? "bg-blue-600 text-white"
                                      : "bg-slate-100 text-slate-500"
                                  }`}
                                >
                                  <FiPackage className="h-5 w-5" />
                                </div>

                                <div className="min-w-0">
                                  <h3 className="font-extrabold text-slate-900">
                                    {pkg.name}
                                  </h3>

                                  <p className="mt-1 text-sm leading-6 text-slate-500">
                                    {pkg.description}
                                  </p>

                                  <p className="mt-2 text-sm font-bold text-emerald-600">
                                    {formatPrice(pkg.pricing)}
                                  </p>
                                </div>
                              </div>

                              <div
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                                  selected
                                    ? "border-blue-600 bg-blue-600 text-white"
                                    : "border-slate-300"
                                }`}
                              >
                                {selected && <FiCheck className="h-4 w-4" />}
                              </div>
                            </div>

                            {Array.isArray(pkg.items) &&
                              pkg.items.length > 0 && (
                                <div className="mt-5 grid gap-2 sm:grid-cols-2">
                                  {pkg.items.map((item, index) => (
                                    <div
                                      key={`${packageId}-${index}`}
                                      className="flex items-center gap-2 text-sm text-slate-600"
                                    >
                                      <FiCheckCircle className="h-4 w-4 shrink-0 text-emerald-500" />

                                      <span>{normalizeGiftItem(item)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                          </label>
                        );
                      })}
                    </div>

                    {errors.packageId && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.packageId.message}
                      </p>
                    )}
                  </div>

                  {/* T-shirt */}

                  <div>
                    <label
                      htmlFor="tShirtSize"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      T-Shirt Size
                    </label>

                    <div className="relative">
                      <select
                        id="tShirtSize"
                        {...register("tShirtSize", {
                          required: "T-shirt size is required.",
                        })}
                        className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 outline-none transition focus:ring-2 ${
                          errors.tShirtSize
                            ? "border-red-400 focus:ring-red-100"
                            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                        }`}
                      >
                        {selectedTshirtSizes.map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>

                      <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>

                    {errors.tShirtSize && (
                      <p className="mt-2 text-sm text-red-600">
                        {errors.tShirtSize.message}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-slate-500">
                      Please choose carefully because the T-shirt will be
                      prepared according to your selected size.
                    </p>
                  </div>

                  {/* Event Gifts */}

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm">
                        <FiGift className="h-5 w-5 text-blue-600" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-slate-900">
                          Registration Gifts
                        </h3>

                        <p className="text-xs text-slate-500">
                          Included with your reunion registration
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      {eventGiftItems.map((item, index) => (
                        <div
                          key={`event-gift-${index}`}
                          className="flex items-start gap-3 rounded-xl bg-white p-3"
                        >
                          <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                          <span className="text-sm font-medium text-slate-700">
                            {normalizeGiftItem(item)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Consent */}

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                      agreeToRules
                        ? "border-emerald-500 bg-emerald-50"
                        : errors.agreeToRules
                          ? "border-red-400 bg-red-50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      {...register("agreeToRules", {
                        required: "You must agree before registering.",
                      })}
                      className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />

                    <div>
                      <p className="font-bold text-slate-900">
                        I confirm my registration
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        I confirm that the information provided above is correct
                        and I agree to follow the reunion rules and
                        instructions.
                      </p>
                    </div>
                  </label>

                  {errors.agreeToRules && (
                    <p className="-mt-4 text-sm text-red-600">
                      {errors.agreeToRules.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 p-5 md:p-6">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    disabled={registrationMutation.isPending}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiArrowLeft />
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={registrationMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <FiLoader className="h-5 w-5 animate-spin" />
                        Registering...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />
                        Complete Registration
                      </>
                    )}
                  </button>
                </div>
              </section>
            )}
          </form>

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {/* Event Summary */}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="bg-slate-900 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-300">
                  Reunion Details
                </p>

                <h2 className="mt-2 text-xl font-extrabold">
                  {event.shortTitle || event.title}
                </h2>
              </div>

              <div className="space-y-5 p-6">
                <div className="flex items-start gap-3">
                  <FiCalendar className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Date
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {formatEventDate(event.eventDate)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiClock className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Time
                    </p>

                    <p className="mt-1 text-sm font-bold text-slate-800">
                      {event.startTime} - {event.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <FiMapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Venue
                    </p>

                    <p className="mt-1 text-sm font-bold leading-6 text-slate-800">
                      {formatVenue(event.venue)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Selected Package */}

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100">
                  <FiPackage className="h-5 w-5 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                    Selected Package
                  </p>

                  <h3 className="mt-1 font-extrabold text-slate-900">
                    {selectedPackage.name}
                  </h3>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {Array.isArray(selectedPackage.items) &&
                  selectedPackage.items.map((item, index) => (
                    <div
                      key={`selected-package-item-${index}`}
                      className="flex items-start gap-2"
                    >
                      <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                      <span className="text-sm text-slate-600">
                        {normalizeGiftItem(item)}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Package Price</span>

                  <span className="font-extrabold text-emerald-600">
                    {formatPrice(selectedPackage.pricing)}
                  </span>
                </div>
              </div>
            </div>

            {/* Security */}

            <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                  <FiShield className="h-5 w-5 text-emerald-600" />
                </div>

                <div>
                  <h3 className="font-extrabold text-slate-900">
                    Secure Registration
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your registration is connected to your authenticated
                    account. Your personal information is handled securely.
                  </p>
                </div>
              </div>
            </div>

            {/* QR */}

            {event.qrCode?.enabled && (
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white">
                    <FiCheckCircle className="h-5 w-5 text-blue-600" />
                  </div>

                  <div>
                    <h3 className="font-extrabold text-slate-900">
                      Attendance QR
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      A secure QR code will be associated with your registration
                      for reunion attendance.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default ReunionRegister;
