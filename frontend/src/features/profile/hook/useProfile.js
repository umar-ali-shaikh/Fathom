import { useState, useCallback } from "react";
import { getProfile, followUser, unfollowUser } from "../services/profile.api";
import { getUserPosts } from "../../post/services/post.api";

export function useProfile() {
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [followPending, setFollowPending] = useState(false);

  const handleLoadProfile = useCallback(async (username) => {
    setLoading(true);
    setError(null);
    setProfile(null);
    setPosts(null);

    try {
      const profileData = await getProfile(username);
      setProfile(profileData.profile);

      if (!profileData.profile.isLocked) {
        const postsData = await getUserPosts(username);
        setPosts(postsData.posts);
      } else {
        setPosts([]);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFollowToggle = useCallback(async () => {
    if (!profile || followPending) return;
    setFollowPending(true);

    const wasAccepted = profile.followStatus === "accepted";
    const hadExistingRecord = profile.followStatus === "accepted" || profile.followStatus === "pending";

    try {
      if (hadExistingRecord) {
        await unfollowUser(profile.id);
        setProfile((p) => ({
          ...p,
          followStatus: null,
          followersCount: wasAccepted ? p.followersCount - 1 : p.followersCount,
        }));
      } else {
        const response = await followUser(profile.id);
        const newStatus = response.follow.status;
        setProfile((p) => ({
          ...p,
          followStatus: newStatus,
          followersCount: newStatus === "accepted" ? p.followersCount + 1 : p.followersCount,
        }));
      }
    } catch (err) {
      setError(err.response?.data?.message || "That didn't work. Please try again.");
    } finally {
      setFollowPending(false);
    }
  }, [profile, followPending]);

  return { profile, posts, loading, error, followPending, handleLoadProfile, handleFollowToggle };
}
