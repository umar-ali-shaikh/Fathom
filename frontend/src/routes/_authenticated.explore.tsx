import { useQuery } from "@tanstack/react-query";
import { Link, createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";

import { PageHeader } from "@/components/layout/app-shell";
import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toUserMessage } from "@/lib/api/client";
import { postService } from "@/lib/api/services/posts";
import { userService } from "@/lib/api/services/users";

export const Route = createFileRoute("/_authenticated/explore")({
  head: () => ({
    meta: [
      { title: "Explore — Fathom" },
      { name: "description", content: "Discover new photographers and posts across Fathom." },
      { property: "og:title", content: "Explore — Fathom" },
      {
        property: "og:description",
        content: "Discover new photographers and posts across Fathom.",
      },
    ],
  }),
  component: ExplorePage,
});

function useDebounced(value: string, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

function ExplorePage() {
  const [term, setTerm] = useState("");
  const query = useDebounced(term.trim());

  const people = useQuery({
    queryKey: ["search", query],
    queryFn: ({ signal }) => userService.search(query, signal),
    enabled: query.length >= 2,
  });

  const grid = useQuery({
    queryKey: ["explore"],
    queryFn: () => postService.explore(),
  });

  return (
    <>
      <PageHeader title="Explore" />
      <div className="mx-auto w-full max-w-3xl p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <label htmlFor="explore-search" className="sr-only">
            Search people
          </label>
          <Input
            id="explore-search"
            type="search"
            placeholder="Search people"
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            className="rounded-full pl-9"
          />
        </div>

        {query.length >= 2 ? (
          <section aria-label="People results" className="mt-4">
            {people.isPending ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : people.data?.length ? (
              <ul className="space-y-1">
                {people.data.map((person) => (
                  <li key={person.id}>
                    <Link
                      to="/u/$username"
                      params={{ username: person.username }}
                      className="flex items-center gap-3 rounded-xl p-2 hover:bg-secondary"
                    >
                      <UserAvatar user={person} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {person.username}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {person.name}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="No people found" description={`Nothing matches "${query}".`} />
            )}
          </section>
        ) : (
          <section aria-label="Explore posts" className="mt-4">
            {grid.isPending ? (
              <div className="grid grid-cols-3 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </div>
            ) : grid.isError ? (
              <ErrorState
                description={toUserMessage(grid.error, "We couldn't load Explore.")}
                onRetry={() => void grid.refetch()}
              />
            ) : grid.data?.items.length ? (
              <ul className="grid grid-cols-3 gap-1">
                {grid.data.items.map((post) => (
                  <li key={post.id}>
                    <Link to="/post/$id" params={{ id: post.id }}>
                      <img
                        src={post.images?.[0]?.url}
                        alt={post.caption || "Explore post"}
                        loading="lazy"
                        className="aspect-square w-full rounded-md object-cover"
                      />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState title="Nothing to explore yet" description="Check back soon." />
            )}
          </section>
        )}
      </div>
    </>
  );
}
