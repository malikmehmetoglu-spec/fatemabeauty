"use client";

/** «تغيير كلمة المرور» for the signed-in staff member (opened from the AdminShell account card). */
import { useEffect, useState } from "react";
import { ErrorNote, Modal, SubmitButton, TextInput } from "@/components/ui";
import { changeMyPassword } from "@/lib/db/staff";
import { C } from "@/lib/tokens";

export function ChangePasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [pw, setPw] = useState(""); const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const [done, setDone] = useState(false);
  useEffect(() => { if (open) { setPw(""); setPw2(""); setError(""); setDone(false); } }, [open]);
  async function submit() {
    setError("");
    if (pw.length < 8) { setError("كلمة المرور 8 أحرف على الأقل."); return; }
    if (pw !== pw2) { setError("كلمتا المرور غير متطابقتين."); return; }
    setBusy(true);
    try { await changeMyPassword(pw); setDone(true); }
    catch (e) { setError("تعذّر التغيير: " + (e instanceof Error ? e.message : String(e))); } finally { setBusy(false); }
  }
  return (
    <Modal open={open} onClose={onClose} title="تغيير كلمة المرور" width={460}
      footer={done ? <SubmitButton onClick={onClose}>تم</SubmitButton> : <SubmitButton onClick={submit} busy={busy}>حفظ كلمة المرور</SubmitButton>}>
      {done ? <div style={{ fontSize: 14, fontWeight: 600, color: C.okDeep }}>تم تغيير كلمة المرور. استخدميها في الدخول القادم.</div> : (
        <>
          <TextInput label="كلمة المرور الجديدة" type="password" dir="ltr" required value={pw} onChange={setPw} hint="8 أحرف على الأقل" />
          <TextInput label="تأكيد كلمة المرور" type="password" dir="ltr" required value={pw2} onChange={setPw2} />
          {error && <ErrorNote>{error}</ErrorNote>}
        </>
      )}
    </Modal>
  );
}
