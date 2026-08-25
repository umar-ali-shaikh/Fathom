import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/app-shell";
import { ProfileView } from "@/features/profile/profile-view";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Fathom" },
      { name: "description", content: "Your Fathom profile, posts and followers." },
      { property: "og:title", content: "Your profile — Fathom" },
      { property: "og:description", content: "Your Fathom profile, posts and followers." },
    ],
  }),
  component: MyProfilePage,
});

function MyProfilePage() {
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={user?.username ?? "Profile"} />
      <div className="mx-auto w-full max-w-xl">
        {user ? <ProfileView username={user.username} isSelf /> : null}
      </div>
    </>
  );
}
