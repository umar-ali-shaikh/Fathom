import { Clapperboard, Compass, Heart, Home, PlusSquare, User } from "lucide-react";

/** Fathom navigation. Intentionally contains no messaging surface. */
export const NAV_ITEMS = [
  { label: "Home", to: "/", icon: Home, badge: false },
  { label: "Reels", to: "/reels", icon: Clapperboard, badge: false },
  { label: "Explore", to: "/explore", icon: Compass, badge: false },
  { label: "Activity", to: "/activity", icon: Heart, badge: true },
  { label: "Create", to: "/create", icon: PlusSquare, badge: false },
  { label: "Profile", to: "/profile", icon: User, badge: false },
] as const;

export type NavItem = (typeof NAV_ITEMS)[number];
