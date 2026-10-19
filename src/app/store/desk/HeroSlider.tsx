"use client";

/**
 * Desktop store hero: the mauve text panel (right, RTL) and the image slider (left) change together.
 * Slides come from admin «واجهة المتجر»; with none, the static logo hero is shown.
 * Autoplay 6s, pauses on hover / focus / hidden tab, off under prefers-reduced-motion.
 */
import Link from "next/link";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Icon, Logo } from "@/components/ui";
import { C } from "@/lib/tokens";
import { useQuery } from "@/lib/db/query";
import { listActiveSlides, slideImage, type Slide } from "@/lib/db/storefront";
import d from "./desk.module.css";

const DELAY = 6000;

function useReducedMotion() {
  const [r, setR] = useState(false);
  useEffect(() => {
    const m = window.matchMedia("(prefers-reduced-motion: reduce)");
    const on = () => setR(m.matches); on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, []);
  return r;
}

function Cta({ href, label, light, onInternal }: { href: string; label: string; light?: boolean; onInternal: (h: string) => boolean }) {
  const cls = light ? d.btnLight : d.btnOutline;
  if (/^https?:\/\//.test(href)) return <a href={href} className={cls} target="_blank" rel="noopener noreferrer">{label}</a>;
  const click = (e: MouseEvent) => { if (onInternal(href)) e.preventDefault(); };
  return <Link href={href} className={cls} onClick={click}>{label}</Link>;
}

export function HeroSlider({ onInternal, hasPicks }: { onInternal: (href: string) => boolean; hasPicks: boolean }) {
  const { data, loading } = useQuery(["slides", "active"], listActiveSlides);
  const slides = (data ?? []).filter((s) => s.image_path);
  if (loading && !data) return <section className={`${d.hero} ${d.heroWait}`} aria-hidden />;
  if (!slides.length) return <StaticHero hasPicks={hasPicks} />;
  return <Slider slides={slides} onInternal={onInternal} />;
}

function Slider({ slides, onInternal }: { slides: Slide[]; onInternal: (href: string) => boolean }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hidden, setHidden] = useState(false);
  const reduce = useReducedMotion();
  const n = slides.length;
  const idx = i % n;
  const timer = useRef<number | null>(null);
  const running = n > 1 && !paused && !hidden && !reduce;

  useEffect(() => {
    const v = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", v);
    return () => document.removeEventListener("visibilitychange", v);
  }, []);
  useEffect(() => {
    if (!running) return;
    timer.current = window.setTimeout(() => setI((x) => (x + 1) % n), DELAY);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, [running, idx, n]);

  const go = (k: number) => setI(((k % n) + n) % n);
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowLeft") { e.preventDefault(); go(idx + 1); } // RTL: left = next
    if (e.key === "ArrowRight") { e.preventDefault(); go(idx - 1); }
  };

  return (
    <section className={d.hero} aria-roledescription="carousel" aria-label="عروض المتجر" onKeyDown={onKey}
      onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)} onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setPaused(false); }}>
      <div className={d.heroText}>
        <div className={d.heroStack} aria-live={running ? "off" : "polite"}>
          {slides.map((s, k) => (
            <div key={s.id} className={`${d.heroSlideText} ${k === idx ? d.heroOn : ""}`} aria-hidden={k !== idx}
              role="group" aria-roledescription="شريحة" aria-label={`${k + 1} من ${n}`} inert={k !== idx}>
              {s.eyebrow && <span className={d.heroKicker}>{s.eyebrow}</span>}
              {k === 0 ? <h1 className={d.heroTitle}>{s.title}</h1> : <h2 className={d.heroTitle}>{s.title}</h2>}
              {s.body && <p className={d.heroLead}>{s.body}</p>}
              {(s.cta_href || s.cta2_href) && (
                <div className={d.heroCtas}>
                  {s.cta_href && s.cta_label && <Cta href={s.cta_href} label={s.cta_label} light onInternal={onInternal} />}
                  {s.cta2_href && s.cta2_label && <Cta href={s.cta2_href} label={s.cta2_label} onInternal={onInternal} />}
                </div>
              )}
            </div>
          ))}
        </div>
        {n > 1 && (
          <div className={d.heroDots} role="tablist" aria-label="اختاري شريحة">
            {slides.map((s, k) => (
              <button key={s.id} type="button" role="tab" aria-selected={k === idx} aria-label={`الشريحة ${k + 1}: ${s.title}`}
                className={`${d.heroDot} ${k === idx ? d.heroDotOn : ""}`} onClick={() => go(k)}>
                <span key={`${idx}-${running}`} className={d.heroDotFill} style={{ animationDuration: `${DELAY}ms`, animationPlayState: running ? "running" : "paused" }} />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={d.heroMedia}>
        {slides.map((s, k) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s.id} src={slideImage(s) ?? ""} alt="" className={`${d.heroImg} ${k === idx ? d.heroImgOn : ""}`}
            loading={k === 0 ? "eager" : "lazy"} decoding="async" />
        ))}
        {n > 1 && (
          <div className={d.heroArrows}>
            <button type="button" className={d.heroArrow} onClick={() => go(idx - 1)} aria-label="الشريحة السابقة"><Icon name="back" size={20} color={C.accent} /></button>
            <span className={`${d.heroCount} latin`} aria-hidden>{idx + 1} / {n}</span>
            <button type="button" className={d.heroArrow} onClick={() => go(idx + 1)} aria-label="الشريحة التالية"><Icon name="fwd" size={20} color={C.accent} /></button>
          </div>
        )}
      </div>
    </section>
  );
}

/** Fallback when no slides exist: the brand hero with the logo. */
function StaticHero({ hasPicks }: { hasPicks: boolean }) {
  return (
    <section className={d.hero} aria-labelledby="hero-h">
      <div className={d.heroText}>
        <div className={d.heroSlideText} style={{ position: "static", opacity: 1, transform: "none" }}>
          <span className={d.heroKicker}>متجر فاطمة بيوتي</span>
          <h1 id="hero-h" className={d.heroTitle}>روتين بشرتكِ،{"\n"}كما تختاره أخصائيتكِ</h1>
          <p className={d.heroLead}>منتجات عناية معتمدة في المركز، تصلكِ إلى البيت أو تستلمينها في زيارتكِ القادمة.</p>
          <div className={d.heroCtas}>
            <a href={hasPicks ? "#picks-h" : "#all-h"} className={d.btnLight}><Icon name="sparkle" color={C.accent} size={18} />{hasPicks ? "تسوّقي التوصيات" : "تسوّقي المنتجات"}</a>
            <Link href="/book/" className={d.btnOutline}><Icon name="cal" color="#FFFFFF" size={18} />احجزي استشارة</Link>
          </div>
        </div>
      </div>
      <div className={`${d.heroMedia} ${d.heroLogo}`}>
        <span className={d.heroLogoCard}><Logo height={96} /></span>
      </div>
    </section>
  );
}
