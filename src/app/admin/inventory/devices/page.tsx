"use client";

/**
 * W_Devices.dc.html — الأجهزة والصيانة.
 * Live data: devices, their rooms and linked services come from Supabase (same tables as الغرف والأجهزة).
 */
import { useState } from "react";
import { AdminShell } from "@/components/shell";
import { DataTable, EmptyState, ErrorNote, GhostButton, Icon, Kpi, Loading, Tag, Toggle } from "@/components/ui";
import { useQuery } from "@/lib/db/query";
import { listAllServices, listDevices, listRooms, setDeviceMaintenance, type Device } from "@/lib/db/catalog";
import { arDate, dayKey } from "@/lib/format";
import { C, ICON_FILL } from "@/lib/tokens";
import { DeviceDialog } from "@/app/admin/settings/rooms/dialogs";

export default function DevicesPage() {
  const { data: devices, loading, error } = useQuery(["catalog", "devices"], listDevices);
  const { data: rooms } = useQuery(["catalog", "rooms", "all"], () => listRooms(true));
  const { data: services } = useQuery(["catalog", "services", "all"], listAllServices);
  const [edit, setEdit] = useState<Device | "new" | null>(null);

  const D = devices ?? [];
  const roomName = (id: string | null) => rooms?.find((r) => r.id === id)?.name;
  const today = dayKey();
  const due = D.filter((d) => d.next_service_at && d.next_service_at <= today);

  return (
    <AdminShell active="المخزون والأجهزة" title="الأجهزة والصيانة" subtitle="حالة كل جهاز وموعد صيانته والخدمات التي تعتمد عليه"
      actions={<GhostButton icon="plus" onClick={() => setEdit("new")}>جهاز جديد</GhostButton>}>
      <div className="adm-row" style={{ display: "flex", gap: 14 }}>
        <Kpi dark label="الأجهزة" value={D.length} sub={`${D.length - D.filter((d) => d.in_maintenance).length} تعمل الآن`} icon="tool" />
        <Kpi label="تحت الصيانة" value={D.filter((d) => d.in_maintenance).length} sub="الخدمات المرتبطة غير متاحة" icon="alert" />
        <Kpi label="صيانة مستحقة" value={due.length} sub="موعدها اليوم أو قبله" icon="clock" />
      </div>

      {loading ? <Loading /> : error ? <ErrorNote>تعذّر تحميل الأجهزة: {error}</ErrorNote> : D.length === 0 ? (
        <EmptyState icon="tool" title="لا أجهزة مسجّلة"
          text="أضيفي أجهزة المركز (مثل جهاز الليزر) واربطي كل جهاز بغرفته، ثم اختاري الجهاز في إعداد الخدمة."
          action={<GhostButton icon="plus" onClick={() => setEdit("new")}>جهاز جديد</GhostButton>} />
      ) : (
        <DataTable
          headers={["الجهاز", "الغرفة", "الخدمات", "الجلسات", "الصيانة القادمة", "الحالة", "يعمل", ""]}
          widths={[2, 1, 2, 0.8, 1.3, 1, 0.7, 0.6]}
          rowHeight={64}
          rows={D.map((d) => {
            const linked = (services ?? []).filter((s) => s.device_id === d.id);
            const late = !!d.next_service_at && d.next_service_at <= today;
            return [
              <>
                <span style={{ width: 40, height: 40, borderRadius: 20, flexShrink: 0, background: ICON_FILL, display: "flex", alignItems: "center", justifyContent: "center" }}><Icon name="tool" size={18} /></span>
                <span style={{ fontSize: 14, fontWeight: 700 }}>{d.name}</span>
              </>,
              roomName(d.room_id) ?? <span style={{ color: C.muted }}>—</span>,
              linked.length ? linked.map((s) => s.name).join("، ") : <span style={{ color: C.muted }}>لا خدمات</span>,
              <b key="n" className="latin">{d.sessions_count.toLocaleString("en-US")}</b>,
              d.next_service_at
                ? <span key="m" style={{ color: late ? C.danger : C.ink, fontWeight: late ? 700 : 500 }}>{arDate(new Date(d.next_service_at + "T12:00:00"), { day: false, year: true })}</span>
                : <span style={{ color: C.muted }}>غير محدد</span>,
              <Tag key="t" kind={d.in_maintenance ? "amber" : "green"}>{d.in_maintenance ? "تحت الصيانة" : "يعمل"}</Tag>,
              <Toggle key="g" on={!d.in_maintenance} label={`${d.name} يعمل`} onChange={(v) => setDeviceMaintenance(d.id, !v)} />,
              <button key="e" type="button" onClick={() => setEdit(d)} aria-label={`تعديل ${d.name}`} style={{ width: 36, height: 36, borderRadius: 18, border: "1px solid #EADCF0", background: C.white, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon name="edit" color={C.accent} size={15} />
              </button>,
            ];
          })}
        />
      )}

      <DeviceDialog open={!!edit} device={edit === "new" ? null : edit} rooms={rooms ?? []} onClose={() => setEdit(null)} />
    </AdminShell>
  );
}
