import { Outlet, createFileRoute, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/providers/auth-provider";

/**
 * Protected layout. The session lives in the browser (JWT access + refresh),
 * so the gate runs client-side; SSR is disabled for this subtree to avoid
 * rendering authenticated shells on the server.
 */
export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  useEffect(() => {
    if (status !== "unauthenticated") return;
    const redirect = pathname.startsWith("/login") ? "/" : pathname;
    void navigate({ to: "/login", search: { redirect }, replace: true });
  }, [status, navigate, pathname]);

  if (status !== "authenticated") {
    return (
      <div className="mx-auto w-full max-w-lg space-y-4 p-6" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading your session</span>
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
