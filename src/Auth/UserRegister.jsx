import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  FiArrowRight,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import toast from "react-hot-toast";

import useAuth from "../hooks/useAuth";

const PHONE_REGEX = /^01[3-9]\d{8}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserRegister = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    usersignup,
    signInWithGoogle,
    user,
    loading: authLoading,
  } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const password = watch("password");

  /*
   * Redirect authenticated users who directly visit
   * the registration page.
   *
   * During an active registration request, local loading
   * prevents this redirect from interfering with registration.
   */
  useEffect(() => {
    if (authLoading || loading || !user) {
      return;
    }

    const redirectPath = location.state?.from?.pathname || "/";

    navigate(redirectPath, {
      replace: true,
    });
  }, [authLoading, loading, user, navigate, location.state]);

  /*
   * Get the path where the user should be redirected
   * after successful registration.
   */
  const getRedirectPath = () => {
    return location.state?.from?.pathname || "/";
  };

  /*
   * Convert different Firebase/Axios errors into
   * user-friendly messages.
   */
  const getRegistrationErrorMessage = (err) => {
    if (err?.response?.data?.message) {
      return err.response.data.message;
    }

    switch (err?.code) {
      case "auth/email-already-in-use":
        return "An account already exists with this email address.";

      case "auth/invalid-email":
        return "Please enter a valid email address.";

      case "auth/weak-password":
        return "Password is too weak. Please use a stronger password.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";

      case "auth/operation-not-allowed":
        return "Email/password registration is currently unavailable.";

      case "auth/popup-closed-by-user":
        return "Google registration was cancelled.";

      case "auth/popup-blocked":
        return "Please allow popups in your browser and try again.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with this email using another sign-in method.";

      case "auth/cancelled-popup-request":
        return "Google registration was cancelled. Please try again.";

      default:
        return (
          err?.message ||
          "Registration failed. Please check your information and try again."
        );
    }
  };

  /*
   * Email/password registration
   */
  const handleRegister = async (data) => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const cleanName = data.name.trim();
      const cleanEmail = data.email.trim().toLowerCase();
      const cleanPhone = data.phone.trim();

      /*
       * Extra client-side validation.
       * Server-side validation remains the final authority.
       */
      if (!cleanName) {
        throw new Error("Full name is required.");
      }

      if (cleanName.length < 2) {
        throw new Error("Name must be at least 2 characters.");
      }

      if (cleanName.length > 100) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      if (!EMAIL_REGEX.test(cleanEmail)) {
        throw new Error("Please enter a valid email address.");
      }

      /*
       * IMPORTANT:
       * Never send null or empty phone to AuthProvider/server.
       */
      if (!cleanPhone) {
        throw new Error("Phone number is required.");
      }

      if (!PHONE_REGEX.test(cleanPhone)) {
        throw new Error("Enter a valid Bangladeshi phone number.");
      }

      /*
       * Only send the fields required by AuthProvider
       * and POST /api/users.
       *
       * phone is always a real string here.
       */
      const userInfo = {
        name: cleanName,
        phone: cleanPhone,
      };

      await usersignup(cleanEmail, data.password, userInfo);

      /*
       * Registration succeeded.
       */
      toast.success(`${cleanName}, registration successful!`);

      const redirectPath = getRedirectPath();

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Registration error:", err);

      const errorMessage = getRegistrationErrorMessage(err);

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Google registration / authentication
   *
   * The phone entered in the registration form is passed
   * to AuthProvider.
   *
   * For a NEW Google user:
   * phone is required by the backend.
   *
   * For an EXISTING Google user:
   * AuthProvider can use the existing MongoDB record.
   */
  const handleGoogleRegister = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formValues = getValues();

      const cleanName = formValues.name?.trim() || "";
      const cleanPhone = formValues.phone?.trim() || "";

      /*
       * Do not send null.
       *
       * If the field is empty, send an empty string.
       * AuthProvider can determine whether an existing
       * Google user already exists or a new phone is required.
       */
      const googleAdditionalData = {
        name: cleanName,
        phone: cleanPhone,
      };

      const googleUser = await signInWithGoogle(googleAdditionalData);

      const googleName =
        googleUser?.displayName?.trim() ||
        cleanName ||
        user?.displayName?.trim() ||
        "School Member";

      toast.success(`${googleName}, registration successful!`);

      const redirectPath = getRedirectPath();

      navigate(redirectPath, {
        replace: true,
      });
    } catch (err) {
      console.error("Google registration error:", err);

      const errorMessage = getRegistrationErrorMessage(err);

      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /*
   * Initial authentication loading state
   */
  if (authLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-3 text-sm text-slate-500">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Brand */}
          <div className="mb-7 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="School Reunion Home"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <FiUser className="text-xl" />
              </div>

              <div className="text-left">
                <h1 className="text-lg font-bold leading-tight text-slate-900">
                  School Reunion
                </h1>

                <p className="text-xs text-slate-500">Reconnect & Remember</p>
              </div>
            </Link>
          </div>

          {/* Registration Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Join the School Reunion community and stay connected.
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div
                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3"
                role="alert"
                aria-live="polite"
              >
                <p className="text-sm leading-5 text-red-600">{error}</p>
              </div>
            )}

            {/* Google Registration */}
            <button
              type="button"
              onClick={handleGoogleRegister}
              disabled={loading}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition duration-200 hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-600" />
              ) : (
                <FcGoogle className="text-xl" />
              )}

              <span>{loading ? "Please wait..." : "Continue with Google"}</span>
            </button>

            {/* Google helper */}
            <p className="mt-2 text-center text-xs text-slate-400">
              For a new Google account, a valid phone number is required.
            </p>

            {/* Divider */}
            <div className="my-6 flex items-center gap-4">
              <div className="h-px flex-1 bg-slate-200" />

              <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                or
              </span>

              <div className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Registration Form */}
            <form
              onSubmit={handleSubmit(handleRegister)}
              className="space-y-5"
              noValidate
            >
              {/* Full Name */}
              <div>
                <label
                  htmlFor="name"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Full Name
                </label>

                <div className="relative">
                  <FiUser className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your full name"
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.name
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...register("name", {
                      required: "Full name is required.",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters.",
                      },
                      maxLength: {
                        value: 100,
                        message: "Name cannot exceed 100 characters.",
                      },
                      validate: (value) =>
                        value.trim().length >= 2 ||
                        "Name must be at least 2 characters.",
                    })}
                  />
                </div>

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
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>

                <div className="relative">
                  <FiMail className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...register("email", {
                      required: "Email address is required.",
                      pattern: {
                        value: EMAIL_REGEX,
                        message: "Please enter a valid email address.",
                      },
                    })}
                  />
                </div>

                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <FiPhone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={11}
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.phone
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...register("phone", {
                      required: "Phone number is required.",
                      setValueAs: (value) =>
                        typeof value === "string" ? value.trim() : "",
                      pattern: {
                        value: PHONE_REGEX,
                        message: "Enter a valid Bangladeshi phone number.",
                      },
                    })}
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Example: 01712345678
                </p>

                {errors.phone && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Password
                </label>

                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Create a password"
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
                    {...register("password", {
                      required: "Password is required.",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters.",
                      },
                    })}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>

                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Confirm Password
                </label>

                <div className="relative">
                  <FiLock className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />

                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Confirm your password"
                    disabled={loading}
                    className={`w-full rounded-xl border bg-white px-4 py-3 pl-10 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
                      errors.confirmPassword
                        ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                        : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-100"
                    }`}
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
                    disabled={loading}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 disabled:cursor-not-allowed"
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
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div>
                <label className="flex cursor-pointer items-start gap-2.5">
                  <input
                    type="checkbox"
                    disabled={loading}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed"
                    {...register("agreeToTerms", {
                      required: "You must agree to the terms.",
                    })}
                  />

                  <span className="text-sm leading-5 text-slate-600">
                    I agree to the{" "}
                    <Link
                      to="/terms"
                      className="font-medium text-indigo-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>
                    .
                  </span>
                </label>

                {errors.agreeToTerms && (
                  <p className="mt-1.5 text-xs text-red-500">
                    {errors.agreeToTerms.message}
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition duration-200 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>

            {/* Login */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} School Reunion
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserRegister;
