import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";
import BottomNav from "./components/BottomNav";
import Chat from "./pages/Chat";
import Home from "./pages/Home";
import Inbox from "./pages/Inbox";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import Signup from "./pages/Signup";
import VideoViewer from "./pages/VideoViewer";
import { getToken } from "./api";
import Create from "./pages/Create";
import People from "./pages/People";
import EditProfile from "./pages/EditProfile";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";

// Blocks logged-out users from any page it wraps
function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

// Wraps the main logged-in screens: auth check plus the bottom nav
function Shell() {
  if (!getToken()) return <Navigate to="/login" replace />;
  return (
    <>
      <div className="content">
        <Outlet />
      </div>
      <BottomNav />
    </>
  );
}

const Soon = ({ name }) => <p className="center muted">{name} is coming soon.</p>;

export default function App() {
  return (
    <BrowserRouter>
      <div className="phone">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/video/:id" element={<Protected><VideoViewer /></Protected>} />
          <Route path="/chat/:id" element={<Protected><Chat /></Protected>} />
          <Route path="/followers" element={<Protected><People key="followers" kind="followers" /></Protected>} />
          <Route path="/following" element={<Protected><People key="following" kind="following" /></Protected>} />
          <Route path="/edit-profile" element={<Protected><EditProfile /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
          <Route element={<Shell />}>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/videos" element={<Soon name="Video" />} />
            <Route path="/create" element={<Create />} />
            <Route path="/inbox" element={<Inbox />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}