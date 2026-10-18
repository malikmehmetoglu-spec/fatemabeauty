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
  listAllServices, listDevices, listPackages, listRooms, packageSaving, priceLabel, serviceIcon, setPackageActive, setServiceActive,
  type Package, type Service,
} from "@/lib/db/catalog";
import { money } from "@/lib/format";
import { C, CARD, ICON_FILL } from "@/lib/tokens";
import { PackageDialog, ServiceDialog } from "./dialogs";

export default function ServicesPage() {
  const { data: services, loading, error } = useQuery(["catalog", "services", "all"], listAllServices);
  const { data: packages } = useQuery(["catalog", "packages", "all"], () => listPackages(true));
  const { data: rooms } = useQuery(["catalog", "rooms", "all"], () => listRooms(true));
  const { data: devices } = useQuery(["catalog", "devices"], listDevices);
  const [edit, setEdit] = useState<Service | "new" | null>(null);
  const [editPkg, setEditPkg] = useState<Package | "new" | null>(null);

  const S = services ?? [];
  const P = packages ?? [];
  const roomName = (id: string | null) => rooms?.find((r) => r.id === id)?.name;
  const deviceName = (id: string | null) => devices?.find((d) => d.id === id)?.name;

  return (
    <AdminShell active="الإعدادات" title="الخدمات والأسعار" subtitle="مدد الخدمات وأسعارها وغرفها وأجهزتها"
      actions={<GhostButton icon="plus" onClick={() => setEdit("new")}>خدمة جديدة</GhostButton>}>
      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الخدمات: {error}</ErrorNote> : S.length === 0 ? (
        <EmptyState icon="sparkle" title="لا خدمات بعد"
          text="أضيفي أول خدمة بسعرها ومدتها وغرفتها. تظهر الخدمات المفعّلة فوراً في التطبيق والموقع وفي الحجز."
          action={<GhostButton icon="plus" onClick={() => setEdit("new")}>خدمة جديدة</GhostButton>} />
      ) : (
        <DataTable minWidth={700}
          headers={["الخدمة", "المدة", "السعر", "الغرفة الأساسية", "الجهاز", "الحجز أونلاين", "مفعّلة", ""]}
          widths={[2.4, 0.8, 1.1, 1, 1.2, 0.9, 0.7, 0.5]}
          rowHeight={62}
          rows={S.map((s) => [
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
            <span key="p" style={{ fontWeight: 700, color: C.accent }}>{priceLabel(s)}</span>,
            roomName(s.room_id) ? <Tag key="r" kind="gray">{roomName(s.room_id)}</Tag> : <span style={{ color: C.muted }}>أي غرفة</span>,
            deviceName(s.device_id) ?? <span style={{ color: C.muted }}>—</span>,
            s.bookable_online ? <Tag key="o" kind="green">نعم</Tag> : <Tag key="o" kind="gray">من الاستقبال</Tag>,
            <Toggle key="a" on={s.active} label={`تفعيل ${s.name}`} onChange={(v) => setServiceActive(s.key, v)} />,
            <button key="e" type="button" onClick={() => setEdit(s)} aria-label={`تعديل ${s.name}`} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon name="edit" color={C.accent} size={15} />
            </button>,
          ])}
        />
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

      <ServiceDialog open={!!edit} service={edit === "new" ? null : edit} rooms={rooms ?? []} devices={devices ?? []} onClose={() => setEdit(null)} />
      <PackageDialog open={!!editPkg} pkg={editPkg === "new" ? null : editPkg} services={S} onClose={() => setEditPkg(null)} />
    </AdminShell>
  );
}
