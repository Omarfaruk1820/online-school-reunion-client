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
   * Stores currently running synchronization promises.
   *
   * This prevents:
   *
   * Register
   *      +
   * onAuthStateChanged
   *
   * from creating/updating the same MongoDB user
   * unnecessarily at the same time.
   */
  const syncPromiseRef = useRef(new Map());

  // ==========================================================
  // NORMALIZE EMAIL
  // ==========================================================

  const normalizeEmail = useCallback((email) => {
    return typeof email === "string" ? email.trim().toLowerCase() : "";
  }, []);

  // ==========================================================
  // GET FIREBASE ID TOKEN
  // ==========================================================

  /*
   * Firebase automatically refreshes the token when necessary.
   *
   * forceRefresh = true should only be used when an explicit
   * fresh token is required.
   */

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
  // GET CURRENT USER FROM MONGODB
  // ==========================================================

  /*
   * Backend:
   *
   * GET /api/auth/me
   *
   * Server:
   * verifyToken
   * verifyUser
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
       * Firebase user exists but MongoDB
       * user does not exist.
       */

      if (error.response?.status === 404) {
        return null;
      }

      throw error;
    }
  }, []);

  // ==========================================================
  // SAVE / SYNC USER TO MONGODB
  // ==========================================================

  /*
   * Backend:
   *
   * POST /api/users
   *
   * Server gets Firebase identity from:
   *
   * req.user
   *
   * role/status are NOT sent from frontend.
   */

  const saveUserToDatabase = useCallback(
    async (firebaseUser, additionalData = {}) => {
      if (!firebaseUser) {
        throw new Error("Firebase user is required.");
      }

      // ------------------------------------------------------
      // Detect Firebase provider
      // ------------------------------------------------------

      const firebaseProvider =
        firebaseUser.firebase?.sign_in_provider ||
        firebaseUser.providerData?.[0]?.providerId;

      const provider =
        firebaseProvider === "google.com" ? "google" : "password";

      // ------------------------------------------------------
      // Prepare payload
      // ------------------------------------------------------

      const payload = {
        name:
          typeof additionalData.name === "string"
            ? additionalData.name.trim()
            : firebaseUser.displayName || "School Member",

        phone:
          typeof additionalData.phone === "string"
            ? additionalData.phone.trim()
            : "",

        photo: additionalData.photo ?? firebaseUser.photoURL ?? "",

        provider,

        profile:
          additionalData.profile &&
          typeof additionalData.profile === "object" &&
          !Array.isArray(additionalData.profile)
            ? additionalData.profile
            : {},
      };

      // ------------------------------------------------------
      // POST /users
      //
      // axiosSecure automatically adds:
      //
      // Authorization:
      // Bearer <Firebase ID Token>
      // ------------------------------------------------------

      const response = await axiosSecure.post("/users", payload);

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Failed to synchronize user.",
        );
      }

      return response.data;
    },
    [],
  );

  // ==========================================================
  // BUILD APPLICATION USER
  // ==========================================================

  const buildUser = useCallback(
    (firebaseUser, databaseUser = {}) => {
      if (!firebaseUser) {
        return null;
      }

      // ------------------------------------------------------
      // Provider
      // ------------------------------------------------------

      const provider =
        databaseUser?.provider ||
        (firebaseUser.providerData?.some(
          (item) => item.providerId === "google.com",
        )
          ? "google"
          : "password");

      // ------------------------------------------------------
      // Application user
      // ------------------------------------------------------

      return {
        uid: firebaseUser.uid,

        _id: databaseUser?._id || databaseUser?.id || null,

        name: databaseUser?.name || firebaseUser.displayName || "School Member",

        email: normalizeEmail(databaseUser?.email || firebaseUser.email),

        phone: databaseUser?.phone || "",

        photo: databaseUser?.photo || firebaseUser.photoURL || "",

        role: databaseUser?.role || "student",

        status: databaseUser?.status || "active",

        provider,

        emailVerified: firebaseUser.emailVerified,

        createdAt: databaseUser?.createdAt || null,

        updatedAt: databaseUser?.updatedAt || null,

        lastLogin: databaseUser?.lastLogin || null,

        profile: databaseUser?.profile || {},
      };
    },
    [normalizeEmail],
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

      /*
       * If this UID is already being synchronized,
       * return the existing promise.
       */

      const existingPromise = syncPromiseRef.current.get(uid);

      if (existingPromise) {
        return existingPromise;
      }

      const syncPromise = (async () => {
        try {
          setAuthError(null);

          // ------------------------------------------------
          // 1. Check MongoDB
          // ------------------------------------------------

          let databaseUser = await getCurrentUser();

          // ------------------------------------------------
          // 2. Create MongoDB user if missing
          // ------------------------------------------------

          if (!databaseUser) {
            await saveUserToDatabase(firebaseUser, additionalData);

            // ----------------------------------------------
            // 3. Fetch newly created MongoDB user
            // ----------------------------------------------

            databaseUser = await getCurrentUser();
          }

          // ------------------------------------------------
          // 4. If still missing, fail
          // ------------------------------------------------

          if (!databaseUser) {
            throw new Error(
              "User was created but could not be retrieved from the database.",
            );
          }

          // ------------------------------------------------
          // 5. Build application user
          // ------------------------------------------------

          const applicationUser = buildUser(firebaseUser, databaseUser);

          // ------------------------------------------------
          // 6. Update React state
          // ------------------------------------------------

          setUser(applicationUser);

          return applicationUser;
        } catch (error) {
          console.error("User synchronization failed:", error);

          setAuthError(error);

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
  // REGISTER WITH EMAIL & PASSWORD
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
        // ------------------------------------------------------
        // 1. Create Firebase account
        // ------------------------------------------------------

        const result = await createUserWithEmailAndPassword(
          auth,
          normalizedEmail,
          password,
        );

        firebaseUser = result.user;

        // ------------------------------------------------------
        // 2. Update Firebase display name
        // ------------------------------------------------------

        const cleanName =
          typeof additionalData.name === "string"
            ? additionalData.name.trim()
            : "";

        if (cleanName) {
          await updateProfile(firebaseUser, {
            displayName: cleanName,
          });
        }

        // ------------------------------------------------------
        // 3. Sync Firebase user to MongoDB
        // ------------------------------------------------------

        const applicationUser = await syncUserWithBackend(
          firebaseUser,
          additionalData,
        );

        // ------------------------------------------------------
        // 4. Return Firebase user
        //
        // Existing UserRegister.jsx can continue using:
        //
        // await usersignup(...)
        // ------------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Email registration failed:", error);

        /*
         * If Firebase account was created but MongoDB
         * synchronization failed, try to remove the newly
         * created Firebase account.
         *
         * This prevents an orphan Firebase account in
         * most registration failure cases.
         */

        if (firebaseUser) {
          try {
            await deleteUser(firebaseUser);
          } catch (deleteError) {
            console.error("Failed to rollback Firebase user:", deleteError);
          }
        }

        setAuthError(error);

        throw error;
      }
    },
    [normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // LOGIN WITH EMAIL & PASSWORD
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

        setAuthError(error);

        throw error;
      }
    },
    [normalizeEmail, syncUserWithBackend],
  );

  // ==========================================================
  // LOGIN / REGISTER WITH GOOGLE
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
      // 2. Create/sync MongoDB user
      // ------------------------------------------------------

      await syncUserWithBackend(firebaseUser);

      return firebaseUser;
    } catch (error) {
      console.error("Google authentication failed:", error);

      setAuthError(error);

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

        setAuthError(error);

        throw error;
      }
    },
    [normalizeEmail],
  );

  // ==========================================================
  // UPDATE USER PROFILE
  // ==========================================================

  /*
   * IMPORTANT:
   *
   * Your current users.routes.js does NOT yet have:
   *
   * PATCH /users/me
   *
   * Therefore, this function expects that endpoint to be added.
   *
   * Recommended backend endpoint:
   *
   * PATCH /api/users/me
   */

  const updateUserProfile = useCallback(
    async (profileData = {}) => {
      const firebaseUser = auth.currentUser;

      if (!firebaseUser) {
        throw new Error("No authenticated user found.");
      }

      setAuthError(null);

      try {
        const cleanName =
          typeof profileData.name === "string"
            ? profileData.name.trim()
            : firebaseUser.displayName || "";

        const cleanPhoto =
          typeof profileData.photo === "string"
            ? profileData.photo.trim()
            : firebaseUser.photoURL || "";

        // ----------------------------------------------------
        // 1. Update Firebase profile
        // ----------------------------------------------------

        await updateProfile(firebaseUser, {
          displayName: cleanName,
          photoURL: cleanPhoto,
        });

        // ----------------------------------------------------
        // 2. Update MongoDB
        // ----------------------------------------------------

        const response = await axiosSecure.patch("/users/me", {
          name: cleanName,

          phone:
            typeof profileData.phone === "string"
              ? profileData.phone.trim()
              : undefined,

          photo: cleanPhoto,

          profile:
            profileData.profile &&
            typeof profileData.profile === "object" &&
            !Array.isArray(profileData.profile)
              ? profileData.profile
              : undefined,
        });

        if (!response.data?.success) {
          throw new Error(
            response.data?.message || "Failed to update profile.",
          );
        }

        // ----------------------------------------------------
        // 3. Build updated application user
        // ----------------------------------------------------

        const databaseUser = response.data?.user;

        const applicationUser = buildUser(firebaseUser, databaseUser);

        setUser(applicationUser);

        return applicationUser;
      } catch (error) {
        console.error("Profile update failed:", error);

        setAuthError(error);

        throw error;
      }
    },
    [buildUser],
  );

  // ==========================================================
  // REFRESH CURRENT USER
  // ==========================================================

  const refreshUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      setUser(null);
      return null;
    }

    try {
      const databaseUser = await getCurrentUser();

      if (!databaseUser) {
        /*
         * Firebase account exists but MongoDB
         * account is missing.
         *
         * Re-sync it.
         */

        return await syncUserWithBackend(firebaseUser);
      }

      const applicationUser = buildUser(firebaseUser, databaseUser);

      setUser(applicationUser);

      setAuthError(null);

      return applicationUser;
    } catch (error) {
      console.error("Failed to refresh user:", error);

      setAuthError(error);

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

      setUser(null);

      syncPromiseRef.current.clear();
    } catch (error) {
      console.error("Logout failed:", error);

      setAuthError(error);

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
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // ----------------------------------------------------
      // Component unmounted
      // ----------------------------------------------------

      if (!isMounted) {
        return;
      }

      // ----------------------------------------------------
      // User logged out
      // ----------------------------------------------------

      if (!firebaseUser) {
        if (isMounted) {
          setUser(null);
          setAuthError(null);
          setLoading(false);
        }

        return;
      }

      // ----------------------------------------------------
      // Start loading
      // ----------------------------------------------------

      setLoading(true);

      try {
        /*
         * syncUserWithBackend handles:
         *
         * 1. GET /auth/me
         * 2. POST /users if missing
         * 3. GET /auth/me again
         * 4. Build application user
         */

        const applicationUser = await syncUserWithBackend(firebaseUser);

        if (isMounted) {
          setUser(applicationUser);
          setAuthError(null);
        }
      } catch (error) {
        console.error("Auth state synchronization failed:", error);

        if (isMounted) {
          setUser(null);
          setAuthError(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    });

    // ----------------------------------------------------------
    // Cleanup
    // ----------------------------------------------------------

    return () => {
      isMounted = false;

      unsubscribe();

      syncPromiseRef.current.clear();
    };
  }, [syncUserWithBackend]);

  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const authInfo = useMemo(
    () => ({
      // --------------------------------------------------------
      // State
      // --------------------------------------------------------

      user,

      loading,

      authError,

      // --------------------------------------------------------
      // Authentication
      // --------------------------------------------------------

      usersignup,

      userLogin,

      signInWithGoogle,

      resetPassword,

      userLogout,

      // --------------------------------------------------------
      // User management
      // --------------------------------------------------------

      saveUserToDatabase,

      syncUserWithBackend,

      getCurrentUser,

      refreshUser,

      updateUserProfile,

      // --------------------------------------------------------
      // Firebase
      // --------------------------------------------------------

      getFirebaseIdToken,

      // --------------------------------------------------------
      // Utility
      // --------------------------------------------------------

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
