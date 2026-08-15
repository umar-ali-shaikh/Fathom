import { useCallback, useState } from "react";
import { getFollowers, getFollowing } from "../services/profile.api";

export function useFollowList(type) {
  const [users, setUsers] = useState(null);
  const [error, setError] = useState(null);

  const handleLoad = useCallback(
    async (username) => {
      setUsers(null);
      setError(null);

      try {
        const data =
          type === "followers" ? await getFollowers(username) : await getFollowing(username);
        setUsers(type === "followers" ? data.followers : data.following);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load this list.");
      }
    },
    [type]
  );

  return { users, error, handleLoad };
}
