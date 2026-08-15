import { createContext, useState, useEffect, useCallback } from "react";
import { login, register, getMe, logout } from "./services/auth.api";
import { setUnauthorizedHandler } from "../../lib/apiClient";

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    getMe()
      .then((response) => {
        if (!cancelled) setUser(response.user);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => setUser(null));
    return () => setUnauthorizedHandler(null);
  }, []);

  const handleLogin = useCallback(async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await login(username, password);
      setUser(response.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRegister = useCallback(async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await register(username, email, password);
      setUser(response.user);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
    } finally {
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await getMe();
      setUser(response.user);
    } catch {
      // interceptor's onUnauthorized handles a 401 here; nothing else to do
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        initializing,
        loading,
        error,
        handleLogin,
        handleRegister,
        handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
