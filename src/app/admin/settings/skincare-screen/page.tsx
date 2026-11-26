"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminShell } from "@/components/shell";
import { ErrorNote, Loading } from "@/components/ui";
import { supabase } from "@/lib/supabase/client";
import { useSession } from "@/lib/supabase/session";
import { C, SHB } from "@/lib/tokens";
import { initials } from "@/lib/data";

type StaffRow = {
  id: string;
  name: string;
  role: string;
  photo_url?: string | null;
  show_on_skincare: boolean;
};

export default function SkincareScreenSettings() {
  const { staff } = useSession();
  const isAdmin = staff?.role === "owner" || staff?.role === "admin";

  const [rows, setRows] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("staff")
      .select("id, name, role, photo_url, show_on_skincare")
      .eq("active", true)
      .in("role", ["specialist", "owner", "admin"])
      .order("name");
    if (error) setErr(error.message);
    else {
      setRows((data as unknown as StaffRow[]) ?? []);
      setErr("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  async function toggle(row: StaffRow) {
    setBusyId(row.id);
    setErr("");
    const next = !row.show_on_skincare;
    const { error } = await supabase
      .from("staff")
      // @ts-expect-error show_on_skincare column added via SQL migration
      .update({ show_on_skincare: next })
      .eq("id", row.id);
    if (error) setErr(error.message);
    else {
      setRows((prev) =>
        prev.map((r) => (r.id === row.id ? { ...r, show_on_skincare: next } : r))
      );
    }
    setBusyId(null);
  }

  return (
    <AdminShell
      active="الإعدادات"
      title="شاشة غرفة العناية بالبشرة"
      subtitle="التحكم في الأخصائيات الظاهرات على شاشة touch.fatema.beauty"
    >
      {!isAdmin ? (
        <ErrorNote>هذه اللوحة متاحة للمدراء فقط.</ErrorNote>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 760 }}>
          {err && <ErrorNote>{err}</ErrorNote>}
          {loading ? (
            <Loading />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                padding: 18,
                borderRadius: 24,
                background: C.white,
                boxShadow: SHB,
              }}
            >
              {rows.map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    padding: "10px 12px",
                    borderRadius: 16,
                    background: "#FAF6FC",
                  }}
                >
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={r.photo_url}
                      alt={r.name}
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 22,
                        background: "#EEDBF2",
                        color: C.accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {initials(r.name)}
                    </span>
                  )}
                  <div style={{ flex: 1, fontWeight: 700, fontSize: 15, color: C.ink }}>
                    {r.name}
                  </div>
                  <button
                    type="button"
                    disabled={busyId === r.id}
                    onClick={() => toggle(r)}
                    style={{
                      height: 38,
                      padding: "0 16px",
                      borderRadius: 19,
                      border: "none",
                      cursor: "pointer",
                      fontWeight: 700,
                      fontSize: 13.5,
                      background: r.show_on_skincare ? C.accent : "#ECE6EE",
                      color: r.show_on_skincare ? C.white : C.sub2,
                      opacity: busyId === r.id ? 0.6 : 1,
                    }}
                  >
                    {r.show_on_skincare ? "ظاهرة على الشاشة" : "مخفية"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminShell>
  );
}