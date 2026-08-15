import { getFeed } from "../services/post.api";
import { useContext, useCallback } from "react";
import { PostContext } from "../post.context";

export const usePost = () => {
    const context = useContext(PostContext);

    const { loading, setLoading, error, setError, post, feed, setFeed } = context;

    const handleGetFeed = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getFeed();
            setFeed(data.posts);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to load feed. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [setLoading, setError, setFeed]);

    return { loading, error, post, feed, handleGetFeed };
};
