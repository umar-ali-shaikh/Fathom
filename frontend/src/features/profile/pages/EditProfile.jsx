import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/hooks/useAuth";
import { getProfile, updateProfile } from "../services/profile.api";
import "../../auth/style/form.scss";
import "../style/profile.scss";

const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  const [initializing, setInitializing] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    if (!user?.username) return undefined;

    getProfile(user.username)
      .then(({ profile }) => {
        if (cancelled) return;
        setFullName(profile.fullName || "");
        setBio(profile.bio || "");
        setProfileImage(profile.profileImage || "");
        setIsPrivate(!!profile.isPrivate);
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load your profile.");
      })
      .finally(() => {
        if (!cancelled) setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user?.username]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await updateProfile({ fullName, bio, profileImage, isPrivate });
      await refreshUser();
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (initializing) {
    return (
      <main className="profile-page">
        <p className="profile-status">Loading...</p>
      </main>
    );
  }

  return (
    <main>
      <div className="form-container edit-profile-form">
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <label className="field-label" htmlFor="fullName">
            Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onInput={(e) => setFullName(e.target.value)}
            placeholder="Full name"
          />

          <label className="field-label" htmlFor="profileImage">
            Profile photo URL
          </label>
          <input
            id="profileImage"
            type="text"
            value={profileImage}
            onInput={(e) => setProfileImage(e.target.value)}
            placeholder="https://..."
          />

          <label className="field-label" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onInput={(e) => setBio(e.target.value)}
            placeholder="Tell people about yourself"
            maxLength={150}
            rows={3}
          />

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Private account
          </label>

          {error && <p className="form-error">{error}</p>}

          <div className="edit-profile-actions">
            <button
              type="button"
              className="button secondary-button"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>
            <button type="submit" className="button primary-button" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};

export default EditProfile;
