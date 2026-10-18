"use client";

/** W_Offers.dc.html — offers and discount codes (live, Supabase). Packages are managed with services. */
import Link from "next/link";
import { useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Modal, NumberInput, Segment, Select, SubmitButton, Tag, TextInput, Toggle } from "@/components/ui";
import { R } from "@/lib/routes";
import { arDate, money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { listOffers, offerStatus, saveOffer, setOfferActive, type Offer } from "@/lib/db/marketing";
import { listServices } from "@/lib/db/catalog";
import { C } from "@/lib/tokens";
import { MarketingTabs } from "../tabs";

const fmtDate = (d: string | null) => (d ? arDate(new Date(`${d}T12:00:00+03:00`), { day: false, year: true }) : "—");

export default function OffersPage() {
  const { data, loading, error } = useQuery(["offers", "all"], listOffers);
  const { data: services } = useQuery(["catalog", "services"], listServices);
  const [editing, setEditing] = useState<Offer | "new" | null>(null);
  const list = data ?? [];
  const svcName = (k: string | null) => (k ? services?.find((s) => s.key === k)?.name ?? k : "كل الخدمات");
  const live = list.filter((o) => offerStatus(o).label === "فعّال");
  const uses = list.reduce((s, o) => s + o.uses, 0);

  return (
    <AdminShell active="التسويق والولاء" title="العروض وأكواد الخصم" subtitle="العروض الموسمية وأكواد الخصم ومرات استخدامها"
      actions={<GhostButton icon="plus" onClick={() => setEditing("new")}>عرض جديد</GhostButton>}>
      <MarketingTabs active={R.W_Offers} />
      <div style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="العروض والأكواد" value={list.length} sub={`${live.length} فعّال الآن`} icon="percent" />
        <Kpi label="مرات الاستخدام" value={uses} sub="مجموع استخدام كل الأكواد" icon="calcheck" />
        <Link href={R.W_Services} style={{ flex: 1, minWidth: 0, borderRadius: 26, padding: "18px 20px", background: C.white, border: "1px dashed #D8BFDE", display: "flex", alignItems: "center", gap: 12, color: C.accent }}>
          <Icon name="layers" size={22} />
          <div style={{ lineHeight: 1.4 }}>
            <div style={{ fontSize: 15, fontWeight: 700 }}>الباقات المسبقة الدفع</div>
            <div style={{ fontSize: 12.5, color: C.sub2 }}>تُدار مع الخدمات والأسعار</div>
          </div>
        </Link>
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل العروض: {error}</ErrorNote> : list.length === 0 ? (
        <EmptyState icon="percent" title="لا توجد عروض بعد"
          text="أنشئي عرضاً بنسبة أو مبلغ خصم، مع كود اختياري تكتبه المراجعة عند الحجز، ومدة صلاحية وحد أقصى للاستخدام."
          action={<GhostButton icon="plus" onClick={() => setEditing("new")}>عرض جديد</GhostButton>} />
      ) : (
        <DataTable
          headers={["العرض", "الكود", "الخصم", "الخدمة", "المدة", "الاستخدام", "الحالة", ""]}
          widths={[2, 1.1, 0.9, 1.3, 1.6, 1.1, 0.9, 1.2]}
          rows={list.map((o) => {
            const st = offerStatus(o);
            return [
              <button key="t" type="button" onClick={() => setEditing(o)} style={{ border: "none", background: "none", padding: 0, fontSize: 14, fontWeight: 700, color: C.ink, textAlign: "right" }}>{o.title}</button>,
              o.code ? <span key="c" dir="ltr" className="latin" style={{ fontSize: 13, fontWeight: 700, color: C.accent, background: "#F3EAF6", border: "1px dashed #D8BFDE", borderRadius: 10, padding: "4px 10px" }}>{o.code}</span> : <span key="c" style={{ color: C.muted }}>بلا كود</span>,
              o.kind === "percent" ? `${o.value}%` : money(o.value),
              svcName(o.service_key),
              <span key="d" style={{ fontSize: 12.5 }}>{fmtDate(o.starts_on)} ← {fmtDate(o.ends_on)}</span>,
              <span key="u" className="latin">{o.uses}{o.max_uses ? ` / ${o.max_uses}` : ""}</span>,
              <Tag key="s" kind={st.kind}>{st.label}</Tag>,
              <Toggle key="a" on={o.active} label={`تفعيل ${o.title}`} onChange={(v) => setOfferActive(o.id, v)} />,
            ];
          })}
        />
      )}

      <OfferDialog offer={editing === "new" ? null : editing} open={!!editing} onClose={() => setEditing(null)}
        services={(services ?? []).map((s) => ({ value: s.key, label: s.name }))} />
    </AdminShell>
  );
}

function OfferDialog({ open, offer, onClose, services }: { open: boolean; offer: Offer | null; onClose: () => void; services: { value: string; label: string }[] }) {
  const [title, setTitle] = useState("");
  const [code, setCode] = useState("");
  const [kind, setKind] = useState<"percent" | "amount">("percent");
  const [value, setValue] = useState("");
  const [svc, setSvc] = useState("");
  const [max, setMax] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTitle(offer?.title ?? ""); setCode(offer?.code ?? ""); setKind((offer?.kind as "percent" | "amount") ?? "percent");
    setValue(offer ? String(offer.value) : ""); setSvc(offer?.service_key ?? ""); setMax(offer?.max_uses ? String(offer.max_uses) : "");
    setFrom(offer?.starts_on ?? ""); setTo(offer?.ends_on ?? ""); setErr(null);
  }, [open, offer]);

  const v = Number(value);
  const valid = title.trim() && v > 0 && (kind === "amount" || v <= 100);
  const save = async () => {
    if (!valid) return;
    setBusy(true); setErr(null);
    try {
      await saveOffer({ id: offer?.id, title: title.trim(), code: code.trim() || null, kind, value: v, service_key: svc || null,
        max_uses: Number(max) || null, starts_on: from || null, ends_on: to || null, active: offer?.active ?? true });
      onClose();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={offer ? "تعديل العرض" : "عرض جديد"}
      footer={<><SubmitButton onClick={save} busy={busy} disabled={!valid}>حفظ</SubmitButton><GhostButton onClick={onClose}>إلغاء</GhostButton></>}>
      <TextInput label="اسم العرض" value={title} onChange={setTitle} required />
      <div style={{ display: "flex", gap: 12 }}>
        <TextInput label="الكود (اختياري)" value={code} onChange={(x) => setCode(x.toUpperCase().replace(/\s/g, ""))} dir="ltr" style={{ flex: 1 }} />
        <NumberInput label="أقصى عدد استخدام" value={max} onChange={setMax} hint="فارغ = بلا حد" style={{ flex: 1 }} />
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "flex-end" }}>
        <Segment label="نوع الخصم" value={kind} onChange={setKind} options={[{ value: "percent", label: "نسبة %" }, { value: "amount", label: "مبلغ ل.س" }]} />
        <NumberInput label="قيمة الخصم" value={value} onChange={setValue} suffix={kind === "percent" ? "%" : "ل.س"} required style={{ flex: 1 }} />
      </div>
      <Select label="الخدمة" value={svc} onChange={setSvc} options={[{ value: "", label: "كل الخدمات" }, ...services]} />
      <div style={{ display: "flex", gap: 12 }}>
        <TextInput label="يبدأ" type="date" value={from} onChange={setFrom} style={{ flex: 1 }} />
        <TextInput label="ينتهي" type="date" value={to} onChange={setTo} style={{ flex: 1 }} />
      </div>
      {err && <ErrorNote>{err.includes("duplicate") ? "هذا الكود مستخدم في عرض آخر" : err}</ErrorNote>}
    </Modal>
  );
}
