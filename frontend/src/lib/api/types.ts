export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  bio?: string | null;
  avatarUrl?: string | null;
  isPrivate?: boolean;
  provider?: "email" | "google" | string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
  /** Viewer-relative state, supplied by the backend when fetching a profile. */
  isFollowing?: boolean;
  hasRequestedFollow?: boolean;
  isSelf?: boolean;
  canViewPosts?: boolean;
}

export interface PostImage {
  id?: string;
  url: string;
  width?: number;
  height?: number;
  alt?: string | null;
}

export interface Post {
  id: string;
  caption: string | null;
  images: PostImage[];
  author: User;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
}

/** A 24-hour status shared by someone the viewer follows. */
export interface Story {
  id: string;
  author: User;
  mediaUrl: string;
  caption?: string | null;
  seen?: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface StoryGroup {
  user: User;
  stories: Story[];
  hasUnseen: boolean;
}

export interface Reel {
  id: string;
  author: User;
  videoUrl: string;
  thumbnailUrl?: string | null;
  caption: string | null;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  viewCount?: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  postId: string;
  parentId: string | null;
  author: User | null;
  body: string | null;
  deleted?: boolean;
  createdAt: string;
  replies?: Comment[];
}

export interface FollowRequest {
  id: string;
  user: User;
  createdAt: string;
}

export type ActivityType = "like" | "comment" | "follow" | "follow_request" | "mention";

export interface ActivityItem {
  id: string;
  type: ActivityType;
  actor: User;
  post?: { id: string; thumbnailUrl?: string | null } | null;
  commentPreview?: string | null;
  read: boolean;
  createdAt: string;
  /** Present for follow_request entries so they can be accepted/rejected. */
  requestId?: string;
}

export interface Paginated<T> {
  items: T[];
  nextCursor?: string | null;
}
