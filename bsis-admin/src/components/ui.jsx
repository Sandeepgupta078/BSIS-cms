import { useEffect } from "react";

/* ---------- Inline icon set (stroke style, 24px viewBox) ---------- */
const paths = {
  dashboard: "M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z",
};

const S = ({ d, ...rest }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

export const Icon = {
  dashboard: (p) => <S {...p} d={<><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>} />,
  pages: (p) => <S {...p} d={<><path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><path d="M14 3v6h6" /><path d="M8 13h8M8 17h5" /></>} />,
  media: (p) => <S {...p} d={<><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-9 9" /></>} />,
  events: (p) => <S {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M8 3v4M16 3v4M3 10h18" /></>} />,
  news: (p) => <S {...p} d={<><path d="M4 5h13a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5z" /><path d="M19 8h1.5A1.5 1.5 0 0 1 22 9.5V18a2 2 0 0 1-2 2" /><path d="M8 9h6M8 13h6M8 17h4" /></>} />,
  team: (p) => <S {...p} d={<><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20c.7-3.4 3.2-5.3 6.2-5.3s5.5 1.9 6.2 5.3" /><circle cx="17" cy="9" r="2.6" /><path d="M15.5 14.6c2.9.1 5 1.8 5.7 4.9" /></>} />,
  partners: (p) => <S {...p} d={<><path d="M8 12l3 3a2.1 2.1 0 0 0 3-3l-4.5-4.5a3 3 0 0 0-4.2 0L3 9.8" /><path d="M12 15.5l1.5 1.5a2.1 2.1 0 0 0 3-3" /><path d="M16 12.5l2.5-2.5L21 7.6" /><path d="M12.5 7.5L15 5l3 3" /></>} />,
  inbox: (p) => <S {...p} d={<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5 5h14a1 1 0 0 1 1 1l2 6v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6l2-6a1 1 0 0 1 1-1z" /></>} />,
  settings: (p) => <S {...p} d={<><circle cx="12" cy="12" r="3.2" /><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.56-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.56V3a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1 1.51 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.26.6.85 1 1.51 1H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1z" /></>} />,
  users: (p) => <S {...p} d={<><circle cx="12" cy="7.5" r="3.5" /><path d="M4.5 20.5c.8-3.9 3.7-6 7.5-6s6.7 2.1 7.5 6" /></>} />,
  plus: (p) => <S {...p} d={<path d="M12 5v14M5 12h14" />} />,
  edit: (p) => <S {...p} d={<><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" /></>} />,
  trash: (p) => <S {...p} d={<><path d="M3 6h18" /><path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /></>} />,
  copy: (p) => <S {...p} d={<><rect x="9" y="9" width="12" height="12" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>} />,
  eye: (p) => <S {...p} d={<><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" /><circle cx="12" cy="12" r="3" /></>} />,
  eyeOff: (p) => <S {...p} d={<><path d="M17.94 17.94A10.5 10.5 0 0 1 12 19c-6.5 0-10-7-10-7a19 19 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.5 9.5 0 0 1 12 4c6.5 0 10 7 10 7a19 19 0 0 1-3.22 4.31" /><path d="M1 1l22 22" /></>} />,
  up: (p) => <S {...p} d={<path d="M18 15l-6-6-6 6" />} />,
  down: (p) => <S {...p} d={<path d="M6 9l6 6 6-6" />} />,
  x: (p) => <S {...p} d={<path d="M18 6L6 18M6 6l12 12" />} />,
  search: (p) => <S {...p} d={<><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>} />,
  upload: (p) => <S {...p} d={<><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M17 8l-5-5-5 5" /><path d="M12 3v12" /></>} />,
  link: (p) => <S {...p} d={<><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>} />,
  logout: (p) => <S {...p} d={<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></>} />,
  globe: (p) => <S {...p} d={<><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18z" /></>} />,
  check: (p) => <S {...p} d={<path d="M20 6L9 17l-5-5" />} />,
  home: (p) => <S {...p} d={<><path d="M3 10.5L12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>} />,
  key: (p) => <S {...p} d={<><circle cx="8" cy="15" r="4.5" /><path d="M11.2 11.8L21 2M16 7l3 3" /></>} />,
};

/* ---------- Modal ---------- */
export function Modal({ title, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? "wide" : ""}`} role="dialog" aria-modal="true">
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="btn-icon" onClick={onClose} aria-label="Close">
            <Icon.x />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({ title = "Are you sure?", message, confirmText = "Delete", onConfirm, onClose, busy }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={busy}>
            {busy ? "Working…" : confirmText}
          </button>
        </>
      }
    >
      <p style={{ margin: 0 }}>{message}</p>
    </Modal>
  );
}

/* ---------- Small bits ---------- */
export function StatusBadge({ status }) {
  return (
    <span className={`badge ${status === "published" ? "badge-green" : "badge-amber"}`}>
      {status}
    </span>
  );
}

export function EmptyState({ title, sub, action }) {
  return (
    <div className="empty">
      <Icon.pages />
      <h3>{title}</h3>
      <p style={{ margin: "0 0 14px" }}>{sub}</p>
      {action}
    </div>
  );
}

export const Spinner = () => <div className="spinner" role="status" aria-label="Loading" />;

export function Pagination({ pagination, onPage }) {
  if (!pagination || pagination.totalPages <= 1) return null;
  const { page, totalPages, total } = pagination;
  return (
    <div className="pagination">
      <span>{total} total · page {page} of {totalPages}</span>
      <div className="pages">
        <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</button>
        <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => onPage(page + 1)}>Next</button>
      </div>
    </div>
  );
}

export const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtDateTime = (d) =>
  d ? new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const fmtBytes = (b) => {
  if (!b) return "";
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
};
