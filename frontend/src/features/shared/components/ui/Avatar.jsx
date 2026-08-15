import { useState } from "react";

const Avatar = ({ src, name = "", size = "md", ringed = false, className = "" }) => {
  const [failed, setFailed] = useState(false);
  const initials = name.trim().slice(0, 1).toUpperCase() || "?";
  const showFallback = !src || failed;

  return (
    <span className={`avatar avatar-${size} ${ringed ? "avatar-ringed" : ""} ${className}`.trim()}>
      {showFallback ? (
        <span className="avatar-fallback" aria-hidden="true">
          {initials}
        </span>
      ) : (
        <img src={src} alt="" onError={() => setFailed(true)} />
      )}
    </span>
  );
};

export default Avatar;
