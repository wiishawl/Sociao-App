import { useNavigate } from "react-router-dom";

export default function Notifications() {
  const navigate = useNavigate();
  return (
    <div>
      <div className="people-head">
        <button className="icon-btn" onClick={() => navigate(-1)} aria-label="Back">←</button>
        <h2>Notifications</h2>
      </div>
      <p className="center muted">You're all caught up. New activity will show up here.</p>
    </div>
  );
}