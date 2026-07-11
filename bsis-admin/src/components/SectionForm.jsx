import { ImageField } from "./MediaPicker";
import { Icon } from "./ui";

/* ------------------------------------------------------------------
   Section types the CMS knows how to edit with a friendly form.
   Any unknown type falls back to a raw JSON editor, so the builder
   never blocks a page created elsewhere.
------------------------------------------------------------------- */
export const SECTION_TYPES = [
  { type: "hero", name: "Hero", desc: "Big heading, image & button", data: { heading: "", subheading: "", image: "", buttonText: "", buttonLink: "" } },
  { type: "textBlock", name: "Text block", desc: "Rich text / HTML content", data: { title: "", html: "" } },
  { type: "stats", name: "Stats", desc: "Numbers that matter", data: { title: "", items: [{ value: "", label: "" }] } },
  { type: "cardList", name: "Card list", desc: "Cards with image & link", data: { title: "", items: [{ title: "", text: "", image: "", link: "" }] } },
  { type: "cta", name: "Call to action", desc: "Banner with a button", data: { heading: "", text: "", buttonText: "", buttonLink: "" } },
  { type: "faq", name: "FAQ", desc: "Questions & answers", data: { title: "", items: [{ question: "", answer: "" }] } },
  { type: "gallery", name: "Gallery", desc: "A grid of images", data: { title: "", images: [""] } },
  { type: "testimonials", name: "Testimonials", desc: "Quotes from people", data: { title: "", items: [{ quote: "", name: "", role: "", photo: "" }] } },
  { type: "video", name: "Video", desc: "Embedded video", data: { title: "", url: "" } },
  { type: "contactInfo", name: "Contact info", desc: "Address, phone, email", data: { title: "", email: "", phone: "", address: "", mapEmbedUrl: "" } },
  { type: "customHtml", name: "Custom HTML", desc: "Anything else", data: { html: "" } },
];

export const typeMeta = (type) => SECTION_TYPES.find((t) => t.type === type);

/* One-line summary shown in the collapsed section header */
export const sectionSummary = (section) => {
  const d = section.data || {};
  return (
    d.heading || d.title || d.question ||
    (d.html ? d.html.replace(/<[^>]+>/g, "").slice(0, 70) : "") ||
    (Array.isArray(d.items) ? `${d.items.length} item(s)` : "") ||
    (Array.isArray(d.images) ? `${d.images.length} image(s)` : "") ||
    ""
  );
};

/* ---------- Small helpers ---------- */
const Text = ({ label, value, onChange, placeholder }) => (
  <div className="field">
    <label>{label}</label>
    <input className="input" value={value || ""} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
  </div>
);

const Area = ({ label, value, onChange, code, rows, hint }) => (
  <div className="field">
    <label>{label}</label>
    <textarea className={`textarea ${code ? "code" : ""}`} rows={rows || 5} value={value || ""} onChange={(e) => onChange(e.target.value)} />
    {hint && <div className="hint">{hint}</div>}
  </div>
);

/* Editor for arrays of objects (stats items, FAQ items, cards…) */
function ItemList({ items = [], onChange, template, render, addLabel }) {
  const update = (i, patch) => onChange(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, { ...template }]);

  return (
    <div>
      {items.map((item, i) => (
        <div className="item-row" key={i}>
          <button type="button" className="btn-icon remove-item" title="Remove" onClick={() => remove(i)}><Icon.x /></button>
          {render(item, (patch) => update(i, patch))}
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={add}><Icon.plus /> {addLabel || "Add item"}</button>
    </div>
  );
}

/* ------------------------------------------------------------------
   The per-type form. `data` in, `onChange(newData)` out.
------------------------------------------------------------------- */
export function SectionForm({ type, data = {}, onChange }) {
  const set = (key) => (val) => onChange({ ...data, [key]: val });

  switch (type) {
    case "hero":
      return (
        <>
          <Text label="Heading" value={data.heading} onChange={set("heading")} placeholder="Empowering India's Startup Ecosystem" />
          <Area label="Subheading" rows={2} value={data.subheading} onChange={set("subheading")} />
          <ImageField label="Background / hero image" value={data.image} onChange={set("image")} />
          <div className="form-grid">
            <Text label="Button text" value={data.buttonText} onChange={set("buttonText")} placeholder="Join us" />
            <Text label="Button link" value={data.buttonLink} onChange={set("buttonLink")} placeholder="/membership" />
          </div>
        </>
      );

    case "textBlock":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <Area label="Content (HTML allowed)" code rows={8} value={data.html} onChange={set("html")} hint="You can paste HTML — e.g. <p>, <h2>, <ul>, <img> tags." />
        </>
      );

    case "stats":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <label style={{ display: "block", fontWeight: 600, fontSize: 12.5, margin: "4px 0 8px", color: "var(--ink-2)" }}>Stats</label>
          <ItemList
            items={data.items}
            onChange={set("items")}
            template={{ value: "", label: "" }}
            addLabel="Add stat"
            render={(item, update) => (
              <div className="form-grid">
                <Text label="Value" value={item.value} onChange={(v) => update({ value: v })} placeholder="500+" />
                <Text label="Label" value={item.label} onChange={(v) => update({ label: v })} placeholder="Startups supported" />
              </div>
            )}
          />
        </>
      );

    case "cardList":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <ItemList
            items={data.items}
            onChange={set("items")}
            template={{ title: "", text: "", image: "", link: "" }}
            addLabel="Add card"
            render={(item, update) => (
              <>
                <div className="form-grid">
                  <Text label="Card title" value={item.title} onChange={(v) => update({ title: v })} />
                  <Text label="Link (optional)" value={item.link} onChange={(v) => update({ link: v })} placeholder="/programs/incubation" />
                </div>
                <Area label="Text" rows={2} value={item.text} onChange={(v) => update({ text: v })} />
                <ImageField label="Image (optional)" value={item.image} onChange={(v) => update({ image: v })} />
              </>
            )}
          />
        </>
      );

    case "cta":
      return (
        <>
          <Text label="Heading" value={data.heading} onChange={set("heading")} placeholder="Ready to build with us?" />
          <Area label="Text" rows={2} value={data.text} onChange={set("text")} />
          <div className="form-grid">
            <Text label="Button text" value={data.buttonText} onChange={set("buttonText")} />
            <Text label="Button link" value={data.buttonLink} onChange={set("buttonLink")} />
          </div>
        </>
      );

    case "faq":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} placeholder="Frequently asked questions" />
          <ItemList
            items={data.items}
            onChange={set("items")}
            template={{ question: "", answer: "" }}
            addLabel="Add question"
            render={(item, update) => (
              <>
                <Text label="Question" value={item.question} onChange={(v) => update({ question: v })} />
                <Area label="Answer" rows={3} value={item.answer} onChange={(v) => update({ answer: v })} />
              </>
            )}
          />
        </>
      );

    case "gallery":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <ItemList
            items={(data.images || []).map((url) => ({ url }))}
            onChange={(items) => set("images")(items.map((i) => i.url))}
            template={{ url: "" }}
            addLabel="Add image"
            render={(item, update) => (
              <ImageField label="Image" value={item.url} onChange={(v) => update({ url: v })} />
            )}
          />
        </>
      );

    case "testimonials":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <ItemList
            items={data.items}
            onChange={set("items")}
            template={{ quote: "", name: "", role: "", photo: "" }}
            addLabel="Add testimonial"
            render={(item, update) => (
              <>
                <Area label="Quote" rows={3} value={item.quote} onChange={(v) => update({ quote: v })} />
                <div className="form-grid">
                  <Text label="Name" value={item.name} onChange={(v) => update({ name: v })} />
                  <Text label="Role / company" value={item.role} onChange={(v) => update({ role: v })} />
                </div>
                <ImageField label="Photo (optional)" value={item.photo} onChange={(v) => update({ photo: v })} />
              </>
            )}
          />
        </>
      );

    case "video":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <Text label="Video URL" value={data.url} onChange={set("url")} placeholder="https://www.youtube.com/embed/…" />
        </>
      );

    case "contactInfo":
      return (
        <>
          <Text label="Title (optional)" value={data.title} onChange={set("title")} />
          <div className="form-grid">
            <Text label="Email" value={data.email} onChange={set("email")} />
            <Text label="Phone" value={data.phone} onChange={set("phone")} />
          </div>
          <Area label="Address" rows={2} value={data.address} onChange={set("address")} />
          <Text label="Google Maps embed URL (optional)" value={data.mapEmbedUrl} onChange={set("mapEmbedUrl")} />
        </>
      );

    case "customHtml":
      return <Area label="HTML" code rows={10} value={data.html} onChange={set("html")} />;

    default:
      // Unknown type — edit the raw JSON so nothing is ever un-editable.
      return (
        <Area
          label={`Data (JSON) — no form exists for type "${type}"`}
          code
          rows={10}
          value={typeof data === "string" ? data : JSON.stringify(data, null, 2)}
          onChange={(v) => {
            try {
              onChange(JSON.parse(v));
            } catch {
              onChange(v); // keep typing; will re-parse when valid
            }
          }}
          hint="Edit carefully — must be valid JSON when you save."
        />
      );
  }
}
