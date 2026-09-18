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
  FiLoader,
  FiMail,
  FiMapPin,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "../../Auth/firebase.config";
import axiosPublic from "../../hooks/axiosPublic";
import axiosSecure from "../../hooks/axiosSecure";

const STEPS = [
  {
    id: 1,
    title: "Personal Information",
    shortTitle: "Personal",
  },
  {
    id: 2,
    title: "School Information",
    shortTitle: "School",
  },
  {
    id: 3,
    title: "Reunion Package",
    shortTitle: "Package",
  },
  {
    id: 4,
    title: "Confirmation",
    shortTitle: "Confirm",
  },
];

const CLASS_LEVELS = ["6", "7", "8", "9", "10"];

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

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const formatDate = (value) => {
  if (!value) return "Date not available";

  const stringValue = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(stringValue)) {
    const [year, month, day] = stringValue.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    if (Number.isNaN(date.getTime())) {
      return "Date not available";
    }

    return date.toLocaleDateString("en-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date not available";
  }

  return date.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "";

  const stringValue = String(value).trim();

  if (/am|pm/i.test(stringValue)) {
    return stringValue;
  }

  const match = stringValue.match(/^(\d{1,2}):(\d{2})/);

  if (!match) {
    return stringValue;
  }

  let hours = Number(match[1]);
  const minutes = match[2];

  const period = hours >= 12 ? "PM" : "AM";

  hours = hours % 12 || 12;

  return `${hours}:${minutes} ${period}`;
};

const getEventTime = (event) => {
  if (!event) return "Time not available";

  if (event.eventTime) {
    return event.eventTime;
  }

  const start =
    event.startTime || event.eventStartTime || event.start || event.eventStart;

  const end =
    event.endTime || event.eventEndTime || event.end || event.eventEnd;

  if (start && end) {
    return `${formatTime(start)} – ${formatTime(end)}`;
  }

  if (start) {
    return formatTime(start);
  }

  return "Time not available";
};

const getEventId = (event) => {
  if (!event) return "";

  return (
    event._id?.toString?.() || event._id || event.id || event.eventId || ""
  );
};

const getPackageId = (item) => {
  if (!item) return "";

  return item.id || item.packageId || item._id?.toString?.() || item._id || "";
};

const getPackages = (event) => {
  if (!event) return [];

  if (Array.isArray(event.packages)) {
    return event.packages;
  }

  if (Array.isArray(event.packageOptions)) {
    return event.packageOptions;
  }

  if (Array.isArray(event.packageList)) {
    return event.packageList;
  }

  if (event.package) {
    return [event.package];
  }

  return [];
};

const isEventObject = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Boolean(
    value._id ||
    value.id ||
    value.eventId ||
    value.eventDate ||
    value.title ||
    value.name ||
    value.registrationOpen !== undefined ||
    Array.isArray(value.packages),
  );
};

const extractEvent = (data) => {
  if (!data) return null;

  if (isEventObject(data)) {
    return data;
  }

  if (isEventObject(data.event)) {
    return data.event;
  }

  if (isEventObject(data.reunion)) {
    return data.reunion;
  }

  if (isEventObject(data.data)) {
    return data.data;
  }

  if (isEventObject(data.data?.event)) {
    return data.data.event;
  }

  if (isEventObject(data.data?.reunion)) {
    return data.data.reunion;
  }

  return null;
};

const getApiErrorMessage = (error) => {
  return (
    error?.response?.data?.message ||
    error?.response?.data?.error ||
    error?.message ||
    "Something went wrong. Please try again."
  );
};

const getRegistrationResult = (data) => {
  if (!data) return null;

  if (data.registration) {
    return data.registration;
  }

  if (data.data?.registration) {
    return data.data.registration;
  }

  if (data.data) {
    return data.data;
  }

  return data;
};

const getRegistrationId = (data) => {
  const registration = getRegistrationResult(data);

  return (
    registration?._id?.toString?.() ||
    registration?._id ||
    registration?.id ||
    registration?.registrationId ||
    data?.registrationId ||
    ""
  );
};

const ReunionRegister = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [registrationSuccess, setRegistrationSuccess] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
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
  const agreeToRules = watch("agreeToRules");

  /*
   * ---------------------------------------------------------
   * Firebase authenticated user
   * ---------------------------------------------------------
   */

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user || null);
      setAuthLoading(false);

      if (user) {
        if (user.email) {
          setValue("email", user.email, {
            shouldValidate: true,
          });
        }

        if (user.displayName) {
          setValue("name", user.displayName, {
            shouldValidate: true,
          });
        }
      } else {
        setValue("email", "");
        setValue("name", "");
      }
    });

    return () => unsubscribe();
  }, [setValue]);

  /*
   * ---------------------------------------------------------
   * Department reset
   * ---------------------------------------------------------
   */

  useEffect(() => {
    if (classLevel !== "9" && classLevel !== "10") {
      setValue("department", "");
    }
  }, [classLevel, setValue]);

  /*
   * ---------------------------------------------------------
   * Load active reunion
   * ---------------------------------------------------------
   */

  const {
    data: reunionResponse,
    isLoading: reunionLoading,
    isError: reunionError,
    error: reunionQueryError,
    refetch: refetchReunion,
  } = useQuery({
    queryKey: ["registration-event"],

    queryFn: async () => {
      const response = await axiosPublic.get("/registrations");

      return response.data;
    },

    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const reunion = useMemo(() => {
    return extractEvent(reunionResponse);
  }, [reunionResponse]);

  const eventId = useMemo(() => {
    return getEventId(reunion);
  }, [reunion]);

  const eventPackages = useMemo(() => {
    return getPackages(reunion);
  }, [reunion]);

  /*
   * ---------------------------------------------------------
   * Default package
   * ---------------------------------------------------------
   */

  const defaultPackageId = useMemo(() => {
    if (!reunion) return "";

    if (reunion.packageId) {
      return reunion.packageId;
    }

    if (reunion.package) {
      return getPackageId(reunion.package);
    }

    if (eventPackages.length > 0) {
      return getPackageId(eventPackages[0]);
    }

    return "";
  }, [reunion, eventPackages]);

  useEffect(() => {
    if (defaultPackageId && !selectedPackageId) {
      setValue("packageId", String(defaultPackageId), {
        shouldValidate: true,
      });
    }
  }, [defaultPackageId, selectedPackageId, setValue]);

  /*
   * ---------------------------------------------------------
   * Registration status
   * ---------------------------------------------------------
   */

  const registrationDeadlinePassed = useMemo(() => {
    if (!reunion?.registrationDeadline) {
      return false;
    }

    const deadline = new Date(reunion.registrationDeadline);

    if (Number.isNaN(deadline.getTime())) {
      return false;
    }

    return Date.now() > deadline.getTime();
  }, [reunion]);

  const isRegistrationClosed =
    reunion?.registrationOpen === false ||
    reunion?.isRegistrationOpen === false ||
    reunion?.registrationStatus === "closed" ||
    registrationDeadlinePassed;

  /*
   * ---------------------------------------------------------
   * Selected package
   * ---------------------------------------------------------
   */

  const selectedPackage = useMemo(() => {
    if (!selectedPackageId) {
      return null;
    }

    return (
      eventPackages.find(
        (item) => String(getPackageId(item)) === String(selectedPackageId),
      ) || null
    );
  }, [eventPackages, selectedPackageId]);

  /*
   * ---------------------------------------------------------
   * Registration mutation
   * ---------------------------------------------------------
   */

  const registrationMutation = useMutation({
    mutationFn: async (payload) => {
      const response = await axiosSecure.post(
        "/registrations/register",
        payload,
      );

      return response.data;
    },

    onSuccess: (response) => {
      const registration = getRegistrationResult(response);
      const registrationId = getRegistrationId(response);

      setRegistrationSuccess({
        ...(registration || {}),
        registrationId,
      });

      toast.success("Registration completed successfully!");
    },

    onError: (error) => {
      const status = error?.response?.status;

      if (status === 401) {
        toast.error("Your login session has expired. Please login again.");

        navigate("/login", {
          state: {
            from: "/reunion-register",
          },
        });

        return;
      }

      if (status === 403) {
        toast.error(
          getApiErrorMessage(error) || "Registration is currently closed.",
        );

        return;
      }

      if (status === 409) {
        toast.error(
          getApiErrorMessage(error) ||
            "You have already registered for this reunion.",
        );

        return;
      }

      toast.error(getApiErrorMessage(error));
    },
  });

  /*
   * ---------------------------------------------------------
   * Step validation
   * ---------------------------------------------------------
   */

  const validateCurrentStep = async () => {
    if (currentStep === 1) {
      return trigger(["name", "email", "phone", "district", "city"]);
    }

    if (currentStep === 2) {
      const fields = ["studentType", "classLevel", "batchYear"];

      if (classLevel === "9" || classLevel === "10") {
        fields.push("department");
      }

      return trigger(fields);
    }

    if (currentStep === 3) {
      return trigger(["packageId", "tshirtSize"]);
    }

    if (currentStep === 4) {
      return trigger(["agreeToRules"]);
    }

    return true;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();

    if (!isValid) {
      toast.error("Please complete all required fields.");
      return;
    }

    if (currentStep < STEPS.length) {
      setCurrentStep((previous) => previous + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  /*
   * ---------------------------------------------------------
   * Submit
   * ---------------------------------------------------------
   */

  const onSubmit = (formData) => {
    if (!currentUser) {
      toast.error("Please login before registering.");

      navigate("/login", {
        state: {
          from: "/reunion-register",
        },
      });

      return;
    }

    if (!eventId) {
      toast.error("Reunion event information is unavailable.");

      return;
    }

    if (isRegistrationClosed) {
      toast.error("Registration is currently closed.");
      return;
    }

    if (!agreeToRules) {
      toast.error("Please agree to the reunion rules.");
      return;
    }

    const authenticatedEmail = currentUser.email?.trim().toLowerCase();

    if (!authenticatedEmail) {
      toast.error("Your account does not have a valid email address.");

      return;
    }

    /*
     * Use Firebase authenticated email instead of trusting
     * the submitted form email.
     */
    const participantEmail = authenticatedEmail;

    /*
     * Make sure class 9/10 has a department.
     */
    if (
      (formData.classLevel === "9" || formData.classLevel === "10") &&
      !formData.department
    ) {
      toast.error("Please select your department.");

      setCurrentStep(2);

      return;
    }

    /*
     * Package is required.
     */
    if (!formData.packageId) {
      toast.error("Please select a reunion package.");

      setCurrentStep(3);

      return;
    }

    /*
     * T-shirt size is required.
     */
    if (!formData.tshirtSize) {
      toast.error("Please select your T-shirt size.");

      setCurrentStep(3);

      return;
    }

    const payload = {
      participant: {
        name: formData.name.trim(),
        email: participantEmail,
        phone: formData.phone.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
      },

      schoolInfo: {
        studentType: formData.studentType,
        classLevel: formData.classLevel,
        batchYear: Number(formData.batchYear),

        department:
          formData.classLevel === "9" || formData.classLevel === "10"
            ? formData.department
            : null,
      },

      reunion: {
        eventId,

        packageId: formData.packageId,

        tShirt: {
          size: formData.tshirtSize,
        },
      },

      consent: {
        agreedToRules: true,
      },
    };

    registrationMutation.mutate(payload);
  };

  /*
   * ---------------------------------------------------------
   * Loading
   * ---------------------------------------------------------
   */

  if (authLoading || reunionLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
            <FiLoader className="h-8 w-8 animate-spin text-indigo-600" />
          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">
            Loading registration
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Please wait while we prepare the reunion registration form.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Login required
   * ---------------------------------------------------------
   */

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 text-center shadow-xl sm:p-10 md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <FiUsers className="h-8 w-8 text-indigo-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              Login Required
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              You need to login before registering for the school reunion.
            </p>

            <button
              type="button"
              onClick={() =>
                navigate("/login", {
                  state: {
                    from: "/reunion-register",
                  },
                })
              }
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              Login to Continue
              <FiArrowRight />
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Reunion unavailable
   * ---------------------------------------------------------
   */

  if (reunionError || !reunion) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-red-100 bg-white p-7 text-center shadow-xl sm:p-10 md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <FiXCircle className="h-8 w-8 text-red-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              Reunion Information Unavailable
            </h1>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              We could not load the active reunion information right now.
            </p>

            {reunionQueryError?.response?.data?.message && (
              <p className="mt-3 text-sm text-red-500">
                {reunionQueryError.response.data.message}
              </p>
            )}

            <button
              type="button"
              onClick={() => refetchReunion()}
              className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Registration successful
   * ---------------------------------------------------------
   */

  if (registrationSuccess) {
    const registrationId =
      registrationSuccess.registrationId ||
      registrationSuccess.id ||
      registrationSuccess._id;

    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10 sm:py-12">
        <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
          <div className="w-full overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 px-6 py-10 text-center text-white sm:px-10 md:py-12">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/15">
                <FiCheckCircle className="h-11 w-11" />
              </div>

              <h1 className="mt-5 text-3xl font-bold sm:text-4xl">
                Registration Successful!
              </h1>

              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-emerald-50 sm:text-base">
                Thank you for registering for our school reunion. We look
                forward to seeing you at the event.
              </p>
            </div>

            <div className="p-6 sm:p-8 md:p-10">
              {registrationId && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Your Registration ID
                  </p>

                  <p className="mt-3 break-all text-xl font-bold tracking-wide text-indigo-600 sm:text-2xl">
                    {registrationId}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    Please save this ID for future reference.
                  </p>
                </div>
              )}

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => navigate("/dashboard/registrations")}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 sm:text-base"
                >
                  View My Registration
                  <FiArrowRight />
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/")}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-base"
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

  /*
   * ---------------------------------------------------------
   * Registration closed
   * ---------------------------------------------------------
   */

  if (isRegistrationClosed) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto flex min-h-[60vh] max-w-xl items-center justify-center">
          <div className="w-full rounded-3xl border border-amber-100 bg-white p-7 text-center shadow-xl sm:p-10 md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
              <FiClock className="h-8 w-8 text-amber-600" />
            </div>

            <h1 className="mt-6 text-2xl font-bold text-slate-900 sm:text-3xl">
              Registration Closed
            </h1>

            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Registration for this reunion is currently closed.
            </p>

            {reunion.registrationDeadline && (
              <div className="mt-5 rounded-2xl bg-amber-50 p-4">
                <p className="text-sm text-amber-800">Registration deadline</p>

                <p className="mt-1 font-bold text-amber-900">
                  {formatDate(reunion.registrationDeadline)}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-7 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700 sm:w-auto"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * Main registration form
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-screen bg-slate-50 px-3 py-6 sm:px-4 sm:py-8 lg:py-12">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <div className="mb-7 text-center sm:mb-9">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold text-indigo-700 sm:text-sm">
            <FiUsers />
            School Reunion Registration
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
            Register for the Reunion
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">
            Complete the form below to secure your participation in our
            memorable school reunion.
          </p>
        </div>

        {/* Event information */}
        <div className="mb-7 overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-600 text-white shadow-xl sm:mb-8">
          <div className="grid gap-5 p-5 sm:p-6 md:grid-cols-3 md:gap-6 md:p-8">
            <EventInfo
              icon={<FiCalendar />}
              label="Reunion Date"
              value={formatDate(reunion.eventDate)}
            />

            <EventInfo
              icon={<FiClock />}
              label="Event Time"
              value={getEventTime(reunion)}
            />

            <EventInfo
              icon={<FiMapPin />}
              label="Venue"
              value={
                reunion.venue || reunion.location || "Venue will be announced"
              }
            />
          </div>
        </div>

        {/* Steps */}
        <div className="mb-7 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <div className="flex items-center">
            {STEPS.map((step, index) => {
              const completed = currentStep > step.id;
              const active = currentStep === step.id;

              return (
                <div key={step.id} className="flex min-w-0 flex-1 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      if (completed) {
                        setCurrentStep(step.id);
                      }
                    }}
                    disabled={!completed && !active}
                    className="flex min-w-0 flex-col items-center"
                    aria-label={`Step ${step.id}: ${step.title}`}
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition sm:h-11 sm:w-11 sm:text-sm ${
                        completed || active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {completed ? (
                        <FiCheck className="h-4 w-4 sm:h-5 sm:w-5" />
                      ) : (
                        step.id
                      )}
                    </div>

                    <span
                      className={`mt-2 text-[10px] font-semibold sm:text-xs ${
                        active ? "text-indigo-600" : "text-slate-500"
                      }`}
                    >
                      <span className="sm:hidden">{step.shortTitle}</span>

                      <span className="hidden sm:inline">{step.title}</span>
                    </span>
                  </button>

                  {index < STEPS.length - 1 && (
                    <div
                      className={`mx-1.5 h-1 flex-1 rounded-full sm:mx-3 md:mx-5 ${
                        currentStep > step.id ? "bg-indigo-600" : "bg-slate-100"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
        >
          <div className="p-5 sm:p-7 md:p-10">
            {/* STEP 1 */}
            {currentStep === 1 && (
              <section>
                <StepHeading
                  icon={<FiUser />}
                  title="Personal Information"
                  description="Tell us a little about yourself."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <InputField
                    label="Full Name"
                    required
                    type="text"
                    placeholder="Enter your full name"
                    icon={<FiUser />}
                    error={errors.name?.message}
                    autoComplete="name"
                    {...register("name", {
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
                  />

                  <InputField
                    label="Email Address"
                    required
                    type="email"
                    placeholder="Your login email"
                    icon={<FiMail />}
                    disabled
                    error={errors.email?.message}
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required.",

                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Please enter a valid email.",
                      },
                    })}
                  />

                  <InputField
                    label="Phone Number"
                    required
                    type="tel"
                    inputMode="numeric"
                    placeholder="01XXXXXXXXX"
                    icon={<FiPhone />}
                    error={errors.phone?.message}
                    autoComplete="tel"
                    {...register("phone", {
                      required: "Phone number is required.",

                      pattern: {
                        value: /^01[3-9]\d{8}$/,
                        message: "Enter a valid Bangladesh mobile number.",
                      },
                    })}
                  />

                  <InputField
                    label="District"
                    required
                    type="text"
                    placeholder="e.g. Khulna"
                    icon={<FiMapPin />}
                    error={errors.district?.message}
                    {...register("district", {
                      required: "District is required.",

                      minLength: {
                        value: 2,
                        message: "Please enter a valid district.",
                      },
                    })}
                  />

                  <InputField
                    label="City / Upazila"
                    required
                    type="text"
                    placeholder="Enter your city or upazila"
                    icon={<FiMapPin />}
                    error={errors.city?.message}
                    {...register("city", {
                      required: "City / Upazila is required.",

                      minLength: {
                        value: 2,
                        message: "Please enter a valid city or upazila.",
                      },
                    })}
                  />
                </div>
              </section>
            )}

            {/* STEP 2 */}
            {currentStep === 2 && (
              <section>
                <StepHeading
                  icon={<FiUsers />}
                  title="School Information"
                  description="Tell us about your school journey."
                />

                <div className="grid gap-5 md:grid-cols-2">
                  <SelectField
                    label="Student Type"
                    required
                    icon={<FiUsers />}
                    error={errors.studentType?.message}
                    {...register("studentType", {
                      required: "Please select your student type.",
                    })}
                  >
                    <option value="">Select student type</option>

                    <option value="current">Current Student</option>

                    <option value="alumni">Alumni / Ex-Student</option>
                  </SelectField>

                  <SelectField
                    label="Class"
                    required
                    icon={<FiUsers />}
                    error={errors.classLevel?.message}
                    {...register("classLevel", {
                      required: "Please select your class.",
                    })}
                  >
                    <option value="">Select class</option>

                    {CLASS_LEVELS.map((level) => (
                      <option key={level} value={level}>
                        Class {level}
                      </option>
                    ))}
                  </SelectField>

                  <InputField
                    label="Batch / Passing Year"
                    required
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 2025"
                    error={errors.batchYear?.message}
                    {...register("batchYear", {
                      required: "Batch year is required.",

                      min: {
                        value: 1950,
                        message: "Batch year must be 1950 or later.",
                      },

                      max: {
                        value: 2100,
                        message: "Please enter a valid batch year.",
                      },

                      validate: (value) =>
                        Number.isInteger(Number(value)) ||
                        "Please enter a valid year.",
                    })}
                  />

                  {(classLevel === "9" || classLevel === "10") && (
                    <SelectField
                      label="Department"
                      required
                      icon={<FiUsers />}
                      error={errors.department?.message}
                      {...register("department", {
                        required: "Department is required for Class 9 and 10.",
                      })}
                    >
                      <option value="">Select department</option>

                      {DEPARTMENTS.map((department) => (
                        <option key={department.value} value={department.value}>
                          {department.label}
                        </option>
                      ))}
                    </SelectField>
                  )}
                </div>

                <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-5">
                  <div className="flex items-start gap-3">
                    <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />

                    <div>
                      <p className="text-sm font-bold text-indigo-900">
                        Department information
                      </p>

                      <p className="mt-1 text-sm leading-6 text-indigo-700">
                        Classes 6–8 do not have departments. Department
                        selection is required only for Classes 9–10.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* STEP 3 */}
            {currentStep === 3 && (
              <section>
                <StepHeading
                  icon={<FiGift />}
                  title="Reunion Package"
                  description="Choose your reunion package and T-shirt size."
                />

                {eventPackages.length > 0 ? (
                  <div className="grid gap-5 md:grid-cols-2">
                    {eventPackages.map((item, index) => {
                      const id = getPackageId(item) || `package-${index}`;

                      const isSelected =
                        String(selectedPackageId) === String(id);

                      const packageItems = Array.isArray(item.items)
                        ? item.items
                        : Array.isArray(item.gifts)
                          ? item.gifts
                          : [];

                      return (
                        <label
                          key={id}
                          className={`relative block cursor-pointer rounded-2xl border-2 p-5 transition sm:p-6 ${
                            isSelected
                              ? "border-indigo-600 bg-indigo-50 shadow-md"
                              : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
                          }`}
                        >
                          <input
                            type="radio"
                            value={id}
                            className="sr-only"
                            {...register("packageId", {
                              required: "Please select a reunion package.",
                            })}
                          />

                          {isSelected && (
                            <div className="absolute right-4 top-4">
                              <FiCheckCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                          )}

                          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                            <FiGift className="h-6 w-6" />
                          </div>

                          <h3 className="mt-4 pr-8 text-lg font-bold text-slate-900">
                            {item.name ||
                              item.title ||
                              `Reunion Package ${index + 1}`}
                          </h3>

                          {(item.description || item.details) && (
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {item.description || item.details}
                            </p>
                          )}

                          {item.price !== undefined && item.price !== null && (
                            <p className="mt-4 text-xl font-bold text-indigo-600">
                              ৳{item.price}
                            </p>
                          )}

                          {packageItems.length > 0 && (
                            <ul className="mt-5 space-y-2.5">
                              {packageItems.map((gift, giftIndex) => {
                                const giftName =
                                  typeof gift === "string"
                                    ? gift
                                    : gift?.name || gift?.title || "";

                                if (!giftName) {
                                  return null;
                                }

                                return (
                                  <li
                                    key={`${id}-${giftIndex}`}
                                    className="flex items-start gap-2 text-sm text-slate-600"
                                  >
                                    <FiCheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />

                                    <span>{giftName}</span>
                                  </li>
                                );
                              })}
                            </ul>
                          )}
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                    <div className="flex items-start gap-3">
                      <FiGift className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                      <div>
                        <p className="font-semibold text-amber-900">
                          Reunion package
                        </p>

                        <p className="mt-1 text-sm leading-6 text-amber-700">
                          The reunion package information has not been published
                          yet.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {errors.packageId?.message && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {errors.packageId.message}
                  </p>
                )}

                <div className="mt-8">
                  <SelectField
                    label="T-Shirt Size"
                    required
                    icon={<FiUsers />}
                    error={errors.tshirtSize?.message}
                    {...register("tshirtSize", {
                      required: "Please select your T-shirt size.",
                    })}
                  >
                    <option value="">Select T-shirt size</option>

                    {TSHIRT_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </SelectField>
                </div>

                {selectedPackage && (
                  <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
                    <div className="flex items-start gap-3">
                      <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

                      <div>
                        <p className="font-semibold text-emerald-900">
                          Selected package
                        </p>

                        <p className="mt-1 text-sm text-emerald-700">
                          {selectedPackage.name ||
                            selectedPackage.title ||
                            "Reunion Package"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* STEP 4 */}
            {currentStep === 4 && (
              <section>
                <StepHeading
                  icon={<FiCheckCircle />}
                  title="Confirm Registration"
                  description="Review your information before submitting."
                />

                <div className="space-y-5 sm:space-y-6">
                  <SummaryCard
                    title="Personal Information"
                    items={[
                      ["Name", watch("name")],
                      ["Email", watch("email")],
                      ["Phone", watch("phone")],
                      ["District", watch("district")],
                      ["City", watch("city")],
                    ]}
                  />

                  <SummaryCard
                    title="School Information"
                    items={[
                      [
                        "Student Type",
                        studentType === "alumni"
                          ? "Alumni / Ex-Student"
                          : "Current Student",
                      ],
                      ["Class", classLevel ? `Class ${classLevel}` : ""],
                      ["Batch Year", watch("batchYear")],
                      ["Department", watch("department") || "Not applicable"],
                    ]}
                  />

                  <SummaryCard
                    title="Reunion Details"
                    items={[
                      [
                        "Event",
                        reunion.title || reunion.name || "School Reunion",
                      ],
                      ["Date", formatDate(reunion.eventDate)],
                      ["Time", getEventTime(reunion)],
                      [
                        "Venue",
                        reunion.venue || reunion.location || "To be announced",
                      ],
                      [
                        "Package",
                        selectedPackage?.name ||
                          selectedPackage?.title ||
                          "Selected package",
                      ],
                      ["T-Shirt", tshirtSize],
                    ]}
                  />

                  <label
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-5 transition ${
                      agreeToRules
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="mt-1 h-5 w-5 shrink-0 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      {...register("agreeToRules", {
                        required: "You must agree to the reunion rules.",
                      })}
                    />

                    <div>
                      <p className="font-semibold text-slate-900">
                        I agree to the reunion rules
                      </p>

                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        I confirm that the information provided above is correct
                        and I agree to follow the rules and guidelines of the
                        school reunion.
                      </p>
                    </div>
                  </label>

                  {errors.agreeToRules?.message && (
                    <p className="text-sm font-medium text-red-600">
                      {errors.agreeToRules.message}
                    </p>
                  )}
                </div>
              </section>
            )}
          </div>

          {/* Form actions */}
          <div className="border-t border-slate-200 bg-slate-50 px-5 py-5 sm:px-7 md:px-10">
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1 || registrationMutation.isPending}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:text-base"
              >
                <FiArrowLeft />
                Previous
              </button>

              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={registrationMutation.isPending}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
                >
                  Continue
                  <FiArrowRight />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={registrationMutation.isPending || !agreeToRules}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:text-base"
                >
                  {registrationMutation.isPending ? (
                    <>
                      <FiLoader className="animate-spin" />
                      Registering...
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
        </form>
      </div>
    </div>
  );
};

/*
 * -----------------------------------------------------------
 * Event Info
 * -----------------------------------------------------------
 */

const EventInfo = ({ icon, label, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-indigo-100 sm:text-xs">
          {label}
        </p>

        <p className="mt-1 break-words text-sm font-semibold leading-6 sm:text-base">
          {value}
        </p>
      </div>
    </div>
  );
};

/*
 * -----------------------------------------------------------
 * Summary Card
 * -----------------------------------------------------------
 */

const SummaryCard = ({ title, items }) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <h3 className="text-base font-bold text-slate-900 sm:text-lg">{title}</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400 sm:text-xs">
              {label}
            </p>

            <p className="mt-1 break-words text-sm font-semibold leading-6 text-slate-700">
              {value || "Not provided"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

/*
 * -----------------------------------------------------------
 * Step Heading
 * -----------------------------------------------------------
 */

const StepHeading = ({ icon, title, description }) => {
  return (
    <div className="mb-7 sm:mb-8">
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 sm:h-12 sm:w-12">
          {icon}
        </div>

        <div className="min-w-0">
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

/*
 * -----------------------------------------------------------
 * Input Field
 * -----------------------------------------------------------
 */

const InputField = ({ label, icon, error, required, ...props }) => {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <input
          {...props}
          className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          } disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500`}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

/*
 * -----------------------------------------------------------
 * Select Field
 * -----------------------------------------------------------
 */

const SelectField = ({ label, icon, error, required, children, ...props }) => {
  return (
    <div className="min-w-0">
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}

        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}

        <select
          {...props}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 pr-10 text-sm text-slate-900 outline-none transition ${
            icon ? "pl-10" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
          }`}
        >
          {children}
        </select>

        <FiChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
      </div>

      {error && (
        <p className="mt-1.5 text-xs font-medium leading-5 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default ReunionRegister;
