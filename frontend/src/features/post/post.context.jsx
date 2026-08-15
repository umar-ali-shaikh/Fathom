import { createContext, useState } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const PostContext = createContext();

export const PostContextProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [post, setPost] = useState(null);
  const [feed, setFeed] = useState(null);

  return (
    <PostContext.Provider
      value={{
        loading,
        setLoading,
        error,
        setError,
        post,
        setPost,
        feed,
        setFeed,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
