import { useCallback, useState } from "react";
import { getComments, createComment, deleteComment } from "../services/comment.api";

export function useComments(postId) {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(null);
  const [repliesByParent, setRepliesByParent] = useState({});

  const handleLoad = useCallback(async () => {
    setComments(null);
    setError(null);

    try {
      const data = await getComments(postId);
      setComments(data.comments);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load comments.");
    }
  }, [postId]);

  const handleLoadReplies = useCallback(
    async (parentId) => {
      try {
        const data = await getComments(postId, parentId);
        setRepliesByParent((prev) => ({ ...prev, [parentId]: data.comments }));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load replies.");
      }
    },
    [postId]
  );

  const handleAddComment = useCallback(
    async (body, parent) => {
      const data = await createComment(postId, body, parent);

      if (parent) {
        setRepliesByParent((prev) => ({
          ...prev,
          [parent]: [...(prev[parent] || []), data.comment],
        }));
        setComments((prev) =>
          prev.map((c) => (c._id === parent ? { ...c, repliesCount: c.repliesCount + 1 } : c))
        );
      } else {
        setComments((prev) => [...(prev || []), data.comment]);
      }
    },
    [postId]
  );

  const handleDeleteComment = useCallback(async (commentId, parent) => {
    await deleteComment(commentId);

    if (parent) {
      setRepliesByParent((prev) => ({
        ...prev,
        [parent]: (prev[parent] || []).filter((c) => c._id !== commentId),
      }));
      setComments((prev) =>
        prev.map((c) =>
          c._id === parent ? { ...c, repliesCount: Math.max(0, c.repliesCount - 1) } : c
        )
      );
    } else {
      setComments((prev) =>
        prev.map((c) => (c._id === commentId ? { ...c, isDeleted: true, body: "" } : c))
      );
    }
  }, []);

  return {
    comments,
    repliesByParent,
    error,
    handleLoad,
    handleLoadReplies,
    handleAddComment,
    handleDeleteComment,
  };
}
