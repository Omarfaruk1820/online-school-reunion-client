import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiChevronDown,
  FiClock,
  FiGift,
  FiHeart,
  FiInfo,
  FiLock,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiShield,
  FiShoppingBag,
  FiStar,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

// Replace this with your axiosSecure instance when authentication is ready.
// Example:
// import axiosSecure from "../../api/axiosSecure";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const axiosPublic = axios.create({
  baseURL: API_URL,
  timeout: 15000,
});

const CLASS_LEVELS = [
  { value: "6", label: "Class 6" },
  { value: "7", label: "Class 7" },
  { value: "8", label: "Class 8" },
  { value: "9", label: "Class 9" },
  { value: "10", label: "Class 10 / SSC" },
];

const STUDENT_TYPES = [
  {
    value: "current",
    label: "Current Student",
    description: "I am currently studying at the school.",
    icon: FiBookOpen,
  },
  {
    value: "alumni",
    label: "Former Student / Alumni",
    description: "I studied at this school in the past.",
    icon: FiUsers,
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

const TSHIRT_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL"];

const DEFAULT_EVENT = {
  title: "Grand School Reunion 2027",
  shortTitle: "Grand Reunion 2027",
  edition: "76 Years Celebration",
  eventDate: "2027-02-22",
  startTime: "09:00",
  endTime: "17:00",
  venue: {
    name: "School Campus",
    address: "Our Beloved School Campus",
  },
  registrationOpen: true,
  registrationDeadline: null,
  paymentRequired: false,
  description:
    "A special gathering of our students, alumni, teachers and friends to celebrate our shared memories, friendships and the legacy of our school.",
};

const DEFAULT_PACKAGE = {
  id: "general",
  name: "General Reunion Package",
  description: "Official reunion package provided to registered participants.",
  items: [
    "Commemorative Reunion Bag",
    "Reunion Mug",
    "Souvenir Pen",
    "School Crest",
    "Official Reunion T-Shirt",
    "Additional Commemorative Gifts",
  ],
};

const fetchReunionEvent = async () => {
  try {
    const response = await axiosPublic.get("/reunion");

    return response?.data?.data || response?.data || DEFAULT_EVENT;
  } catch (error) {
    // During initial frontend development, use the local fallback.
    // Once backend is ready, you can remove this fallback.
    console.warn("Reunion event API unavailable:", error.message);

    return DEFAULT_EVENT;
  }
};

const registerForReunion = async (payload) => {
  // When your axiosSecure is ready, replace axiosPublic with axiosSecure.
  const response = await axiosPublic.post("/reunion/register", payload);

  return response.data;
};

const formatEventDate = (date) => {
  if (!date) return "Date will be announced";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
};

const getEventDay = (date) => {
  if (!date) return "";

  const parsedDate = new Date(`${date}T00:00:00`);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(parsedDate);
};

const formatTime = (time) => {
  if (!time) return "";

  const [hours, minutes] = time.split(":");

  if (hours === undefined || minutes === undefined) {
    return time;
  }

  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0, 0);

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
};

const ReunionRegister = () => {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [registrationResult, setRegistrationResult] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onTouched",
    defaultValues: {
      studentType: "",
      name: "",
      email: "",
      phone: "",
      classLevel: "",
      batchYear: "",
      department: "",
      district: "",
      city: "",
      tShirtSize: "",
      packageId: DEFAULT_PACKAGE.id,
      agreeToRules: false,
    },
  });

  const studentType = watch("studentType");
  const classLevel = watch("classLevel");
  const selectedSize = watch("tShirtSize");
  const agreedToRules = watch("agreeToRules");

  const { data: reunion = DEFAULT_EVENT, isLoading: reunionLoading } = useQuery(
    {
      queryKey: ["reunion-event"],
      queryFn: fetchReunionEvent,
      staleTime: 2 * 60 * 1000,
    },
  );

  const registrationMutation = useMutation({
    mutationFn: registerForReunion,

    onSuccess: (data) => {
      setRegistrationResult(data);
      setRegistrationComplete(true);

      toast.success("Registration completed successfully!");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },

    onError: (error) => {
      const status = error?.response?.status;
      const message =
        error?.response?.data?.message ||
        "Registration could not be completed. Please try again.";

      if (status === 401) {
        toast.error("Please login before registering for the reunion.");
        navigate("/login");
        return;
      }

      if (status === 409) {
        toast.error("You have already registered for this reunion.");
        return;
      }

      if (status === 403) {
        toast.error("Reunion registration is currently closed.");
        return;
      }

      toast.error(message);
    },
  });

  const registrationClosed = reunion?.registrationOpen === false;

  const isDepartmentRequired = classLevel === "9" || classLevel === "10";

  useEffect(() => {
    if (!isDepartmentRequired) {
      setValue("department", "");
    }
  }, [isDepartmentRequired, setValue]);

  const steps = [
    {
      number: 1,
      title: "Personal Information",
      shortTitle: "Personal",
      icon: FiUser,
    },
    {
      number: 2,
      title: "School Information",
      shortTitle: "School",
      icon: FiBookOpen,
    },
    {
      number: 3,
      title: "Reunion Package",
      shortTitle: "Package",
      icon: FiGift,
    },
    {
      number: 4,
      title: "Confirmation",
      shortTitle: "Confirm",
      icon: FiCheckCircle,
    },
  ];

  const validateCurrentStep = async () => {
    let fields = [];

    if (currentStep === 1) {
      fields = ["studentType", "name", "email", "phone"];
    }

    if (currentStep === 2) {
      fields = ["classLevel", "batchYear", "district", "city"];

      if (isDepartmentRequired) {
        fields.push("department");
      }
    }

    if (currentStep === 3) {
      fields = ["tShirtSize", "packageId"];
    }

    const valid = await trigger(fields);

    return valid;
  };

  const goNext = async () => {
    const valid = await validateCurrentStep();

    if (!valid) {
      toast.error("Please complete the required fields.");
      return;
    }

    setCurrentStep((previous) => Math.min(previous + 1, steps.length));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const goBack = () => {
    setCurrentStep((previous) => Math.max(previous - 1, 1));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const onSubmit = (formData) => {
    if (!agreedToRules) {
      toast.error("Please agree to the reunion registration guidelines.");
      return;
    }

    const payload = {
      participant: {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
      },

      schoolInfo: {
        studentType: formData.studentType,
        classLevel: formData.classLevel,
        batchYear: Number(formData.batchYear),
        department: isDepartmentRequired ? formData.department : null,
      },

      reunion: {
        eventId: reunion?._id || reunion?.id || null,
        packageId: formData.packageId,
        tShirt: {
          size: formData.tShirtSize,
        },
      },

      consent: {
        agreedToRules: true,
      },
    };

    registrationMutation.mutate(payload);
  };

  const packageItems = useMemo(() => {
    if (reunion?.package?.items) {
      return reunion.package.items;
    }

    if (reunion?.packageItems) {
      return reunion.packageItems;
    }

    return DEFAULT_PACKAGE.items;
  }, [reunion]);

  if (registrationComplete) {
    return (
      <RegistrationSuccess
        reunion={reunion}
        registrationResult={registrationResult}
      />
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* =========================================================
          TOP EVENT BAR
      ========================================================== */}
      <section className="bg-slate-950 text-white">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-slate-300">
              <FiShield className="h-4 w-4 text-blue-400" />

              <span>Official School Reunion Registration Portal</span>
            </div>

            <div className="flex items-center gap-2 text-slate-300">
              <FiClock className="h-4 w-4 text-blue-400" />

              <span>{formatEventDate(reunion.eventDate)}</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />
        <div className="absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-slate-100 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pb-10 pt-8 sm:px-6 lg:px-8 lg:pb-14 lg:pt-12">
          <div className="mb-6">
            <Link
              to="/reunion"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
            >
              <FiArrowLeft />
              Back to Reunion
            </Link>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-blue-700">
                <FiStar />

                {reunion.edition || "School Reunion"}
              </div>

              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                Reunion Registration
              </h1>

              <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 sm:text-lg">
                Join your school family for a memorable day of friendship,
                memories, recognition and celebration. Please complete the
                registration form carefully.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 shadow-sm lg:min-w-[280px]">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Registration Status
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`h-3 w-3 rounded-full ${
                    registrationClosed ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />

                <span className="font-bold text-slate-900">
                  {registrationClosed
                    ? "Registration Closed"
                    : "Registration Open"}
                </span>
              </div>

              {!registrationClosed && reunion.registrationDeadline && (
                <p className="mt-2 text-sm text-slate-500">
                  Deadline: {formatEventDate(reunion.registrationDeadline)}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          EVENT SUMMARY
      ========================================================== */}
      <section className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-slate-200 sm:grid-cols-4 px-4 sm:px-6 lg:px-8">
          <EventMiniInfo
            icon={FiClock}
            label="Date"
            value={formatEventDate(reunion.eventDate)}
          />

          <EventMiniInfo
            icon={FiClock}
            label="Time"
            value={`${formatTime(
              reunion.startTime,
            )} – ${formatTime(reunion.endTime)}`}
          />

          <EventMiniInfo
            icon={FiMapPin}
            label="Venue"
            value={reunion?.venue?.name || "School Campus"}
          />

          <EventMiniInfo
            icon={FiUsers}
            label="Participants"
            value="Students & Alumni"
          />
        </div>
      </section>

      {/* =========================================================
          REGISTRATION CONTENT
      ========================================================== */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        {registrationClosed ? (
          <RegistrationClosed reunion={reunion} />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
            {/* FORM AREA */}
            <div>
              {/* Progress */}
              <RegistrationProgress currentStep={currentStep} steps={steps} />

              <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
                {/* =====================================================
                    STEP 1
                ====================================================== */}
                {currentStep === 1 && (
                  <StepCard
                    step={steps[0]}
                    title="Tell us about yourself"
                    description="Please provide the contact information that will be used for your reunion registration."
                  >
                    <div className="space-y-7">
                      {/* Student Type */}
                      <div>
                        <FieldLabel label="Participant Type" required />

                        <div className="grid gap-4 sm:grid-cols-2">
                          {STUDENT_TYPES.map((type) => {
                            const Icon = type.icon;
                            const selected = studentType === type.value;

                            return (
                              <label
                                key={type.value}
                                className={`group relative cursor-pointer rounded-2xl border p-5 transition ${
                                  selected
                                    ? "border-blue-500 bg-blue-50/70 shadow-md shadow-blue-100"
                                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                                }`}
                              >
                                <input
                                  type="radio"
                                  value={type.value}
                                  {...register("studentType", {
                                    required:
                                      "Please select your participant type.",
                                  })}
                                  className="sr-only"
                                />

                                <div className="flex items-start gap-4">
                                  <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                      selected
                                        ? "bg-blue-600 text-white"
                                        : "bg-slate-100 text-slate-500"
                                    }`}
                                  >
                                    <Icon className="h-5 w-5" />
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between gap-3">
                                      <h3 className="font-bold text-slate-900">
                                        {type.label}
                                      </h3>

                                      {selected && (
                                        <FiCheckCircle className="h-5 w-5 text-blue-600" />
                                      )}
                                    </div>

                                    <p className="mt-1 text-sm leading-6 text-slate-500">
                                      {type.description}
                                    </p>
                                  </div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        <FieldError message={errors.studentType?.message} />
                      </div>

                      <div className="grid gap-5 md:grid-cols-2">
                        {/* Name */}
                        <FormInput
                          label="Full Name"
                          required
                          placeholder="Enter your full name"
                          icon={FiUser}
                          error={errors.name?.message}
                          {...register("name", {
                            required: "Full name is required.",
                            minLength: {
                              value: 3,
                              message: "Name must be at least 3 characters.",
                            },
                          })}
                        />

                        {/* Email */}
                        <FormInput
                          label="Email Address"
                          required
                          type="email"
                          placeholder="example@email.com"
                          icon={FiInfo}
                          error={errors.email?.message}
                          {...register("email", {
                            required: "Email address is required.",
                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email address.",
                            },
                          })}
                        />

                        {/* Phone */}
                        <FormInput
                          label="Mobile Number"
                          required
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          icon={FiPhone}
                          error={errors.phone?.message}
                          {...register("phone", {
                            required: "Mobile number is required.",
                            pattern: {
                              value: /^01[3-9]\d{8}$/,
                              message:
                                "Please enter a valid Bangladesh mobile number.",
                            },
                          })}
                        />

                        {/* District */}
                        <FormInput
                          label="District"
                          placeholder="e.g. Dhaka"
                          icon={FiMapPin}
                          error={errors.district?.message}
                          {...register("district")}
                        />
                      </div>

                      <InfoNote>
                        Your contact information will be used only for
                        reunion-related communication and registration purposes.
                      </InfoNote>
                    </div>
                  </StepCard>
                )}

                {/* =====================================================
                    STEP 2
                ====================================================== */}
                {currentStep === 2 && (
                  <StepCard
                    step={steps[1]}
                    title="Your school information"
                    description="Help us correctly identify your class, batch and academic group."
                  >
                    <div className="space-y-7">
                      <div className="grid gap-5 md:grid-cols-2">
                        {/* Class */}
                        <FormSelect
                          label="Class / Level"
                          required
                          icon={FiBookOpen}
                          error={errors.classLevel?.message}
                          {...register("classLevel", {
                            required: "Please select your class.",
                          })}
                        >
                          <option value="">Select your class</option>

                          {CLASS_LEVELS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </FormSelect>

                        {/* Batch */}
                        <FormInput
                          label={
                            studentType === "alumni"
                              ? "SSC / Batch Year"
                              : "Batch / Academic Year"
                          }
                          required
                          type="number"
                          placeholder="e.g. 2008"
                          icon={FiAward}
                          error={errors.batchYear?.message}
                          {...register("batchYear", {
                            required: "Batch year is required.",
                            min: {
                              value: 1950,
                              message: "Please enter a valid year.",
                            },
                            max: {
                              value: 2100,
                              message: "Please enter a valid year.",
                            },
                          })}
                        />
                      </div>

                      {/* Department */}
                      {isDepartmentRequired ? (
                        <div>
                          <FieldLabel label="Department" required />

                          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {DEPARTMENTS.map((department) => {
                              const selected =
                                watch("department") === department.value;

                              return (
                                <label
                                  key={department.value}
                                  className={`cursor-pointer rounded-xl border p-4 text-center transition ${
                                    selected
                                      ? "border-blue-500 bg-blue-50 text-blue-700 shadow-sm"
                                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                                  }`}
                                >
                                  <input
                                    type="radio"
                                    value={department.value}
                                    {...register("department", {
                                      required:
                                        "Please select your department.",
                                    })}
                                    className="sr-only"
                                  />

                                  <span className="font-semibold">
                                    {department.label}
                                  </span>
                                </label>
                              );
                            })}
                          </div>

                          <FieldError message={errors.department?.message} />

                          <p className="mt-3 text-xs text-slate-500">
                            Department is required for Class 9 and Class 10 /
                            SSC participants.
                          </p>
                        </div>
                      ) : (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                          <div className="flex gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm">
                              <FiInfo />
                            </div>

                            <div>
                              <h3 className="font-bold text-slate-900">
                                Department not required
                              </h3>

                              <p className="mt-1 text-sm leading-6 text-slate-500">
                                Students from Class 6–8 do not need to select a
                                department.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid gap-5 md:grid-cols-2">
                        <FormInput
                          label="City / Upazila"
                          placeholder="Enter your current city"
                          icon={FiMapPin}
                          {...register("city")}
                        />

                        <FormInput
                          label="District"
                          placeholder="Enter your current district"
                          icon={FiMapPin}
                          {...register("district")}
                        />
                      </div>

                      <InfoNote>
                        Please provide accurate school information. This
                        information will help the organizing committee prepare
                        batch-wise and department-wise reunion records.
                      </InfoNote>
                    </div>
                  </StepCard>
                )}

                {/* =====================================================
                    STEP 3
                ====================================================== */}
                {currentStep === 3 && (
                  <StepCard
                    step={steps[2]}
                    title="Choose your reunion package"
                    description="Every confirmed participant will receive the official reunion package arranged by the organizing committee."
                  >
                    <div className="space-y-8">
                      {/* Package */}
                      <div>
                        <FieldLabel label="Reunion Package" required />

                        <label className="block cursor-pointer rounded-2xl border-2 border-blue-500 bg-blue-50/50 p-5 shadow-sm">
                          <input
                            type="radio"
                            value={DEFAULT_PACKAGE.id}
                            {...register("packageId", {
                              required: "Please select a reunion package.",
                            })}
                            className="sr-only"
                          />

                          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                                <FiPackage className="h-6 w-6" />
                              </div>

                              <div>
                                <h3 className="text-lg font-bold text-slate-950">
                                  {reunion?.package?.name ||
                                    DEFAULT_PACKAGE.name}
                                </h3>

                                <p className="mt-1 text-sm leading-6 text-slate-500">
                                  {reunion?.package?.description ||
                                    DEFAULT_PACKAGE.description}
                                </p>
                              </div>
                            </div>

                            <FiCheckCircle className="h-6 w-6 shrink-0 text-blue-600" />
                          </div>

                          <div className="mt-6 grid gap-3 sm:grid-cols-2">
                            {packageItems.map((item, index) => (
                              <div
                                key={`${item}-${index}`}
                                className="flex items-center gap-3 rounded-xl bg-white p-3"
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                                  <FiCheck className="h-4 w-4" />
                                </span>

                                <span className="text-sm font-medium text-slate-700">
                                  {item}
                                </span>
                              </div>
                            ))}
                          </div>
                        </label>

                        <FieldError message={errors.packageId?.message} />
                      </div>

                      {/* T-shirt */}
                      <div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                          <div>
                            <FieldLabel label="T-Shirt Size" required />

                            <p className="mt-1 text-sm text-slate-500">
                              Select your preferred official reunion T-shirt
                              size.
                            </p>
                          </div>

                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                            One T-Shirt
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-7">
                          {TSHIRT_SIZES.map((size) => {
                            const selected = selectedSize === size;

                            return (
                              <label
                                key={size}
                                className={`cursor-pointer rounded-xl border-2 px-3 py-4 text-center font-bold transition ${
                                  selected
                                    ? "border-blue-600 bg-blue-600 text-white shadow-md shadow-blue-100"
                                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  value={size}
                                  {...register("tShirtSize", {
                                    required:
                                      "Please select your T-shirt size.",
                                  })}
                                  className="sr-only"
                                />

                                {size}
                              </label>
                            );
                          })}
                        </div>

                        <FieldError message={errors.tShirtSize?.message} />
                      </div>

                      {/* Gift Notice */}
                      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                        <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
                          <FiGift className="h-5 w-5 text-blue-600" />

                          <h3 className="font-bold text-slate-900">
                            Your Reunion Gifts
                          </h3>
                        </div>

                        <div className="grid gap-0 divide-y divide-slate-100 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                          <GiftItem
                            icon={FiShoppingBag}
                            title="Commemorative Bag"
                          />

                          <GiftItem icon={FiHeart} title="Reunion Mug" />

                          <GiftItem icon={FiAward} title="School Crest" />

                          <GiftItem icon={FiStar} title="Official T-Shirt" />
                        </div>
                      </div>
                    </div>
                  </StepCard>
                )}

                {/* =====================================================
                    STEP 4
                ====================================================== */}
                {currentStep === 4 && (
                  <StepCard
                    step={steps[3]}
                    title="Review & confirm"
                    description="Please review your information carefully before submitting your reunion registration."
                  >
                    <div className="space-y-6">
                      <ReviewSection title="Personal Information" icon={FiUser}>
                        <ReviewRow label="Name" value={watch("name")} />

                        <ReviewRow label="Email" value={watch("email")} />

                        <ReviewRow label="Mobile" value={watch("phone")} />

                        <ReviewRow label="District" value={watch("district")} />
                      </ReviewSection>

                      <ReviewSection
                        title="School Information"
                        icon={FiBookOpen}
                      >
                        <ReviewRow
                          label="Participant Type"
                          value={
                            studentType === "alumni"
                              ? "Former Student / Alumni"
                              : "Current Student"
                          }
                        />

                        <ReviewRow
                          label="Class"
                          value={
                            CLASS_LEVELS.find(
                              (item) => item.value === classLevel,
                            )?.label
                          }
                        />

                        <ReviewRow
                          label="Batch Year"
                          value={watch("batchYear")}
                        />

                        <ReviewRow
                          label="Department"
                          value={
                            isDepartmentRequired
                              ? DEPARTMENTS.find(
                                  (item) => item.value === watch("department"),
                                )?.label
                              : "Not applicable"
                          }
                        />

                        <ReviewRow label="City" value={watch("city")} />
                      </ReviewSection>

                      <ReviewSection title="Reunion Package" icon={FiGift}>
                        <ReviewRow
                          label="Package"
                          value={reunion?.package?.name || DEFAULT_PACKAGE.name}
                        />

                        <ReviewRow
                          label="T-Shirt Size"
                          value={watch("tShirtSize")}
                        />
                      </ReviewSection>

                      {/* Agreement */}
                      <label className="flex cursor-pointer items-start gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                        <input
                          type="checkbox"
                          {...register("agreeToRules", {
                            required: "You must agree before registration.",
                          })}
                          className="mt-1 h-5 w-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />

                        <span className="text-sm leading-6 text-slate-600">
                          I confirm that the information provided above is
                          accurate. I agree to follow the reunion guidelines and
                          understand that the final package, gift distribution
                          and event arrangements are controlled by the
                          organizing committee.
                        </span>
                      </label>

                      <FieldError message={errors.agreeToRules?.message} />

                      <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-5">
                        <FiShield className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                        <div>
                          <h3 className="font-bold text-slate-900">
                            Your information is protected
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-600">
                            Registration information is stored securely and is
                            used by the reunion organizing team for event
                            preparation, communication and attendance
                            management.
                          </p>
                        </div>
                      </div>
                    </div>
                  </StepCard>
                )}

                {/* =====================================================
                    FORM ACTIONS
                ====================================================== */}
                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={goBack}
                        disabled={registrationMutation.isPending}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        <FiArrowLeft />
                        Previous
                      </button>
                    )}
                  </div>

                  <div>
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={goNext}
                        disabled={registrationMutation.isPending}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        Continue
                        <FiArrowRight />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={
                          registrationMutation.isPending || !agreedToRules
                        }
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-200 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                      >
                        {registrationMutation.isPending ? (
                          <>
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
              </form>
            </div>

            {/* =======================================================
                RIGHT SIDEBAR
            ======================================================== */}
            <aside className="space-y-5 lg:sticky lg:top-6 lg:self-start">
              {/* Event Card */}
              <div className="overflow-hidden rounded-3xl bg-slate-950 text-white shadow-xl">
                <div className="p-6 sm:p-7">
                  <div className="mb-5 flex items-center justify-between">
                    <span className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-300">
                      Reunion 2027
                    </span>

                    <FiAward className="h-6 w-6 text-blue-400" />
                  </div>

                  <h2 className="text-xl font-black leading-tight">
                    {reunion.title}
                  </h2>

                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {reunion.description}
                  </p>

                  <div className="mt-6 space-y-4">
                    <SidebarInfo
                      icon={FiClock}
                      title={getEventDay(reunion.eventDate)}
                      value={formatEventDate(reunion.eventDate)}
                    />

                    <SidebarInfo
                      icon={FiClock}
                      title="Event Time"
                      value={`${formatTime(
                        reunion.startTime,
                      )} – ${formatTime(reunion.endTime)}`}
                    />

                    <SidebarInfo
                      icon={FiMapPin}
                      title={reunion?.venue?.name}
                      value={reunion?.venue?.address || "School Campus"}
                    />
                  </div>
                </div>
              </div>

              {/* Registration Progress Card */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-black text-slate-950">
                  Registration Progress
                </h3>

                <div className="mt-5 space-y-4">
                  {steps.map((step) => {
                    const Icon = step.icon;
                    const completed = currentStep > step.number;
                    const active = currentStep === step.number;

                    return (
                      <div
                        key={step.number}
                        className="flex items-center gap-3"
                      >
                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                            completed
                              ? "bg-emerald-100 text-emerald-600"
                              : active
                                ? "bg-blue-600 text-white"
                                : "bg-slate-100 text-slate-400"
                          }`}
                        >
                          {completed ? (
                            <FiCheck className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>

                        <div>
                          <p
                            className={`text-sm font-bold ${
                              active || completed
                                ? "text-slate-900"
                                : "text-slate-400"
                            }`}
                          >
                            {step.title}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Important Information */}
              <div className="rounded-3xl border border-blue-100 bg-blue-50 p-6">
                <div className="flex items-center gap-3">
                  <FiInfo className="h-5 w-5 text-blue-600" />

                  <h3 className="font-black text-slate-950">Important</h3>
                </div>

                <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    Use your real contact information.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    Select your T-shirt size carefully.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    Registration does not automatically mean attendance
                    check-in.
                  </li>

                  <li className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-600" />
                    Follow official announcements for schedule updates.
                  </li>
                </ul>
              </div>

              {/* Help */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Need Help?
                </p>

                <h3 className="mt-2 font-black text-slate-950">
                  Contact the Reunion Team
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  If you have any questions about registration, please contact
                  the organizing committee.
                </p>

                <Link
                  to="/contact"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-600 transition hover:text-blue-700"
                >
                  Contact Us
                  <FiArrowRight />
                </Link>
              </div>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
};

/* ===============================================================
   EVENT MINI INFO
================================================================ */

const EventMiniInfo = ({ icon: Icon, label, value }) => {
  return (
    <div className="min-w-0 px-3 py-5 sm:px-5 lg:py-6">
      <div className="flex items-start gap-3">
        <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm sm:flex">
          <Icon className="h-5 w-5" />
        </div>

        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 sm:text-xs">
            {label}
          </p>

          <p className="mt-1 truncate text-xs font-bold text-slate-900 sm:text-sm">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

/* ===============================================================
   PROGRESS
================================================================ */

const RegistrationProgress = ({ currentStep, steps }) => {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Registration
          </p>

          <h2 className="mt-1 text-lg font-black text-slate-950">
            Step {currentStep} of {steps.length}
          </h2>
        </div>

        <div className="text-sm font-bold text-blue-600">
          {Math.round((currentStep / steps.length) * 100)}%
        </div>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{
            width: `${(currentStep / steps.length) * 100}%`,
          }}
        />
      </div>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {steps.map((step) => {
          const Icon = step.icon;
          const active = currentStep === step.number;
          const completed = currentStep > step.number;

          return (
            <div
              key={step.number}
              className={`flex flex-col items-center gap-2 text-center ${
                active || completed ? "text-slate-900" : "text-slate-400"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  completed
                    ? "bg-emerald-100 text-emerald-600"
                    : active
                      ? "bg-blue-600 text-white"
                      : "bg-slate-100"
                }`}
              >
                {completed ? (
                  <FiCheck className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>

              <span className="hidden text-[11px] font-bold sm:block">
                {step.shortTitle}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ===============================================================
   STEP CARD
================================================================ */

const StepCard = ({ step, title, description, children }) => {
  const Icon = step.icon;

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 bg-slate-50/70 p-5 sm:p-7">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Step {step.number}
            </p>

            <h2 className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7 lg:p-8">{children}</div>
    </section>
  );
};

/* ===============================================================
   FORM INPUT
================================================================ */

const FormInput = ({
  label,
  required = false,
  icon: Icon,
  error,
  ...props
}) => {
  return (
    <div>
      <FieldLabel label={label} required={required} />

      <div className="relative mt-2">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}

        <input
          {...props}
          className={`w-full rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            Icon ? "pl-12" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          }`}
        />
      </div>

      <FieldError message={error} />
    </div>
  );
};

/* ===============================================================
   FORM SELECT
================================================================ */

const FormSelect = ({
  label,
  required = false,
  icon: Icon,
  error,
  children,
  ...props
}) => {
  return (
    <div>
      <FieldLabel label={label} required={required} />

      <div className="relative mt-2">
        {Icon && (
          <Icon className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
        )}

        <FiChevronDown className="pointer-events-none absolute right-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />

        <select
          {...props}
          className={`w-full appearance-none rounded-xl border bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition ${
            Icon ? "pl-12" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-50"
              : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
          }`}
        >
          {children}
        </select>
      </div>

      <FieldError message={error} />
    </div>
  );
};

/* ===============================================================
   FIELD LABEL
================================================================ */

const FieldLabel = ({ label, required = false }) => {
  return (
    <label className="text-sm font-bold text-slate-800">
      {label}

      {required && <span className="ml-1 text-red-500">*</span>}
    </label>
  );
};

/* ===============================================================
   FIELD ERROR
================================================================ */

const FieldError = ({ message }) => {
  if (!message) return null;

  return <p className="mt-2 text-xs font-medium text-red-500">{message}</p>;
};

/* ===============================================================
   INFO NOTE
================================================================ */

const InfoNote = ({ children }) => {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
      <FiInfo className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

      <p className="text-sm leading-6 text-slate-600">{children}</p>
    </div>
  );
};

/* ===============================================================
   GIFT ITEM
================================================================ */

const GiftItem = ({ icon: Icon, title }) => {
  return (
    <div className="flex items-center gap-4 p-5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-sm font-semibold text-slate-700">{title}</span>
    </div>
  );
};

/* ===============================================================
   REVIEW SECTION
================================================================ */

const ReviewSection = ({ title, icon: Icon, children }) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200">
      <div className="flex items-center gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4">
        <Icon className="h-5 w-5 text-blue-600" />

        <h3 className="font-black text-slate-900">{title}</h3>
      </div>

      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  );
};

/* ===============================================================
   REVIEW ROW
================================================================ */

const ReviewRow = ({ label, value }) => {
  return (
    <div className="grid gap-1 px-5 py-4 sm:grid-cols-[160px_1fr] sm:gap-5">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </span>

      <span className="break-words text-sm font-semibold text-slate-800">
        {value || "Not provided"}
      </span>
    </div>
  );
};

/* ===============================================================
   SIDEBAR INFO
================================================================ */

const SidebarInfo = ({ icon: Icon, title, value }) => {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-blue-300">
        <Icon className="h-4 w-4" />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-500">{title}</p>

        <p className="mt-0.5 text-sm font-semibold text-slate-200">{value}</p>
      </div>
    </div>
  );
};

/* ===============================================================
   REGISTRATION CLOSED
================================================================ */

const RegistrationClosed = ({ reunion }) => {
  return (
    <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <FiLock className="h-7 w-7" />
      </div>

      <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
        Registration Status
      </p>

      <h2 className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
        Registration is currently closed
      </h2>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-500 sm:text-base">
        Registration for <strong>{reunion.title}</strong> is not currently
        accepting new participants. Please check the official reunion
        announcements for future updates.
      </p>

      <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          to="/reunionregister"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <FiArrowLeft />
          Back to Reunion
        </Link>

        <Link
          to="/contact"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          Contact Organizers
        </Link>
      </div>
    </div>
  );
};

/* ===============================================================
   REGISTRATION SUCCESS
================================================================ */

const RegistrationSuccess = ({ reunion, registrationResult }) => {
  const registration =
    registrationResult?.data ||
    registrationResult?.registration ||
    registrationResult;

  const registrationId =
    registration?.registrationId || registration?.id || "Pending";

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-slate-950 px-4 py-16 text-white sm:px-6 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-400/20">
            <FiCheckCircle className="h-10 w-10" />
          </div>

          <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
            Registration Successful
          </p>

          <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-5xl">
            Welcome to the Reunion
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
            Your registration for{" "}
            <strong className="text-white">{reunion.title}</strong> has been
            received successfully.
          </p>
        </div>
      </section>

      <section className="-mt-8 px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
            <div className="rounded-2xl bg-blue-50 p-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-500">
                Your Registration ID
              </p>

              <p className="mt-2 break-all text-2xl font-black tracking-wide text-blue-700 sm:text-3xl">
                {registrationId}
              </p>

              <p className="mt-2 text-sm text-slate-500">
                Please keep this ID safe. You may need it for future reunion
                communication and attendance check-in.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <SuccessInfo label="Event" value={reunion.title} />

              <SuccessInfo
                label="Date"
                value={formatEventDate(reunion.eventDate)}
              />

              <SuccessInfo
                label="Venue"
                value={reunion?.venue?.name || "School Campus"}
              />

              <SuccessInfo label="Status" value="Confirmed" />
            </div>

            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 p-5">
              <FiCheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />

              <p className="text-sm leading-6 text-slate-600">
                Please watch the official school reunion website for schedule
                updates, announcements, attendance instructions and other
                important information.
              </p>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/dashboard/my-registration"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                View My Registration
                <FiArrowRight />
              </Link>

              <Link
                to="/reunion"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Reunion Details
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

/* ===============================================================
   SUCCESS INFO
================================================================ */

const SuccessInfo = ({ label, value }) => {
  return (
    <div className="rounded-2xl border border-slate-200 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
};

export default ReunionRegister;
