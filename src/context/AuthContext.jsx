import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import {
  auth,
  ADMIN_EMAIL,
  loginWithEmail,
  logoutAdmin,
  subscribeToAuthState,
} from "../services/firebase.js";

/**
 * Authentication Context
 * Exposes current user state, administrative privileges, and authentication methods.
 */
export const AuthContext = createContext(null);

/**
 * AuthProvider Component
 * Manages the global Firebase Auth lifecycle and provides authentication state to descendants.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Subscribe to Firebase Auth state on mount
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToAuthState(({ user: currentUser, isAdmin: userIsAdmin }) => {
      if (!isMounted) return;
      setUser(currentUser);
      setIsAdmin(userIsAdmin);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  /**
   * Log in with administrator email and password
   * @param {string} email
   * @param {string} password
   * @returns {Promise<import("firebase/auth").User>}
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const authenticatedUser = await loginWithEmail(email, password);
      setUser(authenticatedUser);
      setIsAdmin(true);
      return authenticatedUser;
    } catch (err) {
      const message = err.message || "Login failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Sign out the administrator
   * @returns {Promise<void>}
   */
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutAdmin();
      setUser(null);
      setIsAdmin(false);
    } catch (err) {
      const message = err.message || "Logout failed.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Refreshes the active user's ID token.
   * Useful before executing critical Firestore writes or long blog editing sessions.
   * @param {boolean} [forceRefresh=true]
   * @returns {Promise<string|null>}
   */
  const refreshToken = useCallback(async (forceRefresh = true) => {
    if (!auth.currentUser) return null;
    try {
      return await auth.currentUser.getIdToken(forceRefresh);
    } catch (err) {
      console.error("Token refresh failed:", err);
      return null;
    }
  }, []);

  /**
   * Clear any lingering authentication errors
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAdmin,
      loading,
      error,
      adminEmail: ADMIN_EMAIL,
      login,
      logout,
      refreshToken,
      clearError,
    }),
    [user, isAdmin, loading, error, login, logout, refreshToken, clearError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node,
};

/**
 * Custom hook to consume the AuthContext.
 * Throws a descriptive error if called outside an <AuthProvider>.
 * @returns {{
 *   user: import("firebase/auth").User | null,
 *   isAdmin: boolean,
 *   loading: boolean,
 *   error: string | null,
 *   adminEmail: string,
 *   login: (email: string, password: string) => Promise<import("firebase/auth").User>,
 *   logout: () => Promise<void>,
 *   refreshToken: (forceRefresh?: boolean) => Promise<string | null>,
 *   clearError: () => void,
 * }}
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return context;
};

export default AuthProvider;
