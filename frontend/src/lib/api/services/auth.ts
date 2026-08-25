import { API_BASE_URL } from "@/lib/constants/config";
import { api } from "@/lib/api/client";
import { ENDPOINTS } from "@/lib/api/endpoints";
import type { RequestOptions } from "@/lib/api/client";
import type { User } from "@/lib/api/types";

export interface RegisterInput {
  name: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

/** Kicks off the server-driven Google redirect flow — not a fetch call. */
export function googleLoginUrl(): string {
  return `${API_BASE_URL}${ENDPOINTS.auth.googleAuthorize}`;
}

export const authService = {
  register: (input: RegisterInput) =>
    api
      .post<{ user: User }>(ENDPOINTS.auth.register, {
        email: input.email,
        username: input.username,
        password: input.password,
        fullName: input.name,
      })
      .then((res) => res.user),

  login: (input: LoginInput) =>
    api
      .post<{ user: User }>(ENDPOINTS.auth.login, input, { silent401: true })
      .then((res) => res.user),

  me: (options?: Pick<RequestOptions, "silent401">) =>
    api.get<{ user: User }>(ENDPOINTS.auth.me, options).then((res) => res.user),

  logout: () => api.post<void>(ENDPOINTS.auth.logout),
};
