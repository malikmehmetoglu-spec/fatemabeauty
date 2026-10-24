"use client";

/**
 * «استشارة مكتوبة» — ask أ. فاطمة in writing, no appointment needed (written_consults, migration 0174).
 * No ?id → her written consultations + the form. ?id=… → one consultation with its status and the reply.
 */
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PhoneScreen, TopBar } from "@/components/shell";
import { EmptyState, ErrorNote, Icon, Loading, PrimaryButton, Tag } from "@/components/ui";
import { GuestCard } from "@/components/guest";
import { R } from "@/lib/routes";
import { arDate, clock, money } from "@/lib/format";
import { useQuery } from "@/lib/db/query";
import { useSearch } from "@/lib/db/appointments";
import { supabase } from "@/lib/supabase/client";
import { useRequirePatient } from "@/lib/supabase/session";
import { C, DARK, SH } from "@/lib/tokens";
import { EMPTY_INTAKE, myPhotoConsent, type IntakeFields } from "@/lib/db/intake";
import {
  WC_KIND, WC_STATUS, audioUrl, closeWrittenConsult, getWrittenConsult, myWrittenConsults, signedPhotos, submitWrittenConsult, uploadWcPhoto, wcError,
  type WcRow,
} from "@/lib/db/writtenConsult";
import { ConsentPad } from "../../appointments/intake/ConsentPad";
import css from "../../appointments/intake/intake.module.css";

const BASE = R.P_WrittenConsult;

async function consultPrice(): Promise<number | null> {
  const { data } = await supabase.rpc("service_prices_syp" as never);
  const row = ((data ?? []) as { key: string; price_syp: number }[]).find((r) => r.key === "online-consultation");
  return row?.price_syp ?? null;
}

export default function WrittenConsultPage() {
  const s = useRequirePatient();
  const q = useSearch();
  const id = q?.get("id") ?? "";
  if (s.guest) return <PhoneScreen><TopBar title="استشارة مكتوبة" back={R.Consult} /><GuestCard icon="msg" what="استشارتكِ المكتوبة" /></PhoneScreen>;
  if (s.loading || !s.patient || !q) return <PhoneScreen><Loading /></PhoneScreen>;
  return id ? <Detail id={id} /> : <Home patientId={s.patient.id} name={s.patient.name} />;
}

/* ---------- list + form ---------- */

function Home({ patientId, name }: { patientId: string; name: string }) {
  const list = useQuery(["wc", "mine", patientId], myWrittenConsults);
  const price = useQuery(["wc", "price"], consultPrice);
  const [form, setForm] = useState(false);
  const items = list.data ?? [];
  const showForm = form || (!list.loading && items.length === 0);

  return (
    <PhoneScreen gap={14}>
      <TopBar title="استشارة مكتوبة" back={R.Consult} />
      <div className={css.hero}>
        <div className={css.heroTitle}>اسألي أ. فاطمة كتابةً</div>
        <div className={css.heroText}>بلا موعد ولا انتظار: اكتبي ما يزعجكِ وأرفقي صوراً إن أحببتِ، وتصلكِ إجابتها مكتوبة أو بصوتها خلال 48 ساعة من تأكيد الدفع.</div>
        <div className={css.heroMeta}>
          <span><Icon name="clock" size={14} color="#FFFFFF" />الرد خلال 48 ساعة</span>
          {price.data != null && <span><Icon name="wallet" size={14} color="#FFFFFF" />{money(price.data)}</span>}
        </div>
      </div>

      {list.error && <ErrorNote>تعذّر تحميل استشاراتكِ. أعيدي المحاولة.</ErrorNote>}
      {items.length > 0 && (
        <div style={{ background: C.white, borderRadius: 26, padding: "6px 16px", boxShadow: SH }}>
          <div style={{ fontSize: 13, color: C.sub2, paddingTop: 8 }}>استشاراتي المكتوبة</div>
          {items.map((w, i) => (
            <Link key={w.id} href={`${BASE}?id=${w.id}`} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderTop: i ? `1px solid ${C.line}` : undefined, color: C.ink }}>
              <div style={{ flexGrow: 1, minWidth: 0, lineHeight: 1.4 }}>
                <div style={{ fontSize: 14, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.intake?.concern || "استشارة"}</div>
                <div style={{ fontSize: 12, color: C.sub2 }}>{arDate(new Date(w.created_at))}</div>
              </div>
              <Tag kind={WC_KIND[w.status]}>{WC_STATUS[w.status]}</Tag>
            </Link>
          ))}
        </div>
      )}

      {showForm ? <Form patientId={patientId} name={name} price={price.data ?? null} /> : (
        <PrimaryButton onClick={() => setForm(true)} style={{ marginTop: "auto" }}>استشارة مكتوبة جديدة</PrimaryButton>
      )}
    </PhoneScreen>
  );
}

function Form({ patientId, name, price }: { patientId: string; name: string; price: number | null }) {
  const router = useRouter();
  const [f, setF] = useState<IntakeFields>({ ...EMPTY_INTAKE });
  const [photos, setPhotos] = useState<{ path: string; url: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof IntakeFields>(k: K, v: IntakeFields[K]) => { setErr(null); setF((x) => ({ ...x, [k]: v })); };

  async function submit() {
    if (!f.concern.trim()) { setErr("اكتبي باختصار ما الذي يزعجكِ أو ما تودّين استشارتنا فيه."); return; }
    setBusy(true); setErr(null);
    try { const w = await submitWrittenConsult(f, photos.map((p) => p.path)); router.push(`${BASE}?id=${w.id}&sent=1`); }
    catch (e) { setErr(wcError(e)); setBusy(false); }
  }

  return (
    <>
      <fieldset className={css.card}>
        <Q n={1} label="ما الذي يزعجكِ أو تودّين استشارتنا فيه؟" required>
          <textarea className={css.input} rows={3} aria-label="ما الذي يزعجكِ" value={f.concern} onChange={(e) => set("concern", e.target.value)} placeholder="مثلاً: حبوب متكرّرة على الذقن، بقع داكنة بعد الصيف…" maxLength={1000} />
        </Q>
        <Q n={2} label="منذ متى؟">
          <div className={css.chips}>
            {["أقل من شهر", "1–6 أشهر", "أكثر من 6 أشهر", "منذ سنوات"].map((c) => (
              <button key={c} type="button" className={css.chip} data-on={f.since === c ? "1" : undefined} onClick={() => set("since", f.since === c ? "" : c)}>{c}</button>
            ))}
          </div>
        </Q>
        <Q n={3} label="ماذا جرّبتِ حتى الآن؟">
          <textarea className={css.input} rows={2} aria-label="ماذا جرّبتِ" value={f.tried} onChange={(e) => set("tried", e.target.value)} placeholder="منتجات، جلسات، وصفات… وكيف كانت النتيجة" maxLength={1000} />
        </Q>
        <Q n={4} label="أدوية أو مكمّلات تستخدمينها حالياً">
          <input className={css.input} aria-label="أدوية أو مكمّلات" value={f.medications} onChange={(e) => set("medications", e.target.value)} placeholder="اكتبي «لا شيء» إن لم يوجد" maxLength={500} />
        </Q>
        <Q n={5} label="هل لديكِ حساسية من أي مادة أو دواء؟">
          <input className={css.input} aria-label="الحساسية" value={f.allergies} onChange={(e) => set("allergies", e.target.value)} placeholder="اكتبي «لا» إن لم يوجد" maxLength={500} />
        </Q>
        <Q n={6} label="هل أنتِ حامل أو مرضع حالياً؟">
          <div className={css.chips}>
            {([[true, "نعم"], [false, "لا"]] as const).map(([v, l]) => (
              <button key={l} type="button" className={css.chip} data-on={f.pregnant === v ? "1" : undefined} onClick={() => set("pregnant", f.pregnant === v ? null : v)}>{l}</button>
            ))}
          </div>
        </Q>
        <Q n={7} label="ما النتيجة التي تحلمين بها؟">
          <textarea className={css.input} rows={2} aria-label="النتيجة المرجوّة" value={f.goals} onChange={(e) => set("goals", e.target.value)} placeholder="مثلاً: بشرة أنقى وروتين بسيط أستطيع الالتزام به" maxLength={1000} />
        </Q>
      </fieldset>

      <Photos patientId={patientId} name={name} photos={photos} setPhotos={setPhotos} />

      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "2px 6px" }}>
        <Icon name="wallet" size={18} />
        <div style={{ fontSize: 12.5, color: C.sub, lineHeight: 1.7 }}>
          رسوم الاستشارة {price != null ? <b className="latin">{money(price)}</b> : "حسب لائحة الأسعار"} تُدفع في المركز. بعد تأكيد الدفع تصلكِ الإجابة خلال 48 ساعة.
        </div>
      </div>
      {err && <ErrorNote>{err}</ErrorNote>}
      <div style={{ marginTop: "auto" }}>
        <PrimaryButton onClick={submit} disabled={busy}>{busy ? "جارٍ الإرسال…" : "إرسال الاستشارة"}</PrimaryButton>
      </div>
    </>
  );
}

function Q({ n, label, required, children }: { n: number; label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className={css.q} role="group" aria-label={label}>
      <span className={css.qLabel}><span className={css.qNo}>{n}</span>{label}{required && <span className={css.req}> *</span>}</span>
      {children}
    </div>
  );
}

function Photos({ patientId, name, photos, setPhotos }: { patientId: string; name: string; photos: { path: string; url: string }[]; setPhotos: (p: { path: string; url: string }[]) => void }) {
  const consent = useQuery(["intake", "consent", patientId], () => myPhotoConsent(patientId));
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const signed = consent.data?.signed === true;

  async function pick(files: FileList | null) {
    if (!files?.length) return;
    const room = 4 - photos.length;
    if (room <= 0) { setErr("يمكنكِ إرسال 4 صور كحد أقصى."); return; }
    setBusy(true); setErr(null);
    try {
      const add: { path: string; url: string }[] = [];
      for (const file of Array.from(files).slice(0, room)) add.push({ path: await uploadWcPhoto(patientId, file), url: URL.createObjectURL(file) });
      setPhotos([...photos, ...add]);
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  }

  if (consent.loading) return null;
  return (
    <section className={css.card}>
      <div>
        <div className={css.photoTitle}>صور الوجه <span className={css.optional}>اختياري · حتى 4 صور</span></div>
        <div className={css.photoText}>صور واضحة بإضاءة طبيعية ودون مكياج تساعد أ. فاطمة على فهم بشرتكِ.</div>
      </div>
      {photos.length > 0 && (
        <div className={css.thumbs}>
          {photos.map((p, i) => (
            <figure key={p.path} className={css.thumb} style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt={`صورة ${i + 1}`} />
              <button type="button" onClick={() => setPhotos(photos.filter((x) => x.path !== p.path))} style={{ height: 32, borderRadius: 16, border: "1px solid #EADCF0", background: C.white, color: "#B03D6A", fontSize: 12.5, fontWeight: 600 }}>إزالة</button>
            </figure>
          ))}
        </div>
      )}
      {signed ? (photos.length < 4 && (
        <label className={css.angle} data-busy={busy ? "1" : undefined}>
          <input type="file" accept="image/*" multiple hidden disabled={busy} onChange={(e) => { void pick(e.target.files); e.target.value = ""; }} />
          <Icon name="camera" size={20} color={C.accent} />
          <span>{busy ? "جارٍ الرفع…" : `إضافة صور (${photos.length}/4)`}</span>
        </label>
      )) : show ? (
        <ConsentPad appt={{ patient_id: patientId, id: null, service_key: "online-consultation" }} name={name} onDone={() => setShow(false)} />
      ) : (
        <button type="button" className={css.consentBtn} onClick={() => setShow(true)}>
          <Icon name="sign" size={17} color={C.accent} />{consent.data && !consent.data.signed ? "غيّرتِ رأيكِ؟ وقّعي موافقة التصوير" : "إضافة صور — بعد موافقة التصوير"}
        </button>
      )}
      {err && <ErrorNote>{err}</ErrorNote>}
    </section>
  );
}

/* ---------- one consultation ---------- */

function Detail({ id }: { id: string }) {
  const q = useQuery(["wc", "one", id], () => getWrittenConsult(id));
  const sent = useSearch()?.get("sent") === "1";
  if (q.loading) return <PhoneScreen><TopBar title="استشارة مكتوبة" back={BASE} /><Loading /></PhoneScreen>;
  const w = q.data;
  if (!w) return (
    <PhoneScreen><TopBar title="استشارة مكتوبة" back={BASE} />
      <EmptyState icon="msg" title="لم نجد هذه الاستشارة" text="ربما أُرسل الرابط خطأً." action={<PrimaryButton href={BASE} height={50}>استشاراتي المكتوبة</PrimaryButton>} />
    </PhoneScreen>
  );
  return <DetailView w={w} sent={sent} />;
}

function DetailView({ w, sent }: { w: WcRow; sent: boolean }) {
  const photos = useQuery(["wc", "photos", w.id], () => signedPhotos(w.photos ?? []));
  const audio = useQuery(["wc", "audio", w.id, w.reply_audio_path], () => audioUrl(w.reply_audio_path));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 60000); return () => clearInterval(t); }, []);
  const i = w.intake ?? {};
  const steps: [string, boolean][] = [["أرسلتِ سؤالكِ", true], ["تأكيد الدفع", !!w.paid_at], ["ردّ أ. فاطمة", !!w.answered_at]];

  async function close() {
    setBusy(true); setErr(null);
    try { await closeWrittenConsult(w.id); } catch (e) { setErr(wcError(e)); } finally { setBusy(false); }
  }

  return (
    <PhoneScreen gap={14}>
      <TopBar title="استشارة مكتوبة" back={BASE} />
      {sent && w.status === "awaiting_payment" && (
        <div style={{ ...DARK, borderRadius: 26, padding: "16px 18px", lineHeight: 1.8 }}>
          <div style={{ fontSize: 17, fontWeight: 700 }}>وصلنا سؤالكِ 🌸</div>
          <div style={{ fontSize: 13, color: "#F2E6F4" }}>ادفعي رسوم الاستشارة <b className="latin">{money(w.price)}</b> في المركز، وتصلكِ الإجابة خلال 48 ساعة من تأكيد الدفع.</div>
        </div>
      )}

      <div style={{ background: C.white, borderRadius: 26, padding: "14px 16px", boxShadow: SH, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
          <div style={{ fontSize: 13, color: C.sub2 }}>{arDate(new Date(w.created_at))} · <span className="latin">{clock(w.created_at)}</span></div>
          <Tag kind={WC_KIND[w.status]}>{WC_STATUS[w.status]}</Tag>
        </div>
        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", gap: 6 }}>
          {steps.map(([l, ok]) => (
            <li key={l} style={{ flex: 1, textAlign: "center", fontSize: 11.5, fontWeight: 600, color: ok ? C.accent : C.muted }}>
              <div style={{ height: 6, borderRadius: 3, background: ok ? "linear-gradient(90deg,#C9A2D8,#7B4687)" : "#EFE5F2", marginBottom: 6 }} />{l}
            </li>
          ))}
        </ol>
        {w.status === "awaiting_payment" && <div style={{ fontSize: 12.5, color: "#A3621A" }}>بانتظار الدفع: {money(w.price)} في المركز.</div>}
        {w.status === "paid" && w.due_at && (
          <div style={{ fontSize: 12.5, color: C.sub }}>تصلكِ الإجابة قبل {arDate(new Date(w.due_at))} الساعة <span className="latin">{clock(w.due_at)}</span>{new Date(w.due_at).getTime() < now ? " — نعتذر عن التأخير، الرد في طريقه إليكِ." : "."}</div>
        )}
      </div>

      {(w.reply_text || w.reply_audio_path) && (
        <div style={{ ...DARK, borderRadius: 28, padding: "18px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 13, color: C.onDark }}>ردّ {w.staff?.name ?? "أ. فاطمة"}{w.answered_at ? ` · ${arDate(new Date(w.answered_at))}` : ""}</div>
          {w.reply_text && <div style={{ fontSize: 15, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{w.reply_text}</div>}
          {audio.data && <audio controls src={audio.data} style={{ width: "100%" }} aria-label="رسالة صوتية من أ. فاطمة" />}
        </div>
      )}

      <div className={css.card} style={{ gap: 10 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>سؤالكِ</div>
        {[["ما يزعجكِ", i.concern], ["منذ", i.since], ["ما جرّبتِه", i.tried], ["أدوية", i.medications], ["حساسية", i.allergies], ["حمل أو إرضاع", i.pregnant == null ? "" : i.pregnant ? "نعم" : "لا"], ["النتيجة المرجوّة", i.goals]]
          .filter(([, v]) => v).map(([k, v]) => (
            <div key={k as string} style={{ fontSize: 13.5, lineHeight: 1.7 }}><span style={{ color: C.sub2 }}>{k}: </span>{v as string}</div>
          ))}
        {(photos.data ?? []).length > 0 && (
          <div className={css.thumbs}>
            {(photos.data ?? []).map((p, k) => (
              <figure key={p.path} className={css.thumb}>{p.url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.url} alt={`صورة ${k + 1}`} /> : <span />}</figure>
            ))}
          </div>
        )}
      </div>

      {err && <ErrorNote>{err}</ErrorNote>}
      {w.status === "answered" && (
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
          <PrimaryButton href={R.P_ConsultBook}>احجزي استشارة أو جلسة</PrimaryButton>
          <button type="button" onClick={close} disabled={busy} style={{ height: 48, borderRadius: 24, border: "1px solid #EADCF0", background: C.white, color: C.sub, fontWeight: 600, fontSize: 14 }}>{busy ? "…" : "شكراً، أغلقي الاستشارة"}</button>
        </div>
      )}
    </PhoneScreen>
  );
}
