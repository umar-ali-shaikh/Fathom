/**
 * Central runtime configuration.
 *
 * NOTHING in the app may hardcode an API URL. Every network call resolves its
 * base from here, which reads the browser-safe env var `VITE_API_BASE_URL`.
 *
 * .env (local) / project secrets (deploy):
 *   VITE_API_BASE_URL=https://api.your-fathom-backend.com
 *
 * Server-only secrets (GOOGLE_CLIENT_SECRET, etc.) live on the backend and are
 * never referenced from this file or any client module.
 */

const rawBaseUrl = (import.meta.env["VITE_API_BASE_URL"] as string | undefined) ?? "";

/** API origin, without a trailing slash. Empty string means "same origin". */
export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export const APP_NAME = "Fathom";

export const LIMITS = {
  captionMax: 2200,
  /** Caption counter becomes visible at 80% of the limit. */
  captionCounterThreshold: Math.floor(2200 * 0.8),
  bioMax: 160,
  searchDebounceMs: 300,
  recentSearchesMax: 8,
  maxUploadFiles: 10,
  maxUploadBytes: 10 * 1024 * 1024,
} as const;

export const STORAGE_KEYS = {
  recentSearches: "fathom.recent_searches",
  theme: "fathom.theme",
} as const;

export const ROUTES = {
  home: "/",
  explore: "/explore",
  activity: "/activity",
  create: "/create",
  profile: "/profile",
  settings: "/settings",
  login: "/login",
  register: "/register",
} as const;
