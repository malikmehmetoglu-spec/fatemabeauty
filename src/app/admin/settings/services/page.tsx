"use client";

/**
 * W_Services.dc.html — الخدمات والأسعار.
 * Live data: services, packages, rooms and devices from Supabase; edits are saved immediately.
 */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Icon, Loading, Tag, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import {
  listAllServices, listCategories, listDevices, listPackages, listRooms, moveCategory, packageSaving, priceLabel, serviceIcon, setPackageActive, setServiceActive,
  usdRate, type Category, type Package, type Service,
} from "@/lib/db/catalog";
import { money } from "@/lib/format";
import { C, CARD, ICON_FILL } from "@/lib/tokens";
import { CategoryDialog, PackageDialog, ServiceDialog } from "./dialogs";

/** Admin price: dollars stay visible here only, with today's SYP equivalent. */
function AdminPrice({ s }: { s: Service }) {
  if (s.price_currency !== "USD") return <span style={{ fontWeight: 700, color: C.accent }}>{priceLabel({ ...s, price_syp: s.price })}</span>;
  return (
    <span style={{ lineHeight: 1.3 }}>
      <span style={{ display: "block", fontWeight: 700, color: C.accent }}><span dir="ltr">{s.price}$</span></span>
      <span style={{ display: "block", fontSize: 11.5, color: s.price_syp == null ? C.danger : C.sub2 }}>{s.price_syp == null ? "لا سعر صرف بعد" : `≈ ${money(s.price_syp)}`}</span>
    </span>
  );
}

const roundBtn = { width: 34, height: 34, borderRadius: 17, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 } as const;

export default function ServicesPage() {
  const { data: services, loading, error } = useQuery(["catalog", "services", "all"], listAllServices);
  const { data: packages } = useQuery(["catalog", "packages", "all"], () => listPackages(true));
  const { data: rooms } = useQuery(["catalog", "rooms", "all"], () => listRooms(true));
  const { data: devices } = useQuery(["catalog", "devices"], listDevices);
  const { data: cats } = useQuery(["catalog", "categories", "all"], () => listCategories(true));
  const { data: rate } = useQuery(["catalog", "fx"], usdRate);
  const [edit, setEdit] = useState<Service | "new" | null>(null);
  const [newIn, setNewIn] = useState<string | undefined>();
  const [editCat, setEditCat] = useState<Category | "new" | null>(null);
  const [editPkg, setEditPkg] = useState<Package | "new" | null>(null);

  const S = services ?? [];
  const C2 = cats ?? [];
  const groups: { cat: Category | null; list: Service[] }[] = [
    ...C2.map((c) => ({ cat: c, list: S.filter((x) => x.category_id === c.key) })),
    ...(S.some((x) => !x.category_id || !C2.some((c) => c.key === x.category_id)) ? [{ cat: null, list: S.filter((x) => !x.category_id || !C2.some((c) => c.key === x.category_id)) }] : []),
  ];
  const P = packages ?? [];
  const roomName = (id: string | null) => rooms?.find((r) => r.id === id)?.name;
  const deviceName = (id: string | null) => devices?.find((d) => d.id === id)?.name;

  return (
    <AdminShell active="الإعدادات" title="الخدمات والأسعار" subtitle="فئات الخدمات وتعليماتها، ومدد الخدمات وأسعارها وغرفها وأجهزتها"
      actions={<div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}><GhostButton icon="plus" onClick={() => setEditCat("new")}>فئة جديدة</GhostButton><GhostButton icon="plus" onClick={() => { setNewIn(undefined); setEdit("new"); }}>خدمة جديدة</GhostButton></div>}>
      {rate == null && S.some((x) => x.price_currency === "USD") && <ErrorNote>بعض الأسعار بالدولار ولم يُحدَّد سعر الصرف بعد، فتظهر للمراجعات «السعر عند الاستفسار». حدّديه من المالية ← سعر الصرف.</ErrorNote>}
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الخدمات: {error}</ErrorNote> : S.length === 0 && C2.length === 0 ? (
        <EmptyState icon="sparkle" title="لا خدمات بعد"
          text="أضيفي أول خدمة بسعرها ومدتها وغرفتها. تظهر الخدمات المفعّلة فوراً في التطبيق والموقع وفي الحجز."
          action={<GhostButton icon="plus" onClick={() => setEdit("new")}>خدمة جديدة</GhostButton>} />
      ) : (
        groups.map(({ cat, list }, gi) => (
          <section key={cat?.key ?? "none"} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ ...CARD, borderRadius: 24, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap", opacity: cat && !cat.active ? 0.6 : 1 }}>
              <span style={{ width: 42, height: 42, borderRadius: 21, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={cat?.icon ?? "sparkle"} size={19} color="#A877B6" />
              </span>
              <div style={{ flex: "1 1 220px", minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  {cat?.name ?? "بلا فئة"} <span style={{ fontSize: 12, fontWeight: 500, color: C.sub2 }}>{list.length} خدمة</span>
                  {cat?.not_for_pregnant && <Tag kind="amber">غير مناسبة للحامل</Tag>}
                  {cat && !cat.active && <Tag kind="gray">موقوفة</Tag>}
                </div>
                {cat && <div style={{ fontSize: 12, color: C.sub2 }}>{cat.short_description || "—"}{cat.instructions ? ` · ${cat.instructions.split("\n").filter(Boolean).length} تعليمات للمراجعات` : ""}</div>}
              </div>
              {cat && <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <button type="button" aria-label={`نقل ${cat.name} للأعلى`} disabled={gi === 0} onClick={() => moveCategory(C2, cat.key, -1)} style={{ ...roundBtn, opacity: gi === 0 ? 0.4 : 1 }}><Icon name="up" color={C.accent} size={15} /></button>
                <button type="button" aria-label={`نقل ${cat.name} للأسفل`} disabled={gi >= C2.length - 1} onClick={() => moveCategory(C2, cat.key, 1)} style={{ ...roundBtn, opacity: gi >= C2.length - 1 ? 0.4 : 1 }}><Icon name="down" color={C.accent} size={15} /></button>
                <button type="button" aria-label={`تعديل ${cat.name}`} onClick={() => setEditCat(cat)} style={roundBtn}><Icon name="edit" color={C.accent} size={15} /></button>
                <GhostButton icon="plus" onClick={() => { setNewIn(cat.key); setEdit("new"); }}>خدمة</GhostButton>
              </div>}
            </div>
            {list.length > 0 && <DataTable minWidth={700}
              headers={["الخدمة", "المدة", "السعر", "الغرفة الأساسية", "الجهاز", "الحجز أونلاين", "مفعّلة", ""]}
              widths={[2.4, 0.8, 1.1, 1, 1.2, 0.9, 0.7, 0.5]}
              rowHeight={62}
              rows={list.map((s) => [
                <>
                  <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Icon name={serviceIcon(s.name)} size={19} color="#A877B6" />
                  </span>
                  <div style={{ lineHeight: 1.35, minWidth: 0 }}>
                    <button type="button" onClick={() => setEdit(s)} style={{ border: "none", background: "none", padding: 0, fontSize: 14.5, fontWeight: 700, color: C.ink, textAlign: "right" }}>{s.name}</button>
                    {s.description && <div style={{ fontSize: 12, color: C.sub2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.description}</div>}
                  </div>
                </>,
                `${s.minutes} دقيقة`,
                <AdminPrice key="p" s={s} />,
                roomName(s.room_id) ? <Tag key="r" kind="gray">{roomName(s.room_id)}</Tag> : <span style={{ color: C.muted }}>أي غرفة</span>,
                deviceName(s.device_id) ?? <span style={{ color: C.muted }}>—</span>,
                s.bookable_online ? <Tag key="o" kind="green">نعم</Tag> : <Tag key="o" kind="gray">من الاستقبال</Tag>,
                <Toggle key="a" on={s.active} label={`تفعيل ${s.name}`} onChange={(v) => setServiceActive(s.key, v)} />,
                <button key="e" type="button" onClick={() => setEdit(s)} aria-label={`تعديل ${s.name}`} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon name="edit" color={C.accent} size={15} />
                </button>,
              ])}
            />}
          </section>
        ))
      )}

      <div style={{ ...CARD, borderRadius: 26, padding: "16px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: 18, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="gift" size={16} /></span>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>الباقات</div>
              <div style={{ fontSize: 12, color: C.sub2 }}>عدة جلسات من خدمة واحدة بسعر مخفّض</div>
            </div>
          </div>
          {S.length > 0 && <GhostButton icon="plus" onClick={() => setEditPkg("new")}>باقة جديدة</GhostButton>}
        </div>
        {P.length === 0 ? (
          <div style={{ fontSize: 13, color: C.muted, padding: "10px 0" }}>{S.length ? "لا باقات بعد. أضيفي باقة لخدمة موجودة." : "أضيفي خدمة أولاً ثم أنشئي لها باقة."}</div>
        ) : P.map((p) => {
          const s = S.find((x) => x.key === p.service_key);
          const saving = packageSaving(p, s);
          return (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderTop: "1px solid #EDE2F1", opacity: p.active ? 1 : 0.6 }}>
              <span style={{ width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name={serviceIcon(s?.name ?? p.name)} size={16} color="#A877B6" />
              </span>
              <div style={{ flex: 1, lineHeight: 1.35 }}>
                <button type="button" onClick={() => setEditPkg(p)} style={{ border: "none", background: "none", padding: 0, fontSize: 14, fontWeight: 700, color: C.ink }}>{p.name}</button>
                <div style={{ fontSize: 12, color: C.sub2 }}>{p.sessions} جلسات · {s?.name ?? "خدمة محذوفة"}{saving > 0 ? ` · توفير ${money(saving)}` : ""}</div>
              </div>
              {!p.active && <Tag kind="gray">موقوفة</Tag>}
              <span style={{ fontSize: 15, fontWeight: 700, color: C.accent }}>{money(p.price)}</span>
              <Toggle on={p.active} label={`تفعيل ${p.name}`} onChange={(v) => setPackageActive(p.id, v)} />
            </div>
          );
        })}
      </div>

      <ServiceDialog open={!!edit} service={edit === "new" ? null : edit} rooms={rooms ?? []} devices={devices ?? []} categories={C2} rate={rate ?? null} defaultCategory={newIn} onClose={() => setEdit(null)} />
      <CategoryDialog open={!!editCat} category={editCat === "new" ? null : editCat} nextSort={(C2.at(-1)?.sort ?? 0) + 1} onClose={() => setEditCat(null)} />
      <PackageDialog open={!!editPkg} pkg={editPkg === "new" ? null : editPkg} services={S} onClose={() => setEditPkg(null)} />
    </AdminShell>
  );
}
