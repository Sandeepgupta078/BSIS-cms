import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api/client";
import { Icon } from "./ui";

const titles = {
  "/": "Dashboard",
  "/pages": "Pages",
  "/media": "Media library",
  "/events": "Events",
  "/news": "News & updates",
  "/team": "Team",
  "/partners": "Partners",
  "/inbox": "Enquiries",
  "/members": "Members",
  "/users": "Users",
  "/account": "My account",
};

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);

  // Unread enquiries badge
  useEffect(() => {
    api
      .get("/api/contact", { params: { unread: "true", limit: 1 } })
      .then((res) => setUnread(res.data.pagination?.total || 0))
      .catch(() => {});
  }, [location.pathname]);

  const title =
    titles[location.pathname] ||
    (location.pathname.startsWith("/pages")
      ? "Page editor"
      : location.pathname.startsWith("/events")
        ? "Events"
        : location.pathname.startsWith("/news")
          ? "News & updates"
          : "BSIS CMS");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = (user?.name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">BS</div>
          <div>
            <div className="brand-name">BSIS CMS</div>
            <div className="brand-sub">Admin panel</div>
          </div>
        </div>

        <nav className="nav-group">
          <div className="nav-label">Overview</div>
          <NavLink
            to="/"
            end
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.dashboard /> <span>Dashboard</span>
          </NavLink>
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Manage</div>
          <NavLink
            to="/members"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.team /> <span>Members</span>
          </NavLink>
          <NavLink
            to="/account"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.key /> <span>My account</span>
          </NavLink>
          {user?.role === "admin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon.users /> <span>Users</span>
            </NavLink>
          )}
          <NavLink
            to="/inbox"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.inbox /> <span>Enquiries</span>
            {unread > 0 && <span className="nav-badge">{unread}</span>}
          </NavLink>
        </nav>

        <nav className="nav-group">
          <div className="nav-label">Content</div>
          <NavLink
            to="/pages"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.pages /> <span>Pages</span>
          </NavLink>
          <NavLink
            to="/media"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.media /> <span>Media</span>
          </NavLink>
          <NavLink
            to="/events"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.events /> <span>Events</span>
          </NavLink>
          <NavLink
            to="/news"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.news /> <span>News</span>
          </NavLink>
          <NavLink
            to="/team"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.team /> <span>Team</span>
          </NavLink>
          <NavLink
            to="/partners"
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
          >
            <Icon.partners /> <span>Partners</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="avatar">{initials}</div>
            <div>
              <div className="sidebar-user-name">{user?.name}</div>
              <div className="sidebar-user-role">{user?.role}</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div className="topbar-title">{title}</div>
          <div className="topbar-actions">
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              <Icon.logout /> Sign out
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
