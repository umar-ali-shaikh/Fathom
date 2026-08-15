import { useState } from "react";
import { likePost, unlikePost } from "../services/post.api";

export function useLikeToggle(post) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount ?? 0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleToggleLike() {
    if (isSubmitting) return;

    const previousIsLiked = isLiked;
    const previousLikesCount = likesCount;

    setIsSubmitting(true);
    setIsLiked(!previousIsLiked);
    setLikesCount(previousLikesCount + (previousIsLiked ? -1 : 1));

    try {
      const response = previousIsLiked
        ? await unlikePost(post._id)
        : await likePost(post._id);

      setIsLiked(response.isLiked);
      setLikesCount(response.likes);
    } catch (err) {
      setIsLiked(previousIsLiked);
      setLikesCount(previousLikesCount);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { isLiked, likesCount, isSubmitting, handleToggleLike };
}
