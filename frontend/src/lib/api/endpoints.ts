/**
 * The single source of truth for backend endpoint paths.
 *
 * The backend mounts everything under singular route names (`/post`, `/user`,
 * `/comment`, `/story`, `/reel`, `/activity`, `/upload`) — keep that
 * convention here rather than pluralizing to match REST-by-default habits.
 * If your Fathom backend uses different paths, change them HERE ONLY — no
 * other file contains an endpoint string.
 */
export const ENDPOINTS = {
  auth: {
    register: "/auth/register",
    login: "/auth/login",
    logout: "/auth/logout",
    me: "/auth/get-me",
    /** Top-level browser navigation target — the backend redirects to Google. */
    googleAuthorize: "/auth/google",
  },
  posts: {
    feed: "/post/feed",
    explore: "/post/explore",
    create: "/post",
    detail: (id: string) => `/post/details/${id}`,
    update: (id: string) => `/post/${id}`,
    remove: (id: string) => `/post/${id}`,
    like: (id: string) => `/post/like/${id}`,
    comments: (id: string) => `/comment/post/${id}`,
  },
  comments: {
    detail: (id: string) => `/comment/${id}`,
  },
  stories: {
    tray: "/story",
    create: "/story",
    seen: (id: string) => `/story/${id}/seen`,
    detail: (id: string) => `/story/${id}`,
  },
  reels: {
    feed: "/reel",
    create: "/reel",
    detail: (id: string) => `/reel/${id}`,
    like: (id: string) => `/reel/like/${id}`,
    byUser: (username: string) => `/reel/user/${encodeURIComponent(username)}`,
  },
  uploads: {
    create: "/upload",
  },
  users: {
    me: "/user/me",
    detail: (username: string) => `/user/${encodeURIComponent(username)}`,
    posts: (username: string) => `/post/user/${encodeURIComponent(username)}`,
    followers: (username: string) => `/user/${encodeURIComponent(username)}/followers`,
    following: (username: string) => `/user/${encodeURIComponent(username)}/following`,
    follow: (username: string) => `/user/${encodeURIComponent(username)}/follow`,
    search: "/user/search",
  },
  follows: {
    requests: "/user/follow-requests",
    accept: (id: string) => `/user/follow-requests/${id}/accept`,
    reject: (id: string) => `/user/follow-requests/${id}/reject`,
  },
  activity: {
    list: "/activity",
    unreadCount: "/activity/unread-count",
    markRead: "/activity/read",
  },
  settings: {
    password: "/auth/password",
    privacy: "/user/me",
    notifications: "/user/me/notifications",
  },
} as const;
