import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Icon, Spinner, StatusBadge, fmtDateTime } from "../components/ui";

const statDefs = [
  { key: "pages", label: "Pages", icon: "pages", color: "var(--blue)", bg: "var(--blue-soft)", to: "/pages" },
  { key: "events", label: "Events", icon: "events", color: "var(--green)", bg: "var(--green-soft)", to: "/events" },
  { key: "news", label: "News posts", icon: "news", color: "var(--accent-strong)", bg: "var(--accent-soft)", to: "/news" },
  { key: "team", label: "Team members", icon: "team", color: "#6d28d9", bg: "#f1eafd", to: "/team" },
  { key: "partners", label: "Partners", icon: "partners", color: "var(--amber)", bg: "var(--amber-soft)", to: "/partners" },
  { key: "members", label: "Members", icon: "users", color: "#0e7490", bg: "#e0f4f8", to: "/members" },
  { key: "unread", label: "Unread enquiries", icon: "inbox", color: "var(--red)", bg: "var(--red-soft)", to: "/inbox" },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentPages, setRecentPages] = useState([]);
  const [recentMsgs, setRecentMsgs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const safe = (p) => p.catch(() => null);
      const [pages, events, news, team, partners, unread, msgs, members] = await Promise.all([
        safe(api.get("/api/pages")),
        safe(api.get("/api/events/admin", { params: { limit: 1 } })),
        safe(api.get("/api/news/admin", { params: { limit: 1 } })),
        safe(api.get("/api/team/admin")),
        safe(api.get("/api/partners/admin")),
        safe(api.get("/api/contact", { params: { unread: "true", limit: 1 } })),
        safe(api.get("/api/contact", { params: { limit: 5 } })),
        safe(api.get("/api/members", { params: { limit: 1 } })),
      ]);
      setStats({
        pages: pages?.data.count ?? pages?.data.pages?.length ?? 0,
        events: events?.data.pagination?.total ?? 0,
        news: news?.data.pagination?.total ?? 0,
        team: team?.data.team?.length ?? 0,
        partners: partners?.data.partners?.length ?? 0,
        unread: unread?.data.pagination?.total ?? 0,
        members: members?.data.pagination?.total ?? 0,
      });
      setRecentPages((pages?.data.pages || []).slice(0, 6));
      setRecentMsgs(msgs?.data.submissions || []);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Spinner />;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <>
      <div className="page-head">
        <div>
          <h1>{greeting}, {user?.name?.split(" ")[0]}</h1>
          <p>Here's what's happening across bsis.in right now.</p>
        </div>
        <div className="head-actions">
          <Link to="/pages/new" className="btn btn-primary"><Icon.plus /> New page</Link>
          <Link to="/news/new" className="btn btn-ghost"><Icon.plus /> New post</Link>
        </div>
      </div>

      <div className="stat-grid">
        {statDefs.map((s) => {
          const I = Icon[s.icon];
          return (
            <Link key={s.key} to={s.to} className="stat" style={{ color: "inherit" }}>
              <div className="stat-icon" style={{ background: s.bg, color: s.color }}><I /></div>
              <div className="stat-value">{stats[s.key]}</div>
              <div className="stat-label">{s.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="toolbar" style={{ justifyContent: "space-between" }}>
            <strong>Recently updated pages</strong>
            <Link to="/pages" className="btn btn-ghost btn-sm">View all</Link>
          </div>
          {recentPages.length === 0 ? (
            <p className="muted" style={{ padding: 20 }}>No pages yet — create your first page to build the site.</p>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <tbody>
                  {recentPages.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <Link to={`/pages/${p._id}`} className="row-title" style={{ color: "inherit" }}>
                          {p.title} {p.isHomepage && <span className="badge badge-accent">Home</span>}
                        </Link>
                        <div className="row-sub">/{p.slug}</div>
                      </td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(p.updatedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card">
          <div className="toolbar" style={{ justifyContent: "space-between" }}>
            <strong>Latest enquiries</strong>
            <Link to="/inbox" className="btn btn-ghost btn-sm">Open inbox</Link>
          </div>
          {recentMsgs.length === 0 ? (
            <p className="muted" style={{ padding: 20 }}>No enquiries yet. Messages from the website contact form will appear here.</p>
          ) : (
            <div className="table-wrap">
              <table className="tbl">
                <tbody>
                  {recentMsgs.map((m) => (
                    <tr key={m._id} className={!m.isRead ? "msg-row unread" : ""}>
                      <td>
                        <div className="row-title">{m.name}</div>
                        <div className="row-sub">{m.subject || m.message?.slice(0, 60)}</div>
                      </td>
                      <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(m.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
