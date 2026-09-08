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

const PHONE_REGEX = /^01[3-9]\d{8}$/;

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
   * Track component mounted state.
   */
  const isMountedRef = useRef(true);

  /*
   * Prevent onAuthStateChanged from performing
   * an automatic sync while email registration
   * is being handled manually.
   */
  const isRegisteringRef = useRef(false);

  /*
   * Store the Firebase UID currently being registered.
   */
  const registrationUidRef = useRef(null);

  /*
   * Prevent onAuthStateChanged from racing with
   * interactive Google sign-in.
   *
   * This is important because Google signInWithPopup()
   * can trigger onAuthStateChanged() before the explicit
   * signInWithGoogle() synchronization runs.
   */
  const isGoogleSigningInRef = useRef(false);

  // ==========================================================
  // EMAIL NORMALIZATION
  // ==========================================================

  const normalizeEmail = useCallback((email) => {
    if (typeof email !== "string") {
      return "";
    }

    return email.trim().toLowerCase();
  }, []);

  // ==========================================================
  // STRING HELPER
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
  // GET FIREBASE ID TOKEN
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

    const googleProviderExists = firebaseUser.providerData?.some(
      (provider) => provider.providerId === "google.com",
    );

    if (googleProviderExists) {
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
      const response = await axiosSecure.get("/auth/me");

      return response.data?.user || null;
    } catch (error) {
      /*
       * Firebase user can exist before MongoDB user
       * is created.
       *
       * Therefore 404 means the MongoDB user does
       * not exist yet.
       */
      if (error?.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }, []);

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

      if (finalName.length > 100) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      // --------------------------------------------------------
      // PHONE
      // --------------------------------------------------------

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      /*
       * EMAIL/PASSWORD:
       *
       * Phone is mandatory.
       */
      if (!isGoogleProvider && !cleanPhone) {
        throw new Error("Phone number is required.");
      }

      /*
       * GOOGLE:
       *
       * Phone is optional.
       *
       * If Google user provides a phone,
       * validate it.
       */
      if (cleanPhone && !isValidBangladeshiPhone(cleanPhone)) {
        throw new Error("Enter a valid Bangladeshi phone number.");
      }

      // --------------------------------------------------------
      // PHOTO
      // --------------------------------------------------------

      const cleanAdditionalPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : "";

      const cleanFirebasePhoto = cleanString(firebaseUser.photoURL);

      const finalPhoto = cleanAdditionalPhoto || cleanFirebasePhoto;

      if (finalPhoto && finalPhoto.length > 2000) {
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
      // BACKEND PAYLOAD
      // --------------------------------------------------------

      const payload = {
        name: finalName,
        provider,
      };

      /*
       * IMPORTANT:
       *
       * Manual registration:
       * phone must exist.
       *
       * Google:
       * send phone only when user actually provided it.
       *
       * This prevents sending:
       *
       * phone: ""
       * phone: undefined
       * phone: null
       *
       * from the frontend.
       *
       * The backend will create a new Google user
       * with phone: null when no phone is supplied.
       *
       * For existing Google users, the backend preserves
       * their existing phone value.
       */
      if (cleanPhone) {
        payload.phone = cleanPhone;
      }

      /*
       * Only send photo when there is an actual value.
       */
      if (finalPhoto) {
        payload.photo = finalPhoto;
      }

      /*
       * Only send profile when it actually exists.
       */
      if (cleanProfile !== undefined) {
        payload.profile = cleanProfile;
      }

      // --------------------------------------------------------
      // POST /api/users
      // --------------------------------------------------------

      const response = await axiosSecure.post("/users", payload);

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
  // BUILD APPLICATION USER
  // ==========================================================

  const buildUser = useCallback(
    (firebaseUser, databaseUser = {}) => {
      if (!firebaseUser) {
        return null;
      }

      const provider = databaseUser?.provider || getProvider(firebaseUser);

      const databasePhoto = cleanString(databaseUser?.photo);

      const firebasePhoto = cleanString(firebaseUser.photoURL);

      const applicationUser = {
        uid: firebaseUser.uid,

        _id: databaseUser?._id || databaseUser?.id || null,

        name:
          databaseUser?.name || firebaseUser.displayName || DEFAULT_USER_NAME,

        email: normalizeEmail(databaseUser?.email || firebaseUser.email),

        /*
         * Preserve null when MongoDB contains null.
         *
         * This is especially useful for a new Google user
         * who has not provided a phone number yet.
         */
        phone: databaseUser?.phone !== undefined ? databaseUser.phone : null,

        role: databaseUser?.role || "student",

        status: databaseUser?.status || "active",

        provider,

        emailVerified: firebaseUser.emailVerified === true,

        createdAt: databaseUser?.createdAt || null,

        updatedAt: databaseUser?.updatedAt || null,

        lastLogin: databaseUser?.lastLogin || null,

        profile:
          databaseUser?.profile &&
          typeof databaseUser.profile === "object" &&
          !Array.isArray(databaseUser.profile)
            ? databaseUser.profile
            : {},
      };

      // --------------------------------------------------------
      // PHOTO
      // --------------------------------------------------------

      /*
       * Only add photo when an actual value exists.
       *
       * Never:
       *
       * photo: null
       */
      const finalPhoto = databasePhoto || firebasePhoto;

      if (finalPhoto) {
        applicationUser.photo = finalPhoto;
      }

      return applicationUser;
    },
    [cleanString, getProvider, normalizeEmail],
  );

  // ==========================================================
  // SYNC USER WITH BACKEND
  // ==========================================================

  const syncUserWithBackend = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        return null;
      }

      const uid = firebaseUser.uid;

      // --------------------------------------------------------
      // PREVENT DUPLICATE SYNCHRONIZATION
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
          // 1. GET EXISTING MONGODB USER
          // ----------------------------------------------------

          let databaseUser = await getCurrentUser();

          // ----------------------------------------------------
          // 2. CHECK ADDITIONAL DATA
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
          // 3. CREATE / UPDATE MONGODB USER
          // ----------------------------------------------------

          if (!databaseUser || hasAdditionalData) {
            const syncResponse = await saveUserToDatabase(
              firebaseUser,
              additionalData,
            );

            databaseUser = syncResponse?.user || null;
          }

          // ----------------------------------------------------
          // 4. GET USER AGAIN IF NECESSARY
          // ----------------------------------------------------

          if (!databaseUser) {
            databaseUser = await getCurrentUser();
          }

          // ----------------------------------------------------
          // 5. MAKE SURE USER EXISTS
          // ----------------------------------------------------

          if (!databaseUser) {
            throw new Error(
              "User was created but could not be retrieved from the database.",
            );
          }

          // ----------------------------------------------------
          // 6. BUILD APPLICATION USER
          // ----------------------------------------------------

          const applicationUser = buildUser(firebaseUser, databaseUser);

          // ----------------------------------------------------
          // 7. UPDATE REACT STATE
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
  // EMAIL / PASSWORD REGISTRATION
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
      // CLEAN REGISTRATION DATA
      // --------------------------------------------------------

      const cleanName =
        typeof additionalData.name === "string"
          ? additionalData.name.trim()
          : "";

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      const cleanPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : "";

      // --------------------------------------------------------
      // NAME VALIDATION
      // --------------------------------------------------------

      if (!cleanName) {
        throw new Error("Name is required.");
      }

      if (cleanName.length > 100) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      // --------------------------------------------------------
      // PHONE VALIDATION
      // --------------------------------------------------------

      /*
       * Manual Email/Password registration
       * ALWAYS requires a phone number.
       */
      if (!cleanPhone) {
        throw new Error("Phone number is required.");
      }

      if (!isValidBangladeshiPhone(cleanPhone)) {
        throw new Error("Enter a valid Bangladeshi phone number.");
      }

      let firebaseUser = null;

      /*
       * IMPORTANT:
       *
       * Set this BEFORE Firebase account creation.
       *
       * Firebase can immediately trigger
       * onAuthStateChanged().
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

        /*
         * Store registration UID.
         */
        registrationUidRef.current = firebaseUser.uid;

        // ------------------------------------------------------
        // 2. UPDATE FIREBASE DISPLAY NAME
        // ------------------------------------------------------

        await updateProfile(firebaseUser, {
          displayName: cleanName,
        });

        // ------------------------------------------------------
        // 3. SYNC FIREBASE → MONGODB
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, {
          ...additionalData,

          name: cleanName,

          /*
           * Manual registration always sends
           * a real phone number.
           */
          phone: cleanPhone,

          ...(cleanPhoto
            ? {
                photo: cleanPhoto,
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
        /*
         * Clear registration protection
         * only after registration flow completes.
         */
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
        // 2. MONGODB SYNCHRONIZATION
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
  // GOOGLE LOGIN / REGISTRATION
  // ==========================================================

  const signInWithGoogle = useCallback(
    async (additionalData = {}) => {
      setAuthError(null);

      /*
       * Prevent onAuthStateChanged from running
       * an early sync without optional Google data.
       */
      isGoogleSigningInRef.current = true;

      try {
        // ------------------------------------------------------
        // 1. GOOGLE POPUP
        // ------------------------------------------------------

        const result = await signInWithPopup(auth, googleProvider);

        const firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. CLEAN OPTIONAL GOOGLE DATA
        // ------------------------------------------------------

        const cleanName =
          typeof additionalData.name === "string"
            ? additionalData.name.trim()
            : "";

        const cleanPhone =
          typeof additionalData.phone === "string"
            ? additionalData.phone.trim()
            : "";

        const cleanPhoto =
          typeof additionalData.photo === "string"
            ? additionalData.photo.trim()
            : "";

        /*
         * Google phone is OPTIONAL.
         *
         * Do NOT throw when phone is empty.
         */
        if (cleanPhone && !isValidBangladeshiPhone(cleanPhone)) {
          throw new Error("Enter a valid Bangladeshi phone number.");
        }

        const googleAdditionalData = {
          ...(cleanName
            ? {
                name: cleanName,
              }
            : {}),

          /*
           * Only send phone when it actually exists.
           *
           * No phone:
           * do not send phone.
           *
           * Backend will create:
           *
           * phone: null
           *
           * for a new Google user.
           */
          ...(cleanPhone
            ? {
                phone: cleanPhone,
              }
            : {}),

          ...(cleanPhoto
            ? {
                photo: cleanPhoto,
              }
            : {}),
        };

        // ------------------------------------------------------
        // 3. MONGODB SYNCHRONIZATION
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, googleAdditionalData);

        // ------------------------------------------------------
        // 4. RETURN FIREBASE USER
        // ------------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Google authentication failed:", error);

        /*
         * If the Google popup created a new Firebase account
         * but backend synchronization failed, we intentionally
         * do not delete the Google Firebase account here.
         *
         * This avoids destructive behavior during temporary
         * network/backend failures.
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
        // ----------------------------------------------------
        // CURRENT PROVIDER
        // ----------------------------------------------------

        const provider = getProvider(firebaseUser);

        const isGoogleProvider = provider === "google";

        // ----------------------------------------------------
        // PREPARE NAME
        // ----------------------------------------------------

        const cleanName =
          typeof profileData.name === "string"
            ? profileData.name.trim()
            : cleanString(firebaseUser.displayName);

        if (!cleanName) {
          throw new Error("Name cannot be empty.");
        }

        if (cleanName.length > 100) {
          throw new Error("Name cannot exceed 100 characters.");
        }

        // ----------------------------------------------------
        // PREPARE PHONE
        // ----------------------------------------------------

        const hasPhoneField = Object.prototype.hasOwnProperty.call(
          profileData,
          "phone",
        );

        const cleanPhone =
          typeof profileData.phone === "string" ? profileData.phone.trim() : "";

        /*
         * If a phone value was actually provided,
         * validate it.
         */
        if (cleanPhone) {
          if (!isValidBangladeshiPhone(cleanPhone)) {
            throw new Error("Enter a valid Bangladeshi phone number.");
          }
        }

        /*
         * Manual/password users must have a phone.
         *
         * If the caller does not provide a new phone,
         * use the currently stored phone.
         */
        if (!isGoogleProvider) {
          const existingPhone =
            typeof user?.phone === "string" ? user.phone.trim() : "";

          if (!cleanPhone && !existingPhone) {
            throw new Error("Phone number is required.");
          }

          if (
            !cleanPhone &&
            existingPhone &&
            !isValidBangladeshiPhone(existingPhone)
          ) {
            throw new Error("Enter a valid Bangladeshi phone number.");
          }
        }

        // ----------------------------------------------------
        // PREPARE PHOTO
        // ----------------------------------------------------

        const cleanPhoto =
          typeof profileData.photo === "string"
            ? profileData.photo.trim()
            : cleanString(firebaseUser.photoURL);

        if (cleanPhoto && cleanPhoto.length > 2000) {
          throw new Error("Photo URL cannot exceed 2000 characters.");
        }

        // ----------------------------------------------------
        // PREPARE PROFILE
        // ----------------------------------------------------

        const cleanProfile =
          profileData.profile &&
          typeof profileData.profile === "object" &&
          !Array.isArray(profileData.profile)
            ? profileData.profile
            : undefined;

        // ----------------------------------------------------
        // 1. UPDATE FIREBASE PROFILE
        // ----------------------------------------------------

        const firebaseProfileData = {
          displayName: cleanName,
        };

        /*
         * Only send photo when an actual value exists.
         */
        if (cleanPhoto) {
          firebaseProfileData.photoURL = cleanPhoto;
        }

        await updateProfile(firebaseUser, firebaseProfileData);

        // ----------------------------------------------------
        // 2. UPDATE MONGODB
        // ----------------------------------------------------

        const payload = {
          name: cleanName,
        };

        /*
         * IMPORTANT:
         *
         * Only send phone when an actual phone exists.
         *
         * This means:
         *
         * Google user + no phone
         *      ↓
         * phone is omitted
         *      ↓
         * backend preserves existing phone.
         *
         * Therefore an existing Google phone
         * can never be accidentally replaced by null.
         */
        if (cleanPhone) {
          payload.phone = cleanPhone;
        } else if (!isGoogleProvider) {
          const existingPhone =
            typeof user?.phone === "string" ? user.phone.trim() : "";

          if (existingPhone) {
            payload.phone = existingPhone;
          }
        }

        /*
         * Avoid sending empty photo.
         */
        if (cleanPhoto) {
          payload.photo = cleanPhoto;
        }

        /*
         * Only send profile when provided.
         */
        if (cleanProfile !== undefined) {
          payload.profile = cleanProfile;
        }

        const response = await axiosSecure.patch("/auth/me", payload);

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to update profile.",
          );
        }

        // ----------------------------------------------------
        // 3. BUILD UPDATED APPLICATION USER
        // ----------------------------------------------------

        const databaseUser = response.data?.user || {};

        const applicationUser = buildUser(firebaseUser, databaseUser);

        if (isMountedRef.current) {
          setUser(applicationUser);
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
      // ----------------------------------------------------
      // GET USER FROM MONGODB
      // ----------------------------------------------------

      let databaseUser = await getCurrentUser();

      // ----------------------------------------------------
      // RECREATE / SYNC IF MISSING
      // ----------------------------------------------------

      if (!databaseUser) {
        /*
         * If the MongoDB user does not exist,
         * synchronize it.
         *
         * For Google:
         * backend can create phone: null.
         *
         * For manual users:
         * backend requires a phone.
         */
        return await syncUserWithBackend(firebaseUser);
      }

      // ----------------------------------------------------
      // BUILD APPLICATION USER
      // ----------------------------------------------------

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
      // ------------------------------------------------------
      // FIREBASE SIGN OUT
      // ------------------------------------------------------

      await signOut(auth);

      // ------------------------------------------------------
      // CLEAR LOCAL STATE
      // ------------------------------------------------------

      if (isMountedRef.current) {
        setUser(null);
      }

      // ------------------------------------------------------
      // CLEAR SYNCHRONIZATION CACHE
      // ------------------------------------------------------

      syncPromiseRef.current.clear();

      // ------------------------------------------------------
      // CLEAR AUTH FLOW REFS
      // ------------------------------------------------------

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
    setUser(null);
    setAuthError(null);

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

      // --------------------------------------------------
      // USER LOGGED OUT
      // --------------------------------------------------

      if (!firebaseUser) {
        setUser(null);
        setAuthError(null);
        setLoading(false);

        return;
      }

      // --------------------------------------------------
      // EMAIL REGISTRATION IS RUNNING
      // --------------------------------------------------

      /*
       * Do not perform automatic synchronization
       * while usersignup() is handling registration.
       */
      if (
        isRegisteringRef.current ||
        registrationUidRef.current === firebaseUser.uid
      ) {
        setLoading(false);

        return;
      }

      // --------------------------------------------------
      // GOOGLE POPUP LOGIN IS RUNNING
      // --------------------------------------------------

      /*
       * Do not let the auth listener race with
       * signInWithGoogle().
       *
       * signInWithGoogle() will explicitly synchronize
       * the Firebase user with MongoDB.
       */
      if (isGoogleSigningInRef.current) {
        setLoading(false);

        return;
      }

      // --------------------------------------------------
      // NORMAL LOGIN / SESSION RESTORATION
      // --------------------------------------------------

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
         * Do not automatically sign out Firebase.
         *
         * A backend/network problem should not
         * destroy the Firebase session.
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
       * React StrictMode can temporarily unmount
       * and remount components during development.
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
