import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  authService,
  googleLoginUrl,
  type LoginInput,
  type RegisterInput,
} from "@/lib/api/services/auth";
import { setSessionExpiredHandler } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export type AuthStatus = "initializing" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  user: User | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  loginWithGoogle: () => void;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>("initializing");
  const [sessionExpired, setSessionExpired] = useState(false);

  // Restore the session on boot from the httpOnly cookie — a 401 here just
  // means "not signed in", not an expired session.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const me = await authService.me({ silent401: true });
        if (cancelled) return;
        setUserState(me);
        setStatus("authenticated");
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // Any 401 on an authenticated request tears the session down once.
  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUserState(null);
      setStatus("unauthenticated");
      setSessionExpired(true);
    });
    return () => setSessionExpiredHandler(() => {});
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const me = await authService.login(input);
    setUserState(me);
    setSessionExpired(false);
    setStatus("authenticated");
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const me = await authService.register(input);
    setUserState(me);
    setSessionExpired(false);
    setStatus("authenticated");
  }, []);

  /** A plain top-level navigation — the backend sets the session cookie and redirects back. */
  const loginWithGoogle = useCallback(() => {
    window.location.assign(googleLoginUrl());
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      /* the local session is cleared regardless of backend availability */
    }
    setUserState(null);
    setStatus("unauthenticated");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === "authenticated",
      isLoading: status === "initializing",
      sessionExpired,
      login,
      register,
      loginWithGoogle,
      logout,
      setUser: setUserState,
    }),
    [user, status, sessionExpired, login, register, loginWithGoogle, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}
