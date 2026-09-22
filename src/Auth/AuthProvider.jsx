import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";

import { auth } from "../Auth/firebase.config";
import axiosSecure from "../hooks/axiosSecure";

// ============================================================
// AUTH CONTEXT
// ============================================================

export const AuthContext = createContext(null);

// ============================================================
// GOOGLE PROVIDER
// ============================================================

const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});

// ============================================================
// CONSTANTS
// ============================================================

const DEFAULT_USER_NAME = "School Member";

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 11;
const MAX_PHOTO_URL_LENGTH = 2000;

const PHONE_REGEX = /^01[3-9]\d{8}$/;

// ============================================================
// API ENDPOINTS
// ============================================================

const API = {
  ME: "/api/auth/me",
  USERS: "/api/users",
};

// ============================================================
// AUTH PROVIDER
// ============================================================

const AuthProvider = ({ children }) => {
  // ==========================================================
  // STATE
  // ==========================================================

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // ==========================================================
  // REFS
  // ==========================================================

  /*
   * Prevent duplicate backend synchronization
   * for the same Firebase UID.
   */
  const syncPromiseRef = useRef(new Map());

  /*
   * Track whether component is mounted.
   */
  const isMountedRef = useRef(true);

  /*
   * Prevent auth-state listener from racing
   * with email/password registration.
   */
  const isRegisteringRef = useRef(false);

  /*
   * Store UID currently being registered.
   */
  const registrationUidRef = useRef(null);

  /*
   * Prevent auth-state listener from racing
   * with Google authentication.
   */
  const isGoogleSigningInRef = useRef(false);

  // ==========================================================
  // NORMALIZE EMAIL
  // ==========================================================

  const normalizeEmail = useCallback((email) => {
    if (typeof email !== "string") {
      return "";
    }

    return email.trim().toLowerCase();
  }, []);

  // ==========================================================
  // CLEAN STRING
  // ==========================================================

  const cleanString = useCallback((value) => {
    return typeof value === "string" ? value.trim() : "";
  }, []);

  // ==========================================================
  // PHONE VALIDATION
  // ==========================================================

  const isValidBangladeshiPhone = useCallback((phone) => {
    return PHONE_REGEX.test(phone);
  }, []);

  // ==========================================================
  // FIREBASE ID TOKEN
  // ==========================================================

  const getFirebaseIdToken = useCallback(
    async (firebaseUser = auth.currentUser, forceRefresh = false) => {
      if (!firebaseUser) {
        throw new Error("Firebase user is not available.");
      }

      const token = await firebaseUser.getIdToken(forceRefresh);

      if (!token) {
        throw new Error("Unable to retrieve Firebase ID token.");
      }

      return token;
    },
    [],
  );

  // ==========================================================
  // DETECT AUTH PROVIDER
  // ==========================================================

  const getProvider = useCallback((firebaseUser) => {
    if (!firebaseUser) {
      return "password";
    }

    const hasGoogleProvider = firebaseUser.providerData?.some(
      (provider) => provider.providerId === "google.com",
    );

    if (hasGoogleProvider) {
      return "google";
    }

    return "password";
  }, []);

  // ==========================================================
  // GET CURRENT USER FROM MONGODB
  // ==========================================================

  const getCurrentUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    try {
      /*
       * IMPORTANT:
       *
       * axiosSecure baseURL:
       * https://online-school-reunion-server.vercel.app
       *
       * Therefore endpoint must be:
       * /api/auth/me
       */
      const response = await axiosSecure.get(API.ME);

      return response.data?.user || null;
    } catch (error) {
      /*
       * 404 means Firebase user exists but
       * MongoDB user does not exist.
       */
      if (error?.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }, []);

  // ==========================================================
  // BUILD APPLICATION USER
  // ==========================================================

  const buildUser = useCallback(
    (firebaseUser, databaseUser = {}) => {
      if (!firebaseUser) {
        return null;
      }

      const provider = databaseUser?.provider || getProvider(firebaseUser);

      const databaseName = cleanString(databaseUser?.name);

      const firebaseName = cleanString(firebaseUser.displayName);

      const databaseEmail = normalizeEmail(databaseUser?.email);

      const firebaseEmail = normalizeEmail(firebaseUser.email);

      const databasePhoto = cleanString(databaseUser?.photo);

      const firebasePhoto = cleanString(firebaseUser.photoURL);

      const finalPhoto = databasePhoto || firebasePhoto;

      /*
       * Firebase phone is used only as a fallback.
       */
      const databasePhone =
        databaseUser?.phone !== undefined
          ? databaseUser.phone
          : firebaseUser.phoneNumber || null;

      const applicationUser = {
        // ------------------------------------------------------
        // Firebase identity
        // ------------------------------------------------------

        uid: firebaseUser.uid,

        // ------------------------------------------------------
        // MongoDB ID
        // ------------------------------------------------------

        id: databaseUser?.id || databaseUser?._id || null,

        // ------------------------------------------------------
        // Basic information
        // ------------------------------------------------------

        name: databaseName || firebaseName || DEFAULT_USER_NAME,

        email: databaseEmail || firebaseEmail || "",

        phone: databasePhone,

        // ------------------------------------------------------
        // Authentication
        // ------------------------------------------------------

        provider,

        emailVerified: firebaseUser.emailVerified === true,

        // ------------------------------------------------------
        // Authorization
        // ------------------------------------------------------

        role: databaseUser?.role || "student",

        status: databaseUser?.status || "active",

        // ------------------------------------------------------
        // MongoDB timestamps
        // ------------------------------------------------------

        createdAt: databaseUser?.createdAt || null,

        updatedAt: databaseUser?.updatedAt || null,

        lastLogin: databaseUser?.lastLogin || null,

        // ------------------------------------------------------
        // Additional profile
        // ------------------------------------------------------

        profile:
          databaseUser?.profile &&
          typeof databaseUser.profile === "object" &&
          !Array.isArray(databaseUser.profile)
            ? databaseUser.profile
            : {},
      };

      /*
       * Add photo only when available.
       */
      if (finalPhoto) {
        applicationUser.photo = finalPhoto;
      }

      return applicationUser;
    },
    [cleanString, getProvider, normalizeEmail],
  );

  // ==========================================================
  // SAVE / SYNC USER TO MONGODB
  // ==========================================================

  const saveUserToDatabase = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        throw new Error("Firebase user is required.");
      }

      const provider = getProvider(firebaseUser);

      const isGoogleProvider = provider === "google";

      // --------------------------------------------------------
      // NAME
      // --------------------------------------------------------

      const cleanName =
        typeof additionalData.name === "string"
          ? additionalData.name.trim()
          : cleanString(firebaseUser.displayName);

      const finalName = cleanName || DEFAULT_USER_NAME;

      if (finalName.length > MAX_NAME_LENGTH) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      // --------------------------------------------------------
      // PHONE
      // --------------------------------------------------------

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : cleanString(firebaseUser.phoneNumber);

      /*
       * Email/password users require phone
       * when creating a new MongoDB account.
       */
      if (!isGoogleProvider && !cleanPhone) {
        throw new Error(
          "Phone number is required to create your school profile.",
        );
      }

      /*
       * Validate phone whenever supplied.
       */
      if (cleanPhone) {
        if (cleanPhone.length !== MAX_PHONE_LENGTH) {
          throw new Error("Phone number must contain 11 digits.");
        }

        if (!isValidBangladeshiPhone(cleanPhone)) {
          throw new Error("Enter a valid Bangladeshi phone number.");
        }
      }

      // --------------------------------------------------------
      // PHOTO
      // --------------------------------------------------------

      const additionalPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : "";

      const firebasePhoto = cleanString(firebaseUser.photoURL);

      const finalPhoto = additionalPhoto || firebasePhoto;

      if (finalPhoto.length > MAX_PHOTO_URL_LENGTH) {
        throw new Error("Photo URL cannot exceed 2000 characters.");
      }

      // --------------------------------------------------------
      // PROFILE
      // --------------------------------------------------------

      const cleanProfile =
        additionalData.profile &&
        typeof additionalData.profile === "object" &&
        !Array.isArray(additionalData.profile)
          ? additionalData.profile
          : undefined;

      // --------------------------------------------------------
      // PAYLOAD
      // --------------------------------------------------------

      const payload = {
        name: finalName,
        provider,
      };

      /*
       * Phone.
       */
      if (cleanPhone) {
        payload.phone = cleanPhone;
      }

      /*
       * Photo.
       */
      if (finalPhoto) {
        payload.photo = finalPhoto;
      }

      /*
       * Profile.
       */
      if (cleanProfile !== undefined) {
        payload.profile = cleanProfile;
      }

      // --------------------------------------------------------
      // POST /api/users
      // --------------------------------------------------------

      const response = await axiosSecure.post(API.USERS, payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to synchronize user.",
        );
      }

      return response.data;
    },
    [cleanString, getProvider, isValidBangladeshiPhone],
  );

  // ==========================================================
  // SYNCHRONIZE FIREBASE USER WITH MONGODB
  // ==========================================================

  const syncUserWithBackend = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        return null;
      }

      const uid = firebaseUser.uid;

      // --------------------------------------------------------
      // PREVENT DUPLICATE REQUEST
      // --------------------------------------------------------

      const existingPromise = syncPromiseRef.current.get(uid);

      if (existingPromise) {
        return existingPromise;
      }

      const syncPromise = (async () => {
        try {
          if (isMountedRef.current) {
            setAuthError(null);
          }

          // ----------------------------------------------------
          // CHECK EXISTING MONGODB USER
          // ----------------------------------------------------

          let databaseUser = await getCurrentUser();

          // ----------------------------------------------------
          // CHECK ADDITIONAL DATA
          // ----------------------------------------------------

          const hasAdditionalData =
            additionalData &&
            typeof additionalData === "object" &&
            ((typeof additionalData.name === "string" &&
              additionalData.name.trim().length > 0) ||
              (typeof additionalData.phone === "string" &&
                additionalData.phone.trim().length > 0) ||
              (typeof additionalData.photo === "string" &&
                additionalData.photo.trim().length > 0) ||
              (additionalData.profile &&
                typeof additionalData.profile === "object" &&
                !Array.isArray(additionalData.profile)));

          // ----------------------------------------------------
          // CREATE / UPDATE MONGODB USER
          // ----------------------------------------------------

          if (!databaseUser || hasAdditionalData) {
            /*
             * If MongoDB user already exists,
             * additionalData can update the profile.
             *
             * If MongoDB user does not exist,
             * this creates the user.
             */
            const syncResponse = await saveUserToDatabase(
              firebaseUser,
              additionalData,
            );

            databaseUser = syncResponse?.user || null;
          }

          // ----------------------------------------------------
          // FALLBACK FETCH
          // ----------------------------------------------------

          if (!databaseUser) {
            databaseUser = await getCurrentUser();
          }

          // ----------------------------------------------------
          // VERIFY DATABASE USER
          // ----------------------------------------------------

          if (!databaseUser) {
            throw new Error(
              "Your Firebase account is active, but your school profile could not be loaded from the database.",
            );
          }

          // ----------------------------------------------------
          // BUILD APPLICATION USER
          // ----------------------------------------------------

          const applicationUser = buildUser(firebaseUser, databaseUser);

          // ----------------------------------------------------
          // UPDATE STATE
          // ----------------------------------------------------

          if (isMountedRef.current) {
            setUser(applicationUser);
          }

          return applicationUser;
        } catch (error) {
          console.error("User synchronization failed:", error);

          if (isMountedRef.current) {
            setAuthError(error);
          }

          throw error;
        }
      })();

      syncPromiseRef.current.set(uid, syncPromise);

      try {
        return await syncPromise;
      } finally {
        const currentPromise = syncPromiseRef.current.get(uid);

        if (currentPromise === syncPromise) {
          syncPromiseRef.current.delete(uid);
        }
      }
    },
    [buildUser, getCurrentUser, saveUserToDatabase],
  );

  // ==========================================================
  // EMAIL / PASSWORD SIGNUP
  // ==========================================================

  const usersignup = useCallback(
    async (email, password, additionalData = {}) => {
      setAuthError(null);

      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Email address is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      // --------------------------------------------------------
      // NAME
      // --------------------------------------------------------

      const cleanName =
        typeof additionalData.name === "string"
          ? additionalData.name.trim()
          : "";

      if (!cleanName) {
        throw new Error("Name is required.");
      }

      if (cleanName.length > MAX_NAME_LENGTH) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      // --------------------------------------------------------
      // PHONE
      // --------------------------------------------------------

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      if (!cleanPhone) {
        throw new Error("Phone number is required.");
      }

      if (cleanPhone.length !== MAX_PHONE_LENGTH) {
        throw new Error("Phone number must contain 11 digits.");
      }

      if (!isValidBangladeshiPhone(cleanPhone)) {
        throw new Error("Enter a valid Bangladeshi phone number.");
      }

      // --------------------------------------------------------
      // PHOTO
      // --------------------------------------------------------

      const cleanPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : "";

      if (cleanPhoto && cleanPhoto.length > MAX_PHOTO_URL_LENGTH) {
        throw new Error("Photo URL cannot exceed 2000 characters.");
      }

      let firebaseUser = null;

      /*
       * Prevent auth-state listener from
       * racing with registration.
       */
      isRegisteringRef.current = true;

      try {
        // ------------------------------------------------------
        // 1. CREATE FIREBASE ACCOUNT
        // ------------------------------------------------------

        const result = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        firebaseUser = result.user;

        registrationUidRef.current = firebaseUser.uid;

        // ------------------------------------------------------
        // 2. UPDATE FIREBASE PROFILE
        // ------------------------------------------------------

        await updateProfile(firebaseUser, {
          displayName: cleanName,
        });

        // ------------------------------------------------------
        // 3. SYNC WITH MONGODB
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, {
          name: cleanName,
          phone: cleanPhone,

          ...(cleanPhoto
            ? {
                photo: cleanPhoto,
              }
            : {}),

          ...(additionalData.profile
            ? {
                profile: additionalData.profile,
              }
            : {}),
        });

        // ------------------------------------------------------
        // 4. RETURN FIREBASE USER
        // ------------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Email registration failed:", error);

        // ------------------------------------------------------
        // ROLLBACK FIREBASE ACCOUNT
        // ------------------------------------------------------

        if (firebaseUser) {
          try {
            await deleteUser(firebaseUser);
          } catch (deleteError) {
            console.error("Failed to rollback Firebase user:", deleteError);
          }
        }

        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      } finally {
        isRegisteringRef.current = false;

        registrationUidRef.current = null;
      }
    },
    [isValidBangladeshiPhone, normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // EMAIL / PASSWORD LOGIN
  // ==========================================================

  const userLogin = useCallback(
    async (email, password) => {
      setAuthError(null);

      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Email address is required.");
      }

      if (!password) {
        throw new Error("Password is required.");
      }

      try {
        // ------------------------------------------------------
        // 1. FIREBASE LOGIN
        // ------------------------------------------------------

        const result = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        const firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. SYNCHRONIZE BACKEND
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser);

        return firebaseUser;
      } catch (error) {
        console.error("Email login failed:", error);

        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      }
    },
    [normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // GOOGLE SIGN IN / SIGNUP
  // ==========================================================

  const signInWithGoogle = useCallback(
    async (additionalData = {}) => {
      setAuthError(null);

      /*
       * Prevent auth listener from performing
       * duplicate synchronization.
       */
      isGoogleSigningInRef.current = true;

      try {
        // ------------------------------------------------------
        // 1. GOOGLE POPUP
        // ------------------------------------------------------

        const result = await signInWithPopup(auth, googleProvider);

        const firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. OPTIONAL NAME
        // ------------------------------------------------------

        const cleanName =
          typeof additionalData.name === "string"
            ? additionalData.name.trim()
            : "";

        if (cleanName && cleanName.length > MAX_NAME_LENGTH) {
          throw new Error("Name cannot exceed 100 characters.");
        }

        // ------------------------------------------------------
        // 3. OPTIONAL PHONE
        // ------------------------------------------------------

        const cleanPhone =
          typeof additionalData.phone === "string"
            ? additionalData.phone.trim()
            : "";

        /*
         * Google phone is optional.
         */
        if (cleanPhone) {
          if (cleanPhone.length !== MAX_PHONE_LENGTH) {
            throw new Error("Phone number must contain 11 digits.");
          }

          if (!isValidBangladeshiPhone(cleanPhone)) {
            throw new Error("Enter a valid Bangladeshi phone number.");
          }
        }

        // ------------------------------------------------------
        // 4. OPTIONAL PHOTO
        // ------------------------------------------------------

        const cleanPhoto =
          typeof additionalData.photo === "string"
            ? additionalData.photo.trim()
            : "";

        if (cleanPhoto && cleanPhoto.length > MAX_PHOTO_URL_LENGTH) {
          throw new Error("Photo URL cannot exceed 2000 characters.");
        }

        // ------------------------------------------------------
        // 5. BUILD GOOGLE DATA
        // ------------------------------------------------------

        const googleAdditionalData = {};

        if (cleanName) {
          googleAdditionalData.name = cleanName;
        }

        if (cleanPhone) {
          googleAdditionalData.phone = cleanPhone;
        }

        if (cleanPhoto) {
          googleAdditionalData.photo = cleanPhoto;
        }

        if (
          additionalData.profile &&
          typeof additionalData.profile === "object" &&
          !Array.isArray(additionalData.profile)
        ) {
          googleAdditionalData.profile = additionalData.profile;
        }

        // ------------------------------------------------------
        // 6. SYNCHRONIZE WITH MONGODB
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, googleAdditionalData);

        // ------------------------------------------------------
        // 7. RETURN FIREBASE USER
        // ------------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Google authentication failed:", error);

        /*
         * Do not delete Google Firebase account.
         */
        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      } finally {
        isGoogleSigningInRef.current = false;
      }
    },
    [isValidBangladeshiPhone, syncUserWithBackend],
  );

  // ==========================================================
  // RESET PASSWORD
  // ==========================================================

  const resetPassword = useCallback(
    async (email) => {
      setAuthError(null);

      const normalizedEmail = normalizeEmail(email);

      if (!normalizedEmail) {
        throw new Error("Please enter your email address first.");
      }

      try {
        await sendPasswordResetEmail(auth, normalizedEmail, {
          url: `${window.location.origin}/login`,
        });

        return true;
      } catch (error) {
        console.error("Password reset failed:", error);

        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      }
    },
    [normalizeEmail],
  );

  // ==========================================================
  // UPDATE USER PROFILE
  // ==========================================================

  const updateUserProfile = useCallback(
    async (profileData = {}) => {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("No authenticated user found.");
      }

      setAuthError(null);

      try {
        // ------------------------------------------------------
        // PROVIDER
        // ------------------------------------------------------

        const provider = getProvider(firebaseUser);

        const isGoogleProvider = provider === "google";

        // ------------------------------------------------------
        // NAME
        // ------------------------------------------------------

        const cleanName =
          typeof profileData.name === "string"
            ? profileData.name.trim()
            : cleanString(firebaseUser.displayName);

        if (!cleanName) {
          throw new Error("Name cannot be empty.");
        }

        if (cleanName.length > MAX_NAME_LENGTH) {
          throw new Error("Name cannot exceed 100 characters.");
        }

        // ------------------------------------------------------
        // PHONE
        // ------------------------------------------------------

        const cleanPhone =
          typeof profileData.phone === "string" ? profileData.phone.trim() : "";

        /*
         * Validate new phone.
         */
        if (cleanPhone) {
          if (cleanPhone.length !== MAX_PHONE_LENGTH) {
            throw new Error("Phone number must contain 11 digits.");
          }

          if (!isValidBangladeshiPhone(cleanPhone)) {
            throw new Error("Enter a valid Bangladeshi phone number.");
          }
        }

        /*
         * Password users must always
         * have a valid phone.
         */
        if (!isGoogleProvider) {
          const existingPhone =
            typeof user?.phone === "string" ? user.phone.trim() : "";

          if (!cleanPhone && !existingPhone) {
            throw new Error("Phone number is required.");
          }

          if (existingPhone && !isValidBangladeshiPhone(existingPhone)) {
            throw new Error("Enter a valid Bangladeshi phone number.");
          }
        }

        // ------------------------------------------------------
        // PHOTO
        // ------------------------------------------------------

        const cleanPhoto =
          typeof profileData.photo === "string"
            ? profileData.photo.trim()
            : cleanString(firebaseUser.photoURL);

        if (cleanPhoto && cleanPhoto.length > MAX_PHOTO_URL_LENGTH) {
          throw new Error("Photo URL cannot exceed 2000 characters.");
        }

        // ------------------------------------------------------
        // PROFILE
        // ------------------------------------------------------

        const cleanProfile =
          profileData.profile &&
          typeof profileData.profile === "object" &&
          !Array.isArray(profileData.profile)
            ? profileData.profile
            : undefined;

        // ------------------------------------------------------
        // UPDATE FIREBASE
        // ------------------------------------------------------

        const firebaseProfileData = {
          displayName: cleanName,
        };

        if (cleanPhoto) {
          firebaseProfileData.photoURL = cleanPhoto;
        }

        await updateProfile(firebaseUser, firebaseProfileData);

        // ------------------------------------------------------
        // BUILD BACKEND PAYLOAD
        // ------------------------------------------------------

        const payload = {
          name: cleanName,
        };

        /*
         * New phone.
         */
        if (cleanPhone) {
          payload.phone = cleanPhone;
        } else if (!isGoogleProvider) {
          /*
           * Preserve existing password-user phone.
           */
          const existingPhone =
            typeof user?.phone === "string" ? user.phone.trim() : "";

          if (existingPhone) {
            payload.phone = existingPhone;
          }
        }

        /*
         * Photo.
         */
        if (cleanPhoto) {
          payload.photo = cleanPhoto;
        }

        /*
         * Profile.
         */
        if (cleanProfile !== undefined) {
          payload.profile = cleanProfile;
        }

        // ------------------------------------------------------
        // UPDATE MONGODB
        // ------------------------------------------------------

        const response = await axiosSecure.patch(API.ME, payload);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to update profile.",
          );
        }

        // ------------------------------------------------------
        // BUILD APPLICATION USER
        // ------------------------------------------------------

        const databaseUser = response.data?.user || {};

        const applicationUser = buildUser(firebaseUser, databaseUser);

        if (isMountedRef.current) {
          setUser(applicationUser);
          setAuthError(null);
        }

        return applicationUser;
      } catch (error) {
        console.error("Profile update failed:", error);

        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      }
    },
    [buildUser, cleanString, getProvider, isValidBangladeshiPhone, user],
  );

  // ==========================================================
  // REFRESH USER
  // ==========================================================

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      if (isMountedRef.current) {
        setUser(null);
      }

      return null;
    }

    try {
      let databaseUser = await getCurrentUser();

      /*
       * If MongoDB user is missing,
       * try to synchronize it.
       */
      if (!databaseUser) {
        return await syncUserWithBackend(firebaseUser);
      }

      const applicationUser = buildUser(firebaseUser, databaseUser);

      if (isMountedRef.current) {
        setUser(applicationUser);
        setAuthError(null);
      }

      return applicationUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);

      if (isMountedRef.current) {
        setAuthError(error);
      }

      throw error;
    }
  }, [buildUser, getCurrentUser, syncUserWithBackend]);

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const userLogout = useCallback(async () => {
    setAuthError(null);

    try {
      await signOut(auth);

      if (isMountedRef.current) {
        setUser(null);
      }

      /*
       * Clear synchronization cache.
       */
      syncPromiseRef.current.clear();

      isRegisteringRef.current = false;

      registrationUidRef.current = null;

      isGoogleSigningInRef.current = false;
    } catch (error) {
      console.error("Logout failed:", error);

      if (isMountedRef.current) {
        setAuthError(error);
      }

      throw error;
    }
  }, []);

  // ==========================================================
  // CLEAR USER
  // ==========================================================

  const clearUser = useCallback(() => {
    if (isMountedRef.current) {
      setUser(null);
      setAuthError(null);
    }

    syncPromiseRef.current.clear();

    isRegisteringRef.current = false;

    registrationUidRef.current = null;

    isGoogleSigningInRef.current = false;
  }, []);

  // ==========================================================
  // FIREBASE AUTH STATE LISTENER
  // ==========================================================

  useEffect(() => {
    isMountedRef.current = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!isMountedRef.current) {
        return;
      }

      // ----------------------------------------------------
      // LOGGED OUT
      // ----------------------------------------------------

      if (!firebaseUser) {
        setUser(null);
        setAuthError(null);
        setLoading(false);

        return;
      }

      // ----------------------------------------------------
      // EMAIL REGISTRATION IN PROGRESS
      // ----------------------------------------------------

      if (
        isRegisteringRef.current ||
        registrationUidRef.current === firebaseUser.uid
      ) {
        setLoading(false);

        return;
      }

      // ----------------------------------------------------
      // GOOGLE SIGN-IN IN PROGRESS
      // ----------------------------------------------------

      if (isGoogleSigningInRef.current) {
        setLoading(false);

        return;
      }

      // ----------------------------------------------------
      // NORMAL LOGIN / SESSION RESTORATION
      // ----------------------------------------------------

      setLoading(true);

      try {
        const applicationUser = await syncUserWithBackend(firebaseUser);

        if (!isMountedRef.current) {
          return;
        }

        setUser(applicationUser);
        setAuthError(null);
      } catch (error) {
        console.error("Auth state synchronization failed:", error);

        if (!isMountedRef.current) {
          return;
        }

        /*
         * Do not automatically sign out
         * Firebase because of backend/network
         * failure.
         */
        setUser(null);
        setAuthError(error);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    });

    return () => {
      isMountedRef.current = false;

      unsubscribe();

      /*
       * Do not clear syncPromiseRef here.
       *
       * React StrictMode can temporarily
       * unmount and remount the provider.
       */
    };
  }, [syncUserWithBackend]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const authInfo = useMemo(
    () => ({
      // ------------------------------------------------------
      // STATE
      // ------------------------------------------------------

      user,
      loading,
      authError,

      // ------------------------------------------------------
      // AUTHENTICATION
      // ------------------------------------------------------

      usersignup,
      userLogin,
      signInWithGoogle,
      resetPassword,
      userLogout,

      // ------------------------------------------------------
      // USER MANAGEMENT
      // ------------------------------------------------------

      saveUserToDatabase,
      syncUserWithBackend,
      getCurrentUser,
      refreshUser,
      updateUserProfile,

      // ------------------------------------------------------
      // FIREBASE
      // ------------------------------------------------------

      getFirebaseIdToken,

      // ------------------------------------------------------
      // UTILITY
      // ------------------------------------------------------

      clearUser,
    }),
    [
      user,
      loading,
      authError,
      usersignup,
      userLogin,
      signInWithGoogle,
      resetPassword,
      userLogout,
      saveUserToDatabase,
      syncUserWithBackend,
      getCurrentUser,
      refreshUser,
      updateUserProfile,
      getFirebaseIdToken,
      clearUser,
    ],
  );

  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (
    <AuthContext.Provider value={authInfo}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
