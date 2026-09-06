import { useEffect, useMemo, useState } from "react";

import { Link, useLocation, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";

import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiCalendar,
  FiCheckCircle,
  FiEye,
  FiEyeOff,
  FiHeart,
  FiLock,
  FiMail,
  FiPhone,
  FiShield,
  FiUser,
  FiUsers,
} from "react-icons/fi";

import GoogleSign from "../Auth/GoogleSign";

import useAuth from "../hooks/useAuth";

/*
|--------------------------------------------------------------------------
| CONSTANTS
|--------------------------------------------------------------------------
*/

const CLASS_OPTIONS = [
  {
    value: "6",
    label: "Class 6",
  },
  {
    value: "7",
    label: "Class 7",
  },
  {
    value: "8",
    label: "Class 8",
  },
  {
    value: "9",
    label: "Class 9",
  },
  {
    value: "10",
    label: "Class 10 / SSC",
  },
];

const DEPARTMENT_OPTIONS = [
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

const CURRENT_YEAR = new Date().getFullYear();

const MIN_BATCH_YEAR = 1950;

const MAX_BATCH_YEAR = CURRENT_YEAR + 10;

const DEFAULT_FORM_VALUES = {
  name: "",
  email: "",
  phone: "",
  studentType: "alumni",
  classLevel: "",
  batchYear: "",
  department: "",
  password: "",
  confirmPassword: "",
  agreeToTerms: false,
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

const UserRegister = () => {
  const navigate = useNavigate();

  const location = useLocation();

  /*
  |--------------------------------------------------------------------------
  | AUTH
  |--------------------------------------------------------------------------
  */

  const { usersignup, user, loading: authLoading } = useAuth();

  /*
  |--------------------------------------------------------------------------
  | LOCAL STATE
  |--------------------------------------------------------------------------
  */

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | FORM
  |--------------------------------------------------------------------------
  */

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: DEFAULT_FORM_VALUES,
  });

  /*
  |--------------------------------------------------------------------------
  | WATCH VALUES
  |--------------------------------------------------------------------------
  */

  const studentType = watch("studentType");

  const classLevel = watch("classLevel");

  const password = watch("password");

  const agreeToTerms = watch("agreeToTerms");

  /*
  |--------------------------------------------------------------------------
  | DEPARTMENT REQUIREMENT
  |--------------------------------------------------------------------------
  */

  const requiresDepartment = classLevel === "9" || classLevel === "10";

  /*
  |--------------------------------------------------------------------------
  | CLEAR DEPARTMENT WHEN NOT REQUIRED
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!requiresDepartment) {
      setValue("department", "", {
        shouldValidate: false,
        shouldDirty: false,
      });
    }
  }, [requiresDepartment, setValue]);

  /*
  |--------------------------------------------------------------------------
  | REDIRECT IF ALREADY AUTHENTICATED
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (authLoading || !user) {
      return;
    }

    const from = location.state?.from?.pathname || "/dashboard/profile";

    navigate(from, {
      replace: true,
    });
  }, [authLoading, user, location.state, navigate]);

  /*
  |--------------------------------------------------------------------------
  | PASSWORD STRENGTH
  |--------------------------------------------------------------------------
  */

  const passwordStrength = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 6) {
      score += 1;
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    }

    if (/[0-9]/.test(password)) {
      score += 1;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score += 1;
    }

    if (score <= 2) {
      return {
        score,
        label: "Weak password",
        width: "35%",
      };
    }

    if (score <= 3) {
      return {
        score,
        label: "Good password",
        width: "65%",
      };
    }

    return {
      score,
      label: "Strong password",
      width: "100%",
    };
  }, [password]);

  /*
  |--------------------------------------------------------------------------
  | INPUT CLASS
  |--------------------------------------------------------------------------
  */

  const inputClass = (fieldError) => `
    w-full
    rounded-xl
    border
    bg-white
    px-4
    py-3.5
    text-sm
    text-slate-900
    outline-none
    transition
    placeholder:text-slate-400
    focus:ring-4
    ${
      fieldError
        ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
        : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
    }
  `;

  /*
  |--------------------------------------------------------------------------
  | AUTH ERROR MESSAGE
  |--------------------------------------------------------------------------
  */

  const getAuthErrorMessage = (error) => {
    const code = error?.code;

    switch (code) {
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Your password is too weak.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/operation-not-allowed":
        return "This authentication method is currently disabled.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a while and try again.";

      case "auth/user-disabled":
        return "This account has been disabled.";

      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";

      case "auth/popup-blocked":
        return "Your browser blocked the Google sign-in popup.";

      case "auth/cancelled-popup-request":
        return "Another Google sign-in popup is already open.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another sign-in method.";

      default:
        return (
          error?.response?.data?.message ||
          error?.message ||
          "Registration failed. Please try again."
        );
    }
  };

  /*
  |--------------------------------------------------------------------------
  | EMAIL / PASSWORD REGISTRATION
  |--------------------------------------------------------------------------
  */

  const onSubmit = async (data) => {
    if (submitting) {
      return;
    }

    setSubmitError("");

    setSubmitting(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | SCHOOL PROFILE
      |--------------------------------------------------------------------------
      |
      | Only school-related information is placed inside
      | the MongoDB user's profile object.
      |
      */

      const profile = {
        studentType: data.studentType,

        classLevel: data.classLevel,

        batchYear: data.batchYear ? Number(data.batchYear) : null,

        department: requiresDepartment ? data.department : null,
      };

      /*
      |--------------------------------------------------------------------------
      | FIREBASE + BACKEND REGISTRATION
      |--------------------------------------------------------------------------
      |
      | usersignup()
      |
      | Firebase Authentication
      |          ↓
      | Firebase User
      |          ↓
      | Firebase ID Token
      |          ↓
      | POST /api/users
      |          ↓
      | MongoDB usersCollection
      |
      | AuthProvider handles the complete synchronization.
      |
      */

      await usersignup(data.email.trim().toLowerCase(), data.password, {
        name: data.name.trim(),

        phone: data.phone.trim(),

        profile,
      });

      /*
      |--------------------------------------------------------------------------
      | SUCCESS
      |--------------------------------------------------------------------------
      |
      | After successful registration, go directly to homepage.
      |
      */

      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Registration error:", error);

      setSubmitError(getAuthErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING STATE
  |--------------------------------------------------------------------------
  */

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div
          className="flex flex-col items-center text-center"
          role="status"
          aria-live="polite"
        >
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 text-sm font-semibold text-slate-600">
            Checking your account...
          </p>
        </div>
      </main>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | MAIN UI
  |--------------------------------------------------------------------------
  */

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50">
      <div className="grid min-h-screen lg:grid-cols-[0.82fr_1.18fr]">
        {/* =========================================================
            LEFT BRAND PANEL
        ========================================================== */}

        <section className="relative hidden overflow-hidden bg-slate-950 lg:flex">
          {/* Decorative backgrounds */}

          <div className="absolute -left-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-3xl" />

          <div className="absolute -bottom-32 -right-32 h-[30rem] w-[30rem] rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="absolute inset-0 opacity-[0.035]">
            <div
              className="h-full w-full"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
                backgroundSize: "42px 42px",
              }}
            />
          </div>

          <div className="relative z-10 flex min-h-screen w-full flex-col justify-between p-8 xl:p-12 2xl:p-16">
            {/* Brand */}

            <div>
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-black text-white shadow-lg shadow-blue-600/20">
                  <FiBookOpen aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm font-black text-white">
                    Our Beloved School
                  </p>

                  <p className="text-xs text-slate-500">School Reunion 2027</p>
                </div>
              </Link>
            </div>

            {/* Main Content */}

            <div className="my-auto max-w-xl py-12 xl:py-16">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-200 backdrop-blur">
                <FiAward className="text-blue-400" aria-hidden="true" />
                76+ Years of Legacy
              </div>

              <h1 className="mt-7 text-4xl font-black leading-[1.05] tracking-tight text-white xl:text-5xl 2xl:text-6xl">
                Your school story
                <span className="block text-blue-400">starts here.</span>
              </h1>

              <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300 xl:text-base">
                Create your account and become part of the digital school
                community. Reconnect with classmates, preserve memories, and
                join the Grand School Reunion.
              </p>

              {/* Features */}

              <div className="mt-9 space-y-5">
                {[
                  {
                    icon: FiUsers,
                    title: "Join the alumni community",
                    description:
                      "Stay connected with classmates and generations of alumni.",
                  },
                  {
                    icon: FiCalendar,
                    title: "Register for the reunion",
                    description:
                      "Complete your reunion registration and event information.",
                  },
                  {
                    icon: FiHeart,
                    title: "Keep the memories alive",
                    description:
                      "Be part of a community built around shared school memories.",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.title} className="flex gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-blue-300">
                        <Icon aria-hidden="true" />
                      </div>

                      <div>
                        <h3 className="text-sm font-bold text-white">
                          {item.title}
                        </h3>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quote */}

            <div className="border-t border-white/10 pt-7">
              <p className="max-w-lg text-sm italic leading-7 text-slate-400">
                “The school years may end, but the friendships and memories can
                stay with us for a lifetime.”
              </p>

              <p className="mt-3 text-xs font-bold uppercase tracking-wider text-blue-400">
                One School. One Family.
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================
            RIGHT REGISTER PANEL
        ========================================================== */}

        <section className="flex min-h-screen items-center justify-center px-3 py-6 sm:px-5 sm:py-8 md:px-8 lg:px-10 xl:px-14 2xl:px-20">
          <div className="w-full max-w-2xl">
            {/* Mobile Brand */}

            <div className="mb-7 lg:hidden">
              <Link to="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-lg text-white">
                  <FiBookOpen aria-hidden="true" />
                </div>

                <div>
                  <p className="text-sm font-black text-slate-950">
                    Our Beloved School
                  </p>

                  <p className="text-xs text-slate-400">School Reunion 2027</p>
                </div>
              </Link>
            </div>

            {/* Heading */}

            <div className="mb-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
                    Create your account
                  </p>

                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
                    Join our school community.
                  </h2>
                </div>

                <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-600 sm:flex">
                  <FiUsers aria-hidden="true" />
                </div>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Create your account to connect with your school community and
                participate in reunion activities.
              </p>
            </div>

            {/* Error */}

            {submitError && (
              <div
                className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4"
                role="alert"
              >
                <div className="flex gap-3">
                  <FiShield className="mt-0.5 shrink-0 text-red-500" />

                  <div>
                    <p className="text-sm font-bold text-red-700">
                      Registration could not be completed
                    </p>

                    <p className="mt-1 text-xs leading-5 text-red-600">
                      {submitError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Registration Card */}

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/60 sm:rounded-[2rem] sm:p-6 md:p-7">
              {/* =================================================
                  GOOGLE REGISTRATION
              ================================================== */}

              <GoogleSign
                redirectTo="/"
                buttonText="Continue with Google"
                disabled={submitting}
              />

              {/* Divider */}

              <div className="my-6 flex items-center gap-3 sm:my-7 sm:gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-[10px] font-semibold tracking-wider text-slate-400 sm:text-xs">
                  OR REGISTER WITH EMAIL
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* =================================================
                  FORM
              ================================================== */}

              <form onSubmit={handleSubmit(onSubmit)} noValidate>
                {/* =================================================
                    BASIC INFORMATION
                ================================================== */}

                <div>
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600">
                      01
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        Basic information
                      </h3>

                      <p className="text-xs text-slate-400">
                        Tell us a little about yourself.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Name */}

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiUser
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          id="name"
                          type="text"
                          placeholder="Enter your full name"
                          autoComplete="name"
                          maxLength={100}
                          disabled={submitting}
                          className={`${inputClass(errors.name)} pl-11`}
                          {...register("name", {
                            required: "Full name is required.",

                            minLength: {
                              value: 2,
                              message: "Name should be at least 2 characters.",
                            },

                            maxLength: {
                              value: 100,
                              message: "Name cannot exceed 100 characters.",
                            },

                            validate: (value) =>
                              value.trim().length >= 2 ||
                              "Please enter a valid name.",
                          })}
                        />
                      </div>

                      {errors.name && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
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
                        Email Address <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiMail
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          autoComplete="email"
                          maxLength={254}
                          disabled={submitting}
                          className={`${inputClass(errors.email)} pl-11`}
                          {...register("email", {
                            required: "Email address is required.",

                            pattern: {
                              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                              message: "Please enter a valid email address.",
                            },
                          })}
                        />
                      </div>

                      {errors.email && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    {/* Phone */}

                    <div>
                      <label
                        htmlFor="phone"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Phone Number <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiPhone
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          id="phone"
                          type="tel"
                          placeholder="+880 1XXX-XXXXXX"
                          autoComplete="tel"
                          maxLength={20}
                          disabled={submitting}
                          className={`${inputClass(errors.phone)} pl-11`}
                          {...register("phone", {
                            required: "Phone number is required.",

                            pattern: {
                              value: /^[0-9+\-\s()]{7,20}$/,
                              message: "Please enter a valid phone number.",
                            },
                          })}
                        />
                      </div>

                      {errors.phone && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* =================================================
                    SCHOOL INFORMATION
                ================================================== */}

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600">
                      02
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        School information
                      </h3>

                      <p className="text-xs text-slate-400">
                        Help us understand your school journey.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    {/* Student Type */}

                    <div className="sm:col-span-2">
                      <label className="mb-3 block text-sm font-bold text-slate-700">
                        I am a <span className="text-red-500">*</span>
                      </label>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Current Student */}

                        <label
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            studentType === "current"
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="current"
                            className="sr-only"
                            disabled={submitting}
                            {...register("studentType", {
                              required: "Please select your student type.",
                            })}
                          />

                          <div className="flex items-start gap-3">
                            <FiBookOpen
                              className={`mt-0.5 text-lg ${
                                studentType === "current"
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                              aria-hidden="true"
                            />

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Current Student
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Currently studying at the school
                              </p>
                            </div>
                          </div>
                        </label>

                        {/* Alumni */}

                        <label
                          className={`cursor-pointer rounded-2xl border p-4 transition ${
                            studentType === "alumni"
                              ? "border-blue-500 bg-blue-50 ring-2 ring-blue-500/10"
                              : "border-slate-200 bg-white hover:border-slate-300"
                          }`}
                        >
                          <input
                            type="radio"
                            value="alumni"
                            className="sr-only"
                            disabled={submitting}
                            {...register("studentType", {
                              required: "Please select your student type.",
                            })}
                          />

                          <div className="flex items-start gap-3">
                            <FiAward
                              className={`mt-0.5 text-lg ${
                                studentType === "alumni"
                                  ? "text-blue-600"
                                  : "text-slate-400"
                              }`}
                              aria-hidden="true"
                            />

                            <div>
                              <p className="text-sm font-bold text-slate-900">
                                Alumni
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                Former student of the school
                              </p>
                            </div>
                          </div>
                        </label>
                      </div>

                      {errors.studentType && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.studentType.message}
                        </p>
                      )}
                    </div>

                    {/* Class */}

                    <div>
                      <label
                        htmlFor="classLevel"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Class <span className="text-red-500">*</span>
                      </label>

                      <select
                        id="classLevel"
                        disabled={submitting}
                        className={inputClass(errors.classLevel)}
                        {...register("classLevel", {
                          required: "Please select your class.",
                        })}
                      >
                        <option value="">Select class</option>

                        {CLASS_OPTIONS.map((item) => (
                          <option key={item.value} value={item.value}>
                            {item.label}
                          </option>
                        ))}
                      </select>

                      {errors.classLevel && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
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
                        Batch / SSC Year
                      </label>

                      <input
                        id="batchYear"
                        type="number"
                        min={MIN_BATCH_YEAR}
                        max={MAX_BATCH_YEAR}
                        inputMode="numeric"
                        placeholder="e.g. 2008"
                        disabled={submitting}
                        className={inputClass(errors.batchYear)}
                        {...register("batchYear", {
                          validate: (value) => {
                            if (!value) {
                              return true;
                            }

                            const year = Number(value);

                            if (
                              !Number.isInteger(year) ||
                              year < MIN_BATCH_YEAR ||
                              year > MAX_BATCH_YEAR
                            ) {
                              return `Please enter a year between ${MIN_BATCH_YEAR} and ${MAX_BATCH_YEAR}.`;
                            }

                            return true;
                          },
                        })}
                      />

                      {errors.batchYear && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.batchYear.message}
                        </p>
                      )}
                    </div>

                    {/* Department */}

                    {requiresDepartment && (
                      <div className="sm:col-span-2">
                        <label
                          htmlFor="department"
                          className="mb-2 block text-sm font-bold text-slate-700"
                        >
                          Department <span className="text-red-500">*</span>
                        </label>

                        <select
                          id="department"
                          disabled={submitting}
                          className={inputClass(errors.department)}
                          {...register("department", {
                            required: "Please select your department.",
                          })}
                        >
                          <option value="">Select department</option>

                          {DEPARTMENT_OPTIONS.map((item) => (
                            <option key={item.value} value={item.value}>
                              {item.label}
                            </option>
                          ))}
                        </select>

                        {errors.department && (
                          <p className="mt-1.5 text-xs font-medium text-red-500">
                            {errors.department.message}
                          </p>
                        )}

                        <p className="mt-1.5 text-xs text-slate-400">
                          Department is required for Class 9 and Class 10 / SSC.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* =================================================
                    ACCOUNT SECURITY
                ================================================== */}

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-black text-blue-600">
                      03
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-950">
                        Account security
                      </h3>

                      <p className="text-xs text-slate-400">
                        Create a secure password for your account.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Password */}

                    <div>
                      <label
                        htmlFor="password"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Password <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiLock
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          autoComplete="new-password"
                          disabled={submitting}
                          className={`${inputClass(
                            errors.password,
                          )} pl-11 pr-12`}
                          {...register("password", {
                            required: "Password is required.",

                            minLength: {
                              value: 6,
                              message:
                                "Password must be at least 6 characters.",
                            },

                            validate: {
                              uppercase: (value) =>
                                /[A-Z]/.test(value) ||
                                "Password must contain an uppercase letter.",

                              special: (value) =>
                                /[^A-Za-z0-9]/.test(value) ||
                                "Password must contain a special character.",
                            },
                          })}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword((previous) => !previous)
                          }
                          disabled={submitting}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>

                      {/* Password Strength */}

                      {password && (
                        <div className="mt-3">
                          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-600 transition-all duration-300"
                              style={{
                                width: passwordStrength.width,
                              }}
                            />
                          </div>

                          <div className="mt-1.5 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <p className="text-xs text-slate-400">
                              Use uppercase, numbers and symbols.
                            </p>

                            <p className="text-xs font-semibold text-slate-500">
                              {passwordStrength.label}
                            </p>
                          </div>
                        </div>
                      )}

                      {errors.password && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.password.message}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password */}

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Confirm Password <span className="text-red-500">*</span>
                      </label>

                      <div className="relative">
                        <FiLock
                          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                          aria-hidden="true"
                        />

                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          autoComplete="new-password"
                          disabled={submitting}
                          className={`${inputClass(
                            errors.confirmPassword,
                          )} pl-11 pr-12`}
                          {...register("confirmPassword", {
                            required: "Please confirm your password.",

                            validate: (value) =>
                              value === password || "Passwords do not match.",
                          })}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword((previous) => !previous)
                          }
                          disabled={submitting}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                          aria-label={
                            showConfirmPassword
                              ? "Hide confirm password"
                              : "Show confirm password"
                          }
                        >
                          {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>

                      {errors.confirmPassword && (
                        <p className="mt-1.5 text-xs font-medium text-red-500">
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Security Notice */}

                  <div className="mt-5 flex gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <FiShield
                      className="mt-0.5 shrink-0 text-blue-600"
                      aria-hidden="true"
                    />

                    <div>
                      <p className="text-xs font-bold text-slate-700">
                        Your account is protected
                      </p>

                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        Your password is securely handled by Firebase
                        Authentication. Never share your password with anyone.
                      </p>
                    </div>
                  </div>
                </div>

                {/* =================================================
                    TERMS
                ================================================== */}

                <div className="mt-8 border-t border-slate-100 pt-8">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      disabled={submitting}
                      className="mt-1 h-4 w-4 shrink-0 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      {...register("agreeToTerms", {
                        required: "You must agree to the terms.",
                      })}
                    />

                    <span className="text-xs leading-6 text-slate-500">
                      I agree to the website{" "}
                      <Link
                        to="/terms"
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Terms of Use
                      </Link>{" "}
                      and{" "}
                      <Link
                        to="/privacy"
                        className="font-bold text-blue-600 hover:underline"
                      >
                        Privacy Policy
                      </Link>
                      . I confirm that the information provided is accurate.
                    </span>
                  </label>

                  {errors.agreeToTerms && (
                    <p className="mt-2 text-xs font-medium text-red-500">
                      {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>

                {/* =================================================
                    SUBMIT
                ================================================== */}

                <button
                  type="submit"
                  disabled={submitting || !agreeToTerms}
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating your account...
                    </>
                  ) : (
                    <>
                      Create My Account
                      <FiArrowRight aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Login */}

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-bold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>

            {/* Trust */}

            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 sm:gap-5">
              <span className="flex items-center gap-1.5">
                <FiShield aria-hidden="true" />
                Firebase protected
              </span>

              <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />

              <span className="flex items-center gap-1.5">
                <FiCheckCircle aria-hidden="true" />
                Secure registration
              </span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default UserRegister;
