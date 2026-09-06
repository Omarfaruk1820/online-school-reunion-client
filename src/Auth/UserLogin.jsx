import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";

import {
  FiArrowRight,
  FiAward,
  FiBookOpen,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiShield,
  FiUsers,
} from "react-icons/fi";

import { toast } from "react-hot-toast";

import GoogleSign from "../Auth/GoogleSign";
import useAuth from "../hooks/useAuth";

const REMEMBER_EMAIL_KEY = "remember-email";

const UserLogin = () => {
  const navigate = useNavigate();

  /*
   * ------------------------------------------------------------
   * AUTH CONTEXT
   * ------------------------------------------------------------
   */

  const { userLogin, user, loading: authLoading, resetPassword } = useAuth();

  /*
   * ------------------------------------------------------------
   * LOCAL STATE
   * ------------------------------------------------------------
   */

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  /*
   * ------------------------------------------------------------
   * REACT HOOK FORM
   * ------------------------------------------------------------
   */

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  /*
   * ------------------------------------------------------------
   * LOAD REMEMBERED EMAIL
   * ------------------------------------------------------------
   */

  useEffect(() => {
    try {
      const rememberedEmail = localStorage.getItem(REMEMBER_EMAIL_KEY);

      if (rememberedEmail) {
        reset({
          email: rememberedEmail,
          password: "",
        });

        setRememberMe(true);
      }
    } catch (error) {
      console.error("Failed to load remembered email:", error);
    }
  }, [reset]);

  /*
   * ------------------------------------------------------------
   * REDIRECT ALREADY AUTHENTICATED USER
   * ------------------------------------------------------------
   *
   * If a logged-in user manually opens /login,
   * send them to Home.
   */

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/", {
        replace: true,
      });
    }
  }, [user, authLoading, navigate]);

  /*
   * ------------------------------------------------------------
   * FIREBASE ERROR MESSAGE
   * ------------------------------------------------------------
   */

  const getLoginErrorMessage = (error) => {
    switch (error?.code) {
      case "auth/invalid-credential":
        return "Incorrect email or password. Please check your credentials.";

      case "auth/user-not-found":
        return "No account was found with this email address.";

      case "auth/wrong-password":
        return "Incorrect password. Please try again.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/user-disabled":
        return "This account has been disabled. Please contact the organizer.";

      case "auth/too-many-requests":
        return "Too many login attempts. Please wait a while and try again.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/user-token-expired":
        return "Your session expired. Please sign in again.";

      case "auth/operation-not-allowed":
        return "Email and password login is currently unavailable.";

      default:
        return (
          error?.response?.data?.message ||
          "Unable to sign in. Please try again."
        );
    }
  };

  /*
   * ------------------------------------------------------------
   * EMAIL / PASSWORD LOGIN
   * ------------------------------------------------------------
   */

  const onSubmit = async (data) => {
    if (isSubmitting || authLoading) {
      return;
    }

    try {
      setIsSubmitting(true);

      const email = data.email.trim().toLowerCase();

      /*
       * Firebase login + backend synchronization
       */
      const firebaseUser = await userLogin(email, data.password);

      /*
       * Remember email
       */
      if (rememberMe) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      /*
       * Get the best available user name.
       *
       * user may update asynchronously through AuthProvider,
       * so Firebase user is used as a fallback.
       */
      const userName =
        user?.name?.trim() ||
        firebaseUser?.displayName?.trim() ||
        email.split("@")[0] ||
        "User";

      /*
       * Success toast
       */
      toast.success(`Welcome back, ${userName}! Login successful.`, {
        position: "top-right",
        duration: 3000,
      });

      /*
       * Redirect Home
       */
      navigate("/", {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(getLoginErrorMessage(error), {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * FORGOT PASSWORD
   * ------------------------------------------------------------
   */

  const handleForgotPassword = async () => {
    if (resetLoading || isSubmitting || authLoading) {
      return;
    }

    const email = getValues("email")?.trim().toLowerCase();

    if (!email) {
      toast.error("Please enter your email address first.", {
        position: "top-right",
      });

      return;
    }

    /*
     * Basic email validation
     */
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address.", {
        position: "top-right",
      });

      return;
    }

    try {
      setResetLoading(true);

      /*
       * Password reset is handled by AuthProvider.
       */
      await resetPassword(email);

      toast.success("Password reset email sent. Please check your inbox.", {
        position: "top-right",
        duration: 4000,
      });
    } catch (error) {
      console.error("Password reset error:", error);

      let message = "Unable to send password reset email.";

      switch (error?.code) {
        case "auth/user-not-found":
          message = "No account was found with this email address.";
          break;

        case "auth/invalid-email":
          message = "Please enter a valid email address.";
          break;

        case "auth/too-many-requests":
          message = "Too many requests. Please try again later.";
          break;

        case "auth/network-request-failed":
          message = "Network error. Please check your internet connection.";
          break;

        default:
          message = error?.response?.data?.message || message;
      }

      toast.error(message, {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setResetLoading(false);
    }
  };

  /*
   * ------------------------------------------------------------
   * FORM LOADING
   * ------------------------------------------------------------
   */

  const formLoading = isSubmitting || authLoading;

  /*
   * ------------------------------------------------------------
   * UI
   * ------------------------------------------------------------
   */

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="relative min-h-screen overflow-hidden">
        {/* ================================================
            DECORATIVE BACKGROUND
        ================================================= */}

        <div className="pointer-events-none absolute -left-32 -top-32 h-80 w-80 rounded-full bg-blue-100/60 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-100/60 blur-3xl" />

        <div className="pointer-events-none absolute right-[15%] top-[15%] hidden h-24 w-24 rounded-full border border-blue-200/60 lg:block" />

        <div className="pointer-events-none absolute bottom-[15%] left-[10%] hidden h-16 w-16 rounded-full border border-indigo-200/60 lg:block" />

        <div className="relative mx-auto grid min-h-screen max-w-7xl grid-cols-1 lg:grid-cols-2">
          {/* =================================================
              LEFT PANEL
          ================================================== */}

          <div className="relative hidden overflow-hidden bg-slate-950 lg:flex">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-950 via-slate-950 to-indigo-950" />

            <div className="absolute -right-32 -top-32 h-96 w-96 rounded-full border border-white/10" />

            <div className="absolute -bottom-40 -left-40 h-[28rem] w-[28rem] rounded-full border border-white/10" />

            <div className="absolute right-20 top-24 h-3 w-3 rounded-full bg-blue-400" />

            <div className="absolute bottom-28 left-24 h-2 w-2 rounded-full bg-white/40" />

            <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
              {/* Brand */}

              <div>
                <Link to="/" className="group inline-flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-xl backdrop-blur">
                    <FiAward className="h-7 w-7" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-300">
                      School Reunion
                    </p>

                    <h1 className="mt-1 text-xl font-bold text-white">
                      76 Years of Legacy
                    </h1>
                  </div>
                </Link>
              </div>

              {/* Story */}

              <div className="max-w-xl">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-300/20 bg-blue-400/10 px-4 py-2 text-sm font-medium text-blue-200">
                  <FiUsers className="h-4 w-4" />

                  <span>One School. One Family.</span>
                </div>

                <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white xl:text-6xl">
                  Welcome back to the place where
                  <span className="mt-2 block text-blue-300">
                    memories never fade.
                  </span>
                </h2>

                <p className="mt-7 max-w-lg text-base leading-8 text-slate-300 xl:text-lg">
                  Sign in to reconnect with your school community, manage your
                  reunion registration, update your profile, and stay connected
                  with generations of alumni.
                </p>

                {/* Feature Cards */}

                <div className="mt-9 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:bg-white/[0.09]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                      <FiBookOpen className="h-5 w-5" />
                    </div>

                    <h3 className="font-semibold text-white">
                      Your School Story
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Keep your academic and alumni information connected to the
                      school community.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm transition hover:bg-white/[0.09]">
                    <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-blue-300">
                      <FiUsers className="h-5 w-5" />
                    </div>

                    <h3 className="font-semibold text-white">
                      Reunion Community
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-400">
                      Stay connected with classmates, alumni, teachers, and the
                      wider school family.
                    </p>
                  </div>
                </div>
              </div>

              {/* Security */}

              <div className="flex items-center gap-3 text-sm text-slate-400">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <FiShield className="h-4 w-4 text-blue-300" />
                </div>

                <span>Secure authentication powered by Firebase</span>
              </div>
            </div>
          </div>

          {/* =================================================
              RIGHT PANEL
          ================================================== */}

          <div className="flex items-center justify-center px-5 py-10 sm:px-8 lg:px-12 xl:px-16">
            <div className="w-full max-w-md">
              {/* Mobile Brand */}

              <div className="mb-8 lg:hidden">
                <Link to="/" className="inline-flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-950 text-white shadow-lg">
                    <FiAward className="h-6 w-6" />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                      School Reunion
                    </p>

                    <p className="font-bold text-slate-900">
                      76 Years of Legacy
                    </p>
                  </div>
                </Link>
              </div>

              {/* Heading */}

              <div className="mb-8">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Member Login
                </div>

                <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                  Welcome back
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
                  Sign in to access your reunion account and continue your
                  school journey.
                </p>
              </div>

              {/* Login Card */}

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_20px_70px_-30px_rgba(15,23,42,0.35)] sm:p-8">
                {/* =========================================
                    GOOGLE LOGIN
                ========================================== */}

                <GoogleSign
                  redirectTo="/"
                  buttonText="Continue with Google"
                  disabled={formLoading}
                />

                {/* Divider */}

                <div className="my-7 flex items-center gap-4">
                  <div className="h-px flex-1 bg-slate-200" />

                  <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                    or continue with email
                  </span>

                  <div className="h-px flex-1 bg-slate-200" />
                </div>

                {/* =========================================
                    LOGIN FORM
                ========================================== */}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email */}

                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-slate-700"
                    >
                      Email address
                    </label>

                    <div className="relative">
                      <FiMail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        disabled={formLoading}
                        {...register("email", {
                          required: "Email address is required.",

                          pattern: {
                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,

                            message: "Please enter a valid email address.",
                          },
                        })}
                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                          errors.email
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />
                    </div>

                    {errors.email && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label
                        htmlFor="password"
                        className="block text-sm font-semibold text-slate-700"
                      >
                        Password
                      </label>

                      <button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={resetLoading || formLoading}
                        className="text-xs font-semibold text-blue-600 transition hover:text-blue-700 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {resetLoading ? "Sending..." : "Forgot password?"}
                      </button>
                    </div>

                    <div className="relative">
                      <FiLock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        disabled={formLoading}
                        {...register("password", {
                          required: "Password is required.",
                        })}
                        className={`w-full rounded-xl border bg-slate-50 py-3.5 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                          errors.password
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-100"
                        } disabled:cursor-not-allowed disabled:opacity-60`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((previous) => !previous)}
                        disabled={formLoading}
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed"
                      >
                        {showPassword ? (
                          <FiEyeOff className="h-5 w-5" />
                        ) : (
                          <FiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-2 text-xs font-medium text-red-600">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Remember Me */}

                  <div>
                    <label className="inline-flex cursor-pointer items-center gap-3">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(event) =>
                          setRememberMe(event.target.checked)
                        }
                        disabled={formLoading}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-blue-500"
                      />

                      <span className="text-sm text-slate-600">
                        Remember my email
                      </span>
                    </label>
                  </div>

                  {/* Login Button */}

                  <button
                    type="submit"
                    disabled={formLoading}
                    className="group flex w-full items-center justify-center gap-3 rounded-xl bg-slate-950 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition duration-200 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-blue-700/20 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign in to your account
                        <FiArrowRight className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                {/* Register */}

                <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                  <p className="text-sm text-slate-500">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="font-bold text-blue-600 transition hover:text-blue-700 hover:underline"
                    >
                      Create your account
                    </Link>
                  </p>
                </div>
              </div>

              {/* Security */}

              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <FiShield className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700">
                    Your account is protected
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Your authentication is securely handled through Firebase.
                    School profile and reunion information are managed through
                    our protected backend.
                  </p>
                </div>
              </div>

              {/* Footer */}

              <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-slate-400">
                <Link to="/" className="transition hover:text-slate-700">
                  Home
                </Link>

                <span>•</span>

                <Link
                  to="/reunionregister"
                  className="transition hover:text-slate-700"
                >
                  Reunion 2027
                </Link>

                <span>•</span>

                <Link to="/contact" className="transition hover:text-slate-700">
                  Contact
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default UserLogin;
