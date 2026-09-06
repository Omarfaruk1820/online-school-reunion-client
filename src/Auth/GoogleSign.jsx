import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

import useAuth from "../hooks/useAuth";

const GoogleSign = ({
  redirectTo = "/",
  buttonText = "Continue with Google",
  disabled = false,
  className = "",
}) => {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const getGoogleSignInErrorMessage = (error) => {
    switch (error?.code) {
      case "auth/popup-closed-by-user":
        return "Google Sign-In was cancelled.";

      case "auth/popup-blocked":
        return "Google Sign-In popup was blocked. Please allow popups and try again.";

      case "auth/cancelled-popup-request":
        return "Another Google Sign-In request is already in progress.";

      case "auth/account-exists-with-different-credential":
        return "An account already exists with a different sign-in method.";

      case "auth/network-request-failed":
        return "Network error. Please check your internet connection.";

      case "auth/user-disabled":
        return "This account has been disabled. Please contact the organizer.";

      case "auth/operation-not-allowed":
        return "Google Sign-In is currently unavailable.";

      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment and try again.";

      default:
        return (
          error?.response?.data?.message ||
          error?.message ||
          "Unable to sign in with Google. Please try again."
        );
    }
  };

  const handleGoogleSignIn = async () => {
    if (loading || disabled) {
      return;
    }

    try {
      setLoading(true);

      const firebaseUser = await signInWithGoogle();

      /*
       * Priority:
       * 1. MongoDB/AuthProvider user name
       * 2. Firebase display name
       * 3. Email username
       * 4. "User"
       */
      const userName =
        user?.name?.trim() ||
        firebaseUser?.displayName?.trim() ||
        firebaseUser?.email?.split("@")[0] ||
        "User";

      toast.success(`Welcome back, ${userName}! Google login successful.`, {
        position: "top-right",
        duration: 3000,
      });

      navigate(redirectTo, {
        replace: true,
      });
    } catch (error) {
      console.error("Google Sign-In Error:", error);

      toast.error(getGoogleSignInErrorMessage(error), {
        position: "top-right",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || disabled;

  return (
    <button
      type="button"
      onClick={handleGoogleSignIn}
      disabled={isDisabled}
      aria-label={loading ? "Signing in with Google" : buttonText}
      aria-busy={loading}
      className={`
        flex w-full items-center justify-center gap-3
        rounded-lg border border-gray-300
        bg-white px-4 py-3
        text-sm font-medium text-gray-700
        shadow-sm
        transition-all duration-200
        hover:bg-gray-50
        hover:shadow
        focus:outline-none
        focus:ring-2
        focus:ring-blue-500
        focus:ring-offset-2
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${className}
      `}
    >
      {loading ? (
        <>
          <span
            className="
              h-5 w-5
              animate-spin
              rounded-full
              border-2
              border-gray-300
              border-t-gray-700
            "
            aria-hidden="true"
          />

          <span>Signing in...</span>
        </>
      ) : (
        <>
          <FcGoogle className="text-xl" aria-hidden="true" />

          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
};

export default GoogleSign;
