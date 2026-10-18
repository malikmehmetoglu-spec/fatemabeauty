"use client";

/**
 * W_Rooms.dc.html — الغرف والأجهزة.
 * Live data: rooms, devices and the services assigned to each room come from Supabase.
 */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Tag, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listAllServices, listDevices, listRooms, saveRoom, setDeviceMaintenance, type Device, type Room } from "@/lib/db/catalog";
import { C, CARD, ICON_FILL } from "@/lib/tokens";
import { DeviceDialog, RoomDialog } from "./dialogs";

export default function RoomsPage() {
  const { data: rooms, loading, error } = useQuery(["catalog", "rooms", "all"], () => listRooms(true));
  const { data: devices } = useQuery(["catalog", "devices"], listDevices);
  const { data: services } = useQuery(["catalog", "services", "all"], listAllServices);
  const [editRoom, setEditRoom] = useState<Room | "new" | null>(null);
  const [editDevice, setEditDevice] = useState<Device | "new" | null>(null);

  const R = rooms ?? [];
  const D = devices ?? [];
  const S = services ?? [];
  const unassigned = D.filter((d) => !d.room_id);

  return (
    <AdminShell active="الإعدادات" title="الغرف والأجهزة" subtitle="إسناد الخدمات والأجهزة لكل غرفة وإتاحتها للحجز"
      actions={<>
        <GhostButton icon="plus" onClick={() => setEditDevice("new")}>جهاز جديد</GhostButton>
        <GhostButton icon="plus" onClick={() => setEditRoom("new")}>غرفة جديدة</GhostButton>
      </>}>
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="الغرف" value={R.length} sub={`${R.filter((r) => r.active).length} متاحة للحجز`} icon="door" />
        <Kpi label="الأجهزة" value={D.length} sub={`${D.filter((d) => d.in_maintenance).length} في الصيانة`} icon="tool" />
        <Kpi label="الخدمات المسندة لغرفة" value={S.filter((s) => s.room_id).length} sub={`من ${S.length} خدمة`} icon="sparkle" />
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الغرف: {error}</ErrorNote> : R.length === 0 ? (
        <EmptyState icon="door" title="لا غرف بعد"
          text="أضيفي غرف المركز أولاً، ثم أسندي لكل غرفة أجهزتها وخدماتها. الغرفة المغلقة لا تظهر في الحجز."
          action={<GhostButton icon="plus" onClick={() => setEditRoom("new")}>غرفة جديدة</GhostButton>} />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 }}>
          {R.map((r) => {
            const rd = D.filter((d) => d.room_id === r.id);
            const rs = S.filter((s) => s.room_id === r.id);
            return (
              <div key={r.id} style={{ ...CARD, borderRadius: 26, padding: "16px 18px", display: "flex", flexDirection: "column", gap: 10, opacity: r.active ? 1 : 0.75 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 20, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="door" size={19} /></span>
                  <button type="button" onClick={() => setEditRoom(r)} style={{ flex: 1, border: "none", background: "none", padding: 0, textAlign: "right", fontSize: 17, fontWeight: 700, color: C.ink }}>{r.name}</button>
                  <Tag kind={r.active ? "green" : "pink"}>{r.active ? "متاحة للحجز" : "مغلقة للحجز"}</Tag>
                  <Toggle on={r.active} label={`إتاحة ${r.name} للحجز`} onChange={(v) => saveRoom({ id: r.id, name: r.name, active: v })} />
                </div>
                <Group title="الخدمات">
                  {rs.length ? rs.map((s) => <Tag key={s.key} kind={s.active ? "lilac" : "gray"}>{s.name}</Tag>)
                    : <span style={{ fontSize: 12.5, color: C.muted }}>لا خدمات مسندة — تُسند من «الخدمات والأسعار»</span>}
                </Group>
                <Group title="الأجهزة">
                  {rd.length ? rd.map((d) => <DeviceChip key={d.id} d={d} onEdit={() => setEditDevice(d)} />)
                    : <span style={{ fontSize: 12.5, color: C.muted }}>لا أجهزة في هذه الغرفة</span>}
                </Group>
              </div>
            );
          })}
        </div>
      )}

      {unassigned.length > 0 && (
        <div style={{ ...CARD, borderRadius: 26, padding: "16px 18px" }}>
          <Group title="أجهزة بلا غرفة">{unassigned.map((d) => <DeviceChip key={d.id} d={d} onEdit={() => setEditDevice(d)} />)}</Group>
        </div>
      )}

      <RoomDialog open={!!editRoom} room={editRoom === "new" ? null : editRoom} onClose={() => setEditRoom(null)} />
      <DeviceDialog open={!!editDevice} device={editDevice === "new" ? null : editDevice} rooms={R} onClose={() => setEditDevice(null)} />
    </AdminShell>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ borderTop: "1px solid #EDE2F1", paddingTop: 8 }}>
      <div style={{ fontSize: 12, color: C.sub2, fontWeight: 600, marginBottom: 6 }}>{title}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>{children}</div>
    </div>
  );
}

function DeviceChip({ d, onEdit }: { d: Device; onEdit: () => void }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, height: 36, padding: "0 6px 0 12px", borderRadius: 18, background: d.in_maintenance ? "#FCF1DE" : C.tint2 }}>
      <button type="button" onClick={onEdit} style={{ border: "none", background: "none", padding: 0, fontSize: 13, fontWeight: 600, color: C.ink }}>{d.name}</button>
      {d.in_maintenance && <span style={{ fontSize: 11.5, color: "#8A5A12", fontWeight: 600 }}>صيانة</span>}
      <Toggle on={!d.in_maintenance} label={`${d.name} يعمل`} onChange={(v) => setDeviceMaintenance(d.id, !v)} />
    </span>
  );
}
