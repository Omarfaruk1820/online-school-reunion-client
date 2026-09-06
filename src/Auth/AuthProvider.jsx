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
   * Prevents duplicate Firebase → MongoDB synchronization.
   *
   * This is especially useful because React StrictMode can
   * cause effects to run more than once during development.
   */
  const syncPromiseRef = useRef(new Map());

  /*
   * Prevents state updates after component unmount.
   */
  const isMountedRef = useRef(true);

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

  /*
   * Backend endpoint:
   *
   * GET /api/auth/me
   *
   * axiosSecure baseURL should be:
   *
   * https://online-school-reunion-server.vercel.app/api
   *
   * Therefore:
   *
   * axiosSecure.get("/auth/me")
   *
   * becomes:
   *
   * https://online-school-reunion-server.vercel.app/api/auth/me
   */

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
       * Firebase user exists but MongoDB user does not exist.
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

  /*
   * Backend endpoint:
   *
   * POST /api/users
   *
   * Firebase identity is taken from:
   *
   * Authorization: Bearer <Firebase ID Token>
   *
   * role and status are controlled by backend.
   */

  const saveUserToDatabase = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        throw new Error("Firebase user is required.");
      }

      const provider = getProvider(firebaseUser);

      const cleanName =
        typeof additionalData.name === "string"
          ? additionalData.name.trim()
          : firebaseUser.displayName?.trim() || DEFAULT_USER_NAME;

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      const cleanPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : firebaseUser.photoURL || "";

      const cleanProfile =
        additionalData.profile &&
        typeof additionalData.profile === "object" &&
        !Array.isArray(additionalData.profile)
          ? additionalData.profile
          : {};

      const payload = {
        name: cleanName,
        phone: cleanPhone,
        photo: cleanPhoto,
        provider,
        profile: cleanProfile,
      };

      const response = await axiosSecure.post("/users", payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to synchronize user.",
        );
      }

      return response.data;
    },
    [getProvider],
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

      return {
        uid: firebaseUser.uid,

        _id: databaseUser?._id || databaseUser?.id || null,

        name:
          databaseUser?.name || firebaseUser.displayName || DEFAULT_USER_NAME,

        email: normalizeEmail(databaseUser?.email || firebaseUser.email),

        phone: databaseUser?.phone || "",

        photo: databaseUser?.photo || firebaseUser.photoURL || "",

        /*
         * IMPORTANT:
         *
         * role and status come from MongoDB.
         * Never trust role/status from frontend.
         */
        role: databaseUser?.role || "student",

        status: databaseUser?.status || "active",

        provider,

        emailVerified: firebaseUser.emailVerified === true,

        createdAt: databaseUser?.createdAt || null,

        updatedAt: databaseUser?.updatedAt || null,

        lastLogin: databaseUser?.lastLogin || null,

        profile: databaseUser?.profile || {},
      };
    },
    [getProvider, normalizeEmail],
  );

  // ==========================================================
  // SYNC FIREBASE USER WITH BACKEND
  // ==========================================================

  const syncUserWithBackend = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        return null;
      }

      const uid = firebaseUser.uid;

      /*
       * If synchronization is already running for this UID,
       * return the existing promise.
       */
      const existingPromise = syncPromiseRef.current.get(uid);

      if (existingPromise) {
        return existingPromise;
      }

      const syncPromise = (async () => {
        try {
          setAuthError(null);

          // --------------------------------------------------
          // 1. Try to get MongoDB user
          // --------------------------------------------------

          let databaseUser = await getCurrentUser();

          // --------------------------------------------------
          // 2. Create MongoDB user if it does not exist
          // --------------------------------------------------

          if (!databaseUser) {
            await saveUserToDatabase(firebaseUser, additionalData);

            // ------------------------------------------------
            // 3. Get newly created MongoDB user
            // ------------------------------------------------

            databaseUser = await getCurrentUser();
          }

          // --------------------------------------------------
          // 4. Make sure user exists
          // --------------------------------------------------

          if (!databaseUser) {
            throw new Error(
              "User was created but could not be retrieved from the database.",
            );
          }

          // --------------------------------------------------
          // 5. Build application user
          // --------------------------------------------------

          const applicationUser = buildUser(firebaseUser, databaseUser);

          // --------------------------------------------------
          // 6. Update React state
          // --------------------------------------------------

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
        syncPromiseRef.current.delete(uid);
      }
    },
    [buildUser, getCurrentUser, saveUserToDatabase],
  );

  // ==========================================================
  // REGISTER
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

      let firebaseUser = null;

      try {
        // ----------------------------------------------------
        // 1. Create Firebase account
        // ----------------------------------------------------

        const result = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        firebaseUser = result.user;

        // ----------------------------------------------------
        // 2. Update Firebase display name
        // ----------------------------------------------------

        const cleanName =
          typeof additionalData.name === "string"
            ? additionalData.name.trim()
            : "";

        if (cleanName) {
          await updateProfile(firebaseUser, {
            displayName: cleanName,
          });
        }

        // ----------------------------------------------------
        // 3. Sync with MongoDB
        // ----------------------------------------------------

        await syncUserWithBackend(firebaseUser, additionalData);

        return firebaseUser;
      } catch (error) {
        console.error("Email registration failed:", error);

        /*
         * Roll back Firebase account if MongoDB
         * synchronization failed.
         */
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
      }
    },
    [normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // LOGIN
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
        // ----------------------------------------------------
        // 1. Firebase login
        // ----------------------------------------------------

        const result = await signInWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        const firebaseUser = result.user;

        // ----------------------------------------------------
        // 2. MongoDB synchronization
        // ----------------------------------------------------

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

  const signInWithGoogle = useCallback(async () => {
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

      await syncUserWithBackend(firebaseUser);

      return firebaseUser;
    } catch (error) {
      console.error("Google authentication failed:", error);

      if (isMountedRef.current) {
        setAuthError(error);
      }

      throw error;
    }
  }, [syncUserWithBackend]);

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

  /*
   * Firebase:
   *
   * updateProfile()
   *
   * MongoDB:
   *
   * PATCH /api/auth/me
   *
   * IMPORTANT:
   *
   * This must NOT use /users/me because your backend
   * users.routes.js does not have PATCH /users/me.
   */

  const updateUserProfile = useCallback(
    async (profileData = {}) => {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("No authenticated user found.");
      }

      setAuthError(null);

      try {
        // ----------------------------------------------------
        // Prepare data
        // ----------------------------------------------------

        const cleanName =
          typeof profileData.name === "string"
            ? profileData.name.trim()
            : firebaseUser.displayName || "";

        const cleanPhoto =
          typeof profileData.photo === "string"
            ? profileData.photo.trim()
            : firebaseUser.photoURL || "";

        const cleanPhone =
          typeof profileData.phone === "string" ? profileData.phone.trim() : "";

        const cleanProfile =
          profileData.profile &&
          typeof profileData.profile === "object" &&
          !Array.isArray(profileData.profile)
            ? profileData.profile
            : undefined;

        // ----------------------------------------------------
        // 1. Update Firebase profile
        // ----------------------------------------------------

        await updateProfile(firebaseUser, {
          displayName: cleanName,
          photoURL: cleanPhoto,
        });

        // ----------------------------------------------------
        // 2. Update MongoDB profile
        // ----------------------------------------------------

        const payload = {
          name: cleanName,
          phone: cleanPhone,
          photo: cleanPhoto,
        };

        if (cleanProfile !== undefined) {
          payload.profile = cleanProfile;
        }

        /*
         * Correct backend endpoint:
         *
         * PATCH /api/auth/me
         */
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
    [buildUser],
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
       * If MongoDB user is missing, recreate/synchronize it.
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
      /*
       * Firebase is responsible for authentication
       * session logout.
       */
      await signOut(auth);

      if (isMountedRef.current) {
        setUser(null);
      }

      syncPromiseRef.current.clear();
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
      // User logged in
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
         * Do not automatically sign out the Firebase user
         * here.
         *
         * The backend/network may temporarily be unavailable.
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
       * components during development. Clearing active
       * promises here can create unnecessary duplicate
       * requests.
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
