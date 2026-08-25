import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { EmptyState, ErrorState } from "@/components/shared/empty-state";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { toUserMessage } from "@/lib/api/client";
import { uploadService } from "@/lib/api/services/posts";
import { reelService } from "@/lib/api/services/reels";
import { userService } from "@/lib/api/services/users";
import { LIMITS } from "@/lib/constants/config";
import { cn } from "@/lib/utils";
import { compactNumber } from "@/lib/utils/format";
import { useAuth } from "@/providers/auth-provider";
import type { User } from "@/lib/api/types";

function StatButton({
  label,
  value,
  onClick,
}: {
  label: string;
  value: number | undefined;
  onClick?: () => void;
}) {
  const content = (
    <>
      <span className="block text-base font-semibold text-foreground">{compactNumber(value)}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </>
  );
  if (!onClick) return <div className="text-center">{content}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg px-3 py-1 text-center hover:bg-secondary"
    >
      {content}
    </button>
  );
}

function ConnectionsDialog({
  username,
  mode,
  onOpenChange,
}: {
  username: string;
  mode: "followers" | "following" | null;
  onOpenChange: (open: boolean) => void;
}) {
  const query = useQuery({
    queryKey: ["user", username, mode],
    queryFn: () =>
      mode === "followers" ? userService.followers(username) : userService.following(username),
    enabled: Boolean(mode),
  });

  return (
    <Dialog open={Boolean(mode)} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[70vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="capitalize">{mode ?? ""}</DialogTitle>
        </DialogHeader>
        {query.isPending ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : query.data?.length ? (
          <ul className="space-y-1">
            {query.data.map((person) => (
              <li key={person.id}>
                <Link
                  to="/u/$username"
                  params={{ username: person.username }}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 rounded-lg p-2 hover:bg-secondary"
                >
                  <UserAvatar user={person} size="sm" />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{person.username}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {person.name}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title="Nobody here yet" />
        )}
      </DialogContent>
    </Dialog>
  );
}

function EditProfileDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const queryClient = useQueryClient();
  const { setUser } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [name, setName] = useState(user.name ?? "");
  const [handle, setHandle] = useState(user.username);
  const [bio, setBio] = useState(user.bio ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [pending, setPending] = useState(false);

  async function pickAvatar(file: File | undefined) {
    if (!file) return;
    try {
      setPending(true);
      setAvatarUrl(await uploadService.upload(file));
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't upload that image."));
    } finally {
      setPending(false);
    }
  }

  async function save() {
    setPending(true);
    try {
      const updated = await userService.updateMe({
        name: name.trim(),
        username: handle.trim(),
        bio: bio.trim(),
        avatarUrl,
      });
      if (updated) setUser(updated);
      toast.success("Profile updated");
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: ["user"] });
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't save your profile."));
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
        </DialogHeader>

        <div className="flex items-center gap-4">
          <UserAvatar user={{ ...user, avatarUrl }} size="lg" />
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              void pickAvatar(event.target.files?.[0]);
              event.target.value = "";
            }}
          />
          <Button type="button" variant="secondary" onClick={() => fileRef.current?.click()}>
            Change photo
          </Button>
        </div>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">Name</Label>
            <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-username">Username</Label>
            <Input
              id="profile-username"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-bio">Bio</Label>
            <Textarea
              id="profile-bio"
              rows={3}
              maxLength={LIMITS.bioMax}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
            <p className="text-right text-xs text-muted-foreground">
              {bio.length}/{LIMITS.bioMax}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={pending || !handle.trim()} onClick={() => void save()}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileView({ username, isSelf }: { username: string; isSelf: boolean }) {
  const queryClient = useQueryClient();
  const [connections, setConnections] = useState<"followers" | "following" | null>(null);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<"posts" | "reels">("posts");

  const reels = useQuery({
    queryKey: ["user", username, "reels"],
    queryFn: () => reelService.byUser(username),
    enabled: tab === "reels",
  });

  const profile = useQuery({
    queryKey: ["user", username],
    queryFn: () => userService.profile(username),
  });

  const posts = useQuery({
    queryKey: ["user", username, "posts"],
    queryFn: () => userService.posts(username),
    enabled: Boolean(profile.data),
  });

  const follow = useMutation({
    mutationFn: async (user: User) =>
      user.isFollowing || user.hasRequestedFollow
        ? userService.unfollow(user.username)
        : userService.follow(user.username),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["user", username] });
    },
    onError: (error) => toast.error(toUserMessage(error, "Couldn't update the follow.")),
  });

  if (profile.isPending) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center gap-5">
          <Skeleton className="size-20 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  if (profile.isError || !profile.data) {
    return (
      <ErrorState
        description={toUserMessage(profile.error, "We couldn't load this profile.")}
        onRetry={() => void profile.refetch()}
      />
    );
  }

  const user = profile.data;
  const locked = user.isPrivate && !user.isSelf && !user.isFollowing && user.canViewPosts === false;

  return (
    <div className="pb-6">
      <header className="flex flex-col gap-4 p-4">
        <div className="flex items-center gap-5">
          <UserAvatar user={user} size="lg" />
          <div className="flex flex-1 justify-around">
            <StatButton label="Posts" value={user.stats?.posts} />
            <StatButton
              label="Followers"
              value={user.stats?.followers}
              onClick={() => setConnections("followers")}
            />
            <StatButton
              label="Following"
              value={user.stats?.following}
              onClick={() => setConnections("following")}
            />
          </div>
        </div>

        <div>
          <h1 className="text-base font-semibold">{user.name || user.username}</h1>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          {user.bio ? <p className="mt-2 text-sm leading-relaxed">{user.bio}</p> : null}
        </div>

        {isSelf ? (
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={() => setEditing(true)}>
              Edit profile
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link to="/settings">Settings</Link>
            </Button>
          </div>
        ) : (
          <Button
            className="w-full"
            variant={user.isFollowing || user.hasRequestedFollow ? "secondary" : "default"}
            disabled={follow.isPending}
            onClick={() => follow.mutate(user)}
          >
            {user.isFollowing ? "Following" : user.hasRequestedFollow ? "Requested" : "Follow"}
          </Button>
        )}
      </header>

      {locked ? null : (
        <div role="tablist" aria-label="Profile content" className="flex border-y border-border">
          {(["posts", "reels"] as const).map((id) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium capitalize transition-colors",
                tab === id ? "border-b-2 border-foreground" : "text-muted-foreground",
              )}
            >
              {id}
            </button>
          ))}
        </div>
      )}

      {locked ? (
        <EmptyState
          icon={Lock}
          title="This account is private"
          description="Follow this account to see their posts."
        />
      ) : tab === "reels" ? (
        reels.isPending ? (
          <div className="grid grid-cols-3 gap-1 px-1 pt-1">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="aspect-[9/16] rounded-none" />
            ))}
          </div>
        ) : reels.data?.length ? (
          <ul className="grid grid-cols-3 gap-1 px-1 pt-1">
            {reels.data.map((reel) => (
              <li key={reel.id}>
                <Link to="/reels" className="block">
                  {reel.thumbnailUrl ? (
                    <img
                      src={reel.thumbnailUrl}
                      alt={reel.caption || "Reel thumbnail"}
                      loading="lazy"
                      className="aspect-[9/16] w-full object-cover"
                    />
                  ) : (
                    <video
                      src={reel.videoUrl}
                      muted
                      className="aspect-[9/16] w-full object-cover"
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            title="No reels yet"
            description={isSelf ? "Share your first reel." : undefined}
          />
        )
      ) : posts.isPending ? (
        <div className="grid grid-cols-3 gap-1 px-1">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="aspect-square rounded-none" />
          ))}
        </div>
      ) : posts.data?.items.length ? (
        <ul className="grid grid-cols-3 gap-1 px-1">
          {posts.data.items.map((post) => (
            <li key={post.id}>
              <Link to="/post/$id" params={{ id: post.id }} className="block">
                <img
                  src={post.images?.[0]?.url}
                  alt={post.caption || "Post thumbnail"}
                  loading="lazy"
                  className="aspect-square w-full object-cover"
                />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          title="No posts yet"
          description={isSelf ? "Share your first photo." : undefined}
        />
      )}

      {isSelf ? <EditProfileDialog user={user} open={editing} onOpenChange={setEditing} /> : null}

      <ConnectionsDialog
        username={username}
        mode={connections}
        onOpenChange={(open) => !open && setConnections(null)}
      />
    </div>
  );
}
