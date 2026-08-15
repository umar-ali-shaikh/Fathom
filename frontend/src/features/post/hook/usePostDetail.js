import { useCallback, useState } from "react";
import { getPostDetail } from "../services/post.api";

export function usePostDetail() {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLoad = useCallback(async (postId) => {
    setLoading(true);
    setError(null);
    setPost(null);

    try {
      const data = await getPostDetail(postId);
      setPost(data.post);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load this post.");
    } finally {
      setLoading(false);
    }
  }, []);

  return { post, loading, error, handleLoad };
}
