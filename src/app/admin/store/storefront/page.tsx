"use client";

/**
 * واجهة المتجر — hero slides of the desktop store home. Staff (admin / reception) add, edit, reorder,
 * hide and delete slides; each slide has an image, a short line, a title, a text and up to two buttons.
 */
import { arError } from "@/lib/arError";
import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Loading, Modal, Select, SubmitButton, TextArea, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { C, SHB } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listInventory } from "@/lib/db/products";
import { deleteSlide, listSlides, reorderSlides, saveSlide, setSlideActive, slideImage, type Slide } from "@/lib/db/storefront";

type LinkKind = "none" | "store" | "book" | "product" | "category" | "custom";

export default function Page() {
  const { data, loading, error } = useQuery(["slides", "all"], listSlides);
  const [editing, setEditing] = useState<Slide | "new" | null>(null);
  const [removing, setRemoving] = useState<Slide | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const slides = data ?? [];

  async function run(f: () => Promise<void>) {
    setBusy(true); setErr("");
    try { await f(); } catch (e) { setErr(arError(e)); } finally { setBusy(false); }
  }
  const move = (i: number, d: -1 | 1) => {
    const ids = slides.map((s) => s.id);
    const j = i + d;
    if (j < 0 || j >= ids.length) return;
    [ids[i], ids[j]] = [ids[j], ids[i]];
    run(() => reorderSlides(ids));
  };

  return (
    <AdminShell active="المتجر" title="واجهة المتجر" subtitle="شرائح الصفحة الأولى للمتجر على الحاسوب — الصورة والنص يتبدّلان معاً"
      actions={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة شريحة</GhostButton>}>
      {err && <ErrorNote>{err}</ErrorNote>}
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الشرائح: {error}</ErrorNote> : slides.length === 0 ? (
        <EmptyState icon="image" title="لا شرائح بعد"
          text="أضيفي شريحة بصورة وعنوان وزر؛ تظهر في أعلى المتجر وتتبدّل تلقائياً. بدون شرائح يظهر الغلاف الثابت بالشعار."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>إضافة شريحة</GhostButton>} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {slides.map((s, i) => {
            const img = slideImage(s);
            return (
              <article key={s.id} style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", padding: 12, borderRadius: 22, background: C.white, boxShadow: SHB, opacity: s.active ? 1 : 0.62 }}>
                <span style={{ width: 132, height: 88, borderRadius: 16, overflow: "hidden", flexShrink: 0, background: "linear-gradient(150deg,#8A5296,#5E3369)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="image" color="#FFFFFF" size={24} />}
                </span>
                <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.45 }}>
                  {s.eyebrow && <div style={{ fontSize: 12, color: C.sub2 }}>{s.eyebrow}</div>}
                  <button type="button" onClick={() => setEditing(s)} style={{ border: "none", background: "none", padding: 0, fontSize: 15.5, fontWeight: 700, color: C.ink, textAlign: "right", whiteSpace: "pre-line" }}>{s.title}</button>
                  <div style={{ fontSize: 12.5, color: C.sub2 }}>{[s.cta_label, s.cta2_label].filter(Boolean).join("، ") || "بلا أزرار"}</div>
                </div>
                <span style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12.5, color: C.sub2 }}>
                  {s.active ? "ظاهرة" : "مخفية"} <Toggle on={s.active} label={`إظهار الشريحة ${s.title}`} onChange={() => !busy && run(() => setSlideActive(s.id, !s.active))} />
                </span>
                <span style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <RowBtn icon="up" label="أعلى" onClick={() => move(i, -1)} disabled={busy || i === 0} />
                  <RowBtn icon="down" label="أسفل" onClick={() => move(i, 1)} disabled={busy || i === slides.length - 1} />
                  <RowBtn icon="edit" label="تعديل" onClick={() => setEditing(s)} />
                  <RowBtn icon="trash" label="حذف" onClick={() => setRemoving(s)} danger />
                </span>
              </article>
            );
          })}
        </div>
      )}

      {editing && <SlideDialog slide={editing === "new" ? null : editing} nextSort={slides.length ? Math.max(...slides.map((s) => s.sort)) + 1 : 0} onClose={() => setEditing(null)} />}
      <Modal open={!!removing} onClose={() => setRemoving(null)} title="حذف الشريحة" width={440}
        footer={<>
          <GhostButton onClick={() => setRemoving(null)}>إلغاء</GhostButton>
          <SubmitButton busy={busy} onClick={() => removing && run(async () => { await deleteSlide(removing); setRemoving(null); })} style={{ background: C.danger }}>حذف نهائياً</SubmitButton>
        </>}>
        <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.8, color: C.sub }}>ستُحذف الشريحة «{removing?.title}» وصورتها من المتجر. لإيقافها مؤقتاً استخدمي زر الإظهار بدل الحذف.</p>
      </Modal>
    </AdminShell>
  );
}

function RowBtn({ icon, label, onClick, disabled, danger }: { icon: string; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  const col = danger ? C.danger : C.accent;
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label={label} title={label} style={{ height: 34, padding: "0 12px", borderRadius: 17, border: "1px solid #EADCF0", background: C.white, fontSize: 12.5, fontWeight: 600, color: col, display: "inline-flex", alignItems: "center", gap: 5, whiteSpace: "nowrap", opacity: disabled ? 0.4 : 1, cursor: disabled ? "default" : "pointer" }}>
      <Icon name={icon} color={col} size={14} stroke={2} />{label}
    </button>
  );
}

const PRODUCT_PREFIX = `${R.P_Product}?key=`;
const CAT_PREFIX = `${R.P_Store}?cat=`;

function parseLink(href: string): { kind: LinkKind; val: string } {
  if (!href) return { kind: "none", val: "" };
  if (href === R.P_Store) return { kind: "store", val: "" };
  if (href === "/book/") return { kind: "book", val: "" };
  if (href.startsWith(PRODUCT_PREFIX)) return { kind: "product", val: decodeURIComponent(href.slice(PRODUCT_PREFIX.length)) };
  if (href.startsWith(CAT_PREFIX)) return { kind: "category", val: decodeURIComponent(href.slice(CAT_PREFIX.length)) };
  return { kind: "custom", val: href };
}
function buildLink(kind: LinkKind, val: string) {
  if (kind === "store") return R.P_Store;
  if (kind === "book") return "/book/";
  if (kind === "product") return val ? PRODUCT_PREFIX + encodeURIComponent(val) : "";
  if (kind === "category") return val ? CAT_PREFIX + encodeURIComponent(val) : "";
  if (kind === "custom") return val.trim();
  return "";
}

function LinkPicker({ title, label, href, onLabel, onHref, optional }: {
  title: string; label: string; href: string; onLabel: (v: string) => void; onHref: (v: string) => void; optional?: boolean;
}) {
  const { data } = useQuery(["products", "inventory"], listInventory);
  const retail = useMemo(() => (data ?? []).filter((p) => p.kind === "retail" && p.show_in_store), [data]);
  const cats = useMemo(() => Array.from(new Set(retail.map((p) => p.category.trim()).filter(Boolean))), [retail]);
  const init = parseLink(href);
  const [kind, setKind] = useState<LinkKind>(init.kind === "none" && !optional ? "store" : init.kind);
  const [val, setVal] = useState(init.val);
  useEffect(() => { onHref(buildLink(kind, val)); }, [kind, val]); // eslint-disable-line react-hooks/exhaustive-deps

  const kinds: { value: LinkKind; label: string }[] = [
    ...(optional ? [{ value: "none" as LinkKind, label: "بلا زر" }] : []),
    { value: "store", label: "المتجر" }, { value: "product", label: "منتج" }, { value: "category", label: "قسم" },
    { value: "book", label: "حجز موعد" }, { value: "custom", label: "رابط آخر" },
  ];
  return (
    <fieldset style={{ border: "1px solid #EFE4F3", borderRadius: 18, padding: "12px 14px 14px", margin: 0, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
      <legend style={{ fontSize: 13, fontWeight: 700, color: C.ink, padding: "0 6px" }}>{title}</legend>
      <Select label="يفتح" value={kind} onChange={(k) => { setKind(k); setVal(""); }} options={kinds} />
      {kind !== "none" && <TextInput label="نص الزر" value={label} onChange={onLabel} placeholder="مثلاً: تسوّقي الآن" />}
      {kind === "product" && <Select label="المنتج" value={val} onChange={setVal} options={[{ value: "", label: "اختاري منتجاً" }, ...retail.map((p) => ({ value: p.key, label: p.name }))]} />}
      {kind === "category" && <Select label="القسم" value={val} onChange={setVal} options={[{ value: "", label: "اختاري قسماً" }, ...cats.map((c) => ({ value: c, label: c }))]} />}
      {kind === "custom" && <TextInput label="الرابط" value={val} onChange={setVal} dir="ltr" placeholder="/services/ أو https://…" />}
    </fieldset>
  );
}

function SlideDialog({ slide, nextSort, onClose }: { slide: Slide | null; nextSort: number; onClose: () => void }) {
  const [eyebrow, setEyebrow] = useState(slide?.eyebrow ?? "");
  const [title, setTitle] = useState(slide?.title ?? "");
  const [body, setBody] = useState(slide?.body ?? "");
  const [cta, setCta] = useState(slide?.cta_label ?? "");
  const [ctaHref, setCtaHref] = useState(slide?.cta_href ?? R.P_Store);
  const [cta2, setCta2] = useState(slide?.cta2_label ?? "");
  const [cta2Href, setCta2Href] = useState(slide?.cta2_href ?? "");
  const [active, setActive] = useState(slide?.active ?? true);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : slide ? slideImage(slide) : null), [file, slide]);
  useEffect(() => () => { if (file && preview) URL.revokeObjectURL(preview); }, [file, preview]);

  async function save() {
    setErr("");
    if (!title.trim()) return setErr("اكتبي عنوان الشريحة.");
    if (!slide?.image_path && !file) return setErr("اختاري صورة للشريحة.");
    if (ctaHref && !cta.trim()) return setErr("اكتبي نص الزر الأساسي.");
    if (cta2Href && !cta2.trim()) return setErr("اكتبي نص الزر الثاني أو اختاري «بلا زر».");
    setBusy(true);
    try {
      await saveSlide({
        id: slide?.id, eyebrow: eyebrow.trim(), title: title.trim(), body: body.trim(),
        cta_label: ctaHref ? cta.trim() : "", cta_href: ctaHref, cta2_label: cta2Href ? cta2.trim() : "", cta2_href: cta2Href,
        active, sort: slide?.sort ?? nextSort,
      }, file, slide?.image_path ?? null);
      onClose();
    } catch (e) { setErr(arError(e)); } finally { setBusy(false); }
  }

  return (
    <Modal open onClose={onClose} title={slide ? "تعديل الشريحة" : "شريحة جديدة"} width={680}
      footer={<><GhostButton onClick={onClose}>إلغاء</GhostButton><SubmitButton busy={busy} onClick={save}>حفظ الشريحة</SubmitButton></>}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 14, padding: 10, borderRadius: 18, border: "1px dashed #D9C2E3", cursor: "pointer", background: "#FCF9FD" }}>
          <span style={{ width: 150, height: 100, borderRadius: 14, overflow: "hidden", flexShrink: 0, background: "linear-gradient(150deg,#8A5296,#5E3369)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {preview ? <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Icon name="image" color="#FFFFFF" size={26} />}
          </span>
          <span style={{ fontSize: 13.5, lineHeight: 1.7, color: C.sub }}>
            <b style={{ color: C.accent }}>{preview ? "تغيير الصورة" : "اختاري صورة"}</b><br />
            صورة عريضة أو مربعة بجودة جيدة (JPG أو PNG أو WEBP، حتى 5 ميغابايت). تُقصّ تلقائياً لتملأ الإطار.
          </span>
          <input type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={(e) => {
            const f = e.target.files?.[0] ?? null; e.target.value = "";
            if (f && f.size > 5 * 1024 * 1024) return setErr("حجم الصورة أكبر من 5 ميغابايت.");
            if (f && !f.type.startsWith("image/")) return setErr("اختاري ملف صورة.");
            setErr(""); setFile(f);
          }} />
        </label>
        <TextInput label="السطر الصغير" value={eyebrow} onChange={setEyebrow} placeholder="مثلاً: مجموعة الخريف" />
        <TextArea label="العنوان (سطران كحدّ أقصى)" value={title} onChange={(v) => setTitle(v.split("\n").slice(0, 2).join("\n"))} rows={2} placeholder="روتين بشرتكِ،&#10;كما تختاره أخصائيتكِ" />
        <TextArea label="النص" value={body} onChange={setBody} rows={2} />
        <LinkPicker title="الزر الأساسي" label={cta} href={ctaHref} onLabel={setCta} onHref={setCtaHref} />
        <LinkPicker title="الزر الثاني (اختياري)" label={cta2} href={cta2Href} onLabel={setCta2} onHref={setCta2Href} optional />
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: C.sub }}>
          <Toggle on={active} onChange={setActive} label="إظهار الشريحة في المتجر" />{active ? "ظاهرة في المتجر" : "مخفية عن المتجر"}
        </div>
        {err && <ErrorNote>{err}</ErrorNote>}
      </div>
    </Modal>
  );
}
