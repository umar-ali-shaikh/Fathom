import { useQuery } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { storyService } from "@/lib/api/services/stories";
import { cn } from "@/lib/utils";
import { relativeTime } from "@/lib/utils/format";
import type { StoryGroup } from "@/lib/api/types";

function StoryViewer({ group, onClose }: { group: StoryGroup | null; onClose: () => void }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [group]);

  const story = group?.stories[Math.min(index, group.stories.length - 1)];

  useEffect(() => {
    if (!story) return;
    void storyService.markSeen(story.id).catch(() => undefined);
  }, [story]);

  return (
    <Dialog open={Boolean(group)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <DialogTitle className="sr-only">
          {group ? `Status from ${group.user?.username}` : "Status"}
        </DialogTitle>
        {group && story ? (
          <div className="relative bg-black">
            <div className="absolute inset-x-3 top-3 z-10 flex gap-1">
              {group.stories.map((item, i) => (
                <span
                  key={item.id}
                  className={cn(
                    "h-0.5 flex-1 rounded-full",
                    i <= index ? "bg-background" : "bg-background/30",
                  )}
                />
              ))}
            </div>
            <div className="absolute inset-x-3 top-7 z-10 flex items-center gap-2 pt-2">
              <UserAvatar user={group.user} size="xs" />
              <span className="text-xs font-medium text-background">{group.user?.username}</span>
              <span className="text-xs text-background/70">{relativeTime(story.createdAt)}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close status"
                className="ml-auto rounded-full p-1 text-background"
              >
                <X className="size-5" aria-hidden />
              </button>
            </div>

            <img
              src={story.mediaUrl}
              alt={story.caption || `Status from ${group.user?.username}`}
              className="aspect-[9/16] w-full object-contain"
            />

            <button
              type="button"
              aria-label="Previous"
              className="absolute inset-y-0 left-0 w-1/3"
              onClick={() => (index === 0 ? onClose() : setIndex((i) => i - 1))}
            />
            <button
              type="button"
              aria-label="Next"
              className="absolute inset-y-0 right-0 w-1/3"
              onClick={() =>
                index >= group.stories.length - 1 ? onClose() : setIndex((i) => i + 1)
              }
            />

            {story.caption ? (
              <p className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-sm text-background">
                {story.caption}
              </p>
            ) : null}
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

/** Horizontal rail of statuses from the people you follow. */
export function StoryRail({ onCreate }: { onCreate?: () => void }) {
  const [active, setActive] = useState<StoryGroup | null>(null);
  const tray = useQuery({ queryKey: ["stories"], queryFn: () => storyService.tray() });

  return (
    <section
      aria-label="Statuses"
      className="mb-4 border-b border-border md:mb-6 md:rounded-2xl md:border"
    >
      <ul className="flex gap-4 overflow-x-auto px-4 py-3">
        <li className="shrink-0">
          <button
            type="button"
            onClick={onCreate}
            className="flex w-16 flex-col items-center gap-1.5"
          >
            <span className="flex size-16 items-center justify-center rounded-full border-2 border-dashed border-border text-muted-foreground">
              <Plus className="size-6" aria-hidden />
            </span>
            <span className="w-16 truncate text-center text-xs text-muted-foreground">
              Your status
            </span>
          </button>
        </li>

        {tray.isPending
          ? [0, 1, 2, 3].map((i) => (
              <li key={i} className="shrink-0 space-y-1.5">
                <Skeleton className="size-16 rounded-full" />
                <Skeleton className="h-2.5 w-14" />
              </li>
            ))
          : tray.data?.map((group) => (
              <li key={group.user?.id ?? group.user?.username} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActive(group)}
                  className="flex w-16 flex-col items-center gap-1.5"
                >
                  <span
                    className={cn(
                      "rounded-full p-[2px]",
                      group.hasUnseen ? "bg-gradient-to-tr from-accent to-primary" : "bg-border",
                    )}
                  >
                    <UserAvatar
                      user={group.user}
                      size="lg"
                      className="size-16 ring-2 ring-background"
                    />
                  </span>
                  <span className="w-16 truncate text-center text-xs text-muted-foreground">
                    {group.user?.username}
                  </span>
                </button>
              </li>
            ))}
      </ul>

      <StoryViewer group={active} onClose={() => setActive(null)} />
    </section>
  );
}
