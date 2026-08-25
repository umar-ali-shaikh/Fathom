import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/api/types";

const SIZES = {
  xs: "size-7 text-[10px]",
  sm: "size-9 text-xs",
  md: "size-11 text-sm",
  lg: "size-16 text-lg",
  xl: "size-24 text-2xl",
} as const;

export function UserAvatar({
  user,
  size = "md",
  className,
}: {
  user: Pick<User, "name" | "username" | "avatarUrl"> | null | undefined;
  size?: keyof typeof SIZES | undefined;
  className?: string | undefined;
}) {
  const label = user?.name || user?.username || "User";
  const initials = label
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Avatar className={cn(SIZES[size], "ring-1 ring-border", className)}>
      {user?.avatarUrl ? (
        <AvatarImage src={user.avatarUrl} alt={`${label}'s profile photo`} loading="lazy" />
      ) : null}
      <AvatarFallback className="bg-secondary font-display font-semibold text-secondary-foreground">
        {initials || "F"}
      </AvatarFallback>
    </Avatar>
  );
}
