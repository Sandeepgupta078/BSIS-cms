import { useEffect, useState } from "react";
import api, { errMsg } from "../api/client";
import { useToast } from "../context/ToastContext";
import { ConfirmDialog, EmptyState, Icon, Modal, Pagination, Spinner, fmtDateTime } from "../components/ui";

export default function Inbox() {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [pageNum, setPageNum] = useState(1);
  const [open, setOpen] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/contact", {
        params: { page: pageNum, limit: 15, unread: unreadOnly ? "true" : undefined },
      });
      setItems(res.data.submissions || []);
      setPagination(res.data.pagination || null);
    } catch (e) {
      toast(errMsg(e), "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [pageNum, unreadOnly]);

  const openMessage = async (m) => {
    setOpen(m);
    if (!m.isRead) {
      try {
        const res = await api.patch(`/api/contact/${m._id}/read`);
        setItems((xs) => xs.map((x) => (x._id === m._id ? res.data.submission : x)));
        setOpen(res.data.submission);
      } catch {
        /* non-fatal */
      }
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api.delete(`/api/contact/${toDelete._id}`);
      setItems((xs) => xs.filter((x) => x._id !== toDelete._id));
      toast("Enquiry deleted");
      setToDelete(null);
      if (open?._id === toDelete._id) setOpen(null);
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
          <h1>Enquiries</h1>
          <p>Messages sent through the website contact form.</p>
        </div>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="seg">
            <button className={!unreadOnly ? "active" : ""} onClick={() => { setUnreadOnly(false); setPageNum(1); }}>All</button>
            <button className={unreadOnly ? "active" : ""} onClick={() => { setUnreadOnly(true); setPageNum(1); }}>Unread</button>
          </div>
        </div>

        {loading ? (
          <Spinner />
        ) : items.length === 0 ? (
          <EmptyState title="No enquiries" sub={unreadOnly ? "You're all caught up — nothing unread." : "Messages from the site contact form will appear here."} />
        ) : (
          <div className="table-wrap">
            <table className="tbl">
              <thead>
                <tr>
                  <th>From</th>
                  <th>Subject</th>
                  <th>Received</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m._id} className={`msg-row ${m.isRead ? "" : "unread"}`} style={{ cursor: "pointer" }} onClick={() => openMessage(m)}>
                    <td>
                      <div className="row-title">{m.name}</div>
                      <div className="row-sub">{m.email}</div>
                    </td>
                    <td>
                      <div className="row-title" style={{ fontWeight: m.isRead ? 500 : 700 }}>{m.subject || "(no subject)"}</div>
                      <div className="row-sub">{(m.message || "").slice(0, 80)}{(m.message || "").length > 80 ? "…" : ""}</div>
                    </td>
                    <td className="muted" style={{ whiteSpace: "nowrap" }}>{fmtDateTime(m.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <div className="row-actions">
                        <button className="btn-icon" title="Open" onClick={() => openMessage(m)}><Icon.eye /></button>
                        <button className="btn-icon" title="Delete" onClick={() => setToDelete(m)}><Icon.trash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination pagination={pagination} onPage={setPageNum} />
      </div>

      {open && (
        <Modal title={open.subject || "Enquiry"} onClose={() => setOpen(null)}>
          <div className="msg-detail-meta">
            <span><strong>{open.name}</strong></span>
            <span><a href={`mailto:${open.email}`}>{open.email}</a></span>
            {open.phone && <span>{open.phone}</span>}
            <span>{fmtDateTime(open.createdAt)}</span>
          </div>
          <div className="msg-body">{open.message}</div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
            <a className="btn btn-ghost" href={`mailto:${open.email}?subject=Re: ${encodeURIComponent(open.subject || "Your enquiry")}`}>
              Reply by email
            </a>
            <button className="btn btn-danger" onClick={() => setToDelete(open)}><Icon.trash /> Delete</button>
          </div>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog
          title="Delete this enquiry?"
          message={`The message from ${toDelete.name} will be permanently removed.`}
          onConfirm={remove}
          onClose={() => setToDelete(null)}
          busy={busy}
        />
      )}
    </>
  );
}
