import { createFileRoute } from "@tanstack/react-router";

import { PageHeader } from "@/components/layout/app-shell";
import { ProfileView } from "@/features/profile/profile-view";
import { useAuth } from "@/providers/auth-provider";

export const Route = createFileRoute("/_authenticated/u/$username")({
  head: ({ params }) => ({
    meta: [
      { title: `@${params.username} — Fathom` },
      { name: "description", content: `Photos and posts shared by @${params.username} on Fathom.` },
      { property: "og:title", content: `@${params.username} — Fathom` },
      {
        property: "og:description",
        content: `Photos and posts shared by @${params.username} on Fathom.`,
      },
    ],
  }),
  component: UserProfilePage,
});

function UserProfilePage() {
  const { username } = Route.useParams();
  const { user } = useAuth();
  return (
    <>
      <PageHeader title={`@${username}`} />
      <div className="mx-auto w-full max-w-xl">
        <ProfileView username={username} isSelf={user?.username === username} />
      </div>
    </>
  );
}
