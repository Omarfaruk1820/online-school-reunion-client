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

  const syncPromiseRef = useRef(new Map());

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

  const getCurrentUser = useCallback(async () => {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      return null;
    }

    try {
      const response = await axiosSecure.get("/auth/me");

      return response.data?.user || null;
    } catch (error) {
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
          : firebaseUser.displayName?.trim() || DEFAULT_USER_NAME;

      // --------------------------------------------------------
      // Phone
      // --------------------------------------------------------

      const cleanPhone =
        typeof additionalData.phone === "string"
          ? additionalData.phone.trim()
          : "";

      // --------------------------------------------------------
      // Photo
      // --------------------------------------------------------

      const cleanPhoto =
        typeof additionalData.photo === "string"
          ? additionalData.photo.trim()
          : firebaseUser.photoURL || "";

      // --------------------------------------------------------
      // Profile
      // --------------------------------------------------------

      const cleanProfile =
        additionalData.profile &&
        typeof additionalData.profile === "object" &&
        !Array.isArray(additionalData.profile)
          ? additionalData.profile
          : {};

      // --------------------------------------------------------
      // Backend payload
      //
      // IMPORTANT:
      // phone is explicitly included here.
      // --------------------------------------------------------

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
          setAuthError(null);

          // ----------------------------------------------------
          // 1. Get existing MongoDB user
          // ----------------------------------------------------

          let databaseUser = await getCurrentUser();

          // ----------------------------------------------------
          // 2. Determine whether client has meaningful profile data
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
          // 3. Create or update MongoDB user
          //
          // Registration sends:
          //
          // {
          //   name,
          //   phone
          // }
          //
          // So /users will be called even if the user already
          // exists in MongoDB.
          // ----------------------------------------------------

          if (!databaseUser || hasAdditionalData) {
            const syncResponse = await saveUserToDatabase(
              firebaseUser,
              additionalData,
            );

            databaseUser = syncResponse?.user || null;
          }

          // ----------------------------------------------------
          // 4. Get user again if necessary
          // ----------------------------------------------------

          if (!databaseUser) {
            databaseUser = await getCurrentUser();
          }

          // ----------------------------------------------------
          // 5. Make sure user exists
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
        // 2. Prepare registration data
        // ----------------------------------------------------

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

        // ----------------------------------------------------
        // 3. Update Firebase display name
        // ----------------------------------------------------

        if (cleanName) {
          await updateProfile(firebaseUser, {
            displayName: cleanName,
          });
        }

        // ----------------------------------------------------
        // 4. Sync Firebase user + registration data
        //    with MongoDB
        // ----------------------------------------------------

        await syncUserWithBackend(firebaseUser, {
          ...additionalData,
          name: cleanName,
          phone: cleanPhone,
          photo: cleanPhoto,
        });

        // ----------------------------------------------------
        // 5. Return Firebase user
        // ----------------------------------------------------

        return firebaseUser;
      } catch (error) {
        console.error("Email registration failed:", error);

        // ----------------------------------------------------
        // 6. Roll back Firebase account if backend sync fails
        // ----------------------------------------------------

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
      // ----------------------------------------------------
      // 1. Google popup
      // ----------------------------------------------------

      const result = await signInWithPopup(auth, googleProvider);

      const firebaseUser = result.user;

      // ----------------------------------------------------
      // 2. MongoDB synchronization
      // ----------------------------------------------------

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

      // ----------------------------------------------------
      // Recreate/synchronize if missing
      // ----------------------------------------------------

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

      // --------------------------------------------------
      // User logged out
      // --------------------------------------------------

      if (!firebaseUser) {
        setUser(null);
        setAuthError(null);
        setLoading(false);

        return;
      }

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
         * Do not automatically sign out Firebase user.
         *
         * Backend/network may temporarily be unavailable.
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
