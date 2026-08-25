import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { GoogleButton } from "@/components/shared/google-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toUserMessage } from "@/lib/api/client";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/register")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Create your account — Fathom" },
      {
        name: "description",
        content: "Join Fathom to share photography and follow the people you care about.",
      },
      { property: "og:title", content: "Create your account — Fathom" },
      {
        property: "og:description",
        content: "Join Fathom to share photography and follow the people you care about.",
      },
    ],
  }),
  component: RegisterPage,
});

const USERNAME_PATTERN = /^[a-z0-9_.]{3,24}$/;

function RegisterPage() {
  const { register, loginWithGoogle, status } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (status === "authenticated") void navigate({ to: "/", replace: true });
  }, [status, navigate]);

  const usernameValid = USERNAME_PATTERN.test(form.username);
  const passwordValid = form.password.length >= 8;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!usernameValid)
      return setError("Usernames use 3-24 lowercase letters, numbers, dots or underscores.");
    if (!passwordValid) return setError("Passwords need at least 8 characters.");
    setPending(true);
    try {
      await register({
        name: form.name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
        password: form.password,
      });
    } catch (caught) {
      setError(toUserMessage(caught, "We couldn't create your account."));
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
          <h1 className="text-lg font-semibold">Create your account</h1>

          <form className="mt-5 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                autoComplete="name"
                required
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                autoComplete="username"
                required
                value={form.username}
                aria-describedby="username-hint"
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, username: event.target.value.toLowerCase() }))
                }
              />
              <p id="username-hint" className="text-xs text-muted-foreground">
                3-24 characters: letters, numbers, dots or underscores.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              />
              <p className="text-xs text-muted-foreground">At least 8 characters.</p>
            </div>

            {error ? (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Create account"}
            </Button>
          </form>

          <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" />
            or
            <span className="h-px flex-1 bg-border" />
          </div>

          <GoogleButton onClick={loginWithGoogle} label="Sign up with Google" />
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            to="/login"
            search={{}}
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
