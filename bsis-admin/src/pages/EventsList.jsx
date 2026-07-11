import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, Icon, Pagination, Spinner, StatusBadge, fmtDate } from "../components/ui";

export default function EventsList() {
  const toast = useToast();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/events/admin", { params: { page, limit: 20, sort: "-startDate" } });
      setEvents(res.data.events || []);
      setPagination(res.data.pagination);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/events/${toDelete._id}`);
      setEvents((es) => es.filter((e) => e._id !== toDelete._id));
      toast("Event deleted");
      setToDelete(null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Events</h1>
          <p>Workshops, summits and meetups — upcoming and past.</p>
        </div>
        <Link to="/events/new" className="btn btn-primary"><Icon.plus /> New event</Link>
      </div>

      <div className="card">
        {loading ? (
          <Spinner />
        ) : events.length === 0 ? (
          <EmptyState
            title="No events yet"
            sub="Add your first event and publish it to show on the website."
            action={<Link to="/events/new" className="btn btn-primary"><Icon.plus /> Create event</Link>}
          />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>Event</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map((ev) => (
                  <tr key={ev._id}>
                    <td>
                      <div className="logo-cell">
                        {ev.coverImage && <img className="thumb-sm" src={ev.coverImage} alt="" />}
                        <div>
                          <Link to={`/events/${ev._id}`} className="row-title" style={{ color: "inherit" }}>
                            {ev.title} {ev.isFeatured && <span className="badge badge-accent">Featured</span>}
                          </Link>
                          <div className="row-sub mono">/{ev.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      {fmtDate(ev.startDate)}
                      {ev.time && <div className="row-sub">{ev.time}</div>}
                    </td>
                    <td>{ev.venue || "—"}{ev.city ? `, ${ev.city}` : ""}</td>
                    <td><StatusBadge status={ev.status} /></td>
                    <td>
                      <div className="row-actions">
                        <button className="btn-icon" title="Edit" onClick={() => navigate(`/events/${ev._id}`)}><Icon.edit /></button>
                        <button className="btn-icon" title="Delete" onClick={() => setToDelete(ev)}><Icon.trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPage} />
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete event"
          message={`Delete "${toDelete.title}" permanently?`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
