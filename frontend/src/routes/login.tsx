import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { GoogleButton } from "@/components/shared/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, toUserMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  oauth_denied: "Google sign-in was cancelled.",
  oauth_state: "Sign-in could not be verified. Please try again.",
  oauth_missing_code: "The sign-in link was incomplete. Please try again.",
  oauth_failed: "We couldn't complete your Google sign-in.",
  oauth_email_registered:
    "That email already has a password-based account. Sign in with your password instead.",
};

export const Route = createFileRoute("/login")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>): { redirect?: string; error?: string } => ({
    ...(typeof search["redirect"] === "string" ? { redirect: search["redirect"] as string } : {}),
    ...(typeof search["error"] === "string" ? { error: search["error"] as string } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Fathom" },
      { name: "description", content: "Sign in to Fathom with email and password or Google." },
      { property: "og:title", content: "Sign in — Fathom" },
      {
        property: "og:description",
        content: "Sign in to Fathom to share and explore photography.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { login, loginWithGoogle, status, sessionExpired } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(
    search.error
      ? (OAUTH_ERROR_MESSAGES[search.error] ?? "Google sign-in failed. Please try again.")
      : null,
  );
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    const target =
      search.redirect && search.redirect.startsWith("/") && !search.redirect.startsWith("/login")
        ? search.redirect
        : "/";
    void navigate({ to: target, replace: true });
  }, [status, navigate, search.redirect]);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email: email.trim(), password });
    } catch (caught) {
      // A 401 here means "wrong email/password", not an expired session —
      // toUserMessage's generic 401 copy is for authenticated requests elsewhere.
      const message =
        caught instanceof ApiError && caught.status === 401
          ? caught.message || "Invalid email or password."
          : toUserMessage(caught, "We couldn't sign you in. Check your details and try again.");
      setError(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-3xl tracking-tight">Fathom</p>
          <p className="mt-2 text-sm text-muted-foreground">Depth over noise.</p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-soft)]">
          <h1 className="text-lg font-semibold">Sign in</h1>

          {sessionExpired ? (
            <p
              role="status"
              className="mt-3 rounded-lg bg-secondary p-3 text-sm text-muted-foreground"
            >
              Your session expired. Please sign in again.
            </p>
          ) : null}

          <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending || !email || !password}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Sign in"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton onClick={loginWithGoogle} />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to Fathom?{" "}
          <Link to="/register" className="font-medium text-foreground underline underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
