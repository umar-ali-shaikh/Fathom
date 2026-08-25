import { API_BASE_URL } from "@/lib/constants/config";

export class ApiError extends Error {
  status: number;
  code: string | undefined;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

/** Safe, user-facing message for any failure. Never leaks stacks or tokens. */
export function toUserMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return "Can't reach the server. Check your connection and try again.";
    if (error.status === 401) return "Your session has expired. Please sign in again.";
    if (error.status === 403) return "You don't have permission to do that.";
    if (error.status === 404) return "Not found.";
    if (error.status === 429) return "Too many attempts. Please wait a moment.";
    if (error.status >= 500)
      return "The server is unavailable right now. Please try again shortly.";
    return error.message || fallback;
  }
  return fallback;
}

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};
export function setSessionExpiredHandler(handler: SessionExpiredHandler) {
  onSessionExpired = handler;
}

function url(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function messageFromBody(body: unknown, status: number): string {
  if (body && typeof body === "object") {
    const record = body as Record<string, unknown>;
    for (const key of ["message", "error", "detail"]) {
      const value = record[key];
      // Only surface short, human-readable strings — never stack traces.
      if (
        typeof value === "string" &&
        value.length > 0 &&
        value.length <= 200 &&
        !value.includes("\n")
      ) {
        return value;
      }
    }
  }
  return `Request failed (${status})`;
}

/* -------------------------------------------------------------------------- */
/* Core request                                                                */
/* -------------------------------------------------------------------------- */
/*
 * Auth is a single httpOnly session cookie the backend sets on login/register
 * /Google callback — the browser sends it automatically via `credentials:
 * "include"`. There is no access/refresh token to attach or renew here.
 */

export interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** Don't tear down the session/show "session expired" for an expected 401 (e.g. the initial "am I logged in" check). */
  silent401?: boolean;
}

async function rawRequest<T>(path: string, options: RequestOptions): Promise<T> {
  const { method = "GET", body, query, signal, silent401 } = options;

  const search = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") search.set(key, String(value));
  });
  const queryString = search.toString();

  const headers: Record<string, string> = { Accept: "application/json" };
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  if (body !== undefined && !isFormData) headers["Content-Type"] = "application/json";

  let response: Response;
  try {
    const init: RequestInit = {
      method,
      headers,
      credentials: "include",
      ...(signal ? { signal } : {}),
    };
    if (body !== undefined) {
      init.body = isFormData ? (body as FormData) : JSON.stringify(body);
    }
    response = await fetch(url(`${path}${queryString ? `?${queryString}` : ""}`), init);
  } catch (error) {
    if ((error as Error)?.name === "AbortError") throw error;
    throw new ApiError("Network request failed", 0);
  }

  if (response.status === 401) {
    if (!silent401) onSessionExpired();
    const errorBody = await parseBody(response);
    throw new ApiError(messageFromBody(errorBody, 401), 401);
  }

  if (!response.ok) {
    const errorBody = await parseBody(response);
    const code =
      errorBody && typeof errorBody === "object"
        ? ((errorBody as Record<string, unknown>)["code"] as string | undefined)
        : undefined;
    throw new ApiError(messageFromBody(errorBody, response.status), response.status, code);
  }

  if (response.status === 204) return null as T;
  return (await parseBody(response)) as T;
}

export const api = {
  request: <T>(path: string, options: RequestOptions = {}) => rawRequest<T>(path, options),
  get: <T>(path: string, options: Omit<RequestOptions, "method" | "body"> = {}) =>
    rawRequest<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method"> = {}) =>
    rawRequest<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options: Omit<RequestOptions, "method"> = {}) =>
    rawRequest<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options: Omit<RequestOptions, "method"> = {}) =>
    rawRequest<T>(path, { ...options, method: "DELETE" }),
};
