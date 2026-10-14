import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const getEnvVar = (key, fallback = "") => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  const proc = typeof globalThis !== "undefined" ? globalThis.process : undefined;
  if (proc && proc.env && proc.env[key]) {
    return proc.env[key];
  }
  return fallback;
};

/**
 * Firebase Client Configuration
 * Uses Vite environment variables with robust fallbacks to the existing project configuration.
 */
const firebaseConfig = {
  apiKey: getEnvVar("VITE_FIREBASE_API_KEY", "AIzaSyAzasoo8Y7Tt7V_n0Ct7yzR0d1APDyBJ9M"),
  authDomain: getEnvVar("VITE_FIREBASE_AUTH_DOMAIN", "portfolio-c6f29.firebaseapp.com"),
  projectId: getEnvVar("VITE_FIREBASE_PROJECT_ID", "portfolio-c6f29"),
  storageBucket: getEnvVar("VITE_FIREBASE_STORAGE_BUCKET", "portfolio-c6f29.appspot.com"),
  messagingSenderId: getEnvVar("VITE_FIREBASE_MESSAGING_SENDER_ID", "350726943938"),
  appId: getEnvVar("VITE_FIREBASE_APP_ID", "1:350726943938:web:6ab5e6de3177b611ce375b"),
};

/**
 * Authorized Administrator Email Whitelist
 * Strict access control: only this email is authorized to access the CMS and modify Firestore.
 */
export const ADMIN_EMAIL = getEnvVar("VITE_ADMIN_EMAIL", "piyushbhagwat5@gmail.com")
  .toLowerCase()
  .trim();

// Initialize or reuse existing Firebase app singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

/**
 * Checks whether the given user object belongs to the authorized administrator.
 *
 * @param {import("firebase/auth").User | null} user - Firebase user object
 * @returns {boolean} True if user is logged in and email matches ADMIN_EMAIL
 */
export const isAuthorizedAdmin = (user) => {
  if (!user || !user.email) return false;
  return user.email.toLowerCase().trim() === ADMIN_EMAIL;
};

/**
 * Formats Firebase Auth error codes into human-readable, actionable error messages.
 *
 * @param {any} error - Firebase Auth error or custom Error object
 * @returns {string} User-friendly error message
 */
export const formatAuthErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";
  const code = error.code || "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid email or password. Please verify your administrator credentials.";
    case "auth/invalid-email":
      return "Please provide a valid email address.";
    case "auth/user-disabled":
      return "This administrator account has been disabled. Please check the Firebase console.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Access is temporarily restricted. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Please verify your internet connection.";
    default:
      return error.message || "Authentication failed. Please try again.";
  }
};

/**
 * Authenticates the administrator using email and password.
 * Restricts access strictly to the authorized ADMIN_EMAIL.
 * If credentials are valid but the email does not match ADMIN_EMAIL,
 * the session is immediately terminated and an error is thrown.
 *
 * @param {string} email - Administrator email address
 * @param {string} password - Administrator password
 * @returns {Promise<import("firebase/auth").User>} Authenticated admin User object
 * @throws {Error} User-friendly error with error.code attached
 */
export const loginWithEmail = async (email, password) => {
  const trimmedEmail = (email || "").trim().toLowerCase();
  const trimmedPassword = (password || "").trim();

  if (!trimmedEmail) {
    const err = new Error("Email address is required.");
    err.code = "auth/missing-email";
    throw err;
  }

  if (!trimmedPassword) {
    const err = new Error("Password is required.");
    err.code = "auth/missing-password";
    throw err;
  }

  // Pre-check against whitelist to avoid unnecessary authentication round-trip
  if (trimmedEmail !== ADMIN_EMAIL) {
    const err = new Error(`Unauthorized: Access is restricted to the administrator account (${ADMIN_EMAIL}).`);
    err.code = "auth/unauthorized-admin";
    throw err;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, trimmedEmail, trimmedPassword);
    const user = userCredential.user;

    // Strict post-authentication verification
    if (!isAuthorizedAdmin(user)) {
      await signOut(auth);
      const err = new Error(`Unauthorized: Access is restricted to the administrator account (${ADMIN_EMAIL}).`);
      err.code = "auth/unauthorized-admin";
      throw err;
    }

    return user;
  } catch (error) {
    // If the error was our unauthorized guard, re-throw directly
    if (error.code === "auth/unauthorized-admin") {
      throw error;
    }

    const formattedMessage = formatAuthErrorMessage(error);
    const customError = new Error(formattedMessage);
    customError.code = error.code;
    customError.originalError = error;
    throw customError;
  }
};

/**
 * Signs out the currently authenticated user/admin.
 *
 * @returns {Promise<void>}
 */
export const logoutAdmin = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase signOut error:", error);
    const formattedMessage = formatAuthErrorMessage(error);
    const customError = new Error(formattedMessage);
    customError.code = error.code;
    throw customError;
  }
};

/**
 * Sends a password reset email to the authorized administrator.
 *
 * @param {string} [email=ADMIN_EMAIL] - Email to send reset link to (must match ADMIN_EMAIL)
 * @returns {Promise<void>}
 */
export const resetAdminPassword = async (email = ADMIN_EMAIL) => {
  const targetEmail = (email || ADMIN_EMAIL).trim().toLowerCase();

  if (targetEmail !== ADMIN_EMAIL) {
    const err = new Error("Password reset is only available for the administrator account.");
    err.code = "auth/unauthorized-admin";
    throw err;
  }

  try {
    await sendPasswordResetEmail(auth, targetEmail);
  } catch (error) {
    const formattedMessage = formatAuthErrorMessage(error);
    const customError = new Error(formattedMessage);
    customError.code = error.code;
    throw customError;
  }
};

/**
 * Subscribes to Firebase auth state changes.
 * Calls listener with { user, isAdmin } whenever the auth state changes.
 *
 * @param {(state: { user: import("firebase/auth").User | null, isAdmin: boolean }) => void} callback
 * @returns {import("firebase/auth").Unsubscribe} Unsubscribe function
 */
export const subscribeToAuthState = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    const isAdmin = isAuthorizedAdmin(user);
    callback({ user, isAdmin });
  });
};

export default {
  app,
  auth,
  db,
  storage,
  ADMIN_EMAIL,
  isAuthorizedAdmin,
  formatAuthErrorMessage,
  loginWithEmail,
  logoutAdmin,
  resetAdminPassword,
  subscribeToAuthState,
};
