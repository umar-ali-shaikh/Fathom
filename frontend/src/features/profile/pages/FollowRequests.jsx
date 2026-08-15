import { useEffect, useState } from "react";
import {
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
} from "../services/profile.api";
import FollowListItem from "../components/FollowListItem";
import "../style/profile.scss";

const FollowRequests = () => {
  const [requests, setRequests] = useState(null);
  const [error, setError] = useState(null);
  const [pendingIds, setPendingIds] = useState([]);

  useEffect(() => {
    getFollowRequests()
      .then((data) => setRequests(data.requests))
      .catch((err) => setError(err.response?.data?.message || "Failed to load requests."));
  }, []);

  async function handleAction(userId, action) {
    setPendingIds((ids) => [...ids, userId]);
    try {
      if (action === "accept") {
        await acceptFollowRequest(userId);
      } else {
        await rejectFollowRequest(userId);
      }
      setRequests((current) => current.filter((r) => r.user._id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "That didn't work. Please try again.");
    } finally {
      setPendingIds((ids) => ids.filter((id) => id !== userId));
    }
  }

  return (
    <main className="profile-page">
      <h1 className="follow-list-title">Follow Requests</h1>

      {error && <p className="profile-status profile-status-error">{error}</p>}

      {!error && !requests && <p className="profile-status">Loading...</p>}

      {!error && requests && requests.length === 0 && (
        <p className="profile-status">No pending requests.</p>
      )}

      {requests && requests.length > 0 && (
        <ul className="follow-list">
          {requests.map((r) => (
            <FollowListItem key={r.id} user={r.user}>
              <button
                type="button"
                className="button primary-button"
                disabled={pendingIds.includes(r.user._id)}
                onClick={() => handleAction(r.user._id, "accept")}
              >
                Accept
              </button>
              <button
                type="button"
                className="button ghost-button"
                disabled={pendingIds.includes(r.user._id)}
                onClick={() => handleAction(r.user._id, "reject")}
              >
                Decline
              </button>
            </FollowListItem>
          ))}
        </ul>
      )}
    </main>
  );
};

export default FollowRequests;
