"use client";

/** Specialist photo (staff.photo_url) or her initials; a neutral icon when no specialist is assigned. */
import { Avatar, Circ } from "@/components/ui";
import { initials } from "@/lib/data";

export function SpecialistAvatar({ sp, size = 42 }: { sp: { name: string; photo_url: string | null } | null | undefined; size?: number }) {
  if (!sp) return <Circ icon="users" size={size} iconSize={Math.round(size * 0.45)} />;
  if (sp.photo_url) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={sp.photo_url} alt={sp.name} style={{ width: size, height: size, borderRadius: size / 2, objectFit: "cover", flexShrink: 0, border: "2px solid #FFFFFF" }} />;
  }
  return <Avatar initials={initials(sp.name)} size={size} />;
}

/** Downloads an .ics file for an appointment. */
export function downloadIcs(a: { id: string; starts_at: string; minutes: number; title: string; location?: string | null }) {
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const s = new Date(a.starts_at);
  const e = new Date(s.getTime() + a.minutes * 60000);
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Fatema Beauty//AR", "BEGIN:VEVENT", `UID:${a.id}@fatemabeauty`,
    `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(s)}`, `DTEND:${stamp(e)}`, `SUMMARY:${a.title} — Fatema Beauty`,
    ...(a.location ? [`LOCATION:${a.location}`] : []), "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  link.download = "fatema-beauty.ics";
  link.click();
  URL.revokeObjectURL(link.href);
}
