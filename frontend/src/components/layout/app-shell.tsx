import { Link, useRouterState } from "@tanstack/react-router";
import { LogOut, Settings } from "lucide-react";
import type { ReactNode } from "react";

import { NAV_ITEMS } from "@/components/layout/nav-items";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { useUnreadActivity } from "@/hooks/use-unread-activity";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";

function Badge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span
      className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground"
      aria-label={`${count} unread notifications`}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}

function useActivePath() {
  return useRouterState({ select: (state) => state.location.pathname });
}

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = useActivePath();
  const unread = useUnreadActivity(Boolean(user));

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile header */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/85 px-4 backdrop-blur md:hidden">
        <Link to="/" className="wordmark text-xl text-primary">
          Fathom
        </Link>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" asChild aria-label="Settings">
            <Link to="/settings">
              <Settings className="size-5" aria-hidden />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Log out" onClick={() => void logout()}>
            <LogOut className="size-5" aria-hidden />
          </Button>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-6xl">
        {/* Desktop sidebar */}
        <aside className="sticky top-0 hidden h-screen w-[76px] shrink-0 flex-col border-r border-border px-3 py-6 lg:w-64 md:flex">
          <Link to="/" className="wordmark mb-8 px-2 text-2xl text-primary">
            <span className="hidden lg:inline">Fathom</span>
            <span className="lg:hidden">F</span>
          </Link>

          <nav aria-label="Main" className="flex flex-1 flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-4 rounded-full px-3 py-3 text-sm font-medium transition-colors",
                    active
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                  )}
                >
                  <span className="relative">
                    <item.icon className="size-6" aria-hidden />
                    {item.badge ? <Badge count={unread} /> : null}
                  </span>
                  <span className="hidden lg:inline">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1 border-t border-border pt-4">
            <Link
              to="/settings"
              className="flex items-center gap-4 rounded-full px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/60 hover:text-foreground"
            >
              <Settings className="size-6" aria-hidden />
              <span className="hidden lg:inline">Settings</span>
            </Link>
            <div className="flex items-center gap-3 rounded-full px-2 py-2">
              <UserAvatar user={user} size="sm" />
              <div className="hidden min-w-0 flex-1 lg:block">
                <p className="truncate text-sm font-medium">{user?.name}</p>
                <p className="truncate text-xs text-muted-foreground">@{user?.username}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Log out"
                className="hidden lg:inline-flex"
                onClick={() => void logout()}
              >
                <LogOut className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 pb-20 md:pb-10">{children}</main>
      </div>

      {/* Mobile tab bar */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <span className="relative">
                <item.icon className="size-6" aria-hidden />
                {item.badge ? <Badge count={unread} /> : null}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function PageHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4 md:px-8">
      <h1 className="font-display text-xl font-semibold tracking-tight">{title}</h1>
      {action}
    </div>
  );
}
