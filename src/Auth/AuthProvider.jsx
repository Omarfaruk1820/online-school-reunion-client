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
   * Prevent duplicate backend synchronization for the
   * same Firebase UID.
   */
  const syncPromiseRef = useRef(new Map());

  /*
   * Track component mounted state.
   */
  const isMountedRef = useRef(true);

  /*
   * Important:
   *
   * Firebase's createUserWithEmailAndPassword() immediately
   * triggers onAuthStateChanged().
   *
   * Without this ref, both:
   *
   * usersignup()
   *      ↓
   * syncUserWithBackend(firebaseUser, { phone })
   *
   * and
   *
   * onAuthStateChanged()
   *      ↓
   * syncUserWithBackend(firebaseUser)
   *
   * can run at the same time.
   *
   * The second call may not contain phone.
   *
   * This ref prevents that registration race.
   */
  const isRegisteringRef = useRef(false);

  /*
   * Stores the Firebase UID currently being registered.
   *
   * This provides an additional protection after
   * createUserWithEmailAndPassword() resolves.
   */
  const registrationUidRef = useRef(null);

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
  // STRING HELPERS
  // ==========================================================

  const cleanString = useCallback((value) => {
    return typeof value === "string" ? value.trim() : "";
  }, []);

  // ==========================================================
  // PHONE VALIDATION
  // ==========================================================

  const isValidBangladeshiPhone = useCallback((phone) => {
    return /^01[3-9]\d{8}$/.test(phone);
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
       * During first-time registration the Firebase user
       * may exist before the MongoDB user exists.
       *
       * Therefore 404 is treated as "not created yet".
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

      // --------------------------------------------------------
      // Name
      // --------------------------------------------------------

      const cleanName =
        typeof additionalData.name === "string"
          ? additionalData.name.trim()
          : cleanString(firebaseUser.displayName);

      const finalName = cleanName || DEFAULT_USER_NAME;

      // --------------------------------------------------------
      // Phone
      // --------------------------------------------------------

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      /*
       * Phone is required by the backend.
       *
       * Never send null.
       * Never send an empty string.
       */
      if (!cleanPhone) {
        throw new Error("Phone number is required.");
      }

      if (!isValidBangladeshiPhone(cleanPhone)) {
        throw new Error("Enter a valid Bangladeshi phone number.");
      }

      // --------------------------------------------------------
      // Photo
      // --------------------------------------------------------

      const cleanAdditionalPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : "";

      const cleanFirebasePhoto = cleanString(firebaseUser.photoURL);

      const finalPhoto = cleanAdditionalPhoto || cleanFirebasePhoto;

      // --------------------------------------------------------
      // Profile
      // --------------------------------------------------------

      const cleanProfile =
        additionalData.profile &&
        typeof additionalData.profile === "object" &&
        !Array.isArray(additionalData.profile)
          ? additionalData.profile
          : undefined;

      // --------------------------------------------------------
      // Backend payload
      // --------------------------------------------------------

      const payload = {
        name: finalName,
        phone: cleanPhone,
        provider,
      };

      /*
       * IMPORTANT:
       *
       * Do NOT send:
       *
       * photo: null
       *
       * If photo does not exist, simply omit the field.
       */
      if (finalPhoto) {
        payload.photo = finalPhoto;
      }

      /*
       * Do not send an empty profile object unnecessarily.
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

        phone: databaseUser?.phone || "",

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

      /*
       * IMPORTANT:
       *
       * Only add photo when an actual value exists.
       *
       * No:
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
      // Prevent duplicate synchronization
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
          // 1. Try to get existing MongoDB user
          // ----------------------------------------------------

          let databaseUser = await getCurrentUser();

          // ----------------------------------------------------
          // 2. Check whether additional data exists
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
          // 3. Create / update MongoDB user
          // ----------------------------------------------------

          if (!databaseUser || hasAdditionalData) {
            const syncResponse = await saveUserToDatabase(
              firebaseUser,
              additionalData,
            );

            databaseUser = syncResponse?.user || null;
          }

          // ----------------------------------------------------
          // 4. Try one more time if needed
          // ----------------------------------------------------

          if (!databaseUser) {
            databaseUser = await getCurrentUser();
          }

          // ----------------------------------------------------
          // 5. Make sure MongoDB user exists
          // ----------------------------------------------------

          if (!databaseUser) {
            throw new Error(
              "User was created but could not be retrieved from the database.",
            );
          }

          // ----------------------------------------------------
          // 6. Build application user
          // ----------------------------------------------------

          const applicationUser = buildUser(firebaseUser, databaseUser);

          // ----------------------------------------------------
          // 7. Update React state
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
        /*
         * Remove only this UID's promise.
         */
        const currentPromise = syncPromiseRef.current.get(uid);

        if (currentPromise === syncPromise) {
          syncPromiseRef.current.delete(uid);
        }
      }
    },
    [buildUser, getCurrentUser, saveUserToDatabase],
  );

  // ==========================================================
  // EMAIL REGISTRATION
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
      // Clean registration data BEFORE Firebase creation
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
      // Validate name
      // --------------------------------------------------------

      if (!cleanName) {
        throw new Error("Name is required.");
      }

      if (cleanName.length > 100) {
        throw new Error("Name cannot exceed 100 characters.");
      }

      // --------------------------------------------------------
      // Validate phone BEFORE Firebase creation
      // --------------------------------------------------------

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
       * Set this BEFORE createUserWithEmailAndPassword().
       *
       * Firebase immediately triggers onAuthStateChanged().
       */
      isRegisteringRef.current = true;

      try {
        // ------------------------------------------------------
        // 1. Create Firebase account
        // ------------------------------------------------------

        const result = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        firebaseUser = result.user;

        /*
         * Store UID so the auth listener can also recognize
         * this exact registration.
         */
        registrationUidRef.current = firebaseUser.uid;

        // ------------------------------------------------------
        // 2. Update Firebase display name
        // ------------------------------------------------------

        await updateProfile(firebaseUser, {
          displayName: cleanName,
        });

        // ------------------------------------------------------
        // 3. Sync Firebase → MongoDB
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, {
          ...additionalData,
          name: cleanName,
          phone: cleanPhone,
          ...(cleanPhoto
            ? {
                photo: cleanPhoto,
              }
            : {}),
        });

        // ------------------------------------------------------
        // 4. Return Firebase user
        // ------------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Email registration failed:", error);

        // ------------------------------------------------------
        // Rollback Firebase account
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
         * Clear registration protection only after
         * explicit registration sync is complete.
         */
        isRegisteringRef.current = false;

        registrationUidRef.current = null;
      }
    },
    [isValidBangladeshiPhone, normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // EMAIL LOGIN
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
        // 1. Firebase login
        // ------------------------------------------------------

        const result = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        const firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. MongoDB synchronization
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
  // GOOGLE LOGIN
  // ==========================================================

  const signInWithGoogle = useCallback(
    async (additionalData = {}) => {
      setAuthError(null);

      try {
        // ------------------------------------------------------
        // 1. Google popup
        // ------------------------------------------------------

        const result = await signInWithPopup(auth, googleProvider);

        const firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. MongoDB synchronization
        // ------------------------------------------------------

        await syncUserWithBackend(firebaseUser, additionalData);

        return firebaseUser;
      } catch (error) {
        console.error("Google authentication failed:", error);

        if (isMountedRef.current) {
          setAuthError(error);
        }

        throw error;
      }
    },
    [syncUserWithBackend],
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
        // Prepare name
        // ----------------------------------------------------

        const cleanName =
          typeof profileData.name === "string"
            ? profileData.name.trim()
            : cleanString(firebaseUser.displayName);

        if (!cleanName) {
          throw new Error("Name cannot be empty.");
        }

        // ----------------------------------------------------
        // Prepare phone
        // ----------------------------------------------------

        const cleanPhone =
          typeof profileData.phone === "string" ? profileData.phone.trim() : "";

        if (!cleanPhone) {
          throw new Error("Phone number is required.");
        }

        if (!isValidBangladeshiPhone(cleanPhone)) {
          throw new Error("Enter a valid Bangladeshi phone number.");
        }

        // ----------------------------------------------------
        // Prepare photo
        // ----------------------------------------------------

        const cleanPhoto =
          typeof profileData.photo === "string"
            ? profileData.photo.trim()
            : cleanString(firebaseUser.photoURL);

        // ----------------------------------------------------
        // Prepare profile
        // ----------------------------------------------------

        const cleanProfile =
          profileData.profile &&
          typeof profileData.profile === "object" &&
          !Array.isArray(profileData.profile)
            ? profileData.profile
            : undefined;

        // ----------------------------------------------------
        // 1. Update Firebase profile
        // ----------------------------------------------------

        const firebaseProfileData = {
          displayName: cleanName,
        };

        /*
         * Never send null photo to Firebase.
         */
        if (cleanPhoto) {
          firebaseProfileData.photoURL = cleanPhoto;
        }

        await updateProfile(firebaseUser, firebaseProfileData);

        // ----------------------------------------------------
        // 2. Update MongoDB profile
        // ----------------------------------------------------

        const payload = {
          name: cleanName,
          phone: cleanPhone,
        };

        /*
         * Only send photo when an actual value exists.
         */
        if (cleanPhoto) {
          payload.photo = cleanPhoto;
        }

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
        // 3. Build updated application user
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
    [buildUser, cleanString, isValidBangladeshiPhone],
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

      // ----------------------------------------------------
      // Recreate / synchronize if missing
      // ----------------------------------------------------

      if (!databaseUser) {
        /*
         * Important:
         *
         * A missing user must have phone data.
         *
         * If the existing Firebase account was created
         * without phone data, backend will reject creation.
         */
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
      // ------------------------------------------------------
      // Firebase sign out
      // ------------------------------------------------------

      await signOut(auth);

      // ------------------------------------------------------
      // Clear local state
      // ------------------------------------------------------

      if (isMountedRef.current) {
        setUser(null);
      }

      // ------------------------------------------------------
      // Clear synchronization cache
      // ------------------------------------------------------

      syncPromiseRef.current.clear();

      isRegisteringRef.current = false;

      registrationUidRef.current = null;
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
      // User logged out
      // ----------------------------------------------------

      if (!firebaseUser) {
        setUser(null);
        setAuthError(null);
        setLoading(false);

        return;
      }

      // ----------------------------------------------------
      // IMPORTANT REGISTRATION RACE PROTECTION
      // ----------------------------------------------------

      /*
       * Firebase fires onAuthStateChanged()
       * immediately after createUserWithEmailAndPassword().
       *
       * During that period usersignup() owns the
       * Firebase → MongoDB synchronization.
       *
       * Therefore do NOT start another sync here.
       */

      if (
        isRegisteringRef.current ||
        registrationUidRef.current === firebaseUser.uid
      ) {
        setLoading(false);

        return;
      }

      // ----------------------------------------------------
      // Normal login / session restoration
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
         * Do not automatically sign out Firebase.
         *
         * Backend/network problems should not
         * automatically destroy the Firebase session.
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
       * React StrictMode can temporarily unmount/remount
       * components during development.
       */
    };
  }, [syncUserWithBackend]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const authInfo = useMemo(
    () => ({
      // ------------------------------------------------------
      // State
      // ------------------------------------------------------

      user,
      loading,
      authError,

      // ------------------------------------------------------
      // Authentication
      // ------------------------------------------------------

      usersignup,
      userLogin,
      signInWithGoogle,
      resetPassword,
      userLogout,

      // ------------------------------------------------------
      // User Management
      // ------------------------------------------------------

      saveUserToDatabase,
      syncUserWithBackend,
      getCurrentUser,
      refreshUser,
      updateUserProfile,

      // ------------------------------------------------------
      // Firebase
      // ------------------------------------------------------

      getFirebaseIdToken,

      // ------------------------------------------------------
      // Utility
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
