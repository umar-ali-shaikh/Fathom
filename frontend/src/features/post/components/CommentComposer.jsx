import { useState } from "react";

const CommentComposer = ({ placeholder = "Add a comment...", onSubmit, onCancel, autoFocus }) => {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!body.trim() || submitting) return;

    setSubmitting(true);
    try {
      await onSubmit(body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="comment-composer" onSubmit={handleSubmit}>
      <input
        type="text"
        value={body}
        onInput={(e) => setBody(e.target.value)}
        placeholder={placeholder}
        maxLength={2200}
        autoFocus={autoFocus}
      />
      <button
        type="submit"
        className="button primary-button"
        disabled={!body.trim() || submitting}
      >
        Post
      </button>
      {onCancel && (
        <button type="button" className="button ghost-button" onClick={onCancel}>
          Cancel
        </button>
      )}
    </form>
  );
};

export default CommentComposer;
