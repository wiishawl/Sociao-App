
import { NavLink } from "react-router-dom";

function NavIcon({ name }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    video: <><path d="M4 5.5 12 2l8 3.5v13L12 22l-8-3.5z"/><path d="m10 9 5 3-5 3z"/></>,
    inbox: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M8 10h8M8 14h5"/></>,
    profile: <><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>,
    plus: <path d="M12 5v14M5 12h14"/>,
  };

  return (
    <svg width="22" height="22" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round">
      {paths[name]}
    </svg>
  );
}

export default function BottomNav() {
  return (
    <nav className="bottom-navigation">

      <NavLink to="/" end className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }>
        <NavIcon name="home" />
        <span>Home</span>
      </NavLink>

      <NavLink to="/videos" className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }>
        <NavIcon name="video" />
        <span>Video</span>
      </NavLink>

      <NavLink to="/create" className="create-nav">
        <NavIcon name="plus" />
      </NavLink>

      <NavLink to="/inbox" className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }>
        <NavIcon name="inbox" />
        <span>Inbox</span>
      </NavLink>

      <NavLink to="/profile" className={({ isActive }) =>
        `nav-item ${isActive ? "active" : ""}`
      }>
        <NavIcon name="profile" />
        <span>Profile</span>
      </NavLink>

    </nav>
  );
}
