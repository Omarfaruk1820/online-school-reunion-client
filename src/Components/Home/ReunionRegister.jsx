import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiCalendar,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiGift,
  FiLoader,
  FiLock,
  FiMapPin,
  FiRefreshCw,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";
import toast from "react-hot-toast";

import axiosSecure from "../../hooks/axiosSecure";
import useAuth from "../../hooks/useAuth";

const API_EVENT_URL = "/registrations";

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

/* -------------------------------------------------------
   Helpers
------------------------------------------------------- */

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

const normalizeString = (value) => {
  return String(value || "").trim();
};

const normalizeTshirtSize = (value) => {
  const size = normalizeString(value).toUpperCase();

  if (size === "XXL") {
    return "2XL";
  }

  return size;
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
          ? pkg.tshirt.sizes.map(normalizeTshirtSize).filter(Boolean)
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

    _id: normalizeId(event._id || event.id) || DEFAULT_EVENT._id,

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

const isDeadlinePassed = (deadline) => {
  if (!deadline) {
    return false;
  }

  const value = String(deadline).trim();

  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T23:59:59+06:00`)
    : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return Date.now() > date.getTime();
};

/* -------------------------------------------------------
   Component
------------------------------------------------------- */

const ReunionRegister = () => {
  const navigate = useNavigate();

  const { user, loading: authLoading } = useAuth();

  const [step, setStep] = useState(1);

  const [submittedRegistration, setSubmittedRegistration] = useState(null);

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

  /* -------------------------------------------------------
     Event Query
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Event Data
  ------------------------------------------------------- */

  const event = useMemo(() => {
    const serverEvent = extractEventFromResponse(eventResponse);

    return normalizeEvent(serverEvent);
  }, [eventResponse]);

  const eventId = useMemo(() => {
    return normalizeId(event?._id || event?.id);
  }, [event]);

  const eventGiftItems = useMemo(() => {
    if (Array.isArray(event?.gifts?.items) && event.gifts.items.length > 0) {
      return event.gifts.items.map(normalizeGiftItem).filter(Boolean);
    }

    return DEFAULT_GIFT_ITEMS;
  }, [event]);

  const packages = useMemo(() => {
    return normalizePackages(extractPackagesFromResponse(eventResponse));
  }, [eventResponse]);

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

  const selectedTshirtSizes = useMemo(() => {
    if (
      Array.isArray(selectedPackage?.tshirt?.sizes) &&
      selectedPackage.tshirt.sizes.length > 0
    ) {
      return selectedPackage.tshirt.sizes.map(normalizeTshirtSize);
    }

    return DEFAULT_TSHIRT_SIZES;
  }, [selectedPackage]);

  /* -------------------------------------------------------
     Keep T-Shirt Size Valid
  ------------------------------------------------------- */

  useEffect(() => {
    const normalizedSizes = selectedTshirtSizes.map(normalizeTshirtSize);

    const normalizedCurrentSize = normalizeTshirtSize(tShirtSize);

    if (!normalizedSizes.includes(normalizedCurrentSize)) {
      setValue("tShirtSize", normalizedSizes[0] || "L", {
        shouldValidate: true,
      });

      return;
    }

    if (normalizedCurrentSize !== tShirtSize) {
      setValue("tShirtSize", normalizedCurrentSize, {
        shouldValidate: true,
      });
    }
  }, [selectedTshirtSizes, tShirtSize, setValue]);

  /* -------------------------------------------------------
     Populate Auth User
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Redirect if Not Logged In
  ------------------------------------------------------- */

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

  /* -------------------------------------------------------
     Registration Status
  ------------------------------------------------------- */

  const registrationDeadlinePassed = isDeadlinePassed(
    event.registrationDeadline,
  );

  const isRegistrationOpen =
    event.registrationOpen !== false &&
    event.registration?.open !== false &&
    event.status !== "cancelled" &&
    event.status !== "archived" &&
    !registrationDeadlinePassed;

  /* -------------------------------------------------------
     Mutation
  ------------------------------------------------------- */

  const registrationMutation = useMutation({
    mutationFn: async (formData) => {
      if (!eventId) {
        throw new Error("Reunion event ID is missing.");
      }

      if (!user?.email) {
        throw new Error("Authenticated user email is missing.");
      }

      const formEmail = normalizeString(formData.email).toLowerCase();

      const authEmail = normalizeString(user.email).toLowerCase();

      if (formEmail !== authEmail) {
        throw new Error(
          "Registration email must match your logged-in account.",
        );
      }

      if (!selectedPackage?.packageId) {
        throw new Error("Please select a valid reunion package.");
      }

      const normalizedTshirtSize = normalizeTshirtSize(formData.tShirtSize);

      const normalizedAvailableSizes =
        selectedTshirtSizes.map(normalizeTshirtSize);

      if (!normalizedAvailableSizes.includes(normalizedTshirtSize)) {
        throw new Error("Please select a valid T-shirt size.");
      }

      if (!formData.agreeToRules) {
        throw new Error("Please agree to the reunion rules.");
      }

      const payload = {
        participant: {
          name: normalizeString(formData.name),

          email: formEmail,

          phone: normalizeString(formData.phone),
        },

        schoolInfo: {
          studentType: formData.studentType,

          classLevel: formData.classLevel,

          batchYear: Number(formData.batchYear),

          department: isSeniorClass ? formData.department : null,

          district: normalizeString(formData.district),

          city: normalizeString(formData.city),
        },

        reunion: {
          eventId,

          packageId: selectedPackage.packageId,

          tShirt: {
            size: normalizedTshirtSize,
          },
        },

        consent: {
          agreedToRules: formData.agreeToRules === true,

          agreedAt: new Date().toISOString(),
        },
      };

      /* Development debugging */
      console.group("📤 REGISTRATION REQUEST");

      console.log("Event ID:", eventId);

      console.log("Authenticated Email:", user.email);

      console.log("Payload:", payload);

      console.log("Payload JSON:", JSON.stringify(payload, null, 2));

      console.groupEnd();

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

      const serverData = error?.response?.data;

      console.group("❌ REGISTRATION ERROR");

      console.error("Status:", status);

      console.error("Code:", code);

      console.error("Server Response:", serverData);

      console.error("Message:", serverData?.message);

      console.error("Request URL:", error?.config?.url);

      console.error("Request Method:", error?.config?.method);

      console.error("Request Data:", error?.config?.data);

      console.groupEnd();

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

  /* -------------------------------------------------------
     Step Validation
  ------------------------------------------------------- */

  const handleNext = async () => {
    if (step === 1) {
      const valid = await trigger(["studentType", "name", "email", "phone"]);

      if (!valid) {
        toast.error("Please complete all personal information.");

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
        toast.error("Please complete all school information.");

        return;
      }

      setStep(3);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (step === 3) {
      const valid = await trigger(["packageId", "tShirtSize", "agreeToRules"]);

      if (!valid) {
        toast.error(
          "Please complete the reunion package and confirmation section.",
        );

        return;
      }

      setStep(4);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handleBack = () => {
    if (step <= 1) {
      return;
    }

    setStep((previous) => previous - 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleFinalSubmit = handleSubmit(() => {
    if (!isRegistrationOpen) {
      toast.error("Reunion registration is currently closed.");

      return;
    }

    if (!agreeToRules) {
      toast.error("Please agree to the reunion rules.");

      return;
    }

    registrationMutation.mutate(getValues());
  });

  /* -------------------------------------------------------
     Loading
  ------------------------------------------------------- */

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiLoader className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />

          <p className="text-sm font-medium text-slate-600">
            Checking your account...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          <FiLock className="mx-auto mb-4 h-10 w-10 text-slate-400" />

          <h2 className="text-xl font-bold text-slate-900">Login Required</h2>

          <p className="mt-2 text-sm text-slate-600">
            Please login before registering for the reunion.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Event Loading
  ------------------------------------------------------- */

  if (eventLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <FiLoader className="mx-auto mb-4 h-10 w-10 animate-spin text-blue-600" />

          <h2 className="text-lg font-bold text-slate-900">
            Loading Reunion Registration
          </h2>

          <p className="mt-2 text-sm text-slate-600">
            Please wait while we load the reunion information.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Event Error
  ------------------------------------------------------- */

  if (eventError && !eventResponse) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
            <FiRefreshCw className="h-7 w-7 text-red-500" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">
            Unable to Load Registration
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-600">
            We could not load the reunion registration information right now.
          </p>

          {eventQueryError && (
            <p className="mt-2 text-xs text-red-500">
              {getApiErrorMessage(eventQueryError)}
            </p>
          )}

          <button
            type="button"
            onClick={() => refetchEvent()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            <FiRefreshCw />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Registration Closed
  ------------------------------------------------------- */

  if (!isRegistrationOpen) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-slate-900 px-6 py-12 text-center text-white sm:px-10">
              <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <FiLock className="h-8 w-8" />
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Registration Closed
              </h1>

              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
                Registration for the Grand School Reunion 2027 is currently
                closed.
              </p>
            </div>

            <div className="grid gap-6 p-6 sm:grid-cols-3 sm:p-10">
              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <FiCalendar className="mx-auto mb-3 h-7 w-7 text-blue-600" />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Date
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {formatEventDate(event.eventDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <FiClock className="mx-auto mb-3 h-7 w-7 text-blue-600" />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Time
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {event.startTime} - {event.endTime}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-5 text-center">
                <FiMapPin className="mx-auto mb-3 h-7 w-7 text-blue-600" />

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Venue
                </p>

                <p className="mt-1 font-bold text-slate-900">
                  {event.venue?.name || "School Campus"}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-100 p-6 text-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FiArrowLeft />
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Success Screen
  ------------------------------------------------------- */

  if (step === 4 && submittedRegistration) {
    const registrationId =
      submittedRegistration.registrationId ||
      submittedRegistration.id ||
      submittedRegistration._id ||
      "Registered";

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl">
            <div className="bg-gradient-to-br from-emerald-600 to-green-700 px-6 py-12 text-center text-white sm:px-10">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                <FiCheckCircle className="h-11 w-11" />
              </div>

              <h1 className="text-3xl font-black sm:text-4xl">
                Registration Successful!
              </h1>

              <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-emerald-50 sm:text-base">
                Your registration for the Grand School Reunion 2027 has been
                successfully completed.
              </p>
            </div>

            <div className="p-6 sm:p-10">
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Registration ID
                </p>

                <p className="mt-2 break-all text-2xl font-black tracking-wide text-emerald-900">
                  {registrationId}
                </p>

                <p className="mt-3 text-sm text-emerald-700">
                  Please save this registration ID for future reference.
                </p>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Participant
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {getValues("name")}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    T-Shirt Size
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {normalizeTshirtSize(getValues("tShirtSize"))}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Package
                  </p>

                  <p className="mt-1 font-bold text-slate-900">
                    {selectedPackage.name}
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-bold capitalize text-emerald-600">
                    {submittedRegistration.status || "Confirmed"}
                  </p>
                </div>
              </div>

              <div className="mt-8 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                <div className="flex gap-3">
                  <FiShield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                  <div>
                    <h3 className="font-bold text-blue-900">What's Next?</h3>

                    <p className="mt-1 text-sm leading-6 text-blue-800">
                      Your reunion registration has been recorded. Please keep
                      your registration ID. It may be used for attendance and
                      gift distribution at the reunion.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/registrations")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  <FiUser />
                  View My Registration
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
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

  /* -------------------------------------------------------
     Main Registration UI
  ------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-slate-50 py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-6 text-white shadow-xl sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-blue-50">
                <FiUsers />

                {event.edition}
              </div>

              <h1 className="text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
                {event.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-6 text-blue-100 sm:text-base">
                Register now and join your classmates and alumni for our
                memorable school reunion.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold">
                  <FiCalendar />

                  {formatEventDate(event.eventDate)}
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold">
                  <FiClock />
                  {event.startTime} - {event.endTime}
                </div>

                <div className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-semibold">
                  <FiMapPin />

                  {event.venue?.name || "School Campus"}
                </div>
              </div>
            </div>

            <div className="hidden lg:block">
              <div className="flex h-32 w-32 items-center justify-center rounded-full border border-white/20 bg-white/10">
                <FiUsers className="h-16 w-16 text-white/90" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                number: 1,
                title: "Personal",
              },
              {
                number: 2,
                title: "School",
              },
              {
                number: 3,
                title: "Package",
              },
              {
                number: 4,
                title: "Confirm",
              },
            ].map((item) => {
              const active = step >= item.number;

              const current = step === item.number;

              return (
                <div key={item.number} className="relative">
                  <div className="flex items-center gap-2">
                    <div
                      className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-black transition ${
                        active
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      } ${current ? "ring-4 ring-blue-100" : ""}`}
                    >
                      {item.number}
                    </div>

                    <span
                      className={`hidden text-sm font-bold sm:block ${
                        active ? "text-slate-900" : "text-slate-400"
                      }`}
                    >
                      {item.title}
                    </span>
                  </div>

                  {item.number < 4 && (
                    <div
                      className={`absolute left-10 right-0 top-4 h-0.5 ${
                        step > item.number ? "bg-blue-600" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <form onSubmit={handleFinalSubmit}>
          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr_330px]">
            {/* Form */}
            <div className="rounded-3xl bg-white p-6 shadow-lg sm:p-8">
              {/* STEP 1 */}
              {step === 1 && (
                <div>
                  <div className="mb-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <FiUser className="h-6 w-6 text-blue-600" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900">
                      Personal Information
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Tell us a little about yourself.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Student Type */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Participant Type
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <label
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            studentType === "current"
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="current"
                            className="sr-only"
                            {...register("studentType", {
                              required: "Please select participant type.",
                            })}
                          />

                          <div className="flex items-center gap-3">
                            <FiUser className="h-5 w-5 text-blue-600" />

                            <div>
                              <p className="font-bold text-slate-900">
                                Current Student
                              </p>

                              <p className="text-xs text-slate-500">
                                Currently studying at the school
                              </p>
                            </div>
                          </div>
                        </label>

                        <label
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            studentType === "alumni"
                              ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="alumni"
                            className="sr-only"
                            {...register("studentType", {
                              required: "Please select participant type.",
                            })}
                          />

                          <div className="flex items-center gap-3">
                            <FiUsers className="h-5 w-5 text-blue-600" />

                            <div>
                              <p className="font-bold text-slate-900">
                                Alumni / Ex-Student
                              </p>

                              <p className="text-xs text-slate-500">
                                Former student of the school
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {errors.studentType && (
                        <p className="mt-2 text-xs font-medium text-red-500">
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

                      <input
                        id="name"
                        type="text"
                        placeholder="Enter your full name"
                        {...register("name", {
                          required: "Full name is required.",
                          minLength: {
                            value: 2,
                            message: "Name must be at least 2 characters.",
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.name
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.name && (
                        <p className="mt-1.5 text-xs text-red-500">
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

                      <input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        {...register("email", {
                          required: "Email is required.",
                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                            message: "Please enter a valid email address.",
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.email && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Mobile Number
                      </label>

                      <input
                        id="phone"
                        type="tel"
                        inputMode="numeric"
                        placeholder="01XXXXXXXXX"
                        {...register("phone", {
                          required: "Mobile number is required.",

                          pattern: {
                            value: /^01[3-9]\d{8}$/,
                            message:
                              "Please enter a valid Bangladesh mobile number.",
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.phone
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.phone && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.phone.message}
                        </p>
                      )}

                      <p className="mt-1.5 text-xs text-slate-400">
                        Example: 017XXXXXXXX
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div>
                  <div className="mb-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50">
                      <FiUsers className="h-6 w-6 text-indigo-600" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900">
                      School Information
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Provide your school-related information.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
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
                          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:ring-4 ${
                            errors.classLevel
                              ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                              : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                          }`}
                        >
                          <option value="">Select class</option>

                          {DEFAULT_CLASS_LEVELS.map((level) => (
                            <option key={level} value={level}>
                              Class {level}
                            </option>
                          ))}
                        </select>

                        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>

                      {errors.classLevel && (
                        <p className="mt-1.5 text-xs text-red-500">
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
                        min="1950"
                        max="2100"
                        placeholder="Example: 2011"
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
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.batchYear
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.batchYear && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.batchYear.message}
                        </p>
                      )}
                    </div>

                    {/* Department */}
                    {isSeniorClass && (
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="department"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Department
                        </label>

                        <div className="relative">
                          <select
                            id="department"
                            {...register("department", {
                              required: "Please select your department.",
                            })}
                            className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:ring-4 ${
                              errors.department
                                ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
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

                          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>

                        {errors.department && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.department.message}
                          </p>
                        )}
                      </div>
                    )}

                    {/* District */}
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
                        placeholder="Enter district"
                        {...register("district", {
                          required: "District is required.",
                          minLength: {
                            value: 2,
                            message: "Please enter a valid district.",
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.district
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.district && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.district.message}
                        </p>
                      )}
                    </div>

                    {/* City */}
                    <div>
                      <label
                        htmlFor="city"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        City / Upazila
                      </label>

                      <input
                        id="city"
                        type="text"
                        placeholder="Enter city or upazila"
                        {...register("city", {
                          required: "City / Upazila is required.",
                          minLength: {
                            value: 2,
                            message: "Please enter a valid city or upazila.",
                          },
                        })}
                        className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-4 ${
                          errors.city
                            ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                        }`}
                      />

                      {errors.city && (
                        <p className="mt-1.5 text-xs text-red-500">
                          {errors.city.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div>
                  <div className="mb-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50">
                      <FiGift className="h-6 w-6 text-emerald-600" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900">
                      Reunion Package
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Choose your reunion package and T-shirt size.
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Packages */}
                    <div>
                      <label className="mb-3 block text-sm font-bold text-slate-700">
                        Select Package
                      </label>

                      <div className="space-y-3">
                        {packages.map((pkg) => {
                          const selected = selectedPackageId === pkg.packageId;

                          return (
                            <label
                              key={pkg.packageId}
                              className={`block cursor-pointer rounded-2xl border p-5 transition ${
                                selected
                                  ? "border-blue-600 bg-blue-50 ring-2 ring-blue-100"
                                  : "border-slate-200 hover:border-blue-300"
                              }`}
                            >
                              <input
                                type="radio"
                                value={pkg.packageId}
                                className="sr-only"
                                {...register("packageId", {
                                  required: "Please select a package.",
                                })}
                              />

                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                                        selected
                                          ? "bg-blue-600 text-white"
                                          : "bg-slate-100 text-slate-500"
                                      }`}
                                    >
                                      <FiGift />
                                    </div>

                                    <div>
                                      <h3 className="font-black text-slate-900">
                                        {pkg.name}
                                      </h3>

                                      <p className="mt-0.5 text-xs text-slate-500">
                                        {pkg.description}
                                      </p>
                                    </div>
                                  </div>

                                  {pkg.items?.length > 0 && (
                                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                      {pkg.items.map((item, index) => (
                                        <div
                                          key={`${pkg.packageId}-${index}`}
                                          className="flex items-center gap-2 text-xs text-slate-600"
                                        >
                                          <FiCheckCircle className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />

                                          <span>{item}</span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>

                                <div className="whitespace-nowrap text-sm font-black text-emerald-600">
                                  {formatPrice(pkg.pricing)}
                                </div>
                              </div>
                            </label>
                          );
                        })}
                      </div>

                      {errors.packageId && (
                        <p className="mt-2 text-xs text-red-500">
                          {errors.packageId.message}
                        </p>
                      )}
                    </div>

                    {/* T-shirt */}
                    {selectedPackage?.tshirt?.included && (
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
                              required: "Please select your T-shirt size.",
                            })}
                            className={`w-full appearance-none rounded-xl border bg-white px-4 py-3 pr-10 text-sm outline-none transition focus:ring-4 ${
                              errors.tShirtSize
                                ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                                : "border-slate-200 focus:border-blue-500 focus:ring-blue-50"
                            }`}
                          >
                            {selectedTshirtSizes.map((size) => (
                              <option key={size} value={size}>
                                {size}
                              </option>
                            ))}
                          </select>

                          <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        </div>

                        {errors.tShirtSize && (
                          <p className="mt-1.5 text-xs text-red-500">
                            {errors.tShirtSize.message}
                          </p>
                        )}

                        <p className="mt-2 text-xs text-slate-400">
                          Your selected T-shirt size will be used for reunion
                          gift distribution.
                        </p>
                      </div>
                    )}

                    {/* Gift Summary */}
                    <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                      <div className="flex items-start gap-3">
                        <FiGift className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />

                        <div>
                          <h3 className="font-bold text-emerald-900">
                            Reunion Gifts Included
                          </h3>

                          <div className="mt-3 grid gap-2 sm:grid-cols-2">
                            {eventGiftItems.map((item, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 text-sm text-emerald-800"
                              >
                                <FiCheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" />

                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {step === 4 && (
                <div>
                  <div className="mb-8">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50">
                      <FiShield className="h-6 w-6 text-blue-600" />
                    </div>

                    <h2 className="text-2xl font-black text-slate-900">
                      Confirm Registration
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      Review your information before submitting your
                      registration.
                    </p>
                  </div>

                  <div className="space-y-5">
                    {/* Personal Summary */}
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-black text-slate-900">
                          Personal Information
                        </h3>

                        <button
                          type="button"
                          onClick={() => setStep(1)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-400">Name</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {getValues("name")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            Participant Type
                          </p>

                          <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                            {getValues("studentType")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Email</p>

                          <p className="mt-1 break-all text-sm font-bold text-slate-900">
                            {getValues("email")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Phone</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {getValues("phone")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* School Summary */}
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-black text-slate-900">
                          School Information
                        </h3>

                        <button
                          type="button"
                          onClick={() => setStep(2)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-400">Class</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            Class {getValues("classLevel")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">Batch Year</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {getValues("batchYear")}
                          </p>
                        </div>

                        {isSeniorClass && (
                          <div>
                            <p className="text-xs text-slate-400">Department</p>

                            <p className="mt-1 text-sm font-bold capitalize text-slate-900">
                              {getValues("department")}
                            </p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs text-slate-400">District</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {getValues("district")}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">
                            City / Upazila
                          </p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {getValues("city")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Reunion Summary */}
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="font-black text-slate-900">
                          Reunion Package
                        </h3>

                        <button
                          type="button"
                          onClick={() => setStep(3)}
                          className="text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          Edit
                        </button>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-slate-400">Package</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {selectedPackage.name}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-400">T-Shirt Size</p>

                          <p className="mt-1 text-sm font-bold text-slate-900">
                            {normalizeTshirtSize(getValues("tShirtSize"))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Agreement */}
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition ${
                        agreeToRules
                          ? "border-blue-600 bg-blue-50"
                          : "border-slate-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        {...register("agreeToRules", {
                          required: "You must agree to the reunion rules.",
                        })}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          I agree to the reunion rules and registration
                          information.
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          I confirm that the information provided above is
                          accurate and I agree to follow the rules and
                          instructions of the reunion organizers.
                        </p>

                        {errors.agreeToRules && (
                          <p className="mt-2 text-xs font-medium text-red-500">
                            {errors.agreeToRules.message}
                          </p>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={registrationMutation.isPending}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <FiArrowLeft />
                    Back
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate("/")}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiArrowLeft />
                    Cancel
                  </button>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-100 transition hover:bg-blue-700"
                  >
                    Continue
                    <FiArrowRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={registrationMutation.isPending || !agreeToRules}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {registrationMutation.isPending ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FiCheckCircle />
                        Complete Registration
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Event Info */}
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <h3 className="text-lg font-black text-slate-900">
                  Reunion Information
                </h3>

                <div className="mt-5 space-y-4">
                  <div className="flex gap-3">
                    <FiCalendar className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {formatEventDate(event.eventDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiClock className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-bold text-slate-900">
                        {event.startTime} - {event.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiMapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Venue
                      </p>

                      <p className="mt-1 text-sm font-bold leading-5 text-slate-900">
                        {formatVenue(event.venue)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <FiGift className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600" />

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Registration Package
                      </p>

                      <p className="mt-1 text-sm font-bold text-emerald-600">
                        {formatPrice(selectedPackage?.pricing)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gifts */}
              <div className="rounded-3xl bg-white p-6 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                    <FiGift className="h-5 w-5 text-emerald-600" />
                  </div>

                  <div>
                    <h3 className="font-black text-slate-900">Reunion Gifts</h3>

                    <p className="text-xs text-slate-500">
                      Included with registration
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {eventGiftItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <FiCheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500" />

                      <span className="text-sm text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex items-start gap-3">
                  <FiShield className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />

                  <div>
                    <h3 className="font-bold text-blue-900">
                      Secure Registration
                    </h3>

                    <p className="mt-2 text-xs leading-5 text-blue-800">
                      Your registration is connected to your authenticated
                      account. Please make sure your information is correct
                      before submitting.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReunionRegister;
