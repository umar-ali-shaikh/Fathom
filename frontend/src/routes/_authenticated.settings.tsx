import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/layout/app-shell";
import { UserAvatar } from "@/components/shared/user-avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toUserMessage } from "@/lib/api/client";
import { uploadService } from "@/lib/api/services/posts";
import { userService } from "@/lib/api/services/users";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Fathom" },
      { name: "description", content: "Update your Fathom profile details and sign out." },
      { property: "og:title", content: "Settings — Fathom" },
      { property: "og:description", content: "Update your Fathom profile details and sign out." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user?.name ?? "",
    username: user?.username ?? "",
    bio: user?.bio ?? "",
  });
  const [pending, setPending] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const updated = await userService.updateMe({
        name: form.name.trim(),
        username: form.username.trim(),
        bio: form.bio,
      });
      setUser(updated);
      toast.success("Profile updated");
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't save your profile."));
    } finally {
      setPending(false);
    }
  }

  async function changeAvatar(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const avatarUrl = await uploadService.upload(file);
      const updated = await userService.updateMe({ avatarUrl });
      setUser(updated);
      toast.success("Photo updated");
    } catch (error) {
      toast.error(toUserMessage(error, "We couldn't update your photo."));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <PageHeader title="Settings" />
      <form className="mx-auto w-full max-w-xl space-y-6 p-4" onSubmit={save}>
        <div className="flex items-center gap-4">
          <UserAvatar user={user} size="lg" />
          <div>
            <Label
              htmlFor="avatar"
              className="cursor-pointer text-sm font-medium underline underline-offset-4"
            >
              {uploading ? "Uploading…" : "Change photo"}
            </Label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(event) => void changeAvatar(event.target.files?.[0])}
            />
            <p className="text-xs text-muted-foreground">JPG or PNG, up to 8MB.</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={form.name}
            onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            value={form.username}
            onChange={(e) => setForm((p) => ({ ...p, username: e.target.value.toLowerCase() }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            rows={3}
            maxLength={160}
            value={form.bio ?? ""}
            onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
          />
        </div>

        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : "Save changes"}
        </Button>

        <div className="border-t border-border pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={async () => {
              await logout();
              await navigate({ to: "/login", search: {}, replace: true });
            }}
          >
            Sign out
          </Button>
        </div>
      </form>
    </>
  );
}
